import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.get(`/admins/users/${id}`);
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} this user?`)) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/admins/users/${id}/block`, {
        isBlocked: !user.isBlocked,
        reason: user.isBlocked ? null : 'Blocked by admin',
      });
      if (response.data.success) {
        setSuccess(response.data.message || `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully!`);
        await fetchUserDetails();
      } else {
        setError(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.delete(`/admins/users/${id}`);
      if (response.data.success) {
        setSuccess('User deleted successfully!');
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading user details...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">User not found</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <button
              onClick={() => navigate('/users')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-2 text-sm sm:text-base"
            >
              <span className="material-icons-outlined text-lg sm:text-xl">arrow_back</span>
              <span>Back to Users</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">User Details</h1>
            <p className="text-sm sm:text-base text-gray-500">View and manage user information</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handleBlock}
              disabled={actionLoading}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base ${
                user.isBlocked
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
              }`}
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined">
                    {user.isBlocked ? 'check_circle' : 'block'}
                  </span>
                  <span>{user.isBlocked ? 'Unblock User' : 'Block User'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined">delete</span>
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-red-500">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-slide-in">
            <span className="material-icons-outlined mr-2 text-green-500">check_circle</span>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="text-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-3 sm:mb-4 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{user.name || 'N/A'}</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1 break-words">{user.email || 'N/A'}</p>
                <div className="mt-4 space-y-2">
                  <span
                    className={`px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full ${
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
                    <div className="mt-2">
                      <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-red-100 text-red-800">
                        <span className="material-icons-outlined text-sm mr-1">block</span>
                        Blocked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center space-x-2">
                <span className="material-icons-outlined text-blue-600 text-xl sm:text-2xl">person</span>
                <span>User Information</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-800 font-medium">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-800 font-medium">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-800 font-medium">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Verified</label>
                    <p className="text-gray-800 font-medium">
                      {user.isPhoneVerified ? (
                        <span className="text-green-600 flex items-center">
                          <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                          Verified
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <span className="material-icons-outlined text-sm mr-1">cancel</span>
                          Not Verified
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Registered</label>
                    <p className="text-gray-800 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p className="text-gray-800 font-medium">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {user.address && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
                      <span className="material-icons-outlined text-blue-600 text-lg sm:text-xl">location_on</span>
                      <span>Address</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Street</label>
                        <p className="text-gray-800">{user.address.street || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                        <p className="text-gray-800">{user.address.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
                        <p className="text-gray-800">{user.address.state || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Pincode</label>
                        <p className="text-gray-800">{user.address.pincode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.isBlocked && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                      <span className="material-icons-outlined text-red-600">block</span>
                      <span>Block Information</span>
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Blocked At</label>
                        <p className="text-gray-800">
                          {user.blockedAt ? new Date(user.blockedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Block Reason</label>
                        <p className="text-gray-800">{user.blockedReason || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;

