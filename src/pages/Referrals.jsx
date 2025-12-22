import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Referrals = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'driver'
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
  }, [pagination.page, searchTerm, activeTab]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
        type: activeTab,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admins/users/referrals', { params });
      const data = response.data?.data || {};
      setReferrals(data.referrals || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: data.limit || ITEMS_PER_PAGE,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchTerm(''); // Reset search on tab change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDisplayName = (user) => {
    if (user?.name) return user.name;
    return 'Guest User';
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Referral Program</h1>
            <p className="text-gray-500 text-sm mt-1">Track user and driver referrals</p>
          </div>

          {/* Tabs */}
          <div className="bg-gray-100/80 p-1.5 rounded-xl flex shadow-inner w-full md:w-auto">
            <button
              onClick={() => handleTabChange('user')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'user'
                ? 'bg-white text-[#0B2C4D] shadow-md transform scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              User Referrals
            </button>
            <button
              onClick={() => handleTabChange('driver')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'driver'
                ? 'bg-white text-[#0B2C4D] shadow-md transform scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              Driver Referrals
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'user' ? "Search users by name, referrer..." : "Search drivers by name, referrer..."}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-all bg-white shadow-sm text-sm sm:text-base"
          />
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
        </div>

        {loading && referrals.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 font-medium animate-pulse">Loading referrals...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#0B2C4D]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        {activeTab === 'user' ? 'New User (Referee)' : 'New Driver (Referee)'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Referred By ({activeTab === 'user' ? 'Referrer' : 'Driver'})
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Referral Code Used
                      </th>
                      {activeTab === 'driver' && (
                        <>
                          <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                            Verification Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                            Reward Status
                          </th>
                        </>
                      )}
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                        Joined On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'driver' ? "6" : "4"} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="bg-gray-50 p-4 rounded-full">
                              <span className="material-icons-outlined text-4xl text-gray-300">people_outline</span>
                            </div>
                            <p className="text-lg font-medium text-gray-600">No referrals found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      referrals.map((item, index) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Referee */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {item.profilePicture ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-md"
                                    src={item.profilePicture}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-sm font-bold shadow-md">
                                    {getDisplayName(item).charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-[#0B2C4D] transition-colors">
                                  {getDisplayName(item)}
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{item.phone}</div>
                              </div>
                            </div>
                          </td>

                          {/* Referrer */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.referrer ? (
                              <div className="flex items-center">
                                <div className="ml-0">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {getDisplayName(item.referrer)}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">{item.referrer.phone}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                Unknown Referrer
                              </span>
                            )}
                          </td>

                          {/* Code */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-medium bg-blue-50 text-blue-700 border border-blue-100 tracking-wide">
                              {item.referredBy}
                            </span>
                          </td>

                          {/* Driver Specific Columns */}
                          {activeTab === 'driver' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                        ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                    item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'}`}>
                                  {item.verificationStatus === 'verified' && <span className="material-icons-outlined text-sm mr-1">verified</span>}
                                  {item.verificationStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {item.isReferralRewardPaid ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                    <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                                    Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                    <span className="material-icons-outlined text-sm mr-1">hourglass_empty</span>
                                    Pending
                                  </span>
                                )}
                              </td>
                            </>
                          )}

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-medium">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden grid grid-cols-1 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {referrals.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-lg font-bold shadow-md">
                        {getDisplayName(item).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{getDisplayName(item)}</h4>
                        <p className="text-xs text-gray-500 font-medium">Joined {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {activeTab === 'driver' && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                            ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {item.verificationStatus}
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 font-medium">Referred By</span>
                      <div className="text-right">
                        <span className="block font-semibold text-gray-900">{item.referrer ? getDisplayName(item.referrer) : 'Unknown'}</span>
                        {item.referrer && <span className="block text-xs text-gray-400 font-mono">{item.referrer.phone}</span>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 font-medium">Referral Code</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">{item.referredBy}</span>
                    </div>

                    {activeTab === 'driver' && (
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Reward Status</span>
                        <span className={`font-bold flex items-center ${item.isReferralRewardPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {item.isReferralRewardPaid ? (
                            <>
                              <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                              Paid (₹100)
                            </>
                          ) : (
                            <>
                              <span className="material-icons-outlined text-sm mr-1">schedule</span>
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} referrals
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Referrals;
