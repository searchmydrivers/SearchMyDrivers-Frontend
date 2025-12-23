import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';
import { zoneService } from '../services/zoneService';

const EditDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [zones, setZones] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
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
  const [files, setFiles] = useState({});
  const [existingImages, setExistingImages] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch driver and zones in parallel
      const [driverRes, zonesRes] = await Promise.all([
        driverService.getDriverById(id),
        zoneService.getAllZones()
      ]);

      const driver = driverRes.data?.driver;
      // zonesRes is already the response data (array wrapped in data object or just array depending on API)
      // Based on user feedback: response is { success: true, data: [...] }
      const zonesData = zonesRes.data || [];

      setZones(zonesData);

      if (driver) {
        setFormData({
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

        // Store existing image URLs to show previews or "existing" state
        setExistingImages({
          profilePicture: driver.profilePicture,
          aadharFront: driver.verificationDocuments?.aadharFront,
          aadharBack: driver.verificationDocuments?.aadharBack,
          panFront: driver.verificationDocuments?.panFront,
          licenseFront: driver.verificationDocuments?.licenseFront,
          licenseBack: driver.verificationDocuments?.licenseBack,
          electricityBill: driver.verificationDocuments?.electricityBill,
          rentAgreement: driver.verificationDocuments?.rentAgreement,
          policeVerificationCertificate: driver.verificationDocuments?.policeVerificationCertificate,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load driver details or service zones.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });

      Object.keys(files).forEach(key => {
        if (files[key]) data.append(key, files[key]);
      });

      const response = await driverService.updateDriver(id, data);
      if (response.success) {
        setSuccess('Driver updated successfully!');
        setTimeout(() => {
          navigate(`/drivers/${id}`);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update driver');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Failed to update driver');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading editor...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => navigate(`/drivers/${id}`)}
            className="text-gray-500 hover:text-[#0B2C4D] transition-colors"
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-[#0B2C4D]">Edit Driver Details</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="material-icons-outlined mr-2">error_outline</span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <span className="material-icons-outlined mr-2">check_circle</span>
              {success}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#0B2C4D] mb-6 flex items-center pb-2 border-b border-gray-100">
              <span className="material-icons-outlined mr-2">person</span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Location (Service Zone)</label>
                <select
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                >
                  <option value="">Select a Zone</option>
                  {zones.map(zone => (
                    <option key={zone._id} value={zone.name}>
                      {zone.name} {zone.isActive ? '' : '(Inactive)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select from active service zones.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Status</label>
                <select
                  name="verificationStatus"
                  value={formData.verificationStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="documents-uploaded">Documents Uploaded</option>
                  <option value="otp-verified">OTP Verified</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  {existingImages.profilePicture && !files.profilePicture && (
                    <img src={existingImages.profilePicture} alt="Current" className="w-10 h-10 rounded-full object-cover border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Identification Numbers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#0B2C4D] mb-6 flex items-center pb-2 border-b border-gray-100">
              <span className="material-icons-outlined mr-2">badge</span>
              Identification Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#0B2C4D] mb-6 flex items-center pb-2 border-b border-gray-100">
              <span className="material-icons-outlined mr-2">home</span>
              Address Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#0B2C4D] mb-6 flex items-center pb-2 border-b border-gray-100">
              <span className="material-icons-outlined mr-2">folder_shared</span>
              Documents (Upload to Replace)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div key={doc.key} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <label className="block text-sm font-semibold text-gray-700">{doc.label}</label>
                    {existingImages[doc.key] && (
                      <a href={existingImages[doc.key]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                        View Current <span className="material-icons-outlined text-xs ml-1">open_in_new</span>
                      </a>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, doc.key)}
                    className="block w-full text-xs text-gray-500
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-full file:border-0
                      file:text-[10px] file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {files[doc.key] && (
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                      New file selected
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/drivers/${id}`)}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors shadow-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#0B2C4D] text-white rounded-lg hover:bg-[#1a3a5a] font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving Changes...
                </>
              ) : (
                'Save All Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditDriver;
