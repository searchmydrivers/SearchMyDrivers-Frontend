import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    setLoading(true);
    try {
      const response = await driverService.getDriverById(id);
      setDriver(response.data?.driver);
    } catch (error) {
      console.error('Error fetching driver details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Are you sure you want to verify this driver?')) return;

    setActionLoading(true);
    try {
      await driverService.verifyDriver(id);
      alert('Driver verified successfully!');
      fetchDriverDetails();
      navigate('/drivers');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await driverService.rejectDriver(id, reason);
      alert('Driver rejected successfully!');
      fetchDriverDetails();
      navigate('/drivers');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject driver');
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
          className="mb-4 text-primary-600 hover:text-primary-800 flex items-center"
        >
          ← Back to Drivers
        </button>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              {driver.profilePicture ? (
                <img
                  className="h-20 w-20 rounded-full mr-4"
                  src={driver.profilePicture}
                  alt={driver.name}
                />
              ) : (
                              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-bold text-2xl">
                    {driver.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{driver.name}</h1>
                <p className="text-gray-600">{driver.email}</p>
                <p className="text-gray-600">{driver.phone}</p>
              </div>
            </div>
            <div>
              <span
                className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  driver.verificationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : driver.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {driver.verificationStatus}
              </span>
            </div>
          </div>

          {driver.verificationStatus === 'pending' && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="btn-success"
              >
                {actionLoading ? 'Processing...' : '✅ Verify Driver'}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="btn-danger"
              >
                {actionLoading ? 'Processing...' : '❌ Reject Driver'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
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
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Document Numbers</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Aadhar Number</label>
                <p className="font-medium">{driver.aadharNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">PAN Number</label>
                <p className="font-medium">{driver.panNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">License Number</label>
                <p className="font-medium">{driver.licenseNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="card md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Verification Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {driver.verificationDocuments?.aadharFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Aadhar Front</label>
                  <img
                    src={driver.verificationDocuments.aadharFront}
                    alt="Aadhar Front"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {driver.verificationDocuments?.aadharBack && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Aadhar Back</label>
                  <img
                    src={driver.verificationDocuments.aadharBack}
                    alt="Aadhar Back"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {driver.verificationDocuments?.panFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">PAN Front</label>
                  <img
                    src={driver.verificationDocuments.panFront}
                    alt="PAN Front"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {driver.verificationDocuments?.licenseFront && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">License Front</label>
                  <img
                    src={driver.verificationDocuments.licenseFront}
                    alt="License Front"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {driver.verificationDocuments?.licenseBack && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">License Back</label>
                  <img
                    src={driver.verificationDocuments.licenseBack}
                    alt="License Back"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {driver.vehicleDetails && (
            <div className="card md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </Layout>
  );
};

export default DriverDetails;

