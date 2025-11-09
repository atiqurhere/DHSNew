const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  category: {
    type: String,
    enum: ['home-care', 'nurse-care', 'medicine-delivery', 'doctor-on-call', 'equipment-rental'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Service price is required']
  },
  duration: {
    type: String, // e.g., "1 hour", "Per day", "One-time"
    default: 'One-time'
  },
  image: {
    type: String,
    default: '/images/default-service.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  requirements: [String], // e.g., "Prescription required"
  features: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
