import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      // Silently fail - don't log error for unauthenticated users
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
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
                      src={`http://localhost:5000${user.profilePicture}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <FaUserCircle size={24} style={{ display: user.profilePicture ? 'none' : 'block' }} />
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
                      src={`http://localhost:5000${user.profilePicture}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <FaUserCircle size={20} style={{ display: user.profilePicture ? 'none' : 'block' }} />
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
