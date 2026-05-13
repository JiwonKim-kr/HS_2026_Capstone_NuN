-- 1. users 테이블에 is_admin 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. daily_usage 테이블 생성
CREATE TABLE IF NOT EXISTS daily_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date    DATE NOT NULL DEFAULT CURRENT_DATE,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON daily_usage FOR SELECT
  USING (auth.uid() = user_id);

-- 어드민 지정 예시 (실제 UUID로 교체 후 실행):
-- UPDATE users SET is_admin = true WHERE id = '<admin-user-id>';
