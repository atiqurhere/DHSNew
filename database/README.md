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

-- Step 3: Add sample data (optional)
-- Copy and paste contents of seed.sql

-- Step 4: Create admin user
-- Edit admin.sql with your email, then run it
```

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

**Issue: Can't insert data**
- Check that RLS policies are applied correctly
- Verify you're logged in as the correct user role

**Issue: Services not showing**
- Run seed.sql to populate sample data
- Check that `is_active = true` for services

**Issue: Admin can't access admin panel**
- Verify the user's role is set to 'admin' in the users table
- Check RLS policies allow admin access
