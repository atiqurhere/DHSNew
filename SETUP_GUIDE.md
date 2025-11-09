# DHS - Complete Setup Guide
**Step-by-Step Installation Guide for Dhaka Health Service Platform**

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas (Cloud) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- ✅ **Git** - [Download](https://git-scm.com/downloads)
- ✅ **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)
- ✅ **Gmail Account** (for sending emails)

---

## 🚀 Part 1: Clone and Install

### Step 1: Clone Repository
```bash
# Open terminal/command prompt
git clone https://github.com/atiqurhere/DHS.git
cd DHS
```

### Step 2: Install Dependencies
```bash
# Install all dependencies (client + server)
npm run install-all
```

**Wait for installation to complete (may take 2-3 minutes)**

---

## 🗄️ Part 2: Database Setup

### Option A: Using MongoDB Atlas (Cloud) - **Recommended for Beginners**

#### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or Email
3. Complete registration

#### Step 2: Create a Cluster
1. Click **"Build a Database"**
2. Choose **"FREE"** tier (M0 Sandbox)
3. Select **Cloud Provider**: AWS
4. Select **Region**: Closest to you (e.g., Singapore for Bangladesh)
5. Click **"Create Cluster"** (wait 3-5 minutes)

#### Step 3: Create Database User
1. In left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `dhsadmin` (or any name)
5. Password: Click **"Autogenerate Secure Password"** → **Copy it!**
6. User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

#### Step 4: Allow Network Access
1. In left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

#### Step 5: Get Connection String
1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://dhsadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you copied earlier
6. **Save this connection string!**

---

### Option B: Using Local MongoDB

#### Step 1: Install MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose **"Complete"** installation
4. Check **"Install MongoDB as a Service"**
5. Finish installation

#### Step 2: Verify Installation
```bash
# Check if MongoDB is running
mongod --version
```

Your connection string will be:
```
mongodb://localhost:27017/dhs
```

---

## 📧 Part 3: Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click **"Security"** (left sidebar)
3. Scroll to **"How you sign in to Google"**
4. Click **"2-Step Verification"**
5. Click **"Get Started"** and follow steps
6. Use your phone for verification

### Step 2: Generate App Password
1. After 2FA is enabled, go back to **"Security"**
2. Scroll down to **"2-Step Verification"**
3. Click on it, scroll to bottom
4. Click **"App passwords"**
5. You may need to sign in again
6. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - Type: **"DHS Server"**
7. Click **"Generate"**
8. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)
9. **Remove spaces**: `abcdefghijklmnop`
10. **Save it securely!**

---

## ⚙️ Part 4: Environment Configuration

### Step 1: Create Server .env File
```bash
# Navigate to server directory
cd server

# Copy example file
cp .env.example .env

# Open in text editor (Windows)
notepad .env

# OR (Mac/Linux)
nano .env
```

### Step 2: Fill in Server .env Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - PASTE YOUR MONGODB CONNECTION STRING HERE
MONGODB_URI=mongodb+srv://dhsadmin:your_password@cluster0.xxxxx.mongodb.net/dhs?retryWrites=true&w=majority

# JWT Configuration - CHANGE THIS!
JWT_SECRET=dhs_your_super_secret_key_minimum_32_characters_required_xyz123
JWT_EXPIRE=30d

# Admin Account (for initial setup)
ADMIN_EMAIL=admin@dhs.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Your Name Here
ADMIN_PHONE=+880 1700-123456

# Email Configuration - PASTE YOUR GMAIL DETAILS
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Frontend URL
CLIENT_URL=http://localhost:3000

# Telegram Bot (Optional - leave empty for now)
TELEGRAM_BOT_TOKEN=

# Payment Gateway (Optional - leave as is)
BKASH_API_KEY=mock_key
NAGAD_API_KEY=mock_key
```

**⚠️ IMPORTANT:**
- Replace `MONGODB_URI` with YOUR connection string
- Replace `EMAIL_USER` with YOUR Gmail address
- Replace `EMAIL_PASS` with YOUR App Password (no spaces!)
- Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your preferred credentials
- Change `JWT_SECRET` to a long random string (min 32 chars)

### Step 3: Save and Close File
- Press `Ctrl + S` to save
- Close the editor

### Step 4: Create Client .env File
```bash
# Navigate to client directory
cd ../client

# Copy example file
cp .env.example .env

# Open in text editor
notepad .env  # Windows
# OR
nano .env  # Mac/Linux
```

### Step 5: Fill in Client .env Variables
```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

**Save and close the file**

---

## 🌱 Part 5: Seed Database

### Step 1: Seed Admin User and Pages
```bash
# Make sure you're in the server directory
cd server  # if not already there

# Run seed script
npm run seed
```

**You should see:**
```
✅ Admin user created successfully!
═══════════════════════════════════════════════════════
🔐 ADMIN CREDENTIALS
═══════════════════════════════════════════════════════
Email:    admin@dhs.com
Password: Admin@123456
═══════════════════════════════════════════════════════
```

**⚠️ Save these credentials!** You'll need them to login.

---

## 🏃 Part 6: Run the Application

### Option A: Run Both (Client + Server) Together
```bash
# From root DHS directory
cd ..  # Go back to root if in server/client folder
npm run dev
```

### Option B: Run Separately (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 2: Wait for Startup
You should see:
```
Server running on port 5000
MongoDB Connected

VITE v5.4.21  ready in 500 ms
➜  Local:   http://localhost:3000/
```

---

## 🎉 Part 7: Access the Application

### Step 1: Open Browser
Go to: **http://localhost:3000**

### Step 2: Test User Registration
1. Click **"Register"**
2. Fill in the form:
   - Name: Your Name
   - Email: test@example.com
   - Password: Test@123
   - Phone: +880 1712345678
3. Click **"Register"**
4. Check your Gmail inbox for welcome email ✉️

### Step 3: Login as Admin
1. Go to: **http://localhost:3000/admin/login**
2. Enter credentials from Step 5 (seed script output):
   - Email: `admin@dhs.com`
   - Password: `Admin@123456`
3. Click **"Login"**

### Step 4: Explore Admin Dashboard
You should see:
- 📊 Dashboard with statistics
- 🏥 Manage Services
- 👥 Manage Staff
- 📅 Manage Bookings
- 🎫 Support Tickets
- ⚙️ Settings

---

## ✅ Part 8: Verification Checklist

Test everything to make sure it works:

### Backend Tests
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Can access: http://localhost:5000/api/services

### Frontend Tests
- [ ] Can access: http://localhost:3000
- [ ] Homepage loads properly
- [ ] Can register new user
- [ ] Welcome email received
- [ ] Can login as user
- [ ] Can login as admin

### Admin Panel Tests
- [ ] Admin dashboard loads
- [ ] Can create new service
- [ ] Can view bookings
- [ ] Can manage staff
- [ ] Support tickets visible

### Email Tests
- [ ] Registration emails sent
- [ ] Booking confirmation emails work
- [ ] Check Gmail "Sent" folder

---

## 🛠️ Part 9: Create Your First Service

### Step 1: Login as Admin
Go to http://localhost:3000/admin/login

### Step 2: Navigate to Services
Click **"Manage Services"** in sidebar

### Step 3: Add New Service
1. Click **"Add New Service"** button
2. Fill in details:
   ```
   Name: Home Nursing Care
   Category: home-care
   Price: 1500
   Duration: Per day
   Description: Professional nursing care at home
   ```
3. Upload an image (optional)
4. Click **"Create Service"**

### Step 4: Test Booking
1. Logout from admin
2. Login as regular user
3. Go to **"Services"**
4. Click on your new service
5. Click **"Book Now"**
6. Fill booking form
7. Submit booking

---

## 🔧 Troubleshooting

### Problem: "MongoDB Connection Failed"
**Solutions:**
- ✅ Check `MONGODB_URI` in `.env` file
- ✅ Verify password in connection string is correct
- ✅ Make sure you replaced `<password>` in connection string
- ✅ Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0
- ✅ Try reconnecting to your cluster in Atlas

### Problem: "Email Not Sending"
**Solutions:**
- ✅ Verify you're using App Password, NOT regular Gmail password
- ✅ Check 2FA is enabled on Gmail
- ✅ Make sure there are NO SPACES in `EMAIL_PASS`
- ✅ Verify `EMAIL_USER` is correct
- ✅ Check Gmail "Sent" folder
- ✅ Check "Less secure app access" is not blocking (shouldn't with App Password)

### Problem: "Port Already in Use"
**Solutions:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Problem: "Module Not Found"
**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or
npm run install-all
```

### Problem: "Admin Login Not Working"
**Solutions:**
- ✅ Make sure you ran `npm run seed` in server directory
- ✅ Check email/password matches what was shown after seeding
- ✅ Try the exact credentials from the seed output
- ✅ Check MongoDB connection
- ✅ Look at server console for errors

### Problem: "CORS Error"
**Solutions:**
- ✅ Verify `CLIENT_URL` in server/.env is `http://localhost:3000`
- ✅ Verify `VITE_API_URL` in client/.env is `http://localhost:5000`
- ✅ Restart both server and client

---

## 📱 Part 10: Optional - Telegram Bot Setup

If you want live chat feature with Telegram agents:

### Step 1: Create Telegram Bot
1. Open Telegram app
2. Search for: `@BotFather`
3. Send: `/newbot`
4. Choose bot name: `DHS Support Bot`
5. Choose username: `dhs_support_bot` (must end with 'bot')
6. Copy the token (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Add Token to .env
```bash
# Edit server/.env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 3: Configure in Admin Panel
1. Login as admin
2. Go to **"Manage Telegram Bot"**
3. Paste token and configure settings
4. Go to **"Manage Telegram Agents"**
5. Add agents with their Telegram User IDs

### Step 4: Test
1. Logout and go to homepage
2. Open chatbot (bottom right)
3. Click "Talk to Human"
4. Connect to agent via Telegram

---

## 📚 Part 11: Next Steps

### For Development:
1. ✅ Explore admin panel features
2. ✅ Create test services and bookings
3. ✅ Test support ticket system
4. ✅ Customize CMS pages (About, Contact)
5. ✅ Upload your logo and branding
6. ✅ Test email notifications

### For Production:
1. ✅ Follow `VERCEL_DEPLOYMENT_GUIDE.md`
2. ✅ Use strong passwords for production
3. ✅ Set up proper MongoDB Atlas cluster
4. ✅ Configure custom domain
5. ✅ Set up SSL certificate
6. ✅ Enable monitoring and backups

---

## 📞 Getting Help

### Documentation Files:
- 📖 **`SETUP_GUIDE.md`** - This file
- 📖 **`ENVIRONMENT_VARIABLES.md`** - Complete env vars guide
- 📖 **`VERCEL_DEPLOYMENT_GUIDE.md`** - Production deployment
- 📖 **`README.md`** - Project overview

### Support:
- 🐛 **GitHub Issues:** https://github.com/atiqurhere/DHS/issues
- 📧 **Email:** your-email@example.com

---

## 🎊 Congratulations!

You've successfully set up the DHS Healthcare Platform! 

### What You Can Do Now:
✅ Create and manage healthcare services  
✅ Accept bookings from users  
✅ Manage staff and assignments  
✅ Handle support tickets  
✅ Send automated email notifications  
✅ Use AI chatbot (with optional Telegram integration)  
✅ Manage the entire platform from admin panel  

**Ready to deploy to production?** Check out `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Happy Coding! 🚀**
