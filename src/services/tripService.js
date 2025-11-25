import api from '../config/api';

export const tripService = {
  // Get all trips (Admin endpoint)
  getAllTrips: async (params = {}) => {
    const response = await api.get('/admins/trips', { params });
    return response.data;
  },

  // Get trip by ID (Admin endpoint)
  getTripById: async (tripId) => {
    const response = await api.get(`/admins/trips/${tripId}`);
    return response.data;
  },

  // Cancel trip (Admin endpoint)
  cancelTripByAdmin: async (tripId) => {
    const response = await api.post(`/admins/trips/${tripId}/cancel`);
    return response.data;
  },

  // Request driver location (Admin endpoint)
  requestDriverLocation: async (tripId) => {
    const response = await api.post(`/admins/trips/${tripId}/request-driver-location`);
    return response.data;
  },
};

