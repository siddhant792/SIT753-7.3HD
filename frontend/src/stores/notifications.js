import { defineStore } from 'pinia';
import axios from 'axios';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(notification => !notification.read);
    },
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/notifications');
        this.notifications = response.data;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.put(`/api/notifications/${id}/read`);
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          this.unreadCount--;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark notification as read';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markAllAsRead() {
      this.loading = true;
      this.error = null;

      try {
        await axios.put('/api/notifications/read-all');
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        this.unreadCount = 0;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark all notifications as read';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteNotification(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`/api/notifications/${id}`);
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          this.unreadCount--;
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete notification';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAllNotifications() {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete('/api/notifications');
        this.notifications = [];
        this.unreadCount = 0;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete all notifications';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    
    handleNewNotification(notification) {
      this.notifications.unshift(notification);
      if (!notification.read) {
        this.unreadCount++;
      }
    },

    handleNotificationRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        this.unreadCount--;
      }
    },

    handleNotificationDeleted(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        this.unreadCount--;
      }
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
  },
}); 