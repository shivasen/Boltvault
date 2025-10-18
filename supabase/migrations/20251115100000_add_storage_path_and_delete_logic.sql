/*
          # [Operation Name]
          Add Storage Path and Improve Deletion Logic

          [This migration prepares the database for direct file uploads by adding a column to track storage paths and updating deletion functions to prevent orphaned files.]

          ## Query Description: [This operation adds a `storage_path` column to the `media` table. It also updates the `delete_media_batch` and `delete_user` functions to ensure that when a database record is deleted, the corresponding file is also removed from Supabase Storage. This is a non-destructive change to existing data but is critical for future data integrity.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - `public.media`: Adds column `storage_path` (TEXT).
          - `public.delete_media_batch()`: Function is replaced to include deleting objects from `storage.objects`.
          - `public.delete_user()`: Function is replaced to include deleting all of a user's objects from `storage.objects`.
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: Functions remain `SECURITY DEFINER` to interact with storage and auth schemas securely.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. Deletion operations will be slightly longer as they now include a call to storage, but this is necessary for data consistency.
          */

-- Add storage_path column to the media table to track uploaded file paths.
ALTER TABLE public.media
ADD COLUMN storage_path TEXT;

-- Update the batch deletion function to also remove files from Supabase Storage.
CREATE OR REPLACE FUNCTION delete_media_batch(media_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  paths_to_delete TEXT[];
  user_id_check UUID;
BEGIN
  -- Ensure all media items belong to the currently authenticated user.
  SELECT auth.uid() INTO user_id_check;

  IF NOT EXISTS (
    SELECT 1 FROM public.media
    WHERE id = ANY(media_ids) AND user_id != user_id_check
  ) THEN
    -- Collect all storage paths for the media items that are about to be deleted.
    SELECT array_agg(storage_path)
    INTO paths_to_delete
    FROM public.media
    WHERE id = ANY(media_ids) AND user_id = user_id_check AND storage_path IS NOT NULL;

    -- Delete the records from the media table.
    DELETE FROM public.media
    WHERE id = ANY(media_ids) AND user_id = user_id_check;

    -- If any storage paths were found, delete the corresponding files from the 'media' bucket.
    IF array_length(paths_to_delete, 1) > 0 THEN
      PERFORM storage.delete_objects('media', paths_to_delete);
    END IF;
  ELSE
    -- If the user tries to delete media they don't own, raise an exception.
    RAISE EXCEPTION 'Permission denied: You do not own one or more of the specified media items.';
  END IF;
END;
$$;

-- Update the user deletion function to also clean up all their files from Supabase Storage.
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_delete UUID := auth.uid();
  user_files TEXT[];
BEGIN
  -- Collect all storage paths for the user who is being deleted.
  SELECT array_agg(storage_path)
  INTO user_files
  FROM public.media
  WHERE user_id = user_id_to_delete AND storage_path IS NOT NULL;

  -- If the user has any uploaded files, delete them from the 'media' bucket.
  IF array_length(user_files, 1) > 0 THEN
    PERFORM storage.delete_objects('media', user_files);
  END IF;

  -- Finally, delete the user record from the auth.users table.
  -- This will cascade and delete their profile and other related data.
  DELETE FROM auth.users
  WHERE id = user_id_to_delete;
END;
$$;
