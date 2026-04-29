-- 1. preferred_style 컬럼 추가
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_style TEXT;

-- 2. 롤 권한 부여 (없으면 authenticated 유저도 접근 불가)
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 3. RLS 활성화 (아직 안 되어 있을 경우)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 유저는 자신의 레코드만 읽기/쓰기 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_manage_own'
  ) THEN
    CREATE POLICY users_manage_own ON public.users
      FOR ALL
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
