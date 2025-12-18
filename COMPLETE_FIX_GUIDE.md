# URGENT FIX - Complete Database and Code Solution

## Issue Summary
1. **Profile fetch timing out** - Supabase RLS policies blocking queries
2. **Old build still cached** - Browser showing old version ✅ FIXED
3. **Profile photo not saving** - Storage RLS policies missing
4. **Page content error** - Missing slug column in page_content table

---

## STEP 1: Clear Your Browser Cache (DO THIS FIRST!)

### Option A - Hard Refresh (Try This First):
- **Windows**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`

### Option B - Clear Cache Completely:
1. Open Chrome DevTools (F12)
2. Right-click the **Reload button** (next to address bar)
3. Select **"Empty Cache and Hard Reload"**

### Option C - Incognito/Private Window:
1. Open a new Incognito/Private window
2. Go to your site
3. This bypasses all cache

**You should see `index-CkFdK127.js` (new) instead of `index-BDC3mm9e.js` (old)**

---

## STEP 2: Fix Supabase Database (CRITICAL!)

Go to: **https://supabase.com/dashboard** → Your Project → **SQL Editor**

### Run This Complete SQL Script:

```sql
-- ============================================
-- COMPLETE DATABASE FIX FOR DHS HEALTHCARE
-- ============================================

-- 1. FIX USERS TABLE RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create optimized policies
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_select_all"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- 2. FIX STORAGE BUCKETS FOR PROFILE PHOTOS
-- ============================================

-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create storage policies
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);

-- 3. FIX PAGE_CONTENT TABLE
-- ============================================

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_content' AND column_name = 'slug'
    ) THEN
        ALTER TABLE page_content ADD COLUMN slug TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_content' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE page_content ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing rows with slugs
UPDATE page_content 
SET slug = LOWER(REPLACE(COALESCE(page_type, 'page-' || id::text), ' ', '-'))
WHERE slug IS NULL;

-- Make slug NOT NULL
ALTER TABLE page_content 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
DO $$ 
BEGIN
    ALTER TABLE page_content ADD CONSTRAINT page_content_slug_unique UNIQUE (slug);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);

-- Insert default pages
INSERT INTO page_content (page_type, slug, is_published)
VALUES 
  ('about', 'about', true),
  ('contact', 'contact', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Add index on users.id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. VERIFY SETUP
-- ============================================
SELECT 
  'Users Table Policies' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users'
UNION ALL
SELECT 
  'Storage Policies' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects';
```

**Expected Result:** Should show:
- `Users Table Policies: 4`
- `Storage Policies: 4`

---

## STEP 3: Verify Your Site Works

After running the SQL and clearing cache:

1. **Reload the page** (should show new build: `index-CkFdK127.js`)
2. **Login**
3. **Check console** - should see:
   ```
   ✅ User profile loaded: Md. Atiqur Rahman
   ⏭️ Skipping SIGNED_IN - user already loaded
   ```
4. **Try uploading profile photo** - should work now!
5. **Switch tabs** - NO timeout errors!

---

## Still Not Working?

### If cache won't clear:
1. Open **Chrome Settings** → **Privacy** → **Clear browsing data**
2. Select **Cached images and files**
3. Time range: **Last 24 hours**
4. Click **Clear data**

### If profile still times out:
The database query is being blocked. After running the SQL:
1. Go to Supabase Dashboard → **Table Editor** → **users**
2. Click the **RLS** tab
3. You should see 4 policies listed

### If photo upload fails:
1. Go to Supabase Dashboard → **Storage** → **avatars** bucket
2. Check if bucket exists
3. Click **Policies** - should see 4 policies

---

## What This Fixes:

✅ **Profile fetch timeout** - Optimized RLS policies
✅ **Tab switch errors** - Code skips refetch when user exists  
✅ **Profile photo upload** - Storage bucket + policies created
✅ **Slow queries** - Added database indexes
✅ **Browser cache** - Instructions to clear

**Run the SQL NOW, then hard refresh your browser!**
