import { useNotificationStore } from '@/stores/notifications';
import { useTaskStore } from '@/stores/tasks';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; 
    this.maxReconnectDelay = 30000; 
    this.handlers = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.socket.close();
    }

    // eslint-disable-next-line no-undef
    const wsUrl = `${process.env.VUE_APP_WS_URL}/ws?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'notification':
        this.handleNotification(payload);
        break;
      case 'task':
        this.handleTask(payload);
        break;
      case 'tenant':
        this.handleTenant(payload);
        break;
      default:
        console.warn('Unknown message type:', type);
    }

    
    const handlers = this.handlers.get(type) || [];
    handlers.forEach(handler => handler(payload));
  }

  handleNotification(payload) {
    const notificationStore = useNotificationStore();
    const { action, data } = payload;

    switch (action) {
      case 'created':
        notificationStore.handleNewNotification(data);
        break;
      case 'read':
        notificationStore.handleNotificationRead(data.id);
        break;
      case 'deleted':
        notificationStore.handleNotificationDeleted(data.id);
        break;
      default:
        console.warn('Unknown notification action:', action);
    }
  }

  handleTask(payload) {
    const taskStore = useTaskStore();
    const { action, data } = payload;

    switch (action) {
      case 'created':
        taskStore.tasks.unshift(data);
        break;
      case 'updated': {
        const index = taskStore.tasks.findIndex(task => task.id === data.id);
        if (index !== -1) {
          taskStore.tasks[index] = data;
        }
        break;
      }
      case 'deleted':
        taskStore.tasks = taskStore.tasks.filter(task => task.id !== data.id);
        break;
      default:
        console.warn('Unknown task action:', action);
    }
  }

  handleTenant(payload) {
    const { action, data } = payload;
    
    
    console.log('Tenant update:', action, data);
  }

  subscribe(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
  }

  unsubscribe(type, handler) {
    if (this.handlers.has(type)) {
      const handlers = this.handlers.get(type);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService(); 