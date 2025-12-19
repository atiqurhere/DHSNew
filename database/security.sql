-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Run this after creating the database schema
-- This ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (public.is_admin());

-- Staff can view verified staff and patients
CREATE POLICY "Staff can view users" ON public.users
  FOR SELECT
  USING (public.is_staff());

-- ============================================
-- SERVICES TABLE POLICIES
-- ============================================

-- Everyone can view active services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT
  USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Staff can view assigned bookings
CREATE POLICY "Staff can view assigned bookings" ON public.bookings
  FOR SELECT
  USING (auth.uid() = staff_id OR public.is_admin());

-- Staff can update assigned bookings
CREATE POLICY "Staff can update assigned bookings" ON public.bookings
  FOR UPDATE
  USING (auth.uid() = staff_id OR public.is_admin());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT
  USING (public.is_admin());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create payments
CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  USING (public.is_admin());

-- Admins can manage payments
CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- SUPPORT TICKETS TABLE POLICIES
-- ============================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets
CREATE POLICY "Users can update own tickets" ON public.support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins and staff can view all tickets
CREATE POLICY "Staff can view all tickets" ON public.support_tickets
  FOR SELECT
  USING (public.is_staff());

-- Admins can manage all tickets
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- TICKET MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages for their tickets
CREATE POLICY "Users can view ticket messages" ON public.ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    ) OR public.is_staff()
  );

-- Users can create messages for their tickets
CREATE POLICY "Users can create ticket messages" ON public.ticket_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE id = ticket_id AND user_id = auth.uid()
      ) OR public.is_staff()
    )
  );

-- ============================================
-- CHATBOT RESPONSES TABLE POLICIES
-- ============================================

-- Everyone can view chatbot responses
CREATE POLICY "Anyone can view chatbot responses" ON public.chatbot_responses
  FOR SELECT
  USING (true);

-- Admins can manage chatbot responses
CREATE POLICY "Admins can manage chatbot responses" ON public.chatbot_responses
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- PAGE CONTENT TABLE POLICIES
-- ============================================

-- Everyone can view page content
CREATE POLICY "Anyone can view page content" ON public.page_content
  FOR SELECT
  USING (true);

-- Admins can manage page content
CREATE POLICY "Admins can manage page content" ON public.page_content
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- TELEGRAM SESSIONS TABLE POLICIES
-- ============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.telegram_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create sessions" ON public.telegram_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON public.telegram_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON public.telegram_sessions
  FOR SELECT
  USING (public.is_admin());
