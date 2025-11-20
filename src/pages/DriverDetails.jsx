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
          <div className="text-gray-500">Loading driver details...</div>
        </div>
      </Layout>
    );
  }

  if (!driver) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Driver not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <button
          onClick={() => navigate('/drivers')}
          className="mb-3 sm:mb-4 text-primary-600 hover:text-primary-800 flex items-center text-sm sm:text-base"
        >
          <span className="material-icons-outlined text-lg sm:text-xl mr-1">arrow_back</span>
          <span>Back to Drivers</span>
        </button>

        <div className="card mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
            <div className="flex items-center flex-1 min-w-0">
              {driver.profilePicture ? (
                <img
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full mr-3 sm:mr-4 flex-shrink-0"
                  src={driver.profilePicture}
                  alt={driver.name}
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold text-xl sm:text-2xl">
                    {driver.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{driver.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">{driver.email}</p>
                <p className="text-sm sm:text-base text-gray-600">{driver.phone}</p>
              </div>
            </div>
            <div>
              <span
                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  driver.verificationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : driver.verificationStatus === 'documents-uploaded'
                    ? 'bg-blue-100 text-blue-800'
                    : driver.verificationStatus === 'otp-verified'
                    ? 'bg-purple-100 text-purple-800'
                    : driver.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {driver.verificationStatus}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {canVerify() && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="btn-success text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
              >
                {actionLoading ? 'Processing...' : '✅ Verify Driver'}
              </button>
              {canReject() && (
                <button
                  onClick={handleRejectClick}
                  disabled={actionLoading}
                  className="btn-danger text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                >
                  {actionLoading ? 'Processing...' : '❌ Reject Driver'}
                </button>
              )}
            </div>
          )}

          {driver.verificationStatus === 'verified' && (
            <div className="mb-4 space-y-3">
              {driver.isSuspended ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  ⚠️ This driver has been suspended and will not receive trip notifications.
                  {driver.suspensionReason && (
                    <p className="mt-2 text-sm">Reason: {driver.suspensionReason}</p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✅ This driver has been verified and can now login to accept trips.
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    driver.isSuspended
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined">
                        {driver.isSuspended ? 'check_circle' : 'block'}
                      </span>
                      <span>{driver.isSuspended ? 'Unsuspend Driver' : 'Suspend Driver'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined">delete</span>
                      <span>Delete Driver</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {driver.verificationStatus === 'rejected' && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ❌ This driver has been rejected and cannot login.
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reject Driver</h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this driver. This will prevent them from logging in.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-field mb-4"
                rows="4"
                placeholder="Enter rejection reason..."
              />
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleRejectConfirm}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="btn-danger flex-1"
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
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{driver.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{driver.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{driver.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone Verified</label>
                <p className="font-medium">{driver.isPhoneVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Status</label>
                <p className="font-medium">{driver.isActive ? '✅ Active' : '❌ Inactive'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Document Numbers</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Aadhar Number</label>
                <p className="font-medium">{driver.aadharNumber || 'Not provided'}</p>
                <p className="text-xs text-gray-400">
                  {driver.aadharVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">PAN Number</label>
                <p className="font-medium">{driver.panNumber || 'Not provided'}</p>
                <p className="text-xs text-gray-400">
                  {driver.panVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">License Number</label>
                <p className="font-medium">{driver.licenseNumber || 'Not provided'}</p>
                <p className="text-xs text-gray-400">
                  {driver.licenseVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="card md:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Verification Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {driver.verificationDocuments?.aadharFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Aadhar Front</label>
                  <img
                    src={driver.verificationDocuments.aadharFront}
                    alt="Aadhar Front"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(driver.verificationDocuments.aadharFront, '_blank')}
                  />
                </div>
              )}
              {driver.verificationDocuments?.aadharBack && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Aadhar Back</label>
                  <img
                    src={driver.verificationDocuments.aadharBack}
                    alt="Aadhar Back"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(driver.verificationDocuments.aadharBack, '_blank')}
                  />
                </div>
              )}
              {driver.verificationDocuments?.panFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">PAN Front</label>
                  <img
                    src={driver.verificationDocuments.panFront}
                    alt="PAN Front"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(driver.verificationDocuments.panFront, '_blank')}
                  />
                </div>
              )}
              {driver.verificationDocuments?.licenseFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">License Front</label>
                  <img
                    src={driver.verificationDocuments.licenseFront}
                    alt="License Front"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(driver.verificationDocuments.licenseFront, '_blank')}
                  />
                </div>
              )}
              {driver.verificationDocuments?.licenseBack && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">License Back</label>
                  <img
                    src={driver.verificationDocuments.licenseBack}
                    alt="License Back"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(driver.verificationDocuments.licenseBack, '_blank')}
                  />
                </div>
              )}
            </div>
            {!driver.verificationDocuments?.aadharFront && !driver.verificationDocuments?.panFront && !driver.verificationDocuments?.licenseFront && (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
            )}
          </div>

          {driver.vehicleDetails && (
            <div className="card md:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm text-gray-500">Vehicle Number</label>
                  <p className="font-medium">{driver.vehicleDetails.vehicleNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vehicle Type</label>
                  <p className="font-medium">{driver.vehicleDetails.vehicleType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vehicle Model</label>
                  <p className="font-medium">{driver.vehicleDetails.vehicleModel || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vehicle Color</label>
                  <p className="font-medium">{driver.vehicleDetails.vehicleColor || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card md:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Registration Timeline</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="text-sm font-medium">
                  {new Date(driver.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">
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
