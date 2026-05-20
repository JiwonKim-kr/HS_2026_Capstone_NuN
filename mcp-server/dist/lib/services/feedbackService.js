import { supabase } from '../supabaseAdmin.js';
const TIER_REPRESENTATIVE_SCORES = {
    1: 0.25,
    2: 0.65,
    3: 1.0,
    4: 1.35,
    5: 1.75,
};
export const processFeedback = async (params) => {
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
    const updatePayload = { is_liked: params.targetLikeStatus };
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
    const categories = ['tone', 'level', 'density', 'creativity'];
    const existingRows = [];
    const newRows = [];
    for (const cat of categories) {
        const existingRow = existingPrefs.find(p => p.category === cat);
        const currentScore = existingRow ? existingRow.weight_score : 1.0;
        const representativeScore = TIER_REPRESENTATIVE_SCORES[params.appliedTiers[cat]] ?? 1.0;
        const newScore = (currentScore + representativeScore) / 2;
        if (existingRow) {
            existingRows.push({
                id: existingRow.id,
                user_id: params.userId,
                category: cat,
                weight_score: newScore,
                updated_at: new Date().toISOString()
            });
        }
        else {
            newRows.push({
                user_id: params.userId,
                category: cat,
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
