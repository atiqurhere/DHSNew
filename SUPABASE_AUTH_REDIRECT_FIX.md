# Fix Supabase Auth Redirect URL

## Problem
Email confirmation links are redirecting to `http://localhost:3000` instead of your production URL.

## Solution - Configure Supabase URLs

### Step 1: Get Your Vercel Deployment URL
1. Go to your Vercel dashboard
2. Find your deployed app URL (e.g., `https://your-app.vercel.app`)
3. Copy the full URL

### Step 2: Update Supabase Authentication Settings

1. **Open Supabase Dashboard**: https://app.supabase.com
2. **Select Your Project**: rccmupalimnodgaveulr
3. **Go to Authentication** → **URL Configuration** (in the left sidebar)

4. **Update Site URL** (this is where users go after email confirmation):
   ```
   https://your-app.vercel.app/email-verified
   ```
   *(Replace with your actual Vercel URL + `/email-verified` path)*

5. **Add Redirect URLs** (allow both production and local):
   ```
   http://localhost:3000/**
   http://localhost:5173/**
   https://your-app.vercel.app/**
   ```
   *(Add each URL on a separate line)*

6. **Click "Save"**

### What Happens Now:

When a user clicks the email verification link:
1. ✅ They land on `/email-verified` page
2. ✅ Page auto-verifies their email
3. ✅ Shows success animation with countdown
4. ✅ Auto-redirects to their role-based dashboard:
   - **Admin** → `/admin/dashboard`
   - **Staff** → `/staff/dashboard`
   - **Patient** → `/patient/dashboard`
5. ✅ Or manual "Go to Dashboard" button

### Step 3: What These Settings Do

- **Site URL**: The main URL of your application. Used as the default redirect after email confirmation.
- **Redirect URLs**: Whitelist of allowed redirect URLs for security. The `**` wildcard allows any path on that domain.

### Step 4: Test Email Confirmation Again

1. Register a new user on your **production site**
2. Check your email - the confirmation link should now redirect to `https://your-app.vercel.app`
3. Click the link - you'll be redirected to your production site ✅

## Example Configuration

If your Vercel URL is `https://dhs-healthcare.vercel.app`:

**Site URL:**
```
https://dhs-healthcare.vercel.app
```

**Redirect URLs:**
```
http://localhost:3000/**
http://localhost:5173/**
https://dhs-healthcare.vercel.app/**
```

## Important Notes

- ⚠️ **Wildcards Required**: Always add `/**` at the end to allow all paths
- 🔒 **Security**: Only add URLs you trust to the redirect list
- 🧪 **Local Testing**: Keep localhost URLs for development/testing
- 🚀 **Production**: Add your Vercel URL for production use

## Where to Find Your Vercel URL

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Your Project** → **Deployments** tab
3. **Production URL** is shown at the top (usually `https://your-project.vercel.app`)

## After Configuration

All new email confirmations will redirect to your production URL! Existing emails still contain the old localhost URL, so test with a fresh registration.

---

## Bonus: Customize Email Sender Name & Templates

### Change Sender Name from "Supabase Auth"

1. **Open Supabase Dashboard** → Your Project
2. **Authentication** → **Email Templates** (in left sidebar)
3. Scroll down to **Sender Name** section
4. Change from `Supabase Auth` to your preferred name:
   ```
   DHS Healthcare
   ```
   or
   ```
   DHS Support Team
   ```

5. **Change Sender Email** (optional, requires domain verification):
   - Default: `noreply@mail.app.supabase.io`
   - Custom: `noreply@yourdomain.com` (requires SMTP setup)

6. Click **Save**

### Customize Email Templates

You can customize all email templates (confirmation, password reset, etc.):

**Available Templates:**
- ✉️ Confirm Signup
- 🔒 Reset Password
- 📧 Change Email Address
- 🔑 Magic Link

**How to Edit:**
1. **Authentication** → **Email Templates**
2. Select the template you want to customize
3. Edit the **Subject** and **Message Body**
4. Use these variables in your templates:
   ```
   {{ .SiteURL }}          - Your site URL
   {{ .ConfirmationURL }}  - Confirmation link
   {{ .Token }}            - Verification token
   {{ .Email }}            - User's email
   ```

**Example Custom Confirmation Email:**

**Subject:**
```
Welcome to DHS Healthcare - Confirm Your Account
```

**Message Body:**
```html
<h2>Welcome to DHS Healthcare!</h2>
<p>Hi there,</p>
<p>Thank you for registering with DHS Healthcare Management System.</p>
<p>Please confirm your email address by clicking the button below:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Email</a></p>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
<p>If you didn't create this account, please ignore this email.</p>
<br>
<p>Best regards,<br>DHS Healthcare Team</p>
```

5. **Save Template**

### Custom SMTP (Optional - For Custom Domain Emails)

To use your own email domain (e.g., `noreply@dhshealthcare.com`):

1. **Authentication** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your SMTP provider:
   - **Host**: smtp.gmail.com (or your provider)
   - **Port**: 587
   - **Username**: your-email@domain.com
   - **Password**: your-app-password
   - **Sender Email**: noreply@dhshealthcare.com
   - **Sender Name**: DHS Healthcare

4. **Save and Test**

**Popular SMTP Providers:**
- Gmail (free, 500 emails/day)
- SendGrid (free tier: 100 emails/day)
- Mailgun (pay as you go)
- AWS SES (cheap, reliable)

### Result

After customization, emails will show:
- **From:** DHS Healthcare (instead of Supabase Auth)
- **Custom branding** and messaging
- **Your domain** (if using custom SMTP)

Much more professional! ✨
