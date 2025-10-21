/*
# [Feature] Add Storage Path and Cleanup Trigger
This migration prepares the database for direct file uploads by adding a `storage_path` column to the `media` table and setting up an automated cleanup process.

## Query Description:
This script performs the following actions:
1.  **Adds `storage_path` column:** A new text column is added to the `media` table. This will store the path of the file in Supabase Storage, allowing us to link the database record to the actual stored file.
2.  **Creates `delete_storage_object` function:** This function is designed to be called by a trigger. When executed, it takes the `storage_path` of a deleted media record and removes the corresponding file from the 'media' bucket in Supabase Storage.
3.  **Creates `on_media_deleted` trigger:** This trigger is attached to the `media` table and will automatically execute the `delete_storage_object` function *after* a row is deleted. This ensures that uploaded files do not become orphaned when a media post is removed from the database.

These changes are non-destructive to existing data and are essential for managing uploaded files.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Column can be dropped, trigger and function can be removed)

## Structure Details:
- **Table Modified:** `public.media`
  - **Column Added:** `storage_path` (TEXT)
- **Function Created:** `public.delete_storage_object()`
- **Trigger Created:** `on_media_deleted` on `public.media`

## Security Implications:
- RLS Status: Unchanged. The new function and trigger operate under the security context of the user performing the delete operation, respecting existing RLS policies.
- Policy Changes: No
- Auth Requirements: User must have permission to delete from the `media` table.

## Performance Impact:
- Indexes: None added.
- Triggers: One `AFTER DELETE` trigger added. This will add a very small overhead to delete operations on the `media` table, which is negligible for this use case.
- Estimated Impact: Low.
*/

-- 1. Add storage_path column to media table
ALTER TABLE public.media
ADD COLUMN storage_path TEXT;

-- 2. Create a function to delete the file from storage
CREATE OR REPLACE FUNCTION public.delete_storage_object()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.storage_path IS NOT NULL THEN
    PERFORM storage.delete_object('media', OLD.storage_path);
  END IF;
  RETURN OLD;
END;
$$;

-- 3. Create a trigger to call the function on delete
CREATE TRIGGER on_media_deleted
AFTER DELETE ON public.media
FOR EACH ROW
EXECUTE FUNCTION public.delete_storage_object();
