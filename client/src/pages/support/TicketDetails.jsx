import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/supabaseAPI';
import { useAuth } from '../../context/SupabaseAuthContext';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaClock, 
  FaExclamationCircle,
  FaCheckCircle,
  FaUser,
  FaUserTie 
} from 'react-icons/fa';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTicket();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchTicket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    try {
      const { data, error } = await supportAPI.getById(id);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setTicket(data.ticket);
    } catch (error) {
      toast.error('Failed to load ticket');
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await api.post(`/support/tickets/${id}/messages`, { message: message.trim() });
      setMessage('');
      toast.success('Message sent');
      await fetchTicket(); // Refresh to get new message
      scrollToBottom(); // Scroll only after sending a message
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaExclamationCircle className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              to="/support"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back
          </button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Ticket #{ticket.ticketNumber}</span>
                  <span>•</span>
                  <span>Category: {ticket.category}</span>
                  <span>•</span>
                  <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {ticket.assignedTo && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Assigned to: <span className="font-medium text-gray-900">{ticket.assignedTo.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
          </div>
          
          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
            {ticket.messages && ticket.messages.length > 0 ? (
              <>
                {ticket.messages.map((msg, idx) => {
                  // Check if this message is from the current user
                  const senderId = typeof msg.sender === 'object' ? msg.sender?.id : msg.sender;
                  const currentUserId = user?.id;
                  const isMyMessage = senderId?.toString() === currentUserId?.toString();
                  const senderPhoto = isMyMessage ? user?.profilePicture : msg.sender?.profilePicture;
                  const senderName = isMyMessage ? 'You' : (msg.sender?.name || 'Support Team');
                  
                  console.log('Message check:', { senderId, currentUserId, isMyMessage, senderName });
                  
                  return (
                    <div key={idx} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-3 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {senderPhoto ? (
                            <img 
                              src={`http://localhost:5000${senderPhoto}`} 
                              alt={senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-gray-400" />
                          )}
                        </div>
                        <div className={`flex-1 ${isMyMessage ? 'text-right' : ''}`}>
                          <p className={`text-xs font-semibold mb-1 px-2 ${isMyMessage ? 'text-blue-600' : 'text-green-600'}`}>
                            {senderName}
                          </p>
                          <div className={`inline-block rounded-lg p-4 ${
                            isMyMessage 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-green-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-2">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>
            <form onSubmit={handleSendMessage}>
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="3"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 h-fit"
                >
                  <FaPaperPlane />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}

        {ticket.status === 'closed' && (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <FaCheckCircle className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600">This ticket is closed. No new messages can be sent.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
