import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'bkash',
    senderNumber: '',
    transactionRef: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await bookingsAPI.getById(bookingId);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setBooking(data);
    } catch (error) {
      toast.error('Error loading booking');
      navigate('/patient/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await paymentsAPI.create({
        bookingId: booking.id,
        amount: booking.service.price,
        method: paymentData.method,
        paymentDetails: {
          senderNumber: paymentData.senderNumber,
          transactionRef: paymentData.transactionRef
        }
      });

      toast.success('Payment successful!');
      navigate('/patient/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{booking.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{booking.scheduledTime}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary-600">৳{booking.service.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="label">Select Payment Method</label>
                <select
                  name="method"
                  value={paymentData.method}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash on Service</option>
                </select>
              </div>

              {(paymentData.method === 'bkash' || paymentData.method === 'nagad') && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                      <li>Open your {paymentData.method === 'bkash' ? 'bKash' : 'Nagad'} app</li>
                      <li>Send ৳{booking.service.price} to: 01700-000000</li>
                      <li>Enter your number and transaction ID below</li>
                    </ol>
                  </div>

                  <div>
                    <label className="label">Your {paymentData.method === 'bkash' ? 'bKash' : 'Nagad'} Number</label>
                    <input
                      type="tel"
                      name="senderNumber"
                      value={paymentData.senderNumber}
                      onChange={handleChange}
                      placeholder="+880 1XXX-XXXXXX"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Transaction ID</label>
                    <input
                      type="text"
                      name="transactionRef"
                      value={paymentData.transactionRef}
                      onChange={handleChange}
                      placeholder="e.g., 8A5B2C9D1E"
                      className="input-field"
                      required
                    />
                  </div>
                </>
              )}

              {paymentData.method === 'cash' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    You have selected Cash on Service. You will pay ৳{booking.service.price} when the service is delivered.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? 'Processing Payment...' : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
