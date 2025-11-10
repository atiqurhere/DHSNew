import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, already_verified
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Invalid verification link. Please try registering again.');
          return;
        }

        // Check if user is already logged in (Supabase auto-verifies on click)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          // User is verified and logged in
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          
          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                // Redirect based on user role
                redirectUser(session.user.id);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          // Session not found - might be already verified
          setStatus('already_verified');
          setMessage('Your email is already verified. Please log in to continue.');
        }

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const redirectUser = async (userId) => {
    try {
      // Fetch user profile to determine role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile) {
        switch (profile.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'staff':
            navigate('/staff/dashboard');
            break;
          case 'patient':
          default:
            navigate('/patient/dashboard');
            break;
        }
      } else {
        // Default redirect
        navigate('/login');
      }
    } catch (error) {
      console.error('Redirect error:', error);
      navigate('/login');
    }
  };

  const handleManualRedirect = () => {
    if (status === 'already_verified' || status === 'error') {
      navigate('/login');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'verifying' && (
            <div className="animate-spin">
              <Loader className="w-16 h-16 text-blue-600" />
            </div>
          )}
          {status === 'success' && (
            <div className="animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          )}
          {(status === 'error' || status === 'already_verified') && (
            <XCircle className="w-16 h-16 text-orange-500" />
          )}
        </div>

        {/* Status Title */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {status === 'verifying' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Verified! 🎉'}
          {status === 'already_verified' && 'Already Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        {/* Status Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Countdown for Success */}
        {status === 'success' && countdown > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-center text-blue-700">
              Redirecting to your dashboard in <span className="font-bold text-2xl">{countdown}</span> seconds...
            </p>
          </div>
        )}

        {/* Manual Redirect Button */}
        {status !== 'verifying' && (
          <button
            onClick={handleManualRedirect}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            {status === 'success' ? 'Go to Dashboard Now' : 'Go to Login'}
          </button>
        )}

        {/* Additional Help */}
        {(status === 'error' || status === 'already_verified') && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        )}

        {/* Success Additional Info */}
        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Your account is now active</li>
              <li>✓ You can book appointments</li>
              <li>✓ Access all healthcare services</li>
              <li>✓ View your medical history</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
