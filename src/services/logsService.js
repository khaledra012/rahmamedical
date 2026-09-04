import api from './api';

export const logsService = {
  /**
   * جلب قائمة سجلات العمليات مع الفلترة والترقيم
   */
  async getLogs(params = {}) {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  /**
   * إحصائيات سجل العمليات للبطاقات العلوية
   */
  async getLogStats() {
    const response = await api.get('/logs/stats');
    return response.data;
  },

  /**
   * جلب تفاصيل سجل عملية معين
   */
  async getLogById(id) {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  },

  /**
   * إعادة محاولة تنفيذ عملية فاشلة
   */
  async retryLog(id) {
    const response = await api.post(`/logs/${id}/retry`);
    return response.data;
  },
};

export default logsService;
