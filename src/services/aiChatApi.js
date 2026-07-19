import api from './api';

export const aiChatApi = {
  /**
   * Gui tin nhan den AI Chat
   * @param {string} message - Noi dung tin nhan cua user
   * @param {string} sessionId - ID cua session hien tai (neu co)
   * @returns {Promise<Object>} - Ket qua tu AI (answer, suggestions, sessionId)
   */
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post('/ai/chat', {
        message,
        sessionId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }
  },
};

export default aiChatApi;
