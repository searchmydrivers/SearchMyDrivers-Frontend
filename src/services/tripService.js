import api from '../config/api';

export const tripService = {
  // Get all trips (Admin endpoint)
  getAllTrips: async (params = {}) => {
    const response = await api.get('/admins/trips', { params });
    return response.data;
  },

  // Get trip by ID
  getTripById: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  },
};

