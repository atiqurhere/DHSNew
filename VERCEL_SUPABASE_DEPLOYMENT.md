# 🚀 Deploy DHS Healthcare to Vercel + Supabase

## Complete Production Deployment Guide

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier is fine)
- ✅ Supabase account (free tier is fine)
- ✅ Your code ready to deploy

---

## Part 1: Setup Supabase (15 minutes)

### Step 1: Create Supabase Project

1. **Go to** https://supabase.com
2. **Sign in** with GitHub
3. **Click** "New Project"
4. **Enter details:**
   - Name: `dhs-healthcare` (or your choice)
   - Database Password: (Generate strong password - **SAVE THIS!**)
   - Region: Choose closest to your users
   - Pricing Plan: Free
5. **Click** "Create new project"
6. **Wait** ~2 minutes for provisioning

### Step 2: Run Database Migrations

1. **Click** on your project
2. **Go to** SQL Editor (left sidebar)
3. **Click** "New query"
4. **Copy and paste** the entire content of:
   ```
   SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql
   ```
5. **Click** "Run" (or press Ctrl+Enter)
6. **Wait** for success message ✅

7. **Repeat for RLS policies:**
   - New query
   - Copy content of: `SUPABASE_MIGRATION/02_ROW_LEVEL_SECURITY.sql`
   - Run ✅

### Step 3: Add Sample Data (Optional but Recommended)

#### **Add Chatbot Responses:**

```sql
-- In Supabase SQL Editor
INSERT INTO chatbot_responses (category, keywords, response, priority, is_active) VALUES
('services', 'service,services,what do you offer,what can you do,treatment,medical', 
'We offer a wide range of healthcare services including consultations, lab tests, home care, physiotherapy, and emergency services. Would you like to view our full service list?', 10, true),

('booking', 'book,appointment,schedule,reserve,make appointment,visit', 
'You can easily book our services online! Just visit our Services page and choose the service you need. Would you like me to take you there?', 10, true),

('pricing', 'price,cost,how much,fee,charge,payment,expensive', 
'Our pricing varies by service. You can view detailed pricing on our Services page. We also accept various payment methods. Would you like to see our service list?', 8, true),

('support', 'help,support,problem,issue,contact,complaint,assistance', 
'I can help you with that! Would you like to talk to a live support agent or create a support ticket?', 10, true),

('hours', 'hours,timing,time,when open,available,schedule,working hours', 
'We are available 24/7 for emergency services. Regular services are available from 8 AM to 8 PM. How can I assist you?', 8, true),

('location', 'location,address,where,find,directions,map', 
'We are located in Dhaka, Bangladesh. You can find our detailed address and map on our Contact page. Would you like me to take you there?', 8, true),

('emergency', 'emergency,urgent,critical,immediate,ambulance,911', 
'For medical emergencies, please call our emergency hotline immediately at +880-XXX-XXXX or visit the nearest hospital. Would you like our emergency contact information?', 15, true),

('general', 'hello,hi,hey,good morning,good afternoon,good evening', 
'Hello! Welcome to Dhaka Health Service. I am here to assist you with our healthcare services. How can I help you today?', 5, true);
```

#### **Create Admin User:**

```sql
-- Create admin user
-- IMPORTANT: Change email and password!
INSERT INTO users (email, password, name, role, is_verified) VALUES
('admin@dhs.com', '$2b$10$YourHashedPasswordHere', 'Admin User', 'admin', true);

-- Note: The password needs to be hashed. 
-- You can create this user through your app's registration after deployment,
-- then update the role manually:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 4: Get API Credentials

1. **Go to** Project Settings (gear icon, bottom left)
2. **Click** "API" in the sidebar
3. **Copy these values** (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (**Keep this secret!**)

4. **IMPORTANT:** Save these in a secure place (password manager recommended)

### Step 5: Configure Storage Buckets

1. **Go to** Storage (left sidebar)
2. **Create bucket:** `uploads`
   - Public bucket: **Yes**
   - Allowed MIME types: image/*, application/pdf
3. **Create bucket:** `service-images`
   - Public bucket: **Yes**
   - Allowed MIME types: image/*
4. **Click** on each bucket → Policies → Add policy:
   ```
   Policy name: Public read access
   Target roles: public
   Allowed operations: SELECT
   ```

---

## Part 2: Push Code to GitHub (5 minutes)

### If Not Already on GitHub:

```powershell
# Initialize git (if not already done)
cd "d:\Projects\DHS 2"
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DHS Healthcare Management System"

# Create repository on GitHub.com:
# 1. Go to https://github.com/new
# 2. Name: DHS-Healthcare (or your choice)
# 3. Make it Private
# 4. Don't add README, .gitignore, or license
# 5. Click "Create repository"

# Link to GitHub (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/DHS-Healthcare.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If Already on GitHub:

```powershell
cd "d:\Projects\DHS 2"
git add .
git commit -m "Updated for Vercel + Supabase deployment"
git push
```

---

## Part 3: Deploy to Vercel (10 minutes)

### Step 1: Import Project

1. **Go to** https://vercel.com
2. **Sign in** with GitHub
3. **Click** "Add New..." → "Project"
4. **Find** your repository (DHS-Healthcare)
5. **Click** "Import"

### Step 2: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Root Directory:** `client` ⚠️ **IMPORTANT!**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

**Click** "Environment Variables" and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (from Step 4 above) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon public key from Step 4) |

**Select:** All (Production, Preview, Development)

### Step 4: Deploy

1. **Click** "Deploy"
2. **Wait** ~2-3 minutes for build
3. **See** "Congratulations!" 🎉
4. **Click** "Visit" to see your live site!

---

## Part 4: Post-Deployment Setup (5 minutes)

### Step 1: Create Admin User

1. **Visit** your deployed site
2. **Go to** `/register`
3. **Register** with your admin email
4. **Verify email** (check spam folder)

5. **Go to Supabase:**
   - SQL Editor
   - Run this query (replace email):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Step 2: Configure App Settings

1. **Login as admin**
2. **Go to** Admin Dashboard
3. **Configure:**
   - Add services
   - Setup notifications
   - Configure Telegram bot (if needed)
   - Add staff members

### Step 3: Test Everything

- ✅ User registration/login
- ✅ Service browsing
- ✅ Booking system
- ✅ Chatbot
- ✅ Admin panel
- ✅ File uploads
- ✅ Notifications

---

## Part 5: Custom Domain (Optional)

### Add Your Domain:

1. **Go to** Project Settings in Vercel
2. **Click** "Domains"
3. **Add** your domain: `yourdomain.com`
4. **Follow** DNS instructions
5. **Wait** for DNS propagation (~1 hour)

### Configure DNS:

Add these records to your domain:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

---

## 🔧 Troubleshooting

### **Build Fails with "Module not found"**

```powershell
# Make sure Root Directory is set to "client"
# Vercel Settings → General → Root Directory: client
```

### **Environment Variables Not Working**

- Check spelling (must be exact)
- Redeploy after adding variables
- Check they're set for "Production"

### **Database Connection Errors**

- Verify Supabase URL and keys are correct
- Check RLS policies are enabled
- Ensure tables exist (run migrations)

### **404 on Routes**

- Vercel should handle this with vercel.json
- Check vercel.json is in client folder
- Redeploy if needed

### **"No admin found" Error**

```sql
-- Check if admin exists
SELECT * FROM users WHERE role = 'admin';

-- If not, update a user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard:

- **Analytics:** View traffic and performance
- **Logs:** Debug production errors
- **Deployments:** View deployment history

### Supabase Dashboard:

- **Database:** Monitor queries and performance
- **Storage:** Check file uploads
- **Auth:** View users and sessions
- **Logs:** Debug API errors

---

## 🔐 Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ RLS policies enabled in Supabase
- ✅ Strong database password
- ✅ Admin role assigned only to authorized users
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Secrets not committed to GitHub

---

## 📈 Scaling (When Needed)

### Free Tier Limits:

**Vercel (Free):**
- 100 GB bandwidth/month
- Unlimited requests
- 100 deployments/day

**Supabase (Free):**
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

### Upgrade When:
- Traffic exceeds free tier
- Need more database storage
- Need advanced features

---

## 🎯 Next Steps After Deployment

1. ✅ **Test all functionality**
2. ✅ **Add your content** (services, staff, etc.)
3. ✅ **Configure Telegram bot** (optional)
4. ✅ **Setup monitoring alerts**
5. ✅ **Share with users!**

---

## 🆘 Quick Commands

### Redeploy from Terminal:

```powershell
# Make changes
git add .
git commit -m "Update description"
git push

# Vercel auto-deploys! ✨
```

### View Logs:

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs
```

### Rollback Deployment:

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev

---

## ✅ Deployment Checklist

Before going live:

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Sample data added (chatbot responses)
- [ ] API credentials saved
- [ ] Storage buckets configured
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Root directory set to `client`
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Admin user created
- [ ] All features tested
- [ ] Domain configured (if custom)

---

## 🎉 You're Live!

Your DHS Healthcare Management System is now:
- ✅ **Deployed** on Vercel
- ✅ **Backed** by Supabase
- ✅ **Scalable** and production-ready
- ✅ **Secure** with HTTPS
- ✅ **Fast** with global CDN

**Congratulations!** 🎊

Share your live URL with users and start managing healthcare services!

---

## 📝 Save These URLs

**Production Site:** `https://your-project.vercel.app`

**Supabase Dashboard:** `https://app.supabase.com/project/xxxxx`

**Vercel Dashboard:** `https://vercel.com/username/project-name`

**GitHub Repo:** `https://github.com/username/DHS-Healthcare`

---

**Need help?** Check the troubleshooting section or contact support!
