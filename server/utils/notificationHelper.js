const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {String} params.userId - User ID to send notification to
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.type - Notification type
 * @param {String} params.relatedId - Related document ID (optional)
 * @param {String} params.relatedModel - Related model name (optional)
 */
const createNotification = async ({ userId, title, message, type, relatedId = null, relatedModel = null }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedModel
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Send welcome notification to new user
 */
const sendWelcomeNotification = async (userId, userName, role) => {
  const roleMessages = {
    patient: 'Welcome to Dhaka Health Service! Book your first home care service today.',
    staff: 'Welcome to the DHS team! Your application is under review.',
    admin: 'Welcome to DHS Admin Panel. You have full access to manage the platform.'
  };

  return createNotification({
    userId,
    title: `Welcome to DHS, ${userName}!`,
    message: roleMessages[role] || 'Welcome to Dhaka Health Service!',
    type: 'welcome'
  });
};

/**
 * Send booking notification to patient
 */
const sendBookingNotification = async (userId, bookingId, status, serviceName) => {
  const messages = {
    pending: `Your booking for ${serviceName} has been received and is pending approval.`,
    confirmed: `Great news! Your booking for ${serviceName} has been confirmed.`,
    assigned: `A staff member has been assigned to your ${serviceName} booking.`,
    'in-progress': `Your ${serviceName} service is now in progress.`,
    completed: `Your ${serviceName} service has been completed. Please provide feedback!`,
    cancelled: `Your booking for ${serviceName} has been cancelled.`,
    rejected: `We're sorry, but your booking for ${serviceName} has been rejected.`
  };

  const titles = {
    pending: 'Booking Received',
    confirmed: 'Booking Confirmed',
    assigned: 'Staff Assigned',
    'in-progress': 'Service In Progress',
    completed: 'Service Completed',
    cancelled: 'Booking Cancelled',
    rejected: 'Booking Rejected'
  };

  return createNotification({
    userId,
    title: titles[status] || 'Booking Update',
    message: messages[status] || `Your booking status has been updated to ${status}.`,
    type: 'booking_' + (status === 'confirmed' || status === 'cancelled' || status === 'completed' ? status : 'confirmed'),
    relatedId: bookingId,
    relatedModel: 'Booking'
  });
};

/**
 * Send payment notification
 */
const sendPaymentNotification = async (userId, paymentId, status, amount) => {
  const messages = {
    success: `Your payment of ৳${amount} has been processed successfully.`,
    pending: `Your payment of ৳${amount} is pending. Please complete the transaction.`,
    failed: `Your payment of ৳${amount} has failed. Please try again.`
  };

  return createNotification({
    userId,
    title: status === 'success' ? 'Payment Successful' : status === 'pending' ? 'Payment Pending' : 'Payment Failed',
    message: messages[status],
    type: 'payment_' + status,
    relatedId: paymentId,
    relatedModel: 'Payment'
  });
};

/**
 * Send staff application notification to admins
 */
const sendStaffApplicationNotification = async (staffId, staffName, specialization) => {
  try {
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });

    const notifications = admins.map(admin =>
      createNotification({
        userId: admin._id,
        title: 'New Staff Application',
        message: `${staffName} has applied as ${specialization}. Please review their application.`,
        type: 'staff_application',
        relatedId: staffId,
        relatedModel: 'User'
      })
    );

    return Promise.all(notifications);
  } catch (error) {
    console.error('Error sending staff application notification:', error);
    return null;
  }
};

/**
 * Send staff verification notification
 */
const sendStaffVerificationNotification = async (staffId, isApproved, rejectionReason = null) => {
  const message = isApproved
    ? 'Congratulations! Your staff application has been approved. You can now accept bookings.'
    : `Your staff application has been rejected. Reason: ${rejectionReason || 'Not specified'}`;

  return createNotification({
    userId: staffId,
    title: isApproved ? 'Application Approved' : 'Application Rejected',
    message,
    type: isApproved ? 'staff_verified' : 'staff_rejected'
  });
};

/**
 * Send new booking notification to admins
 */
const sendNewBookingNotificationToAdmins = async (bookingId, patientName, serviceName) => {
  try {
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });

    const notifications = admins.map(admin =>
      createNotification({
        userId: admin._id,
        title: 'New Booking Received',
        message: `${patientName} has booked ${serviceName}. Please assign staff.`,
        type: 'booking',
        relatedId: bookingId,
        relatedModel: 'Booking'
      })
    );

    return Promise.all(notifications);
  } catch (error) {
    console.error('Error sending booking notification to admins:', error);
    return null;
  }
};

/**
 * Send staff assignment notification
 */
const sendStaffAssignmentNotification = async (staffId, bookingId, serviceName, patientName) => {
  return createNotification({
    userId: staffId,
    title: 'New Assignment',
    message: `You have been assigned to provide ${serviceName} for ${patientName}.`,
    type: 'staff_assigned',
    relatedId: bookingId,
    relatedModel: 'Booking'
  });
};

/**
 * Send generic notification
 */
const sendNotification = async (userId, type, message, data = {}) => {
  const titles = {
    support_ticket_new: 'New Support Ticket',
    support_ticket_reply: 'Ticket Reply',
    support_ticket_assigned: 'Ticket Assigned',
    support_ticket_status: 'Ticket Status Update'
  };

  return createNotification({
    userId,
    title: titles[type] || 'Notification',
    message,
    type,
    relatedId: data.ticketId || null,
    relatedModel: data.ticketId ? 'SupportTicket' : null
  });
};

module.exports = {
  createNotification,
  sendWelcomeNotification,
  sendBookingNotification,
  sendPaymentNotification,
  sendStaffApplicationNotification,
  sendStaffVerificationNotification,
  sendNewBookingNotificationToAdmins,
  sendStaffAssignmentNotification,
  sendNotification
};
