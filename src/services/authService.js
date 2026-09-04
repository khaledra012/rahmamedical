import api from './api';

export const authService = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // returns { user, token, expiresIn }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data; // returns user object
  },

  /**
   * Change user password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
