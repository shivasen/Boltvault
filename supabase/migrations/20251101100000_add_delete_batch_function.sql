/*
# [Function] public.delete_media_batch
Creates a function to delete multiple media items in a single RPC call, respecting user ownership.

## Query Description:
This operation creates a new PostgreSQL function `delete_media_batch` that accepts an array of UUIDs. It will delete rows from the `media` table where the `id` is in the provided array AND the `user_id` matches the currently authenticated user. This ensures users can only delete their own media. This is a safe, non-destructive operation on its own as it only defines a function.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The function can be dropped)

## Structure Details:
- Function: `public.delete_media_batch(media_ids UUID[])`

## Security Implications:
- RLS Status: Not directly applicable to function creation.
- Policy Changes: No.
- Auth Requirements: The function internally checks `auth.uid()` to enforce ownership, which is a security best practice.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Low. The function will perform as well as individual delete statements.
*/

CREATE OR REPLACE FUNCTION public.delete_media_batch(media_ids UUID[])
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.media
  WHERE id = ANY(media_ids) AND user_id = auth.uid();
END;
$$;
