# 🚀 Quick Local Setup - Get Admin Access in 5 Minutes

## Problem: Can't login to http://localhost:3000/admin/login

## Solution: Set up Supabase + Create Admin

---

## 📋 Quick Steps

### 1. Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Sign in with GitHub
3. Click "New Project"
4. Fill in:
   - Name: `dhs-test` (or anything)
   - Database Password: (Generate & **SAVE THIS**)
   - Region: Choose closest to you
5. Wait ~2 minutes for setup ⏳

---

### 2. Run Database Setup (3 minutes)

1. Click on your new project
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Open file: `SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql`
5. **Copy ALL** content
6. **Paste** in SQL Editor
7. Click **"Run"** (or Ctrl+Enter) ✅

8. **New query** again
9. Open file: `SUPABASE_MIGRATION/02_ROW_LEVEL_SECURITY.sql`
10. **Copy ALL** content
11. **Paste** in SQL Editor
12. Click **"Run"** ✅

---

### 3. Get Your API Keys (1 minute)

1. Click **Settings** (gear icon, bottom left)
2. Click **"API"**
3. **Copy these**:
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...` (long string)

---

### 4. Update Local Environment (1 minute)

1. Open: `d:\Projects\DHS 2\client\.env`
2. Replace with your real credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
```

3. **Save** the file

---

### 5. Restart Dev Server (30 seconds)

**Stop the current server** (Ctrl+C in terminal), then:

```powershell
cd "d:\Projects\DHS 2\client"
npm run dev
```

---

### 6. Create Your Admin Account (2 minutes)

1. **Open browser**: http://localhost:3000
2. **Go to**: http://localhost:3000/register (NOT /admin/login yet!)
3. **Register** with:
   - **Email**: `admin@test.com` (or your email)
   - **Password**: `Admin123!@#` (or your choice)
   - **Name**: `Admin User`
   - **Role**: Will be "patient" by default (we'll fix this next)
4. Click **Register**
5. **Check your email** for verification (check spam folder)
6. **Click verification link**

---

### 7. Promote to Admin (1 minute)

1. **Go back to Supabase Dashboard**
2. **SQL Editor** → **New query**
3. **Paste this** (replace email with yours):

```sql
UPDATE users 
SET role = 'admin', is_verified = true 
WHERE email = 'admin@test.com';
```

4. **Run it** ✅

---

### 8. Login as Admin! 🎉

1. **Go to**: http://localhost:3000/admin/login
2. **Login with**:
   - Email: `admin@test.com`
   - Password: `Admin123!@#` (whatever you used in registration)
3. **You're in!** 🎊

---

## 🎯 Quick Reference

### Your Test Admin Credentials:
```
Email: admin@test.com
Password: Admin123!@#
```

**⚠️ Change these in production!**

---

## 🐛 Troubleshooting

### "Invalid credentials"
- Make sure you ran the SQL query to promote to admin
- Check email/password are correct
- Try logging out and back in

### "Supabase URL not defined"
- Check `.env` file has correct values
- Restart dev server after updating `.env`

### "User not found"
- Make sure you registered first at `/register`
- Verify the user exists: 
  ```sql
  SELECT * FROM users WHERE email = 'admin@test.com';
  ```

### Email not verified
- Check spam folder
- Or manually verify:
  ```sql
  UPDATE users SET is_verified = true WHERE email = 'admin@test.com';
  ```

---

## 📝 Summary

1. ✅ Create Supabase project
2. ✅ Run 2 SQL migration files
3. ✅ Copy API credentials to `.env`
4. ✅ Restart dev server
5. ✅ Register at `/register`
6. ✅ Promote to admin via SQL
7. ✅ Login at `/admin/login`

**Total time: ~10 minutes**

---

## 🔐 Important Notes

- **Never commit** `.env` file (it's in .gitignore ✅)
- **Change default password** after first login
- **Use strong passwords** in production
- **Admin role** is required to access `/admin/*` routes

---

**Need help?** Check `VERCEL_SUPABASE_DEPLOYMENT.md` for detailed instructions!
