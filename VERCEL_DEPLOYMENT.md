# 🚀 VERCEL DEPLOYMENT GUIDE - Supabase Version

## Prerequisites
- Supabase project created and configured
- Database schema applied
- Admin user created
- GitHub/GitLab/Bitbucket repository

---

## Step 1: Prepare Your Repository

1. **Commit all changes**
   ```bash
   git add .
   git commit -m "Complete Supabase migration"
   git push origin main
   ```

2. **Verify client folder structure**
   ```
   client/
   ├── src/
   ├── public/
   ├── index.html
   ├── package.json
   ├── vite.config.js
   └── vercel.json ✓
   ```

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your repository
   - Vercel auto-detects settings

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: client  (IMPORTANT!)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x or higher
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   Name: VITE_SUPABASE_URL
   Value: https://xxxxx.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJxxxxxxxxxxxxx
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live at `https://your-project.vercel.app`

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd client
   vercel
   
   # Follow prompts:
   # Set up and deploy? Yes
   # Which scope? Select your account
   # Link to existing project? No
   # Project name? dhs-healthcare
   # Directory? ./ (current directory)
   # Override settings? No
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # Paste your Supabase URL
   
   vercel env add VITE_SUPABASE_ANON_KEY production
   # Paste your anon key
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Step 3: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or A record pointing to Vercel's IP

3. **Enable HTTPS**
   - Automatic SSL certificate
   - Takes 5-10 minutes

---

## Step 4: Post-Deployment

### Verify Deployment

1. **Test Authentication**
   - Go to `/register`
   - Create test account
   - Verify email (check Supabase Auth)
   - Login successfully

2. **Test API Connections**
   - Open browser console
   - Check for Supabase connection errors
   - Verify no CORS issues

3. **Test Features**
   - Book a service
   - Receive notifications
   - Upload files
   - Admin dashboard

### Monitor Performance

1. **Vercel Analytics**
   - Enable in Project Settings
   - Track page views
   - Monitor performance

2. **Supabase Monitoring**
   - Check database usage
   - Monitor API requests
   - View auth activity

---

## Step 5: Environment Management

### Production Environment Variables

```env
# Production (.env in Vercel)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Development Environment Variables

```env
# Local development (.env in client/)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_development_anon_key
```

### Update Environment Variables

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy after updating
vercel --prod
```

---

## Step 6: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployments
- ✅ Pull requests → Preview URLs

### Preview Deployments

- Every commit gets unique URL
- Test before merging to production
- Share with team for review

### Deployment Hooks

```javascript
// vercel.json - Already configured!
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

---

## Troubleshooting

### Issue: Build Fails

**Check:**
```bash
# Run locally first
cd client
npm install
npm run build

# If successful locally, check Vercel logs
```

**Common fixes:**
- Ensure `client` is set as root directory
- Check Node version (18.x+)
- Verify all dependencies in package.json

### Issue: Environment Variables Not Working

**Solution:**
```bash
# Verify variables are set
vercel env ls

# Re-add if missing
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy
vercel --prod
```

### Issue: 404 on Refresh

**Already Fixed!**
The `vercel.json` routes configuration handles SPA routing:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Issue: CORS Errors

**Solution:**
1. Check Supabase URL is correct
2. Verify anon key is correct
3. Check Supabase project is not paused

### Issue: API Calls Fail

**Check:**
1. Environment variables are set in Vercel
2. Supabase project is active
3. RLS policies are configured
4. Network tab for error details

---

## Performance Optimization

### 1. Enable Edge Caching

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Optimize Images

```javascript
// Use Vercel Image Optimization
import Image from 'next/image' // If using Next.js
```

### 3. Enable Compression

```json
// Automatic in Vercel!
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

---

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enabled (automatic in Vercel)
- [ ] API keys rotated for production
- [ ] Admin user secured with strong password

---

## Monitoring & Analytics

### 1. Vercel Analytics

```bash
# Enable in Project Settings → Analytics
# Or add to package.json
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react';
<Analytics />
```

### 2. Supabase Monitoring

- Database usage: Supabase Dashboard → Database
- API requests: Supabase Dashboard → API
- Auth activity: Supabase Dashboard → Authentication

### 3. Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user tracking

---

## Deployment Checklist

### Pre-Deployment
- [ ] All code committed and pushed
- [ ] Build successful locally
- [ ] All tests passing
- [ ] Environment variables ready
- [ ] Supabase project configured

### Deployment
- [ ] Project imported to Vercel
- [ ] Root directory set to `client`
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Custom domain configured (if needed)

### Post-Deployment
- [ ] Test authentication
- [ ] Test all major features
- [ ] Verify real-time features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Set up analytics

---

## Rollback Procedure

### If Something Goes Wrong:

1. **Via Dashboard**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**
   ```bash
   vercel rollback
   ```

3. **Via Git**
   ```bash
   git revert HEAD
   git push origin main
   # Vercel auto-deploys the revert
   ```

---

## Cost Estimates

### Vercel (Frontend)
- **Hobby**: FREE
  - Unlimited deployments
  - 100 GB bandwidth
  - Serverless functions

- **Pro**: $20/month
  - More bandwidth
  - Better performance
  - Team features

### Supabase (Backend)
- **Free Tier**:
  - 500 MB database
  - 1 GB file storage
  - 50,000 monthly active users
  - 2 GB bandwidth

- **Pro**: $25/month
  - 8 GB database
  - 100 GB storage
  - Unlimited users
  - 250 GB bandwidth

### Total for Small-Medium App:
- **Development**: $0/month
- **Production**: $0-45/month

---

## Success Metrics

After deployment, you should see:
- ✅ Build time: ~2 minutes
- ✅ Deployment time: ~30 seconds
- ✅ Page load: <2 seconds
- ✅ Time to Interactive: <3 seconds
- ✅ 100% uptime
- ✅ Global CDN distribution

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain
3. ✅ Set up monitoring
4. ✅ Enable analytics
5. ✅ Create backup schedule
6. ✅ Document deployment process

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **Community**: Vercel Discord, Supabase Discord

---

**🎉 Your app is now live and production-ready!**

*Deployment Time: ~10 minutes*
*Status: LIVE ✅*
