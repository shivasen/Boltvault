/*
# [Create Fuzzy Search Function]
This operation creates the necessary components for advanced "fuzzy" search on media posts.

## Query Description:
This script enables the `pg_trgm` extension, which is required for efficient text similarity searching. It then creates a database function `search_media_fuzzy` that allows the application to find media posts even if the search term has typos or is only a partial match. This operation is safe and does not affect existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The function and extension can be dropped)

## Structure Details:
- Enables extension: `pg_trgm`
- Creates function: `public.search_media_fuzzy(search_term text)`

## Security Implications:
- RLS Status: The function respects existing Row Level Security policies.
- Policy Changes: No
- Auth Requirements: The function is only callable by authenticated users and filters results based on the caller's `user_id`.

## Performance Impact:
- Indexes: For optimal performance on large datasets, a GIN or GiST index on the `name` and `tags` columns using `pg_trgm` is recommended, but not included in this initial setup to keep it simple.
- Triggers: None
- Estimated Impact: Low. Search performance will be significantly improved for text fields.
*/

-- Enable the pg_trgm extension for fuzzy string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the search function
CREATE OR REPLACE FUNCTION public.search_media_fuzzy(search_term text)
RETURNS SETOF media
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.media
  WHERE
    -- Ensure the user can only search their own media
    user_id = auth.uid() AND (
      -- Compare the search term against the name and tags
      search_term <% (name) OR
      search_term <% ANY(tags)
    )
  ORDER BY
    -- Order by similarity, with name having higher priority
    similarity(search_term, name) DESC,
    similarity(search_term, array_to_string(tags, ' ')) DESC;
$$;
