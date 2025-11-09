const mongoose = require('mongoose');

const telegramAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  telegramUserId: {
    type: String,
    required: true,
    unique: true
  },
  telegramUsername: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  currentChatSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveChatSession'
  },
  totalChatsHandled: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TelegramAgent', telegramAgentSchema);
