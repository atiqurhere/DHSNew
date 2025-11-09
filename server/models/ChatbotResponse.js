const mongoose = require('mongoose');

const chatbotResponseSchema = new mongoose.Schema({
  intent: {
    type: String,
    required: true,
    unique: true
  },
  keywords: [{
    type: String,
    lowercase: true
  }],
  response: {
    type: String,
    required: true
  },
  followUpOptions: [{
    label: String,
    action: String
  }],
  category: {
    type: String,
    enum: ['greeting', 'services', 'booking', 'pricing', 'support', 'general'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatbotResponse', chatbotResponseSchema);
