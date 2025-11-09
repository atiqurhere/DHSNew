# Deployment Guide - Single Vercel Deployment

## Complete guide to deploy your Supabase-powered React app to Vercel

---

## Prerequisites

- [x] Supabase project created and configured
- [x] Database schema applied
- [x] RLS policies applied
- [x] Frontend migrated to Supabase
- [x] Edge Functions deployed
- [x] GitHub repository created

---

## Step 1: Prepare Your Project

### 1.1 Update package.json

Ensure your `client/package.json` has build scripts:

```json
{
  "name": "dhs-client",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### 1.2 Create vercel.json (Root Level)

**File**: `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  }
}
```

### 1.3 Update vite.config.js

**File**: `client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

---

## Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Migration to Supabase complete"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/dhs-healthcare.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. Click **"Deploy"**

### 3.2 Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from client directory
cd client
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? dhs-healthcare
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to Project Settings > Domains
2. Add your domain: `dhshealthcare.com`
3. Add DNS records as instructed by Vercel

### 4.2 DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 5: Setup Continuous Deployment

Vercel automatically deploys on every push to `main` branch.

### 5.1 Branch Deployments

```bash
# Create preview deployment for feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel automatically creates preview URL
```

### 5.2 Environment-specific Variables

**Production**:
- Set in Vercel Dashboard > Settings > Environment Variables
- Select "Production" environment

**Preview**:
- Add separate variables for preview deployments
- Select "Preview" environment

**Development**:
- Use local `.env` file (not committed to git)

---

## Step 6: Post-Deployment Configuration

### 6.1 Update CORS in Supabase

In Supabase Dashboard > Settings > API:

Add your Vercel domain to **CORS Allowed Origins**:
```
https://your-app.vercel.app
https://dhshealthcare.com
https://www.dhshealthcare.com
```

### 6.2 Update Telegram Webhook

Update Telegram webhook to point to Edge Function:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-project.supabase.co/functions/v1/telegram-bot"
```

### 6.3 Setup Cron Job for Cleanup

Add GitHub Action for scheduled cleanup:

**File**: `.github/workflows/cleanup-cron.yml`

```yaml
name: Cleanup Old Sessions

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cleanup Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-project.supabase.co/functions/v1/cleanup-sessions
```

Add `CRON_SECRET` to GitHub Secrets.

---

## Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics

Enable in Vercel Dashboard > Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
)
```

### 7.2 Supabase Logging

Monitor in Supabase Dashboard > Logs:
- Database queries
- Edge Function invocations
- Storage operations
- Auth events

---

## Step 8: Performance Optimization

### 8.1 Enable Caching

**File**: `vercel.json` (update routes)

```json
{
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/assets/$1"
    }
  ]
}
```

### 8.2 Code Splitting

React Router automatically code-splits. Ensure you're using lazy loading:

```javascript
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Services = lazy(() => import('./pages/Services'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/services" element={<Services />} />
      </Routes>
    </Suspense>
  )
}
```

### 8.3 Image Optimization

Use Supabase Image Transformation:

```javascript
const getOptimizedImage = (url, width = 800) => {
  const supabaseStorageUrl = 'https://your-project.supabase.co/storage/v1'
  
  if (url.includes(supabaseStorageUrl)) {
    return `${url}?width=${width}&quality=80`
  }
  return url
}

// Usage
<img src={getOptimizedImage(service.image, 400)} alt={service.name} />
```

---

## Step 9: Security Checklist

- [x] RLS policies enabled on all tables
- [x] Environment variables secured
- [x] CORS configured properly
- [x] API keys not exposed in frontend code
- [x] Service role key only used in Edge Functions
- [x] HTTPS enabled (automatic with Vercel)
- [x] SQL injection prevented (Supabase handles this)
- [x] XSS protection enabled
- [x] Content Security Policy configured

### Add Security Headers

**File**: `vercel.json` (add headers)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## Step 10: Backup & Disaster Recovery

### 10.1 Database Backups

Supabase automatically backs up daily. Manual backup:

```bash
# Install Supabase CLI
npm install -g supabase

# Backup database
supabase db dump -f backup.sql

# Restore
supabase db push backup.sql
```

### 10.2 Code Backups

Git repository serves as code backup. Tag releases:

```bash
git tag -a v2.0.0 -m "Supabase migration complete"
git push origin v2.0.0
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All migrations applied to Supabase
- [ ] RLS policies tested
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Frontend tested locally
- [ ] All dependencies installed
- [ ] Build tested locally (`npm run build`)

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Custom domain configured (if applicable)

### Post-Deployment
- [ ] Test authentication
- [ ] Test booking creation
- [ ] Test file uploads
- [ ] Test notifications
- [ ] Test admin functions
- [ ] Verify email delivery
- [ ] Verify Telegram integration
- [ ] Check performance metrics
- [ ] Monitor error logs

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Rebuild after adding variables
- Check Vercel deployment logs

### 404 Errors on Refresh

Ensure routing is configured in `vercel.json`:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### CORS Errors

- Add your domain to Supabase CORS settings
- Ensure correct Supabase URL in environment variables

### Slow Performance

- Enable caching headers
- Optimize images
- Use code splitting
- Check Supabase query performance

---

## Monitoring Commands

```bash
# View deployment logs
vercel logs

# View latest deployment
vercel inspect

# List all deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

---

## Cost Estimation

### Supabase (Free Tier)
- Database: 500MB
- Storage: 1GB
- Bandwidth: 2GB
- Edge Functions: 500K invocations/month

**Estimated**: $0/month for small app

### Vercel (Free Tier)
- Bandwidth: 100GB
- Build time: 6,000 minutes/month
- Serverless function executions: 100GB-hrs

**Estimated**: $0/month for small app

### Resend (Email - Free Tier)
- 3,000 emails/month
**Estimated**: $0/month

**Total Cost**: $0-10/month depending on usage

---

## Next Steps

1. **Monitor** your application in production
2. **Optimize** based on real usage data
3. **Scale** as needed (upgrade Supabase/Vercel plans)
4. **Iterate** based on user feedback

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: support@vercel.com
- **Supabase Discord**: https://discord.supabase.com

---

## Success! 🎉

Your DHS Healthcare app is now live with:
- ✅ Serverless architecture
- ✅ Real-time capabilities
- ✅ Secure authentication
- ✅ Scalable infrastructure
- ✅ Zero backend server management
- ✅ Automatic deployments
- ✅ Global CDN distribution
