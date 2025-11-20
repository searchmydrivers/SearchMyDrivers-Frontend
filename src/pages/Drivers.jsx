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
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading drivers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Drivers</h1>
          <div className="flex gap-2">
            <Link
              to="/drivers"
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </Link>
            <Link
              to="/drivers/pending"
              className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pending
            </Link>
            <Link
              to="/drivers/verified"
              className={`px-4 py-2 rounded-lg ${filter === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Verified
            </Link>
            <Link
              to="/drivers/rejected"
              className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Rejected
            </Link>
          </div>
        </div>

        {drivers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No drivers found</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
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
                  {drivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {driver.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={driver.profilePicture}
                                alt={driver.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                  {driver.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {driver.verificationDocuments?.aadharFront ? '✅' : '❌'} Aadhar
                          <br />
                          {driver.verificationDocuments?.panFront ? '✅' : '❌'} PAN
                          <br />
                          {driver.verificationDocuments?.licenseFront ? '✅' : '❌'} License
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            driver.verificationStatus
                          )}`}
                        >
                          {driver.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/drivers/${driver._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Drivers;

