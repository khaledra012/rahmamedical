import api from './api';

export const ordersService = {
  /**
   * جلب قائمة الطلبات مع الفلترة
   */
  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response;
  },

  /**
   * إحصائيات لوحة مؤشرات الطلبات
   */
  async getOrderStats() {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  /**
   * إعادة محاولة فوترة طلب متعثر
   */
  async retryOrder(id) {
    const response = await api.post(`/orders/${id}/retry`);
    return response.data;
  },

  /**
   * محاكاة طلب تجريبي للاختبار
   */
  async simulateOrder() {
    const response = await api.post('/orders/simulate');
    return response.data;
  },
};

export default ordersService;
