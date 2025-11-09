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

const checkAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'temp.admin@dhs.com' });
    
    if (admin) {
      console.log('✅ Admin found in database:');
      console.log('-----------------------------------');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('isVerified:', admin.isVerified);
      console.log('Permissions:', admin.permissions);
      console.log('-----------------------------------');
      console.log('✅ Admin exists and ready to use!');
    } else {
      console.log('❌ Admin NOT found in database!');
      console.log('Please run: node seedAdmin.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await checkAdmin();
};

run();
