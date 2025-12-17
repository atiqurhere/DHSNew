import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import { FaUserCircle, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { notificationsAPI } from '../utils/supabaseAPI';
import { getProfilePictureUrl } from '../utils/imageHelper';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up real-time subscription for notifications
      const subscription = notificationsAPI.subscribe(user.id, () => {
        fetchUnreadCount();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      if (!user) return;
      const { data, error } = await notificationsAPI.getByUser(user.id);
      if (error) throw new Error(error);
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getNotificationsLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient':
        return '/patient/notifications';
      case 'staff':
        return '/staff/notifications';
      case 'admin':
        return '/admin/notifications';
      default:
        return '/';
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 animate-slideDown">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="text-2xl font-bold text-primary-600">DHS</div>
            <div className="text-sm text-gray-600 hidden sm:block">
              Dhaka Health Service
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/services" className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">
              Services
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">
              Contact
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">
                  Dashboard
                </Link>
                <Link to={getNotificationsLink()} className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-110 transform relative">
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 text-gray-700 hover:text-primary-600">
                  {user.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(user.profilePicture)}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <FaUserCircle size={24} />
                  )}
                  <span className="text-sm hidden xl:block">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200 hover:scale-105 transform"
                >
                  <FaSignOutAlt />
                  <span className="hidden xl:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">
                  Login
                </Link>
                <Link to="/register" className="btn-primary hover:scale-105 transform transition-all duration-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-primary-600 transition-colors duration-200 p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-3 border-t border-gray-200">
            <Link
              to="/services"
              onClick={closeMenu}
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
            >
              Services
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
            >
              Contact
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to={getNotificationsLink()}
                  onClick={closeMenu}
                  className="flex items-center justify-between text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
                >
                  {user.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(user.profilePicture)}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <FaUserCircle size={20} />
                  )}
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-4 py-2 rounded transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded transition-all duration-200 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
