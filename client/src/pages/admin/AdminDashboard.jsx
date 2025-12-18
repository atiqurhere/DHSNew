import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaClipboardList, 
  FaUserMd, 
  FaUserShield, 
  FaServicestack,
  FaArrowRight,
  FaTelegram,
  FaRobot,
  FaTicketAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await adminAPI.getStats();
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setStats(data);
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If stats failed to load, show error state
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="card bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <div className="text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Failed to load dashboard stats</h3>
                <p className="text-red-600">Please refresh the page or contact support if the problem persists.</p>
              </div>
            </div>
            <button 
              onClick={fetchStats}
              className="mt-4 btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{stats.bookings.total}</p>
                <p className="text-sm text-gray-500">
                  {stats.bookings.pending} pending
                </p>
              </div>
              <FaClipboardList className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">৳{stats.revenue.total}</p>
                <p className="text-sm text-gray-500">
                  ৳{stats.revenue.monthly} this month
                </p>
              </div>
              <FaMoneyBillWave className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="card bg-purple-50 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-purple-600">{stats.users.patients}</p>
              </div>
              <FaUsers className="text-4xl text-purple-500" />
            </div>
          </div>

          <div className="card bg-orange-50 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Active Staff</p>
                <p className="text-3xl font-bold text-orange-600">{stats.users.staff}</p>
                <p className="text-sm text-gray-500">
                  {stats.users.pendingStaff} pending approval
                </p>
              </div>
              <FaUserMd className="text-4xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Management Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/manage-admins"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaUserShield className="text-2xl text-red-600" />
                    <h3 className="text-lg font-semibold">Manage Admins</h3>
                  </div>
                  <p className="text-sm text-gray-600">Add, edit, or remove admins with permissions</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/manage-services"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaServicestack className="text-2xl text-blue-600" />
                    <h3 className="text-lg font-semibold">Manage Services</h3>
                  </div>
                  <p className="text-sm text-gray-600">Create, update, or delete services</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/manage-staff"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaUserMd className="text-2xl text-green-600" />
                    <h3 className="text-lg font-semibold">Manage Staff</h3>
                  </div>
                  <p className="text-sm text-gray-600">Verify and manage staff members</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/manage-bookings"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaClipboardList className="text-2xl text-purple-600" />
                    <h3 className="text-lg font-semibold">Manage Bookings</h3>
                  </div>
                  <p className="text-sm text-gray-600">View, assign, and update bookings</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/manage-patients"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaUsers className="text-2xl text-indigo-600" />
                    <h3 className="text-lg font-semibold">Manage Patients</h3>
                  </div>
                  <p className="text-sm text-gray-600">View patient information and history</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaMoneyBillWave className="text-2xl text-yellow-600" />
                    <h3 className="text-lg font-semibold">Reports</h3>
                  </div>
                  <p className="text-sm text-gray-600">View revenue and analytics reports</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/telegram-bot"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaTelegram className="text-2xl text-blue-500" />
                    <h3 className="text-lg font-semibold">Telegram Bot</h3>
                  </div>
                  <p className="text-sm text-gray-600">Configure Telegram bot for live support</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/telegram-agents"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaRobot className="text-2xl text-green-600" />
                    <h3 className="text-lg font-semibold">Support Agents</h3>
                  </div>
                  <p className="text-sm text-gray-600">Manage Telegram support agents</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/admin/support-tickets"
              className="card bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FaTicketAlt className="text-2xl text-purple-600" />
                    <h3 className="text-lg font-semibold">Support Tickets</h3>
                  </div>
                  <p className="text-sm text-gray-600">View and respond to support tickets</p>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
          <div className="card">
            <div className="space-y-4">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{booking.service?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Patient: {booking.patient?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
