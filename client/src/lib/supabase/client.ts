import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저 환경에서 싱글턴으로 사용할 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
