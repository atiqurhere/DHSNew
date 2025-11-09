require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const testLogin = async () => {
  try {
    const email = 'temp.admin@dhs.com';
    const password = 'TempAdmin@2024!Setup';

    console.log('Testing login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('-----------------------------------');

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found in database');
    console.log('Stored password hash:', user.password);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('✅ Password match! Login should work!');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('This means the password in database is different from what we\'re testing');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await testLogin();
};

run();
