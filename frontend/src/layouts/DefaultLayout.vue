<template>
  <div class="layout-wrapper">
    <!-- Top Navigation -->
    <Menubar
      :model="menuItems"
      class="layout-menubar"
    >
      <template #start>
        <router-link
          to="/"
          class="logo"
        >
          <img
            src="@/assets/logo.png"
            alt="Logo"
            height="40"
          >
          <span class="logo-text">Task Manager</span>
        </router-link>
      </template>

      <template #end>
        <div class="flex align-items-center gap-3">
          <Button
            icon="pi pi-bell"
            class="p-button-rounded p-button-text"
            :badge="unreadNotifications"
            badge-class="p-badge-danger"
            @click="toggleNotifications"
          />

          <Menu
            ref="userMenu"
            :model="userMenuItems"
            :popup="true"
          />
          <Button
            icon="pi pi-user"
            class="p-button-rounded p-button-text"
            aria-haspopup="true"
            aria-controls="user-menu"
            @click="toggleUserMenu"
          />
        </div>
      </template>
    </Menubar>

    <!-- Main Content -->
    <div class="layout-main">
      <router-view />
    </div>

    <!-- Notifications Panel -->
    <Sidebar
      v-model="showNotifications"
      position="right"
      :base-z-index="1000"
      class="notifications-panel"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between">
          <h3>Notifications</h3>
          <Button
            icon="pi pi-check"
            class="p-button-text"
            label="Mark all as read"
            @click="markAllAsRead"
          />
        </div>
      </template>

      <div class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <i :class="['notification-icon', notification.icon]" />
          <div class="notification-content">
            <span class="notification-text">{{ notification.text }}</span>
            <small class="notification-time">{{ formatDate(notification.time) }}</small>
          </div>
        </div>

        <div
          v-if="notifications.length === 0"
          class="text-center p-4"
        >
          No notifications
        </div>
      </div>
    </Sidebar>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model="showLogoutDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i
          class="pi pi-exclamation-triangle mr-3"
          style="font-size: 2rem"
        />
        <span>Are you sure you want to logout?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="showLogoutDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text p-button-danger"
          @click="handleLogout"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const userMenu = ref();
const showNotifications = ref(false);
const showLogoutDialog = ref(false);
const loading = ref(false);


const menuItems = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/dashboard',
  },
];


const userMenuItems = [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/profile'),
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => router.push('/settings'),
  },
  {
    separator: true,
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => showLogoutDialog.value = true,
  },
];


const notifications = ref([]);
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});


const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};


const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    fetchNotifications();
  }
};

const fetchNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications');
    notifications.value = response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};


const markAllAsRead = async () => {
  try {
    await axios.put('/api/notifications/read-all');
    notifications.value.forEach(n => n.read = true);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};


const handleLogout = async () => {
  loading.value = true;
  try {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('token');
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    loading.value = false;
  }
};


const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style lang="scss" scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .layout-menubar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    border-radius: 0;
    border-left: 0;
    border-right: 0;

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;

      .logo-text {
        font-size: 1.25rem;
        font-weight: 600;
      }
    }
  }

  .layout-main {
    margin-top: 4rem;
    padding: 2rem;
    flex: 1;
  }
}

.notifications-panel {
  :deep(.p-sidebar-header) {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  .notifications-list {
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f9fa;
      }

      &.unread {
        background-color: #e3f2fd;
      }

      .notification-icon {
        font-size: 1.25rem;
        color: #666;
      }

      .notification-content {
        flex: 1;

        .notification-text {
          display: block;
          margin-bottom: 0.25rem;
        }

        .notification-time {
          color: #666;
          font-size: 0.875rem;
        }
      }
    }
  }
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 