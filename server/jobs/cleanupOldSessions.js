const LiveChatSession = require('../models/LiveChatSession');

/**
 * Clean up chat sessions older than 7 days
 * This should be run as a cron job or scheduled task
 */
const cleanupOldSessions = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    
    const result = await LiveChatSession.deleteMany({
      createdAt: { $lt: sevenDaysAgo }
    });

    console.log(`✅ Cleaned up ${result.deletedCount} chat sessions older than 7 days`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up old sessions:', error);
    throw error;
  }
};

module.exports = cleanupOldSessions;
