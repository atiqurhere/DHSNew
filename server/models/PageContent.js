const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  pageType: {
    type: String,
    enum: ['about', 'contact'],
    required: true,
    unique: true
  },
  sections: [{
    type: {
      type: String,
      enum: ['hero', 'mission', 'vision', 'values', 'team', 'stats', 'contact-info', 'custom'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: String,
    order: {
      type: Number,
      default: 0
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    // For stats section
    stats: [{
      label: String,
      value: String,
      icon: String
    }],
    // For team section
    teamMembers: [{
      name: String,
      role: String,
      photo: String,
      bio: String
    }],
    // For contact-info section
    contactInfo: {
      phone: String,
      email: String,
      address: String,
      workingHours: String,
      emergencyPhone: String
    }
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PageContent', pageContentSchema);
