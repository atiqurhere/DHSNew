# 🔐 Admin Management & Permissions System

## Overview

Your DHS Healthcare system has a **full-featured admin management system** with granular permissions. This allows you to have:

- **Super Admins** - Full control including managing other admins
- **Regular Admins** - Limited permissions, cannot manage other admins
- **Custom Permissions** - Mix and match what each admin can do

---

## ✅ What's Available

### **1. Admin Roles**

#### **Super Admin** (Full Access)
- ✅ Manage Services
- ✅ Manage Staff
- ✅ Manage Bookings
- ✅ Manage Payments
- ✅ **Manage Admins** (create/edit/delete other admins)
- ✅ View Reports

#### **Regular Admin** (Limited Access)
- ✅ Manage Services
- ✅ Manage Staff
- ✅ Manage Bookings
- ✅ Manage Payments
- ❌ **Cannot** Manage Admins
- ✅ View Reports

#### **Custom Admin** (Your Choice)
- Pick and choose any combination of permissions
- Example: Admin who can only manage bookings and view reports

---

## 🎯 Permission Types

| Permission | Description | Code |
|------------|-------------|------|
| **Manage Services** | Create, edit, delete healthcare services | `manageServices` |
| **Manage Staff** | Hire, manage, approve staff members | `manageStaff` |
| **Manage Bookings** | View, update, cancel bookings | `manageBookings` |
| **Manage Payments** | Process refunds, view transactions | `managePayments` |
| **Manage Admins** | Create/edit/delete other admins (Super Admin only) | `manageAdmins` |
| **View Reports** | Access analytics and reports | `viewReports` |

---

## 🚀 How to Use

### **Step 1: Create Your First Super Admin**

1. **Register a user** at `/register`
2. **Go to Supabase** SQL Editor
3. **Run this SQL**:

```sql
-- Replace with your email
UPDATE users 
SET 
  role = 'admin',
  is_verified = true,
  permissions = '{
    "manageServices": true,
    "manageStaff": true,
    "manageBookings": true,
    "managePayments": true,
    "manageAdmins": true,
    "viewReports": true
  }'::jsonb
WHERE email = 'your-email@example.com';
```

4. **Login** at `/admin/login`
5. **You're now a Super Admin!** 🎉

### **Step 2: Create Additional Admins**

1. **Login as Super Admin**
2. **Go to** `/admin/manage-admins`
3. **Click** "Add New Admin"
4. **Fill in details**:
   - Name
   - Email
   - Password
   - Phone
5. **Select permissions**:
   - Check boxes for what they can manage
   - **Important**: Only check "Manage Admins" if you want them to be a Super Admin
6. **Click** "Add Admin"

### **Step 3: Edit Admin Permissions**

1. **Go to** `/admin/manage-admins`
2. **Click** edit icon next to admin
3. **Change permissions** as needed
4. **Save**

### **Step 4: Delete Admin**

1. **Go to** `/admin/manage-admins`
2. **Click** delete icon
3. **Confirm** deletion

---

## 📋 Permission Examples

### **Example 1: Full Super Admin**
```json
{
  "manageServices": true,
  "manageStaff": true,
  "manageBookings": true,
  "managePayments": true,
  "manageAdmins": true,    // Super Admin
  "viewReports": true
}
```

### **Example 2: Booking Manager**
```json
{
  "manageServices": false,
  "manageStaff": false,
  "manageBookings": true,   // Only bookings
  "managePayments": false,
  "manageAdmins": false,
  "viewReports": true
}
```

### **Example 3: Service Manager**
```json
{
  "manageServices": true,   // Only services
  "manageStaff": false,
  "manageBookings": false,
  "managePayments": false,
  "manageAdmins": false,
  "viewReports": true
}
```

### **Example 4: HR Admin**
```json
{
  "manageServices": false,
  "manageStaff": true,      // Only staff
  "manageBookings": false,
  "managePayments": false,
  "manageAdmins": false,
  "viewReports": true
}
```

---

## 🗄️ Database Structure

### **Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) CHECK (role IN ('patient', 'staff', 'admin')),
  
  -- Permissions stored as JSONB
  permissions JSONB DEFAULT '{
    "manageServices": false,
    "manageStaff": false,
    "manageBookings": false,
    "managePayments": false,
    "manageAdmins": false,
    "viewReports": false
  }'::jsonb,
  
  -- ... other fields
);
```

---

## 🔒 Security Features

### **1. Permission Checks**

The frontend checks permissions before showing UI elements:

```jsx
// Example from ManageAdmins.jsx
{user.permissions?.manageAdmins && (
  <button>Create Admin</button>
)}
```

### **2. Row Level Security (RLS)**

Supabase RLS policies ensure backend protection:

```sql
-- Only admins with manageAdmins permission can access admin management
CREATE POLICY "admins_manage_admins" ON users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role = 'admin' 
      AND (permissions->>'manageAdmins')::boolean = true
    )
  );
```

### **3. API-Level Checks**

The Supabase API layer validates permissions:

```javascript
// Only admins can access admin endpoints
if (user.role !== 'admin') {
  throw new Error('Unauthorized');
}

// Only super admins can manage other admins
if (action === 'manageAdmins' && !user.permissions.manageAdmins) {
  throw new Error('Insufficient permissions');
}
```

---

## 🎓 Common Use Cases

### **1. Hospital with Multiple Departments**

- **Super Admin**: Hospital Director
- **Service Admin**: Medical Services Manager (manages services only)
- **HR Admin**: HR Manager (manages staff only)
- **Finance Admin**: Finance Manager (manages payments only)
- **Operations Admin**: Operations Manager (manages bookings only)

### **2. Small Clinic**

- **Super Admin**: Owner
- **Regular Admin**: Manager (all permissions except manageAdmins)

### **3. Multi-Location Healthcare**

- **Super Admin**: Corporate Admin
- **Location Admins**: Each location has an admin with full permissions for their location

---

## 🔧 Customization

### **Add New Permission**

1. **Update database default**:
```sql
ALTER TABLE users 
ALTER COLUMN permissions 
SET DEFAULT '{
  "manageServices": false,
  "manageStaff": false,
  "manageBookings": false,
  "managePayments": false,
  "manageAdmins": false,
  "viewReports": false,
  "newPermission": false  -- Add this
}'::jsonb;
```

2. **Update frontend form** (ManageAdmins.jsx):
```jsx
permissions: {
  manageServices: true,
  manageStaff: true,
  manageBookings: true,
  managePayments: true,
  manageAdmins: false,
  viewReports: true,
  newPermission: false  // Add this
}
```

3. **Add checkbox in form**:
```jsx
<input
  type="checkbox"
  name="permissions.newPermission"
  checked={formData.permissions.newPermission}
  onChange={handleChange}
/>
```

---

## 🐛 Troubleshooting

### **"Cannot access Manage Admins page"**
- You're not a Super Admin
- Check permissions: `SELECT permissions FROM users WHERE email = 'your-email';`
- Ensure `manageAdmins: true`

### **"Permission denied when creating admin"**
- Only Super Admins can create admins
- Verify your account has `manageAdmins: true`

### **"Cannot delete admin"**
- Cannot delete yourself
- Cannot delete last Super Admin
- Only Super Admins can delete admins

---

## 📊 Permission Audit

### **Check who has what permissions:**

```sql
-- View all admins and their permissions
SELECT 
  name,
  email,
  role,
  permissions->>'manageServices' as services,
  permissions->>'manageStaff' as staff,
  permissions->>'manageBookings' as bookings,
  permissions->>'managePayments' as payments,
  permissions->>'manageAdmins' as admin_mgmt,
  permissions->>'viewReports' as reports
FROM users
WHERE role = 'admin'
ORDER BY 
  (permissions->>'manageAdmins')::boolean DESC,  -- Super admins first
  name;
```

### **Find all Super Admins:**

```sql
SELECT name, email, created_at
FROM users
WHERE role = 'admin'
  AND (permissions->>'manageAdmins')::boolean = true;
```

### **Find admins with specific permission:**

```sql
-- Find all admins who can manage staff
SELECT name, email
FROM users
WHERE role = 'admin'
  AND (permissions->>'manageStaff')::boolean = true;
```

---

## ✅ Summary

**Your admin management system includes:**

✅ **Super Admin** - Full control including managing admins  
✅ **Regular Admins** - Custom permissions, cannot manage admins  
✅ **Granular Permissions** - 6 different permission types  
✅ **UI Management** - Easy-to-use admin panel at `/admin/manage-admins`  
✅ **Database-Level** - Permissions stored as JSONB  
✅ **Security** - Protected by RLS policies  
✅ **Flexible** - Easy to add new permissions  

**Everything is ready to use!** Just create your first Super Admin and you can manage the entire admin team from the UI. 🎉
