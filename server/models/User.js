const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  role: {
    type: String,
    enum: ['patient', 'staff', 'admin'],
    default: 'patient'
  },
  // Admin permissions
  permissions: {
    manageServices: { type: Boolean, default: false },
    manageStaff: { type: Boolean, default: false },
    manageBookings: { type: Boolean, default: false },
    managePayments: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false }
  },
  address: {
    street: String,
    city: String,
    area: String,
    postalCode: String
  },
  // Staff-specific fields
  staffType: {
    type: String,
    enum: ['nurse', 'caregiver', 'doctor', 'delivery', 'technician', null],
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  specialization: String,
  experience: String,
  qualifications: String,
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: '/uploads/default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
