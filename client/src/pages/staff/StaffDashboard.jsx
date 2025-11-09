import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    inProgress: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/bookings');
      
      setStats({
        assigned: data.filter(b => b.status === 'assigned').length,
        inProgress: data.filter(b => b.status === 'in-progress').length,
        completed: data.filter(b => b.status === 'completed').length
      });
      
      setBookings(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Assigned Tasks</p>
                <p className="text-3xl font-bold text-blue-600">{stats.assigned}</p>
              </div>
              <FaTasks className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="card bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                      <p className="text-gray-600 text-sm">
                        Patient: {booking.patient?.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Contact: {booking.patient?.phone}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                      {booking.address && (
                        <p className="text-gray-600 text-sm">
                          Address: {booking.address.street}, {booking.address.area}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {booking.notes && (
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {booking.status === 'assigned' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'in-progress')}
                        className="btn-primary text-sm"
                      >
                        Start Task
                      </button>
                    )}
                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No tasks assigned yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
