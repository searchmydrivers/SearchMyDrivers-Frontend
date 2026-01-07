import { useEffect, useState } from 'react';
import { formatDateTime } from '../utils/dateUtils';
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
                onClick={() => navigate(`/drivers/${id}/edit`)}
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
                </div>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                <label className="text-gray-500 font-medium">PAN Number</label>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{driver.panNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-500 font-medium">License Number</label>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{driver.licenseNumber || 'Not provided'}</p>
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
                  {formatDateTime(driver.createdAt)}
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
