import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';

const Drivers = () => {
  const location = useLocation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Determine filter from URL path
  const getFilterFromPath = () => {
    if (location.pathname.includes('/pending')) return 'pending';
    if (location.pathname.includes('/verified')) return 'verified';
    if (location.pathname.includes('/rejected')) return 'rejected';
    return 'all';
  };
  
  const [filter, setFilter] = useState(getFilterFromPath());

  useEffect(() => {
    const newFilter = getFilterFromPath();
    setFilter(newFilter);
    fetchDrivers(newFilter);
  }, [location.pathname]);

  const fetchDrivers = async (currentFilter = filter) => {
    setLoading(true);
    try {
      let response;
      if (currentFilter === 'pending') {
        response = await driverService.getPendingDrivers();
      } else if (currentFilter === 'verified') {
        response = await driverService.getVerifiedDrivers();
      } else if (currentFilter === 'rejected') {
        response = await driverService.getRejectedDrivers();
      } else {
        response = await driverService.getAllDrivers();
      }
      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'pending' },
      'documents-uploaded': { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'upload_file' },
      'otp-verified': { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'verified' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: 'check_circle' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'cancel' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'help' };
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      'documents-uploaded': 'Documents Uploaded',
      'otp-verified': 'OTP Verified',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading drivers...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Drivers Management</h1>
            <p className="text-gray-600 font-medium">Manage all registered drivers</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="material-icons-outlined text-3xl">local_taxi</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            to="/drivers"
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
            }`}
          >
            <span className="material-icons-outlined text-lg">people</span>
            <span>All Drivers</span>
          </Link>
          <Link
            to="/drivers/pending"
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
            }`}
          >
            <span className="material-icons-outlined text-lg">pending</span>
            <span>Pending</span>
          </Link>
          <Link
            to="/drivers/verified"
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              filter === 'verified'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
            }`}
          >
            <span className="material-icons-outlined text-lg">verified</span>
            <span>Verified</span>
          </Link>
          <Link
            to="/drivers/rejected"
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              filter === 'rejected'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
            }`}
          >
            <span className="material-icons-outlined text-lg">cancel</span>
            <span>Rejected</span>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium">No drivers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver, index) => {
                    const badge = getStatusBadge(driver.verificationStatus);
                    return (
                      <tr 
                        key={driver._id} 
                        className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-4">
                              {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{driver.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{driver.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <span className="material-icons-outlined text-gray-400 mr-2 text-lg">phone</span>
                            {driver.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {driver.verificationDocuments?.licenseFront && (
                              <span className="material-icons-outlined text-green-500 text-xl" title="License">check_circle</span>
                            )}
                            {driver.verificationDocuments?.aadharFront && (
                              <span className="material-icons-outlined text-green-500 text-xl" title="Aadhar">check_circle</span>
                            )}
                            {driver.verificationDocuments?.panFront && (
                              <span className="material-icons-outlined text-green-500 text-xl" title="PAN">check_circle</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                            <span className="material-icons-outlined text-sm mr-1">{badge.icon}</span>
                            {getStatusLabel(driver.verificationStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/drivers/${driver._id}`}
                            className="text-blue-600 hover:text-blue-900 font-semibold flex items-center space-x-1 group"
                          >
                            <span>View Details</span>
                            <span className="material-icons-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500 font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
          Showing {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Layout>
  );
};

export default Drivers;
