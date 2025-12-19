# 🚀 Deployment Guide

This guide will help you deploy the DHS Healthcare application to production.

---

## Prerequisites

- ✅ Supabase project set up with database
- ✅ Environment variables configured
- ✅ GitHub repository (for Vercel deployment)
- ✅ Production build tested locally

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository

\`\`\`bash
# Make sure all changes are committed
git add .
git commit -m "Production ready"
git push origin main
\`\`\`

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your app is live! 🎉

### Step 5: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

---

## Option 2: Deploy to Netlify

### Step 1: Build Settings

\`\`\`
Base directory: client
Build command: npm run build
Publish directory: client/dist
\`\`\`

### Step 2: Environment Variables

Add the same environment variables as Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Step 3: Deploy

1. Connect your GitHub repository
2. Configure build settings
3. Deploy!

---

## Option 3: Manual Deployment

### Build for Production

\`\`\`bash
cd client
npm run build
\`\`\`

### Deploy to Any Static Host

The `dist` folder contains your production build. Upload it to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any static file hosting service

### Configure Server

Make sure your server is configured for SPA routing:
- All routes should serve `index.html`
- Enable gzip compression
- Set proper cache headers

---

## Post-Deployment Checklist

### 1. Verify Database Connection

- [ ] Test login functionality
- [ ] Check if services load
- [ ] Verify notifications work

### 2. Test Core Features

- [ ] Patient registration
- [ ] Service booking
- [ ] Admin dashboard access
- [ ] Support ticket creation

### 3. Security Check

- [ ] HTTPS is enabled
- [ ] Environment variables are not exposed
- [ ] RLS policies are active in Supabase
- [ ] CORS is properly configured

### 4. Performance Check

- [ ] Run Lighthouse audit (aim for 80+ score)
- [ ] Check bundle size
- [ ] Test on mobile devices
- [ ] Verify loading times

---

## Environment Variables

### Required Variables

\`\`\`env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
\`\`\`

### How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on Settings → API
3. Copy "Project URL" → Use as `VITE_SUPABASE_URL`
4. Copy "anon public" key → Use as `VITE_SUPABASE_ANON_KEY`

---

## Troubleshooting

### Build Fails

**Error**: Module not found
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Error**: Environment variable undefined
- **Solution**: Check that `.env` file exists and contains correct values

### Deployment Succeeds but App Doesn't Work

**Issue**: Blank page or errors in console
- **Solution**: Check browser console for errors
- **Solution**: Verify environment variables are set in deployment platform
- **Solution**: Check Supabase project is active (not paused)

### Database Connection Issues

**Issue**: "Failed to fetch" errors
- **Solution**: Verify Supabase URL is correct
- **Solution**: Check Supabase project is not paused
- **Solution**: Verify RLS policies allow access

### Authentication Not Working

**Issue**: Can't login or register
- **Solution**: Check Supabase Auth is enabled
- **Solution**: Verify email templates are configured
- **Solution**: Check RLS policies on users table

---

## Monitoring & Maintenance

### Monitor Your Application

1. **Vercel Analytics** - Track page views and performance
2. **Supabase Dashboard** - Monitor database queries and API usage
3. **Browser Console** - Check for client-side errors

### Regular Maintenance

- **Weekly**: Check error logs in Vercel and Supabase
- **Monthly**: Review and optimize database queries
- **Quarterly**: Update dependencies (`npm update`)

### Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **Code**: Keep GitHub repository updated
3. **Environment Variables**: Store securely in password manager

---

## Scaling Considerations

### When to Upgrade

- **Supabase**: Free tier supports up to 500MB database, 50,000 monthly active users
- **Vercel**: Free tier supports 100GB bandwidth per month

### Performance Optimization

1. **Enable caching** - Already configured in `vercel.json`
2. **Optimize images** - Use WebP format and lazy loading
3. **Code splitting** - Already implemented in `vite.config.js`
4. **CDN** - Vercel automatically uses CDN

---

## Security Best Practices

### Production Checklist

- ✅ Environment variables are not committed to Git
- ✅ HTTPS is enforced
- ✅ Security headers are configured (in `vercel.json`)
- ✅ RLS policies are enabled on all tables
- ✅ API keys are kept secret
- ✅ Regular security updates (`npm audit`)

### Recommended Security Headers

Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**
