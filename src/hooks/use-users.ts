import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type SystemUser = {
  id: string
  email: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
  banned_until?: string
}

export function useSystemUsers() {
  return useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      // Try Database RPC function first (avoids edge function CORS & deployment dependency)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_system_users')

      if (!rpcError && rpcData?.users) {
        return rpcData.users as SystemUser[]
      }

      // Fallback to edge function invocation if RPC is not yet created
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' }
      })

      if (error) {
        throw new Error(rpcError?.message || error.message || 'Failed to fetch system users')
      }
      if (data?.error) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
      }
      return (data?.users || []) as SystemUser[]
    },
  })
}

export function useManageSystemUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ action, userId, newPassword }: { action: 'update_password' | 'suspend' | 'unsuspend' | 'delete', userId: string, newPassword?: string }) => {
      // Try Database RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('manage_system_user', {
        p_action: action,
        p_user_id: userId,
        p_new_password: newPassword || null,
      })

      if (!rpcError && rpcData?.success) {
        return rpcData
      }

      // Fallback to edge function invocation
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action, userId, newPassword }
      })
      if (error) throw new Error(rpcError?.message || error.message)
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-users'] })
      // If we deleted a user, their employee record is gone too, so invalidate employees
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
