import { supabase } from '../supabaseAdmin.js';
import { Modality, isModality, prefKey, clampLean } from './modality.js';

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
  appliedTiers: Record<string, number>;
  targetModality?: Modality;
  targetLikeStatus: boolean;
}) => {
  const modality: Modality = isModality(params.targetModality) ? params.targetModality : 'text';
  const isMedia = modality !== 'text';
  // 1. Fetch current prompt_log: 중복 적용 여부 + (미디어) 잔차 계산용 baseline.
  const { data: logData, error: logError } = await supabase
    .from('prompt_logs')
    .select('is_weight_applied, chosen_metadata')
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

  // 미디어 잔차 학습용 baseline (생성 시 저장값). 누락 시 중립(3).
  const baselineTiers: Record<string, number> =
    (logData.chosen_metadata as any)?.baselineTiers ?? {};

  const existingRows = [];
  const newRows = [];

  for (const dim of dimensions) {
    const category = prefKey(modality, dim);
    const existingRow = existingPrefs.find(p => p.category === category);

    let newScore: number;
    if (isMedia) {
      // 잔차(lean) 학습: applied − baseline 방향으로 EMA. 기본 lean = 0.0.
      const currentLean = existingRow ? existingRow.weight_score : 0.0;
      const residual = params.appliedTiers[dim] - (baselineTiers[dim] ?? 3);
      newScore = clampLean((currentLean + residual) / 2);
    } else {
      // 텍스트: 기존 절대 가중치 EMA 유지. 기본 1.0.
      const currentScore = existingRow ? existingRow.weight_score : 1.0;
      const representativeScore = TIER_REPRESENTATIVE_SCORES[params.appliedTiers[dim]] ?? 1.0;
      newScore = (currentScore + representativeScore) / 2;
    }

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
