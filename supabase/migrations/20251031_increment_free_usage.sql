
-- Create function to safely increment free analysis usage
CREATE OR REPLACE FUNCTION public.increment_free_analysis_usage(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET free_analyses_used = COALESCE(free_analyses_used, 0) + 1
  WHERE id = user_id;
END;
$$;

-- Create function to get current free analyses used
CREATE OR REPLACE FUNCTION public.get_free_analyses_used(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(free_analyses_used, 0)
  FROM public.profiles
  WHERE id = user_id;
$$;
