import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { FaTelegram, FaSave, FaRobot, FaClock, FaUsers } from 'react-icons/fa';

const ManageTelegramBot = () => {
  const [config, setConfig] = useState({
    botToken: '',
    botUsername: '',
    isActive: false,
    inactivityTimeout: 5,
    welcomeMessage: 'Hello! I will connect you with an available agent. Please wait...',
    offlineMessage: 'Sorry, all agents are currently busy. Please create a support ticket and we will get back to you soon.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    availableAgents: 0,
    activeSessions: 0
  });

  useEffect(() => {
    fetchConfig();
    fetchAgents();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/telegram/config');
      if (response.data.config) {
        setConfig(response.data.config);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Telegram bot not configured yet');
      } else {
        toast.error('Failed to fetch bot configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/telegram/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [agentsRes, sessionsRes] = await Promise.all([
        api.get('/telegram/agents'),
        api.get('/telegram/sessions/all')
      ]);
      
      const agentsList = agentsRes.data.agents || [];
      const sessionsList = sessionsRes.data.sessions || [];
      
      setStats({
        totalAgents: agentsList.filter(a => a.isActive).length,
        availableAgents: agentsList.filter(a => a.isActive && a.isAvailable).length,
        activeSessions: sessionsList.filter(s => s.status === 'connected').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if token is masked (starts with "...")
    const isMaskedToken = config.botToken && config.botToken.startsWith('...');
    
    if ((!config.botToken || isMaskedToken) && !config._id) {
      toast.error('Bot token is required for new configuration');
      return;
    }
    
    if (!config.botUsername) {
      toast.error('Bot username is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...config };
      // Don't send masked token back to server
      if (isMaskedToken) {
        delete payload.botToken;
      }
      
      await api.put('/telegram/config', payload);
      toast.success('Bot configuration saved successfully');
      fetchConfig(); // Refresh to get updated data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const testBotConnection = async () => {
    if (!config.botToken) {
      toast.error('Please enter bot token first');
      return;
    }

    // Check if token is masked
    if (config.botToken.startsWith('...')) {
      toast.error('Cannot test masked token. Please enter a new bot token to test.');
      return;
    }

    const toastId = toast.info('Testing bot connection...', { autoClose: false });
    try {
      const response = await api.post('/telegram/test-connection', { botToken: config.botToken });
      toast.dismiss(toastId);
      toast.success(`Bot connection successful! Connected to @${response.data.botInfo.username}`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || 'Bot connection failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaTelegram className="text-4xl text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Telegram Bot Configuration</h1>
          </div>
          <p className="text-gray-600">Configure your Telegram bot for live customer support</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAgents}</p>
              </div>
              <FaUsers className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Agents</p>
                <p className="text-3xl font-bold text-green-600">{stats.availableAgents}</p>
              </div>
              <FaRobot className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Chats</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeSessions}</p>
              </div>
              <FaClock className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bot Settings</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="botToken"
                value={config.botToken}
                onChange={handleChange}
                placeholder={config.botToken && config.botToken.startsWith('...') ? 'Token already configured - leave empty to keep current' : '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                {config.botToken && config.botToken.startsWith('...') ? (
                  <span className="text-green-600">✓ Token configured. Enter a new token to update, or leave empty to keep current.</span>
                ) : (
                  <>Get your bot token from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@BotFather</a> on Telegram</>
                )}
              </p>
            </div>

            {/* Bot Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Username <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  name="botUsername"
                  value={config.botUsername}
                  onChange={handleChange}
                  placeholder="your_bot_username"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Inactivity Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inactivity Timeout (minutes)
              </label>
              <input
                type="number"
                name="inactivityTimeout"
                value={config.inactivityTimeout}
                onChange={handleChange}
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Chat sessions will automatically close after this many minutes of inactivity
              </p>
            </div>

            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                name="welcomeMessage"
                value={config.welcomeMessage}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                This message will be sent to users when they connect to an agent
              </p>
            </div>

            {/* Offline Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offline Message
              </label>
              <textarea
                name="offlineMessage"
                value={config.offlineMessage}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                This message will be shown when no agents are available
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={config.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Enable Telegram Bot (Start accepting live chat requests)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaSave />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>

              <button
                type="button"
                onClick={testBotConnection}
                disabled={!config.botToken || config.botToken.startsWith('...')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={config.botToken && config.botToken.startsWith('...') ? 'Enter a new token to test connection' : 'Test bot connection'}
              >
                Test Connection
              </button>
            </div>
            {config.botToken && config.botToken.startsWith('...') && (
              <p className="text-sm text-gray-600 mt-2">
                💡 <strong>Tip:</strong> Test connection is disabled for masked tokens. Enter a new token to test.
              </p>
            )}
          </form>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Open Telegram and search for <strong>@BotFather</strong></li>
            <li>Send <code className="bg-blue-100 px-2 py-1 rounded">/newbot</code> to create a new bot</li>
            <li>Follow the instructions to name your bot</li>
            <li>Copy the <strong>bot token</strong> and paste it above</li>
            <li>Copy the <strong>bot username</strong> (without @) and paste it above</li>
            <li>Save the configuration</li>
            <li>Go to <strong>Manage Agents</strong> to add support agents</li>
            <li>Agents should send <code className="bg-blue-100 px-2 py-1 rounded">/start</code> to your bot</li>
            <li>Agents use <code className="bg-blue-100 px-2 py-1 rounded">/available</code> to start accepting chats</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ManageTelegramBot;
