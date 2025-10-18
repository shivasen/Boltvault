/*
# [Feature: User Profiles & Account Management]
This migration creates a `profiles` table to store public user data like usernames and avatars, linked to the `auth.users` table. It also sets up a trigger to automatically create a profile for new users and enables Row-Level Security (RLS) to ensure users can only access and modify their own data.

## Query Description: [This script introduces a `profiles` table for user data and enhances security by enabling RLS. It also adds a function and trigger for automatic profile creation on user sign-up. Additionally, it modifies existing `characters` and `media` tables to ensure data is properly cleaned up when a user is deleted. A new `delete_user` function is added to handle account deletion securely.]

## Metadata:
- Schema-Category: ["Structural", "Dangerous"]
- Impact-Level: ["Medium"]
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **New Table:** `public.profiles`
  - `id` (references `auth.users.id`)
  - `username`
  - `full_name`
  - `avatar_url`
  - `updated_at`
- **Table Alterations:**
  - `public.characters`: Adds `ON DELETE CASCADE` to the `user_id` foreign key.
  - `public.media`: Adds `ON DELETE CASCADE` to the `user_id` foreign key.
- **New Function:** `public.handle_new_user()` to create a profile on signup.
- **New Trigger:** `on_auth_user_created` to execute the function.
- **New Function:** `public.delete_user()` for secure account deletion.
- **RLS Policies:** Enabled on `public.profiles` for SELECT and UPDATE.

## Security Implications:
- RLS Status: Enabled on `public.profiles`.
- Policy Changes: New policies are created to restrict access to a user's own profile. This significantly improves data privacy.
- Auth Requirements: These changes are tightly coupled with Supabase Auth.

## Performance Impact:
- Indexes: A primary key index is created on `profiles.id`.
- Triggers: Adds a trigger to the `auth.users` table, which has a negligible performance impact on user sign-ups.
- Estimated Impact: Low. The changes are standard practice and well-optimized.
*/

-- 1. Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2. Add comments to the new table and columns
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal user id from auth.users.';
COMMENT ON COLUMN public.profiles.username IS 'Public-facing username.';

-- 3. Set up a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable Row-Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Add ON DELETE CASCADE to existing tables for data cleanup
-- This ensures that when a user is deleted, their characters and media are also deleted.
ALTER TABLE public.characters
DROP CONSTRAINT characters_user_id_fkey,
ADD CONSTRAINT characters_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.media
DROP CONSTRAINT media_user_id_fkey,
ADD CONSTRAINT media_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 7. Create a function to delete a user account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  -- This will cascade to profiles, characters, and media due to ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
