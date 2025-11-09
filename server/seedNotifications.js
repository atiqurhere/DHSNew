const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find().limit(10);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Sample notifications for each user
    const notifications = [];
    for (const user of users) {
      // Create 3-5 notifications per user
      const notificationCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < notificationCount; i++) {
        const types = ['booking', 'payment', 'general', 'staff'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const titles = {
          booking: [
            'Booking Confirmed',
            'Booking Completed',
            'Booking Cancelled',
            'Booking Reminder',
            'Upcoming Appointment'
          ],
          payment: [
            'Payment Successful',
            'Payment Pending',
            'Refund Processed',
            'Invoice Available'
          ],
          general: [
            'Welcome to DHS',
            'Profile Updated',
            'New Service Available',
            'System Maintenance Notice'
          ],
          staff: [
            'Staff Assignment',
            'Verification Complete',
            'New Task Assigned'
          ]
        };

        const messages = {
          booking: [
            'Your booking has been confirmed and scheduled.',
            'Your appointment has been completed successfully.',
            'Your booking has been cancelled. Refund will be processed.',
            'You have an upcoming appointment tomorrow.',
            'Your appointment is scheduled for tomorrow at 10:00 AM.'
          ],
          payment: [
            'Your payment of ৳500 has been processed successfully.',
            'Your payment is pending. Please complete the transaction.',
            'A refund of ৳300 has been processed to your account.',
            'Your invoice is ready for download.'
          ],
          general: [
            'Welcome to Dhaka Health Service! We are here to help you.',
            'Your profile information has been updated successfully.',
            'Check out our new home care services.',
            'System maintenance scheduled for next Sunday.'
          ],
          staff: [
            'You have been assigned to a new booking.',
            'Your staff verification has been completed.',
            'A new task has been assigned to you.'
          ]
        };

        const titleOptions = titles[type];
        const messageOptions = messages[type];
        
        const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
        const message = messageOptions[Math.floor(Math.random() * messageOptions.length)];
        
        // Random date within last 7 days
        const daysAgo = Math.floor(Math.random() * 7);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        // 50% chance of being read
        const isRead = Math.random() > 0.5;

        notifications.push({
          user: user._id,
          title,
          message,
          type,
          isRead,
          createdAt
        });
      }
    }

    await Notification.insertMany(notifications);
    console.log(`✅ Successfully seeded ${notifications.length} notifications for ${users.length} users`);
    
    // Show summary
    const unreadCount = notifications.filter(n => !n.isRead).length;
    console.log(`📊 Summary:`);
    console.log(`   - Total notifications: ${notifications.length}`);
    console.log(`   - Unread: ${unreadCount}`);
    console.log(`   - Read: ${notifications.length - unreadCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
