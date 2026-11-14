
import { supabase } from '../lib/supabase';

// Fetch posts with their author information.

// Fetch posts with their author information and scholar profile photos.



export async function getPosts() {
  // Fetch posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      author_id,
      content,
      media_urls,
      is_official,
      status,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const postList = posts || [];

  // Fetch public author details from the restricted view
  const authorIds = [
    ...new Set(postList.map(post => post.author_id))
  ];

  const { data: authors, error: authorError } = await supabase
    .from('post_author_profiles')
    .select('id, full_name, role, avatar_url')
    .in('id', authorIds);

  if (authorError) throw authorError;

  const authorMap = Object.fromEntries(
    (authors || []).map(author => [author.id, author])
  );

  // Fetch organization profiles
  const { data: organizations, error: organizationError } =
    await supabase
      .from('organization_profiles')
      .select('user_id, organization_name, logo_url')
      .in('user_id', authorIds);

  if (organizationError) throw organizationError;

  const organizationMap = Object.fromEntries(
    (organizations || []).map(org => [
      org.user_id,
      {
        name: org.organization_name,
        logo: org.logo_url,
      },
    ])
  );

  // Fetch scholar profile photos
  const scholarIds = (authors || [])
    .filter(author => author.role?.toLowerCase() === 'scholar')
    .map(author => author.id);

  const uniqueScholarIds = [...new Set(scholarIds)];

  let scholarPhotos = {};

  if (uniqueScholarIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('scholar_profiles')
      .select('user_id, profile_image_path')
      .in('user_id', uniqueScholarIds);

    if (profileError) throw profileError;

    const photoResults = await Promise.all(
      (profiles || [])
        .filter(profile => profile.profile_image_path)
        .map(async profile => {
          const { data: signed, error: imageError } =
            await supabase.storage
              .from('scholar-media')
              .createSignedUrl(profile.profile_image_path, 3600);

          if (imageError) {
            console.error('Could not load scholar profile photo:', imageError);
            return null;
          }

          return [profile.user_id, signed?.signedUrl || null];
        })
    );

    scholarPhotos = Object.fromEntries(photoResults.filter(Boolean));
  }

  // Format posts
  return postList.map(post => {
    const author = authorMap[post.author_id];
    const organization = organizationMap[post.author_id];

    const isOrganization = Boolean(organization);

    const role = isOrganization
      ? 'organization'
      : author?.role?.toLowerCase() || 'unknown';

    return {
      ...post,

      author_name: post.is_official
        ? 'Karta Official'
        : isOrganization
          ? organization.name || 'Organization'
          : author?.full_name || 'Unknown user',

      author_role: post.is_official ? 'official' : role,

      author_avatar: isOrganization
        ? organization.logo || null
        : scholarPhotos[post.author_id] ||
          author?.avatar_url ||
          null,
    };
  });
}


// Create a post for the currently authenticated user.

export async function createPost({
  content,
  imageFile = null,
  isOfficial = false,
}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to publish a post.");

  let mediaUrls = [];
  let uploadedPath = null;

  // Upload image to Supabase Storage when one is selected.
  if (imageFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Only JPG, PNG and WebP images are allowed.");
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error("Image must be smaller than 10 MB.");
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { data: uploadData, error: uploadError } =
      await supabase.storage
        .from("post-media")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

    if (uploadError) throw uploadError;

    uploadedPath = uploadData.path;

    const { data: publicData } = supabase.storage
      .from("post-media")
      .getPublicUrl(uploadedPath);

    mediaUrls = [publicData.publicUrl];
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content: content.trim(),
      media_urls: mediaUrls,
      is_official: isOfficial,
    })
    .select()
    .single();

  if (error) {
    // Remove the uploaded file if saving the post fails.
    if (uploadedPath) {
      await supabase.storage.from("post-media").remove([uploadedPath]);
    }

    throw error;
  }

  return data;
}



// Update an existing post's content and optionally its image.
export async function updatePost(postId, {
  content,
  imageFile = null,
  removeImage = false,
}) {
  if (!content?.trim()) {
    throw new Error("Post content cannot be empty.");
  }

  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("media_urls")
    .eq("id", postId)
    .single();

  if (fetchError) throw fetchError;

  let mediaUrls = existingPost.media_urls || [];
  let uploadedPath = null;
  let oldImagePath = null;

  // Replace the existing image if a new image is selected.
  if (imageFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Only JPG, PNG and WebP images are allowed.");
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error("Image must be smaller than 10 MB.");
    }

    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("You must be logged in.");

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    uploadedPath = uploadData.path;

    const { data: publicData } = supabase.storage
      .from("post-media")
      .getPublicUrl(uploadedPath);

    mediaUrls = [publicData.publicUrl];
  } else if (removeImage) {
    mediaUrls = [];
  }

  // Remember the old image path for cleanup after a successful update.
  if (imageFile || removeImage) {
    const oldUrl = existingPost.media_urls?.[0];

    if (oldUrl) {
      try {
        const url = new URL(oldUrl);
        const marker = "/post-media/";
        const index = url.pathname.indexOf(marker);

        if (index !== -1) {
          oldImagePath = decodeURIComponent(
            url.pathname.slice(index + marker.length)
          );
        }
      } catch {
        oldImagePath = null;
      }
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      content: content.trim(),
      media_urls: mediaUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    if (uploadedPath) {
      await supabase.storage.from("post-media").remove([uploadedPath]);
    }

    throw error;
  }

  // Delete the previous image only after the database update succeeds.
  if (oldImagePath) {
    const { error: cleanupError } = await supabase.storage
      .from("post-media")
      .remove([oldImagePath]);

    if (cleanupError) {
      console.error("Old post image cleanup failed:", cleanupError);
    }
  }

  return data;
}


// Update a post's publication status.
export async function updatePostStatus(postId, status) {
  const allowedStatuses = ['published', 'draft', 'archived'];

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid post status.');
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Delete a post.
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}
