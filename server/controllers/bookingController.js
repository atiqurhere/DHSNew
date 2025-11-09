const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/Patient
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, scheduledTime, address, notes } = req.body;

    const service = await Service.findById(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.isAvailable) {
      return res.status(400).json({ message: 'Service is not available' });
    }

    const booking = await Booking.create({
      patient: req.user._id,
      service: serviceId,
      scheduledDate,
      scheduledTime,
      address: address || req.user.address,
      notes,
      prescription: req.file ? { url: req.file.path, uploadedAt: Date.now() } : undefined
    });

    // Create notification for admin
    await Notification.create({
      user: req.user._id, // This should be admin, but for simplicity
      title: 'New Booking',
      message: `New booking created for ${service.name}`,
      type: 'booking',
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service')
      .populate('patient', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ patient: req.user._id })
      .populate('service')
      .populate('staff', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private/Admin/Staff
exports.getAllBookings = async (req, res) => {
  try {
    let query = {};

    // If staff, only show assigned bookings
    if (req.user.role === 'staff') {
      query.staff = req.user._id;
    }

    const { status } = req.query;
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service')
      .populate('patient', 'name email phone address')
      .populate('staff', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('patient', 'name email phone address')
      .populate('staff', 'name phone email')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      booking.patient._id.toString() !== req.user._id.toString() &&
      (!booking.staff || booking.staff._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin/Staff
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    
    if (status === 'completed') {
      booking.completedAt = Date.now();
    }

    await booking.save();

    // Create notification for patient
    await Notification.create({
      user: booking.patient,
      title: 'Booking Status Updated',
      message: `Your booking status has been updated to ${status}`,
      type: 'booking',
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff to booking
// @route   PUT /api/bookings/:id/assign
// @access  Private/Admin
exports.assignStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    const staff = await User.findById(staffId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }

    booking.staff = staffId;
    booking.status = 'assigned';
    await booking.save();

    // Notify staff
    await Notification.create({
      user: staffId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task`,
      type: 'booking',
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback for booking
// @route   POST /api/bookings/:id/feedback
// @access  Private/Patient
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.feedback = {
      rating,
      comment,
      submittedAt: Date.now()
    };

    await booking.save();

    // Update staff rating if staff was assigned
    if (booking.staff) {
      const staff = await User.findById(booking.staff);
      const totalRatings = staff.totalRatings + 1;
      const newRating = ((staff.rating * staff.totalRatings) + rating) / totalRatings;
      
      staff.rating = newRating;
      staff.totalRatings = totalRatings;
      await staff.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
