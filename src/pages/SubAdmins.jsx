import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const SubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    workLocation: 'Mumbai',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins/subadmins');
      if (response.data.success) {
        setSubAdmins(response.data.data.subAdmins || []);
      }
    } catch (error) {
      console.error('Error fetching sub-admins:', error);
      alert(error.response?.data?.message || 'Failed to fetch sub-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admins/subadmins', formData);
      if (response.data.success) {
        setSuccess('Sub-admin created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', email: '', password: '', workLocation: 'Mumbai' });
        await fetchSubAdmins();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to create sub-admin');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create sub-admin');
    }
  };

  const handleEdit = (subAdmin) => {
    setSelectedSubAdmin(subAdmin);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      password: '',
      workLocation: subAdmin.workLocation || 'Mumbai',
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        workLocation: formData.workLocation,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await api.put(`/admins/subadmins/${selectedSubAdmin._id}`, updateData);
      if (response.data.success) {
        setSuccess('Sub-admin updated successfully!');
        setShowEditModal(false);
        setSelectedSubAdmin(null);
        setFormData({ name: '', email: '', password: '', workLocation: 'Mumbai' });
        await fetchSubAdmins();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update sub-admin');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update sub-admin');
    }
  };

  const handleDelete = async (subAdminId) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin?')) return;

    setActionLoading({ ...actionLoading, [subAdminId]: true });
    try {
      const response = await api.delete(`/admins/subadmins/${subAdminId}`);
      if (response.data.success) {
        await fetchSubAdmins();
      } else {
        alert(response.data.message || 'Failed to delete sub-admin');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete sub-admin');
    } finally {
      setActionLoading({ ...actionLoading, [subAdminId]: false });
    }
  };

  const handleToggleActive = async (subAdmin) => {
    setActionLoading({ ...actionLoading, [subAdmin._id]: true });
    try {
      const response = await api.put(`/admins/subadmins/${subAdmin._id}`, {
        isActive: !subAdmin.isActive,
      });
      if (response.data.success) {
        await fetchSubAdmins();
      } else {
        alert(response.data.message || 'Failed to update sub-admin status');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update sub-admin status');
    } finally {
      setActionLoading({ ...actionLoading, [subAdmin._id]: false });
    }
  };

  if (loading && subAdmins.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading sub-admins...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormData({ name: '', email: '', password: '', workLocation: 'Mumbai' });
              setError('');
              setSuccess('');
            }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <span className="material-icons-outlined text-lg sm:text-xl">add</span>
            <span>Create Sub-Admin</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">error_outline</span>
            {error}
          </div>
        )}

        {/* Sub-Admins List */}
        {subAdmins.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 text-center py-12 animate-fade-in">
            <span className="material-icons-outlined text-gray-300 text-6xl mb-4 block">admin_panel_settings</span>
            <p className="text-gray-500 text-lg font-medium">No sub-admins found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first sub-admin to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subAdmins.map((subAdmin, index) => (
                    <tr key={subAdmin._id} className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subAdmin.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{subAdmin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <span className="material-icons-outlined text-sm mr-1">location_on</span>
                          {subAdmin.workLocation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            subAdmin.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subAdmin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subAdmin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(subAdmin)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <span className="material-icons-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleActive(subAdmin)}
                            disabled={actionLoading[subAdmin._id]}
                            className={`${
                              subAdmin.isActive
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={subAdmin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-icons-outlined">
                              {subAdmin.isActive ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(subAdmin._id)}
                            disabled={actionLoading[subAdmin._id]}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <span className="material-icons-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <span className="material-icons-outlined text-xl mr-2 text-blue-600">person_add</span>
                Create Sub-Admin
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Indore">Indore</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                {error && <div className="text-red-600 text-sm flex items-center"><span className="material-icons-outlined text-sm mr-1">error_outline</span>{error}</div>}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
                    <span className="material-icons-outlined text-lg">add</span>
                    <span>Create</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSubAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <span className="material-icons-outlined text-xl mr-2 text-indigo-600">edit</span>
                Edit Sub-Admin
              </h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Indore">Indore</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                {error && <div className="text-red-600 text-sm flex items-center"><span className="material-icons-outlined text-sm mr-1">error_outline</span>{error}</div>}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
                    <span className="material-icons-outlined text-lg">save</span>
                    <span>Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSubAdmin(null);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubAdmins;

