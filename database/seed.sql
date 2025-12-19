-- ============================================
-- SEED DATA FOR DHS HEALTHCARE
-- ============================================
-- Sample services and chatbot responses for initial setup

-- ============================================
-- SAMPLE SERVICES
-- ============================================
INSERT INTO public.services (name, category, description, price, duration, image, is_active)
VALUES
  ('General Consultation', 'Consultation', 'Comprehensive health check-up and medical consultation with our experienced doctors.', 50.00, '30 mins', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500', true),
  ('Specialist Consultation', 'Consultation', 'Consultation with specialist doctors for specific health conditions.', 100.00, '45 mins', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500', true),
  ('Home Nursing Care', 'Home Care', 'Professional nursing care in the comfort of your home.', 80.00, '2 hours', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500', true),
  ('Physiotherapy Session', 'Therapy', 'Expert physiotherapy for rehabilitation and pain management.', 60.00, '1 hour', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500', true),
  ('Blood Test at Home', 'Laboratory', 'Complete blood work done at your doorstep with results in 24 hours.', 40.00, '20 mins', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500', true),
  ('Elderly Care Package', 'Home Care', 'Comprehensive care package for elderly patients including daily assistance.', 150.00, '4 hours', 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500', true),
  ('Mental Health Counseling', 'Consultation', 'Professional counseling services for mental health and wellness.', 75.00, '50 mins', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500', true),
  ('Vaccination Service', 'Preventive Care', 'All types of vaccinations administered by certified healthcare professionals.', 30.00, '15 mins', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CHATBOT RESPONSES
-- ============================================
INSERT INTO public.chatbot_responses (keyword, response, category)
VALUES
  ('hello', 'Hello! Welcome to DHS Healthcare. How can I assist you today?', 'greeting'),
  ('hi', 'Hi there! I''m here to help you with your healthcare needs. What can I do for you?', 'greeting'),
  ('services', 'We offer a wide range of healthcare services including consultations, home care, therapy, and laboratory services. You can view all our services on the Services page.', 'services'),
  ('booking', 'To book a service, please browse our Services page, select the service you need, and click "Book Now". You''ll need to be logged in to complete the booking.', 'booking'),
  ('payment', 'We accept various payment methods including credit/debit cards and online payment platforms. Payment is required after booking confirmation.', 'payment'),
  ('hours', 'Our services are available 24/7. You can book appointments at your convenience, and our staff will coordinate with you for the best time.', 'hours'),
  ('contact', 'You can reach us through the Contact page or create a support ticket if you need assistance. Our team will respond within 24 hours.', 'contact'),
  ('emergency', 'For medical emergencies, please call 911 or your local emergency number immediately. Our services are for non-emergency healthcare needs.', 'emergency')
ON CONFLICT DO NOTHING;
