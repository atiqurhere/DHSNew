import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaAmbulance, FaTicketAlt } from 'react-icons/fa';

const Contact = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    fetchContactContent();
  }, []);

  const fetchContactContent = async () => {
    try {
      const { data } = await api.get('/pages/contact');
      setSections(data.sections);
      
      // Extract contact info
      const contactSection = data.sections.find(s => s.type === 'contact-info');
      if (contactSection) {
        setContactInfo(contactSection.contactInfo);
      }
    } catch (error) {
      console.error('Error fetching contact page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const heroSection = sections.find(s => s.type === 'hero');
  const customSection = sections.find(s => s.type === 'custom');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {heroSection && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 animate-fadeIn">{heroSection.title}</h1>
              <p className="text-xl text-primary-100 leading-relaxed">{heroSection.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information Cards */}
      {contactInfo && (
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Phone */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-100 p-4 rounded-full mb-4">
                    <FaPhone className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Phone</h3>
                  <a href={`tel:${contactInfo.phone}`} className="text-primary-600 hover:text-primary-700 font-medium text-lg">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-100 p-4 rounded-full mb-4">
                    <FaEnvelope className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Email</h3>
                  <a href={`mailto:${contactInfo.email}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-100 p-4 rounded-full mb-4">
                    <FaMapMarkerAlt className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Address</h3>
                  <p className="text-gray-600">
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-100 p-4 rounded-full mb-4">
                    <FaClock className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Working Hours</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {contactInfo.workingHours}
                  </p>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-red-50 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-2">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-red-100 p-4 rounded-full mb-4">
                    <FaAmbulance className="text-red-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Emergency</h3>
                  <a href={`tel:${contactInfo.emergencyPhone}`} className="text-red-600 hover:text-red-700 font-bold text-2xl">
                    {contactInfo.emergencyPhone}
                  </a>
                  <p className="text-gray-600 mt-2">Always available for medical emergencies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Support Info */}
      {customSection && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">{customSection.title}</h2>
                <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {customSection.content}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={() => navigate('/support')}
                  className="btn-primary text-center flex items-center justify-center gap-2"
                >
                  <FaTicketAlt />
                  My Tickets
                </button>
                <a
                  href="/support/new"
                  className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                >
                  Create Support Ticket
                </a>
                <a
                  href="/services"
                  className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                >
                  View Our Services
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Section (Optional - can be enhanced with actual map integration) */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Find Us</h2>
            <div className="bg-gray-300 h-96 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Map integration coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
