import { createHash } from 'crypto';
import { supabase } from '../lib/supabaseAdmin.js';

export async function verifyApiKey(authHeader: string): Promise<string | null> {
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;

  const keyHash = createHash('sha256').update(token).digest('hex');
  
  const { data, error } = await supabase
    .from('user_api_keys')
    .select('user_id, expires_at')
    .eq('key_hash', keyHash)
    .single();
    
  if (error || !data) return null;
  
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }
  
  // last_used_at 비동기 업데이트 (fire-and-forget)
  supabase
    .from('user_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)
    .then(({ error }) => {
      if (error) console.error("Failed to update last_used_at:", error);
    });

  return data.user_id;
}
