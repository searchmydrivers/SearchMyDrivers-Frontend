import api from '../config/api';

// Get fare settings for a module
export const getFareSettings = async (module = 'onstation') => {
  const response = await api.get(`/fares/${module}`);
  return response.data;
};

// Get all fare settings (Admin)
export const getAllFareSettings = async () => {
  const response = await api.get('/fares/admin/all');
  return response.data;
};

// Update fare settings (Admin)
export const updateFareSettings = async (module, fareData) => {
  const response = await api.put(`/fares/admin/${module}`, fareData);
  return response.data;
};

