-- Fix timesheet_entries foreign key constraint on attendance_id to CASCADE on delete
DO $$
BEGIN
  -- Drop existing constraint if present
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'timesheet_entries_attendance_id_fkey'
      AND table_name = 'timesheet_entries'
  ) THEN
    ALTER TABLE public.timesheet_entries 
      DROP CONSTRAINT timesheet_entries_attendance_id_fkey;
  END IF;

  -- Re-add constraint with ON DELETE CASCADE
  ALTER TABLE public.timesheet_entries 
    ADD CONSTRAINT timesheet_entries_attendance_id_fkey 
    FOREIGN KEY (attendance_id) 
    REFERENCES public.attendance_records(id) 
    ON DELETE CASCADE;
END $$;
