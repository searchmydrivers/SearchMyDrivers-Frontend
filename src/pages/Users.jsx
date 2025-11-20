import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/users');
      setUsers(response.data?.data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Users Management</h1>
            <p className="text-gray-600 font-medium">Manage all registered users</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm"
              />
              <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <span className="material-icons-outlined text-6xl text-gray-300">inbox</span>
                        <p className="text-gray-500 font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
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

        {/* Footer */}
        <div className="text-sm text-gray-500 font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </Layout>
  );
};

export default Users;
