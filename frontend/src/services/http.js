import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const http = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await http.post('/api/auth/refresh');
        const { token } = response.data;

        localStorage.setItem('token', token);
        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return http(originalRequest);
      } catch (refreshError) {
        const authStore = useAuthStore();
        authStore.clearAuth();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          router.push('/403');
          break;
        case 404:
          router.push('/404');
          break;
        case 500:
          router.push('/500');
          break;
      }

      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({
        message: 'No response from server. Please check your internet connection.',
      });
    } else {
      return Promise.reject({
        message: 'An error occurred while setting up the request.',
      });
    }
  }
);

export const api = {
  auth: {
    login: (credentials) => http.post('/api/auth/login', credentials),
    register: (userData) => http.post('/api/auth/register', userData),
    logout: () => http.post('/api/auth/logout'),
    refresh: () => http.post('/api/auth/refresh'),
    me: () => http.get('/api/auth/me'),
    updateProfile: (userData) => http.put('/api/auth/profile', userData),
    changePassword: (passwordData) => http.put('/api/auth/change-password', passwordData),
  },
  tasks: {
    getAll: (params) => http.get('/api/tasks', { params }),
    getById: (id) => http.get(`/api/tasks/${id}`),
    create: (taskData) => http.post('/api/tasks', taskData),
    update: (id, taskData) => http.put(`/api/tasks/${id}`, taskData),
    delete: (id) => http.delete(`/api/tasks/${id}`),
    updateStatus: (id, status) => http.patch(`/api/tasks/${id}/status`, { status }),
    assign: (id, userId) => http.patch(`/api/tasks/${id}/assign`, { userId }),
    getStats: () => http.get('/api/tasks/stats'),
    getRecent: () => http.get('/api/tasks/recent'),
  },
  notifications: {
    getAll: () => http.get('/api/notifications'),
    markAsRead: (id) => http.put(`/api/notifications/${id}/read`),
    markAllAsRead: () => http.put('/api/notifications/read-all'),
    delete: (id) => http.delete(`/api/notifications/${id}`),
    deleteAll: () => http.delete('/api/notifications'),
  },
  tenant: {
    getCurrent: () => http.get('/api/tenant/current'),
    getAll: () => http.get('/api/tenants'),
    create: (tenantData) => http.post('/api/tenants', tenantData),
    update: (id, tenantData) => http.put(`/api/tenants/${id}`, tenantData),
    delete: (id) => http.delete(`/api/tenants/${id}`),
    inviteUser: (email, role) => http.post('/api/tenant/invite', { email, role }),
    removeUser: (userId) => http.delete(`/api/tenant/users/${userId}`),
    updateUserRole: (userId, role) => http.put(`/api/tenant/users/${userId}/role`, { role }),
    switchTenant: (tenantId) => http.post(`/api/tenant/switch/${tenantId}`),
  },
};

export default http; 