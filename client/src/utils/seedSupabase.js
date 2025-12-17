import { supabase } from '../lib/supabase';

/**
 * Seed Supabase Database with Initial Data
 * Uses Supabase client with proper authentication
 */

const SAMPLE_SERVICES = [
  {
    name: 'General Consultation',
    category: 'doctor-on-call',
    description: 'Comprehensive health check-up and medical consultation with our experienced doctors.',
    price: 50,
    duration: '30 mins',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    is_available: true
  },
  {
    name: 'Specialist Consultation',
    category: 'doctor-on-call',
    description: 'Consultation with specialist doctors for specific health conditions.',
    price: 100,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500',
    is_available: true
  },
  {
    name: 'Home Nursing Care',
    category: 'nurse-care',
    description: 'Professional nursing care in the comfort of your home.',
    price: 80,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500',
    is_available: true
  },
  {
    name: 'Physiotherapy Session',
    category: 'home-care',
    description: 'Expert physiotherapy for rehabilitation and pain management.',
    price: 60,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500',
    is_available: true
  },
  {
    name: 'Blood Test at Home',
    category: 'home-care',
    description: 'Complete blood work done at your doorstep with results in 24 hours.',
    price: 40,
    duration: '20 mins',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500',
    is_available: true
  },
  {
    name: 'Elderly Care Package',
    category: 'home-care',
    description: 'Comprehensive care package for elderly patients including daily assistance.',
    price: 150,
    duration: '4 hours',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500',
    is_available: true
  },
  {
    name: 'Mental Health Counseling',
    category: 'doctor-on-call',
    description: 'Professional counseling services for mental health and wellness.',
    price: 75,
    duration: '50 mins',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500',
    is_available: true
  },
  {
    name: 'Medicine Delivery',
    category: 'medicine-delivery',
    description: 'Fast and reliable delivery of prescribed medicines to your doorstep.',
    price: 30,
    duration: '1-2 hours',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    is_available: true
  }
];

export const seedServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(SAMPLE_SERVICES)
      .select();
    
    if (error) {
      console.error('Error seeding services:', error);
      return { error: error.message };
    }
    
    return { data, message: `${SAMPLE_SERVICES.length} services added successfully` };
  } catch (error) {
    console.error('Seed error:', error);
    return { error: error.message };
  }
};

export const seedNotifications = async (userId) => {
  if (!userId) {
    return { error: 'User ID required' };
  }

  const welcomeNotifications = [
    {
      user_id: userId,
      title: 'Welcome to DHS Healthcare',
      message: 'Thank you for joining our healthcare platform. Explore our services and book your first appointment!',
      type: 'info',
      is_read: false
    },
    {
      user_id: userId,
      title: 'Special Offer',
      message: 'Get 20% off on your first home nursing service booking. Use code: FIRST20',
      type: 'promotion',
      is_read: false
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(welcomeNotifications)
      .select();
    
    if (error) {
      console.error('Error seeding notifications:', error);
      return { error: error.message };
    }
    
    return { data, message: `${welcomeNotifications.length} notifications added` };
  } catch (error) {
    console.error('Seed error:', error);
    return { error: error.message };
  }
};

