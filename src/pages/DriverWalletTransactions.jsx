import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { transactionService } from '../services/transactionService';

const DriverWalletTransactions = () => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'withdrawals'

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Driver Wallet & Withdrawals</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage driver wallet history and withdrawal requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-300 ${activeTab === 'transactions'
              ? 'bg-white text-[#0B2C4D] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Wallet Transactions
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-300 ${activeTab === 'withdrawals'
              ? 'bg-white text-[#0B2C4D] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Withdrawal Requests
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          {activeTab === 'transactions' ? <WalletTransactionsTab /> : <WithdrawalRequestsTab />}
        </div>
      </div>
    </Layout>
  );
};

const WalletTransactionsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, search, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        type: typeFilter
      };
      const response = await transactionService.getDriverWalletTransactions(params);
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const formatAmount = (amount) => `₹${parseFloat(amount).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Driver Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-sm"
          />
          <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] text-sm"
        >
          <option value="all">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No transactions found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0B2C4D]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">{formatDate(txn.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-bold text-gray-900">{txn.driverName}</div>
                      <div className="text-[10px] text-gray-500">{txn.driverPhone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${txn.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatAmount(txn.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate" title={txn.description}>
                      {txn.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const WithdrawalRequestsTab = () => {
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

      const response = await transactionService.getWithdrawalRequests(params);
      if (response.success) {
        setWithdrawals(response.data.requests);
        setPagination({
          ...pagination,
          total: response.data.totalRequests,
          totalPages: response.data.totalPages
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
      const response = await transactionService.processWithdrawalRequest(selectedRequest._id, {
        status,
        adminNote: actionNote,
        transactionId: status === 'approved' ? transactionId : ''
      });

      if (response.success) {
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="p-4">
      <div className="flex justify-end mb-3">
        <select
          className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2C4D] text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No withdrawal requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#0B2C4D]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Details</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-medium">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs font-bold text-gray-900">{req.driver?.name || 'Unknown'}</div>
                    <div className="text-gray-500 text-[10px]">{req.driver?.phone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₹{req.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[10px] text-gray-600">
                    <div><span className="font-semibold">Bank:</span> {req.bankDetails?.bankName}</div>
                    <div><span className="font-semibold">A/C:</span> {req.bankDetails?.accountNumber}</div>
                    <div><span className="font-semibold">IFSC:</span> {req.bankDetails?.ifscCode}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wide ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-[#2BB673] hover:text-[#239960] font-semibold border border-[#2BB673] px-2 py-0.5 rounded hover:bg-[#2BB673] hover:text-white transition-all text-[10px] uppercase tracking-wide"
                      >
                        Process
                      </button>
                    )}
                    {req.status === 'approved' && (
                      <div className="text-[10px] text-gray-500">Txn: {req.transactionId || 'N/A'}</div>
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
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {/* Withdrawal Process Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 animate-scale-in">
            <h3 className="text-base font-bold mb-3 text-gray-900">Process Withdrawal Request</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs space-y-1">
              <p><span className="font-bold">Driver:</span> {selectedRequest.driver?.name}</p>
              <p><span className="font-bold">Amount:</span> ₹{selectedRequest.amount}</p>
              <hr className="my-2 border-gray-200" />
              <p><span className="font-bold">Bank:</span> {selectedRequest.bankDetails?.bankName}</p>
              <p><span className="font-bold">Account:</span> {selectedRequest.bankDetails?.accountNumber}</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Transaction ID (Required for Approval)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-1.5 focus:ring-[#2BB673] focus:border-[#2BB673] text-sm"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter Bank Transaction Ref"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">Admin Note (Optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded p-1.5 focus:ring-[#2BB673] focus:border-[#2BB673] text-sm"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows="2"
                placeholder="Reason or comments..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setSelectedRequest(null)} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleAction('rejected')} disabled={processing} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50">Reject</button>
              <button onClick={() => handleAction('approved')} disabled={processing} className="px-3 py-1.5 bg-[#2BB673] text-white rounded text-xs font-semibold hover:bg-[#239960] disabled:opacity-50">{processing ? 'Processing...' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverWalletTransactions;
