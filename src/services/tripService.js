import api from '../config/api';

export const tripService = {
  // Get all trips (Admin can access all trips)
  getAllTrips: async (params = {}) => {
    // Note: This endpoint might need to be created in admin routes
    // For now, using the trips endpoint
    const response = await api.get('/trips', { params });
    return response.data;
  },

  // Get trip by ID
  getTripById: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  },
};

