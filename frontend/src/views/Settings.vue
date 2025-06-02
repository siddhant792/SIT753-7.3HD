<template>
  <div class="settings-page">
    <div class="settings-card">
      <h1>Settings</h1>
      <form @submit.prevent="handleSubmit" class="settings-form">
        <div class="form-group">
          <label for="theme">Theme</label>
          <select id="theme" v-model="form.theme" class="form-control">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div class="form-group">
          <label for="notifications">Email Notifications</label>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="notifications"
              v-model="form.emailNotifications"
              class="toggle-input"
            />
            <label for="notifications" class="toggle-label"></label>
          </div>
        </div>

        <div class="form-group">
          <label for="refreshInterval">Auto-refresh Interval (minutes)</label>
          <input
            id="refreshInterval"
            v-model.number="form.refreshInterval"
            type="number"
            min="1"
            max="60"
            class="form-control"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(false);
const form = ref({
  theme: 'light',
  emailNotifications: true,
  refreshInterval: 5
});

onMounted(async () => {
  try {
    const response = await axios.get('/api/settings');
    form.value = response.data;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    await axios.put('/api/settings', form.value);
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0 0 1.5rem;
    color: #333;
  }
}

.settings-form {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    .toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;

      &:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
    }

    .toggle-input:checked + .toggle-label {
      background-color: #1976d2;
    }

    .toggle-input:checked + .toggle-label:before {
      transform: translateX(26px);
    }
  }

  .form-actions {
    margin-top: 2rem;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: #1976d2;
    color: white;

    &:hover:not(:disabled) {
      background: #1565c0;
    }
  }
}
</style> 