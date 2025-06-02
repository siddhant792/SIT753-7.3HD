import { defineStore } from 'pinia';
import { api } from '@/services/http';

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    teamMembers: [],
    loading: false,
    error: null,
    filters: {
      status: null,
      priority: null,
      assignee: null,
      search: '',
    },
    sort: {
      field: 'dueDate',
      order: 'asc',
    },
  }),

  getters: {
    filteredTasks: (state) => {
      let result = [...state.tasks];

      
      if (state.filters.status) {
        result = result.filter(task => task.status === state.filters.status);
      }
      if (state.filters.priority) {
        result = result.filter(task => task.priority === state.filters.priority);
      }
      if (state.filters.assignee) {
        result = result.filter(task => task.assignee?.id === state.filters.assignee);
      }
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        result = result.filter(task => 
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search)
        );
      }

      
      result.sort((a, b) => {
        const aValue = a[state.sort.field];
        const bValue = b[state.sort.field];
        const modifier = state.sort.order === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue) * modifier;
        }
        return (aValue - bValue) * modifier;
      });

      return result;
    },

    getTaskById: (state) => (id) => {
      return state.tasks.find(task => task.id === id);
    },
  },

  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.tasks.getAll();
        this.tasks = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tasks';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTask(taskData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.tasks.create(taskData);
        this.tasks.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create task';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(id, taskData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.tasks.update(id, taskData);
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update task';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.tasks.delete(id);
        this.tasks = this.tasks.filter(task => task.id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete task';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTaskStatus(id, status) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.tasks.updateStatus(id, status);
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update task status';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async assignTask(id, userId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.tasks.assign(id, userId);
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to assign task';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilter(filter, value) {
      this.filters[filter] = value;
    },

    setSort(field, order) {
      this.sort.field = field;
      this.sort.order = order;
    },

    clearFilters() {
      this.filters = {
        status: null,
        priority: null,
        assignee: null,
        search: '',
      };
    },

    async fetchTeamMembers() {
      try {
        const response = await api.tenant.getCurrent();
        this.teamMembers = response.data.users || [];
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch team members';
        throw error;
      }
    },
  },
}); 