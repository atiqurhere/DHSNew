import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/SupabaseAuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import TempAdminWarning from './components/TempAdminWarning';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';

// Components
import Chatbot from './components/Chatbot';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookService from './pages/patient/BookService';
import Payment from './pages/patient/Payment';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAdmins from './pages/admin/ManageAdmins';
import ManageServices from './pages/admin/ManageServices';
import ManageStaff from './pages/admin/ManageStaff';
import ManageBookings from './pages/admin/ManageBookings';
import ManageTelegramBot from './pages/admin/ManageTelegramBot';
import ManageTelegramAgents from './pages/admin/ManageTelegramAgents';
import ManageSupportTickets from './pages/admin/ManageSupportTickets';
import AdminTicketDetails from './pages/admin/AdminTicketDetails';

// Notifications
import Notifications from './pages/patient/Notifications';
import StaffNotifications from './pages/staff/StaffNotifications';
import AdminNotifications from './pages/admin/AdminNotifications';

// Support
import Support from './pages/support/Support';
import NewSupportTicket from './pages/support/NewSupportTicket';
import TicketDetails from './pages/support/TicketDetails';

// Email Verification & Password Reset
import EmailVerified from './pages/EmailVerified';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Animated Routes Wrapper
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="animate-fadeIn">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Email Verification & Password Reset */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Profile - Protected for all logged-in users */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['patient', 'staff', 'admin']}>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Support Ticket - Protected */}
        <Route
          path="/support"
          element={
            <PrivateRoute allowedRoles={['patient', 'staff', 'admin']}>
              <Support />
            </PrivateRoute>
          }
        />
        <Route
          path="/support/new"
          element={
            <PrivateRoute allowedRoles={['patient', 'staff', 'admin']}>
              <NewSupportTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/support/tickets/:id"
          element={
            <PrivateRoute allowedRoles={['patient', 'staff', 'admin']}>
              <TicketDetails />
            </PrivateRoute>
          }
        />
        
        {/* Admin Login - Separate from user login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book-service/:serviceId"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <BookService />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/payment/:bookingId"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/notifications"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <PrivateRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/notifications"
          element={
            <PrivateRoute allowedRoles={['staff']}>
              <StaffNotifications />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-admins"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageAdmins />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-services"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageServices />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-staff"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageStaff />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-bookings"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/telegram-bot"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageTelegramBot />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/telegram-agents"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageTelegramAgents />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/support-tickets"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ManageSupportTickets />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/support-tickets/:id"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminTicketDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminNotifications />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <TempAdminWarning />
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
          <ScrollToTop />
          <Chatbot />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition:Bounce
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
