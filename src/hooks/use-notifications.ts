import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { playNotificationSound } from '@/utils/notification-sound'
import type { Notification } from '@/types'
import { useEffect, useRef } from 'react'

export function useNotifications() {
  const { employee } = useAuthStore()
  const qc = useQueryClient()
  const previousLatestIdRef = useRef<string | null>(null)
  const isInitialLoadRef = useRef(true)

  // Realtime subscription with sound chime
  useEffect(() => {
    if (!employee) return

    const channelName = `notifications_${employee.id}_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `employee_id=eq.${employee.id}` },
        () => {
          // Play ring bell audio chime automatically on realtime push
          playNotificationSound()
          qc.invalidateQueries({ queryKey: ['notifications', employee.id] })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `employee_id=eq.${employee.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', employee.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [employee, qc])

  const query = useQuery({
    queryKey: ['notifications', employee?.id],
    queryFn: async () => {
      if (!employee) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!employee,
    refetchInterval: 10000, // Poll every 10s as background fallback
  })

  // Detect new unread notification arriving from query refetch
  useEffect(() => {
    if (!query.data || query.data.length === 0) return

    const latest = query.data[0]
    if (isInitialLoadRef.current) {
      previousLatestIdRef.current = latest.id
      isInitialLoadRef.current = false
      return
    }

    if (previousLatestIdRef.current && latest.id !== previousLatestIdRef.current && !latest.is_read) {
      // New notification arrived! Play chime automatically
      playNotificationSound()
    }
    previousLatestIdRef.current = latest.id
  }, [query.data])

  return query
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', employee?.id] }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!employee) return
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('employee_id', employee.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', employee?.id] }),
  })
}

export function useSendNotification() {
  const qc = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: {
      employee_ids: string[]
      title: string
      message?: string
      type: 'info' | 'success' | 'warning' | 'error'
      category: 'attendance' | 'leave' | 'schedule' | 'system' | 'announcement'
      action_url?: string
      attachment_url?: string
      attachment_name?: string
    }) => {
      const records = payload.employee_ids.map(empId => ({
        employee_id: empId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        category: payload.category,
        action_url: payload.action_url,
        attachment_url: payload.attachment_url || null,
        attachment_name: payload.attachment_name || null,
        is_read: false,
      }))

      const { data, error } = await supabase
        .from('notifications')
        .insert(records)
        .select()

      if (error) {
        // Resilient fallback if attachment_url or attachment_name column not yet loaded in schema cache
        if (
          error.message?.includes('attachment_url') ||
          error.details?.includes('attachment_url') ||
          error.message?.includes('attachment_name') ||
          error.details?.includes('attachment_name') ||
          (error as any).code === 'PGRST204'
        ) {
          const fallbackRecords = payload.employee_ids.map(empId => ({
            employee_id: empId,
            title: payload.title,
            message: payload.attachment_url 
              ? `${payload.message || ''}\n\n📎 Attached File: ${payload.attachment_name || 'Attachment'} (${payload.attachment_url})`.trim()
              : payload.message,
            type: payload.type,
            category: payload.category,
            action_url: payload.action_url || payload.attachment_url || null,
            is_read: false,
          }))
          const { data: retryData, error: retryError } = await supabase
            .from('notifications')
            .insert(fallbackRecords)
            .select()
          if (retryError) throw retryError
          return retryData
        }
        throw error
      }
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['all_notifications'] })
    },
  })
}

export function useAllNotifications() {
  const { employee } = useAuthStore()
  return useQuery({
    queryKey: ['all_notifications'],
    queryFn: async () => {
      if (!employee) return []
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          employees:employee_id (
            id, first_name, last_name, email, avatar_url,
            departments:department_id (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(150)

      if (error) {
        // Fallback without relation if foreign key query issues
        const { data: rawData, error: rawErr } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(150)
        if (rawErr) throw rawErr
        return rawData as (Notification & { employees?: any })[]
      }
      return data as (Notification & { employees?: any })[]
    },
    enabled: !!employee,
    refetchInterval: 10000,
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', employee?.id] })
      qc.invalidateQueries({ queryKey: ['all_notifications'] })
    },
  })
}

export function useClearReadNotifications() {
  const qc = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!employee) return
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('employee_id', employee.id)
        .eq('is_read', true)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', employee?.id] })
      qc.invalidateQueries({ queryKey: ['all_notifications'] })
    },
  })
}
