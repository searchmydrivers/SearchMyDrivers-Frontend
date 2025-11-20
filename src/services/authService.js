import api from '../config/api';

export const authService = {
  // Admin login
  login: async (email, password) => {
    const response = await api.post('/admins/login', { email, password });
    return response.data;
  },

  // Get current admin
  getCurrentAdmin: async () => {
    const response = await api.get('/admins/profile');
    return response.data;
  },

  // Get current user from token (synchronous - decodes token from localStorage)
  getCurrentUser: () => {
    try {
      // First try to get from localStorage (stored during login)
      const adminDataStr = localStorage.getItem('adminData');
      if (adminDataStr) {
        try {
          const adminData = JSON.parse(adminDataStr);
          if (adminData && adminData.id) {
            return adminData;
          }
        } catch (e) {
          // If parsing fails, continue to token decode
        }
      }

      // Fallback to decoding token
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return null;
      }

      // Decode JWT token (simple base64 decode)
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);
      
      // Return user object with decoded info
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || 'Admin', // Name from token or default
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/login';
  },
};
