import React, { useState, useEffect } from 'react';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaShieldAlt } from 'react-icons/fa';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    permissions: {
      manageServices: true,
      manageStaff: true,
      manageBookings: true,
      managePayments: true,
      manageAdmins: false,
      viewReports: true
    }
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await adminAPI.getAllUsers().then(res => res.data?.filter(u => u.role === "admin") || []);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setAdmins(data);
    } catch (error) {
      toast.error('Error fetching admins');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permission = name.split('.')[1];
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [permission]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await api.put(`/admin/admins/${editingAdmin.id}`, formData);
        toast.success('Admin updated successfully');
      } else {
        const response = await api.post('/admin/admins', formData);
        // Show appropriate message based on whether it was an upgrade or new creation
        if (response.data.message) {
          toast.success(response.data.message);
        } else {
          toast.success('Admin created successfully');
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving admin');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      phone: admin.phone,
      permissions: admin.permissions || {
        manageServices: true,
        manageStaff: true,
        manageBookings: true,
        managePayments: true,
        manageAdmins: false,
        viewReports: true
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(`/admin/admins/${id}`);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        toast.error('Error deleting admin');
      }
    }
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      permissions: {
        manageServices: true,
        manageStaff: true,
        manageBookings: true,
        managePayments: true,
        manageAdmins: false,
        viewReports: true
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Admins</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add New Admin</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaShieldAlt className="text-primary-600 mr-2" />
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions?.manageAdmins && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Super Admin</span>
                      )}
                      {admin.permissions?.manageServices && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Services</span>
                      )}
                      {admin.permissions?.manageStaff && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Staff</span>
                      )}
                      {admin.permissions?.manageBookings && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Bookings</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If the email already exists as a patient or staff account, 
                it will be automatically upgraded to admin with the selected permissions.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
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
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">
                Password 
                {editingAdmin ? ' (leave blank to keep current)' : ' (optional if upgrading existing user)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder={editingAdmin ? "Leave blank to keep current" : "Required for new users only"}
              />
            </div>
          </div>

          <div>
            <label className="label mb-3">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.manageServices"
                  checked={formData.permissions.manageServices}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Manage Services</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.manageStaff"
                  checked={formData.permissions.manageStaff}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Manage Staff</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.manageBookings"
                  checked={formData.permissions.manageBookings}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Manage Bookings</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.managePayments"
                  checked={formData.permissions.managePayments}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Manage Payments</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.viewReports"
                  checked={formData.permissions.viewReports}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">View Reports</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="permissions.manageAdmins"
                  checked={formData.permissions.manageAdmins}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-semibold text-red-600">Manage Admins (Super Admin)</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
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

export default ManageAdmins;
