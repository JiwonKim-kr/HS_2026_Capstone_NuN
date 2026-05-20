import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const DAILY_GENERATION_LIMIT = 10;

export async function checkGenerationLimit(userId: string): Promise<{
  allowed: boolean;
  dailyCount: number;
  limit: number;
}> {
  const { data: userRow } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (userRow?.is_admin) {
    return { allowed: true, dailyCount: 0, limit: DAILY_GENERATION_LIMIT };
  }

  const { data: count } = await supabase.rpc('count_user_daily_sessions', {
    p_user_id: userId,
  });

  const dailyCount = (count as number) ?? 0;
  return {
    allowed: dailyCount < DAILY_GENERATION_LIMIT,
    dailyCount,
    limit: DAILY_GENERATION_LIMIT,
  };
}
