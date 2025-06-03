<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Login</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
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
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>

        <div class="form-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="link">Register</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '../services/http';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const form = ref({
  email: '',
  password: ''
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.auth.login(form.value);
    localStorage.setItem('token', response.data.token);
    
    const redirectPath = route.query.redirect || '/dashboard';
    router.push(redirectPath);
  } catch (err) {
    console.error('Login failed:', err);
    error.value = err.message || 'Failed to login. Please check your credentials and try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h1 {
    margin: 0 0 1.5rem;
    text-align: center;
    color: #333;
  }
}

.login-form {
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

  .form-footer {
    margin-top: 1rem;
    text-align: center;
    color: #666;

    .link {
      color: #1976d2;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.btn {
  width: 100%;
  padding: 0.75rem;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}
</style> 