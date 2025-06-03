import { defineStore } from 'pinia';
import { api } from '@/services/http';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(email, password, remember = false) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.login({ email, password });
        this.token = response.data.token;
        this.user = response.data.user;

        if (remember) {
          localStorage.setItem('token', this.token);
          sessionStorage.removeItem('token');
        } else {
          sessionStorage.setItem('token', this.token);
          localStorage.removeItem('token');
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.register(userData);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      this.error = null;

      try {
        await api.auth.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
        this.loading = false;
        router.push('/login');
      }
    },

    async fetchUser() {
      if (!this.token) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.me();
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch user data';
        this.clearAuth();
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    },

    async updateProfile(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.updateProfile(userData);
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changePassword(passwordData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.changePassword(passwordData);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to change password';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 