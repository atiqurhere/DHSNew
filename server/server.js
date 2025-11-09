require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const { initializeTelegramBot } = require('./utils/telegramBotService');
const cleanupOldSessions = require('./jobs/cleanupOldSessions');

// Connect to database
connectDB();

// Initialize Telegram Bot (will only start if configured)
setTimeout(() => {
  initializeTelegramBot().catch(err => {
    console.log('Telegram bot not initialized:', err.message);
  });
}, 2000); // Wait for DB connection

// Run cleanup job on startup and then daily
setTimeout(() => {
  cleanupOldSessions().catch(err => {
    console.log('Error running cleanup job:', err.message);
  });
  
  // Schedule cleanup to run every 24 hours
  setInterval(() => {
    cleanupOldSessions().catch(err => {
      console.log('Error running cleanup job:', err.message);
    });
  }, 24 * 60 * 60 * 1000); // 24 hours
}, 5000); // Wait 5 seconds after startup

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/telegram', require('./routes/telegramRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DHS API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
