/*
# [Initial Schema Setup]
This migration creates the core tables for the InstaGallery application, including `characters`, `media`, `tags`, and a join table `media_tags`. It also establishes relationships between them and sets up Row-Level Security (RLS) to ensure users can only access and manage their own data.

## Query Description:
This script is structural and safe to run on a new database. It does not modify or delete any existing data. It creates new tables and enables security policies. No backup is required for this initial setup.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the tables)

## Structure Details:
- **characters**: Stores character profiles (name, bio, etc.).
- **media**: Stores media items (images/videos) linked to characters.
- **tags**: Stores user-defined tags.
- **media_tags**: A join table to link multiple tags to multiple media items.

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Yes, new policies are created to restrict data access to the owner.
- Auth Requirements: Policies rely on `auth.uid()` to identify the current user.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default.
- Triggers: None.
- Estimated Impact: Low.
*/

-- 1. CHARACTERS TABLE
-- Stores character profiles linked to a user.
CREATE TABLE IF NOT EXISTS public.characters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL CHECK (char_length(name) > 0),
    profile_picture_url text,
    bio text,
    social_links jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own characters" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own characters" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own characters" ON public.characters FOR DELETE USING (auth.uid() = user_id);

-- 2. MEDIA TABLE
-- Stores media items, linked to a user and optionally a character.
CREATE TABLE IF NOT EXISTS public.media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    character_id uuid REFERENCES public.characters(id) ON DELETE SET NULL,
    name text NOT NULL CHECK (char_length(name) > 0),
    type text NOT NULL CHECK (type IN ('image', 'video')),
    url text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own media" ON public.media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own media" ON public.media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON public.media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON public.media FOR DELETE USING (auth.uid() = user_id);

-- 3. TAGS TABLE
-- Stores unique tags created by users.
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL CHECK (char_length(name) > 0),
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, name)
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- 4. MEDIA_TAGS JOIN TABLE
-- Links media items with tags in a many-to-many relationship.
CREATE TABLE IF NOT EXISTS public.media_tags (
    media_id uuid REFERENCES public.media(id) ON DELETE CASCADE NOT NULL,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (media_id, tag_id)
);
ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own media_tags" ON public.media_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own media_tags" ON public.media_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media_tags" ON public.media_tags FOR DELETE USING (auth.uid() = user_id);
