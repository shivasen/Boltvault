/*
# [Fix] Correct Media Deletion Trigger
[This script corrects an error in a previous migration by properly defining the function and trigger responsible for automatically deleting files from storage when a media post is deleted. It ensures that the function exists before the trigger is created.]

## Query Description: [This operation is safe to run. It drops and recreates a database function and a trigger to fix a dependency issue. It ensures that when you delete a media record from your database, the corresponding file in Supabase Storage is also automatically deleted. There is no risk to existing data.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Drops and recreates the function: `public.handle_deleted_media()`
- Drops and recreates the trigger: `on_media_deleted` on the `public.media` table

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [None]
- Triggers: [Modified]
- Estimated Impact: [Negligible. The trigger only fires on DELETE operations on the media table.]
*/

-- Drop the trigger and function if they exist to ensure a clean slate
DROP TRIGGER IF EXISTS on_media_deleted ON public.media;
DROP FUNCTION IF EXISTS public.handle_deleted_media();

-- Create the function to handle media deletion from storage
CREATE OR REPLACE FUNCTION public.handle_deleted_media()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the old row has a storage path
  IF OLD.storage_path IS NOT NULL THEN
    -- Remove the object from Supabase Storage
    PERFORM storage.delete_object('media', OLD.storage_path);
  END IF;
  RETURN OLD;
END;
$$;

-- Create the trigger to call the function after a media record is deleted
CREATE TRIGGER on_media_deleted
AFTER DELETE ON public.media
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_media();
