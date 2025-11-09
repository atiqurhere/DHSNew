# Vercel Deployment Guide for DHS

## Prerequisites
- GitHub account with your DHS repository
- Vercel account (sign up at vercel.com)
- MongoDB Atlas database (or other MongoDB hosting)

## Step 1: Prepare MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string (replace `<password>` with your actual password)

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended for first time)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select **"GitHub"** and authorize Vercel
5. Find and select **"atiqurhere/DHS"** repository
6. Click **"Import"**

### Configure Build Settings

**Framework Preset:** Other

**Root Directory:** `./`

**Build Command:**
```bash
npm run install-all && npm run build
```

**Output Directory:** `client/dist`

**Install Command:**
```bash
npm install
```

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

#### Backend Variables (apply to Production, Preview, Development)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhs?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=30d
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

#### Optional (for Telegram Live Chat)
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

#### Frontend Variables
```
VITE_API_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://dhs-xxxxx.vercel.app`

## Step 5: Update Environment Variables

After first deployment:

1. Go to **Settings → Environment Variables**
2. Update `CLIENT_URL` with your actual Vercel URL
3. Update `VITE_API_URL` with your actual Vercel URL
4. Click **"Redeploy"** from Deployments tab

## Step 6: Seed Database

You'll need to seed your database with initial data:

### Option 1: Using Vercel CLI (Recommended)

Install Vercel CLI:
```bash
npm install -g vercel
```

Login and link project:
```bash
vercel login
vercel link
```

Run seed commands:
```bash
vercel env pull .env.local
cd server
node seedAdmin.js
node seedPages.js
```

### Option 2: Using MongoDB Compass or Atlas

Connect to your MongoDB and manually insert documents for:
- Admin user
- CMS pages
- Initial services (optional)

## Step 7: Testing

1. Visit your Vercel URL
2. Test user registration
3. Login as admin (credentials from seedAdmin.js)
4. Create some services
5. Test booking flow
6. Test support tickets
7. Test chatbot

## Troubleshooting

### Build Failures

**Error: "Cannot find module"**
- Check that all dependencies are in package.json
- Run `npm install` locally to verify

**Error: "Environment variable not defined"**
- Double-check all env vars in Vercel dashboard
- Make sure they're applied to Production environment

### Runtime Errors

**Database Connection Failed**
- Verify MongoDB connection string
- Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions

**API Routes Not Working**
- Check `vercel.json` configuration
- Verify routes are properly defined
- Check Vercel function logs

**File Uploads Not Working**
- Note: Vercel has read-only filesystem
- Consider using external storage (AWS S3, Cloudinary)
- For now, uploads are stored temporarily

### Common Issues

1. **CORS Errors**
   - Update CLIENT_URL in backend env vars
   - Redeploy after changes

2. **JWT Errors**
   - Ensure JWT_SECRET is set
   - Must be at least 32 characters

3. **Email Not Sending**
   - Use Gmail App Password, not regular password
   - Enable "Less secure app access" in Gmail settings

## Vercel CLI Commands

```bash
# Deploy manually
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Environment variables
vercel env ls
vercel env add
vercel env rm
```

## Alternative: Deploy Backend and Frontend Separately

If you encounter issues with monorepo deployment:

### Deploy Backend Only:
1. Create new Vercel project for server
2. Set root directory to `server`
3. Set build command to `npm install`
4. Deploy

### Deploy Frontend Separately:
1. Create new Vercel project for client
2. Set root directory to `client`
3. Update `VITE_API_URL` to backend URL
4. Deploy

## Production Checklist

- [ ] MongoDB database created and accessible
- [ ] All environment variables configured
- [ ] Database seeded with admin user
- [ ] Email service configured and tested
- [ ] CORS configured correctly
- [ ] JWT secret is secure and long
- [ ] File uploads tested (or external storage configured)
- [ ] All API endpoints working
- [ ] Frontend connecting to backend correctly
- [ ] User registration and login working
- [ ] Admin panel accessible
- [ ] Services can be created and booked
- [ ] Support tickets working
- [ ] Notifications sending
- [ ] Telegram bot configured (if using live chat)

## Monitoring and Maintenance

1. **Monitor Logs:**
   - Check Vercel function logs regularly
   - Set up error tracking (Sentry, LogRocket)

2. **Database Backups:**
   - Enable MongoDB Atlas automated backups
   - Schedule regular exports

3. **Performance:**
   - Monitor API response times
   - Optimize database queries
   - Consider caching strategies

4. **Security:**
   - Rotate JWT secrets periodically
   - Keep dependencies updated
   - Monitor for security vulnerabilities

## Support

If you encounter issues:
- Check Vercel deployment logs
- Review MongoDB Atlas logs
- Check GitHub repository issues
- Contact: your-email@example.com

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Congratulations!** Your DHS Healthcare Platform is now live on Vercel! 🎉
