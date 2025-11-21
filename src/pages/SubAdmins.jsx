import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const SubAdmins = () => {
  const navigate = useNavigate();
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
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Sub-Admins</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage sub-admins for different work locations</p>
            </div>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setFormData({ name: '', email: '', password: '', workLocation: 'Mumbai' });
                setError('');
                setSuccess('');
              }}
              className="btn-primary flex items-center justify-center"
            >
              <span className="material-icons-outlined mr-2">add</span>
              Create Sub-Admin
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sub-Admins List */}
        {subAdmins.length === 0 ? (
          <div className="card text-center py-12">
            <span className="material-icons-outlined text-gray-400 text-6xl mb-4">admin_panel_settings</span>
            <p className="text-gray-500 text-lg">No sub-admins found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first sub-admin to get started</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subAdmins.map((subAdmin) => (
                    <tr key={subAdmin._id} className="hover:bg-gray-50">
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Create Sub-Admin</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Work Location</label>
                  <select
                    className="input-field"
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
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">Create</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="btn-secondary flex-1"
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Edit Sub-Admin</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Work Location</label>
                  <select
                    className="input-field"
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
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">Update</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSubAdmin(null);
                      setError('');
                    }}
                    className="btn-secondary flex-1"
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

