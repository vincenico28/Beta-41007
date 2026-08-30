-- Migration: Fix Supabase Security Linter Warnings for RPC Functions
-- 1. Revokes execute permissions from anon and PUBLIC on all SECURITY DEFINER functions.
-- 2. Restricts execute permissions strictly to authenticated users with role validation.

-- 1. Revoke anon/PUBLIC access for create_employee_account
REVOKE EXECUTE ON FUNCTION public.create_employee_account(
  text, text, text, text, text, text, text, uuid, text, text, date, text, text, jsonb, jsonb
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.create_employee_account(
  text, text, text, text, text, text, text, uuid, text, text, date, text, text, jsonb, jsonb
) FROM anon;

GRANT EXECUTE ON FUNCTION public.create_employee_account(
  text, text, text, text, text, text, text, uuid, text, text, date, text, text, jsonb, jsonb
) TO authenticated;

-- 2. Revoke anon/PUBLIC access for get_system_users
REVOKE EXECUTE ON FUNCTION public.get_system_users() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_system_users() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_system_users() TO authenticated;

-- 3. Revoke anon/PUBLIC access for manage_system_user
REVOKE EXECUTE ON FUNCTION public.manage_system_user(text, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.manage_system_user(text, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.manage_system_user(text, uuid, text) TO authenticated;
