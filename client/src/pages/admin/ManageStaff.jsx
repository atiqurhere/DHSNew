import React, { useState, useEffect } from 'react';
import api from '../../utils/supabaseAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaUser } from 'react-icons/fa';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, verified, all
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [verificationAction, setVerificationAction] = useState(''); // verify or reject
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await adminAPI.getAllUsers().then(res => res.data?.filter(u => u.role === "staff") || []);
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setStaff(data);
    } catch (error) {
      toast.error('Error fetching staff');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (staffId) => {
    try {
      await adminAPI.verifyStaff(staffId);
      toast.success('Staff verified successfully');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error verifying staff');
    }
  };

  const handleReject = (staff) => {
    setSelectedStaff(staff);
    setVerificationAction('reject');
    setIsModalOpen(true);
  };

  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/staff/${selectedStaff.id}/reject`, {
        reason: rejectionReason
      });
      toast.success('Staff application rejected');
      setIsModalOpen(false);
      setRejectionReason('');
      fetchStaff();
    } catch (error) {
      toast.error('Error rejecting staff');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/admin/staff/${id}`);
        toast.success('Staff deleted successfully');
        fetchStaff();
      } catch (error) {
        toast.error('Error deleting staff');
      }
    }
  };

  const viewStaffDetails = (staff) => {
    setSelectedStaff(staff);
    setVerificationAction('view');
    setIsModalOpen(true);
  };

  const filteredStaff = staff.filter((s) => {
    if (activeTab === 'pending') return s.verificationStatus === 'pending';
    if (activeTab === 'verified') return s.verificationStatus === 'verified';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Staff</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded transition flex-1 md:flex-none whitespace-nowrap ${
            activeTab === 'pending' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          Pending ({staff.filter(s => s.verificationStatus === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded transition flex-1 md:flex-none whitespace-nowrap ${
            activeTab === 'verified' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          Verified ({staff.filter(s => s.verificationStatus === 'verified').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded transition flex-1 md:flex-none whitespace-nowrap ${
            activeTab === 'all' ? 'bg-white shadow font-semibold' : 'hover:bg-gray-200'
          }`}
        >
          All ({staff.length})
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="card hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  member.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : member.verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {member.verificationStatus}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-semibold">Phone:</span> {member.phone}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Specialization:</span> {member.specialization || 'N/A'}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Experience:</span> {member.experience || 'N/A'}
              </p>
              {member.rating && (
                <p className="text-sm">
                  <span className="font-semibold">Rating:</span> ⭐ {member.rating}/5
                </p>
              )}
            </div>

            {member.verificationStatus === 'pending' && (
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => handleVerify(member.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition flex items-center justify-center space-x-1"
                >
                  <FaCheckCircle />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleReject(member)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition flex items-center justify-center space-x-1"
                >
                  <FaTimesCircle />
                  <span>Reject</span>
                </button>
              </div>
            )}

            <div className="flex space-x-2 pt-3 border-t">
              <button
                onClick={() => viewStaffDetails(member)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                View Details
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition flex items-center justify-center space-x-1"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No staff members found in this category</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStaff(null);
          setRejectionReason('');
        }}
        title={
          verificationAction === 'reject'
            ? 'Reject Staff Application'
            : 'Staff Details'
        }
      >
        {verificationAction === 'reject' ? (
          <form onSubmit={handleSubmitRejection} className="space-y-4">
            <div>
              <label className="label">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                className="input-field"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Confirm Rejection
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
        ) : (
          selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-sm text-gray-600">Full Name</p>
                  <p className="text-base">{selectedStaff.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Email</p>
                  <p className="text-base">{selectedStaff.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Phone</p>
                  <p className="text-base">{selectedStaff.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      selectedStaff.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : selectedStaff.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedStaff.verificationStatus}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Specialization</p>
                  <p className="text-base">{selectedStaff.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Experience</p>
                  <p className="text-base">{selectedStaff.experience || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Qualifications</p>
                  <p className="text-base">{selectedStaff.qualifications || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Rating</p>
                  <p className="text-base">⭐ {selectedStaff.rating || 'N/A'}/5</p>
                </div>
              </div>
              
              {selectedStaff.documents && selectedStaff.documents.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-gray-600 mb-2">Documents</p>
                  <div className="space-y-1">
                    {selectedStaff.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedStaff.verificationStatus === 'rejected' && selectedStaff.rejectionReason && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-semibold text-sm text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedStaff.rejectionReason}</p>
                </div>
              )}

              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default ManageStaff;
