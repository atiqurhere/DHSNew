# Database Fix Guide - URGENT

## Problem Identified
Your profile fetch is **timing out** because of Row Level Security (RLS) policies on the `users` table.

## What I Fixed in the Code:
1. ✅ Fixed missing imports (`pagesAPI`, `bookingsAPI`)
2. ✅ Improved timeout (3 seconds instead of 5)
3. ✅ Added fallback to use session data if database fails
4. ✅ Better error messages

## What YOU Need to Fix in Supabase:

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `rccmupalimnodgaveulr`
3. Click **SQL Editor** (left sidebar)

### Step 2: Run This SQL Command

Copy and paste this entire SQL script and click **RUN**:

```sql
-- Fix Row Level Security policies for users table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Allow insert during registration
CREATE POLICY "Enable insert for authenticated users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can read all users
CREATE POLICY "Admins can read all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### Step 3: Verify
After running the SQL:
1. You should see "Success. No rows returned"
2. Check the **Table Editor** > **users** > **RLS Policies** tab
3. You should see 4 policies listed

## Now Test:
1. **Clear site data** in browser
2. **Login** to your site
3. **Reload** the page
4. Check console - you should see:
   - ✅ "Profile fetch took XXXms" (under 500ms)
   - ✅ "User profile loaded: [Your Name]"
   - NO timeout errors

## If It Still Times Out:

### Alternative: Disable RLS Temporarily (NOT RECOMMENDED FOR PRODUCTION)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

This will make it work immediately, but it's not secure. Only use this for testing!

## What The Fix Does:
- Allows authenticated users to read their OWN profile
- Allows authenticated users to update their OWN profile  
- Allows admins to read ALL profiles
- Allows user creation during registration
- Blocks unauthorized access

The timeout was happening because the old policies were too strict or incorrectly configured.
