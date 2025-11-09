import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const { data } = await api.get('/services', { params });
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      alert('Only patients can book services');
      return;
    }
    navigate(`/patient/book-service/${service._id}`);
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'home-care', label: 'Home Care' },
    { value: 'nurse-care', label: 'Nurse Care' },
    { value: 'medicine-delivery', label: 'Medicine Delivery' },
    { value: 'doctor-on-call', label: 'Doctor on Call' },
    { value: 'equipment-rental', label: 'Equipment Rental' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Our Services</h1>

        {/* Filter */}
        <div className="flex justify-center mb-8 flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === cat.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onBook={handleBookService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No services available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
