const SupportTicket = require('../models/SupportTicket');
const { sendNotification } = require('../utils/notificationHelper');
const User = require('../models/User');

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      category,
      priority,
      messages: [{
        sender: req.user._id,
        senderRole: 'user',
        message
      }],
      lastResponseBy: 'user'
    });

    await ticket.populate('user', 'name email');

    // Notify all admins about new ticket
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification(
        admin._id,
        'support_ticket_new',
        `New support ticket: ${subject}`,
        { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
      );
    }

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's tickets
// @route   GET /api/support/tickets
// @access  Private
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/support/tickets/admin/all
// @access  Private/Admin
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email phone profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .populate('messages.sender', 'name email profilePicture');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (req.user.role !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read for the current user
    const userRole = req.user.role === 'admin' ? 'admin' : 'user';
    ticket.messages.forEach(msg => {
      if (msg.senderRole !== userRole) {
        msg.isRead = true;
      }
    });
    await ticket.save();

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add message to ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const senderRole = isAdmin ? 'admin' : 'user';
    
    ticket.messages.push({
      sender: req.user._id,
      senderRole,
      message
    });

    ticket.lastResponseAt = Date.now();
    ticket.lastResponseBy = senderRole;
    
    // Update status
    if (senderRole === 'user' && ticket.status === 'waiting-user') {
      ticket.status = 'waiting-admin';
    } else if (senderRole === 'admin' && ticket.status === 'waiting-admin') {
      ticket.status = 'waiting-user';
    } else if (ticket.status === 'open') {
      ticket.status = senderRole === 'admin' ? 'waiting-user' : 'waiting-admin';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name email profilePicture');

    // Send notification to the other party
    if (isAdmin) {
      await sendNotification(
        ticket.user,
        'support_ticket_reply',
        `Admin replied to your ticket: ${ticket.subject}`,
        { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
      );
    } else {
      // Notify assigned admin or all admins
      if (ticket.assignedTo) {
        await sendNotification(
          ticket.assignedTo,
          'support_ticket_reply',
          `User replied to ticket: ${ticket.subject}`,
          { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        );
      } else {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await sendNotification(
            admin._id,
            'support_ticket_reply',
            `User replied to ticket: ${ticket.subject}`,
            { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
          );
        }
      }
    }

    res.json({
      message: 'Message sent successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign ticket to admin
// @route   PUT /api/support/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = adminId;
    ticket.status = 'assigned';
    await ticket.save();

    // Notify assigned admin
    await sendNotification(
      adminId,
      'support_ticket_assigned',
      `You have been assigned to ticket: ${ticket.subject}`,
      { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
    );

    res.json({
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/tickets/:id/status
// @access  Private/Admin
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    
    if (status === 'resolved') {
      ticket.resolvedAt = Date.now();
    } else if (status === 'closed') {
      ticket.closedAt = Date.now();
    }

    await ticket.save();

    // Notify user
    await sendNotification(
      ticket.user,
      'support_ticket_status',
      `Your ticket status changed to: ${status}`,
      { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
    );

    res.json({
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate ticket
// @route   PUT /api/support/tickets/:id/rate
// @access  Private
exports.rateTicket = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.rating = rating;
    ticket.feedback = feedback;
    await ticket.save();

    res.json({
      message: 'Thank you for your feedback',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
