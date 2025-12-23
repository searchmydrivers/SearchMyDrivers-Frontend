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
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Incomplete Registrations</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Drivers who started registration but haven't completed verification.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons-outlined text-3xl text-gray-300 mb-2 block">person_off</span>
              <p className="text-gray-500 font-medium text-sm">No incomplete registrations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date Started</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Driver Info</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Work Location</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {formatDate(driver.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">{driver.name}</div>
                        <div className="text-[10px] text-gray-500">{driver.phone}</div>
                        <div className="text-[10px] text-gray-400">{driver.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                        {driver.workLocation || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wide ${driver.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          driver.verificationStatus === 'documents-uploaded' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {driver.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <a
                          href={`tel:${driver.phone}`}
                          className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors"
                        >
                          <span className="material-icons-outlined text-xs mr-1">call</span>
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
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600 font-medium">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
