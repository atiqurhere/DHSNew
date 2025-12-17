import { supabase } from '../lib/supabase';

/**
 * Get the public URL for a profile picture from Supabase Storage
 * @param {string} profilePicturePath - The path to the profile picture in storage (e.g., "avatars/user-id.jpg")
 * @returns {string} - The public URL or a default avatar URL
 */
export const getProfilePictureUrl = (profilePicturePath) => {
  // If no profile picture, return default avatar
  if (!profilePicturePath || profilePicturePath === '/default-avatar.png') {
    return '/default-avatar.png';
  }

  // If it's already a full URL, return it
  if (profilePicturePath.startsWith('http')) {
    return profilePicturePath;
  }

  // Remove leading slash if present
  const cleanPath = profilePicturePath.startsWith('/') 
    ? profilePicturePath.substring(1) 
    : profilePicturePath;

  // If path starts with 'uploads/', it's an old path - return default
  if (cleanPath.startsWith('uploads/')) {
    return '/default-avatar.png';
  }

  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(cleanPath);

  return data?.publicUrl || '/default-avatar.png';
};

/**
 * Get the public URL for an uploaded file from Supabase Storage
 * @param {string} filePath - The path to the file in storage
 * @param {string} bucket - The storage bucket name (default: 'uploads')
 * @returns {string} - The public URL or null
 */
export const getFileUrl = (filePath, bucket = 'uploads') => {
  if (!filePath) return null;

  // If it's already a full URL, return it
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') 
    ? filePath.substring(1) 
    : filePath;

  // If path starts with 'uploads/', remove it (old Express path)
  const storagePath = cleanPath.startsWith('uploads/') 
    ? cleanPath.substring(8) 
    : cleanPath;

  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return data?.publicUrl || null;
};
