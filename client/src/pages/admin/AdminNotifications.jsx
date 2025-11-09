import React, { useState, useEffect } from 'react';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaBell, FaCheckDouble, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaUserTie, FaShoppingCart, FaUsers } from 'react-icons/fa';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await notificationsAPI.getByUser(user.id);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setNotifications(data);
    } catch (error) {
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Error updating notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error updating notifications');
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.delete(id);
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Error deleting notification');
      }
    }
  };

  const deleteAllRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      try {
        await api.delete('/notifications/read-all');
        setNotifications(notifications.filter(n => !n.is_read));
        toast.success('Read notifications deleted');
      } catch (error) {
        toast.error('Error deleting notifications');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return <FaCheckCircle className="text-green-500" />;
      case 'staff_application':
        return <FaUserTie className="text-purple-500" />;
      case 'booking':
      case 'booking_confirmed':
        return <FaShoppingCart className="text-blue-500" />;
      case 'booking_cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'booking_completed':
        return <FaCheckDouble className="text-green-600" />;
      case 'payment':
      case 'payment_success':
        return <FaCheckCircle className="text-green-500" />;
      case 'payment_failed':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'new_service':
        return <FaInfoCircle className="text-blue-500" />;
      case 'system':
        return <FaBell className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    if (type.includes('cancelled') || type.includes('rejected') || type.includes('failed')) {
      return 'border-l-4 border-red-500 bg-red-50';
    }
    if (type.includes('success') || type.includes('completed') || type.includes('verified') || type === 'welcome') {
      return 'border-l-4 border-green-500 bg-green-50';
    }
    if (type.includes('application') || type.includes('booking')) {
      return 'border-l-4 border-blue-500 bg-blue-50';
    }
    return 'border-l-4 border-gray-300 bg-white';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold animate-slideDown">Admin Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-secondary text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <FaCheckDouble />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              )}
              {notifications.some(n => n.is_read) && (
                <button
                  onClick={deleteAllRead}
                  className="text-red-600 hover:text-red-700 border border-red-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-50 transition-all"
                >
                  <FaTrash />
                  <span className="hidden sm:inline">Delete Read</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {filter === 'all' && "You'll be notified about new bookings, staff applications, and system updates."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card ${getNotificationColor(notification.type)} ${
                  !notification.is_read ? 'shadow-lg' : 'opacity-75'
                } transition-all duration-300 hover:shadow-xl`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-2xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
                      )}
                    </div>
                    
                    <p className={`text-sm mt-1 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
