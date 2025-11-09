const mongoose = require('mongoose');

const liveChatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TelegramAgent'
  },
  status: {
    type: String,
    enum: ['waiting', 'connected', 'ended', 'timeout'],
    default: 'waiting'
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'agent', 'system'],
      required: true
    },
    senderName: String,
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  connectedAt: Date,
  endedAt: Date,
  endedBy: {
    type: String,
    enum: ['user', 'agent', 'system', 'timeout']
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  inactivityTimeout: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate session ID
liveChatSessionSchema.pre('save', async function(next) {
  if (this.isNew && !this.sessionId) {
    this.sessionId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('LiveChatSession', liveChatSessionSchema);
