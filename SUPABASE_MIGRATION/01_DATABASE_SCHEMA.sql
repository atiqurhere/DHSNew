-- ============================================
-- SUPABASE POSTGRESQL SCHEMA FOR DHS HEALTHCARE APP
-- Migration from MongoDB to PostgreSQL
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'staff', 'admin')),
  
  -- Admin permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '{
    "manageServices": false,
    "manageStaff": false,
    "manageBookings": false,
    "managePayments": false,
    "manageAdmins": false,
    "viewReports": false
  }'::jsonb,
  
  -- Address (JSONB)
  address JSONB DEFAULT '{}'::jsonb,
  
  -- Staff-specific fields
  staff_type VARCHAR(50) CHECK (staff_type IN ('nurse', 'caregiver', 'doctor', 'delivery', 'technician') OR staff_type IS NULL),
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  specialization TEXT,
  experience TEXT,
  qualifications TEXT,
  availability VARCHAR(20) DEFAULT 'offline' CHECK (availability IN ('available', 'busy', 'offline')),
  
  -- Documents array (JSONB)
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Ratings
  rating NUMERIC(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  
  profile_picture TEXT DEFAULT '/uploads/default-avatar.png',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_staff_type ON users(staff_type);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_availability ON users(availability);

-- ============================================
-- 2. SERVICES TABLE
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('home-care', 'nurse-care', 'medicine-delivery', 'doctor-on-call', 'equipment-rental')),
  price NUMERIC(10, 2) NOT NULL,
  duration VARCHAR(100) DEFAULT 'One-time',
  image TEXT DEFAULT '/images/default-service.jpg',
  is_available BOOLEAN DEFAULT true,
  
  -- Arrays stored as JSONB
  requirements JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for services
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_available ON services(is_available);

-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(20) NOT NULL,
  
  -- Address (JSONB)
  address JSONB NOT NULL,
  
  -- Prescription (JSONB)
  prescription JSONB,
  
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'assigned', 'in-progress', 'completed', 'cancelled', 'rejected')),
  
  -- Feedback embedded (JSONB)
  feedback JSONB,
  
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- ============================================
-- 4. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount NUMERIC(10, 2) NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('bkash', 'nagad', 'card', 'cash')),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Payment details (JSONB)
  payment_details JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN (
    'welcome', 'booking', 'booking_confirmed', 'booking_cancelled', 'booking_completed',
    'payment', 'payment_success', 'payment_failed',
    'staff_application', 'staff_verified', 'staff_rejected', 'staff_assigned',
    'new_service', 'service_updated', 'profile_updated',
    'support_ticket_new', 'support_ticket_reply', 'support_ticket_assigned', 'support_ticket_status',
    'system', 'general'
  )),
  
  -- Polymorphic relationship
  related_id UUID,
  related_model VARCHAR(50) CHECK (related_model IN ('bookings', 'payments', 'users', 'services', 'support_tickets') OR related_model IS NULL),
  
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- 6. SUPPORT_TICKETS TABLE
-- ============================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'booking', 'general', 'complaint', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-progress', 'waiting-user', 'waiting-admin', 'resolved', 'closed')),
  
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Messages array (JSONB)
  messages JSONB DEFAULT '[]'::jsonb,
  
  last_response_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_response_by VARCHAR(20) CHECK (last_response_by IN ('user', 'admin') OR last_response_by IS NULL),
  
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5 OR rating IS NULL),
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for support_tickets
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- ============================================
-- 7. FEEDBACK TABLE
-- ============================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX idx_feedback_booking_id ON feedback(booking_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_service_id ON feedback(service_id);
CREATE INDEX idx_feedback_staff_id ON feedback(staff_id);
CREATE INDEX idx_feedback_is_public ON feedback(is_public);

-- ============================================
-- 8. LIVE_CHAT_SESSIONS TABLE
-- ============================================
CREATE TABLE live_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES telegram_agents(id) ON DELETE SET NULL,
  
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'ended', 'timeout')),
  
  -- Messages array (JSONB)
  messages JSONB DEFAULT '[]'::jsonb,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  ended_by VARCHAR(20) CHECK (ended_by IN ('user', 'agent', 'system', 'timeout') OR ended_by IS NULL),
  
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5 OR rating IS NULL),
  feedback TEXT,
  inactivity_timeout BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for live_chat_sessions
CREATE INDEX idx_live_chat_sessions_user_id ON live_chat_sessions(user_id);
CREATE INDEX idx_live_chat_sessions_agent_id ON live_chat_sessions(agent_id);
CREATE INDEX idx_live_chat_sessions_status ON live_chat_sessions(status);
CREATE INDEX idx_live_chat_sessions_session_id ON live_chat_sessions(session_id);
CREATE INDEX idx_live_chat_sessions_created_at ON live_chat_sessions(created_at);

-- ============================================
-- 9. CHATBOT_RESPONSES TABLE
-- ============================================
CREATE TABLE chatbot_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent VARCHAR(255) NOT NULL UNIQUE,
  keywords JSONB DEFAULT '[]'::jsonb,
  response TEXT NOT NULL,
  
  -- Follow-up options (JSONB)
  follow_up_options JSONB DEFAULT '[]'::jsonb,
  
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('greeting', 'services', 'booking', 'pricing', 'support', 'general')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chatbot_responses
CREATE INDEX idx_chatbot_responses_intent ON chatbot_responses(intent);
CREATE INDEX idx_chatbot_responses_category ON chatbot_responses(category);
CREATE INDEX idx_chatbot_responses_is_active ON chatbot_responses(is_active);

-- ============================================
-- 10. TELEGRAM_AGENTS TABLE
-- ============================================
CREATE TABLE telegram_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  telegram_user_id VARCHAR(255) NOT NULL UNIQUE,
  telegram_username VARCHAR(255),
  
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT false,
  current_chat_session_id UUID REFERENCES live_chat_sessions(id) ON DELETE SET NULL,
  
  total_chats_handled INTEGER DEFAULT 0,
  average_response_time NUMERIC(10, 2) DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for telegram_agents
CREATE INDEX idx_telegram_agents_telegram_user_id ON telegram_agents(telegram_user_id);
CREATE INDEX idx_telegram_agents_is_available ON telegram_agents(is_available);

-- ============================================
-- 11. TELEGRAM_BOT_CONFIG TABLE (Single Row)
-- ============================================
CREATE TABLE telegram_bot_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_token VARCHAR(500) NOT NULL,
  bot_username VARCHAR(255) NOT NULL,
  
  is_active BOOLEAN DEFAULT false,
  webhook_url TEXT,
  inactivity_timeout INTEGER DEFAULT 5, -- minutes
  auto_response_enabled BOOLEAN DEFAULT true,
  
  welcome_message TEXT DEFAULT 'Welcome! You are now connected with a DHS support agent.',
  offline_message TEXT DEFAULT 'All agents are currently busy. Please create a support ticket and we will respond shortly.',
  
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one config row
  CONSTRAINT single_row_constraint UNIQUE (id)
);

-- ============================================
-- 12. PAGE_CONTENT TABLE
-- ============================================
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type VARCHAR(50) NOT NULL UNIQUE CHECK (page_type IN ('about', 'contact')),
  
  -- Sections array (JSONB)
  sections JSONB DEFAULT '[]'::jsonb,
  
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for page_content
CREATE INDEX idx_page_content_page_type ON page_content(page_type);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_chat_sessions_updated_at BEFORE UPDATE ON live_chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_responses_updated_at BEFORE UPDATE ON chatbot_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_agents_updated_at BEFORE UPDATE ON telegram_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_bot_config_updated_at BEFORE UPDATE ON telegram_bot_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'TKT-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || LPAD((SELECT COUNT(*) + 1 FROM support_tickets)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Function to generate session ID for live chat
CREATE OR REPLACE FUNCTION generate_session_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_id IS NULL THEN
    NEW.session_id := 'CHAT-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || substr(md5(random()::text), 1, 9);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_session_id_trigger BEFORE INSERT ON live_chat_sessions FOR EACH ROW EXECUTE FUNCTION generate_session_id();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for booking details with all relations
CREATE VIEW booking_details AS
SELECT 
  b.id,
  b.scheduled_date,
  b.scheduled_time,
  b.address,
  b.notes,
  b.status,
  b.completed_at,
  b.created_at,
  b.updated_at,
  b.feedback,
  -- Patient info
  jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'email', p.email,
    'phone', p.phone,
    'address', p.address
  ) as patient,
  -- Service info
  jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'description', s.description,
    'category', s.category,
    'price', s.price,
    'image', s.image
  ) as service,
  -- Staff info
  CASE WHEN b.staff_id IS NOT NULL THEN
    jsonb_build_object(
      'id', st.id,
      'name', st.name,
      'email', st.email,
      'phone', st.phone,
      'staffType', st.staff_type
    )
  ELSE NULL END as staff,
  -- Payment info
  CASE WHEN p2.id IS NOT NULL THEN
    jsonb_build_object(
      'id', p2.id,
      'amount', p2.amount,
      'method', p2.method,
      'status', p2.status,
      'transactionId', p2.transaction_id
    )
  ELSE NULL END as payment
FROM bookings b
JOIN users p ON b.patient_id = p.id
JOIN services s ON b.service_id = s.id
LEFT JOIN users st ON b.staff_id = st.id
LEFT JOIN payments p2 ON p2.booking_id = b.id;

-- View for user statistics
CREATE VIEW user_statistics AS
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  COUNT(*) FILTER (WHERE role = 'staff' AND is_verified = true) as verified_staff,
  COUNT(*) FILTER (WHERE role = 'staff' AND verification_status = 'pending') as pending_staff
FROM users
GROUP BY role;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User accounts with roles: patient, staff, admin';
COMMENT ON TABLE services IS 'Healthcare services offered';
COMMENT ON TABLE bookings IS 'Service appointments/bookings';
COMMENT ON TABLE payments IS 'Payment transactions for bookings';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE support_tickets IS 'Customer support tickets with messages';
COMMENT ON TABLE feedback IS 'User feedback and ratings for services';
COMMENT ON TABLE live_chat_sessions IS 'Live chat sessions with Telegram agents';
COMMENT ON TABLE chatbot_responses IS 'Automated chatbot responses';
COMMENT ON TABLE telegram_agents IS 'Telegram agents for live support';
COMMENT ON TABLE telegram_bot_config IS 'Telegram bot configuration (single row)';
COMMENT ON TABLE page_content IS 'CMS content for About and Contact pages';
