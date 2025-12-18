-- Fix page_content table schema
-- Add missing slug column

-- First, check what columns exist
DO $$ 
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_content' AND column_name = 'slug'
    ) THEN
        ALTER TABLE page_content ADD COLUMN slug TEXT;
    END IF;

    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_content' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE page_content ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing rows with slugs based on page_type or id
UPDATE page_content 
SET slug = LOWER(REPLACE(COALESCE(page_type, 'page-' || id::text), ' ', '-'))
WHERE slug IS NULL;

-- Make slug NOT NULL after updating
ALTER TABLE page_content 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug (drop first if exists)
DO $$ 
BEGIN
    ALTER TABLE page_content ADD CONSTRAINT page_content_slug_unique UNIQUE (slug);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);

-- Insert default pages if they don't exist (only page_type and slug)
INSERT INTO page_content (page_type, slug, is_published)
VALUES 
  ('about', 'about', true),
  ('contact', 'contact', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'page_content'
ORDER BY ordinal_position;
