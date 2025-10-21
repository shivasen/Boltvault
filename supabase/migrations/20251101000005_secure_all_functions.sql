/*
# [SECURITY] Secure All Function Search Paths
This migration secures all custom database functions by setting a non-mutable search_path. This prevents a class of security vulnerabilities where a malicious user could potentially alter the behavior of functions by creating objects (like tables or functions) with the same names in a different schema.

## Query Description: 
This operation is a non-destructive security enhancement. It modifies the configuration of existing functions to make them more secure. It does not alter any data or table structures.

## Metadata:
- Schema-Category: ["Safe", "Security"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (by unsetting the search_path)

## Structure Details:
- Modifies the following functions:
  - public.handle_new_user()
  - public.delete_user()
  - public.search_media_fuzzy(text)
  - public.delete_media_batch(uuid[])
  - public.handle_deleted_media()

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Mitigates: Search Path Hijacking vulnerabilities.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. This is a configuration change.
*/

ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.delete_user() SET search_path = 'public';
ALTER FUNCTION public.search_media_fuzzy(search_term text) SET search_path = 'public';
ALTER FUNCTION public.delete_media_batch(media_ids uuid[]) SET search_path = 'public';
ALTER FUNCTION public.handle_deleted_media() SET search_path = 'public';
