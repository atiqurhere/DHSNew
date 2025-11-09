import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import { uploadAPI, authAPI } from '../utils/supabaseAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'
  );
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || {
      street: '',
      city: 'Dhaka',
      area: '',
      postalCode: ''
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: 'Dhaka',
          area: '',
          postalCode: ''
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setImagePreview(
        user.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', profileImage);

      const { data } = await api.put('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await updateUserProfile(data);
      toast.success('Profile picture updated successfully!');
      setProfileImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password change if attempted
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      // Include password fields if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const { data } = await api.put('/auth/profile', updateData);
      await updateUserProfile(data);
      
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-primary-100 mt-2">Manage your account information</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-3 rounded-full cursor-pointer hover:bg-primary-700 transition shadow-lg group-hover:scale-110 transform">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {profileImage && (
                <button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="mt-4 btn-primary flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Profile Picture
                    </>
                  )}
                </button>
              )}

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaUser className="text-primary-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
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
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="input-field bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaPhone className="text-primary-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary-600" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="House/Flat no., Street name"
                    />
                  </div>
                  <div>
                    <label className="label">Area</label>
                    <input
                      type="text"
                      name="address.area"
                      value={formData.address.area}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Gulshan, Banani"
                    />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Dhaka"
                    />
                  </div>
                  <div>
                    <label className="label">Postal Code</label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., 1212"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaEyeSlash className="text-primary-600" />
                  Change Password
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Leave these fields empty if you don't want to change your password.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input-field pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-field pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
