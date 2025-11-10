-- QUICK ADMIN SETUP FOR TESTING
-- Run this in Supabase SQL Editor after running the main migrations

-- This script helps you create a test admin user
-- IMPORTANT: You must first register this user through Supabase Auth

-- Step 1: Register a user at your app's /register page or use Supabase Auth UI
-- Use these credentials:
-- Email: admin@test.com
-- Password: Admin123!@#

-- Step 2: After registering, run this query to promote them to admin:
UPDATE users 
SET role = 'admin', 
    is_verified = true 
WHERE email = 'admin@test.com';

-- Verify the admin was created:
SELECT id, email, name, role, is_verified, created_at 
FROM users 
WHERE role = 'admin';

-- If you want to create multiple test users with different roles:

-- Patient user (after they register):
-- Email: patient@test.com, Password: Patient123!
UPDATE users SET role = 'patient', is_verified = true WHERE email = 'patient@test.com';

-- Staff user (after they register):  
-- Email: staff@test.com, Password: Staff123!
UPDATE users SET role = 'staff', is_verified = true WHERE email = 'staff@test.com';

-- IMPORTANT NOTES:
-- 1. Users MUST be created through Supabase Auth first (via /register or Supabase Auth UI)
-- 2. This script only UPDATES the role, it doesn't create the auth user
-- 3. Password is managed by Supabase Auth, not stored in users table
-- 4. Change these test credentials for production!
