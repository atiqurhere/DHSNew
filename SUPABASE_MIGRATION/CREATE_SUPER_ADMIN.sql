-- CREATE SUPER ADMIN - Run this after creating your first admin user

-- Step 1: First register as a user at /register with your email
-- Step 2: Then run this SQL to promote to Super Admin

-- Replace 'your-email@example.com' with your actual email
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
WHERE email = 'atiqur.dev404@gmail.com';

-- Verify it worked:
SELECT 
  email, 
  name, 
  role, 
  permissions->>'manageAdmins' as can_manage_admins,
  permissions
FROM users 
WHERE email = 'atiqur.dev404@gmail.com';

-- This should show:
-- can_manage_admins = 'true'

-- You are now a Super Admin! 🎉
-- You can now:
-- 1. Access /admin/manage-admins
-- 2. Create other admins with custom permissions
-- 3. Grant or revoke admin access to others
