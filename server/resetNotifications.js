const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const { sendWelcomeNotification } = require('./utils/notificationHelper');

const resetNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all existing notifications
    const deleteResult = await Notification.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing notifications\n`);

    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      process.exit(0);
    }

    console.log(`👥 Found ${users.length} users. Creating welcome notifications...\n`);

    // Create welcome notification for each user
    let successCount = 0;
    for (const user of users) {
      const notification = await sendWelcomeNotification(user._id, user.name, user.role);
      if (notification) {
        successCount++;
        console.log(`✅ Created welcome notification for ${user.name} (${user.role})`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Welcome notifications created: ${successCount}`);
    console.log(`   - All notifications are unread by default`);

    const finalCount = await Notification.countDocuments();
    console.log(`\n🔔 Total notifications in database: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting notifications:', error);
    process.exit(1);
  }
};

resetNotifications();
