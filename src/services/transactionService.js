import api from '../config/api';

export const transactionService = {
  // Get transaction history (Admin endpoint) - Trips Only
  getTransactionHistory: async (params = {}) => {
    const response = await api.get('/admins/transactions', { params });
    return response.data;
  },

  // Get Driver Wallet Transactions (Admin endpoint) - All Wallet Activity
  getDriverWalletTransactions: async (params = {}) => {
    const response = await api.get('/wallet/admin/driver-transactions', { params });
    return response.data;
  },

  // Get Withdrawal Requests
  getWithdrawalRequests: async (params = {}) => {
    const response = await api.get('/wallet/admin/withdrawals', { params });
    return response.data;
  },

  // Process Withdrawal Request
  processWithdrawalRequest: async (id, data) => {
    const response = await api.put(`/wallet/admin/withdrawals/${id}`, data);
    return response.data;
  }
};
