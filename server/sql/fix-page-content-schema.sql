-- Fix page_content table schema
-- Add missing slug column

-- Add slug column if it doesn't exist
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add is_published column if it doesn't exist
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing rows with slugs based on page_name or id
UPDATE page_content 
SET slug = LOWER(REPLACE(COALESCE(page_name, 'page-' || id::text), ' ', '-'))
WHERE slug IS NULL;

-- Make slug NOT NULL after updating
ALTER TABLE page_content 
ALTER COLUMN slug SET NOT NULL;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);

-- Insert default pages if they don't exist
INSERT INTO page_content (page_name, slug, content, is_published)
VALUES 
  ('About', 'about', '{"sections": []}', true),
  ('Contact', 'contact', '{"sections": []}', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'page_content'
ORDER BY ordinal_position;
