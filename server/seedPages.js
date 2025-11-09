require('dotenv').config();
const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');
const ChatbotResponse = require('./models/ChatbotResponse');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await PageContent.deleteMany({});
    await ChatbotResponse.deleteMany({});

    // Seed About Page
    const aboutPage = await PageContent.create({
      pageType: 'about',
      sections: [
        {
          type: 'hero',
          title: 'About Dhaka Health Service',
          content: 'DHS is Bangladesh\'s leading home healthcare provider, bringing professional medical services directly to your doorstep. We combine medical expertise with compassionate care to ensure your comfort and well-being.',
          imageUrl: '/images/about-hero.jpg',
          order: 1,
          isVisible: true
        },
        {
          type: 'mission',
          title: 'Our Mission',
          content: 'To provide accessible, affordable, and high-quality healthcare services at home, making professional medical care available to everyone in Dhaka and beyond.',
          order: 2,
          isVisible: true
        },
        {
          type: 'vision',
          title: 'Our Vision',
          content: 'To revolutionize healthcare delivery in Bangladesh by creating a comprehensive home healthcare ecosystem that prioritizes patient comfort, safety, and satisfaction.',
          order: 3,
          isVisible: true
        },
        {
          type: 'values',
          title: 'Our Core Values',
          content: 'Excellence in Care • Compassion & Empathy • Professional Integrity • Innovation • Patient-Centered Approach • Accessibility for All',
          order: 4,
          isVisible: true
        },
        {
          type: 'stats',
          title: 'Our Impact',
          content: 'Numbers that speak for themselves',
          order: 5,
          isVisible: true,
          stats: [
            { label: 'Happy Patients', value: '10,000+', icon: 'users' },
            { label: 'Professional Staff', value: '500+', icon: 'user-nurse' },
            { label: 'Services Provided', value: '50+', icon: 'heartbeat' },
            { label: 'Years of Service', value: '5+', icon: 'calendar' }
          ]
        },
        {
          type: 'team',
          title: 'Meet Our Leadership',
          content: 'Dedicated professionals committed to your health',
          order: 6,
          isVisible: true,
          teamMembers: [
            {
              name: 'Dr. Aminul Islam',
              role: 'Chief Medical Officer',
              photo: '/images/team/doctor1.jpg',
              bio: 'MBBS, MD with 20+ years of experience in home healthcare'
            },
            {
              name: 'Fatima Rahman',
              role: 'Director of Nursing',
              photo: '/images/team/nurse1.jpg',
              bio: 'MSN, 15 years leading nursing excellence programs'
            },
            {
              name: 'Kamal Hossain',
              role: 'Operations Manager',
              photo: '/images/team/manager1.jpg',
              bio: 'MBA, Specialist in healthcare operations and logistics'
            }
          ]
        },
        {
          type: 'custom',
          title: 'Why Choose DHS?',
          content: '• Qualified & Experienced Professionals\n• 24/7 Emergency Services\n• Affordable Pricing\n• Modern Medical Equipment\n• Comprehensive Care Plans\n• Insurance Accepted\n• Easy Online Booking\n• Transparent Communication',
          order: 7,
          isVisible: true
        }
      ]
    });

    // Seed Contact Page
    const contactPage = await PageContent.create({
      pageType: 'contact',
      sections: [
        {
          type: 'hero',
          title: 'Get In Touch',
          content: 'We\'re here to help! Reach out to us through any of the channels below, or use our AI chatbot for instant assistance.',
          order: 1,
          isVisible: true
        },
        {
          type: 'contact-info',
          title: 'Contact Information',
          content: 'Our support team is available to assist you',
          order: 2,
          isVisible: true,
          contactInfo: {
            phone: '+880 1700-000000',
            email: 'support@dhsbd.com',
            address: 'House 123, Road 45, Gulshan-2, Dhaka-1212, Bangladesh',
            workingHours: 'Mon-Sat: 8:00 AM - 10:00 PM\nSun: 9:00 AM - 6:00 PM',
            emergencyPhone: '+880 1900-000000 (24/7 Emergency)'
          }
        },
        {
          type: 'custom',
          title: 'Quick Support',
          content: 'Use our AI chatbot for instant answers to common questions, or create a support ticket to speak with a human agent. We typically respond within 1 hour during business hours.',
          order: 3,
          isVisible: true
        }
      ]
    });

    // Seed Chatbot Responses
    const chatbotResponses = [
      {
        intent: 'greeting',
        keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste'],
        response: 'Hello! Welcome to Dhaka Health Service. How can I assist you today?',
        category: 'greeting',
        priority: 10,
        followUpOptions: [
          { label: 'View Services', action: 'view_services' },
          { label: 'Book Service', action: 'book_service' },
          { label: 'Contact Us', action: 'view_contact' }
        ]
      },
      {
        intent: 'services_info',
        keywords: ['service', 'services', 'what do you offer', 'care types', 'medical services'],
        response: 'We offer comprehensive home healthcare services including:\n\n• Nursing Care\n• Physiotherapy\n• Doctor Visits\n• Medical Tests\n• Elderly Care\n• Post-Surgery Care\n• Medication Management\n\nWould you like to book any of these services?',
        category: 'services',
        priority: 9,
        followUpOptions: [
          { label: 'Book Now', action: 'book_service' },
          { label: 'View Pricing', action: 'view_pricing' },
          { label: 'Talk to Agent', action: 'create_ticket' }
        ]
      },
      {
        intent: 'booking_process',
        keywords: ['how to book', 'booking', 'appointment', 'schedule', 'reserve'],
        response: 'Booking with DHS is easy!\n\n1. Login/Register on our website\n2. Browse our services\n3. Select your preferred service\n4. Choose date and time\n5. Confirm booking\n\nYou can also call us at +880 1700-000000 for assistance.',
        category: 'booking',
        priority: 8,
        followUpOptions: [
          { label: 'Start Booking', action: 'book_service' },
          { label: 'View Services', action: 'view_services' },
          { label: 'Need Help', action: 'create_ticket' }
        ]
      },
      {
        intent: 'pricing',
        keywords: ['price', 'cost', 'fee', 'charge', 'how much', 'rate'],
        response: 'Our pricing varies by service type:\n\n• Basic Nursing: ৳500-800/visit\n• Doctor Visit: ৳1500-3000\n• Physiotherapy: ৳800-1200/session\n• Medical Tests: Varies by test\n\nFor detailed pricing, please view our services page or speak with an agent.',
        category: 'pricing',
        priority: 7,
        followUpOptions: [
          { label: 'View Services', action: 'view_services' },
          { label: 'Book Service', action: 'book_service' },
          { label: 'Talk to Agent', action: 'create_ticket' }
        ]
      },
      {
        intent: 'emergency',
        keywords: ['emergency', 'urgent', 'immediately', 'asap', 'critical'],
        response: '🚨 For medical emergencies, please call our 24/7 hotline:\n\n📞 +880 1900-000000\n\nOur emergency response team will assist you immediately!',
        category: 'support',
        priority: 10,
        followUpOptions: [
          { label: 'Regular Booking', action: 'book_service' },
          { label: 'Contact Info', action: 'view_contact' }
        ]
      },
      {
        intent: 'payment_methods',
        keywords: ['payment', 'pay', 'bkash', 'nagad', 'card', 'cash'],
        response: 'We accept multiple payment methods:\n\n💳 Credit/Debit Cards\n📱 bKash\n📱 Nagad\n💵 Cash on Service\n🏦 Bank Transfer\n\nPayment is securely processed after service completion.',
        category: 'general',
        priority: 6,
        followUpOptions: [
          { label: 'Book Service', action: 'book_service' },
          { label: 'Need Help', action: 'create_ticket' }
        ]
      },
      {
        intent: 'working_hours',
        keywords: ['working hours', 'open', 'timing', 'schedule', 'available', 'when'],
        response: 'Our office hours:\n\n🕐 Mon-Sat: 8:00 AM - 10:00 PM\n🕐 Sunday: 9:00 AM - 6:00 PM\n\n🚨 Emergency services: 24/7\n\nYou can book services online anytime!',
        category: 'general',
        priority: 5,
        followUpOptions: [
          { label: 'Book Now', action: 'book_service' },
          { label: 'Emergency Contact', action: 'view_contact' }
        ]
      },
      {
        intent: 'talk_to_human',
        keywords: ['human', 'agent', 'person', 'representative', 'staff', 'talk to someone'],
        response: 'I can connect you with one of our live support agents via Telegram. Would you like me to check for available agents?',
        category: 'support',
        priority: 10,
        followUpOptions: [
          { label: 'Talk to Human Agent', action: 'create_ticket' },
          { label: 'Continue with Bot', action: 'continue' }
        ]
      }
    ];

    await ChatbotResponse.insertMany(chatbotResponses);

    console.log('✅ About page seeded successfully');
    console.log('✅ Contact page seeded successfully');
    console.log('✅ Chatbot responses seeded successfully');
    console.log(`\nSeeded ${aboutPage.sections.length} sections for About page`);
    console.log(`Seeded ${contactPage.sections.length} sections for Contact page`);
    console.log(`Seeded ${chatbotResponses.length} chatbot responses`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
