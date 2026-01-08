import api from '../config/api';

// User: Get available drivers
export const getAvailableDrivers = async (zoneId) => {
  const response = await api.post('/hiring/drivers', { zoneId });
  return response.data;
};

// User: Create hiring request
export const createHiringRequest = async (requestData) => {
  const response = await api.post('/hiring/request', requestData);
  return response.data;
};

// User: Initiate payment
export const initiatePayment = async (requestId) => {
  const response = await api.post('/hiring/payment/initiate', { requestId });
  return response.data;
};

// User: Verify payment
export const verifyPayment = async (requestId, razorpayPaymentId, razorpaySignature) => {
  const response = await api.post('/hiring/payment/verify', {
    requestId,
    razorpayPaymentId,
    razorpaySignature
  });
  return response.data;
};

// User: Get my hiring requests
export const getMyRequests = async () => {
  const response = await api.get('/hiring/my-requests');
  return response.data;
};

// Driver: Get hiring requests
export const getDriverRequests = async () => {
  const response = await api.get('/hiring/driver/requests');
  return response.data;
};

// Driver: Respond to request
export const respondToRequest = async (requestId, status, rejectionReason = '') => {
  const response = await api.put('/hiring/respond', {
    requestId,
    status,
    rejectionReason
  });
  return response.data;
};

// Admin: Get all requests
export const getAllRequestsAdmin = async (params) => {
  const response = await api.get('/hiring/admin/all', { params });
  return response.data;
};

// Admin: Get commission transactions
export const getCommissionTransactions = async (params) => {
  const response = await api.get('/hiring/admin/commission-transactions', { params });
  return response.data;
};

// Admin: Process refund
export const processRefund = async (requestId, transactionId) => {
  const response = await api.put('/hiring/admin/refund', {
    requestId,
    transactionId
  });
  return response.data;
};

export default {
  getAvailableDrivers,
  createHiringRequest,
  initiatePayment,
  verifyPayment,
  getMyRequests,
  getDriverRequests,
  respondToRequest,
  getAllRequestsAdmin,
  getCommissionTransactions,
  processRefund
};
