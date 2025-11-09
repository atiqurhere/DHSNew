const ChatbotResponse = require('../models/ChatbotResponse');

// @desc    Get chatbot response
// @route   POST /api/chatbot/query
// @access  Public
exports.getChatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase().trim();

    // Find matching response based on keywords
    const responses = await ChatbotResponse.find({ isActive: true });
    
    let bestMatch = null;
    let maxMatchCount = 0;

    for (const response of responses) {
      let matchCount = 0;
      for (const keyword of response.keywords) {
        if (lowerMessage.includes(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > maxMatchCount) {
        maxMatchCount = matchCount;
        bestMatch = response;
      }
    }

    if (bestMatch) {
      return res.json({
        intent: bestMatch.intent,
        response: bestMatch.response,
        followUpOptions: bestMatch.followUpOptions
      });
    }

    // Default response if no match found
    res.json({
      intent: 'fallback',
      response: "I'm sorry, I didn't quite understand that. Would you like to speak with a human agent? You can also try asking about our services, booking process, or contact information.",
      followUpOptions: [
        { label: 'Talk to Human Agent', action: 'create_ticket' },
        { label: 'View Services', action: 'view_services' },
        { label: 'Contact Information', action: 'view_contact' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chatbot responses (admin)
// @route   GET /api/chatbot/responses
// @access  Private/Admin
exports.getAllResponses = async (req, res) => {
  try {
    const responses = await ChatbotResponse.find().sort('category priority');
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create chatbot response
// @route   POST /api/chatbot/responses
// @access  Private/Admin
exports.createResponse = async (req, res) => {
  try {
    const response = await ChatbotResponse.create(req.body);
    res.status(201).json({
      message: 'Chatbot response created successfully',
      response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update chatbot response
// @route   PUT /api/chatbot/responses/:id
// @access  Private/Admin
exports.updateResponse = async (req, res) => {
  try {
    const response = await ChatbotResponse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json({
      message: 'Chatbot response updated successfully',
      response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete chatbot response
// @route   DELETE /api/chatbot/responses/:id
// @access  Private/Admin
exports.deleteResponse = async (req, res) => {
  try {
    const response = await ChatbotResponse.findByIdAndDelete(req.params.id);

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json({ message: 'Chatbot response deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
