import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

