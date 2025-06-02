<template>
  <div class="profile-page">
    <div class="profile-card">
      <h1>Profile</h1>
      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            v-model="form.currentPassword"
            type="password"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Changes' }}
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
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

onMounted(async () => {
  try {
    const response = await axios.get('/api/users/profile');
    form.value.name = response.data.name;
    form.value.email = response.data.email;
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
});

const handleSubmit = async () => {
  if (form.value.newPassword && form.value.newPassword !== form.value.confirmPassword) {
    console.error('New passwords do not match');
    return;
  }

  loading.value = true;
  try {
    const data = {
      name: form.value.name,
      email: form.value.email
    };

    if (form.value.currentPassword && form.value.newPassword) {
      data.currentPassword = form.value.currentPassword;
      data.newPassword = form.value.newPassword;
    }

    await axios.put('/api/users/profile', data);
    form.value.currentPassword = '';
    form.value.newPassword = '';
    form.value.confirmPassword = '';
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0 0 1.5rem;
    color: #333;
  }
}

.profile-form {
  .form-group {
    margin-bottom: 1rem;

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

  .form-actions {
    margin-top: 1.5rem;
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