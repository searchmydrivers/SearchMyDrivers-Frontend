import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { transactionService } from '../services/transactionService';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [summary, setSummary] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalAdminCommission: 0,
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters.type, filters.startDate, filters.endDate, filters.search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;

      const response = await transactionService.getTransactionHistory(params);
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
          limit: response.data.pagination?.limit || ITEMS_PER_PAGE,
        });
        setSummary({
          totalCredits: response.data.summary?.totalCredits || 0,
          totalDebits: response.data.summary?.totalDebits || 0,
          totalAdminCommission: response.data.summary?.totalAdminCommission || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getTypeBadge = (type) => {
    if (type === 'credit') return { bg: 'bg-green-100', text: 'text-green-800', label: 'CREDIT' };
    if (type === 'debit') return { bg: 'bg-red-100', text: 'text-red-800', label: 'DEBIT' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', label: type ? type.toUpperCase() : 'N/A' };
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Financial Transactions</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-4 sm:p-6 transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-800 font-mono tracking-tight">{formatAmount(summary.totalCredits)}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">From completed trips</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full bg-opacity-50">
                <span className="material-icons-outlined text-green-700 text-3xl sm:text-4xl">trending_up</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-4 sm:p-6 transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1 uppercase tracking-wide">Total Debits</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-800 font-mono tracking-tight">{formatAmount(summary.totalDebits)}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full bg-opacity-50">
                <span className="material-icons-outlined text-red-700 text-3xl sm:text-4xl">trending_down</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#0B2C4D]/10 to-[#0B2C4D]/20 rounded-xl shadow-sm border border-[#0B2C4D]/20 p-4 sm:p-6 transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0B2C4D] mb-1 uppercase tracking-wide">Admin Commission</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#0B2C4D] font-mono tracking-tight">
                  {formatAmount(summary.totalAdminCommission)}
                </p>
              </div>
              <div className="p-3 bg-[#0B2C4D] rounded-full bg-opacity-10">
                <span className="material-icons-outlined text-[#0B2C4D] text-3xl sm:text-4xl">account_balance_wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by User/Driver name, phone, or City..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] w-full text-sm sm:text-base transition-all shadow-sm"
              />
              <span className="material-icons-outlined absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All', activeClass: 'from-[#0B2C4D] to-[#254f7a]' },
                { id: 'credit', label: 'Credit', activeClass: 'from-green-500 to-green-600' },
                { id: 'debit', label: 'Debit', activeClass: 'from-red-500 to-red-600' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleFilterChange('type', type.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm shadow-sm ${filters.type === type.id
                    ? `bg-gradient-to-r ${type.activeClass} text-white shadow-md transform scale-[1.02]`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm font-semibold text-gray-600 flex items-center">
              <span className="material-icons-outlined mr-1 text-lg">date_range</span>
              Date Range:
            </span>
            <div className="flex-1 w-full sm:w-auto">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D]"
                placeholder="Start Date"
              />
            </div>
            <span className="text-gray-400 hidden sm:inline">to</span>
            <div className="flex-1 w-full sm:w-auto">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D]"
                placeholder="End Date"
              />
            </div>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))}
                className="text-red-500 text-sm font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-500 font-medium">Loading transactions...</div>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-outlined text-gray-300 text-4xl">receipt_long</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#0B2C4D]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Trip</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => {
                      const badge = getTypeBadge(transaction.type);
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in group" style={{ animationDelay: `${index * 30}ms` }}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm mr-3 ${transaction.userType === 'driver' ? 'bg-[#2BB673]' : 'bg-[#0B2C4D]'}`}>
                                {transaction.userName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 group-hover:text-[#0B2C4D] transition-colors">{transaction.userName}</div>
                                <div className="text-xs text-gray-500 font-mono">{transaction.userPhone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{transaction.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.trip ? (
                              <div className="text-sm">
                                <div className="text-gray-900 font-medium">
                                  {transaction.trip.pickupLocation?.city || 'N/A'} → {transaction.trip.dropLocation?.city || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transaction.trip.tripType}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No Trip Data</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold font-mono">
                            <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded ${transaction.status === 'completed'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : transaction.status === 'pending'
                                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {transactions.map((transaction, index) => {
                  const badge = getTypeBadge(transaction.type);
                  return (
                    <div key={transaction.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-sm font-bold font-mono ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm mr-2 ${transaction.userType === 'driver' ? 'bg-[#2BB673]' : 'bg-[#0B2C4D]'}`}>
                          {transaction.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{transaction.userName}</div>
                          <div className="text-xs text-gray-500">{transaction.userPhone}</div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded italic border border-gray-100">
                        {transaction.description}
                      </p>

                      {transaction.trip && (
                        <div className="text-xs flex items-center text-gray-500 space-x-1">
                          <span className="material-icons-outlined text-sm">route</span>
                          <span>{transaction.trip.pickupLocation?.city} → {transaction.trip.dropLocation?.city}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-gray-200 p-4 sm:p-6">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  <span className="material-icons-outlined text-base sm:text-lg">chevron_left</span>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${pagination.page === pageNum
                          ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${pagination.page === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="material-icons-outlined text-base sm:text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;

