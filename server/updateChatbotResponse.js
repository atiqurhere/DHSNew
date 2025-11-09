const mongoose = require('mongoose');
const ChatbotResponse = require('./models/ChatbotResponse');

const updateResponse = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/dhs');
    
    const result = await ChatbotResponse.updateOne(
      { intent: 'talk_to_human' },
      {
        $set: {
          response: 'I can connect you with one of our live support agents via Telegram. Would you like me to check for available agents?',
          followUpOptions: [
            { label: 'Talk to Human Agent', action: 'create_ticket' },
            { label: 'Continue with Bot', action: 'continue' }
          ]
        }
      }
    );
    
    console.log('✅ Chatbot response updated:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateResponse();
