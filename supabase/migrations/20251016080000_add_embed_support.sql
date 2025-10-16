/*
# [Feature] Add Embeddable Media Support
This migration adds support for embedding media from external sources (like Google Drive, YouTube, etc.) using iframe codes.

## Query Description:
This script alters the `media` table to include two new columns:
1.  `is_embed`: A boolean flag to indicate if the media is an embed code.
2.  `thumbnail_url`: An optional text field to store a URL for a custom thumbnail, which is useful for displaying embedded content in the gallery grid.
Existing records will have `is_embed` set to `false` by default, ensuring no data is lost and the application continues to function with existing media.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table Modified: `public.media`
- Columns Added:
  - `is_embed` (BOOLEAN, NOT NULL, DEFAULT false)
  - `thumbnail_url` (TEXT, NULL)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible. The new columns have a low storage footprint.
*/

ALTER TABLE public.media
ADD COLUMN is_embed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN thumbnail_url TEXT;

COMMENT ON COLUMN public.media.is_embed IS 'If true, the url field contains an embed code instead of a direct link.';
COMMENT ON COLUMN public.media.thumbnail_url IS 'Optional URL for a thumbnail image, useful for embedded media.';
