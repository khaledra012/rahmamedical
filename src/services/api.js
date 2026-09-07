import axios from 'axios';

const getBaseUrl = () => {
  let url = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
  // تحويل البروتوكول لحروف صغيرة لتفادي خطأ Unsupported protocol HTTPS
  if (/^[a-zA-Z]+:\/\//.test(url)) {
    url = url.replace(/^[a-zA-Z]+:\/\//, (match) => match.toLowerCase());
  }
  return url.replace(/\/+$/, '');
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
