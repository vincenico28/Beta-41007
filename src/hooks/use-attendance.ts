import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AttendanceRecord } from '@/types'
import { format } from 'date-fns'
import { calculateScheduleCompliance } from '@/utils/schedule-compliance'

import { useAuthStore } from '@/stores/auth.store'

export function useAttendance(date?: Date) {
  const { employee } = useAuthStore()
  const dateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['attendance', dateStr],
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*, employees:employees!attendance_records_employee_id_fkey(id, first_name, last_name, avatar_url, position, departments(name))')
        .eq('date', dateStr)
        .order('clock_in', { ascending: false })

      if (employee?.role === 'employee') {
        query = query.eq('employee_id', employee.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as AttendanceRecord[]
    },
  })
}

export function useAttendanceRange(startDate: string, endDate: string) {
  const { employee } = useAuthStore()
  return useQuery({
    queryKey: ['attendance', 'range', startDate, endDate, employee?.id],
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*, employees:employees!attendance_records_employee_id_fkey(id, first_name, last_name, avatar_url, departments(name))')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (employee?.role === 'employee') {
        query = query.eq('employee_id', employee.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data as AttendanceRecord[]
    },
  })
}

export function useEmployeeAttendance(employeeId: string, limit = 30) {
  return useQuery({
    queryKey: ['attendance', 'employee', employeeId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as AttendanceRecord[]
    },
    enabled: !!employeeId,
  })
}

export function useClockIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ employeeId, location }: { employeeId: string; location?: { lat: number; lng: number } }) => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const now = new Date().toISOString()
      
      const { data: schedule } = await supabase
        .from('schedules')
        .select('*, shifts(*)')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle()

      const scheduledStart = schedule?.shifts?.start_time || '09:00'
      const scheduledEnd = schedule?.shifts?.end_time || '17:00'
      const isOvernight = !!schedule?.shifts?.is_overnight
      const gracePeriod = schedule?.shifts?.grace_period_mins || 0

      const compliance = calculateScheduleCompliance({
        scheduledStart,
        scheduledEnd,
        clockIn: now,
        isOvernight,
        gracePeriodMins: gracePeriod,
      })

      const status = compliance.isLate ? 'late' : 'present'
      const lateNote = compliance.isLate ? `Late clock-in by ${compliance.tardinessMinutes} mins` : undefined

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          employee_id: employeeId,
          date: today,
          clock_in: now,
          status,
          notes: lateNote,
          ...(location ? { location: { clockIn: location } } : {})
        }, { onConflict: 'employee_id,date' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  })
}

export function useClockOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ employeeId, attendanceId, location, notes }: { employeeId: string; attendanceId: string; location?: { lat: number; lng: number }, notes?: string }) => {
      const now = new Date()
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('clock_in, date, location, notes')
        .eq('id', attendanceId)
        .single()

      let totalHours = 0
      if (existing?.clock_in) {
        const diff = now.getTime() - new Date(existing.clock_in).getTime()
        totalHours = parseFloat((diff / 3600000 - 1).toFixed(2)) // Subtract 1 hour for break
      }

      // Check schedule compliance for undertime (early clock-out)
      const workDate = existing?.date || format(now, 'yyyy-MM-dd')
      const { data: schedule } = await supabase
        .from('schedules')
        .select('*, shifts(*)')
        .eq('employee_id', employeeId)
        .eq('date', workDate)
        .maybeSingle()

      const scheduledStart = schedule?.shifts?.start_time || '09:00'
      const scheduledEnd = schedule?.shifts?.end_time || '17:00'
      const isOvernight = !!schedule?.shifts?.is_overnight

      const compliance = calculateScheduleCompliance({
        scheduledStart,
        scheduledEnd,
        clockIn: existing?.clock_in,
        clockOut: now.toISOString(),
        isOvernight,
      })

      const complianceNotes: string[] = []
      if (compliance.isLate) complianceNotes.push(`Late clock-in (-${compliance.tardinessMinutes}m)`)
      if (compliance.isUndertime) complianceNotes.push(`Early clock-out (-${compliance.undertimeMinutes}m)`)

      const newNotes = [existing?.notes, ...complianceNotes, notes]
        .filter(Boolean)
        .filter((item, pos, self) => self.indexOf(item) === pos)
        .join(' | ')

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          clock_out: now.toISOString(),
          total_hours: totalHours,
          overtime_hours: Math.max(0, totalHours - 8),
          updated_at: now.toISOString(),
          notes: newNotes || null,
          ...(location ? { location: { ...(existing?.location as any || {}), clockOut: location } } : {})
        })
        .eq('id', attendanceId)
        .select()
        .single()
      if (error) throw error

      if (existing?.clock_in && existing?.date) {
        const { error: tsError } = await supabase
          .from('timesheet_entries')
          .insert({
            employee_id: employeeId,
            date: existing.date,
            start_time: format(new Date(existing.clock_in), 'HH:mm:ss'),
            end_time: format(now, 'HH:mm:ss'),
            break_minutes: 60,
            notes: newNotes || null,
            source: 'clock_in',
            attendance_id: attendanceId,
            is_approved: false
          })
        if (tsError) console.error('Failed to auto-generate timesheet', tsError)
      }

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['timesheets'] })
    },
  })
}

export function useTodayAttendance(employeeId: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['attendance', 'today', employeeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle()
      return data as AttendanceRecord | null
    },
    enabled: !!employeeId,
  })
}

export function useManualAttendanceRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (record: {
      id?: string
      employee_id: string
      date: string
      clock_in?: string | null
      clock_out?: string | null
      total_hours?: number | null
      overtime_hours?: number | null
      status: string
      notes?: string | null
    }) => {
      if (record.id) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update({
            date: record.date,
            clock_in: record.clock_in || null,
            clock_out: record.clock_out || null,
            total_hours: record.total_hours || 0,
            overtime_hours: record.overtime_hours || 0,
            status: record.status,
            notes: record.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('attendance_records')
          .upsert({
            employee_id: record.employee_id,
            date: record.date,
            clock_in: record.clock_in || null,
            clock_out: record.clock_out || null,
            total_hours: record.total_hours || 0,
            overtime_hours: record.overtime_hours || 0,
            status: record.status,
            notes: record.notes || null,
          }, { onConflict: 'employee_id,date' })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['timesheets'] })
    },
  })
}

export function useDeleteAttendanceRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete any auto-generated timesheet entries referencing this attendance record to avoid FK constraint conflict
      await supabase
        .from('timesheet_entries')
        .delete()
        .eq('attendance_id', id)

      // 2. Delete the attendance record
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['timesheet-entries'] })
      qc.invalidateQueries({ queryKey: ['timesheets'] })
    },
  })
}
