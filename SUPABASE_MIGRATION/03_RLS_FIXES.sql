-- ============================================
-- TEMPORARY FIX: Allow Service Role to Insert Services
-- Run this in Supabase SQL Editor if services are not showing
-- ============================================

-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Admins can create services" ON services;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Allow service role (backend) to insert services
CREATE POLICY "Service role can insert services" ON services
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR public.is_admin()
  );

-- Allow authenticated users to insert their own notifications
CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR public.is_admin()
  );

-- Recreate admin insert policy for services
CREATE POLICY "Admins can create services" ON services
  FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================
-- ALTERNATIVE: Temporarily disable RLS for initial seed
-- (Re-enable after seeding)
-- ============================================

-- Run this if you want to seed data without RLS blocking:
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Then after seeding, re-enable:
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
