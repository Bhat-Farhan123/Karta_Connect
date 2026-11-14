import { supabase } from '../lib/supabase';

function requireSupabase() {
  if (!supabase) {
 throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.');
  }
  return supabase;
}

export async function getCurrentSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export function subscribeToAuthChanges(callback) {
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}





export async function getUserProfile(userId) {
  const client = requireSupabase();

  const [
    { data: userData, error: userError },
    { data: scholarData, error: scholarError },
    { data: organizationData, error: organizationError }
  ] = await Promise.all([
    client
      .from('user_profiles')
      .select(`
        id, full_name, email, role, account_status,
        avatar_url, cover_url, created_at, updated_at
      `)
      .eq('id', userId)
      .single(),

    client
      .from('scholar_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

    client
      .from('organization_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
  ]);

  if (userError) throw userError;
  if (scholarError) throw scholarError;
  if (organizationError) throw organizationError;

  return {
    ...userData,
    ...(scholarData || {}),
    ...(organizationData
      ? { organization: organizationData }
      : {})
  };
}




export async function updateUserProfile(userId, updates) {
  const client = requireSupabase();

  const allowedUpdates = {};

  if (typeof updates.full_name === 'string') {
    allowedUpdates.full_name = updates.full_name.trim();
  }

  if (typeof updates.avatar_url === 'string') {
    allowedUpdates.avatar_url = updates.avatar_url;
  }
  if (typeof updates.cover_url === 'string') {
  allowedUpdates.cover_url = updates.cover_url;
}

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error('No valid profile changes provided.');
  }

  const { data, error } = await client
    .from('user_profiles')
    .update({
      ...allowedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, full_name, email, role, account_status, avatar_url, cover_url, created_at, updated_at')
    .single();

  if (error) throw error;

  return data;
}
