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
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading user details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">person_off</span>
          <p className="text-gray-500 text-sm font-medium mb-3">User not found</p>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-sm font-semibold text-xs"
          >
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button
              onClick={() => navigate('/users')}
              className="text-[#0B2C4D] hover:text-[#2BB673] font-semibold flex items-center space-x-1.5 transition-colors group mb-1.5 text-xs sm:text-sm"
            >
              <span className="material-icons-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>Back to Users</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5">User Details</h1>
            <p className="text-xs text-gray-500 font-medium">View and manage user information</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleBlock}
              disabled={actionLoading}
              className={`px-3 py-2 rounded font-semibold transition-all duration-200 shadow-sm flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide ${user.isBlocked
                ? 'bg-gradient-to-r from-[#2BB673] to-[#239960] text-white hover:from-[#239960] hover:to-[#1a7548]'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                }`}
            >
              {actionLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-sm">
                    {user.isBlocked ? 'check_circle' : 'block'}
                  </span>
                  <span>{user.isBlocked ? 'Unblock User' : 'Block User'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm font-semibold flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide"
            >
              {actionLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-sm">delete</span>
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">error_outline</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">check_circle</span>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="text-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-3 shadow-md border-2 border-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-3 shadow-md border-2 border-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800 break-words">{user.name || 'N/A'}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 break-words">{user.email || 'N/A'}</p>
                <div className="mt-4 space-y-2">
                  <span
                    className={`px-2.5 py-0.5 inline-flex items-center text-[10px] uppercase tracking-wide font-bold rounded-full ${user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    <span className="material-icons-outlined text-xs mr-1">
                      {user.isActive ? 'check_circle' : 'cancel'}
                    </span>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.isBlocked && (
                    <div className="mt-1">
                      <span className="px-2.5 py-0.5 inline-flex items-center text-[10px] uppercase tracking-wide font-bold rounded-full bg-red-100 text-red-800">
                        <span className="material-icons-outlined text-xs mr-1">block</span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">person</span>
                User Information
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Name</label>
                    <p className="text-sm text-gray-900 font-medium">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Email</label>
                    <p className="text-sm text-gray-900 font-medium">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Phone</label>
                    <p className="text-sm text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Phone Verified</label>
                    <p className="text-sm font-medium">
                      {user.isPhoneVerified ? (
                        <span className="text-[#2BB673] flex items-center text-xs">
                          <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                          Verified
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center text-xs">
                          <span className="material-icons-outlined text-sm mr-1">cancel</span>
                          Not Verified
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Registered</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Last Updated</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {user.address && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center space-x-1 uppercase tracking-wide">
                      <span className="material-icons-outlined text-[#0B2C4D] text-base">location_on</span>
                      <span>Address</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Street</label>
                        <p className="text-sm text-gray-900">{user.address.street || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">City</label>
                        <p className="text-sm text-gray-900">{user.address.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">State</label>
                        <p className="text-sm text-gray-900">{user.address.state || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Pincode</label>
                        <p className="text-sm text-gray-900">{user.address.pincode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.isBlocked && (
                  <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center space-x-1 uppercase tracking-wide">
                      <span className="material-icons-outlined text-red-600 text-base">block</span>
                      <span>Block Information</span>
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Blocked At</label>
                        <p className="text-xs text-gray-900 font-medium">
                          {user.blockedAt ? new Date(user.blockedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Block Reason</label>
                        <p className="text-xs text-gray-900 font-medium">{user.blockedReason || 'N/A'}</p>
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
