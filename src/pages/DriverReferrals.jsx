
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const DriverReferrals = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchReferrals();
  }, [pagination.page, searchTerm]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Endpoint specifically for driver referrals
      const response = await api.get('/admins/drivers/referrals', { params });

      const data = response.data?.data || {};
      setReferrals(data.referrals || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: data.limit || ITEMS_PER_PAGE,
      });
    } catch (error) {
      console.error('Error fetching driver referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // KPI Style Stats (Calculated from current view or separate API could be better but let's derive simply for now)
  const totalReferrals = pagination.total;
  const verifiedReferrals = referrals.filter(r => r.verificationStatus === 'verified').length;
  // Note: verifiedReferrals count here is only from the current page, ideally backend sends this summary.
  // We will display just the total count from pagination for now.

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Driver Referrals</h1>
            <p className="text-xs text-gray-500 font-medium">Track driver referrals and rewards</p>
          </div>

          {/* Stats Summary (Simple) */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Referrals</span>
              <span className="text-xl font-bold text-[#0B2C4D]">{totalReferrals}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search referrer or referee by name/phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] w-full text-sm transition-all shadow-sm"
          />
          <span className="material-icons-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">search</span>
        </div>

        {/* Loading State */}
        {loading && referrals.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 font-medium text-xs">Loading referrals...</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Referee (New Driver)</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Referrer (By)</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Reward</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Joined On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                        <div className="flex flex-col items-center space-y-2">
                          <span className="material-icons-outlined text-3xl text-gray-300">group_off</span>
                          <p>No referrals found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    referrals.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        {/* Referee Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {item.profilePicture ? (
                                <img
                                  src={item.profilePicture}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0B2C4D] font-bold text-xs">
                                  {item.name ? item.name[0].toUpperCase() : '?'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-gray-900">{item.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{item.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Referrer Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.referrer ? (
                            <div className="flex items-center">
                              <div className="ml-0">
                                <div className="text-sm font-medium text-gray-900">{item.referrer.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{item.referrer.phone}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Code: {item.referredBy}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">
                              Referrer deleted or not found <br />
                              <span className="text-[10px] not-italic">Code: {item.referredBy}</span>
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                              item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.verificationStatus ? item.verificationStatus.replace('-', ' ') : 'Pending'}
                          </span>
                        </td>

                        {/* Reward Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.isReferralRewardPaid ? (
                            <span className="flex items-center text-green-600 text-xs font-bold">
                              <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                              Paid (₹100)
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400 text-xs">
                              <span className="material-icons-outlined text-sm mr-1">schedule</span>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Date Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="material-icons-outlined text-lg">chevron_left</span>
                      </button>
                      {/* Simple pagination: showing current page */}
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="material-icons-outlined text-lg">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DriverReferrals;
