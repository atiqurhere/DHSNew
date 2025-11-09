import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/supabaseAPI';
import { FaUserPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaStar, FaTelegram } from 'react-icons/fa';

const ManageTelegramAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    telegramUserId: '',
    telegramUsername: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.telegram.getAgents();
      setAgents(response.data.agents || []);
    } catch (error) {
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (agent = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        telegramUserId: agent.telegram_user_id,
        telegramUsername: agent.telegram_username
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        telegramUserId: '',
        telegramUsername: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({
      name: '',
      telegramUserId: '',
      telegramUsername: ''
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.telegramUserId) {
      toast.error('Name and Telegram User ID are required');
      return;
    }

    try {
      let result;
      if (editingAgent) {
        result = await api.telegram.updateAgent(editingAgent.id, formData);
        toast.success('Agent updated successfully');
      } else {
        result = await api.telegram.addAgent(formData);
        toast.success('Agent added successfully');
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      fetchAgents();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save agent');
    }
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const result = await api.telegram.deleteAgent(agentId);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      toast.error(error.message || 'Failed to delete agent');
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    try {
      const result = await api.telegram.toggleAgentStatus(agentId, !currentStatus);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAgents();
    } catch (error) {
      toast.error(error.message || 'Failed to update agent status');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Telegram Agents</h1>
            <p className="text-gray-600 mt-1">Manage your customer support agents</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUserPlus />
            Add Agent
          </button>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <FaTelegram className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No agents added yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first agent
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telegram ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          {agent.telegramUsername && (
                            <div className="text-sm text-gray-500">@{agent.telegramUsername}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agent.telegramUserId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.is_active)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            agent.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {agent.is_active ? <FaCheckCircle /> : <FaTimesCircle />}
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          agent.isAvailable
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agent.totalChatsHandled || 0} chats
                        </div>
                        {agent.averageResponseTime && (
                          <div className="text-xs text-gray-500">
                            Avg: {Math.round(agent.averageResponseTime / 60)}min
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <FaStar className="text-yellow-400" />
                          <span className="text-gray-900">
                            {agent.rating ? agent.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(agent)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Agent Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Add the agent's name, Telegram User ID, and username (optional) above</li>
            <li>Ask the agent to open Telegram and search for your bot</li>
            <li>Agent sends <code className="bg-blue-100 px-2 py-1 rounded">/start</code> to the bot</li>
            <li>Agent uses <code className="bg-blue-100 px-2 py-1 rounded">/available</code> to start accepting chats</li>
            <li>Agent uses <code className="bg-blue-100 px-2 py-1 rounded">/busy</code> to pause accepting new chats</li>
            <li>Agent uses <code className="bg-blue-100 px-2 py-1 rounded">/end</code> to close the current chat</li>
            <li>Agent uses <code className="bg-blue-100 px-2 py-1 rounded">/status</code> to check their current status</li>
          </ol>
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">How to get Telegram User ID:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Ask agent to send <code className="bg-blue-100 px-2 py-1 rounded">/start</code> to <strong>@userinfobot</strong></li>
              <li>The bot will reply with the user's ID</li>
              <li>Copy that ID and paste it in the "Telegram User ID" field above</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add/Edit Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telegramUserId"
                  value={formData.telegramUserId}
                  onChange={handleChange}
                  placeholder="123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Get from @userinfobot on Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Username (Optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    name="telegramUsername"
                    value={formData.telegramUsername}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAgent ? 'Update Agent' : 'Add Agent'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTelegramAgents;
