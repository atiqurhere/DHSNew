import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaBell, FaCheckDouble, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

const StaffNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Error updating notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error updating notifications');
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/notifications/${id}`);
        setNotifications(notifications.filter(n => n._id !== id));
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Error deleting notification');
      }
    }
  };

  const deleteAllRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      try {
        await api.delete('/notifications/delete-read');
        setNotifications(notifications.filter(n => !n.isRead));
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
      case 'staff_assigned':
      case 'assignment':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'booking':
      case 'booking_confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'booking_cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'booking_completed':
        return <FaCheckDouble className="text-green-600" />;
      case 'staff_verified':
      case 'verification':
        return <FaCheckCircle className="text-purple-500" />;
      case 'staff_rejected':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'payment':
      case 'payment_success':
        return <FaInfoCircle className="text-blue-500" />;
      case 'system':
        return <FaBell className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <h1 className="text-2xl md:text-3xl font-bold">Staff Notifications</h1>
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
          {notifications.some(n => n.isRead) && (
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
            key={notification._id}
            className={`card hover:shadow-lg transition-all duration-300 ${
              !notification.isRead ? 'border-l-4 border-l-primary-600 bg-primary-50' : ''
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
                  <div className="flex flex-col items-end ml-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">
                  {notification.message}
                </p>

                {/* Priority badge for staff notifications */}
                {notification.priority && (
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded mb-3 ${
                      notification.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : notification.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {notification.priority.toUpperCase()} PRIORITY
                  </span>
                )}

                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-block mb-3"
                  >
                    View Details →
                  </a>
                )}

                <div className="flex flex-wrap gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
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
            You'll be notified about new assignments and important updates
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffNotifications;
