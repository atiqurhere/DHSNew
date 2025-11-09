# Environment Variables Guide

Complete guide to all environment variables used in the DHS Healthcare Platform.

## 📋 Table of Contents
- [Server Environment Variables](#server-environment-variables)
- [Client Environment Variables](#client-environment-variables)
- [Security Best Practices](#security-best-practices)
- [Production vs Development](#production-vs-development)

---

## Server Environment Variables

Create a `.env` file in the `server` directory with these variables:

### 🔧 Core Server Configuration

#### `PORT`
- **Description:** Port number for the backend server
- **Default:** `5000`
- **Example:** `PORT=5000`
- **Required:** No (defaults to 5000)

#### `NODE_ENV`
- **Description:** Environment mode
- **Options:** `development`, `production`, `test`
- **Example:** `NODE_ENV=development`
- **Required:** No (defaults to development)

---

### 🗄️ Database Configuration

#### `MONGODB_URI`
- **Description:** MongoDB connection string
- **Format:** `mongodb://[username:password@]host[:port]/database[?options]`
- **Local Example:** `MONGODB_URI=mongodb://localhost:27017/dhs`
- **Atlas Example:** `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhs?retryWrites=true&w=majority`
- **Required:** ✅ YES

**How to get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database user password

---

### 🔐 JWT Authentication

#### `JWT_SECRET`
- **Description:** Secret key for signing JWT tokens
- **Requirements:** Minimum 32 characters, random and complex
- **Example:** `JWT_SECRET=dhs_super_secret_key_change_in_production_min_32_chars`
- **Required:** ✅ YES

**Generate secure JWT secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 32
```

#### `JWT_EXPIRE`
- **Description:** Token expiration time
- **Format:** Time string (e.g., `30d`, `7d`, `24h`, `60m`)
- **Example:** `JWT_EXPIRE=30d`
- **Default:** `30d` (30 days)
- **Required:** No

---

### 👤 Admin Account Configuration

These variables are used when seeding the database with `npm run seed`

#### `ADMIN_EMAIL`
- **Description:** Email for the default admin account
- **Example:** `ADMIN_EMAIL=admin@dhs.com`
- **Default:** `admin@dhs.com`
- **Required:** No (uses default)
- **Security:** Change in production!

#### `ADMIN_PASSWORD`
- **Description:** Password for the default admin account
- **Requirements:** Strong password (min 8 chars, include uppercase, lowercase, numbers, symbols)
- **Example:** `ADMIN_PASSWORD=MySecureP@ssw0rd2024!`
- **Default:** `Admin@123456`
- **Required:** No (uses default)
- **⚠️ SECURITY:** Use a strong, unique password in production!

#### `ADMIN_NAME`
- **Description:** Full name of the admin user
- **Example:** `ADMIN_NAME=Atiqur Rahman`
- **Default:** `System Administrator`
- **Required:** No

#### `ADMIN_PHONE`
- **Description:** Phone number for admin account
- **Example:** `ADMIN_PHONE=+880 1712-345678`
- **Default:** `+880 1700-000000`
- **Required:** No

---

### 📧 Email Configuration

The system uses Gmail SMTP for sending emails. You need a Gmail account with **App Password**.

#### `EMAIL_USER`
- **Description:** Gmail address for sending emails
- **Example:** `EMAIL_USER=dhshealthcare@gmail.com`
- **Required:** ✅ YES (for email features)

#### `EMAIL_PASS`
- **Description:** Gmail App Password (NOT regular password)
- **Example:** `EMAIL_PASS=abcdefghijklmnop`
- **Required:** ✅ YES (for email features)

**How to get Gmail App Password:**

1. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "DHS Server"
   - Click Generate
   - Copy the 16-character password (remove spaces)

3. **Use in .env:**
   ```
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

**What emails are sent:**
- Welcome emails on registration
- Booking confirmations
- Support ticket notifications
- Staff verification notifications
- Password reset emails (if implemented)
- System notifications

---

### 🌐 Frontend Configuration

#### `CLIENT_URL`
- **Description:** Frontend URL (used for CORS and email links)
- **Local:** `CLIENT_URL=http://localhost:3000`
- **Production:** `CLIENT_URL=https://your-app.vercel.app`
- **Required:** ✅ YES

---

### 💬 Telegram Bot (Optional)

Only needed if you want live chat with Telegram agent support.

#### `TELEGRAM_BOT_TOKEN`
- **Description:** Token for Telegram Bot API
- **Example:** `TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
- **Required:** No (live chat feature won't work without it)

**How to get Telegram Bot Token:**

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow instructions:
   - Choose bot name (e.g., "DHS Support Bot")
   - Choose username (e.g., "dhs_support_bot")
4. BotFather will give you a token like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Copy and use in .env

**Features enabled with Telegram:**
- AI chatbot can handoff to live agents
- Real-time messaging with support staff
- Agent availability management

---

### 💳 Payment Gateway (Optional/Mock)

Currently using mock implementation. Update when integrating real payment gateways.

#### `BKASH_API_KEY`
- **Description:** bKash payment gateway API key
- **Example:** `BKASH_API_KEY=your_bkash_api_key`
- **Required:** No (mock payment works without it)

#### `NAGAD_API_KEY`
- **Description:** Nagad payment gateway API key
- **Example:** `NAGAD_API_KEY=your_nagad_api_key`
- **Required:** No (mock payment works without it)

---

## Client Environment Variables

Create a `.env` file in the `client` directory:

### `VITE_API_URL`
- **Description:** Backend API base URL
- **Local:** `VITE_API_URL=http://localhost:5000`
- **Production:** `VITE_API_URL=https://your-backend.vercel.app`
- **Required:** ✅ YES

**Note:** Vite requires `VITE_` prefix for environment variables to be exposed to the frontend.

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use strong, unique passwords (min 32 chars for JWT_SECRET)
- ✅ Use different credentials for development and production
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use Gmail App Passwords, not regular passwords
- ✅ Rotate secrets periodically (every 3-6 months)
- ✅ Use environment variables in Vercel/hosting platform
- ✅ Limit database access (whitelist IPs when possible)

### ❌ DON'T:
- ❌ Commit `.env` files to Git
- ❌ Share credentials in chat/email
- ❌ Use default passwords in production
- ❌ Use same password across environments
- ❌ Disable 2FA after getting App Password
- ❌ Use weak JWT secrets
- ❌ Store credentials in code

---

## 🌍 Production vs Development

### Development (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dhs
JWT_SECRET=dev_secret_key_min_32_characters_here
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Dev Admin
EMAIL_USER=test@gmail.com
EMAIL_PASS=testapppassword
CLIENT_URL=http://localhost:3000
```

### Production (.env or Vercel Environment Variables)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dhs
JWT_SECRET=production_super_long_random_secret_min_32_chars_xyz123
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=VeryStrongP@ssw0rd2024!WithSymbols
ADMIN_NAME=Atiqur Rahman
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=yourrealapppassword
CLIENT_URL=https://dhs.yourdomain.com
TELEGRAM_BOT_TOKEN=1234567890:RealBotTokenHere
```

---

## 📝 Complete Example Files

### server/.env (Development)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dhs

# JWT
JWT_SECRET=development_jwt_secret_key_must_be_32_chars_minimum
JWT_EXPIRE=30d

# Admin Account
ADMIN_EMAIL=admin@dhs.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Admin
ADMIN_PHONE=+880 1700-000000

# Email
EMAIL_USER=dhstest@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Frontend
CLIENT_URL=http://localhost:3000

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### client/.env (Development)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Quick Setup Commands

### 1. Copy example files:
```bash
# Server
cd server
cp .env.example .env

# Client
cd ../client
cp .env.example .env
```

### 2. Edit .env files with your values

### 3. Seed database:
```bash
cd server
npm run seed
```

### 4. Start application:
```bash
# From root directory
npm run dev
```

---

## 🆘 Troubleshooting

### "MongoDB connection failed"
- ✅ Check MONGODB_URI is correct
- ✅ Ensure MongoDB is running (if local)
- ✅ Check network/firewall settings
- ✅ Verify database user permissions

### "Email not sending"
- ✅ Using App Password, not regular password?
- ✅ 2FA enabled on Gmail?
- ✅ Check EMAIL_USER and EMAIL_PASS are correct
- ✅ No spaces in App Password
- ✅ Check Gmail sent folder

### "JWT verification failed"
- ✅ JWT_SECRET is at least 32 characters
- ✅ Same JWT_SECRET on frontend and backend
- ✅ Check if token expired (JWT_EXPIRE)

### "Admin login not working"
- ✅ Run `npm run seed` first
- ✅ Check ADMIN_EMAIL and ADMIN_PASSWORD in .env
- ✅ Verify database connection
- ✅ Check server logs for errors

---

## 📞 Need Help?

- Check existing [GitHub Issues](https://github.com/atiqurhere/DHS/issues)
- Create new issue with details
- Email: your-email@example.com

---

**Remember:** Never commit `.env` files to Git! They are already in `.gitignore`.
