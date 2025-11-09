const express = require('express');
const router = express.Router();
const {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicket,
  addMessage,
  assignTicket,
  updateTicketStatus,
  rateTicket
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/auth');

// Admin routes (must be before :id routes)
router.get('/tickets/admin/all', protect, admin, getAllTickets);
router.put('/tickets/:id/assign', protect, admin, assignTicket);
router.put('/tickets/:id/status', protect, admin, updateTicketStatus);

// User routes
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getUserTickets);
router.get('/tickets/:id', protect, getTicket);
router.post('/tickets/:id/messages', protect, addMessage);
router.put('/tickets/:id/rate', protect, rateTicket);

module.exports = router;
