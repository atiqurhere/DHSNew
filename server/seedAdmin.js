require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dhs.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';
    const ADMIN_PHONE = process.env.ADMIN_PHONE || '+880 1700-000000';
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('⚠️  Admin user already exists!');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log('-----------------------------------');
      return;
    }

    // Create admin user from environment variables
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phone: ADMIN_PHONE,
      role: 'admin',
      isVerified: true,
      permissions: {
        manageServices: true,
        manageStaff: true,
        manageBookings: true,
        managePayments: true,
        manageAdmins: true,
        viewReports: true
      },
      address: {
        street: 'Temporary Address',
        city: 'Dhaka',
        area: 'System',
        postalCode: '0000'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 IMPORTANT NOTES:');
    console.log('1. Login at: http://localhost:3000/admin/login');
    console.log('2. Change your password immediately after first login');
    console.log('3. Store credentials securely');
    console.log('4. For production, use strong unique password');
    console.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

const seedServices = async () => {
  try {
    const servicesCount = await Service.countDocuments();
    
    if (servicesCount > 0) {
      console.log(`\n${servicesCount} services already exist in database.`);
      return;
    }

    const services = [
      {
        name: 'Home Care Service',
        description: 'Professional home healthcare services including general care, monitoring, and assistance with daily activities.',
        category: 'home-care',
        price: 1500,
        duration: 'Per day',
        image: '/images/home-care.jpg',
        isAvailable: true,
        requirements: ['Basic medical history'],
        features: ['24/7 Support', 'Trained Caregivers', 'Regular Health Monitoring', 'Medication Management']
      },
      {
        name: 'Nurse Care',
        description: 'Experienced registered nurses for medical care, wound dressing, injections, and IV therapy at home.',
        category: 'nurse-care',
        price: 2000,
        duration: 'Per visit',
        image: '/images/nurse-care.jpg',
        isAvailable: true,
        requirements: ['Prescription required', 'Medical history'],
        features: ['Certified Nurses', 'Wound Care', 'Injection Services', 'Post-Surgery Care']
      },
      {
        name: 'Medicine Delivery',
        description: 'Fast and reliable medicine delivery service. Order your prescriptions and get them delivered to your doorstep.',
        category: 'medicine-delivery',
        price: 500,
        duration: 'One-time',
        image: '/images/medicine-delivery.jpg',
        isAvailable: true,
        requirements: ['Prescription required'],
        features: ['Fast Delivery', 'Quality Medicines', 'Cash on Delivery', 'Emergency Service Available']
      },
      {
        name: 'Doctor on Call',
        description: 'Consult with experienced doctors from the comfort of your home. Video or in-person consultation available.',
        category: 'doctor-on-call',
        price: 1000,
        duration: '30 minutes',
        image: '/images/doctor-call.jpg',
        isAvailable: true,
        requirements: ['Medical history'],
        features: ['Qualified Doctors', 'Video Consultation', 'Home Visit Available', 'Prescription Provided']
      },
      {
        name: 'Medical Equipment Rental',
        description: 'Rent medical equipment like wheelchairs, hospital beds, oxygen cylinders, and more.',
        category: 'equipment-rental',
        price: 800,
        duration: 'Per day',
        image: '/images/equipment.jpg',
        isAvailable: true,
        requirements: ['ID proof', 'Security deposit'],
        features: ['Quality Equipment', 'Delivery & Setup', 'Maintenance Included', 'Flexible Rental Period']
      },
      {
        name: 'Physiotherapy at Home',
        description: 'Professional physiotherapy services at home for post-surgery recovery, injury rehabilitation, and chronic pain management.',
        category: 'home-care',
        price: 1200,
        duration: 'Per session',
        image: '/images/physio.jpg',
        isAvailable: true,
        requirements: ['Doctor\'s prescription'],
        features: ['Certified Physiotherapists', 'Personalized Treatment', 'Home Equipment Provided', 'Progress Tracking']
      }
    ];

    await Service.insertMany(services);
    console.log(`\n✅ ${services.length} services seeded successfully!`);
    
  } catch (error) {
    console.error('Error seeding services:', error.message);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await seedAdmin();
  await seedServices();
  console.log('\n✅ Database seeding completed!');
  process.exit(0);
};

seedDatabase();
