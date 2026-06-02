import { createClient } from '@supabase/supabase-js';
import { Modality, isModality, prefKey } from '@/lib/services/modality';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TIER_REPRESENTATIVE_SCORES: Record<number, number> = {
  1: 0.25,
  2: 0.65,
  3: 1.0,
  4: 1.35,
  5: 1.75,
};

export const processFeedback = async (params: {
  historyId: string;
  userId: string;
  // 모달리티마다 차원이 다르므로 가변 키 (예: text=tone/level/..., video=camera/pacing/...)
  appliedTiers: Record<string, number>;
  targetModality?: Modality;
  targetLikeStatus: boolean;
}) => {
  const modality: Modality = isModality(params.targetModality) ? params.targetModality : 'text';
  // 1. Fetch current prompt_log to check if weight was already applied
  const { data: logData, error: logError } = await supabase
    .from('prompt_logs')
    .select('is_weight_applied')
    .eq('id', params.historyId)
    .single();

  if (logError) {
    console.error('Error fetching prompt_log:', logError);
    throw new Error('Failed to verify feedback status');
  }

  const shouldApplyWeight = params.targetLikeStatus && !logData.is_weight_applied;

  // 2. Update prompt_logs flags
  const updatePayload: any = { is_liked: params.targetLikeStatus };
  if (shouldApplyWeight) {
    updatePayload.is_weight_applied = true;
  }

  const { error: updateError } = await supabase
    .from('prompt_logs')
    .update(updatePayload)
    .eq('id', params.historyId);

  if (updateError) {
    console.error('Error updating prompt_logs:', updateError);
    throw new Error('Failed to update feedback status');
  }

  // If we shouldn't apply weight (e.g. un-liking, or already applied before), we are done.
  if (!shouldApplyWeight) {
    return { success: true };
  }

  // 3. Fetch current user preferences
  const { data: prefsData, error: prefsError } = await supabase
    .from('user_preferences')
    .select('id, category, weight_score')
    .eq('user_id', params.userId);

  if (prefsError) {
    console.error('Error fetching user_preferences:', prefsError);
    throw new Error('Failed to fetch user preferences');
  }

  const existingPrefs = prefsData || [];
  // appliedTiers의 키(=해당 모달리티의 차원)만 순회. 카테고리는 모달리티 네임스페이스 적용.
  const dimensions = Object.keys(params.appliedTiers);

  const existingRows = [];
  const newRows = [];

  for (const dim of dimensions) {
    const category = prefKey(modality, dim);
    const existingRow = existingPrefs.find(p => p.category === category);
    const currentScore = existingRow ? existingRow.weight_score : 1.0;
    const representativeScore = TIER_REPRESENTATIVE_SCORES[params.appliedTiers[dim]] ?? 1.0;
    const newScore = (currentScore + representativeScore) / 2;

    if (existingRow) {
      existingRows.push({
        id: existingRow.id,
        user_id: params.userId,
        category,
        weight_score: newScore,
        updated_at: new Date().toISOString()
      });
    } else {
      newRows.push({
        user_id: params.userId,
        category,
        weight_score: newScore,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (existingRows.length > 0) {
    const { error } = await supabase.from('user_preferences').upsert(existingRows);
    if (error) {
      console.error('Error updating user_preferences:', error);
      throw new Error('Failed to update user weights');
    }
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from('user_preferences').insert(newRows);
    if (error) {
      console.error('Error inserting user_preferences:', error);
      throw new Error('Failed to create user weights');
    }
  }

  return { success: true };
};
