
import { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/dateUtils';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/wallet/admin/withdrawals', { params });
      if (response.data.success) {
        setWithdrawals(response.data.data.requests);
        setPagination({
          ...pagination,
          total: response.data.data.totalRequests,
          totalPages: response.data.data.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    if (status === 'approved' && !transactionId) {
      alert('Please enter Transaction ID for approval');
      return;
    }

    setProcessing(true);
    try {
      const response = await api.put(`/wallet/admin/withdrawals/${selectedRequest._id}`, {
        status,
        adminNote: actionNote,
        transactionId: status === 'approved' ? transactionId : ''
      });

      if (response.data.success) {
        // Refresh list
        fetchWithdrawals();
        setSelectedRequest(null);
        setActionNote('');
        setTransactionId('');
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert(error.response?.data?.message || 'Error processing request');
    } finally {
      setProcessing(false);
    }
  };



  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
            <p className="text-gray-500">Manage driver wallet withdrawal requests.</p>
          </div>

          <div className="flex space-x-2">
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2BB673]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No withdrawal requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Driver</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Bank Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(req.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{req.driver?.name || 'Unknown'}</div>
                        <div className="text-gray-500">{req.driver?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{req.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        <div><span className="font-semibold">Bank:</span> {req.bankDetails?.bankName}</div>
                        <div><span className="font-semibold">A/C:</span> {req.bankDetails?.accountNumber}</div>
                        <div><span className="font-semibold">IFSC:</span> {req.bankDetails?.ifscCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="text-[#2BB673] hover:text-[#239960] font-semibold"
                          >
                            Process
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <div className="text-xs text-gray-500">
                            Txn: {req.transactionId || 'N/A'}
                          </div>
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
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Process Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-lg font-bold mb-4">Process Withdrawal Request</h3>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
              <p><span className="font-semibold">Driver:</span> {selectedRequest.driver?.name}</p>
              <p><span className="font-semibold">Amount:</span> ₹{selectedRequest.amount}</p>
              <hr className="my-2 border-gray-200" />
              <p><span className="font-semibold">Bank:</span> {selectedRequest.bankDetails?.bankName}</p>
              <p><span className="font-semibold">Account:</span> {selectedRequest.bankDetails?.accountNumber}</p>
              <p><span className="font-semibold">IFSC:</span> {selectedRequest.bankDetails?.ifscCode}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Required for Approval)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#2BB673] focus:border-[#2BB673]"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter Bank Transaction Ref"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#2BB673] focus:border-[#2BB673]"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows="3"
                placeholder="Reason or comments..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('rejected')}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction('approved')}
                disabled={processing}
                className="px-4 py-2 bg-[#2BB673] text-white rounded hover:bg-[#239960] disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WithdrawalManagement;
