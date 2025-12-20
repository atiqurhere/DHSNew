# Database Setup

This folder contains all SQL files needed to set up your DHS Healthcare database in Supabase.

## Files

1. **schema.sql** - Complete database schema with all tables, indexes, and helper functions
2. **security.sql** - Row Level Security (RLS) policies for data protection
3. **seed.sql** - Sample data for services and chatbot responses
4. **admin.sql** - Create your first admin user

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (choose a name like "dhs-healthcare")
3. Wait for the database to be provisioned (2-3 minutes)
4. Save your project URL and anon key

### 2. Run SQL Files in Order

Open the Supabase SQL Editor and run these files in order:

```sql
-- Step 1: Create database schema
-- Copy and paste contents of schema.sql

-- Step 2: Apply security policies
-- Copy and paste contents of security.sql
-- NOTE: RLS is disabled on users table to allow registration

-- Step 3: Add sample data (optional)
-- Copy and paste contents of seed.sql

-- Step 4: Create admin user
-- Edit admin.sql with your email, then run it
```

> [!IMPORTANT]
> **Row Level Security (RLS) on Users Table:**
> RLS is currently **disabled** on the `users` table to allow user registration to work properly. This is because the registration flow inserts user profiles using the anon key, which fails RLS checks.
> 
> For production, you may want to:
> 1. Keep RLS disabled on users table (simpler, still secure with Supabase Auth)
> 2. OR implement a database trigger to handle user creation
> 3. OR use Supabase Edge Functions for registration
> 
> All other tables have RLS enabled with proper policies.

> [!NOTE]
> The schema.sql file now includes all necessary tables and columns. If you previously ran an older version, you can safely drop all tables and run the new schema.sql, or manually add missing columns by comparing with the current schema.

### 3. Configure Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `uploads`
3. Make it public
4. Add upload policies for authenticated users

### 4. Update Environment Variables

In your `client/.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Verification

After setup, verify your database:

1. Check that all tables exist in the Table Editor
2. Verify RLS is enabled on all tables
3. Confirm sample services are visible (if you ran seed.sql)
4. Test login with your admin account

## Troubleshooting

**Issue: "Could not find the 'password_hash' column" or similar errors**
- **Cause**: Database was created with old schema
- **Solution**: Drop all tables and run the updated `schema.sql`
- **Alternative**: Manually add missing columns by comparing your tables with the current schema.sql

**Issue: "column page_content.slug does not exist"**
- **Cause**: Missing columns in page_content table
- **Solution**: Drop the page_content table and re-run `schema.sql`, or manually add the slug column:
  ```sql
  ALTER TABLE public.page_content ADD COLUMN slug VARCHAR(100) UNIQUE;
  ALTER TABLE public.page_content ADD COLUMN is_published BOOLEAN DEFAULT true;
  ```

**Issue: Can't insert data**
- **Cause**: RLS policies are blocking
- **Solution**: 
  1. Check that RLS policies are applied correctly
  2. Verify you're logged in as the correct user role
  3. Try temporarily disabling RLS for testing:
     ```sql
     ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
     ```

**Issue: Services not showing**
- **Solution**: Run seed.sql to populate sample data
- **Check**: Verify `is_active = true` for services

**Issue: Admin can't access admin panel**
- **Solution**: 
  1. Verify the user's role is set to 'admin' in the users table
  2. Run admin.sql with your email
  3. Logout and login again

**Issue: Schema cache errors**
- **Solution**: Refresh the schema cache in Supabase:
  ```sql
  NOTIFY pgrst, 'reload schema';
  ```
- **Alternative**: Restart your Supabase project from the dashboard
