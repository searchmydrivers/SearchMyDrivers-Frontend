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
          <div className="w-8 h-8 border-4 border-[#0B2C4D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Profile Card */}
          <div className="lg:col-span-1 flex">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full flex flex-col animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0B2C4D] to-[#254f7a] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <h2 className="text-lg font-bold text-gray-800">{admin?.name || 'Admin'}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">{admin?.email || 'admin@example.com'}</p>
                <div className="mt-4">
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wide rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 flex">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full flex flex-col animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">person</span>
                  Profile Information
                </h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold flex items-center space-x-1.5 text-xs"
                  >
                    <span className="material-icons-outlined text-sm">edit</span>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 font-medium flex items-center space-x-1.5 text-xs shadow-sm"
                    >
                      <span className="material-icons-outlined text-sm">save</span>
                      <span>Save Changes</span>
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
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="py-2 border-b border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Name</label>
                    <p className="text-gray-800 font-medium text-sm">{admin?.name || 'N/A'}</p>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Email</label>
                    <p className="text-gray-800 font-medium text-sm">{admin?.email || 'N/A'}</p>
                  </div>
                  <div className="py-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Role</label>
                    <p className="text-gray-800 font-medium text-sm">Administrator</p>
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
