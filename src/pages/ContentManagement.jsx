import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { contentService } from '../services/contentService';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'driver'
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const contentTypes = {
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
    'faq': 'Frequently Asked Questions (FAQ)',
  };

  useEffect(() => {
    fetchContents();
    // Reset editing state when tab changes to avoid confusion
    handleCancel();
  }, [activeTab]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await contentService.getAllContentForAdmin(activeTab);
      setContents(response.data?.contents || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      content: content.content,
    });
    setError('');
    setSuccess('');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingContent(null);
    setFormData({ type: '', title: '', content: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        appType: activeTab, // vital for saving to correct app
      };

      if (editingContent._id) {
        // payload includes appType, critical for backend to find the right doc to update
        await contentService.updateContent(editingContent.type, payload);
        setSuccess(`${activeTab === 'user' ? 'User' : 'Driver'} App content updated successfully!`);
      } else {
        await contentService.createOrUpdateContent(payload);
        setSuccess(`${activeTab === 'user' ? 'User' : 'Driver'} App content created successfully!`);
      }

      await fetchContents();
      setTimeout(() => {
        handleCancel();
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save content');
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this content? This action cannot be undone.')) return;

    try {
      await contentService.deleteContent(type, activeTab);
      setSuccess('Content deleted permanently!');
      await fetchContents();
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete content');
    }
  };

  // Filter available content types
  // Exclude types that are already present in the current list, UNLESS we are editing that specific one.
  const availableContentTypes = Object.entries(contentTypes).filter(([type, label]) => {
    const exists = contents.some(c => c.type === type);
    // If editing, include the current type. If adding, exclude existing.
    if (editingContent && editingContent.type === type) return true;
    return !exists;
  });

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">

        {/* Header and Tabs */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Content Management</h1>

          <div className="flex space-x-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('user')}
              className={`pb-2 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === 'user'
                ? 'border-[#0B2C4D] text-[#0B2C4D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              User App Content
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`pb-2 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === 'driver'
                ? 'border-[#0B2C4D] text-[#0B2C4D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Driver App Content
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {!editingContent && availableContentTypes.length > 0 && (
            <button
              onClick={() => setEditingContent({ type: '', title: '', content: '' })}
              className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded-lg hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
            >
              <span className="material-icons-outlined text-base">add</span>
              <span>Add Content for {activeTab === 'user' ? 'User' : 'Driver'} App</span>
            </button>
          )}
          {!editingContent && availableContentTypes.length === 0 && contents.length > 0 && (
            <div className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              All content types for {activeTab} app have been created.
            </div>
          )}
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

        {editingContent && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">edit</span>
              {editingContent._id ? 'Edit Content' : 'Create New Content'}
              <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">({activeTab} App)</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                  required
                  disabled={!!editingContent._id} // Disable if editing existing
                >
                  <option value="">Select Type</option>
                  {availableContentTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {!!editingContent._id && (
                  <p className="text-[10px] text-gray-400 mt-0.5">Content type cannot be changed once created.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm"
                  required
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B2C4D] outline-none text-sm font-mono"
                  rows="12"
                  required
                  placeholder="Enter content (supports markdown)"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#0B2C4D] to-[#254f7a] text-white rounded hover:from-[#091E3A] hover:to-[#1a3a5a] transition-all duration-200 shadow-md font-semibold flex items-center space-x-1.5 text-xs"
                >
                  <span className="material-icons-outlined text-sm">{editingContent._id ? 'save' : 'add'}</span>
                  <span>{editingContent._id ? 'Update Content' : 'Create Content'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="material-icons-outlined text-lg mr-2 text-[#0B2C4D]">description</span>
            All {activeTab === 'user' ? 'User' : 'Driver'} Content Pages
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-500 font-medium text-xs">Loading content...</div>
              </div>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons-outlined text-4xl text-gray-300 mb-2 block">description</span>
              <p className="text-gray-500 font-medium text-sm">No content found for {activeTab} app</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contents.map((content, index) => (
                <div
                  key={content._id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-800">
                          {contentTypes[content.type] || content.type}
                        </h3>
                        {/* Status Badge */}
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded uppercase tracking-wide font-bold bg-green-100 text-green-800`}
                        >
                          {content.appType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium text-xs mb-1">{content.title}</p>
                      <p className="text-[10px] text-gray-500 mb-1 line-clamp-2">
                        {content.content}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Last updated: {new Date(content.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(content)}
                        className="px-3 py-1.5 bg-[#0B2C4D] text-white rounded hover:bg-[#091E3A] transition-colors text-xs font-medium flex items-center space-x-1"
                      >
                        <span className="material-icons-outlined text-sm">edit</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(content.type)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium flex items-center space-x-1"
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
        </div>
      </div>
    </Layout>
  );
};

export default ContentManagement;
