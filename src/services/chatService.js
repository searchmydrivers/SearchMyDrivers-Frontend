import api from '../config/api';

export const chatService = {
  // Send a message
  sendMessage: async (data) => {
    try {
      const response = await api.post('/chat/send', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },

  // Get chat history
  getChatHistory: async (tripId) => {
    try {
      const response = await api.get(`/chat/${tripId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get chat history error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch chat history',
      };
    }
  },
};
