<template>
  <div class="notification-list">
    <div class="notification-header">
      <h3>Notifications</h3>
      <button
        v-if="notifications.length > 0"
        class="btn btn-text"
        @click="markAllAsRead"
        :disabled="loading"
      >
        Mark all as read
      </button>
    </div>

    <div v-if="loading" class="loading">
      Loading notifications...
    </div>

    <div v-else-if="notifications.length === 0" class="empty-state">
      No notifications
    </div>

    <div v-else class="notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', { unread: !notification.read }]"
      >
        <div class="notification-content">
          <p class="message">{{ notification.message }}</p>
          <span class="time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        <button
          v-if="!notification.read"
          class="btn btn-text"
          @click="markAsRead(notification.id)"
          :disabled="loading"
        >
          Mark as read
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  notifications: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['refresh']);
const loading = ref(false);

const formatTime = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return notificationDate.toLocaleDateString();
};

const markAsRead = async (notificationId) => {
  loading.value = true;
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
    emit('refresh');
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  } finally {
    loading.value = false;
  }
};

const markAllAsRead = async () => {
  loading.value = true;
  try {
    await axios.put('/api/notifications/read-all');
    emit('refresh');
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.notification-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    color: #333;
  }
}

.loading, .empty-state {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.notifications {
  .notification {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &.unread {
      background-color: #f5f9ff;
    }

    .notification-content {
      flex: 1;
      margin-right: 1rem;

      .message {
        margin: 0 0 0.25rem;
        color: #333;
      }

      .time {
        font-size: 0.875rem;
        color: #666;
      }
    }
  }
}

.btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.btn-text {
    background: none;
    color: #1976d2;

    &:hover:not(:disabled) {
      background: rgba(25, 118, 210, 0.1);
    }
  }
}
</style> 