/*
          # [Operation] Add Embed Media Support
          Adds columns to the `media` table to support embedding content from external sources like Google Drive or YouTube.

          ## Query Description: This operation adds two new columns to the `media` table:
          - `is_embed` (boolean): A flag to identify if the media is an embed code.
          - `thumbnail_url` (text): A field to store a URL for the thumbnail image, used for gallery previews of embedded content.
          This is a non-destructive operation and will not affect existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table Modified: `media`
          - Columns Added: `is_embed`, `thumbnail_url`
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None added
          - Triggers: None added
          - Estimated Impact: Negligible performance impact.
          */

ALTER TABLE public.media
ADD COLUMN is_embed BOOLEAN DEFAULT FALSE,
ADD COLUMN thumbnail_url TEXT;
