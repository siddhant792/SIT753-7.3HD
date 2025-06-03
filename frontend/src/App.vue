<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link
          to="/"
          class="logo"
        >
          Task Management
        </router-link>
      </div>
      <div class="navbar-menu">
        <template v-if="isAuthenticated">
          <router-link
            to="/dashboard"
            class="nav-item"
          >
            Dashboard
          </router-link>
          <a
            class="nav-item logout-btn"
            :class="{ 'is-loading': authStore.loading }"
            @click="confirmLogout"
          >Logout</a>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="nav-item"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="nav-item"
          >
            Register
          </router-link>
        </template>
      </div>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Task Management Platform</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const confirmLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    await authStore.logout();
  }
};
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #2c3e50;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .navbar-brand {
    .logo {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
    }
  }

  .navbar-menu {
    display: flex;
    gap: 1rem;

    .nav-item {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      &.logout-btn {
        cursor: pointer;
        
        &.is-loading {
          opacity: 0.7;
          pointer-events: none;
        }
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 