-- Add review_type and goals_data columns to performance_reviews table
ALTER TABLE public.performance_reviews 
  ADD COLUMN IF NOT EXISTS review_type text DEFAULT 'quarterly',
  ADD COLUMN IF NOT EXISTS goals_data jsonb DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.performance_reviews.review_type IS 'Appraisal cycle: quarterly, semi_annual, annual, probationary, or project';
