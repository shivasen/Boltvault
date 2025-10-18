/*
  # [Enable Media Uploads with Supabase Storage]
  This migration sets up a dedicated, secure storage bucket for direct media uploads.

  ## Query Description:
  - **Creates a Bucket:** A new storage bucket named `media` is created to hold all user-uploaded files. It includes a 50MB file size limit and restricts uploads to common image and video types.
  - **Sets Public Access:** The bucket is made public so that generated file URLs can be easily viewed in the browser.
  - **Enforces Security Policies:** Row Level Security (RLS) policies are applied to control who can perform actions:
    - **View (SELECT):** Anyone can view files (necessary for public URLs).
    - **Upload (INSERT):** Only logged-in (authenticated) users can upload files into a folder corresponding to their user ID.
    - **Modify (UPDATE):** Only the user who originally uploaded the file can modify it.
    - **Delete (DELETE):** Only the user who originally uploaded the file can delete it.
  
  This ensures that while media is viewable, only the rightful owners can manage their own files.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (Policies and the bucket can be dropped manually)

  ## Structure Details:
  - Creates new bucket: `storage.buckets` -> `media`
  - Creates new policies on: `storage.objects` for the `media` bucket.

  ## Security Implications:
  - RLS Status: Enabled on `storage.objects` for the new bucket.
  - Policy Changes: Yes, new policies are created to secure the bucket.
  - Auth Requirements: Users must be authenticated to upload, update, or delete files.

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible. RLS checks add minimal overhead.
*/

-- 1. Create a public bucket for media files with size and type limits.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- 2. Secure the bucket with RLS policies.

-- Allow public read access to anyone.
CREATE POLICY "Allow public read access on media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload files into their own folder.
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to update their own files.
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'media'
);

-- Allow users to delete their own files.
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  auth.uid() = owner
);
