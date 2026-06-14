import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', {
      url:      err.config?.url,
      method:   err.config?.method?.toUpperCase(),
      status:   err.response?.status,
      message:  err.message,
      payload:  err.config?.data,
      response: err.response?.data,
    });
    return Promise.reject(err);
  },
);

export default api;
