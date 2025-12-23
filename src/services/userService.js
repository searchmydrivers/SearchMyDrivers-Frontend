import api from '../config/api';

export const userService = {
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/admins/users', {
      params: { page, limit, search }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admins/users/${id}`);
    return response.data;
  },
};
