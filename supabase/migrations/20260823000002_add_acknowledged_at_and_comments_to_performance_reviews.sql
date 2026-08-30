-- Add acknowledged_at and employee_comments to performance_reviews table
ALTER TABLE public.performance_reviews 
  ADD COLUMN IF NOT EXISTS review_type text DEFAULT 'quarterly',
  ADD COLUMN IF NOT EXISTS goals_data jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS employee_comments text;

COMMENT ON COLUMN public.performance_reviews.acknowledged_at IS 'Timestamp when employee signed & acknowledged appraisal';
COMMENT ON COLUMN public.performance_reviews.employee_comments IS 'Employee feedback or acknowledgement comments';
