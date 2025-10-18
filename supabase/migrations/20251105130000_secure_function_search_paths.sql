/*
# [SECURITY] Secure Function Search Paths
This migration secures existing database functions by setting a fixed `search_path`. This mitigates a security risk where a malicious user could potentially create objects in other schemas to hijack function execution.

## Query Description:
This operation alters two existing functions: `delete_user()` and `handle_new_user()`. It sets their `search_path` to `public`, ensuring they only look for objects within the `public` schema. This change is non-destructive and improves the security posture of your database. There is no impact on existing data.

## Metadata:
- Schema-Category: ["Security", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Functions affected:
  - `public.delete_user()`
  - `public.handle_new_user()`

## Security Implications:
- RLS Status: Not changed.
- Policy Changes: No.
- Auth Requirements: This change hardens security for authenticated user actions (account deletion and creation).

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible performance impact. May slightly improve function execution speed by narrowing the search scope.
*/

-- Secure the `delete_user` function
ALTER FUNCTION public.delete_user()
SET search_path = 'public';

-- Secure the trigger function that handles new user profile creation
ALTER FUNCTION public.handle_new_user()
SET search_path = 'public';
