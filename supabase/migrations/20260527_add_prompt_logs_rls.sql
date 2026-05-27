-- prompt_logs 테이블 Row Level Security 정책 추가
-- 배경: user_api_keys, users 테이블은 RLS가 설정되어 있으나
--       prompt_logs 테이블에는 정책이 없었음.
--       authenticated 사용자가 자신의 로그만 조회/삽입 가능하도록 제한.

-- RLS 활성화
ALTER TABLE public.prompt_logs ENABLE ROW LEVEL SECURITY;

-- 자신의 로그만 조회 가능
CREATE POLICY "users_see_own_logs" ON public.prompt_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 자신의 user_id로만 삽입 가능
CREATE POLICY "users_insert_own_logs" ON public.prompt_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- authenticated 역할에 최소 권한 부여
GRANT SELECT, INSERT, UPDATE ON public.prompt_logs TO authenticated;

-- service_role은 RLS를 우회하므로 기존 서버 로직(aiService 등) 영향 없음
