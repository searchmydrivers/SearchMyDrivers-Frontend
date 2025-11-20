import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/admins/users', { params });
      const data = response.data?.data || {};
      setUsers(data.users || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: data.limit || 10,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBlock = async (userId, isBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) return;

    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      const response = await api.put(`/admins/users/${userId}/block`, {
        isBlocked: !isBlocked,
        reason: isBlocked ? null : 'Blocked by admin',
      });
      if (response.data.success) {
        await fetchUsers();
      } else {
        alert(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading users...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">Users Management</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Manage all registered users</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
            />
            <span className="material-icons-outlined absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter('inactive')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'inactive'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => handleStatusFilter('blocked')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'blocked'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => handleStatusFilter('phone-not-verified')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                statusFilter === 'phone-not-verified'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Phone Not Verified
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover shadow-lg mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-4">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <span className="material-icons-outlined text-gray-400 mr-2 text-lg">phone</span>
                          {user.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span className="material-icons-outlined text-sm mr-1">
                              {user.isActive ? 'check_circle' : 'cancel'}
                            </span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {user.isBlocked && (
                            <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <span className="material-icons-outlined text-sm mr-1">block</span>
                              Blocked
                            </span>
                          )}
                          {!user.isPhoneVerified && (
                            <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <span className="material-icons-outlined text-sm mr-1">phone_disabled</span>
                              Phone Not Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/users/${user._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3 font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <span className="material-icons-outlined text-lg">visibility</span>
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleBlock(user._id, user.isBlocked)}
                          disabled={actionLoading[user._id]}
                          className={`font-semibold flex items-center space-x-1 transition-colors ${
                            user.isBlocked
                              ? 'text-green-600 hover:text-green-900'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          {actionLoading[user._id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-icons-outlined text-lg">
                                {user.isBlocked ? 'check_circle' : 'block'}
                              </span>
                              <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {users.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center space-y-3">
                <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                <p className="text-gray-500 font-medium">No users found</p>
              </div>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-lg mr-3 sm:mr-4 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-3 sm:mr-4 flex-shrink-0 text-lg sm:text-xl">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user.name || 'N/A'}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email || 'N/A'}</div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                        <span className="material-icons-outlined text-gray-400 mr-1 text-base">phone</span>
                        {user.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <span className="material-icons-outlined text-xs sm:text-sm mr-1">
                      {user.isActive ? 'check_circle' : 'cancel'}
                    </span>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.isBlocked && (
                    <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <span className="material-icons-outlined text-xs sm:text-sm mr-1">block</span>
                      Blocked
                    </span>
                  )}
                  {!user.isPhoneVerified && (
                    <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <span className="material-icons-outlined text-xs sm:text-sm mr-1">phone_disabled</span>
                      Phone Not Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="text-blue-600 hover:text-blue-900 font-semibold flex items-center space-x-1 transition-colors text-xs sm:text-sm"
                    >
                      <span className="material-icons-outlined text-base sm:text-lg">visibility</span>
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleBlock(user._id, user.isBlocked)}
                      disabled={actionLoading[user._id]}
                      className={`font-semibold flex items-center space-x-1 transition-colors text-xs sm:text-sm ${
                        user.isBlocked
                          ? 'text-green-600 hover:text-green-900'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      {actionLoading[user._id] ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons-outlined text-base sm:text-lg">
                            {user.isBlocked ? 'check_circle' : 'block'}
                          </span>
                          <span className="hidden sm:inline">{user.isBlocked ? 'Unblock' : 'Block'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${
                  pagination.page === 1
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
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                        pagination.page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
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
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center space-x-1 ${
                  pagination.page === pagination.totalPages
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

        {/* Footer */}
        {pagination.totalPages <= 1 && (
          <div className="text-xs sm:text-sm text-gray-500 font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
            Showing {users.length} of {pagination.total} users
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
