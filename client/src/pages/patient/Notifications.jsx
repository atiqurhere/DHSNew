import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../utils/supabaseAPI';
import { seedNotifications } from '../../utils/seedSupabase';
import { useAuth } from '../../context/SupabaseAuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaBell, FaCheckDouble, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await notificationsAPI.getByUser(user.id);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      
      // If no notifications exist, seed some welcome notifications
      if (!data || data.length === 0) {
        console.log('No notifications found, seeding...');
        const seedResult = await seedNotifications(user.id);
        if (!seedResult.error) {
          // Retry fetching
          const retry = await notificationsAPI.getByUser(user.id);
          if (!retry.error && retry.data) {
            setNotifications(retry.data);
            return;
          }
        }
      }
      
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications once when user is available
  useEffect(() => {
    let mounted = true;
    
    const loadNotifications = async () => {
      if (user && mounted) {
        await fetchNotifications();
      } else {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only re-fetch when user ID changes

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
      case 'booking':
      case 'booking_confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'booking_cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'booking_completed':
        return <FaCheckDouble className="text-green-600" />;
      case 'payment':
      case 'payment_success':
        return <FaInfoCircle className="text-blue-500" />;
      case 'payment_failed':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'staff_verified':
        return <FaCheckCircle className="text-green-500" />;
      case 'staff_rejected':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'staff_assigned':
        return <FaInfoCircle className="text-blue-500" />;
      case 'system':
        return <FaBell className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <FaCheckDouble />
              <span>Mark All Read</span>
            </button>
          )}
          {notifications.some(n => n.is_read) && (
            <button
              onClick={deleteAllRead}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <FaTrash />
              <span>Delete Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded transition flex-1 ${
            filter === 'all' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded transition flex-1 ${
            filter === 'unread' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded transition flex-1 ${
            filter === 'read' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`card hover:shadow-lg transition-all duration-300 ${
              !notification.is_read ? 'border-l-4 border-l-primary-600 bg-primary-50' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 text-2xl mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">
                  {notification.message}
                </p>

                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-block mb-3"
                  >
                    View Details →
                  </a>
                )}

                <div className="flex flex-wrap gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition flex items-center space-x-1"
                  >
                    <FaTrash className="text-xs" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'unread'
              ? 'No unread notifications'
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications yet'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            We'll notify you when there's something new
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
