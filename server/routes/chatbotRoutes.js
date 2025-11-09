const express = require('express');
const router = express.Router();
const {
  getChatbotResponse,
  getAllResponses,
  createResponse,
  updateResponse,
  deleteResponse
} = require('../controllers/chatbotController');
const { protect, admin } = require('../middleware/auth');

// Public route
router.post('/query', getChatbotResponse);

// Admin routes
router.get('/responses', protect, admin, getAllResponses);
router.post('/responses', protect, admin, createResponse);
router.put('/responses/:id', protect, admin, updateResponse);
router.delete('/responses/:id', protect, admin, deleteResponse);

module.exports = router;
