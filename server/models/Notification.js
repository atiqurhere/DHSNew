const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'welcome',           // Welcome notification for new users
      'booking',           // Booking related
      'booking_confirmed', // Booking confirmed
      'booking_cancelled', // Booking cancelled
      'booking_completed', // Booking completed
      'payment',           // Payment related
      'payment_success',   // Payment successful
      'payment_failed',    // Payment failed
      'staff_application', // New staff application (admin)
      'staff_verified',    // Staff verification complete
      'staff_rejected',    // Staff verification rejected
      'staff_assigned',    // Staff assigned to booking
      'new_service',       // New service added
      'service_updated',   // Service updated
      'profile_updated',   // Profile updated
      'support_ticket_new',      // New support ticket created
      'support_ticket_reply',    // Reply to support ticket
      'support_ticket_assigned', // Ticket assigned to admin
      'support_ticket_status',   // Ticket status changed
      'system',            // System notifications
      'general'            // General notifications
    ],
    default: 'general'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Payment', 'User', 'Service', 'SupportTicket', null]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
