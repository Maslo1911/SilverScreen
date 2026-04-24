// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Интерсепторы для токенов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const API = {
  auth: {
    register: (email: string, password: string) =>
      api.post('/api/v1/auth/register', { email, password }),
    login: async (email: string, password: string) => {
      const res = await api.post('/api/v1/auth/login', { email, password });
      if (res.data.success && res.data.data.accessToken) {
        localStorage.setItem('accessToken', res.data.data.accessToken);
      }
      return res.data;
    },
    logout: async () => {
      await api.post('/api/v1/auth/logout');
      localStorage.removeItem('accessToken');
    },
    me: () => api.get('/api/v1/users/me'),
  },
  users: {
    getMyReviews: () => api.get('/api/v1/reviews/my'),
  },
  films: {
    getAll: () => api.get('/api/v1/films'),
    getById: (id: number) => api.get(`/api/v1/films/${id}`),
  },
  reviews: {
    getByFilm: (filmId: number) => api.get(`/api/v1/films/${filmId}/reviews`),
    create: (filmId: number, rating: number, comment: string) =>
      api.post(`/api/v1/films/${filmId}/reviews`, { rating, comment }),
    getMyReviews: () => api.get('/api/v1/reviews/my'),
    getById: (id: number) => api.get(`/api/v1/reviews/${id}`),
    update: (id: number, data: { rating?: number; comment?: string }) =>
      api.put(`/api/v1/reviews/${id}`, data),
    delete: (id: number) => api.delete(`/api/v1/reviews/${id}`),
    like: (reviewId: number) => api.post(`/api/v1/reviews/${reviewId}/like`),
    unlike: (reviewId: number) => api.delete(`/api/v1/reviews/${reviewId}/like`),
    getAverageRating: (filmId: number) =>
      api.get(`/api/v1/films/${filmId}/average-rating`),
  },
};