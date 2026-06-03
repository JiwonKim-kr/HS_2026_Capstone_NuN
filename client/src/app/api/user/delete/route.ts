import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function DELETE() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  // auth.admin.deleteUser는 service role key가 필요합니다.
  // cascade로 public.users 및 연관 데이터(prompt_logs, user_preferences 등)가 함께 삭제됩니다.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('[user/delete] 계정 삭제 실패:', deleteError.message);
    return NextResponse.json(
      { success: false, error: '계정 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
