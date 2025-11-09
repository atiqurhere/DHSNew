const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Notification = require('./models/Notification');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count documents in each collection
    const userCount = await User.countDocuments();
    const serviceCount = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const notificationCount = await Notification.countDocuments();

    console.log('📊 Database Statistics:');
    console.log('═══════════════════════');
    console.log(`Users:         ${userCount}`);
    console.log(`Services:      ${serviceCount}`);
    console.log(`Bookings:      ${bookingCount}`);
    console.log(`Notifications: ${notificationCount}`);
    console.log('');

    // Show user breakdown
    const patients = await User.countDocuments({ role: 'patient' });
    const staff = await User.countDocuments({ role: 'staff' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    console.log('👥 Users by Role:');
    console.log('═════════════════');
    console.log(`Patients: ${patients}`);
    console.log(`Staff:    ${staff}`);
    console.log(`Admins:   ${admins}`);
    console.log('');

    // Show sample users
    if (userCount > 0) {
      console.log('📝 Sample Users:');
      console.log('════════════════');
      const sampleUsers = await User.find().select('name email role').limit(5);
      sampleUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('');
    }

    // Show sample services
    if (serviceCount > 0) {
      console.log('🏥 Sample Services:');
      console.log('══════════════════');
      const sampleServices = await Service.find().select('name category price').limit(5);
      sampleServices.forEach(service => {
        console.log(`- ${service.name} (${service.category}) - ৳${service.price}`);
      });
      console.log('');
    }

    // Show notification breakdown
    if (notificationCount > 0) {
      const unreadNotifications = await Notification.countDocuments({ isRead: false });
      console.log('🔔 Notification Status:');
      console.log('═════════════════════');
      console.log(`Total:  ${notificationCount}`);
      console.log(`Unread: ${unreadNotifications}`);
      console.log(`Read:   ${notificationCount - unreadNotifications}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }
};

checkData();
