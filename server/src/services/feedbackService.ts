import { createClient } from '@supabase/supabase-js';

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

export const savePromptHistory = async (params: {
  userId: string;
  originalInput: string;
  chosenPrompt: string;
  chosenMetadata: any;
}) => {
  const { data, error } = await supabase
    .from('prompt_logs')
    .insert([
      {
        user_id: params.userId,
        original_input: params.originalInput,
        chosen_prompt: params.chosenPrompt,
        chosen_metadata: params.chosenMetadata,
        // applied_context is also in DB, we can optionally store it or just rely on chosen_metadata
        applied_context: params.chosenMetadata?.appliedTiers || {},
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error saving prompt history:', error);
    throw new Error('Failed to save prompt history');
  }

  return { historyId: data.id };
};

export const processFeedback = async (params: {
  historyId: string;
  userId: string;
  appliedTiers: {
    tone: number;
    level: number;
    density: number;
    creativity: number;
  };
}) => {
  // 1. Mark prompt_logs as liked
  const { error: updateError } = await supabase
    .from('prompt_logs')
    .update({ is_liked: true })
    .eq('id', params.historyId);

  if (updateError) {
    console.error('Error updating prompt_logs:', updateError);
    throw new Error('Failed to update feedback status');
  }

  // 2. Fetch current user preferences
  const { data: prefsData, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', params.userId)
    .single();

  if (prefsError) {
    console.error('Error fetching user_preferences:', prefsError);
    // If no row exists, we might insert one, or just ignore. We will throw for now.
    throw new Error('Failed to fetch user preferences');
  }

  // Calculate midpoints
  const newTone = (prefsData.tone + (TIER_REPRESENTATIVE_SCORES[params.appliedTiers.tone] ?? 1.0)) / 2;
  const newLevel = (prefsData.level + (TIER_REPRESENTATIVE_SCORES[params.appliedTiers.level] ?? 1.0)) / 2;
  const newDensity = (prefsData.density + (TIER_REPRESENTATIVE_SCORES[params.appliedTiers.density] ?? 1.0)) / 2;
  const newCreativity = (prefsData.creativity + (TIER_REPRESENTATIVE_SCORES[params.appliedTiers.creativity] ?? 1.0)) / 2;

  const { error: updatePrefsError } = await supabase
    .from('user_preferences')
    .update({
      tone: newTone,
      level: newLevel,
      density: newDensity,
      creativity: newCreativity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prefsData.id);

  if (updatePrefsError) {
    console.error('Error updating user_preferences:', updatePrefsError);
    throw new Error('Failed to update user weights');
  }

  return { success: true };
};
