const TelegramAgent = require('../models/TelegramAgent');
const TelegramBotConfig = require('../models/TelegramBotConfig');
const LiveChatSession = require('../models/LiveChatSession');
const { initializeTelegramBot, connectToAgent, sendMessageToAgent, endChatSessionByUser, getAvailableAgentsCount } = require('../utils/telegramBotService');

// @desc    Get bot configuration
// @route   GET /api/telegram/config
// @access  Private/Admin
exports.getBotConfig = async (req, res) => {
  try {
    let config = await TelegramBotConfig.findOne();
    
    if (!config) {
      config = await TelegramBotConfig.create({
        botToken: '',
        botUsername: '',
        isActive: false
      });
    }

    // Send config with masked token (show only last 4 chars)
    const safeConfig = {
      _id: config._id,
      botToken: config.botToken ? `...${config.botToken.slice(-4)}` : '',
      botUsername: config.botUsername,
      isActive: config.isActive,
      webhookUrl: config.webhookUrl,
      inactivityTimeout: config.inactivityTimeout,
      autoResponseEnabled: config.autoResponseEnabled,
      welcomeMessage: config.welcomeMessage,
      offlineMessage: config.offlineMessage
    };

    res.json({ config: safeConfig });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bot configuration
// @route   PUT /api/telegram/config
// @access  Private/Admin
exports.updateBotConfig = async (req, res) => {
  try {
    const { botToken, botUsername, isActive, inactivityTimeout, welcomeMessage, offlineMessage } = req.body;

    let config = await TelegramBotConfig.findOne();
    
    if (!config) {
      config = await TelegramBotConfig.create({
        botToken,
        botUsername,
        isActive,
        inactivityTimeout,
        welcomeMessage,
        offlineMessage,
        updatedBy: req.user._id
      });
    } else {
      if (botToken) config.botToken = botToken;
      if (botUsername) config.botUsername = botUsername;
      config.isActive = isActive !== undefined ? isActive : config.isActive;
      if (inactivityTimeout) config.inactivityTimeout = inactivityTimeout;
      if (welcomeMessage) config.welcomeMessage = welcomeMessage;
      if (offlineMessage) config.offlineMessage = offlineMessage;
      config.updatedBy = req.user._id;
      await config.save();
    }

    // Reinitialize bot if active
    if (config.isActive) {
      try {
        await initializeTelegramBot();
      } catch (botError) {
        console.error('Error initializing bot:', botError);
        // Save config anyway but warn user
        return res.status(200).json({
          message: 'Configuration saved but bot initialization failed. Please check your bot token.',
          config: {
            botToken: config.botToken ? `...${config.botToken.slice(-4)}` : '',
            botUsername: config.botUsername,
            isActive: config.isActive,
            inactivityTimeout: config.inactivityTimeout,
            welcomeMessage: config.welcomeMessage,
            offlineMessage: config.offlineMessage
          },
          warning: botError.message
        });
      }
    }

    res.json({
      message: 'Bot configuration updated successfully',
      config: {
        botToken: config.botToken ? `...${config.botToken.slice(-4)}` : '',
        botUsername: config.botUsername,
        isActive: config.isActive,
        inactivityTimeout: config.inactivityTimeout,
        welcomeMessage: config.welcomeMessage,
        offlineMessage: config.offlineMessage
      }
    });
  } catch (error) {
    console.error('Error updating bot config:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all agents
// @route   GET /api/telegram/agents
// @access  Private/Admin
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await TelegramAgent.find().populate('currentChatSession').sort('-createdAt');
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new agent
// @route   POST /api/telegram/agents
// @access  Private/Admin
exports.createAgent = async (req, res) => {
  try {
    const { name, telegramUserId, telegramUsername } = req.body;

    const existingAgent = await TelegramAgent.findOne({ telegramUserId });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this Telegram ID already exists' });
    }

    const agent = await TelegramAgent.create({
      name,
      telegramUserId,
      telegramUsername,
      isActive: true,
      isAvailable: false
    });

    res.status(201).json({
      message: 'Agent created successfully',
      agent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update agent
// @route   PUT /api/telegram/agents/:id
// @access  Private/Admin
exports.updateAgent = async (req, res) => {
  try {
    const { name, telegramUsername, isActive, isAvailable } = req.body;
    
    const agent = await TelegramAgent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (name) agent.name = name;
    if (telegramUsername) agent.telegramUsername = telegramUsername;
    if (isActive !== undefined) agent.isActive = isActive;
    if (isAvailable !== undefined && !agent.currentChatSession) {
      agent.isAvailable = isAvailable;
    }

    await agent.save();

    res.json({
      message: 'Agent updated successfully',
      agent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete agent
// @route   DELETE /api/telegram/agents/:id
// @access  Private/Admin
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await TelegramAgent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.currentChatSession) {
      return res.status(400).json({ message: 'Cannot delete agent with active chat session' });
    }

    await agent.deleteOne();

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request live chat connection
// @route   POST /api/telegram/connect
// @access  Private
exports.requestLiveChat = async (req, res) => {
  try {
    const result = await connectToAgent(req.user._id, req.user.name);
    
    if (result.success) {
      res.json({
        success: true,
        sessionId: result.sessionId,
        agentName: result.agentName,
        message: result.message
      });
    } else {
      res.status(result.noAgentsAvailable ? 200 : 500).json({
        success: false,
        message: result.message,
        noAgentsAvailable: result.noAgentsAvailable
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send message in live chat
// @route   POST /api/telegram/message/:sessionId
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const session = await LiveChatSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (session.status !== 'connected') {
      return res.status(400).json({ message: 'Chat session is not active' });
    }

    const sent = await sendMessageToAgent(sessionId, message, req.user.name);
    
    if (sent) {
      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat session messages
// @route   GET /api/telegram/session/:sessionId
// @access  Private
exports.getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveChatSession.findById(sessionId).populate('agent user');
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && session.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End live chat session
// @route   POST /api/telegram/end/:sessionId
// @access  Private
exports.endLiveChat = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveChatSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const ended = await endChatSessionByUser(sessionId);
    
    if (ended) {
      res.json({
        success: true,
        message: 'Chat session ended successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to end chat session'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check agent availability
// @route   GET /api/telegram/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const count = await getAvailableAgentsCount();
    res.json({
      available: count > 0,
      agentsCount: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/telegram/sessions
// @access  Private
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await LiveChatSession.find({ user: req.user._id })
      .populate('agent')
      .sort('-createdAt')
      .limit(20);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Test bot connection
// @route   POST /api/telegram/test-connection
// @access  Private/Admin
exports.testBotConnection = async (req, res) => {
  try {
    const { botToken } = req.body;
    
    if (!botToken) {
      return res.status(400).json({ message: 'Bot token is required' });
    }

    // Try to create a bot instance and get bot info
    const TelegramBot = require('node-telegram-bot-api');
    const testBot = new TelegramBot(botToken);
    
    try {
      const botInfo = await testBot.getMe();
      testBot.stopPolling();
      
      res.json({
        message: 'Bot connection successful',
        botInfo: {
          username: botInfo.username,
          firstName: botInfo.first_name,
          canJoinGroups: botInfo.can_join_groups,
          canReadAllGroupMessages: botInfo.can_read_all_group_messages
        }
      });
    } catch (error) {
      testBot.stopPolling().catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Bot connection test failed:', error);
    res.status(400).json({ 
      message: 'Bot connection failed. Please check your bot token.',
      error: error.message 
    });
  }
};

// @desc    Get all chat sessions (admin)
// @route   GET /api/telegram/sessions/all
// @access  Private/Admin
exports.getAllSessions = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const sessions = await LiveChatSession.find(filter)
      .populate('agent user')
      .sort('-createdAt')
      .limit(100);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
