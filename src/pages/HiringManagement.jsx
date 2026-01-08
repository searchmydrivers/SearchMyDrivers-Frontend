import { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const HiringManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [requests, setRequests] = useState([]);
  const [commissionData, setCommissionData] = useState({
    transactions: [],
    totalCommission: 0,
    totalTransactions: 0
  });
  const [analytics, setAnalytics] = useState({
    statusBreakdown: [],
    commission: { total: 0, contracts: 0, count: 0 },
    activeContracts: 0
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    if (activeTab === 'commissions') {
      fetchCommissions();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else {
      fetchRequests();
    }
  }, [activeTab, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let queryParams = { page: pagination.page, limit: pagination.limit };

      if (activeTab === 'active') {
        queryParams.status = 'accepted';
      } else if (activeTab === 'pending') {
        queryParams.status = 'requested';
      } else if (activeTab === 'refund_pending') {
        queryParams.status = 'refund_pending';
      } else if (activeTab === 'history') {
        queryParams.status = 'completed';
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

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const queryParams = { page: pagination.page, limit: pagination.limit };
      const response = await api.get('/hiring/admin/commission-transactions', { params: queryParams });

      if (response.data.success) {
        setCommissionData({
          transactions: response.data.data.transactions,
          totalCommission: response.data.data.analytics.totalCommission,
          totalTransactions: response.data.data.analytics.totalTransactions
        });
        setPagination({
          ...pagination,
          total: response.data.data.pagination.total,
          totalPages: response.data.data.pagination.pages
        });
      }
    } catch (error) {
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hiring/admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
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

  const handleCompleteContract = async (requestId) => {
    if (!window.confirm("Mark this contract as completed? This will release the driver.")) return;
    try {
      await api.put(`/hiring/admin/complete/${requestId}`);
      alert("Contract completed successfully! Driver is now available.");
      fetchRequests();
    } catch (error) {
      console.error("Complete error:", error);
      alert(error.response?.data?.message || "Failed to complete contract.");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">Total Commission</p>
          <p className="text-3xl font-bold">₹{analytics.commission.total?.toLocaleString('en-IN')}</p>
          <p className="text-blue-100 text-xs mt-1">{analytics.commission.count} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium mb-1">Total Contracts</p>
          <p className="text-3xl font-bold">₹{analytics.commission.contracts?.toLocaleString('en-IN')}</p>
          <p className="text-green-100 text-xs mt-1">Contract value</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-orange-100 text-sm font-medium mb-1">Active Contracts</p>
          <p className="text-3xl font-bold">{analytics.activeContracts}</p>
          <p className="text-orange-100 text-xs mt-1">Currently running</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm font-medium mb-1">Commission Rate</p>
          <p className="text-3xl font-bold">10%</p>
          <p className="text-purple-100 text-xs mt-1">Platform fee</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.statusBreakdown.map((status) => (
            <div key={status._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase mb-1">{status._id.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-gray-900">{status.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCommissionsTab = () => (
    <div className="space-y-4">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium mb-1">Total Commission Earned</p>
          <p className="text-3xl font-bold">₹{commissionData.totalCommission?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">Total Transactions</p>
          <p className="text-3xl font-bold">{commissionData.totalTransactions}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : commissionData.transactions.length === 0 ? (
          <div className="text-center py-12 text-sm">
            <p className="text-gray-500">No commission transactions found.</p>
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Contract Details</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Payment ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissionData.transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {formatDate(txn.requestDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-bold text-gray-900">{txn.user?.name}</div>
                      <div className="text-[10px] text-gray-500">{txn.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-bold text-gray-900">{txn.driver?.name}</div>
                      <div className="text-[10px] text-gray-500">{txn.driver?.phone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                      {txn.workLocation}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <div className="font-bold text-gray-900">{txn.durationMonths} Month(s)</div>
                      <div className="text-[10px] text-gray-500">₹{txn.driverMonthlyPrice}/mo</div>
                      <div className="text-[10px] text-gray-500">Total: ₹{txn.totalDriverPayment}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ₹{txn.commissionAmount?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-gray-500">(10%)</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[10px] font-mono text-gray-600 max-w-[120px] truncate">
                        {txn.paymentId}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wide bg-green-100 text-green-800">
                        {txn.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Monthly Hiring Requests</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {['pending', 'active', 'refund_pending', 'history', 'analytics', 'commissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPagination({ ...pagination, page: 1 }); }}
              className={`pb-2 px-3 text-sm font-semibold transition-all duration-200 border-b-2 capitalize ${activeTab === tab
                ? 'border-[#0B2C4D] text-[#0B2C4D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'commissions' ? 'Commission Transactions' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'analytics' ? (
          renderAnalyticsTab()
        ) : activeTab === 'commissions' ? (
          renderCommissionsTab()
        ) : (
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
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Pricing</th>
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
                          <div className="font-bold">{req.durationMonths} Month(s)</div>
                          <div className="text-[10px] text-gray-500">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          <div className="font-bold text-gray-900">₹{req.driverMonthlyPrice}/mo</div>
                          <div className="text-[10px] text-gray-500">
                            Total: ₹{req.totalDriverPayment}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-bold text-green-600">
                            ₹{req.commissionAmount}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            (10% of total)
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wide ${req.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                req.status === 'refund_pending' ? 'bg-red-100 text-red-800' :
                                  req.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium space-x-2">
                          {req.status === 'refund_pending' && (
                            <button
                              onClick={() => handleRefund(req._id)}
                              className="text-red-600 hover:text-red-900 font-bold border border-red-200 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                            >
                              Process Refund
                            </button>
                          )}
                          {req.status === 'accepted' && (
                            <button
                              onClick={() => handleCompleteContract(req._id)}
                              className="text-blue-600 hover:text-blue-900 font-bold border border-blue-200 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              Complete Contract
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
        )}
      </div>
    </Layout>
  );
};

export default HiringManagement;
