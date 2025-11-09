import React, { useState, useEffect } from 'react';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { FaEye, FaUserMd, FaCheck, FaTimes } from 'react-icons/fa';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalType, setModalType] = useState(''); // view, assignStaff, updateStatus
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchStaff();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await bookingsAPI.getAll();
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setBookings(data);
    } catch (error) {
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await adminAPI.getAllUsers().then(res => res.data?.filter(u => u.role === "staff") || []);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setStaff(data.filter(s => s.verificationStatus === 'verified'));
    } catch (error) {
      console.error('Error fetching staff');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleAssignStaff = (booking) => {
    setSelectedBooking(booking);
    setSelectedStaffId(booking.assignedStaff?.id || '');
    setModalType('assignStaff');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (booking) => {
    setSelectedBooking(booking);
    setSelectedStatus(booking.status);
    setModalType('updateStatus');
    setIsModalOpen(true);
  };

  const submitAssignStaff = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/bookings/${selectedBooking.id}/assign-staff`, {
        staffId: selectedStaffId
      });
      toast.success('Staff assigned successfully');
      setIsModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning staff');
    }
  };

  const submitUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/bookings/${selectedBooking.id}/status`, {
        status: selectedStatus
      });
      toast.success('Booking status updated');
      setIsModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Bookings</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-full overflow-x-auto">
        {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded transition flex-1 md:flex-none whitespace-nowrap text-sm ${
              activeTab === tab ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')} (
            {tab === 'all' ? bookings.length : bookings.filter(b => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{booking.id.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.patient?.name}</div>
                  <div className="text-sm text-gray-500">{booking.patient?.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.service?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">{booking.scheduledTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {booking.assignedStaff ? (
                    <div>
                      <div className="font-medium text-gray-900">{booking.assignedStaff.name}</div>
                      <div className="text-gray-500">{booking.assignedStaff.specialization}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Not assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <FaEye className="inline" />
                  </button>
                  <button
                    onClick={() => handleAssignStaff(booking)}
                    className="text-green-600 hover:text-green-900"
                    title="Assign Staff"
                  >
                    <FaUserMd className="inline" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking)}
                    className="text-purple-600 hover:text-purple-900"
                    title="Update Status"
                  >
                    <FaCheck className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No bookings found in this category</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        title={
          modalType === 'view'
            ? 'Booking Details'
            : modalType === 'assignStaff'
            ? 'Assign Staff'
            : 'Update Status'
        }
      >
        {modalType === 'view' && selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm text-gray-600">Booking ID</p>
                <p className="text-base">#{selectedBooking.id.slice(-8)}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedBooking.patient?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedBooking.patient?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedBooking.patient?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{selectedBooking.service?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium">৳{selectedBooking.service?.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(selectedBooking.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">{selectedBooking.scheduledTime}</p>
                </div>
              </div>
            </div>

            {selectedBooking.address && (
              <div className="border-t pt-4">
                <p className="font-semibold text-sm text-gray-600 mb-1">Address</p>
                <p className="text-base">{selectedBooking.address}</p>
              </div>
            )}

            {selectedBooking.notes && (
              <div className="border-t pt-4">
                <p className="font-semibold text-sm text-gray-600 mb-1">Additional Notes</p>
                <p className="text-base">{selectedBooking.notes}</p>
              </div>
            )}

            {selectedBooking.assignedStaff && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Assigned Staff</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedBooking.assignedStaff.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.assignedStaff.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.assignedStaff.phone}</p>
                </div>
              </div>
            )}

            <button onClick={() => setIsModalOpen(false)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        )}

        {modalType === 'assignStaff' && (
          <form onSubmit={submitAssignStaff} className="space-y-4">
            <div>
              <label className="label">Select Staff Member</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a staff member...</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.specialization} ({member.rating ? `⭐${member.rating}` : 'No rating'})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Assign Staff
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {modalType === 'updateStatus' && (
          <form onSubmit={submitUpdateStatus} className="space-y-4">
            <div>
              <label className="label">Update Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageBookings;
