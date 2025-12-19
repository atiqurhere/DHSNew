-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- Run this AFTER you've registered a user through the application

-- Update user role to admin
UPDATE public.users 
SET role = 'admin', is_verified = true
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, name, role, is_verified 
FROM public.users 
WHERE email = 'your-email@example.com';
