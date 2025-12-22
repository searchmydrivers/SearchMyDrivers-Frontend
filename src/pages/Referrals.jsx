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

  useEffect(() => {
    fetchReferrals();
  }, [pagination.page, searchTerm, activeTab]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
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
        limit: data.limit || 10,
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-[#0B2C4D]">Referrals</h1>

          {/* Tabs */}
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => handleTabChange('user')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'user'
                  ? 'bg-white text-[#0B2C4D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              User Referrals
            </button>
            <button
              onClick={() => handleTabChange('driver')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'driver'
                  ? 'bg-white text-[#0B2C4D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Driver Referrals
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder={activeTab === 'user' ? "Search user, code..." : "Search driver, code..."}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-all"
            />
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          </div>
        </div>

        {loading && referrals.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 font-medium">Loading referrals...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                        {activeTab === 'user' ? 'New User (Referee)' : 'New Driver (Referee)'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                        Referred By ({activeTab === 'user' ? 'Referrer' : 'Driver'})
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                        Referral Code Used
                      </th>
                      {activeTab === 'driver' && (
                        <>
                          <th className="px-6 py-4 text-center text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                            Verification Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                            Reward Status
                          </th>
                        </>
                      )}
                      <th className="px-6 py-4 text-right text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                        Joined On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {referrals.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'driver' ? "6" : "4"} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">people_outline</span>
                            <p>No referrals found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      referrals.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50/50 transition-colors duration-150 group"
                        >
                          {/* Referee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {item.profilePicture ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    src={item.profilePicture}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                    {getDisplayName(item).charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {getDisplayName(item)}
                                </div>
                                <div className="text-xs text-gray-500">{item.phone}</div>
                              </div>
                            </div>
                          </td>

                          {/* Referrer */}
                          <td className="px-6 py-4">
                            {item.referrer ? (
                              <div className="flex items-center">
                                <div className="ml-0">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {getDisplayName(item.referrer)}
                                  </div>
                                  <div className="text-xs text-gray-500">{item.referrer.phone}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Unknown Referrer</span>
                            )}
                          </td>

                          {/* Code */}
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100">
                              {item.referredBy}
                            </span>
                          </td>

                          {/* Driver Specific Columns */}
                          {activeTab === 'driver' && (
                            <>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize 
                                        ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                    item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                      'bg-yellow-100 text-yellow-700'}`}>
                                  {item.verificationStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {item.isReferralRewardPaid ? (
                                  <span className="flex items-center justify-center gap-1 text-green-600 text-sm font-medium">
                                    <span className="material-icons-outlined text-sm">check_circle</span>
                                    Paid
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">Pending</span>
                                )}
                              </td>
                            </>
                          )}

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
              {referrals.map((item) => (
                <div key={item._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {getDisplayName(item).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{getDisplayName(item)}</h4>
                        <p className="text-xs text-gray-500">Joined: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {activeTab === 'driver' && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize 
                            ${item.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                          item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                        {item.verificationStatus}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referred By:</span>
                      <span className="font-medium text-gray-900">{item.referrer ? getDisplayName(item.referrer) : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Code:</span>
                      <span className="font-mono bg-gray-50 px-2 rounded">{item.referredBy}</span>
                    </div>
                    {activeTab === 'driver' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reward Status:</span>
                        <span className={`font-medium ${item.isReferralRewardPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {item.isReferralRewardPaid ? 'Paid (₹100)' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} referrals
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${pagination.page === 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="material-icons-outlined text-sm">chevron_left</span>
                  </button>

                  <button
                    disabled
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium bg-[#0B2C4D] text-white shadow-md shadow-[#0B2C4D]/20"
                  >
                    {pagination.page}
                  </button>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${pagination.page === pagination.totalPages
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="material-icons-outlined text-sm">chevron_right</span>
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
