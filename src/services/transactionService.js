import api from '../config/api';

export const transactionService = {
  // Get transaction history (Admin endpoint)
  getTransactionHistory: async (params = {}) => {
    const response = await api.get('/admins/transactions', { params });
    return response.data;
  },
};

