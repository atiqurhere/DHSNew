import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  FaTicketAlt, 
  FaClock, 
  FaExclamationCircle,
  FaCheckCircle,
  FaUser,
  FaEye,
  FaFilter
} from 'react-icons/fa';

const ManageSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, in-progress, resolved, closed
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Admin endpoint to get all tickets
      const { data } = await api.get('/support/tickets/admin/all');
      setTickets(data.tickets || []);
    } catch (error) {
      toast.error('Failed to load tickets');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', icon: FaClock, label: 'Open' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: FaExclamationCircle, label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: FaCheckCircle, label: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const getFilterCount = (status) => {
    if (status === 'all') return tickets.length;
    return tickets.filter(t => t.status === status).length;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Support Tickets</h1>
          <p className="text-gray-600 mt-1">View and respond to customer support requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">Open</p>
            <p className="text-2xl font-bold text-blue-900">{getFilterCount('open')}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-900">{getFilterCount('in-progress')}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-900">{getFilterCount('resolved')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-2xl font-bold text-gray-900">{getFilterCount('closed')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 items-center">
          <FaFilter className="text-gray-500" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'closed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Closed
          </button>
        </div>

        {/* Tickets Table */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaTicketAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Found</h2>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "No support tickets have been created yet."
                : `No ${filter} tickets found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{ticket.ticketNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {ticket.user?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/admin/support-tickets/${ticket._id}`)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <FaEye />
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSupportTickets;
