import api from './api';

export const productsService = {
  /**
   * Get paginated products list with filters
   */
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response;
  },

  /**
   * Get single product details
   */
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Enrich product marketing data
   */
  async enrichProduct(id, data) {
    const response = await api.patch(`/products/${id}/enrich`, data);
    return response.data;
  },

  /**
   * Publish product to Zid store
   */
  async publishProduct(id) {
    const response = await api.post(`/products/${id}/publish`);
    return response.data;
  },

  /**
   * Publish product to Trendyol
   */
  async publishToTrendyol(id) {
    const response = await api.post(`/products/${id}/publish-trendyol`);
    return response.data;
  },

  /**
   * Publish product to All Connected Stores (Zid + Trendyol)
   */
  async publishToAll(id) {
    const response = await api.post(`/products/${id}/publish-all`);
    return response.data;
  },

  /**
   * Retry publishing failed product
   */
  async retryPublish(id) {
    const response = await api.post(`/products/${id}/retry`);
    return response.data;
  },

  /**
   * Toggle pause/resume product in store
   */
  async togglePause(id) {
    const response = await api.patch(`/products/${id}/pause`);
    return response.data;
  },

  /**
   * Fetch Zid store categories
   */
  async getZidCategories() {
    const response = await api.get('/products/zid-categories');
    return response.data || [];
  },

  /**
   * Fetch Trendyol brands
   */
  async getTrendyolBrands() {
    const response = await api.get('/products/trendyol-brands');
    return response.data || [];
  },
};

export default productsService;
