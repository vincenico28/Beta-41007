-- ====================================================================
-- MASTER DEMO DATA SEED SCRIPT (ROBUST & CONFLICT-FREE)
-- Workforce Management System (WMS)
-- Populates: Organizations, Departments, Shifts, Leave Types, Employees,
--            Leave Balances, Leave Requests, Attendance Records (90 days),
--            Schedules, Timesheets, Performance Reviews, Announcements,
--            Notifications, and Audit Logs.
-- ====================================================================

DO $$
DECLARE
  v_org_id uuid := '00000000-0000-0000-0000-000000000001';
  v_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Department IDs
  v_dept_eng uuid;
  v_dept_hr  uuid;
  v_dept_sls uuid;
  v_dept_mkt uuid;
  v_dept_ops uuid;
  v_dept_fin uuid;

  -- Shift IDs
  v_shift_morning uuid;
  v_shift_mid     uuid;
  v_shift_night   uuid;
  v_shift_flex    uuid;

  -- Leave Type IDs
  v_lt_annual   uuid;
  v_lt_sick     uuid;
  v_lt_mat      uuid;
  v_lt_pat      uuid;
  v_lt_unpaid   uuid;
  v_lt_bereave  uuid;
  v_lt_emerg    uuid;

  -- Reviewer ID
  v_reviewer_id uuid;

  -- Loop variables
  emp_rec RECORD;
  cur_date DATE;
  v_rnd FLOAT;
  v_clock_in TIMESTAMPTZ;
  v_clock_out TIMESTAMPTZ;
  v_total_hours NUMERIC;
  v_overtime NUMERIC;
  v_shift_id UUID;
BEGIN

  -- 1. Ensure Organization Exists
  INSERT INTO public.organizations (id, name, slug, timezone, subscription_plan, address, phone, email)
  VALUES (
    v_org_id, 'Nexus Tech Solutions', 'nexus-tech', 'Asia/Manila', 'enterprise',
    '8767 Paseo de Roxas, Makati City, Metro Manila', '+63 2 8888 1234', 'contact@nexustech.com'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    timezone = EXCLUDED.timezone,
    subscription_plan = EXCLUDED.subscription_plan;

  -- 2. Upsert Departments & Capture IDs
  -- Engineering
  SELECT id INTO v_dept_eng FROM public.departments WHERE org_id = v_org_id AND code = 'ENG' LIMIT 1;
  IF v_dept_eng IS NULL THEN
    v_dept_eng := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_eng, v_org_id, 'Engineering', 'ENG', '#6366F1', 'Software Development, QA, and Cloud Infrastructure');
  END IF;

  -- Human Resources
  SELECT id INTO v_dept_hr FROM public.departments WHERE org_id = v_org_id AND code = 'HR' LIMIT 1;
  IF v_dept_hr IS NULL THEN
    v_dept_hr := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_hr, v_org_id, 'Human Resources', 'HR', '#EC4899', 'People Operations, Talent Acquisition, and Culture');
  END IF;

  -- Sales
  SELECT id INTO v_dept_sls FROM public.departments WHERE org_id = v_org_id AND code = 'SLS' LIMIT 1;
  IF v_dept_sls IS NULL THEN
    v_dept_sls := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_sls, v_org_id, 'Sales & Accounts', 'SLS', '#F59E0B', 'Enterprise Sales, Partnerships, and Client Relations');
  END IF;

  -- Marketing
  SELECT id INTO v_dept_mkt FROM public.departments WHERE org_id = v_org_id AND code = 'MKT' LIMIT 1;
  IF v_dept_mkt IS NULL THEN
    v_dept_mkt := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_mkt, v_org_id, 'Marketing & Brand', 'MKT', '#8B5CF6', 'Digital Marketing, Content, and Growth Strategy');
  END IF;

  -- Operations
  SELECT id INTO v_dept_ops FROM public.departments WHERE org_id = v_org_id AND code = 'OPS' LIMIT 1;
  IF v_dept_ops IS NULL THEN
    v_dept_ops := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_ops, v_org_id, 'Operations & IT', 'OPS', '#10B981', 'Facilities, IT Security, and Support');
  END IF;

  -- Finance
  SELECT id INTO v_dept_fin FROM public.departments WHERE org_id = v_org_id AND code = 'FIN' LIMIT 1;
  IF v_dept_fin IS NULL THEN
    v_dept_fin := gen_random_uuid();
    INSERT INTO public.departments (id, org_id, name, code, color, description)
    VALUES (v_dept_fin, v_org_id, 'Finance & Accounting', 'FIN', '#06B6D4', 'Payroll, Accounting, and Financial Planning');
  END IF;

  -- 3. Upsert Shifts & Capture IDs
  -- Regular Morning
  SELECT id INTO v_shift_morning FROM public.shifts WHERE org_id = v_org_id AND name LIKE 'Regular Morning%' LIMIT 1;
  IF v_shift_morning IS NULL THEN
    v_shift_morning := gen_random_uuid();
    INSERT INTO public.shifts (id, org_id, name, start_time, end_time, break_duration, color, is_overnight, is_active)
    VALUES (v_shift_morning, v_org_id, 'Regular Morning (8AM - 5PM)', '08:00:00', '17:00:00', 60, '#3B82F6', false, true);
  END IF;

  -- Mid Shift
  SELECT id INTO v_shift_mid FROM public.shifts WHERE org_id = v_org_id AND name LIKE 'Mid Shift%' LIMIT 1;
  IF v_shift_mid IS NULL THEN
    v_shift_mid := gen_random_uuid();
    INSERT INTO public.shifts (id, org_id, name, start_time, end_time, break_duration, color, is_overnight, is_active)
    VALUES (v_shift_mid, v_org_id, 'Mid Shift (1PM - 10PM)', '13:00:00', '22:00:00', 60, '#F59E0B', false, true);
  END IF;

  -- Night Shift
  SELECT id INTO v_shift_night FROM public.shifts WHERE org_id = v_org_id AND name LIKE 'Night Shift%' LIMIT 1;
  IF v_shift_night IS NULL THEN
    v_shift_night := gen_random_uuid();
    INSERT INTO public.shifts (id, org_id, name, start_time, end_time, break_duration, color, is_overnight, is_active)
    VALUES (v_shift_night, v_org_id, 'Night Shift (10PM - 7AM)', '22:00:00', '07:00:00', 60, '#8B5CF6', true, true);
  END IF;

  -- Flexible Day
  SELECT id INTO v_shift_flex FROM public.shifts WHERE org_id = v_org_id AND name LIKE 'Flexible%' LIMIT 1;
  IF v_shift_flex IS NULL THEN
    v_shift_flex := gen_random_uuid();
    INSERT INTO public.shifts (id, org_id, name, start_time, end_time, break_duration, color, is_overnight, is_active)
    VALUES (v_shift_flex, v_org_id, 'Flexible Day (9AM - 6PM)', '09:00:00', '18:00:00', 60, '#10B981', false, true);
  END IF;

  -- 4. Upsert Leave Types via (org_id, code) constraint
  INSERT INTO public.leave_types (org_id, name, code, days_allowed, is_paid, color)
  VALUES
    (v_org_id, 'Annual Leave', 'AL', 15, true, '#3B82F6'),
    (v_org_id, 'Sick Leave', 'SL', 12, true, '#EF4444'),
    (v_org_id, 'Maternity Leave', 'ML', 105, true, '#EC4899'),
    (v_org_id, 'Paternity Leave', 'PL', 14, true, '#6366F1'),
    (v_org_id, 'Unpaid Leave', 'UL', 30, false, '#6B7280'),
    (v_org_id, 'Bereavement Leave', 'BL', 5, true, '#374151'),
    (v_org_id, 'Emergency Leave', 'EL', 5, true, '#F59E0B')
  ON CONFLICT (org_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    days_allowed = EXCLUDED.days_allowed,
    is_paid = EXCLUDED.is_paid,
    color = EXCLUDED.color;

  -- Capture leave type IDs dynamically
  SELECT id INTO v_lt_annual  FROM public.leave_types WHERE org_id = v_org_id AND code = 'AL' LIMIT 1;
  SELECT id INTO v_lt_sick    FROM public.leave_types WHERE org_id = v_org_id AND code = 'SL' LIMIT 1;
  SELECT id INTO v_lt_mat     FROM public.leave_types WHERE org_id = v_org_id AND code = 'ML' LIMIT 1;
  SELECT id INTO v_lt_pat     FROM public.leave_types WHERE org_id = v_org_id AND code = 'PL' LIMIT 1;
  SELECT id INTO v_lt_unpaid  FROM public.leave_types WHERE org_id = v_org_id AND code = 'UL' LIMIT 1;
  SELECT id INTO v_lt_bereave FROM public.leave_types WHERE org_id = v_org_id AND code = 'BL' LIMIT 1;
  SELECT id INTO v_lt_emerg   FROM public.leave_types WHERE org_id = v_org_id AND code = 'EL' LIMIT 1;

  -- 5. Upsert Core Employees (safely updates if email exists, otherwise inserts)
  -- 5.1 Super Admin
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'superadmin@workforcepro.com') THEN
    UPDATE public.employees SET
      department_id = v_dept_hr, role = 'super_admin', position = 'Chief Executive Officer',
      salary_info = '{"base_salary": 180000, "rate_type": "monthly"}'::jsonb, status = 'active'
    WHERE email = 'superadmin@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_hr, 'EMP-1001', 'Super', 'Admin', 'superadmin@workforcepro.com', '+63 917 111 0001', 'unspecified', 'super_admin', 'Chief Executive Officer', 'full_time', 'active', '2024-01-15', '{"base_salary": 180000, "rate_type": "monthly"}'::jsonb, '{"name": "Office Security", "phone": "+63 2 8888 1234"}'::jsonb);
  END IF;

  -- 5.2 System Admin
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'admin@workforcepro.com') THEN
    UPDATE public.employees SET
      department_id = v_dept_hr, role = 'admin', position = 'HR Director',
      salary_info = '{"base_salary": 120000, "rate_type": "monthly"}'::jsonb, status = 'active'
    WHERE email = 'admin@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_hr, 'EMP-1002', 'System', 'Admin', 'admin@workforcepro.com', '+63 917 111 0002', 'unspecified', 'admin', 'HR Director', 'full_time', 'active', '2024-02-01', '{"base_salary": 120000, "rate_type": "monthly"}'::jsonb, '{"name": "HR Support", "phone": "+63 917 999 0002"}'::jsonb);
  END IF;

  -- 5.3 Supervisor - Alex Rivera
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'alex.rivera@workforcepro.com') THEN
    UPDATE public.employees SET
      department_id = v_dept_eng, role = 'team_supervisor', position = 'Lead Software Architect',
      salary_info = '{"base_salary": 110000, "rate_type": "monthly"}'::jsonb, status = 'active'
    WHERE email = 'alex.rivera@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_eng, 'EMP-1003', 'Alex', 'Rivera', 'alex.rivera@workforcepro.com', '+63 917 222 1001', 'male', 'team_supervisor', 'Lead Software Architect', 'full_time', 'active', '2024-03-10', '{"base_salary": 110000, "rate_type": "monthly"}'::jsonb, '{"name": "Maria Rivera", "relationship": "Mother", "phone": "+63 917 888 1001"}'::jsonb);
  END IF;

  -- 5.4 Sophia Chen (Frontend)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'sophia.chen@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_eng, position = 'Senior Frontend Engineer', salary_info = '{"base_salary": 95000, "rate_type": "monthly"}'::jsonb WHERE email = 'sophia.chen@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_eng, 'EMP-1004', 'Sophia', 'Chen', 'sophia.chen@workforcepro.com', '+63 917 222 1002', 'female', 'employee', 'Senior Frontend Engineer', 'full_time', 'active', '2024-04-01', '{"base_salary": 95000, "rate_type": "monthly"}'::jsonb, '{"name": "David Chen", "relationship": "Brother", "phone": "+63 917 888 1002"}'::jsonb);
  END IF;

  -- 5.5 Marcus Vance (Backend)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'marcus.vance@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_eng, position = 'Backend & Cloud Engineer', salary_info = '{"base_salary": 90000, "rate_type": "monthly"}'::jsonb WHERE email = 'marcus.vance@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_eng, 'EMP-1005', 'Marcus', 'Vance', 'marcus.vance@workforcepro.com', '+63 917 222 1003', 'male', 'employee', 'Backend & Cloud Engineer', 'full_time', 'active', '2024-05-15', '{"base_salary": 90000, "rate_type": "monthly"}'::jsonb, '{"name": "Elena Vance", "relationship": "Spouse", "phone": "+63 917 888 1003"}'::jsonb);
  END IF;

  -- 5.6 Sarah Connor (HR Manager)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'sarah.connor@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_hr, role = 'hr_manager', position = 'People Operations Manager', salary_info = '{"base_salary": 85000, "rate_type": "monthly"}'::jsonb WHERE email = 'sarah.connor@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_hr, 'EMP-1006', 'Sarah', 'Connor', 'sarah.connor@workforcepro.com', '+63 917 333 1001', 'female', 'hr_manager', 'People Operations Manager', 'full_time', 'active', '2024-03-01', '{"base_salary": 85000, "rate_type": "monthly"}'::jsonb, '{"name": "John Connor", "relationship": "Son", "phone": "+63 917 888 1004"}'::jsonb);
  END IF;

  -- 5.7 Daniel Kim (Sales)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'daniel.kim@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_sls, position = 'Enterprise Account Executive', salary_info = '{"base_salary": 80000, "rate_type": "monthly"}'::jsonb WHERE email = 'daniel.kim@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_sls, 'EMP-1007', 'Daniel', 'Kim', 'daniel.kim@workforcepro.com', '+63 917 444 1001', 'male', 'employee', 'Enterprise Account Executive', 'full_time', 'active', '2024-06-01', '{"base_salary": 80000, "rate_type": "monthly"}'::jsonb, '{"name": "Grace Kim", "relationship": "Sister", "phone": "+63 917 888 1005"}'::jsonb);
  END IF;

  -- 5.8 Olivia Taylor (Marketing)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'olivia.taylor@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_mkt, position = 'Product Marketing Specialist', salary_info = '{"base_salary": 75000, "rate_type": "monthly"}'::jsonb WHERE email = 'olivia.taylor@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_mkt, 'EMP-1008', 'Olivia', 'Taylor', 'olivia.taylor@workforcepro.com', '+63 917 555 1001', 'female', 'employee', 'Product Marketing Specialist', 'full_time', 'active', '2024-06-15', '{"base_salary": 75000, "rate_type": "monthly"}'::jsonb, '{"name": "Robert Taylor", "relationship": "Father", "phone": "+63 917 888 1006"}'::jsonb);
  END IF;

  -- 5.9 Liam Johnson (Ops/IT)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'liam.johnson@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_ops, position = 'DevOps & IT Security Analyst', salary_info = '{"base_salary": 88000, "rate_type": "monthly"}'::jsonb WHERE email = 'liam.johnson@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_ops, 'EMP-1009', 'Liam', 'Johnson', 'liam.johnson@workforcepro.com', '+63 917 666 1001', 'male', 'employee', 'DevOps & IT Security Analyst', 'full_time', 'active', '2024-07-01', '{"base_salary": 88000, "rate_type": "monthly"}'::jsonb, '{"name": "Chloe Johnson", "relationship": "Spouse", "phone": "+63 917 888 1007"}'::jsonb);
  END IF;

  -- 5.10 Emily Watson (Finance)
  IF EXISTS (SELECT 1 FROM public.employees WHERE email = 'emily.watson@workforcepro.com') THEN
    UPDATE public.employees SET department_id = v_dept_fin, position = 'Senior Payroll & Tax Accountant', salary_info = '{"base_salary": 82000, "rate_type": "monthly"}'::jsonb WHERE email = 'emily.watson@workforcepro.com';
  ELSE
    INSERT INTO public.employees (org_id, department_id, employee_id, first_name, last_name, email, phone, gender, role, position, employment_type, status, hire_date, salary_info, emergency_contact)
    VALUES (v_org_id, v_dept_fin, 'EMP-1010', 'Emily', 'Watson', 'emily.watson@workforcepro.com', '+63 917 777 1001', 'female', 'employee', 'Senior Payroll & Tax Accountant', 'full_time', 'active', '2024-07-15', '{"base_salary": 82000, "rate_type": "monthly"}'::jsonb, '{"name": "James Watson", "relationship": "Brother", "phone": "+63 917 888 1008"}'::jsonb);
  END IF;

  -- 6. Initialize Leave Balances for all employees
  FOR emp_rec IN SELECT id FROM public.employees WHERE org_id = v_org_id LOOP
    INSERT INTO public.leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days)
    SELECT
      emp_rec.id,
      lt.id,
      v_year,
      lt.days_allowed,
      CASE WHEN lt.code = 'AL' THEN 3 WHEN lt.code = 'SL' THEN 1 ELSE 0 END,
      0,
      0
    FROM public.leave_types lt
    WHERE lt.org_id = v_org_id
    ON CONFLICT (employee_id, leave_type_id, year) DO UPDATE SET
      allocated_days = EXCLUDED.allocated_days;
  END LOOP;

  -- 7. Seed Announcements
  INSERT INTO public.announcements (
    org_id, author_id, title, content, type, is_pinned, published_at, expires_at, views
  )
  SELECT
    v_org_id, e.id,
    '📢 Welcome to Nexus Tech Q3 All-Hands & Strategy Briefing',
    'We are thrilled to announce our upcoming Q3 All-Hands meeting this Friday at 3:00 PM. We will review key performance metrics, product roadmap milestones, and recognize top team contributions.',
    'general', true, now() - interval '2 days', now() + interval '30 days', 142
  FROM public.employees e
  WHERE e.email = 'superadmin@workforcepro.com'
  LIMIT 1;

  INSERT INTO public.announcements (
    org_id, author_id, title, content, type, is_pinned, published_at, expires_at, views
  )
  SELECT
    v_org_id, e.id,
    '🏥 Updated Health & HMO Coverage Guidelines 2026',
    'Please be informed that our comprehensive health insurance policy has been updated with expanded dependent coverage and mental wellness allowances. Review the guidelines in the HR portal.',
    'policy', false, now() - interval '5 days', now() + interval '60 days', 89
  FROM public.employees e
  WHERE e.email = 'admin@workforcepro.com'
  LIMIT 1;

  INSERT INTO public.announcements (
    org_id, author_id, title, content, type, is_pinned, published_at, expires_at, views
  )
  SELECT
    v_org_id, e.id,
    '🚀 Automated Attendance & Timesheet Sync Live',
    'Our face recognition and geofenced attendance system now seamlessly syncs with your weekly timesheets and payroll logs. Please check your schedule dashboard for real-time updates.',
    'urgent', false, now() - interval '1 day', now() + interval '14 days', 115
  FROM public.employees e
  WHERE e.email = 'alex.rivera@workforcepro.com'
  LIMIT 1;

  -- 8. Seed Leave Requests
  INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_at, updated_at)
  SELECT e.id, v_lt_annual, (CURRENT_DATE + INTERVAL '5 days')::date, (CURRENT_DATE + INTERVAL '8 days')::date, 4, 'Annual family holiday trip', 'pending', now() - interval '1 day', now() - interval '1 day'
  FROM public.employees e WHERE e.email = 'sophia.chen@workforcepro.com' LIMIT 1;

  INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_at, updated_at)
  SELECT e.id, v_lt_sick, (CURRENT_DATE - INTERVAL '3 days')::date, (CURRENT_DATE - INTERVAL '2 days')::date, 2, 'Doctor prescribed rest for fever', 'approved', now() - interval '4 days', now() - interval '3 days'
  FROM public.employees e WHERE e.email = 'marcus.vance@workforcepro.com' LIMIT 1;

  INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_at, updated_at)
  SELECT e.id, v_lt_emerg, (CURRENT_DATE + INTERVAL '12 days')::date, (CURRENT_DATE + INTERVAL '13 days')::date, 2, 'Family emergency matter', 'pending', now() - interval '2 hours', now() - interval '2 hours'
  FROM public.employees e WHERE e.email = 'daniel.kim@workforcepro.com' LIMIT 1;

  INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_at, updated_at)
  SELECT e.id, v_lt_annual, (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE - INTERVAL '12 days')::date, 4, 'Mid-year personal travel', 'approved', now() - interval '20 days', now() - interval '18 days'
  FROM public.employees e WHERE e.email = 'olivia.taylor@workforcepro.com' LIMIT 1;

  -- 9. Seed Schedules for the current month and upcoming 2 weeks
  FOR emp_rec IN SELECT id, department_id FROM public.employees WHERE org_id = v_org_id LOOP
    IF emp_rec.department_id = v_dept_eng THEN
      v_shift_id := v_shift_flex;
    ELSE
      v_shift_id := v_shift_morning;
    END IF;

    FOR cur_date IN
      SELECT d::date
      FROM generate_series((CURRENT_DATE - INTERVAL '30 days')::date, (CURRENT_DATE + INTERVAL '14 days')::date, '1 day'::interval) AS d
      WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
    LOOP
      INSERT INTO public.schedules (employee_id, shift_id, date, status)
      VALUES (emp_rec.id, v_shift_id, cur_date, 'scheduled')
      ON CONFLICT (employee_id, date) DO UPDATE SET shift_id = EXCLUDED.shift_id;
    END LOOP;
  END LOOP;

  -- 10. Seed Attendance Records for past 90 days (generates rich metrics)
  FOR emp_rec IN SELECT id FROM public.employees WHERE org_id = v_org_id AND status = 'active' LOOP
    FOR cur_date IN
      SELECT d::date
      FROM generate_series((CURRENT_DATE - INTERVAL '90 days')::date, CURRENT_DATE, '1 day'::interval) AS d
      WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
    LOOP
      v_rnd := random();
      
      IF v_rnd < 0.04 THEN
        -- Absent
        INSERT INTO public.attendance_records (employee_id, date, status, overtime_hours)
        VALUES (emp_rec.id, cur_date, 'absent', 0)
        ON CONFLICT (employee_id, date) DO UPDATE SET status = 'absent', clock_in = NULL, clock_out = NULL, total_hours = NULL, overtime_hours = 0;

      ELSIF v_rnd < 0.09 THEN
        -- Half Day
        v_clock_in := (cur_date::timestamp + INTERVAL '8 hours 30 minutes') AT TIME ZONE 'Asia/Manila';
        v_clock_out := (cur_date::timestamp + INTERVAL '12 hours 30 minutes') AT TIME ZONE 'Asia/Manila';
        
        INSERT INTO public.attendance_records (employee_id, date, clock_in, clock_out, status, total_hours, overtime_hours)
        VALUES (emp_rec.id, cur_date, v_clock_in, v_clock_out, 'half_day', 4.0, 0)
        ON CONFLICT (employee_id, date) DO UPDATE SET status = 'half_day', clock_in = EXCLUDED.clock_in, clock_out = EXCLUDED.clock_out, total_hours = 4.0, overtime_hours = 0;

      ELSIF v_rnd < 0.22 THEN
        -- Late Arrival
        v_clock_in := (cur_date::timestamp + INTERVAL '9 hours 15 minutes' + ((random() * 25) * INTERVAL '1 minute')) AT TIME ZONE 'Asia/Manila';
        v_clock_out := (cur_date::timestamp + INTERVAL '18 hours' + ((random() * 45) * INTERVAL '1 minute')) AT TIME ZONE 'Asia/Manila';
        v_total_hours := ROUND((EXTRACT(EPOCH FROM (v_clock_out - v_clock_in)) / 3600.0 - 1.0)::numeric, 2);
        v_overtime := GREATEST(0, ROUND((v_total_hours - 8.0)::numeric, 2));

        INSERT INTO public.attendance_records (employee_id, date, clock_in, clock_out, status, total_hours, overtime_hours)
        VALUES (emp_rec.id, cur_date, v_clock_in, v_clock_out, 'late', v_total_hours, v_overtime)
        ON CONFLICT (employee_id, date) DO UPDATE SET status = 'late', clock_in = EXCLUDED.clock_in, clock_out = EXCLUDED.clock_out, total_hours = EXCLUDED.total_hours, overtime_hours = EXCLUDED.overtime_hours;

      ELSE
        -- Present On-Time
        v_clock_in := (cur_date::timestamp + INTERVAL '7 hours 50 minutes' + ((random() * 15) * INTERVAL '1 minute')) AT TIME ZONE 'Asia/Manila';
        v_clock_out := (cur_date::timestamp + INTERVAL '17 hours' + ((random() * 60) * INTERVAL '1 minute')) AT TIME ZONE 'Asia/Manila';
        v_total_hours := ROUND((EXTRACT(EPOCH FROM (v_clock_out - v_clock_in)) / 3600.0 - 1.0)::numeric, 2);
        v_overtime := GREATEST(0, ROUND((v_total_hours - 8.0)::numeric, 2));

        INSERT INTO public.attendance_records (employee_id, date, clock_in, clock_out, status, total_hours, overtime_hours)
        VALUES (emp_rec.id, cur_date, v_clock_in, v_clock_out, 'present', v_total_hours, v_overtime)
        ON CONFLICT (employee_id, date) DO UPDATE SET status = 'present', clock_in = EXCLUDED.clock_in, clock_out = EXCLUDED.clock_out, total_hours = EXCLUDED.total_hours, overtime_hours = EXCLUDED.overtime_hours;
      END IF;
    END LOOP;
  END LOOP;

  -- 11. Seed Timesheet Entries for Payroll & Timesheet Page
  FOR emp_rec IN SELECT id FROM public.employees WHERE org_id = v_org_id AND role = 'employee' LOOP
    FOR cur_date IN
      SELECT d::date
      FROM generate_series((date_trunc('month', CURRENT_DATE))::date, (CURRENT_DATE - INTERVAL '1 day')::date, '1 day'::interval) AS d
      WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
    LOOP
      INSERT INTO public.timesheet_entries (
        employee_id, date, start_time, end_time, break_minutes, overtime_hours, is_approved, source
      )
      VALUES (
        emp_rec.id, cur_date, '08:30:00', '17:30:00', 60,
        CASE WHEN random() < 0.25 THEN 1.5 ELSE 0 END,
        true, 'clock_in'
      )
      ON CONFLICT (employee_id, date, start_time) DO UPDATE SET
        is_approved = true,
        overtime_hours = EXCLUDED.overtime_hours;
    END LOOP;
  END LOOP;

  -- 12. Seed Performance Reviews
  SELECT id INTO v_reviewer_id FROM public.employees WHERE org_id = v_org_id AND role IN ('admin', 'super_admin') LIMIT 1;
  
  IF v_reviewer_id IS NOT NULL THEN
    FOR emp_rec IN SELECT id FROM public.employees WHERE org_id = v_org_id AND id != v_reviewer_id LOOP
      INSERT INTO public.performance_reviews (
        employee_id, reviewer_id, review_period_start, review_period_end,
        review_type,
        overall_rating, job_knowledge_rating, work_quality_rating, attendance_rating, initiative_rating, teamwork_rating,
        strengths, improvements, goals,
        goals_data,
        status, submitted_at, acknowledged_at
      )
      VALUES (
        emp_rec.id,
        v_reviewer_id,
        (CURRENT_DATE - INTERVAL '6 months')::date,
        CURRENT_DATE,
        'quarterly',
        ROUND((4.0 + (random() * 0.8))::numeric, 1),
        4.5, 4.6, 4.8, 4.4, 4.5,
        'Exemplary technical execution, proactive problem-solving, and seamless cross-functional collaboration.',
        'Continue mentoring junior team members and documenting system architectural workflows.',
        'Lead Q4 system modernization initiatives and obtain cloud domain certification.',
        '[{"title": "System Uptime & Stability", "target": "99.9%", "progress": 100}, {"title": "Sprint Delivery Rate", "target": "95%", "progress": 92}]'::jsonb,
        'acknowledged',
        now() - interval '5 days',
        now() - interval '2 days'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- 13. Seed Notifications
  FOR emp_rec IN SELECT id FROM public.employees WHERE org_id = v_org_id LOOP
    INSERT INTO public.notifications (employee_id, title, message, type, category, is_read, created_at)
    VALUES
      (
        emp_rec.id, 'Welcome to Nexus Tech WMS',
        'Your profile and workforce account have been fully configured. Explore your attendance, schedule, and leave modules.',
        'success', 'system', true, now() - interval '7 days'
      ),
      (
        emp_rec.id, 'Upcoming Shift Assignment',
        'Your shift schedule for the coming week has been finalized by HR.',
        'info', 'schedule', false, now() - interval '1 day'
      ),
      (
        emp_rec.id, 'Monthly Timesheet Reminder',
        'Please review and confirm your attendance entries before payroll cutoff.',
        'warning', 'attendance', false, now() - interval '3 hours'
      );
  END LOOP;

  -- 14. Seed Audit Logs
  INSERT INTO public.audit_logs (user_id, action, resource_type, changes, created_at)
  VALUES
    (NULL, 'SYSTEM_INIT', 'organizations', '{"status": "initialized", "plan": "enterprise"}'::jsonb, now() - interval '30 days'),
    (NULL, 'BULK_SCHEDULE_SYNC', 'schedules', '{"count": 250, "period": "current_month"}'::jsonb, now() - interval '3 days'),
    (NULL, 'POLICY_UPDATE', 'announcements', '{"title": "HMO Guidelines 2026", "author": "HR"}'::jsonb, now() - interval '2 days'),
    (NULL, 'PAYROLL_REVIEW', 'timesheets', '{"status": "approved", "period": "2026-08"}'::jsonb, now() - interval '1 day');

  RAISE NOTICE 'Master demo dataset successfully seeded!';
END $$;
