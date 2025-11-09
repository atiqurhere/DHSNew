# 🚀 QUICK SETUP GUIDE - Supabase Migration

## Prerequisites
- Node.js 16+ installed
- Supabase account created
- Git installed

## Step 1: Supabase Project Setup (15 minutes)

### 1.1 Create Supabase Project
```bash
1. Visit https://supabase.com
2. Click "New Project"
3. Choose your organization
4. Enter project name: "dhs-healthcare"
5. Enter a strong database password (SAVE THIS!)
6. Select region closest to you
7. Click "Create new project"
8. Wait 2-3 minutes for provisioning
```

### 1.2 Get API Credentials
```bash
1. Go to Project Settings (gear icon)
2. Click "API" in left menu
3. Copy "Project URL" - looks like: https://xxxxx.supabase.co
4. Copy "anon public" key - long string starting with "eyJ..."
```

### 1.3 Run Database Schema
```bash
1. In Supabase dashboard, click "SQL Editor" (left menu)
2. Click "New Query"
3. Open file: SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql
4. Copy ALL content and paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for success message
7. Click "New Query" again
8. Open file: SUPABASE_MIGRATION/02_ROW_LEVEL_SECURITY.sql
9. Copy ALL content and paste
10. Click "Run"
11. Verify all policies are created
```

### 1.4 Configure Storage
```bash
1. Click "Storage" in left menu
2. Click "Create a new bucket"
3. Name: "uploads"
4. Set to "Public bucket" ✓
5. Click "Create bucket"
6. Click on "uploads" bucket
7. Go to "Policies" tab
8. Add policy for authenticated uploads:
   - Name: "Authenticated users can upload"
   - Policy: SELECT "Authenticated" > INSERT
9. Add policy for public reads:
   - Name: "Public can read"
   - Policy: SELECT "Public" > SELECT
```

## Step 2: Local Development Setup (5 minutes)

### 2.1 Install Dependencies
```powershell
# Navigate to client directory
cd client

# Install packages (already done if you followed migration)
npm install

# Verify @supabase/supabase-js is installed
npm list @supabase/supabase-js
```

### 2.2 Configure Environment
```powershell
# Copy template
cp .env.template .env

# Edit .env file and add your credentials
# Use notepad or VS Code:
code .env
```

Paste your credentials:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Create First Admin User (IMPORTANT!)

### 3.1 Using Supabase Auth UI
```bash
1. In Supabase Dashboard, go to "Authentication"
2. Click "Add user" > "Create new user"
3. Email: your-admin@example.com
4. Password: Choose strong password
5. Click "Create user"
6. Confirm the user (toggle "Confirm email" to ON)
```

### 3.2 Make User Admin via SQL
```sql
1. Go to SQL Editor
2. Run this query (replace with your email):

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-admin@example.com';

3. Verify:

SELECT * FROM public.users WHERE role = 'admin';
```

### 3.3 Or Use Migration Script (If you have MongoDB data)
```powershell
# In root directory
node SUPABASE_MIGRATION/08_DATA_MIGRATION_SCRIPT.js
```

## Step 4: Test Your Setup (10 minutes)

### 4.1 Start Development Server
```powershell
# In client directory
npm run dev
```

### 4.2 Test Authentication
```
1. Open browser to http://localhost:5173
2. Click "Sign up"
3. Register as Patient:
   - Name: Test Patient
   - Email: patient@test.com
   - Password: test123456
   - Phone: +880123456789
4. Check for success message
5. Check Supabase Auth dashboard - should see new user
6. Check Database > users table - should see profile created
```

### 4.3 Test Admin Login
```
1. Go to http://localhost:5173/admin/login
2. Login with admin credentials created in Step 3.2
3. Should redirect to /admin/dashboard
```

### 4.4 Test Staff Application
```
1. Sign up as Staff
2. Choose staff type (e.g., Nurse)
3. Check Supabase - user should have:
   - role: 'staff'
   - is_verified: false
4. Try to login - should show "pending approval" message
5. Login as admin
6. Go to Manage Staff
7. Verify the staff member
8. Logout and login as staff - should work now
```

## Step 5: Verify Database Setup

### 5.1 Check Tables Created
```sql
-- Run in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- bookings
-- chatbot_responses
-- feedback
-- live_chat_sessions
-- notifications
-- page_content
-- payments
-- services
-- support_tickets
-- telegram_agents
-- telegram_bot_config
-- users
```

### 5.2 Check RLS Policies
```sql
-- Run in SQL Editor
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Should show 50+ policies
```

### 5.3 Test Real-time
```sql
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Step 6: Migrate Existing Data (Optional)

### If you have existing MongoDB data:

```powershell
# Install MongoDB Node driver
cd server
npm install mongodb

# Edit migration script with your credentials
code ../SUPABASE_MIGRATION/08_DATA_MIGRATION_SCRIPT.js

# Add your MongoDB connection string
# Add your Supabase credentials

# Run migration
node ../SUPABASE_MIGRATION/08_DATA_MIGRATION_SCRIPT.js

# Check logs for errors
```

## Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Double-check you copied the `anon` key, not the `service_role` key

### Issue: "relation does not exist"
**Solution**: Re-run the schema SQL (01_DATABASE_SCHEMA.sql)

### Issue: "Row Level Security policy violation"
**Solution**: Re-run RLS SQL (02_ROW_LEVEL_SECURITY.sql)

### Issue: Can't upload files
**Solution**: 
- Verify bucket is set to "public"
- Check storage policies are created
- Check file size (max 50MB by default)

### Issue: Email not sending
**Solution**: 
- Enable Email Auth in Supabase Settings > Authentication
- Configure SMTP in Settings > Authentication > Email (optional)
- Default uses Supabase's email service

### Issue: Real-time not working
**Solution**:
```sql
-- Enable realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

## Verification Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] RLS policies created
- [ ] Storage bucket configured
- [ ] .env file created with correct credentials
- [ ] npm dependencies installed
- [ ] Development server starts without errors
- [ ] Can register new user
- [ ] User appears in Supabase Auth
- [ ] User profile created in users table
- [ ] Admin user created and can login
- [ ] Staff application workflow works
- [ ] No console errors in browser

## Next Steps After Setup

1. **Continue Migration**: Update remaining components (see MIGRATION_PROGRESS.md)
2. **Test Features**: Test each feature as you migrate it
3. **Create Edge Functions**: For email, Telegram, cron jobs
4. **Deploy to Vercel**: After all features work locally

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

## Estimated Times

- Supabase Setup: 15 minutes
- Local Setup: 5 minutes
- Testing: 10 minutes
- **Total**: ~30 minutes

After this setup, you're ready to continue migrating the remaining components!
