// src/api/index.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ====================== INTERCEPTORS ======================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, {
            withCredentials: true,
          });

          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
);

// ====================== API МЕТОДЫ ======================

const API = {
  auth: {
    register: (name, email, password) =>
        api.post('/api/v1/auth/register', { name, email, password }),

    login: async (email, password) => {
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
    getAll: () => api.get('/api/v1/users'),                    // только админ
    getMyReviews: () => api.get('/api/v1/reviews/my'),
    getUserReviews: (userId) => api.get(`/api/v1/users/${userId}/reviews`),
  },

  roles: {
    getAll: () => api.get('/api/v1/roles'),
    create: (name, description = '') =>
      api.post('/api/v1/roles', { name, description }),
    getById: (id) => api.get(`/api/v1/roles/${id}`),
    update: (id, data) => api.put(`/api/v1/roles/${id}`, data),
    delete: (id) => api.delete(`/api/v1/roles/${id}`),
  },

  permissions: {
    getAll: () => api.get('/api/v1/permissions'),
  },

  categories: {
    getAll: () => api.get('/api/v1/categories'),
    create: (name) => api.post('/api/v1/categories', { name }),
    getById: (id) => api.get(`/api/v1/categories/${id}`),
    update: (id, data) => api.put(`/api/v1/categories/${id}`, data),
    delete: (id) => api.delete(`/api/v1/categories/${id}`),
  },

  films: {
    getAll: () => api.get('/api/v1/films'),
    getById: (id) => api.get(`/api/v1/films/${id}`),
    getTop: (limit = 10) => api.get(`/api/v1/films/top?limit=${limit}`),
    create: (filmData) => api.post('/api/v1/films', filmData),        // только админ
    update: (id, filmData) => api.put(`/api/v1/films/${id}`, filmData),
    delete: (id) => api.delete(`/api/v1/films/${id}`),
  },

  reviews: {
    create: (filmId, rating, comment = '') =>
      api.post(`/api/v1/films/${filmId}/reviews`, { rating, comment }),

    getByFilm: (filmId) => api.get(`/api/v1/films/${filmId}/reviews`),

    getById: (id) => api.get(`/api/v1/reviews/${id}`),
    update: (id, data) => api.put(`/api/v1/reviews/${id}`, data),     // пока пустой на бэке
    delete: (id) => api.delete(`/api/v1/reviews/${id}`),

    like: (reviewId) => api.post(`/api/v1/reviews/${reviewId}/like`),
    unlike: (reviewId) => api.delete(`/api/v1/reviews/${reviewId}/like`),

    getAverageRating: (filmId) =>
      api.get(`/api/v1/films/${filmId}/average-rating`),
  },

  // Junction-таблицы (для админа)
  filmRelations: {
    addCategory: (filmId, categoryId) =>
      api.post(`/api/v1/films/${filmId}/categories`, { category_id: categoryId }),

    addActor: (filmId, actorId, character = '', ordering = 0) =>
      api.post(`/api/v1/films/${filmId}/actors`, { actor_id: actorId, character, ordering }),
  },
};

export default API;