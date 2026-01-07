import { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const HiringManagement = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'refund_pending', 'history'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Map tabs to status
      let status = '';
      if (activeTab === 'active') status = 'requested'; // or accepted? 'requested' means waiting for driver
      if (activeTab === 'refund_pending') status = 'refund_pending';
      // history assumes completed, refunded, rejected, cancelled

      // Actually, let's just fetch all and filter client side OR enhance API?
      // API supports status query.
      // Let's refine logical mapping:
      // Active: 'requested', 'accepted'
      // Refund Pending: 'refund_pending'
      // History: 'completed', 'refunded', 'rejected', 'cancelled'

      // For now, simple mapping, or if "history" fetch all?
      // Let's use specific status calls if possible, or just fetch all active for "Active" tab

      let queryParams = { page: pagination.page, limit: pagination.limit };

      if (activeTab === 'active') {
        // We might need multiple statuses here, but API single status.
        // Let's just fetch 'requested' for now as "Pending Driver Action"
        queryParams.status = 'requested';
      } else if (activeTab === 'refund_pending') {
        queryParams.status = 'refund_pending';
      } else if (activeTab === 'history') {
        // Fetch verified history? API might need update to support array of statuses
        // For this MVP, let's just show 'refunded' as history or 'completed' if we had it.
        // Or maybe just remove status param to get all and filter? pagination breaks then.
        // Let's stick to 'refunded' for history for now as that's the main admin action output
        queryParams.status = 'refunded';
      }

      const response = await api.get('/hiring/admin/all', { params: queryParams });
      if (response.data.success) {
        setRequests(response.data.data.requests);
        setPagination({
          ...pagination,
          total: response.data.data.pagination.total,
          totalPages: response.data.data.pagination.pages
        });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (requestId) => {
    if (!window.confirm("Confirm refund for this request?")) return;
    try {
      await api.put('/hiring/admin/refund', { requestId });
      alert("Refund processed successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Refund error:", error);
      alert("Failed to process refund.");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };



  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Monthly Hiring Requests</h1>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          {['active', 'refund_pending', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPagination({ ...pagination, page: 1 }); }}
              className={`pb-2 px-3 text-sm font-semibold transition-all duration-200 border-b-2 capitalize ${activeTab === tab
                ? 'border-[#0B2C4D] text-[#0B2C4D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-sm">
              <p className="text-gray-500">No requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">{req.user?.name}</div>
                        <div className="text-[10px] text-gray-500">{req.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">{req.driver?.name}</div>
                        <div className="text-[10px] text-gray-500">{req.driver?.phone}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                        {req.workLocation}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                        {req.durationMonths} Month(s)
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-900">
                        ₹{req.commissionAmount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wide ${req.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            req.status === 'refund_pending' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                        {req.status === 'refund_pending' && (
                          <button
                            onClick={() => handleRefund(req._id)}
                            className="text-red-600 hover:text-red-900 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          >
                            Process Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center text-xs">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
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

export default HiringManagement;
