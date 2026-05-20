-- 1. users 테이블에 어드민 구분 컬럼 추가
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. 일일 생성 세션 수 카운트 함수 (KST 기준)
--    각 요청은 동일한 session_id를 가진 3개의 prompt_logs 행을 생성하므로
--    DISTINCT session_id 카운트로 실제 요청 횟수를 집계한다.
CREATE OR REPLACE FUNCTION count_user_daily_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(DISTINCT session_id)::INTEGER
  FROM public.prompt_logs
  WHERE user_id = p_user_id
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date
        = (NOW() AT TIME ZONE 'Asia/Seoul')::date;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. 어드민 계정 지정 (UUID는 Supabase Authentication > Users에서 확인 후 교체)
-- UPDATE public.users SET is_admin = true WHERE id = '<어드민-유저-UUID>';
