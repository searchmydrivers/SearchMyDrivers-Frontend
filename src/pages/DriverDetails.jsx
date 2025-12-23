import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';
import api from '../config/api';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await driverService.getDriverById(id);
      setDriver(response.data?.driver);
    } catch (error) {
      console.error('Error fetching driver details:', error);
      setError('Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Are you sure you want to verify this driver? Once verified, the driver will be able to login and accept trips.')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await driverService.verifyDriver(id);
      setSuccess(response.message || 'Driver verified successfully!');
      await fetchDriverDetails();
      setTimeout(() => {
        navigate('/drivers/pending');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectionReason('');
    setError('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await driverService.rejectDriver(id, rejectionReason);
      setSuccess(response.message || 'Driver rejected successfully!');
      setShowRejectModal(false);
      await fetchDriverDetails();
      setTimeout(() => {
        navigate('/drivers/pending');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject driver');
    } finally {
      setActionLoading(false);
    }
  };

  const canVerify = () => {
    if (!driver) return false;
    return driver.verificationStatus === 'otp-verified' || driver.verificationStatus === 'documents-uploaded';
  };

  const canReject = () => {
    if (!driver) return false;
    return driver.verificationStatus !== 'verified' && driver.verificationStatus !== 'rejected';
  };

  const handleSuspend = async () => {
    if (!window.confirm(`Are you sure you want to ${driver.isSuspended ? 'unsuspend' : 'suspend'} this driver?`)) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await driverService.suspendDriver(
        id,
        !driver.isSuspended,
        driver.isSuspended ? null : 'Suspended by admin'
      );
      if (response.success) {
        setSuccess(response.message || `Driver ${driver.isSuspended ? 'unsuspended' : 'suspended'} successfully!`);
        await fetchDriverDetails();
      } else {
        setError(response.message || 'Failed to update driver status');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update driver status');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workLocation: '',
    licenseNumber: '',
    aadharNumber: '',
    panNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    verificationStatus: '',
  });
  const [editFiles, setEditFiles] = useState({});

  useEffect(() => {
    if (driver) {
      setEditFormData({
        name: driver.name || '',
        email: driver.email || '',
        phone: driver.phone || '',
        workLocation: driver.workLocation || '',
        licenseNumber: driver.licenseNumber || '',
        aadharNumber: driver.aadharNumber || '',
        panNumber: driver.panNumber || '',
        street: driver.address?.street || '',
        city: driver.address?.city || '',
        state: driver.address?.state || '',
        pincode: driver.address?.pincode || '',
        verificationStatus: driver.verificationStatus || '',
      });
    }
  }, [driver]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setEditFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) formData.append(key, editFormData[key]);
      });

      Object.keys(editFiles).forEach(key => {
        if (editFiles[key]) formData.append(key, editFiles[key]);
      });

      const response = await driverService.updateDriver(id, formData);
      if (response.success) {
        setSuccess('Driver updated successfully!');
        setDriver(response.data.driver);
        setShowEditModal(false);
        setEditFiles({});
      } else {
        setError(response.message || 'Failed to update driver');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Failed to update driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.delete(`/admins/drivers/${id}`);
      if (response.data.success) {
        setSuccess('Driver deleted successfully!');
        setTimeout(() => {
          navigate('/drivers');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to delete driver');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete driver');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading driver details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!driver) {
    return (
      <Layout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">person_off</span>
          <p className="text-gray-500 text-sm font-medium">Driver not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => navigate('/drivers')}
          className="text-[#0B2C4D] hover:text-[#2BB673] font-semibold flex items-center space-x-1.5 transition-colors group text-sm"
        >
          <span className="material-icons-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span>Back to Drivers</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex items-center flex-1 min-w-0">
              {driver.profilePicture ? (
                <img
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full mr-4 flex-shrink-0 shadow-md border-2 border-white"
                  src={driver.profilePicture}
                  alt={driver.name}
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center mr-4 flex-shrink-0 shadow-md border-2 border-white">
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {driver.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate mb-0.5">{driver.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate mb-0.5">{driver.email}</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-1.5">{driver.phone}</p>
                <div className="flex items-center">
                  <span className="material-icons-outlined text-yellow-500 text-base mr-1">star</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {driver.rating ? driver.rating.toFixed(1) : '3.0'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 ml-1.5">
                    / 5.0 • {driver.totalRides || 0} rides
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full uppercase tracking-wide ${driver.verificationStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : driver.verificationStatus === 'documents-uploaded'
                    ? 'bg-gray-100 text-[#0B2C4D]'
                    : driver.verificationStatus === 'otp-verified'
                      ? 'bg-purple-100 text-purple-800'
                      : driver.verificationStatus === 'verified'
                        ? 'bg-green-100 text-[#2BB673]'
                        : 'bg-red-100 text-red-800'
                  }`}
              >
                <span className="material-icons-outlined text-sm mr-1">
                  {driver.verificationStatus === 'verified' ? 'check_circle' : driver.verificationStatus === 'rejected' ? 'cancel' : 'schedule'}
                </span>
                {driver.verificationStatus}
              </span>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-1 text-[#0B2C4D] hover:text-[#2BB673] transition-colors text-xs font-bold uppercase tracking-wide bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100"
              >
                <span className="material-icons-outlined text-sm">edit</span>
                <span>Edit Details</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
              <span className="material-icons-outlined mr-2 text-sm">error_outline</span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
              <span className="material-icons-outlined mr-2 text-sm">check_circle</span>
              {success}
            </div>
          )}

          {canVerify() && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="bg-[#2BB673] hover:bg-[#239960] text-white px-4 py-2 rounded shadow-sm text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                {actionLoading ? 'Processing...' : '✅ Verify Driver'}
              </button>
              {canReject() && (
                <button
                  onClick={handleRejectClick}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  {actionLoading ? 'Processing...' : '❌ Reject Driver'}
                </button>
              )}
            </div>
          )}

          {driver.verificationStatus === 'verified' && (
            <div className="mb-4 space-y-3">
              {driver.isSuspended ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  ⚠️ This driver has been suspended and will not receive trip notifications.
                  {driver.suspensionReason && (
                    <p className="mt-1 font-medium">Reason: {driver.suspensionReason}</p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
                  ✅ This driver has been verified and can now login to accept trips.
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded font-semibold transition-all duration-200 shadow-sm flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide ${driver.isSuspended
                    ? 'bg-gradient-to-r from-[#2BB673] to-[#239960] text-white hover:from-[#239960] hover:to-[#1a7548]'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                    }`}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-sm">
                        {driver.isSuspended ? 'check_circle' : 'block'}
                      </span>
                      <span>{driver.isSuspended ? 'Unsuspend Driver' : 'Suspend Driver'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm font-semibold flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-sm">delete</span>
                      <span>Delete Driver</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {driver.verificationStatus === 'rejected' && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              ❌ This driver has been rejected and cannot login.
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Edit Driver Details</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="material-icons-outlined text-gray-500">close</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="editDriverForm" onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-[#0B2C4D] mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Work Location</label>
                        <input
                          type="text"
                          name="workLocation"
                          value={editFormData.workLocation}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Status</label>
                        <select
                          name="verificationStatus"
                          value={editFormData.verificationStatus}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="documents-uploaded">Documents Uploaded</option>
                          <option value="otp-verified">OTP Verified</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'profilePicture')}
                          className="block w-full text-xs text-gray-500
                            file:mr-2 file:py-1.5 file:px-3
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identification */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-[#0B2C4D] mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Identification Numbers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={editFormData.licenseNumber}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhar Number</label>
                        <input
                          type="text"
                          name="aadharNumber"
                          value={editFormData.aadharNumber}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                        <input
                          type="text"
                          name="panNumber"
                          value={editFormData.panNumber}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-[#0B2C4D] mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          name="street"
                          value={editFormData.street}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={editFormData.city}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={editFormData.state}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={editFormData.pincode}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-[#0B2C4D] mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Documents (Upload to Update)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Aadhar Front', key: 'aadharFront' },
                        { label: 'Aadhar Back', key: 'aadharBack' },
                        { label: 'PAN Front', key: 'panFront' },
                        { label: 'License Front', key: 'licenseFront' },
                        { label: 'License Back', key: 'licenseBack' },
                        { label: 'Electricity Bill', key: 'electricityBill' },
                        { label: 'Rent Agreement', key: 'rentAgreement' },
                        { label: 'Police Verification', key: 'policeVerificationCertificate' },
                      ].map((doc) => (
                        <div key={doc.key}>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{doc.label}</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, doc.key)}
                            className="block w-full text-xs text-gray-500
                              file:mr-2 file:py-1.5 file:px-3
                              file:rounded-full file:border-0
                              file:text-xs file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                          {editFiles[doc.key] && (
                            <p className="text-[10px] text-green-600 mt-1">✓ New file selected</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editDriverForm"
                  className="px-6 py-2 bg-[#0B2C4D] text-white rounded-lg hover:bg-[#1a3a5a] font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-4 sm:p-5 max-w-sm w-full shadow-2xl animate-scale-in">
              <h2 className="text-base font-bold text-gray-800 mb-2">Reject Driver</h2>
              <p className="text-xs text-gray-600 mb-3">
                Please provide a reason for rejecting this driver.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 outline-none text-xs h-24 resize-none mb-3"
                placeholder="Enter rejection reason..."
              />
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleRejectConfirm}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition font-semibold text-xs"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setError('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">person</span>
              Personal Information
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Driver ID</label>
                <p className="font-semibold text-gray-900 font-mono">#{driver.driverId || '---'}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Name</label>
                <p className="font-semibold text-gray-900">{driver.name}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Email</label>
                <p className="font-semibold text-gray-900">{driver.email}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Phone</label>
                <p className="font-semibold text-gray-900">{driver.phone}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Rating</label>
                <div className="flex items-center font-semibold text-gray-900">
                  <span className="material-icons-outlined text-yellow-500 text-sm mr-1">star</span>
                  {driver.rating ? driver.rating.toFixed(1) : '3.0'}
                  <span className="text-[10px] text-gray-400 ml-1 font-normal">/ 5.0</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Total Rides</label>
                <p className="font-semibold text-gray-900">{driver.totalRides || 0}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Phone Verified</label>
                <p className="font-semibold text-gray-900">{driver.isPhoneVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-500 font-medium">Account Status</label>
                <p className="font-semibold text-gray-900">{driver.isActive ? '✅ Active' : '❌ Inactive'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#2BB673]">description</span>
              Document Numbers
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">Aadhar Number</label>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{driver.aadharNumber || 'Not provided'}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {driver.aadharVerified ? '✅ Verified' : '⏳ Pending'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">PAN Number</label>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{driver.panNumber || 'Not provided'}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {driver.panVerified ? '✅ Verified' : '⏳ Pending'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-500 font-medium">License Number</label>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{driver.licenseNumber || 'Not provided'}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {driver.licenseVerified ? '✅ Verified' : '⏳ Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">folder</span>
              Verification Documents
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Aadhar Front', url: driver.verificationDocuments?.aadharFront },
                { label: 'Aadhar Back', url: driver.verificationDocuments?.aadharBack },
                { label: 'PAN Front', url: driver.verificationDocuments?.panFront },
                { label: 'License Front', url: driver.verificationDocuments?.licenseFront },
                { label: 'License Back', url: driver.verificationDocuments?.licenseBack },
                { label: 'Electricity Bill', url: driver.verificationDocuments?.electricityBill },
                { label: 'Rent Agreement', url: driver.verificationDocuments?.rentAgreement },
                { label: 'Police Verification', url: driver.verificationDocuments?.policeVerificationCertificate },
              ].map((doc, index) => doc.url && (
                <div key={index} className="group relative">
                  <label className="text-[10px] text-gray-500 block mb-1 font-medium bg-gray-50 px-2 py-0.5 rounded w-fit">{doc.label}</label>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all" onClick={() => window.open(doc.url, '_blank')}>
                    <img
                      src={doc.url}
                      alt={doc.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="material-icons-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">visibility</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!driver.verificationDocuments?.aadharFront && !driver.verificationDocuments?.panFront && !driver.verificationDocuments?.licenseFront && (
              <p className="text-gray-400 text-center py-6 text-xs italic">No documents uploaded yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:col-span-2 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">location_on</span>
              Work Location
            </h2>
            <div>
              <p className="font-medium text-xs">
                {driver.workLocation ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <span className="material-icons-outlined text-sm mr-1">location_on</span>
                    {driver.workLocation}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:col-span-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
              <span className="material-icons-outlined text-lg mr-2 text-[#2BB673]">schedule</span>
              Registration Timeline
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Account Created</span>
                <span className="text-gray-900 font-semibold font-mono">
                  {new Date(driver.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Last Updated</span>
                <span className="text-gray-900 font-semibold font-mono">
                  {new Date(driver.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverDetails;
