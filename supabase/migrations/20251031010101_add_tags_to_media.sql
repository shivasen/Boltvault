/*
# [Add 'tags' column to 'media' table]
This migration adds a new column named `tags` to the `media` table. This column is designed to store an array of text values, which will be used for tagging and filtering media posts.

## Query Description: [This operation adds a 'tags' column of type text array (text[]) to the 'media' table. It is a non-destructive structural change. Existing rows will have a NULL value for this new column, which is expected and handled by the application code.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: public.media
- Column Added: tags (type: text[])

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [The existing RLS policies on the 'media' table will apply to this new column as well.]

## Performance Impact:
- Indexes: [None added in this migration. An index on the 'tags' column (using GIN) could be added later if tag-based filtering performance becomes an issue.]
- Triggers: [None]
- Estimated Impact: [Low. The operation should be fast on tables of small to medium size.]
*/
ALTER TABLE public.media
ADD COLUMN tags text[];
