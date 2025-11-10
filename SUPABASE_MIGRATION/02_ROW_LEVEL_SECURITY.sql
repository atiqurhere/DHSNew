-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Comprehensive security for all tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- Using Supabase's built-in auth.uid() instead of custom functions
-- ============================================

-- Helper function to get current user's role from users table
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = user_uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if current user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Public read access to basic user info (for staff profiles, etc.)
CREATE POLICY "Public users are viewable by everyone" ON users
  FOR SELECT
  USING (true);

-- Users can insert their own data during registration
CREATE POLICY "Users can register" ON users
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any user
CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- SERVICES TABLE POLICIES
-- ============================================

-- Everyone can view services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT
  USING (true);

-- Only admins can create services
CREATE POLICY "Admins can create services" ON services
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update services
CREATE POLICY "Admins can update services" ON services
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete services
CREATE POLICY "Admins can delete services" ON services
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================

-- Patients can view their own bookings
CREATE POLICY "Patients can view own bookings" ON bookings
  FOR SELECT
  USING (patient_id = auth.uid());

-- Staff can view assigned bookings
CREATE POLICY "Staff can view assigned bookings" ON bookings
  FOR SELECT
  USING (staff_id = auth.uid() AND public.is_staff());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT
  USING (public.is_admin());

-- Patients can create bookings
CREATE POLICY "Patients can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Patients can update own bookings (cancel, add notes)
CREATE POLICY "Patients can update own bookings" ON bookings
  FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Staff can update assigned bookings
CREATE POLICY "Staff can update assigned bookings" ON bookings
  FOR UPDATE
  USING (staff_id = auth.uid() AND public.is_staff())
  WITH CHECK (staff_id = auth.uid() AND public.is_staff());

-- Admins can update any booking
CREATE POLICY "Admins can update any booking" ON bookings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete bookings
CREATE POLICY "Admins can delete bookings" ON bookings
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT
  USING (public.is_admin());

-- Users can create payments for their bookings
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update payments
CREATE POLICY "Admins can update payments" ON payments
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete payments
CREATE POLICY "Admins can delete payments" ON payments
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System/Admins can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can delete any notification
CREATE POLICY "Admins can delete any notification" ON notifications
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- SUPPORT_TICKETS TABLE POLICIES
-- ============================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT
  USING (public.is_admin());

-- Staff can view assigned tickets
CREATE POLICY "Staff can view assigned tickets" ON support_tickets
  FOR SELECT
  USING (assigned_to = auth.uid() AND public.is_staff());

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (add messages)
CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any ticket
CREATE POLICY "Admins can update any ticket" ON support_tickets
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete tickets
CREATE POLICY "Admins can delete tickets" ON support_tickets
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- FEEDBACK TABLE POLICIES
-- ============================================

-- Everyone can view public feedback
CREATE POLICY "Public feedback is viewable by everyone" ON feedback
  FOR SELECT
  USING (is_public = true);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT
  USING (public.is_admin());

-- Users can create feedback for their bookings
CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own feedback
CREATE POLICY "Users can delete own feedback" ON feedback
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- LIVE_CHAT_SESSIONS TABLE POLICIES
-- ============================================

-- Users can view their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON live_chat_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all chat sessions
CREATE POLICY "Admins can view all chat sessions" ON live_chat_sessions
  FOR SELECT
  USING (public.is_admin());

-- Users can create chat sessions
CREATE POLICY "Users can create chat sessions" ON live_chat_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own chat sessions
CREATE POLICY "Users can update own chat sessions" ON live_chat_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can update any chat session (for agent assignment)
CREATE POLICY "System can update chat sessions" ON live_chat_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admins can delete old chat sessions
CREATE POLICY "Admins can delete chat sessions" ON live_chat_sessions
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- CHATBOT_RESPONSES TABLE POLICIES
-- ============================================

-- Everyone can view active chatbot responses
CREATE POLICY "Active chatbot responses are viewable by everyone" ON chatbot_responses
  FOR SELECT
  USING (is_active = true);

-- Admins can view all chatbot responses
CREATE POLICY "Admins can view all chatbot responses" ON chatbot_responses
  FOR SELECT
  USING (public.is_admin());

-- Only admins can create chatbot responses
CREATE POLICY "Admins can create chatbot responses" ON chatbot_responses
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update chatbot responses
CREATE POLICY "Admins can update chatbot responses" ON chatbot_responses
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete chatbot responses
CREATE POLICY "Admins can delete chatbot responses" ON chatbot_responses
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- TELEGRAM_AGENTS TABLE POLICIES
-- ============================================

-- Admins can view all agents
CREATE POLICY "Admins can view all telegram agents" ON telegram_agents
  FOR SELECT
  USING (public.is_admin());

-- Only admins can create agents
CREATE POLICY "Admins can create telegram agents" ON telegram_agents
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update agents
CREATE POLICY "Admins can update telegram agents" ON telegram_agents
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- System can update agent availability
CREATE POLICY "System can update agent status" ON telegram_agents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only admins can delete agents
CREATE POLICY "Admins can delete telegram agents" ON telegram_agents
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- TELEGRAM_BOT_CONFIG TABLE POLICIES
-- ============================================

-- Only admins can view bot config
CREATE POLICY "Admins can view bot config" ON telegram_bot_config
  FOR SELECT
  USING (public.is_admin());

-- Only admins can create bot config
CREATE POLICY "Admins can create bot config" ON telegram_bot_config
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update bot config
CREATE POLICY "Admins can update bot config" ON telegram_bot_config
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- PAGE_CONTENT TABLE POLICIES
-- ============================================

-- Everyone can view page content
CREATE POLICY "Page content is viewable by everyone" ON page_content
  FOR SELECT
  USING (true);

-- Only admins can create page content
CREATE POLICY "Admins can create page content" ON page_content
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update page content
CREATE POLICY "Admins can update page content" ON page_content
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete page content
CREATE POLICY "Admins can delete page content" ON page_content
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- SERVICE ROLE BYPASS (for Edge Functions)
-- ============================================

-- Create policies that allow service role to bypass RLS
-- This is needed for Edge Functions and server-side operations

CREATE POLICY "Service role can do anything on users" ON users
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role can do anything on bookings" ON bookings
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role can do anything on notifications" ON notifications
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Add similar policies for other tables as needed

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT: JWT Claims Structure
Your JWT tokens should include these claims:
{
  "sub": "user-uuid",           // User ID
  "role": "patient|staff|admin", // User role
  "email": "user@example.com"
}

To set up auth in Supabase:
1. Use Supabase Auth for user authentication
2. Create a trigger on auth.users to create corresponding entry in public.users
3. Update JWT claims with custom claims hook
4. Or use custom JWT generation with same structure
*/

