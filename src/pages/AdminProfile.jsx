import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { authService } from '../services/authService';
import api from '../config/api';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/profile');
      if (response.data.success && response.data.data?.admin) {
        const adminData = response.data.data.admin;
        setAdmin(adminData);
        setFormData({
          name: adminData.name || '',
          email: adminData.email || '',
        });
        // Update localStorage
        localStorage.setItem('adminData', JSON.stringify(adminData));
      } else {
        // Fallback to localStorage
        const adminData = authService.getCurrentUser();
        if (adminData) {
          setAdmin(adminData);
          setFormData({
            name: adminData.name || '',
            email: adminData.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      // Fallback to localStorage
      const adminData = authService.getCurrentUser();
      if (adminData) {
        setAdmin(adminData);
        setFormData({
          name: adminData.name || '',
          email: adminData.email || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/admins/profile', formData);
      if (response.data.success) {
        alert('Profile updated successfully!');
        setEditing(false);
        // Update localStorage
        if (response.data.data?.admin) {
          localStorage.setItem('adminData', JSON.stringify(response.data.data.admin));
        }
        fetchAdminProfile();
      } else {
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Admin Profile</h1>
          <p className="text-sm sm:text-base text-gray-500">Manage your admin account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">{admin?.name || 'Admin'}</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1 break-words">{admin?.email || 'admin@example.com'}</p>
                <div className="mt-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: admin?.name || '',
                          email: admin?.email || '',
                        });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-800 font-medium">{admin?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-800 font-medium">{admin?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                    <p className="text-gray-800 font-medium">Administrator</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;

