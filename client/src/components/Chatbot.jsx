import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaUserTie } from 'react-icons/fa';
import api from '../utils/supabaseAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('bot'); // 'bot' or 'agent'
  const [sessionId, setSessionId] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [messages, setMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]); // Store bot conversation separately
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persisted messages and session on component mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Poll for new agent messages when in agent mode
  useEffect(() => {
    if (mode === 'agent' && sessionId) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [mode, sessionId]);

  // Persist messages and session data whenever they change
  useEffect(() => {
    if (messages.length > 0 || botMessages.length > 0) {
      persistChatData();
    }
  }, [messages, botMessages, mode, sessionId, agentName]);

  const loadPersistedData = async () => {
    try {
      // Load from localStorage
      const savedData = localStorage.getItem('dhs_chatbot_data');
      if (savedData) {
        const { messages: savedMessages, botMessages: savedBotMessages, mode: savedMode, sessionId: savedSessionId, agentName: savedAgentName, timestamp } = JSON.parse(savedData);
        
        // Check if data is less than 7 days old
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (timestamp && timestamp > sevenDaysAgo) {
          // Restore messages with proper timestamp objects
          const restoredMessages = savedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          // Restore bot messages if they exist
          const restoredBotMessages = savedBotMessages ? savedBotMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })) : [];
          
          setBotMessages(restoredBotMessages);
          setMessages(restoredMessages);
          
          // If there was an active agent session, try to restore it
          if (savedMode === 'agent' && savedSessionId) {
            // Check if user is logged in
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                console.log('🔄 Attempting to restore session:', savedSessionId);
                const result = await api.telegram.getSession(savedSessionId);
                
                if (result.data && result.data.session) {
                  const data = result.data;
                  if (data.session.status === 'connected' || data.session.status === 'waiting') {
                    // Session is still active - restore it!
                    console.log('✅ Session is active, restoring...');
                    setMode('agent');
                    setSessionId(savedSessionId);
                    setAgentName(savedAgentName || data.session.agent?.name || 'Support Agent');
                    
                    // Update with latest messages from server
                    const sessionMessages = data.session.messages.map(msg => ({
                      type: msg.sender === 'user' ? 'user' : msg.sender === 'agent' ? 'agent' : 'system',
                      text: msg.message,
                      timestamp: new Date(msg.timestamp || Date.now()),
                      senderName: msg.senderName
                    }));
                    
                    // Add restoration message
                    sessionMessages.push({
                      type: 'system',
                      text: '✅ Chat session restored. You are still connected to the agent.',
                      timestamp: new Date()
                    });
                    
                    setMessages(sessionMessages);
                    console.log('✅ Agent session restored successfully');
                  } else {
                    // Session ended, show end message
                    console.log('❌ Session has ended:', data.session.status);
                    const sessionMessages = data.session.messages.map(msg => ({
                      type: msg.sender === 'user' ? 'user' : msg.sender === 'agent' ? 'agent' : 'system',
                      text: msg.message,
                      timestamp: new Date(msg.timestamp || Date.now()),
                      senderName: msg.senderName
                    }));
                    
                    sessionMessages.push({
                      type: 'system',
                      text: 'Previous chat session has ended.',
                      timestamp: new Date()
                    });
                    
                    setMessages(sessionMessages);
                    setMode('bot');
                    setSessionId(null);
                    setAgentName('');
                  }
                } else {
                  // No session data returned
                  console.log('❌ No session data returned');
                  restoredMessages.push({
                    type: 'system',
                    text: 'Previous chat session could not be found.',
                    timestamp: new Date()
                  });
                  setMessages(restoredMessages);
                  setMode('bot');
                  setSessionId(null);
                  setAgentName('');
                }
              } catch (error) {
                console.error('❌ Error restoring session:', error);
                // Keep messages but show error
                restoredMessages.push({
                  type: 'system',
                  text: error.response?.status === 404 
                    ? 'Previous chat session has ended.' 
                    : 'Unable to restore previous chat session. Please start a new chat.',
                  timestamp: new Date()
                });
                setMessages(restoredMessages);
                setMode('bot');
                setSessionId(null);
                setAgentName('');
              }
            } else {
              // User not logged in, can't restore session
              console.log('❌ User not logged in, cannot restore session');
              restoredMessages.push({
                type: 'system',
                text: 'Please login to continue your chat session.',
                timestamp: new Date()
              });
              setMessages(restoredMessages);
              setMode('bot');
              setSessionId(null);
              setAgentName('');
            }
          }
        } else {
          // Data is older than 7 days, clear it
          localStorage.removeItem('dhs_chatbot_data');
          setInitialMessage();
        }
      } else {
        setInitialMessage();
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
      setInitialMessage();
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const setInitialMessage = () => {
    setMessages([{
      type: 'bot',
      text: 'Hello! I\'m your DHS virtual assistant. How can I help you today?',
      timestamp: new Date()
    }]);
  };

  const persistChatData = () => {
    try {
      const dataToSave = {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        botMessages: botMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        mode,
        sessionId,
        agentName,
        timestamp: Date.now()
      };
      localStorage.setItem('dhs_chatbot_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error persisting chat data:', error);
    }
  };

  const clearOldMessages = () => {
    localStorage.removeItem('dhs_chatbot_data');
    const initialMsg = [{
      type: 'bot',
      text: 'Hello! I\'m your DHS virtual assistant. How can I help you today?',
      timestamp: new Date()
    }];
    setMessages(initialMsg);
    setBotMessages([]);
    setMode('bot');
    setSessionId(null);
    setAgentName('');
  };

  const startPolling = () => {
    stopPolling(); // Clear any existing interval
    
    console.log('🔄 Starting polling for session:', sessionId);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const result = await api.telegram.getSession(sessionId);
        if (result.data && result.data.session) {
          const data = result.data;
          // Map server messages to chatbot format
          const sessionMessages = data.session.messages.map(msg => ({
            type: msg.sender === 'user' ? 'user' : msg.sender === 'agent' ? 'agent' : 'system',
            text: msg.message,
            timestamp: new Date(msg.timestamp || Date.now()),
            senderName: msg.senderName
          }));
          
          // Merge bot messages with agent session messages (preserve all history)
          const allMessages = [...botMessages, ...sessionMessages];
          setMessages(allMessages);
          
          // Check if session ended
          if (data.session.status === 'ended' || data.session.status === 'timeout') {
            stopPolling();
            console.log('❌ Session ended:', data.session.status);
            
            // Add end message if not already in messages
            const hasEndMessage = sessionMessages.some(msg => 
              msg.type === 'system' && (msg.text.includes('ended') || msg.text.includes('inactivity'))
            );
            
            if (!hasEndMessage) {
              setMessages(prev => [...prev, {
                type: 'system',
                text: data.session.status === 'timeout' 
                  ? 'Chat session ended due to inactivity.'
                  : 'Chat session ended by agent.',
                timestamp: new Date()
              }]);
            }
            
            setTimeout(() => {
              // Merge all messages back for future bot interactions
              setBotMessages(prev => {
                const currentMessages = [...prev, ...sessionMessages];
                return currentMessages;
              });
              setMode('bot');
              setSessionId(null);
              setAgentName('');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error polling session:', error);
        // If session not found or error, end the agent mode
        if (error.message && error.message.includes('not found')) {
          stopPolling();
          setMessages(prev => [...prev, {
            type: 'system',
            text: 'Chat session has ended.',
            timestamp: new Date()
          }]);
          setTimeout(() => {
            // Keep messages in history
            setBotMessages(prev => [...prev, ...messages.slice(prev.length)]);
            setMode('bot');
            setSessionId(null);
            setAgentName('');
          }, 2000);
        }
      }
    }, 2000); // Poll every 2 seconds for more real-time feel
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    if (mode === 'agent' && sessionId) {
      // Send message to Telegram agent
      try {
        await api.telegram.sendMessage(sessionId, currentMessage, 'user');
        // Message will appear in next poll
      } catch (error) {
        toast.error('Failed to send message');
        setMessages(prev => [...prev, {
          type: 'system',
          text: 'Failed to send message. Please try again.',
          timestamp: new Date()
        }]);
      }
    } else {
      // Bot mode
      setIsTyping(true);
      try {
        // Get bot response
        const result = await api.chatbot.getResponse(currentMessage);
        
        setTimeout(() => {
          const botMessage = {
            type: 'bot',
            text: result.data.response,
            timestamp: new Date(),
            followUpOptions: result.data.followUpOptions
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      } catch (error) {
        setIsTyping(false);
        const errorMessage = {
          type: 'bot',
          text: 'Sorry, I encountered an error. Please try again or contact our support team.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const switchToAgentMode = async () => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!user || !storedUser) {
      toast.info('Please login to chat with an agent');
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'To chat with a live agent, you need to login first. Would you like to login now?',
        timestamp: new Date(),
        followUpOptions: [
          { label: 'Login', action: 'login' },
          { label: 'Continue with Bot', action: 'continue' }
        ]
      }]);
      return;
    }

    try {
      setIsTyping(true);
      
      console.log('Connecting to Telegram agent for user:', user);
      
      // Check agent availability first
      const availabilityCheck = await api.telegram.checkAvailability();
      
      if (!availabilityCheck.data.available) {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Sorry, all our agents are currently busy. Would you like to:\n\n1. Wait for an available agent\n2. Create a support ticket for later response\n3. Continue chatting with me (AI assistant)',
          timestamp: new Date(),
          followUpOptions: [
            { label: 'Wait for Agent', action: 'wait_agent' },
            { label: 'Create Ticket', action: 'go_to_ticket_form' },
            { label: 'Continue with Bot', action: 'continue' }
          ]
        }]);
        return;
      }
      
      // Connect to available agent via Telegram
      const result = await api.telegram.connectToAgent(user.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('Connected to Telegram agent:', result.data);

      // Save current bot conversation before switching to agent mode
      setBotMessages(messages);
      
      setSessionId(result.data.sessionId);
      setAgentName(result.data.agentName || 'Support Agent');
      setMode('agent');
      
      // Keep previous bot conversation and add connection message
      setMessages(prev => [...prev, {
        type: 'system',
        text: `Connected to ${result.data.agentName || 'our support agent'}. They will respond shortly.`,
        timestamp: new Date()
      }]);
      setIsTyping(false);
      
      toast.success(`Connected to ${result.data.agentName}!`);
      
      // Start polling for messages
      startPolling();
    } catch (error) {
      setIsTyping(false);
      console.error('Error connecting to agent:', error);
      const errorMsg = error.message || 'Failed to connect to agent. Please try again.';
      toast.error(errorMsg);
      
      // Show error in chat with ticket creation option
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `Sorry, I couldn't connect you to an agent right now. ${errorMsg}\n\nWould you like to create a support ticket instead?`,
        timestamp: new Date(),
        followUpOptions: [
          { label: 'Create Ticket', action: 'go_to_ticket_form' },
          { label: 'Try Again', action: 'retry_agent' },
          { label: 'Continue with Bot', action: 'continue' }
        ]
      }]);
    }
  };

  const endAgentSession = async () => {
    if (!sessionId) return;
    
    try {
      await api.telegram.endSession(sessionId);
      stopPolling();
      
      // Keep all previous messages (bot + agent conversation) and add end message
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Chat session ended. How else can I help you?',
        timestamp: new Date()
      }]);
      
      // Merge all messages back into botMessages for future bot interactions
      setBotMessages(prevBot => [...prevBot, ...messages.slice(prevBot.length)]);
      
      setSessionId(null);
      setAgentName('');
      setMode('bot');
      
      toast.success('Chat session ended');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session properly');
    }
  };

  const handleFollowUpAction = (action) => {
    switch (action) {
      case 'view_services':
        navigate('/services');
        setIsOpen(false);
        break;
      case 'book_service':
        if (user) {
          navigate('/services');
        } else {
          navigate('/login');
        }
        setIsOpen(false);
        break;
      case 'view_contact':
        navigate('/contact');
        setIsOpen(false);
        break;
      case 'create_ticket':
        // Try to connect to agent first, fallback to ticket if no agents available
        switchToAgentMode();
        break;
      case 'go_to_ticket_form':
        // Direct navigation to ticket creation page (only when explicitly requested)
        navigate('/support/new');
        setIsOpen(false);
        break;
      case 'wait_agent':
      case 'retry_agent':
        switchToAgentMode();
        break;
      case 'view_pricing':
        navigate('/services');
        setIsOpen(false);
        break;
      case 'login':
        setIsOpen(false);
        navigate('/login');
        break;
      case 'continue':
        // Just stay in bot mode, do nothing
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition-all duration-300 z-50 hover:scale-110 transform animate-bounce"
          aria-label="Open chat"
        >
          <FaComments size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-slideUp">
          {/* Header */}
          <div className={`${mode === 'agent' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-primary-600 to-primary-700'} text-white p-4 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                {mode === 'agent' ? (
                  <FaUserTie className="text-green-600" size={24} />
                ) : (
                  <FaRobot className="text-primary-600" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{mode === 'agent' ? `Live Support - ${agentName}` : 'DHS Assistant'}</h3>
                <p className="text-xs text-primary-100">
                  {mode === 'agent' ? 'Online • Responding...' : 'Online • Always here to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'bot' && messages.length > 1 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all chat history? This cannot be undone.')) {
                      clearOldMessages();
                    }
                  }}
                  className="hover:bg-primary-800 p-2 rounded-full transition-colors text-xs"
                  title="Clear chat history"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-800 p-2 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading messages...</p>
                </div>
              </div>
            ) : (
              <>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === 'system' ? (
                  <div className="flex justify-center">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-xs">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user' ? 'bg-primary-600' : mode === 'agent' ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {msg.type === 'user' ? (
                          <FaUser className="text-white" size={16} />
                        ) : mode === 'agent' ? (
                          <FaUserTie className="text-white" size={16} />
                        ) : (
                          <FaRobot className="text-gray-700" size={16} />
                        )}
                      </div>
                      <div>
                        <div className={`rounded-lg p-3 ${msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 shadow-md'}`}>
                          <p className="text-sm whitespace-pre-line">{msg.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up options */}
                {msg.followUpOptions && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-10">
                    {msg.followUpOptions.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleFollowUpAction(option.action)}
                        className="bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-600 hover:text-white transition-colors duration-200"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <FaRobot className="text-gray-700" size={16} />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </>
            )}
          </div>

          {/* Mode Switch Button */}
          {mode === 'agent' && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex justify-between items-center">
              <button
                onClick={endAgentSession}
                className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
              >
                ← Back to AI Assistant
              </button>
              <button
                onClick={endAgentSession}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                End Chat
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={mode === 'agent' ? 'Message support team...' : 'Type your message...'}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`${mode === 'agent' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'} text-white p-3 rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
