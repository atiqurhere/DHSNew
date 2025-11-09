import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import api from '../../utils/supabaseAPI';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaArrowLeft } from 'react-icons/fa';

const NewSupportTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'booking', label: 'Booking Related' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supportAPI.create(formData);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      toast.success('Support ticket created successfully!');
      navigate(`/support/tickets/${data.ticket.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <div className="flex items-center space-x-3">
              <FaTicketAlt size={32} />
              <div>
                <h1 className="text-3xl font-bold">Create Support Ticket</h1>
                <p className="text-primary-100 mt-2">Our team will respond as soon as possible</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Subject */}
            <div>
              <label className="label">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  {priorities.map(pri => (
                    <option key={pri.value} value={pri.value}>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="label">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input-field"
                rows="8"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Response Time:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Urgent:</strong> Within 1 hour</li>
                <li>• <strong>High:</strong> Within 4 hours</li>
                <li>• <strong>Medium:</strong> Within 24 hours</li>
                <li>• <strong>Low:</strong> Within 48 hours</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Alternative Support */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Need Immediate Help?</h3>
          <div className="space-y-2 text-gray-600">
            <p>📞 Call us: <a href="tel:+880 1700-000000" className="text-primary-600 hover:underline">+880 1700-000000</a></p>
            <p>📧 Email: <a href="mailto:support@dhsbd.com" className="text-primary-600 hover:underline">support@dhsbd.com</a></p>
            <p>💬 Use the AI chatbot (bottom-right) for instant assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSupportTicket;
