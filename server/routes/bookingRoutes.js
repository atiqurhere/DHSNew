const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  assignStaff,
  submitFeedback
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, authorize('patient'), upload.single('prescription'), createBooking)
  .get(protect, authorize('admin', 'staff'), getAllBookings);

router.get('/my-bookings', protect, getMyBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.put('/:id/status', protect, authorize('admin', 'staff'), updateBookingStatus);
router.put('/:id/assign', protect, authorize('admin'), assignStaff);
router.post('/:id/feedback', protect, authorize('patient'), submitFeedback);

module.exports = router;
