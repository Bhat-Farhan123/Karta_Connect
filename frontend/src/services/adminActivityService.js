
import { supabase } from '../lib/supabase';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

// Record an administrator action
export async function logAdminActivity({
  action,
  targetType = null,
  targetId = null,
  targetLabel = null,
  details = {},
}) {
  const client = requireSupabase();

  const { data: { user }, error: userError } =
    await client.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('You must be logged in to record activity.');
  }

  const { data, error } = await client
    .from('admin_activity_logs')
    .insert({
      actor_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      details,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Retrieve the current administrator's activity
export async function getAdminActivities(limit = 50) {
  const client = requireSupabase();

  const { data: { user }, error: userError } =
    await client.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('You must be logged in to view activity.');
  }

  const { data, error } = await client
    .from('admin_activity_logs')
    .select('*')
    .eq('actor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}
