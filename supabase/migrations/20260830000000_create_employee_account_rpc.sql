-- Migration: Create Database RPC Function for Employee Creation
-- Allows authenticated admins/HR managers to create employee accounts with auth credentials
-- directly without requiring external Edge Function deployment.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_employee_account(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text DEFAULT '',
  p_phone text DEFAULT NULL,
  p_gender text DEFAULT 'unspecified',
  p_position text DEFAULT NULL,
  p_department_id uuid DEFAULT NULL,
  p_role text DEFAULT 'employee',
  p_employment_type text DEFAULT 'full_time',
  p_hire_date date DEFAULT CURRENT_DATE,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_salary_info jsonb DEFAULT '{}'::jsonb,
  p_emergency_contact jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
  v_user_id uuid := gen_random_uuid();
  v_employee_id uuid := gen_random_uuid();
  v_org_id uuid := '00000000-0000-0000-0000-000000000001';
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
  v_password_hash text;
  v_employee_record jsonb;
  v_emp_code text;
BEGIN
  -- 1. Authorization check: caller must be authenticated and have admin/super_admin/hr_manager role
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_caller_role FROM public.employees WHERE user_id = auth.uid() LIMIT 1;
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('super_admin', 'admin', 'hr_manager') THEN
    RAISE EXCEPTION 'Insufficient permissions. Only administrators and HR managers can create employees.';
  END IF;

  -- 2. Validate input
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF p_password IS NULL OR LENGTH(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  IF p_first_name IS NULL OR TRIM(p_first_name) = '' THEN
    RAISE EXCEPTION 'First name is required';
  END IF;

  -- 3. Check for existing email in auth.users or employees
  IF EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(TRIM(p_email))) THEN
    RAISE EXCEPTION 'A user with email "%" already exists in authentication system', p_email;
  END IF;
  IF EXISTS (SELECT 1 FROM public.employees WHERE LOWER(email) = LOWER(TRIM(p_email))) THEN
    RAISE EXCEPTION 'An employee with email "%" already exists', p_email;
  END IF;

  -- 4. Get org_id
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org_id) THEN
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
    IF v_org_id IS NULL THEN
      v_org_id := '00000000-0000-0000-0000-000000000001';
      INSERT INTO public.organizations (id, name, slug)
      VALUES (v_org_id, 'Nexus Tech', 'nexus-tech')
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  -- 5. Detect instance_id
  BEGIN
    SELECT instance_id INTO v_instance_id FROM auth.users WHERE instance_id IS NOT NULL LIMIT 1;
    IF v_instance_id IS NULL THEN
      v_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END;

  -- 6. Hash password with bcrypt
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  -- 7. Insert into auth.users with complete GoTrue-compatible fields
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous,
    aud,
    role
  )
  VALUES (
    v_user_id,
    v_instance_id,
    LOWER(TRIM(p_email)),
    v_password_hash,
    now(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('first_name', p_first_name, 'last_name', COALESCE(p_last_name, '')),
    false,
    now(),
    now(),
    p_phone,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    false,
    'authenticated',
    'authenticated'
  );

  -- 8. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', LOWER(TRIM(p_email)), 'email_verified', true),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- 9. Generate employee code
  v_emp_code := 'EMP-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- 10. Insert into public.employees
  INSERT INTO public.employees (
    id,
    user_id,
    org_id,
    department_id,
    employee_id,
    first_name,
    last_name,
    email,
    phone,
    gender,
    role,
    position,
    employment_type,
    hire_date,
    address,
    city,
    salary_info,
    emergency_contact,
    status
  )
  VALUES (
    v_employee_id,
    v_user_id,
    v_org_id,
    p_department_id,
    v_emp_code,
    p_first_name,
    COALESCE(p_last_name, ''),
    LOWER(TRIM(p_email)),
    p_phone,
    COALESCE(p_gender, 'unspecified'),
    COALESCE(p_role, 'employee'),
    p_position,
    COALESCE(p_employment_type, 'full_time'),
    COALESCE(p_hire_date, CURRENT_DATE),
    p_address,
    p_city,
    COALESCE(p_salary_info, '{}'::jsonb),
    COALESCE(p_emergency_contact, '{}'::jsonb),
    'active'
  );

  -- 11. Populate leave balances
  INSERT INTO public.leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days)
  SELECT 
    v_employee_id,
    lt.id,
    v_year,
    lt.days_allowed,
    0,
    0,
    0
  FROM public.leave_types lt
  WHERE lt.org_id = v_org_id
  ON CONFLICT DO NOTHING;

  -- 12. Return the created employee details
  SELECT to_jsonb(e) INTO v_employee_record FROM public.employees e WHERE e.id = v_employee_id;
  RETURN jsonb_build_object('success', true, 'employee', v_employee_record);
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_employee_account TO authenticated;
