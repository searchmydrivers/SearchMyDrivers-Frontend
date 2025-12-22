import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const IncompleteRegistrations = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchDrivers();
  }, [pagination.page]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/drivers/admin/incomplete', {
        params: { page: pagination.page, limit: pagination.limit }
      });
      if (response.data.success) {
        setDrivers(response.data.data.drivers);
        setPagination({
          ...pagination,
          total: response.data.data.totalDrivers,
          totalPages: response.data.data.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching incomplete registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Incomplete Registrations</h1>
        <p className="text-gray-500">Drivers who started registration but haven't completed verification.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No incomplete registrations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Date Started</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Driver Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Work Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(driver.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-gray-500">{driver.phone}</div>
                        <div className="text-xs text-gray-400">{driver.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.workLocation || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${driver.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            driver.verificationStatus === 'documents-uploaded' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                          }`}>
                          {driver.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`tel:${driver.phone}`}
                          className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md border border-green-200 transition-colors"
                        >
                          <span className="material-icons-outlined text-sm mr-1">call</span>
                          Call
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IncompleteRegistrations;
