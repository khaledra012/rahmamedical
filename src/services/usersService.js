import api from './api';

export const usersService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data || [];
  },
  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data;
  },
  async updateUser(id, data) {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  async resetPassword(id, password) {
    const response = await api.post(`/users/${id}/reset-password`, { password });
    return response.data;
  },
};
