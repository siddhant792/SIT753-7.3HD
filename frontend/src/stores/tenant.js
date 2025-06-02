import { defineStore } from 'pinia';
import axios from 'axios';

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    currentTenant: null,
    tenants: [],
    loading: false,
    error: null,
  }),

  getters: {
    isTenantAdmin: (state) => {
      return state.currentTenant?.role === 'admin';
    },

    tenantUsers: (state) => {
      return state.currentTenant?.users || [];
    },
  },

  actions: {
    async fetchCurrentTenant() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/tenant/current');
        this.currentTenant = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch current tenant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTenants() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/tenants');
        this.tenants = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tenants';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTenant(tenantData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/tenants', tenantData);
        this.tenants.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create tenant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTenant(id, tenantData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.put(`/api/tenants/${id}`, tenantData);
        const index = this.tenants.findIndex(tenant => tenant.id === id);
        if (index !== -1) {
          this.tenants[index] = response.data;
        }
        if (this.currentTenant?.id === id) {
          this.currentTenant = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update tenant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTenant(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`/api/tenants/${id}`);
        this.tenants = this.tenants.filter(tenant => tenant.id !== id);
        if (this.currentTenant?.id === id) {
          this.currentTenant = null;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete tenant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async inviteUser(email, role) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/tenant/invite', { email, role });
        if (this.currentTenant) {
          this.currentTenant.users.push(response.data);
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to invite user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeUser(userId) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`/api/tenant/users/${userId}`);
        if (this.currentTenant) {
          this.currentTenant.users = this.currentTenant.users.filter(user => user.id !== userId);
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to remove user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUserRole(userId, role) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.put(`/api/tenant/users/${userId}/role`, { role });
        if (this.currentTenant) {
          const user = this.currentTenant.users.find(u => u.id === userId);
          if (user) {
            user.role = role;
          }
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user role';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async switchTenant(tenantId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(`/api/tenant/switch/${tenantId}`);
        this.currentTenant = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to switch tenant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearTenantState() {
      this.currentTenant = null;
      this.tenants = [];
      this.error = null;
    },
  },
}); 