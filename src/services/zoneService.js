import api from '../config/api';

export const zoneService = {
  // Get all service zones
  getAllZones: async () => {
    const response = await api.get('/zones');
    return response.data;
  },

  // Get zone by ID
  getZoneById: async (id) => {
    const response = await api.get(`/zones/${id}`);
    return response.data;
  },
};
