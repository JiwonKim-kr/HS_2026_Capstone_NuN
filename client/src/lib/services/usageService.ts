import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_LIMIT = 5;

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (userData?.is_admin) {
    return { allowed: true, remaining: Infinity };
  }

  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const current = data?.count ?? 0;

  if (current >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await supabase
    .from('daily_usage')
    .upsert({ user_id: userId, date: today, count: current + 1 });

  return { allowed: true, remaining: DAILY_LIMIT - current - 1 };
}
