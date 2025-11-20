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

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  },
};

