-- Enable RLS on prompt_logs and user_preferences tables
-- These tables were previously unprotected; service-role queries already filter
-- by user_id, but explicit RLS prevents accidental data exposure if filtering
-- logic is ever omitted.

ALTER TABLE public.prompt_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_logs"
  ON public.prompt_logs
  FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id);
