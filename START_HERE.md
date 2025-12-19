# 🎯 START HERE - DHS Healthcare

Welcome to the DHS Healthcare Management System! This guide will help you get started quickly.

---

## 📋 What You Have

A **complete, production-ready healthcare management system** with:

✅ Patient booking and payment processing  
✅ Staff management and scheduling  
✅ Admin dashboard with analytics  
✅ Real-time notifications  
✅ Support ticket system  
✅ AI chatbot for customer support  
✅ Secure authentication and role-based access  

**Tech Stack**: React 18 + Vite + Supabase + Tailwind CSS

---

## 🚀 Quick Start (30 Minutes)

### Step 1: Install Dependencies (2 min)

\`\`\`bash
cd client
npm install
\`\`\`

### Step 2: Set Up Database (15 min)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (name it "dhs-healthcare")
3. Go to SQL Editor and run these files in order:
   - `database/schema.sql` - Creates tables
   - `database/security.sql` - Adds security policies
   - `database/seed.sql` - Adds sample data (optional)
   - `database/admin.sql` - Creates admin user (edit email first)

See [database/README.md](./database/README.md) for detailed instructions.

### Step 3: Configure Environment (3 min)

\`\`\`bash
# Copy template
cp .env.template .env

# Edit .env and add your Supabase credentials:
# Get these from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
\`\`\`

### Step 4: Run Development Server (1 min)

\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

### Step 5: Test the Application (5 min)

1. Register a new account
2. Browse services
3. Book a service (if logged in as patient)
4. Check notifications

### Step 6: Deploy (Optional, 5 min)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment to Vercel.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and features |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions |
| [database/README.md](./database/README.md) | Database setup guide |

---

## 🎓 First Time Setup

### Create Your First Admin User

1. Register a normal account through the app
2. Go to Supabase Dashboard → SQL Editor
3. Run this query (replace with your email):

\`\`\`sql
UPDATE users 
SET role = 'admin', is_verified = true
WHERE email = 'your-email@example.com';
\`\`\`

4. Logout and login again
5. You now have admin access!

---

## 🗂️ Project Structure

\`\`\`
DHS 2/
├── client/              # React application (deploy this)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── lib/         # Supabase config
│   │   └── utils/       # Utilities & API
│   ├── package.json
│   └── vite.config.js
│
├── database/            # Database setup files
│   ├── schema.sql       # Tables and functions
│   ├── security.sql     # Security policies
│   ├── seed.sql         # Sample data
│   └── admin.sql        # Create admin
│
├── README.md            # Main documentation
├── DEPLOYMENT.md        # Deployment guide
└── START_HERE.md        # This file
\`\`\`

---

## ✅ Success Checklist

After setup, you should have:

- [x] Node modules installed
- [x] Database created in Supabase
- [x] Environment variables configured
- [x] Development server running
- [x] Can register and login
- [x] Services are visible
- [x] Admin user created

---

## 🆘 Troubleshooting

### Can't see services?

Run `database/seed.sql` to add sample services.

### Login not working?

1. Check Supabase project is active (not paused)
2. Verify environment variables are correct
3. Check browser console for errors

### Database errors?

1. Make sure you ran `schema.sql` first
2. Then run `security.sql`
3. Check RLS policies are enabled

### Build errors?

\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

---

## 🎯 Next Steps

1. **Customize** - Update branding, colors, and content
2. **Test** - Try all features as different user roles
3. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to go live
4. **Monitor** - Use Supabase and Vercel dashboards

---

## 📞 Quick Reference

| I Want To... | Go To... |
|--------------|----------|
| Understand the project | [README.md](./README.md) |
| Set up database | [database/README.md](./database/README.md) |
| Deploy to production | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Fix issues | Troubleshooting section above |

---

**Ready to build something amazing! 🚀**

*Time to Production: 30 minutes*
