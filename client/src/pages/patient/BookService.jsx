import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    prescription: null
  });

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const { data } = await api.get(`/services/${serviceId}`);
      setService(data);
    } catch (error) {
      toast.error('Error loading service');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'prescription') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingData = new FormData();
      bookingData.append('serviceId', serviceId);
      bookingData.append('scheduledDate', formData.scheduledDate);
      bookingData.append('scheduledTime', formData.scheduledTime);
      bookingData.append('notes', formData.notes);
      if (formData.prescription) {
        bookingData.append('prescription', formData.prescription);
      }

      const { data: booking } = await api.post('/bookings', bookingData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Booking created successfully!');
      navigate(`/patient/payment/${booking._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating booking');
    } finally {
      setSubmitting(false);
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
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Book Service</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="font-semibold">Price:</span>
                <span className="text-2xl text-primary-600">৳{service.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Duration:</span>
                <span>{service.duration}</span>
              </div>
            </div>
            {service.features && service.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Booking Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Scheduled Time</label>
                <select
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>

              {service.requirements?.includes('Prescription required') && (
                <div>
                  <label className="label">Upload Prescription (Optional)</label>
                  <input
                    type="file"
                    name="prescription"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              )}

              <div>
                <label className="label">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Any special requirements or instructions..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
