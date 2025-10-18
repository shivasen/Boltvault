/*
# [DB MIGRATION] Add Power Features: Advanced Search & Bulk Delete

This migration script prepares the database for major new application features by enabling advanced search capabilities and adding functions for efficient bulk operations.

## Query Description:
This script performs the following actions:
1.  **Enables `pg_trgm` Extension:** Installs a PostgreSQL extension for "trigram" matching, which is essential for implementing efficient fuzzy text search (i.e., searching with typos).
2.  **Creates `search_media_advanced` Function:** Adds a new database function to perform a comprehensive search across media titles and character names using the `pg_trgm` similarity feature. This is much more powerful than a simple `LIKE` search.
3.  **Creates `delete_media_bulk` Function:** Adds a new database function that can delete multiple media items and their associated storage files in a single, efficient transaction based on an array of IDs.

These changes are structural and add new functionality. They do not modify or delete any existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Functions can be dropped and the extension can be disabled)

## Structure Details:
- **Extensions:** `pg_trgm` will be enabled.
- **Functions:** `search_media_advanced(text)`, `delete_media_bulk(uuid[])` will be created.
- **Indexes:** None added in this step, but this prepares for them.

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: The new functions are owned by `postgres` and are defined with `SECURITY DEFINER` to run with the permissions of the function owner, but they internally check for the `auth.uid()` to ensure users can only affect their own data.

## Performance Impact:
- The new functions are designed for high performance. `pg_trgm` can significantly speed up text searches if GIN indexes are added later. Bulk deletion is much faster than individual client-side requests.
*/

-- Step 1: Enable the pg_trgm extension for fuzzy string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create an advanced search function
CREATE OR REPLACE FUNCTION search_media_advanced(search_term text)
RETURNS SETOF media
LANGUAGE plpgsql
AS $$
DECLARE
    auth_user_id uuid := auth.uid();
BEGIN
    -- This function uses similarity search, which is more effective than ILIKE for typos.
    -- A threshold of 0.2 provides a good balance for finding relevant matches.
    RETURN QUERY
    SELECT m.*
    FROM media m
    LEFT JOIN characters c ON m.character_id = c.id
    WHERE 
        m.user_id = auth_user_id
        AND (
            similarity(m.name, search_term) > 0.2
            OR similarity(c.name, search_term) > 0.2
            OR m.tags @> ARRAY[search_term]
        )
    ORDER BY
        -- Prioritize more similar results
        GREATEST(similarity(m.name, search_term), similarity(c.name, search_term)) DESC,
        m.created_at DESC;
END;
$$;


-- Step 3: Create a function for bulk deleting media and associated storage files
CREATE OR REPLACE FUNCTION delete_media_bulk(media_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    auth_user_id uuid := auth.uid();
    r RECORD;
    object_paths text[];
BEGIN
    -- First, find all the storage object paths for the given media IDs that belong to the current user.
    -- This ensures users can only delete their own files.
    SELECT array_agg(path)
    INTO object_paths
    FROM (
        SELECT (storage.get_path_from_url(url)) as path
        FROM media
        WHERE id = ANY(media_ids)
        AND user_id = auth_user_id
        AND is_upload = true -- Only attempt to delete files that were uploaded
    ) AS paths
    WHERE path IS NOT NULL;

    -- If there are files to delete in storage, delete them.
    IF array_length(object_paths, 1) > 0 THEN
        PERFORM storage.delete_objects('media', object_paths);
    END IF;

    -- Finally, delete the media records from the database.
    DELETE FROM media
    WHERE id = ANY(media_ids)
    AND user_id = auth_user_id;
END;
$$;
