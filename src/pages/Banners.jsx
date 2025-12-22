import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../config/api';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, user, driver
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'user',
    position: 'home-top',
    link: '',
    isActive: true,
    order: 0,
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBanners();
  }, [filterType]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const params = filterType !== 'all' ? { type: filterType } : {};
      const response = await api.get('/admins/banners', { params });
      if (response.data.success) {
        setBanners(response.data.data.banners || []);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      type: banner.type || 'user',
      position: banner.position || 'home-top',
      link: banner.link || '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      order: banner.order || 0,
      image: null,
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      type: 'user',
      position: 'home-top',
      link: '',
      isActive: true,
      order: 0,
      image: null,
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('position', formData.position);
      if (formData.link) formDataToSend.append('link', formData.link);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('order', formData.order);
      if (formData.image) formDataToSend.append('image', formData.image);

      let response;
      if (editingBanner) {
        response = await api.put(`/admins/banners/${editingBanner._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/admins/banners', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        setSuccess(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        setShowModal(false);
        await fetchBanners();
      } else {
        setError(response.data.message || 'Failed to save banner');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await api.delete(`/admins/banners/${id}`);
      if (response.data.success) {
        setSuccess('Banner deleted successfully!');
        await fetchBanners();
      } else {
        setError(response.data.message || 'Failed to delete banner');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  const filteredBanners = filterType === 'all'
    ? banners
    : banners.filter(b => b.type === filterType);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading banners...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <button
            onClick={handleCreate}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg sm:rounded-xl hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <span className="material-icons-outlined text-lg sm:text-xl">add</span>
            <span>Add New Banner</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">error_outline</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <span className="material-icons-outlined mr-2">check_circle</span>
            {success}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${filterType === 'all'
                ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            All Banners
          </button>
          <button
            onClick={() => setFilterType('user')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${filterType === 'user'
                ? 'bg-gradient-to-r from-[#2BB673] to-[#239960] text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            User Banners
          </button>
          <button
            onClick={() => setFilterType('driver')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${filterType === 'driver'
                ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Driver Banners
          </button>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-12 text-center animate-fade-in">
            <span className="material-icons-outlined text-6xl text-gray-300 mb-4 block">collections</span>
            <p className="text-gray-500 text-lg font-medium">No banners found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first banner to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBanners.map((banner, index) => (
              <div key={banner._id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-4xl">🖼️</span>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${banner.type === 'user'
                          ? 'bg-green-100 text-[#2BB673]'
                          : 'bg-gray-100 text-[#0B2C4D]'
                        }`}
                    >
                      {banner.type === 'user' ? 'User' : 'Driver'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{banner.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Position: {banner.position}</span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.isActive
                          ? 'bg-green-100 text-[#2BB673]'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 px-3 py-2 bg-[#0B2C4D] text-white rounded-lg hover:bg-[#091E3A] transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <span className="material-icons-outlined text-base">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <span className="material-icons-outlined text-base">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="user">User</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="home-top">Home Top</option>
                    <option value="home-middle">Home Middle</option>
                    <option value="home-bottom">Home Bottom</option>
                    <option value="profile-top">Profile Top</option>
                    <option value="profile-bottom">Profile Bottom</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="label">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="label">Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="input-field"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">Banner Image {editingBanner ? '(Leave empty to keep current)' : '*'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="input-field"
                    required={!editingBanner}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 btn-primary"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
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

export default Banners;
