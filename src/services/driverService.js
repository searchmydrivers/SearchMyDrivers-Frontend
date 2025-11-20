import api from '../config/api';

export const driverService = {
  // Get all drivers (Admin endpoint)
  getAllDrivers: async (params = {}) => {
    const response = await api.get('/admins/drivers', { params });
    return response.data;
  },

  // Get driver by ID (Admin endpoint)
  getDriverById: async (driverId) => {
    const response = await api.get(`/admins/drivers/${driverId}`);
    return response.data;
  },

  // Verify driver (approve) - Admin endpoint
  verifyDriver: async (driverId) => {
    const response = await api.put(`/admins/drivers/${driverId}/verify`);
    return response.data;
  },

  // Reject driver - Admin endpoint
  rejectDriver: async (driverId, reason) => {
    const response = await api.put(`/admins/drivers/${driverId}/reject`, { reason });
    return response.data;
  },

  // Get pending drivers
  getPendingDrivers: async () => {
    const response = await api.get('/admins/drivers', { params: { verificationStatus: 'pending' } });
    return response.data;
  },

  // Get verified drivers
  getVerifiedDrivers: async () => {
    const response = await api.get('/admins/drivers', { params: { verificationStatus: 'verified' } });
    return response.data;
  },

  // Get rejected drivers
  getRejectedDrivers: async () => {
    const response = await api.get('/admins/drivers', { params: { verificationStatus: 'rejected' } });
    return response.data;
  },
};

