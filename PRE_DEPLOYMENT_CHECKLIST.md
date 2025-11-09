# ✅ Pre-Deployment Checklist

## Before You Deploy to Vercel + Supabase

---

## 🔍 Code Review

- [ ] All environment variables are in `.env` (not hardcoded)
- [ ] `.env` is in `.gitignore`
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] No `console.log()` statements with sensitive data
- [ ] Build runs successfully: `npm run build`
- [ ] No TypeScript/ESLint errors

## 🗄️ Supabase Setup

- [ ] Supabase account created
- [ ] New project created
- [ ] Database password saved securely
- [ ] SQL migrations run:
  - [ ] `01_DATABASE_SCHEMA.sql`
  - [ ] `02_ROW_LEVEL_SECURITY.sql`
- [ ] API credentials copied:
  - [ ] Project URL
  - [ ] Anon public key
  - [ ] Service role key (keep secret!)
- [ ] Storage buckets created:
  - [ ] `uploads` (public)
  - [ ] `service-images` (public)
- [ ] Sample data added:
  - [ ] Chatbot responses
  - [ ] Test services (optional)

## 📦 GitHub Repository

- [ ] Code pushed to GitHub
- [ ] Repository is accessible (private or public)
- [ ] All changes committed
- [ ] `.gitignore` configured correctly
- [ ] No `node_modules` in repository
- [ ] No `dist` folder in repository

## ⚙️ Vercel Configuration

- [ ] Vercel account created/linked with GitHub
- [ ] Build settings verified:
  - [ ] Root Directory: `client`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Environment variables prepared:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`

## 🧪 Local Testing

- [ ] Project runs locally: `npm run dev`
- [ ] All pages load correctly
- [ ] Authentication works:
  - [ ] Registration
  - [ ] Login
  - [ ] Logout
- [ ] Services page displays
- [ ] Booking system works
- [ ] Chatbot responds
- [ ] Admin panel accessible
- [ ] File uploads work
- [ ] Notifications display

## 🔐 Security

- [ ] RLS policies enabled in Supabase
- [ ] Admin role protected
- [ ] Strong database password
- [ ] API keys not exposed
- [ ] CORS configured correctly
- [ ] Authentication required for protected routes

## 📱 Features to Verify

### User Features
- [ ] Homepage loads
- [ ] Services browsing
- [ ] Service booking
- [ ] User registration
- [ ] User login
- [ ] Profile management
- [ ] Notifications
- [ ] Payment integration
- [ ] Support tickets

### Admin Features
- [ ] Admin dashboard
- [ ] Manage services
- [ ] Manage bookings
- [ ] Manage users
- [ ] Manage staff
- [ ] Manage admins
- [ ] Manage support tickets
- [ ] Telegram bot config
- [ ] Notifications management

### Staff Features
- [ ] Staff dashboard
- [ ] View assigned bookings
- [ ] Update booking status
- [ ] Notifications

### Chatbot & Support
- [ ] Chatbot opens
- [ ] Bot responds to messages
- [ ] Follow-up buttons work
- [ ] Live agent connection (if configured)
- [ ] Support ticket creation

## 📄 Documentation

- [ ] README.md is clear and updated
- [ ] Deployment guide reviewed
- [ ] API documentation complete
- [ ] Setup instructions clear

## 🎨 UI/UX Check

- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success messages displayed
- [ ] Forms validate correctly
- [ ] Navigation works properly

## 🚀 Ready to Deploy?

If all boxes are checked ✅, you're ready to deploy!

**Follow:** `VERCEL_SUPABASE_DEPLOYMENT.md` for step-by-step instructions.

---

## 📝 Post-Deployment

After deployment, verify:

- [ ] Site is accessible at Vercel URL
- [ ] HTTPS is enabled (automatic)
- [ ] Environment variables loaded
- [ ] Database connection works
- [ ] Authentication works
- [ ] All pages accessible
- [ ] Images/files load correctly
- [ ] Chatbot works
- [ ] Admin panel accessible
- [ ] Create first admin user
- [ ] Test a complete user flow
- [ ] Check Vercel logs for errors
- [ ] Check Supabase logs for errors
- [ ] Performance is acceptable
- [ ] No console errors

---

## 🆘 If Something Goes Wrong

1. **Check Vercel deployment logs**
2. **Check browser console for errors**
3. **Verify environment variables**
4. **Check Supabase connection**
5. **Review troubleshooting in deployment guide**
6. **Rollback to previous deployment if needed**

---

## 📞 Support Resources

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Your deployment guide: `VERCEL_SUPABASE_DEPLOYMENT.md`

---

**Good luck with your deployment! 🎉**
