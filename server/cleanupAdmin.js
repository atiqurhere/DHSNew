require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const deleteOldAdmin = async () => {
  try {
    // Delete the old admin@dhs.com account
    const result = await User.deleteOne({ email: 'admin@dhs.com' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Old admin account (admin@dhs.com) deleted successfully!');
    } else {
      console.log('ℹ️  Old admin account not found (may already be deleted)');
    }

    // Delete temp admin if exists
    const tempResult = await User.deleteOne({ email: 'temp.admin@dhs.com' });
    
    if (tempResult.deletedCount > 0) {
      console.log('✅ Temporary admin account deleted successfully!');
    }

    console.log('\n✅ Cleanup completed! You can now run: npm run seed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await deleteOldAdmin();
};

run();
