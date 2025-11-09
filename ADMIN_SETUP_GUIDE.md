# 🔐 Admin Setup Guide - IMPORTANT

## ⚠️ SECURITY NOTICE

This system uses a **TEMPORARY ADMIN ACCOUNT** for initial setup only. This account **MUST BE DELETED** after creating your permanent admin account.

---

## 📋 Setup Steps (DO THIS IMMEDIATELY)

### Step 1: Access Admin Login
Navigate to: **http://localhost:3000/admin/login**

### Step 2: Login with Temporary Credentials
```
Email:    temp.admin@dhs.com
Password: TempAdmin@2024!Setup
```

⚠️ **You will see a RED WARNING BANNER at the top** - This is normal!

### Step 3: Create Your Permanent Admin
1. After logging in, you'll see the Admin Dashboard
2. Click on **"Manage Admins"** card
3. Click **"Add New Admin"** button
4. Fill in YOUR permanent admin details:
   - Use YOUR real name
   - Use YOUR email address
   - Create a STRONG password (at least 12 characters)
   - Enable ALL permissions (check all boxes)
5. Click **"Create Admin"**

### Step 4: DELETE the Temporary Admin ⚠️ CRITICAL
1. Stay on the "Manage Admins" page
2. Find the admin with email: **temp.admin@dhs.com**
3. Click the **DELETE** button
4. Confirm deletion

### Step 5: Logout and Login with Your Account
1. Click your profile in the navbar
2. Click **"Logout"**
3. Go back to **http://localhost:3000/admin/login**
4. Login with YOUR new admin credentials

---

## ✅ Security Checklist

- [ ] Logged in with temporary admin
- [ ] Created permanent admin account with strong password
- [ ] **DELETED temporary admin account** (temp.admin@dhs.com)
- [ ] Logged out from temporary admin
- [ ] Logged in successfully with new permanent admin
- [ ] Red warning banner no longer appears

---

## 🚨 Why This Security Approach?

### Problems with Default Admin:
- ❌ Same credentials for everyone
- ❌ Credentials in documentation/code
- ❌ Easy target for hackers
- ❌ Can't track who made changes
- ❌ Difficult to revoke access

### Benefits of Temporary Admin:
- ✅ Unique credentials per installation
- ✅ Forces admin to set personal account
- ✅ Can be deleted immediately
- ✅ Visual warnings if not deleted
- ✅ Separate admin login portal
- ✅ Better audit trail

---

## 🔒 Additional Security Features

### 1. Separate Admin Login Portal
- Regular users: `http://localhost:3000/login`
- Admins only: `http://localhost:3000/admin/login`
- Prevents credential confusion
- Visual distinction (red theme for admin)

### 2. Permission-Based Access
When creating admins, you can control what they can do:
- **manageServices**: Add/edit/delete services
- **manageStaff**: Verify and manage staff
- **manageBookings**: Assign staff and update bookings
- **managePayments**: Handle payment operations
- **manageAdmins**: Create/edit/delete other admins
- **viewReports**: Access analytics and reports

### 3. Visual Warnings
- Red warning banner when logged in as temp admin
- Cannot be dismissed permanently
- Appears on every page
- Direct link to Manage Admins

### 4. Last Admin Protection
- System prevents deleting the last admin account
- Ensures there's always at least one admin

---

## 🛠️ Development vs Production

### Development (Current Setup)
```bash
# Create temporary admin
cd server
node seedAdmin.js

# Login and setup permanent admin
# Delete temporary admin
```

### Production Deployment
```bash
# 1. Deploy application
# 2. Run seed script ONCE on first deployment
node seedAdmin.js

# 3. Immediately setup permanent admin via web interface
# 4. Delete temporary admin
# 5. NEVER run seed script again in production
```

---

## 📞 Troubleshooting

### "I deleted the temporary admin but can't login with my new admin"
- Make sure you created your admin account BEFORE deleting temp admin
- Check that you enabled all permissions
- Try the "Forgot Password" feature (if implemented)

### "I accidentally deleted all admins"
```bash
# Re-run the seed script
cd server
node seedAdmin.js
# Then immediately create permanent admin and delete temp
```

### "The warning banner won't go away"
- The banner only disappears when temp.admin@dhs.com is deleted
- Make sure you're logged in with a different admin account
- Clear browser cache and refresh

### "I can't access admin pages"
- Make sure you're using `/admin/login` not `/login`
- Regular user login blocks admin access
- Check that your account has `role: 'admin'`

---

## 🎯 Best Practices

1. **Strong Passwords**: Use at least 12 characters with mix of:
   - Uppercase and lowercase letters
   - Numbers
   - Special characters

2. **Unique Emails**: Each admin should have their own email

3. **Minimal Permissions**: Only grant permissions that admin needs

4. **Regular Audits**: Review admin list regularly

5. **Immediate Deletion**: Delete temporary admin within 5 minutes of setup

6. **No Sharing**: Never share admin credentials

7. **Password Changes**: Change passwords every 90 days

---

## 📝 Admin Management Features

Once setup is complete, you can:

### From Admin Dashboard
- View statistics (bookings, revenue, users)
- Quick access to all management pages

### Manage Admins
- Add new admins with custom permissions
- Edit admin details and permissions
- Delete admins (except the last one)
- View all admin accounts

### Manage Services
- Create new healthcare services
- Edit service details and pricing
- Toggle service availability
- Delete services

### Manage Staff
- View pending staff applications
- Verify staff members
- Reject applications with reason
- View staff details and ratings
- Delete staff accounts

### Manage Bookings
- View all bookings with filters
- Assign staff to bookings
- Update booking status
- View complete booking details

---

## ⚡ Quick Reference

| Action | URL | Credentials |
|--------|-----|-------------|
| Initial Admin Login | http://localhost:3000/admin/login | temp.admin@dhs.com / TempAdmin@2024!Setup |
| Create Permanent Admin | Dashboard → Manage Admins → Add New Admin | Your choice |
| Delete Temp Admin | Manage Admins → Find temp.admin@dhs.com → Delete | - |
| Regular User Login | http://localhost:3000/login | Patient/Staff accounts only |

---

## 🔐 Security Reminder

**THE TEMPORARY ADMIN ACCOUNT IS A SECURITY VULNERABILITY IF NOT DELETED!**

Make deleting it your **FIRST PRIORITY** after setup.

---

Last Updated: November 8, 2025
