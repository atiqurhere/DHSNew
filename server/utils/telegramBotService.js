const TelegramBot = require('node-telegram-bot-api');
const LiveChatSession = require('../models/LiveChatSession');
const TelegramAgent = require('../models/TelegramAgent');
const TelegramBotConfig = require('../models/TelegramBotConfig');
const { sendNotification } = require('./notificationHelper');

let bot = null;
let inactivityCheckInterval = null;

// Initialize Telegram Bot
const initializeTelegramBot = async () => {
  try {
    const config = await TelegramBotConfig.findOne();
    
    if (!config || !config.isActive) {
      console.log('Telegram bot is not configured or not active');
      return false;
    }

    if (bot) {
      bot.stopPolling();
    }

    bot = new TelegramBot(config.botToken, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

    // Handle polling errors silently (connection resets are normal)
    bot.on('polling_error', (error) => {
      // Only log critical errors, ignore connection resets
      if (error.code !== 'EFATAL' && error.code !== 'ECONNRESET') {
        console.error('Telegram polling error:', error.code, error.message);
      }
    });

    // Handle messages from agents
    bot.on('message', async (msg) => {
      await handleAgentMessage(msg);
    });

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const agent = await TelegramAgent.findOne({ telegramUserId: chatId.toString() });
      
      if (agent) {
        bot.sendMessage(chatId, `Welcome ${agent.name}! You are now registered as a support agent.\n\nCommands:\n/available - Mark yourself as available\n/busy - Mark yourself as busy\n/end - End current chat session\n/status - Check your status`);
      } else {
        bot.sendMessage(chatId, 'You are not registered as an agent. Please contact the administrator.');
      }
    });

    // Handle /available command
    bot.onText(/\/available/, async (msg) => {
      await setAgentAvailability(msg.chat.id.toString(), true);
    });

    // Handle /busy command
    bot.onText(/\/busy/, async (msg) => {
      await setAgentAvailability(msg.chat.id.toString(), false);
    });

    // Handle /end command
    bot.onText(/\/end/, async (msg) => {
      await endChatSession(msg.chat.id.toString(), 'agent');
    });

    // Handle /status command
    bot.onText(/\/status/, async (msg) => {
      await sendAgentStatus(msg.chat.id.toString());
    });

    // Start inactivity checker
    startInactivityChecker();

    console.log('✅ Telegram bot initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Telegram bot:', error);
    return false;
  }
};

// Handle messages from agents
const handleAgentMessage = async (msg) => {
  try {
    const agentTelegramId = msg.chat.id.toString();
    const messageText = msg.text;

    // Ignore commands
    if (messageText && messageText.startsWith('/')) {
      return;
    }

    const agent = await TelegramAgent.findOne({ telegramUserId: agentTelegramId });
    
    if (!agent || !agent.currentChatSession) {
      return;
    }

    // Find active session
    const session = await LiveChatSession.findById(agent.currentChatSession).populate('user');
    
    if (!session || session.status !== 'connected') {
      bot.sendMessage(agentTelegramId, 'No active chat session found.');
      return;
    }

    // Add message to session
    session.messages.push({
      sender: 'agent',
      senderName: agent.name,
      message: messageText,
      timestamp: Date.now()
    });
    session.lastMessageAt = Date.now();
    await session.save();

    // Don't send notification for live chat messages - they appear in real-time via polling
    console.log(`✅ Agent message saved to session. Total messages: ${session.messages.length}`);
  } catch (error) {
    console.error('Error handling agent message:', error);
  }
};

// Send message from user to agent
const sendMessageToAgent = async (sessionId, userMessage, userName) => {
  try {
    const session = await LiveChatSession.findById(sessionId).populate('agent');
    
    if (!session || !session.agent) {
      return false;
    }

    // Add message to session
    session.messages.push({
      sender: 'user',
      senderName: userName,
      message: userMessage,
      timestamp: Date.now()
    });
    session.lastMessageAt = Date.now();
    await session.save();
    
    console.log(`✅ User message saved to session. Total messages: ${session.messages.length}`);

    // Send to Telegram agent
    if (bot) {
      await bot.sendMessage(
        session.agent.telegramUserId,
        `💬 *${userName}:*\n${userMessage}`,
        { parse_mode: 'Markdown' }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error sending message to agent:', error);
    return false;
  }
};

// Find and connect to available agent
const connectToAgent = async (userId, userName) => {
  try {
    // Find available agent first (before checking bot)
    const availableAgent = await TelegramAgent.findOne({
      isActive: true,
      isAvailable: true,
      currentChatSession: null
    }).sort({ totalChatsHandled: 1 }); // Least busy agent first

    if (!availableAgent) {
      return {
        success: false,
        message: 'All agents are currently busy. Please try again later or create a support ticket.',
        noAgentsAvailable: true
      };
    }

    // Check if bot is initialized (try to initialize if not)
    if (!bot) {
      const initialized = await initializeTelegramBot();
      if (!initialized) {
        return { 
          success: false, 
          message: 'Telegram bot is not configured. Please contact administrator.',
          botNotConfigured: true
        };
      }
    }

    // Fetch full user details
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    // Create chat session
    const session = await LiveChatSession.create({
      user: userId,
      agent: availableAgent._id,
      status: 'connected',
      connectedAt: Date.now(),
      messages: [{
        sender: 'system',
        message: `You are now connected with ${availableAgent.name}. They will respond shortly.`,
        timestamp: Date.now()
      }]
    });
    
    console.log(`✅ Chat session created: ${session._id}`);

    // Update agent
    availableAgent.currentChatSession = session._id;
    availableAgent.totalChatsHandled += 1;
    await availableAgent.save();

    // Format user address
    let addressText = 'Not provided';
    if (user.address) {
      const addressParts = [
        user.address.street,
        user.address.area,
        user.address.city,
        user.address.postalCode
      ].filter(Boolean);
      if (addressParts.length > 0) {
        addressText = addressParts.join(', ');
      }
    }

    // Notify agent via Telegram with full user details
    const config = await TelegramBotConfig.findOne();
    if (bot) {
      try {
        await bot.sendMessage(
          availableAgent.telegramUserId,
          `🔔 *New Chat Session*\n\n` +
          `👤 *User Details:*\n` +
          `Name: ${user.name}\n` +
          `Email: ${user.email}\n` +
          `Phone: ${user.phone}\n` +
          `Address: ${addressText}\n\n` +
          `Session ID: ${session.sessionId}\n\n` +
          `${config?.welcomeMessage || 'Hello! I will connect you with an available agent. Please wait...'}\n\n` +
          `Use /end to close the session.`,
          { parse_mode: 'Markdown' }
        );
      } catch (notifyError) {
        console.error('Error notifying agent via Telegram:', notifyError);
        // Session is still created, just notification failed
      }
    }

    return {
      success: true,
      sessionId: session._id,
      agentName: availableAgent.name,
      message: `Connected to ${availableAgent.name}`
    };
  } catch (error) {
    console.error('Error connecting to agent:', error);
    return {
      success: false,
      message: `Failed to connect to agent: ${error.message}`
    };
  }
};

// Set agent availability
const setAgentAvailability = async (telegramUserId, isAvailable) => {
  try {
    const agent = await TelegramAgent.findOne({ telegramUserId });
    
    if (!agent) {
      bot.sendMessage(telegramUserId, 'You are not registered as an agent.');
      return;
    }

    if (isAvailable && agent.currentChatSession) {
      bot.sendMessage(telegramUserId, 'You have an active chat session. Please end it first using /end command.');
      return;
    }

    agent.isAvailable = isAvailable;
    agent.lastActiveAt = Date.now();
    await agent.save();

    const status = isAvailable ? '✅ Available' : '🔴 Busy';
    bot.sendMessage(telegramUserId, `Your status is now: ${status}`);
  } catch (error) {
    console.error('Error setting agent availability:', error);
  }
};

// End chat session
const endChatSession = async (telegramUserId, endedBy) => {
  try {
    const agent = await TelegramAgent.findOne({ telegramUserId }).populate('currentChatSession');
    
    if (!agent || !agent.currentChatSession) {
      if (bot && endedBy === 'agent') {
        bot.sendMessage(telegramUserId, 'No active chat session found.');
      }
      return;
    }

    const session = agent.currentChatSession;
    session.status = 'ended';
    session.endedAt = Date.now();
    session.endedBy = endedBy;
    session.messages.push({
      sender: 'system',
      message: `Chat ended by ${endedBy === 'agent' ? agent.name : 'user'}.`,
      timestamp: Date.now()
    });
    await session.save();

    // Clear agent's current session
    agent.currentChatSession = null;
    agent.isAvailable = true;
    await agent.save();

    // Notify agent via Telegram only
    if (bot && endedBy !== 'agent') {
      bot.sendMessage(telegramUserId, `Chat session ended. You are now available for new chats.`);
    }

    // Don't send notification for live chat session end - user sees it in real-time
    console.log(`Chat session ${session.sessionId} ended by ${endedBy}`);
  } catch (error) {
    console.error('Error ending chat session:', error);
  }
};

// End chat session from user side
const endChatSessionByUser = async (sessionId) => {
  try {
    const session = await LiveChatSession.findById(sessionId).populate('agent');
    
    if (!session || session.status !== 'connected') {
      return false;
    }

    session.status = 'ended';
    session.endedAt = Date.now();
    session.endedBy = 'user';
    session.messages.push({
      sender: 'system',
      message: 'Chat ended by user.',
      timestamp: Date.now()
    });
    await session.save();

    if (session.agent) {
      const agent = await TelegramAgent.findById(session.agent._id);
      if (agent) {
        agent.currentChatSession = null;
        agent.isAvailable = true;
        await agent.save();

        // Notify agent
        if (bot) {
          bot.sendMessage(agent.telegramUserId, '❌ User has ended the chat session. You are now available for new chats.');
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error ending chat session by user:', error);
    return false;
  }
};

// Send agent status
const sendAgentStatus = async (telegramUserId) => {
  try {
    const agent = await TelegramAgent.findOne({ telegramUserId }).populate('currentChatSession');
    
    if (!agent) {
      bot.sendMessage(telegramUserId, 'You are not registered as an agent.');
      return;
    }

    const status = agent.isAvailable ? '✅ Available' : '🔴 Busy';
    const activeSession = agent.currentChatSession ? `\n📱 Active Session: Yes\nSession ID: ${agent.currentChatSession.sessionId}` : '\n📱 Active Session: No';
    
    const message = `👤 *Agent Status*\n\nName: ${agent.name}\nStatus: ${status}${activeSession}\n\nTotal Chats: ${agent.totalChatsHandled}\nRating: ${agent.rating.toFixed(1)}/5.0`;
    
    bot.sendMessage(telegramUserId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending agent status:', error);
  }
};

// Check for inactive sessions
const startInactivityChecker = () => {
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval);
  }

  inactivityCheckInterval = setInterval(async () => {
    try {
      const config = await TelegramBotConfig.findOne();
      const timeoutMinutes = config?.inactivityTimeout || 5;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      const inactiveSessions = await LiveChatSession.find({
        status: 'connected',
        lastMessageAt: { $lt: new Date(Date.now() - timeoutMs) }
      }).populate('agent user');

      for (const session of inactiveSessions) {
        session.status = 'timeout';
        session.endedAt = Date.now();
        session.endedBy = 'timeout';
        session.inactivityTimeout = true;
        session.messages.push({
          sender: 'system',
          message: `Chat ended due to inactivity (${timeoutMinutes} minutes).`,
          timestamp: Date.now()
        });
        await session.save();

        // Free up agent
        if (session.agent) {
          const agent = await TelegramAgent.findById(session.agent._id);
          if (agent) {
            agent.currentChatSession = null;
            agent.isAvailable = true;
            await agent.save();

            // Notify agent
            if (bot) {
              bot.sendMessage(agent.telegramUserId, `⏱️ Chat session ended due to inactivity. You are now available for new chats.`);
            }
          }
        }

        // Don't send notification for inactivity timeout - user sees it in chat
        console.log(`Session ${session.sessionId} ended due to inactivity`);
      }
    } catch (error) {
      console.error('Error checking inactive sessions:', error);
    }
  }, 60000); // Check every minute
};

// Get available agents count
const getAvailableAgentsCount = async () => {
  try {
    const count = await TelegramAgent.countDocuments({
      isActive: true,
      isAvailable: true,
      currentChatSession: null
    });
    return count;
  } catch (error) {
    console.error('Error getting available agents count:', error);
    return 0;
  }
};

module.exports = {
  initializeTelegramBot,
  connectToAgent,
  sendMessageToAgent,
  endChatSessionByUser,
  getAvailableAgentsCount,
  endChatSession,
  setAgentAvailability
};
