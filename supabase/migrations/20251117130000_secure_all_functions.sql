/*
# [Lockdown All Function Security]
This operation sets a fixed `search_path` for all custom database functions to enhance security.

## Query Description:
This is a security best practice that prevents potential vulnerabilities where a malicious user could temporarily create schemas or functions with the same name as system functions, leading to unintended code execution. This change is safe and does not affect existing data or functionality.

## Metadata:
- Schema-Category: ["Safe", "Security"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies `search_path` for functions: `delete_user`, `handle_deleted_media`, `search_media_fuzzy`, and `delete_media_batch`.

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges to run]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [None]
*/
ALTER FUNCTION public.delete_user() SET search_path = public;
ALTER FUNCTION public.handle_deleted_media() SET search_path = public;
ALTER FUNCTION public.search_media_fuzzy(search_term text) SET search_path = public;
ALTER FUNCTION public.delete_media_batch(media_ids uuid[]) SET search_path = public;
