-- ============================================
-- TEMPORARY FIX: DISABLE ALL RLS FOR TESTING
-- ============================================
-- Run this to disable RLS on all tables temporarily
-- This will help identify if RLS is the issue

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_sessions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- All should show rowsecurity = false
