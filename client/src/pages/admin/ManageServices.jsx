import React, { useState, useEffect } from 'react';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'home-care',
    price: '',
    duration: '',
    image: '',
    isAvailable: true,
    requirements: '',
    features: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await servicesAPI.getAll();
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setServices(data);
    } catch (error) {
      toast.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        price: Number(formData.price),
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, dataToSend);
        toast.success('Service updated successfully');
      } else {
        await servicesAPI.create(dataToSend);
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      image: service.image,
      isAvailable: service.isAvailable,
      requirements: service.requirements?.join(', ') || '',
      features: service.features?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(id);
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        toast.error('Error deleting service');
      }
    }
  };

  const toggleAvailability = async (service) => {
    try {
      await servicesAPI.update(service.id, {
        ...service,
        isAvailable: !service.isAvailable
      });
      toast.success(`Service ${!service.isAvailable ? 'enabled' : 'disabled'}`);
      fetchServices();
    } catch (error) {
      toast.error('Error updating service');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: 'home-care',
      price: '',
      duration: '',
      image: '',
      isAvailable: true,
      requirements: '',
      features: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Manage Services</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="card hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold">{service.name}</h3>
              <button
                onClick={() => toggleAvailability(service)}
                className={`${service.isAvailable ? 'text-green-600' : 'text-gray-400'} hover:scale-110 transition-transform`}
              >
                {service.isAvailable ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold text-primary-600">৳{service.price}</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{service.duration}</span>
            </div>

            <div className="mb-3">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {service.category.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            {service.features && service.features.length > 0 && (
              <ul className="mb-4 space-y-1">
                {service.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex space-x-2 pt-3 border-t">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition flex items-center justify-center space-x-1"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition flex items-center justify-center space-x-1"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="home-care">Home Care</option>
                <option value="nurse-care">Nurse Care</option>
                <option value="medicine-delivery">Medicine Delivery</option>
                <option value="doctor-on-call">Doctor on Call</option>
                <option value="equipment-rental">Equipment Rental</option>
              </select>
            </div>

            <div>
              <label className="label">Price (৳)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., Per day, 1 hour"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="/images/service.jpg"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Requirements (comma-separated)</label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Prescription required, ID proof"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Features (comma-separated)</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="2"
              placeholder="24/7 Support, Trained Staff, Emergency Service"
              className="input-field"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600"
            />
            <label className="text-sm font-medium">Service is Available</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingService ? 'Update Service' : 'Create Service'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageServices;
