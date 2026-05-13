import { NextResponse } from 'next/server';
import { getUserSessions } from '@/lib/services/historyService';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  try {
    const sessions = await getUserSessions(user.id);
    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    console.error('History API Route Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
