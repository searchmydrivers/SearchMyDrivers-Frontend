import api from '../config/api';

export const contentService = {
  // Get all content (public)
  getAllContent: async () => {
    const response = await api.get('/content');
    return response.data;
  },

  // Get content by type (public)
  getContentByType: async (type) => {
    const response = await api.get(`/content/${type}`);
    return response.data;
  },

  // Get all content for admin (including inactive)
  getAllContentForAdmin: async (appType = 'user') => {
    const response = await api.get('/content/admin/all', { params: { appType } });
    return response.data;
  },

  // Create or update content
  createOrUpdateContent: async (contentData) => {
    const response = await api.post('/content', contentData);
    return response.data;
  },

  // Update content
  updateContent: async (type, contentData) => {
    const response = await api.put(`/content/${type}`, contentData);
    return response.data;
  },

  // Delete content (permanent delete)
  deleteContent: async (type, appType = 'user') => {
    const response = await api.delete(`/content/${type}`, { params: { appType } });
    return response.data;
  },
};

