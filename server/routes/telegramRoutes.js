const express = require('express');
const router = express.Router();
const {
  getBotConfig,
  updateBotConfig,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  requestLiveChat,
  sendChatMessage,
  getChatSession,
  endLiveChat,
  checkAvailability,
  getUserSessions,
  getAllSessions,
  testBotConnection
} = require('../controllers/telegramController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/availability', checkAvailability);

// User routes
router.post('/connect', protect, requestLiveChat);
router.post('/message/:sessionId', protect, sendChatMessage);
router.get('/session/:sessionId', protect, getChatSession);
router.post('/end/:sessionId', protect, endLiveChat);
router.get('/sessions', protect, getUserSessions);

// Admin routes
router.get('/config', protect, admin, getBotConfig);
router.put('/config', protect, admin, updateBotConfig);
router.post('/test-connection', protect, admin, testBotConnection);
router.get('/agents', protect, admin, getAllAgents);
router.post('/agents', protect, admin, createAgent);
router.put('/agents/:id', protect, admin, updateAgent);
router.delete('/agents/:id', protect, admin, deleteAgent);
router.get('/sessions/all', protect, admin, getAllSessions);

module.exports = router;
