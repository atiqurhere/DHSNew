const express = require('express');
const router = express.Router();
const {
  createPayment,
  getMyPayments,
  getAllPayments,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.get('/stats', protect, authorize('admin'), getPaymentStats);

module.exports = router;
