import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient는 세션을 cookies에 저장 → 미들웨어(SSR)가 읽을 수 있음
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
