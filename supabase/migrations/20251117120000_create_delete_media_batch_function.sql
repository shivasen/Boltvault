/*
# [Function] Create `delete_media_batch`
Creates a function to allow authenticated users to delete multiple media items in a single request.

## Query Description:
This operation creates a new PostgreSQL function `delete_media_batch` that accepts an array of UUIDs. It deletes rows from the `media` table where the `id` matches any of the provided UUIDs. This function is designed for bulk deletion operations and relies on existing Row Level Security (RLS) policies on the `media` table to ensure users can only delete their own content. This is a safe operation as it only adds a function and does not modify or delete any data.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (The function can be dropped)

## Structure Details:
- Function Name: `public.delete_media_batch`
- Parameters: `media_ids UUID[]`

## Security Implications:
- RLS Status: The function's security relies on the existing RLS policies on the `public.media` table.
- Policy Changes: No
- Auth Requirements: The calling user must be authenticated.

## Performance Impact:
- Indexes: Uses the primary key index on the `media` table for efficient deletion.
- Triggers: The existing `on_media_deleted` trigger will fire for each deleted row, cleaning up associated storage files.
- Estimated Impact: Low. Performance depends on the number of items being deleted at once.
*/
CREATE OR REPLACE FUNCTION public.delete_media_batch(media_ids UUID[])
RETURNS void
LANGUAGE sql
SECURITY INVOKER -- IMPORTANT: The function runs with the permissions of the user calling it, enforcing RLS correctly.
AS $$
  DELETE FROM public.media
  WHERE id = ANY(media_ids);
$$;
