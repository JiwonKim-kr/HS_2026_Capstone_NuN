CREATE TABLE public.user_api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash     TEXT NOT NULL UNIQUE,   -- SHA-256 of raw token
  key_prefix   TEXT NOT NULL,          -- 처음 8자, UI 표시용
  label        TEXT NOT NULL DEFAULT 'MCP Key',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ             -- NULL = 만료 없음
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_see_own_keys" ON public.user_api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_keys" ON public.user_api_keys
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_keys" ON public.user_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, DELETE ON public.user_api_keys TO authenticated;
GRANT ALL ON public.user_api_keys TO service_role;
