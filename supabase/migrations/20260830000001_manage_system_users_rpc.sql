-- Migration: System User Management via Database RPC
-- Enables Super Admins & Admins to list, update passwords, suspend, unsuspend, and delete users
-- directly through Postgres RPC without requiring Edge Function deployment.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Function to list system auth users
CREATE OR REPLACE FUNCTION public.get_system_users()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
  v_users jsonb;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is super_admin or admin
  SELECT role INTO v_caller_role FROM public.employees WHERE user_id = auth.uid() LIMIT 1;
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions. Only Super Admins and Admins can view system users.';
  END IF;

  -- Query auth.users
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'last_sign_in_at', u.last_sign_in_at,
      'email_confirmed_at', u.email_confirmed_at,
      'banned_until', u.banned_until
    ) ORDER BY u.created_at DESC
  ), '[]'::jsonb)
  INTO v_users
  FROM auth.users u;

  RETURN jsonb_build_object('success', true, 'users', v_users);
END;
$$;

-- 2. Function to manage system auth users (update password, suspend, unsuspend, delete)
CREATE OR REPLACE FUNCTION public.manage_system_user(
  p_action text,
  p_user_id uuid,
  p_new_password text DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
  v_target_email text;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is super_admin or admin
  SELECT role INTO v_caller_role FROM public.employees WHERE user_id = auth.uid() LIMIT 1;
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Insufficient permissions. Only Super Admins and Admins can manage users.';
  END IF;

  -- Verify target user exists
  SELECT email INTO v_target_email FROM auth.users WHERE id = p_user_id;
  IF v_target_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  -- Execute action
  CASE p_action
    WHEN 'update_password' THEN
      IF p_new_password IS NULL OR LENGTH(p_new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
      END IF;

      UPDATE auth.users
      SET 
        encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
        updated_at = now()
      WHERE id = p_user_id;

    WHEN 'suspend' THEN
      IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'You cannot suspend your own account';
      END IF;

      UPDATE auth.users
      SET 
        banned_until = now() + interval '1000 years',
        updated_at = now()
      WHERE id = p_user_id;

    WHEN 'unsuspend' THEN
      UPDATE auth.users
      SET 
        banned_until = NULL,
        updated_at = now()
      WHERE id = p_user_id;

    WHEN 'delete' THEN
      IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'You cannot delete your own account';
      END IF;

      -- Remove associated employee references and records
      DELETE FROM public.leave_balances WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = p_user_id);
      DELETE FROM public.employees WHERE user_id = p_user_id;
      DELETE FROM auth.identities WHERE user_id = p_user_id;
      DELETE FROM auth.users WHERE id = p_user_id;

    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;

  RETURN jsonb_build_object('success', true, 'action', p_action, 'user_id', p_user_id);
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_system_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_system_user TO authenticated;
