const mongoose = require('mongoose');

const telegramBotConfigSchema = new mongoose.Schema({
  botToken: {
    type: String,
    required: true
  },
  botUsername: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  webhookUrl: String,
  inactivityTimeout: {
    type: Number,
    default: 5 // minutes
  },
  autoResponseEnabled: {
    type: Boolean,
    default: true
  },
  welcomeMessage: {
    type: String,
    default: 'Welcome! You are now connected with a DHS support agent.'
  },
  offlineMessage: {
    type: String,
    default: 'All agents are currently busy. Please create a support ticket and we will respond shortly.'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TelegramBotConfig', telegramBotConfigSchema);
