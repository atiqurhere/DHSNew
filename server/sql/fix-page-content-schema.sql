-- Fix page_content table schema
-- Add missing slug column

-- Add slug column if it doesn't exist
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add is_published column if it doesn't exist
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing rows with slugs based on page_type or id
UPDATE page_content 
SET slug = LOWER(REPLACE(COALESCE(page_type, 'page-' || id::text), ' ', '-'))
WHERE slug IS NULL;

-- Make slug NOT NULL after updating
ALTER TABLE page_content 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug
ALTER TABLE page_content
ADD CONSTRAINT page_content_slug_unique UNIQUE (slug);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);

-- Insert default pages if they don't exist
INSERT INTO page_content (page_type, slug, content, is_published)
VALUES 
  ('about', 'about', '{"sections": []}', true),
  ('contact', 'contact', '{"sections": []}', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'page_content'
ORDER BY ordinal_position;
