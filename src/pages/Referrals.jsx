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
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Referral Program</h1>
            <p className="text-gray-500 text-xs mt-0.5">Track user and driver referrals</p>
          </div>

          {/* Tabs */}
          <div className="bg-gray-100/80 p-0.5 rounded-lg flex shadow-inner w-full md:w-auto">
            <button
              onClick={() => handleTabChange('user')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === 'user'
                ? 'bg-white text-[#0B2C4D] shadow-sm transform scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              User Referrals
            </button>
            <button
              onClick={() => handleTabChange('driver')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === 'driver'
                ? 'bg-white text-[#0B2C4D] shadow-sm transform scale-[1.02]'
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
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] transition-all bg-white shadow-sm text-xs"
          />
          <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
        </div>

        {loading && referrals.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 font-medium animate-pulse text-xs">Loading referrals...</div>
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
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                        {activeTab === 'user' ? 'New User (Referee)' : 'New Driver (Referee)'}
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                        Referred By ({activeTab === 'user' ? 'Referrer' : 'Driver'})
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                        Referral Code Used
                      </th>
                      {activeTab === 'driver' && (
                        <>
                          <th className="px-4 py-2.5 text-center text-[10px] font-bold text-white uppercase tracking-wider">
                            Verification Status
                          </th>
                          <th className="px-4 py-2.5 text-center text-[10px] font-bold text-white uppercase tracking-wider">
                            Reward Status
                          </th>
                        </>
                      )}
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold text-white uppercase tracking-wider">
                        Joined On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'driver' ? "6" : "4"} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="bg-gray-50 p-3 rounded-full">
                              <span className="material-icons-outlined text-3xl text-gray-300">people_outline</span>
                            </div>
                            <p className="text-sm font-medium text-gray-600">No referrals found</p>
                            <p className="text-xs text-gray-400">Try adjusting your search criteria</p>
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
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-7 w-7">
                                {item.profilePicture ? (
                                  <img
                                    className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    src={item.profilePicture}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                    {getDisplayName(item).charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B2C4D] transition-colors">
                                  {getDisplayName(item)}
                                </div>
                                <div className="text-[9px] text-gray-500 font-mono mt-0.5">{item.phone}</div>
                              </div>
                            </div>
                          </td>

                          {/* Referrer */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            {item.referrer ? (
                              <div className="flex items-center">
                                <div className="ml-0">
                                  <div className="text-xs font-semibold text-gray-900">
                                    {getDisplayName(item.referrer)}
                                  </div>
                                  <div className="text-[9px] text-gray-500 font-mono">{item.referrer.phone}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                Unknown Referrer
                              </span>
                            )}
                          </td>

                          {/* Code */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-wider">
                              {item.referredBy}
                            </span>
                          </td>

                          {/* Driver Specific Columns */}
                          {activeTab === 'driver' && (
                            <>
                              <td className="px-4 py-2.5 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide
                                        ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                    item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'}`}>
                                  {item.verificationStatus === 'verified' && <span className="material-icons-outlined text-[10px] mr-1">verified</span>}
                                  {item.verificationStatus}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-center">
                                {item.isReferralRewardPaid ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wide">
                                    <span className="material-icons-outlined text-[10px] mr-1">check_circle</span>
                                    Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                                    <span className="material-icons-outlined text-[10px] mr-1">hourglass_empty</span>
                                    Pending
                                  </span>
                                )}
                              </td>
                            </>
                          )}

                          {/* Date */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-right text-[10px] text-gray-500 font-medium">
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
            <div className="lg:hidden grid grid-cols-1 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {referrals.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {getDisplayName(item).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">{getDisplayName(item)}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Joined {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {activeTab === 'driver' && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide
                            ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {item.verificationStatus}
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-2 space-y-2 text-[10px]">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Referred By</span>
                      <div className="text-right">
                        <span className="block font-semibold text-gray-900">{item.referrer ? getDisplayName(item.referrer) : 'Unknown'}</span>
                        {item.referrer && <span className="block text-[9px] text-gray-400 font-mono">{item.referrer.phone}</span>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Referral Code</span>
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700 font-medium text-[10px]">{item.referredBy}</span>
                    </div>

                    {activeTab === 'driver' && (
                      <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Reward Status</span>
                        <span className={`font-bold flex items-center ${item.isReferralRewardPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {item.isReferralRewardPaid ? (
                            <>
                              <span className="material-icons-outlined text-[10px] mr-1">check_circle</span>
                              Paid (₹100)
                            </>
                          ) : (
                            <>
                              <span className="material-icons-outlined text-[10px] mr-1">schedule</span>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-t border-gray-200 p-2.5">
                <div className="text-[10px] text-gray-600 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-[10px] transition-colors ${pagination.page === 1 ? 'cursor-not-allowed bg-gray-50' : 'bg-white'}`}
                  >
                    Previous
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
                          className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-semibold transition-all ${pagination.page === pageNum
                            ? 'bg-[#0B2C4D] text-white shadow-sm'
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
                    className={`px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-[10px] transition-colors ${pagination.page === pagination.totalPages ? 'cursor-not-allowed bg-gray-50' : 'bg-white'}`}
                  >
                    Next
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
