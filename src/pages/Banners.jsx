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
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium text-xs">Loading banners...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
          >
            <span className="material-icons-outlined text-base">add</span>
            <span>Add New Banner</span>
          </button>
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs ${filterType === 'all'
              ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            All Banners
          </button>
          <button
            onClick={() => setFilterType('user')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs ${filterType === 'user'
              ? 'bg-gradient-to-r from-[#2BB673] to-[#239960] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            User Banners
          </button>
          <button
            onClick={() => setFilterType('driver')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs ${filterType === 'driver'
              ? 'bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Driver Banners
          </button>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center animate-fade-in">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">collections</span>
            <p className="text-gray-500 font-medium text-sm">No banners found</p>
            <p className="text-gray-400 text-xs mt-1">Create your first banner to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanners.map((banner, index) => (
              <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-3xl">🖼️</span>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${banner.type === 'user'
                        ? 'bg-white/90 text-[#2BB673]'
                        : 'bg-white/90 text-[#0B2C4D]'
                        }`}
                    >
                      {banner.type === 'user' ? 'User' : 'Driver'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 text-xs truncate" title={banner.title}>{banner.title}</h3>
                  <div className="flex items-center justify-between mb-3 text-[10px]">
                    <span className="text-gray-500">Position: {banner.position}</span>
                    <span
                      className={`px-1.5 py-0.5 font-bold rounded uppercase tracking-wide ${banner.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 px-2 py-1.5 bg-[#0B2C4D] text-white rounded hover:bg-[#091E3A] transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                    >
                      <span className="material-icons-outlined text-sm">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                      required
                    >
                      <option value="user">User</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Position</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                      required
                    >
                      <option value="home-top">Home Top</option>
                      <option value="home-middle">Home Middle</option>
                      <option value="home-bottom">Home Bottom</option>
                      <option value="profile-top">Profile Top</option>
                      <option value="profile-bottom">Profile Bottom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-xs"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Banner Image {editingBanner ? '(Optional)' : '*'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-[#0B2C4D] hover:file:bg-gray-200"
                    required={!editingBanner}
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold text-xs flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 font-semibold text-xs"
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
