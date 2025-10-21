--
-- Name: Harden Database Functions; Type: MIGRATION; Schema: -; Owner: -
--

/*
  # [Security Hardening]
  This migration secures existing database functions by setting a fixed `search_path`.

  ## Query Description:
  This operation modifies the configuration of several functions to prevent a security vulnerability known as "search path hijacking." By explicitly setting the `search_path` for each function, we ensure that they only look for objects (like tables or other functions) in schemas we trust (`public`, `storage`, etc.). This is a non-destructive security enhancement and does not affect your data.

  ## Metadata:
  - Schema-Category: ["Safe", "Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Modifies `search_path` for functions: `handle_new_user`, `delete_user`, `handle_deleted_media`, `search_media_fuzzy`, `delete_media_batch`.

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: None
  - Mitigates: Search Path Hijacking vulnerability.

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible. May slightly improve function execution speed in some cases.
*/

-- Secure the trigger function that creates a user profile.
ALTER FUNCTION public.handle_new_user()
    SET search_path = public;

-- Secure the RPC function for deleting a user account.
ALTER FUNCTION public.delete_user()
    SET search_path = public;

-- Secure the trigger function that cleans up Supabase Storage.
-- It needs access to the `storage` schema to work correctly.
ALTER FUNCTION public.handle_deleted_media()
    SET search_path = public, storage;

-- Secure the fuzzy search RPC function.
-- It needs access to `pg_catalog` for text search configurations.
ALTER FUNCTION public.search_media_fuzzy(search_term text)
    SET search_path = public, pg_catalog, pg_temp;

-- Secure the batch deletion RPC function.
ALTER FUNCTION public.delete_media_batch(media_ids uuid[])
    SET search_path = public;
