import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/supabaseAPI';
import { useAuth } from '../../context/SupabaseAuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaCalendar, FaClipboardList, FaHeart } from 'react-icons/fa';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    total: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.log('No user ID available yet');
      return;
    }
    
    try {
      const { data, error } = await bookingsAPI.getByUser(user.id);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      
      setStats({
        upcoming: data.filter(b => ['pending', 'accepted', 'assigned', 'in-progress'].includes(b.status)).length,
        completed: data.filter(b => b.status === 'completed').length,
        total: data.length
      });
      
      setRecentBookings(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
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
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 animate-slideDown">Patient Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 stagger-children">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Upcoming Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <FaCalendar className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FaClipboardList className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="card bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <FaHeart className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 stagger-children">
          <Link to="/services" className="card hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-2 transform">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">📅</div>
            <h3 className="text-lg md:text-xl font-bold mb-2">Book a Service</h3>
            <p className="text-sm md:text-base text-gray-600">Schedule a new healthcare service</p>
          </Link>

          <Link to="/patient/bookings" className="card hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-2 transform">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">📋</div>
            <h3 className="text-lg md:text-xl font-bold mb-2">My Bookings</h3>
            <p className="text-sm md:text-base text-gray-600">View all your bookings</p>
          </Link>

          <Link to="/patient/payments" className="card hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-2 transform sm:col-span-2 lg:col-span-1">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">💳</div>
            <h3 className="text-lg md:text-xl font-bold mb-2">Payments</h3>
            <p className="text-sm md:text-base text-gray-600">View payment history</p>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                      {booking.staff && (
                        <p className="text-gray-600 text-sm">
                          Staff: {booking.staff.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <Link 
                        to={`/patient/bookings/${booking.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link to="/services" className="btn-primary">
                Book Your First Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
