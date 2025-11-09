const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate mock transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      method,
      transactionId,
      paymentDetails,
      status: 'completed', // Mock payment - instant success
      completedAt: Date.now()
    });

    // Update booking with payment
    booking.payment = payment._id;
    booking.status = 'accepted';
    await booking.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Payment Successful',
      message: `Payment of ৳${amount} completed successfully`,
      type: 'payment',
      relatedId: payment._id,
      relatedModel: 'Payment'
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'booking',
        populate: { path: 'service' }
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: { path: 'service' }
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment statistics (Admin)
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
  try {
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

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
