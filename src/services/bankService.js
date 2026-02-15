import api from '../config/api';

export const bankService = {
  // Get current driver's bank details
  getBankDetails: async () => {
    try {
      const response = await api.get('/bank-details');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save (Create or Update) bank details
  saveBankDetails: async (bankData) => {
    try {
      const response = await api.post('/bank-details', bankData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete bank details
  deleteBankDetails: async () => {
    try {
      const response = await api.delete('/bank-details');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
