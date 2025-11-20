import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { contentService } from '../services/contentService';

const ContentManagement = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await contentService.getAllContentForAdmin();
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
      if (editingContent) {
        await contentService.updateContent(editingContent.type, formData);
        setSuccess('Content updated successfully!');
      } else {
        await contentService.createOrUpdateContent(formData);
        setSuccess('Content created successfully!');
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
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentService.deleteContent(type);
      setSuccess('Content deleted successfully!');
      await fetchContents();
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete content');
    }
  };

  const contentTypes = {
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
    'faq': 'Frequently Asked Questions (FAQ)',
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading content...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
          {!editingContent && (
            <button
              onClick={() => setEditingContent({ type: '', title: '', content: '' })}
              className="btn-primary"
            >
              + Add New Content
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {editingContent && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingContent._id ? 'Edit Content' : 'Create New Content'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                  disabled={!!editingContent._id}
                >
                  <option value="">Select Type</option>
                  {Object.entries(contentTypes).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="label">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field"
                  rows="15"
                  required
                  placeholder="Enter content (supports markdown)"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {editingContent._id ? 'Update Content' : 'Create Content'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">All Content Pages</h2>
          {contents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No content found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contents.map((content) => (
                <div
                  key={content._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {contentTypes[content.type] || content.type}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            content.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {content.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium mb-1">{content.title}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {content.content.substring(0, 150)}...
                      </p>
                      <p className="text-xs text-gray-400">
                        Last updated: {new Date(content.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(content)}
                        className="btn-secondary text-sm"
                      >
                        Edit
                      </button>
                      {content.isActive && (
                        <button
                          onClick={() => handleDelete(content.type)}
                          className="btn-danger text-sm"
                        >
                          Delete
                        </button>
                      )}
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

