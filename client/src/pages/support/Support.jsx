import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  FaTicketAlt, 
  FaPlus, 
  FaClock, 
  FaExclamationCircle,
  FaCheckCircle,
  FaInbox
} from 'react-icons/fa';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, closed
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support/tickets');
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
    if (filter === 'open') return ticket.status === 'open' || ticket.status === 'in-progress';
    if (filter === 'closed') return ticket.status === 'resolved' || ticket.status === 'closed';
    return true;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-1">View and manage your support requests</p>
          </div>
          <Link
            to="/support/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            New Ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Open ({tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'closed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Closed ({tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length})
          </button>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaInbox className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any support tickets yet."
                : `You don't have any ${filter} tickets.`}
            </p>
            <Link
              to="/support/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus />
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.subject}
                        </h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaTicketAlt />
                          {ticket.ticketNumber}
                        </span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {ticket.assignedTo && (
                      <div className="ml-4 text-sm text-gray-600">
                        <p className="font-medium">Assigned to:</p>
                        <p>{ticket.assignedTo.name}</p>
                      </div>
                    )}
                  </div>
                  
                  {ticket.messages && ticket.messages.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Last message:</span>{' '}
                        {ticket.messages[ticket.messages.length - 1].message.substring(0, 100)}
                        {ticket.messages[ticket.messages.length - 1].message.length > 100 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.messages[ticket.messages.length - 1].createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
