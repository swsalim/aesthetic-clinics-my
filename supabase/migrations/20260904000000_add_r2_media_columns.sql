-- Additive R2 columns; keep ImageKit/legacy columns untouched.
-- Apply manually in Supabase SQL editor (or via supabase db push).

ALTER TABLE clinic_images
  ADD COLUMN IF NOT EXISTS r2_key text,
  ADD COLUMN IF NOT EXISTS r2_url text;

ALTER TABLE clinic_doctor_images
  ADD COLUMN IF NOT EXISTS r2_key text,
  ADD COLUMN IF NOT EXISTS r2_url text;

ALTER TABLE areas
  ADD COLUMN IF NOT EXISTS r2_key text,
  ADD COLUMN IF NOT EXISTS r2_url text;

ALTER TABLE states
  ADD COLUMN IF NOT EXISTS r2_key text,
  ADD COLUMN IF NOT EXISTS r2_url text;

-- Allow R2-only inserts (ImageKit columns retained but unused for new uploads).
ALTER TABLE clinic_images
  ALTER COLUMN image_url DROP NOT NULL,
  ALTER COLUMN imagekit_file_id DROP NOT NULL;

ALTER TABLE clinic_doctor_images
  ALTER COLUMN image_url DROP NOT NULL,
  ALTER COLUMN imagekit_file_id DROP NOT NULL;
