import { NextResponse } from 'next/server';
import { createRouteHandlerClient, getAuthenticatedUser } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const id = (await params).id;

  const supabase = await createRouteHandlerClient();
  const { error: deleteError } = await supabase
    .from('user_api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only delete their own keys

  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
