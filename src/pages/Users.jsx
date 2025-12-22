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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const getDisplayName = (user) => {
    if (user.name) return user.name;
    return 'Guest User';
  };

  const getDisplayEmail = (user) => {
    if (user.email) return user.email;
    return 'No email provided';
  };

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading users...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2C4D]/20 focus:border-[#0B2C4D] transition-all"
            />
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
              { id: 'blocked', label: 'Blocked' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleStatusFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === filter.id
                    ? 'bg-[#0B2C4D] text-white shadow-md shadow-[#0B2C4D]/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                    Registered On
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#0B2C4D] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="material-icons-outlined text-4xl text-gray-300 mb-2">person_off</span>
                        <p>No users found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50/50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                src={user.profilePicture}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {getDisplayName(user).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-[#0B2C4D] transition-colors">
                              {getDisplayName(user)}
                            </div>
                            <div className="text-xs text-gray-500">{user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="material-icons-outlined text-xs mr-2 text-gray-400">email</span>
                            {getDisplayEmail(user)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="material-icons-outlined text-xs mr-2 text-gray-400">phone</span>
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                ? 'bg-green-50 text-[#2BB673] border border-green-100'
                                : 'bg-red-50 text-red-600 border border-red-100'
                              }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {user.isBlocked && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-600 border border-red-100">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/users/${user._id}`)}
                            className="p-1.5 text-gray-400 hover:text-[#0B2C4D] hover:bg-gray-100 rounded-lg transition-all"
                            title="View Details"
                          >
                            <span className="material-icons-outlined text-lg">visibility</span>
                          </button>
                          <button
                            onClick={() => handleBlock(user._id, user.isBlocked)}
                            className={`p-1.5 rounded-lg transition-all ${user.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-500 hover:bg-red-50'
                              }`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            <span className="material-icons-outlined text-lg">
                              {user.isBlocked ? 'check_circle' : 'block'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={user.profilePicture}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {getDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{getDisplayName(user)}</h4>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                      ? 'bg-green-50 text-[#2BB673] border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="material-icons-outlined text-base mr-2 text-gray-400">email</span>
                  <span className="truncate">{getDisplayEmail(user)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="material-icons-outlined text-base mr-2 text-gray-400">calendar_today</span>
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <button
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="text-sm font-medium text-[#0B2C4D] hover:text-[#2BB673] transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleBlock(user._id, user.isBlocked)}
                  className={`text-sm font-medium ${user.isBlocked ? 'text-[#2BB673]' : 'text-red-500'
                    }`}
                >
                  {user.isBlocked ? 'Unblock' : 'Block Access'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5) {
                  if (pagination.page > 3) {
                    pageNum = pagination.page - 2 + i;
                  }
                  if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                }

                // Guard to allow basic 1-5 if logic gets complex, simplest is just limited set or smart scrolling
                // Simplified logic for this view:
                if (pagination.totalPages <= 5) pageNum = i + 1;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${pagination.page === pageNum
                        ? 'bg-[#0B2C4D] text-white shadow-md shadow-[#0B2C4D]/20'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

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
      </div>
    </Layout>
  );
};

export default Users;
