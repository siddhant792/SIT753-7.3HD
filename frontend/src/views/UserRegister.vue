<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Register</h1>
      <form
        class="register-form"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="error"
          class="error-message"
        >
          {{ error }}
        </div>
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
            required
          >
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </div>

        <div class="form-footer">
          <p>
            Already have an account?
            <router-link
              to="/login"
              class="link"
            >
              Login
            </router-link>
          </p>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="modal-overlay"
    >
      <div class="modal-content">
        <h2>Registration Successful!</h2>
        <p>You have been registered. Please login to continue.</p>
        <button
          class="btn btn-primary"
          @click="goToLogin"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/http';

const router = useRouter();
const loading = ref(false);
const showSuccessModal = ref(false);
const error = ref('');
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const goToLogin = () => {
  router.push('/login');
};

const handleSubmit = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  error.value = '';
  loading.value = true;
  try {
    await api.auth.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });
    showSuccessModal.value = true;
  } catch (err) {
    if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Registration failed. Please try again.';
    }
    console.error('Registration failed:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.register-card {
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

.register-form {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  text-align: center;

  h2 {
    margin: 0 0 1rem;
    color: #333;
  }

  p {
    margin-bottom: 1.5rem;
    color: #666;
  }

  .btn {
    width: auto;
    min-width: 120px;
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