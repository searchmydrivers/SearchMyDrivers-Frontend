import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';
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



  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchSubAdmins();
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      if (response.data.success) {
        setZones(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

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
        setFormData({ name: '', email: '', password: '', workLocation: '' });
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
      workLocation: subAdmin.workLocation || '',
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
        setFormData({ name: '', email: '', password: '', workLocation: '' });
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
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading sub-admins...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormData({ name: '', email: '', password: '', workLocation: '' });
              setError('');
              setSuccess('');
            }}
            className="px-4 py-2 bg-[#0B2C4D] text-white rounded hover:bg-[#091E3A] transition-all duration-200 shadow-sm font-semibold flex items-center justify-center space-x-1.5 text-xs uppercase tracking-wide"
          >
            <span className="material-icons-outlined text-sm">add</span>
            <span>Create Sub-Admin</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center animate-fade-in text-xs">
            <span className="material-icons-outlined mr-2 text-sm">error_outline</span>
            {error}
          </div>
        )}

        {/* Sub-Admins List */}
        {subAdmins.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-8 animate-fade-in">
            <div className="flex flex-col items-center space-y-2">
              <span className="material-icons-outlined text-gray-300 text-3xl">admin_panel_settings</span>
              <p className="text-gray-500 font-medium text-sm">No sub-admins found</p>
              <p className="text-gray-400 text-[10px]">Create your first sub-admin to get started</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0B2C4D]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">Work Location</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider">Created</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subAdmins.map((subAdmin, index) => (
                    <tr key={subAdmin._id} className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">{subAdmin.name}</div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="text-xs text-gray-500">{subAdmin.email}</div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-[#0B2C4D] border border-blue-100 uppercase tracking-wide">
                          <span className="material-icons-outlined text-[10px] mr-1">location_on</span>
                          {subAdmin.workLocation}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${subAdmin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {subAdmin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(subAdmin.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(subAdmin)}
                            className="text-[#0B2C4D] hover:text-[#254f7a]"
                            title="Edit"
                          >
                            <span className="material-icons-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleActive(subAdmin)}
                            disabled={actionLoading[subAdmin._id]}
                            className={`${subAdmin.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-[#2BB673] hover:text-[#239960]'
                              }`}
                            title={subAdmin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-icons-outlined text-lg">
                              {subAdmin.isActive ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(subAdmin._id)}
                            disabled={actionLoading[subAdmin._id]}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <span className="material-icons-outlined text-base">delete</span>
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
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 animate-fade-in">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">person_add</span>
                Create Sub-Admin
              </h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Work Location</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone.name}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div className="text-red-600 text-[10px] flex items-center"><span className="material-icons-outlined text-sm mr-1">error_outline</span>{error}</div>}
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 font-semibold text-xs flex items-center justify-center space-x-1 uppercase tracking-wide">
                    <span className="material-icons-outlined text-sm">add</span>
                    <span>Create</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 font-semibold text-xs uppercase tracking-wide"
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
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 animate-fade-in">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-2">
                <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">edit</span>
                Edit Sub-Admin
              </h2>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Work Location</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] text-xs outline-none transition-all"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone.name}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div className="text-red-600 text-[10px] flex items-center"><span className="material-icons-outlined text-sm mr-1">error_outline</span>{error}</div>}
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 font-semibold text-xs flex items-center justify-center space-x-1 uppercase tracking-wide">
                    <span className="material-icons-outlined text-sm">save</span>
                    <span>Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSubAdmin(null);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 font-semibold text-xs uppercase tracking-wide"
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
