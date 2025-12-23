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

  // Get pending drivers (includes pending, documents-uploaded, otp-verified)
  getPendingDrivers: async () => {
    // Get all drivers and filter on frontend, or use a query that gets all non-verified/rejected
    const response = await api.get('/admins/drivers');
    const allDrivers = response.data?.drivers || [];
    const pendingDrivers = allDrivers.filter(d =>
      d.verificationStatus === 'pending' ||
      d.verificationStatus === 'documents-uploaded' ||
      d.verificationStatus === 'otp-verified'
    );
    return {
      ...response.data,
      data: {
        ...response.data.data,
        drivers: pendingDrivers,
      },
    };
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

  // Suspend/Unsuspend driver - Admin endpoint
  suspendDriver: async (driverId, isSuspended, reason) => {
    const response = await api.put(`/admins/drivers/${driverId}/suspend`, {
      isSuspended,
      reason,
    });
    return response.data;
  },
  // Update driver details (Admin endpoint)
  updateDriver: async (driverId, formData) => {
    // Note: Use FormData for file uploads
    const response = await api.put(`/admins/drivers/${driverId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

