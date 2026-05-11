import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getUserSessions = async (userId: string) => {
  // session_id가 존재하는 로그들을 최신순으로 가져옴
  const { data, error } = await supabase
    .from('prompt_logs')
    .select('session_id, original_input, created_at')
    .eq('user_id', userId)
    .not('session_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompt history:', error);
    throw new Error('히스토리 조회에 실패했습니다.');
  }

  // 중복 제거: 한 세션(session_id)에 여러 프롬프트(보통 3개)가 있으므로 1개로 합침
  const uniqueSessionsMap = new Map<string, any>();

  for (const log of (data || [])) {
    if (!uniqueSessionsMap.has(log.session_id)) {
      uniqueSessionsMap.set(log.session_id, {
        sessionId: log.session_id,
        title: log.original_input,
        createdAt: log.created_at,
      });
    }
  }

  return Array.from(uniqueSessionsMap.values());
};

export const getSessionDetails = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('prompt_logs')
    .select('id, session_id, user_id, original_input, chosen_prompt, chosen_metadata, is_liked, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session details:', error);
    throw new Error('히스토리 상세 조회에 실패했습니다.');
  }

  if (!data || data.length === 0) {
    return null;
  }

  const originalPrompt = data[0].original_input;
  const date = new Date(data[0].created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const candidates = data.map((row) => ({
    candidateId: row.chosen_metadata.variant || Math.random().toString(36).substr(2, 9),
    logId: row.id,
    content: row.chosen_prompt,
    metadata: row.chosen_metadata,
    isLiked: row.is_liked
  }));

  return {
    sessionId,
    title: originalPrompt,
    date,
    originalPrompt,
    candidates
  };
};
