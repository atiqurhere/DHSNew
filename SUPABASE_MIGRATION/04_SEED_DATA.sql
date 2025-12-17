-- ============================================
-- INITIAL DATA SEED FOR DHS HEALTHCARE
-- Run this in Supabase SQL Editor
-- ============================================

-- Temporarily disable RLS to allow insertion
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- INSERT SAMPLE SERVICES (8 healthcare services)
-- ============================================

INSERT INTO services (name, category, description, price, duration, image, is_available, created_at)
VALUES
  (
    'General Consultation',
    'doctor-on-call',
    'Comprehensive health check-up and medical consultation with our experienced doctors.',
    50,
    '30 mins',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    true,
    NOW()
  ),
  (
    'Specialist Consultation',
    'doctor-on-call',
    'Consultation with specialist doctors for specific health conditions.',
    100,
    '45 mins',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500',
    true,
    NOW()
  ),
  (
    'Home Nursing Care',
    'nurse-care',
    'Professional nursing care in the comfort of your home.',
    80,
    '2 hours',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500',
    true,
    NOW()
  ),
  (
    'Physiotherapy Session',
    'home-care',
    'Expert physiotherapy for rehabilitation and pain management.',
    60,
    '1 hour',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500',
    true,
    NOW()
  ),
  (
    'Blood Test at Home',
    'home-care',
    'Complete blood work done at your doorstep with results in 24 hours.',
    40,
    '20 mins',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500',
    true,
    NOW()
  ),
  (
    'Elderly Care Package',
    'home-care',
    'Comprehensive care package for elderly patients including daily assistance.',
    150,
    '4 hours',
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500',
    true,
    NOW()
  ),
  (
    'Mental Health Counseling',
    'doctor-on-call',
    'Professional counseling services for mental health and wellness.',
    75,
    '50 mins',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500',
    true,
    NOW()
  ),
  (
    'Medicine Delivery',
    'medicine-delivery',
    'Fast and reliable delivery of prescribed medicines to your doorstep.',
    30,
    '1-2 hours',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    true,
    NOW()
  );

-- ============================================
-- RE-ENABLE RLS POLICIES
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFY DATA
-- ============================================

SELECT COUNT(*) as service_count FROM services;

-- Expected output: service_count = 8
