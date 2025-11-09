const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const Feedback = require('../models/Feedback');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalStaff = await User.countDocuments({ role: 'staff', isVerified: true });
    const pendingStaff = await User.countDocuments({ role: 'staff', isVerified: false });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('patient', 'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings
      },
      users: {
        patients: totalPatients,
        staff: totalStaff,
        pendingStaff: pendingStaff
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff
// @route   GET /api/admin/staff
// @access  Private/Admin
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify staff
// @route   PUT /api/admin/staff/:id/verify
// @access  Private/Admin
exports.verifyStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.isVerified = true;
    staff.availability = 'available';
    await staff.save();

    res.json({ message: 'Staff verified successfully', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff details
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
exports.updateStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/admin/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .populate('service', 'name')
      .populate('staff', 'name')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/Admin
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, permissions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // If user exists, upgrade them to admin
      if (existingUser.role === 'admin') {
        return res.status(400).json({ message: 'User is already an admin' });
      }

      // Store the old role for the message
      const oldRole = existingUser.role;
      
      // Upgrade existing user to admin
      existingUser.role = 'admin';
      existingUser.permissions = permissions || {
        manageServices: false,
        manageStaff: false,
        manageBookings: false,
        managePayments: false,
        manageAdmins: false,
        viewReports: false
      };
      
      // Update name and phone if provided
      if (name) existingUser.name = name;
      if (phone) existingUser.phone = phone;
      
      await existingUser.save();
      
      const adminData = await User.findById(existingUser._id).select('-password');
      return res.status(200).json({ 
        message: `Existing ${oldRole} account upgraded to admin`,
        admin: adminData 
      });
    }

    // Create new admin if user doesn't exist
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      permissions: permissions || {
        manageServices: false,
        manageStaff: false,
        manageBookings: false,
        managePayments: false,
        manageAdmins: false,
        viewReports: false
      }
    });

    const adminData = await User.findById(admin._id).select('-password');
    res.status(201).json({ message: 'Admin created successfully', admin: adminData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, phone, permissions } = req.body;

    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;
    if (permissions) {
      admin.permissions = { ...admin.permissions, ...permissions };
    }

    await admin.save();

    const updatedAdmin = await User.findById(admin._id).select('-password');
    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private/Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin' });
    }

    await admin.deleteOne();
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('patient', 'name email phone')
      .populate('service', 'name price')
      .populate('assignedStaff', 'name specialization phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff to booking
// @route   PUT /api/admin/bookings/:id/assign-staff
// @access  Private/Admin
exports.assignStaffToBooking = async (req, res) => {
  try {
    const { staffId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff' || !staff.isVerified) {
      return res.status(400).json({ message: 'Invalid or unverified staff' });
    }

    booking.assignedStaff = staffId;
    booking.status = 'confirmed';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price')
      .populate('assignedStaff', 'name specialization phone');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price')
      .populate('assignedStaff', 'name specialization phone');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject staff application
// @route   PUT /api/admin/staff/:id/reject
// @access  Private/Admin
exports.rejectStaff = async (req, res) => {
  try {
    const { reason } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.verificationStatus = 'rejected';
    staff.rejectionReason = reason;
    await staff.save();

    res.json({ message: 'Staff application rejected', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
