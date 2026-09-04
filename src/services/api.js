import axios from 'axios';

const api = axios.create({
  // Relative /api works behind a reverse proxy; VITE_API_BASE_URL supports a separately hosted API.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('daftra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format errors and handle unauthorized
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // If 401 Unauthorized, clear auth and redirect to login if not already there
      if (error.response.status === 401 && window.location.pathname !== '/login') {
        localStorage.removeItem('daftra_token');
        localStorage.removeItem('daftra_user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data || { message: 'حدث خطأ في الخادم' });
    } else if (error.request) {
      return Promise.reject({ message: 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت' });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;
