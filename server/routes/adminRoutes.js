const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStaff,
  verifyStaff,
  updateStaff,
  deleteStaff,
  rejectStaff,
  getAllPatients,
  getAllFeedback,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllBookings,
  assignStaffToBooking,
  updateBookingStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Admin management
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Staff management
router.get('/staff', getAllStaff);
router.put('/staff/:id/verify', verifyStaff);
router.put('/staff/:id/reject', rejectStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/assign-staff', assignStaffToBooking);
router.put('/bookings/:id/status', updateBookingStatus);

// Patient management
router.get('/patients', getAllPatients);

// Feedback
router.get('/feedback', getAllFeedback);

module.exports = router;
