
import { supabase } from '../lib/supabase';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check frontend/.env.');
  }
  return supabase;
}


export async function getScholarInvites() {
  const client = requireSupabase();

  // 1. Fetch all authorized scholar invitations.
  const { data: invites, error: inviteError } = await client
    .from('scholar_invites')
    .select('id, full_name, email, status, invited_by, accepted_user_id, created_at')
    .order('created_at', { ascending: false });

  if (inviteError) throw inviteError;

  const acceptedIds = (invites || [])
    .map(invite => invite.accepted_user_id)
    .filter(Boolean);

  // 2. Fetch account information and scholar profiles.
  let userProfiles = [];
  let scholarProfiles = [];

  if (acceptedIds.length > 0) {
    const [usersResult, scholarsResult] = await Promise.all([
      client
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, account_status')
        .in('id', acceptedIds),

      client
        .from('scholar_profiles')
        .select('user_id, university, degree, course, specialization, academic_year, graduation_year, profile_image_path')
        .in('user_id', acceptedIds),
    ]);

    if (usersResult.error) throw usersResult.error;
    if (scholarsResult.error) throw scholarsResult.error;

    userProfiles = usersResult.data || [];
    scholarProfiles = scholarsResult.data || [];
  }

  // 3. Create lookup maps.
  const userMap = new Map(
    userProfiles.map(user => [user.id, user])
  );

  const scholarMap = new Map(
    scholarProfiles.map(profile => [profile.user_id, profile])
  );

  // 4. Combine invitation and actual profile information.
  
  return await Promise.all(
    (invites || []).map(async (invite) => {
      const user = userMap.get(invite.accepted_user_id);
      const profile = scholarMap.get(invite.accepted_user_id);

      let image = user?.avatar_url || null;

      if (profile?.profile_image_path) {
        const { data, error } = await client.storage
          .from('scholar-media')
          .createSignedUrl(profile.profile_image_path, 3600);

        if (error) {
          console.error('Scholar profile image error:', error);
        } else {
          image = data.signedUrl;
        }
      }

      return {
        id: invite.id,
        name: user?.full_name || invite.full_name,
        email: user?.email || invite.email,
        status: invite.accepted_user_id
          ? 'Active'
          : invite.status === 'invited'
            ? 'Invited'
            : invite.status,
        image,
        institution: profile?.university || '',
        field: profile?.specialization || profile?.course || profile?.degree || '',
        year: profile?.graduation_year || '',
        acceptedUserId: invite.accepted_user_id,
      };
    })
  );

}


export async function createScholarInvite({ name, email }) {
  const client = requireSupabase();

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be logged in as an administrator.');

  const { data, error } = await client
    .from('scholar_invites')
    .insert({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScholarInvite(id, { name, email }) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('scholar_invites')
    .update({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
    })
    .eq('id', id)
    .eq('status', 'invited')
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBulkScholarInvites(scholars) {
  const client = requireSupabase();

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be logged in as an administrator.');

  const records = scholars.map(scholar => ({
    full_name: scholar.name.trim(),
    email: scholar.email.trim().toLowerCase(),
    invited_by: user.id,
  }));

  const { data, error } = await client
    .from('scholar_invites')
    .insert(records)
    .select();

  if (error) throw error;
  return data;
}


export async function sendScholarInvitation({ name, email }) {
  const client = requireSupabase();

  const { data, error } = await client.functions.invoke(
    'invite-scholar',
    {
      body: {
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    }
  );

  if (error) throw error;

  if (!data?.success) {
    throw new Error(data?.error || 'Unable to send scholar invitation.');
  }

  return data;
}
