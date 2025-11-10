import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    // If no email in state, redirect to register
    if (!location.state?.email) {
      navigate('/register');
      return;
    }

    // Start initial timer
    setResendTimer(60);
  }, [location.state, navigate]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendEmail = async () => {
    if (resendTimer > 0) {
      toast.warning(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    if (resendCount >= 5) {
      toast.error('Maximum resend attempts reached. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast.success('✉️ Verification email sent! Check your inbox (and spam folder)', {
        autoClose: 5000,
      });

      setResendCount(resendCount + 1);
      setResendTimer(60); // Reset timer to 60 seconds
    } catch (error) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    navigate('/register', { state: { prefillEmail: email } });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Login Button */}
        <button
          onClick={handleBackToLogin}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
          {/* Icon Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
                <Mail className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Verify Your Email
          </h1>

          <p className="text-center text-gray-600 mb-6">
            We've sent a verification email to:
          </p>

          {/* Email Display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-center font-semibold text-blue-900 break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Next Steps:
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>Check your inbox for an email from DHS Healthcare</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>You'll be redirected to your dashboard automatically</span>
              </li>
            </ol>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ Can't find the email? Check your <strong>spam/junk folder</strong>
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={loading || resendTimer > 0}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              resendTimer > 0 || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : resendTimer > 0 ? (
              <>
                <Clock className="w-5 h-5" />
                Resend in {resendTimer}s
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>

          {/* Resend Counter */}
          {resendCount > 0 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Email sent {resendCount} time{resendCount > 1 ? 's' : ''}
            </p>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Need Help?</span>
            </div>
          </div>

          {/* Help Actions */}
          <div className="space-y-3">
            <button
              onClick={handleChangeEmail}
              className="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Used Wrong Email? Register Again
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full py-2 border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300"
            >
              Already Verified? Login
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Still having trouble?{' '}
              <a
                href="/contact"
                className="text-blue-600 hover:underline font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>

          {/* Auto-refresh hint */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800 text-center">
              💡 <strong>Tip:</strong> After clicking the link in your email, you'll be automatically redirected to your dashboard!
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          This verification link will expire in <strong>24 hours</strong>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
