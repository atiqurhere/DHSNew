import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const TempAdminWarning = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  // Only show if user is the temporary admin
  if (!user || user.role !== 'admin' || user.email !== 'temp.admin@dhs.com' || dismissed) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-[60] animate-pulse">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaExclamationTriangle className="text-2xl flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base">
              🚨 SECURITY WARNING: You are logged in as TEMPORARY ADMIN!
            </p>
            <p className="text-xs sm:text-sm opacity-90">
              This account must be DELETED immediately after creating a permanent admin.{' '}
              <Link to="/admin/manage-admins" className="underline font-semibold hover:text-yellow-300">
                Go to Manage Admins →
              </Link>
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white hover:text-yellow-300 p-1 flex-shrink-0"
          title="Dismiss (Warning will return on refresh)"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default TempAdminWarning;
