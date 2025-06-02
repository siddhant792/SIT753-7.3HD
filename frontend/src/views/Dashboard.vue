<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <!-- Statistics Cards -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="card">
          <div class="stat-card">
            <i class="stat-icon todo">📋</i>
            <div class="stat-content">
              <span class="stat-value">{{ stats.todo }}</span>
              <span class="stat-label">To Do</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="card">
          <div class="stat-card">
            <i class="stat-icon in-progress">⏳</i>
            <div class="stat-content">
              <span class="stat-value">{{ stats.inProgress }}</span>
              <span class="stat-label">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="card">
          <div class="stat-card">
            <i class="stat-icon review">👀</i>
            <div class="stat-content">
              <span class="stat-value">{{ stats.review }}</span>
              <span class="stat-label">Review</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="card">
          <div class="stat-card">
            <i class="stat-icon done">✅</i>
            <div class="stat-content">
              <span class="stat-value">{{ stats.done }}</span>
              <span class="stat-label">Done</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div class="grid mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="flex align-items-center justify-content-between">
              <span class="section-title">Recent Tasks</span>
              <button class="btn-primary" @click="showNewTaskDialog">
                <i class="icon-plus">+</i> New Task
              </button>
            </div>
          </div>
          <div class="card-content">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentTasks" :key="task.id">
                  <td><span class="font-bold">{{ task.title }}</span></td>
                  <td>
                    <span :class="['status-badge', task.status.toLowerCase()]">
                      {{ task.status }}
                    </span>
                  </td>
                  <td>{{ task.assigned_to || 'Unassigned' }}</td>
                  <td>{{ formatDate(task.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- New Task Dialog -->
    <div v-if="taskDialog" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>New Task</h2>
          <button class="btn-close" @click="hideDialog">&times;</button>
        </div>
        <div class="modal-content">
          <div class="field">
            <label for="title">Title</label>
            <input
              type="text"
              id="title"
              v-model.trim="task.title"
              required
              :class="{ 'invalid': submitted && !task.title }"
            />
            <small class="error" v-if="submitted && !task.title">Title is required.</small>
          </div>

          <div class="field">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="task.description"
              rows="3"
            ></textarea>
          </div>

          <div class="field">
            <label for="status">Status</label>
            <select
              id="status"
              v-model="task.status"
              required
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="hideDialog">Cancel</button>
          <button class="btn-primary" @click="saveTask">Save</button>
        </div>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const taskDialog = ref(false);
const task = ref({
  title: '',
  description: '',
  status: 'todo',
  assigned_to: '',
});
const submitted = ref(false);
const stats = ref({
  todo: 0,
  inProgress: 0,
  review: 0,
  done: 0,
  total: 0,
});
const recentTasks = ref([]);


const getAuthToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    
    return null;
  }
  return token;
};

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadRecentTasks(),
  ]);
});

const loadStats = async () => {
  console.log('loadStats');
  try {
    const token = getAuthToken();
    if (!token) return;
    
    const response = await axios.get('/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(response.data);
    const tasks = response.data;
    
    
    stats.value = {
      todo: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      review: tasks.filter(task => task.status === 'review').length,
      done: tasks.filter(task => task.status === 'done').length,
      total: tasks.length
    };
  } catch (error) {
    console.error('Failed to load task statistics:', error);
    if (error.response?.status === 401) {
      
    }
  }
};

const loadRecentTasks = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    if (!token) return;

    const response = await axios.get('/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    recentTasks.value = response.data
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Failed to load recent tasks:', error);
    if (error.response?.status === 401) {
      
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const showNewTaskDialog = () => {
  task.value = {
    title: '',
    description: '',
    status: 'todo',
    assigned_to: '',
  };
  submitted.value = false;
  taskDialog.value = true;
};

const hideDialog = () => {
  taskDialog.value = false;
  submitted.value = false;
};

const saveTask = async () => {
  submitted.value = true;

  if (task.value.title.trim()) {
    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.post('/api/tasks', task.value, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await Promise.all([
        loadStats(),
        loadRecentTasks(),
      ]);
      
      taskDialog.value = false;
      task.value = {
        title: '',
        description: '',
        status: 'todo',
        assigned_to: '',
      };
    } catch (error) {
      console.error('Failed to save task', error);
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
  }

  .col-12 { grid-column: span 12; }
  .col-6 { grid-column: span 6; }
  .col-3 { grid-column: span 3; }

  @media (min-width: 768px) {
    .md\:col-6 { grid-column: span 6; }
  }

  @media (min-width: 992px) {
    .lg\:col-8 { grid-column: span 8; }
    .lg\:col-4 { grid-column: span 4; }
    .lg\:col-3 { grid-column: span 3; }
  }

  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem;
  }

  .card-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;

    .flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }

  .card-content {
    padding-top: 1rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;

    .stat-icon {
      font-size: 2rem;
      padding: 1rem;
      border-radius: 50%;
      background-color: #f5f5f5;

      &.todo { color: #1976d2; }
      &.in-progress { color: #f57c00; }
      &.review { color: #9c27b0; }
      &.done { color: #388e3c; }
      &.total { color: #7b1fa2; }
    }

    .stat-content {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
      }

      .stat-label {
        color: #666;
      }
    }
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      font-weight: 600;
      color: #666;
    }
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;

    &.todo { background: #e3f2fd; color: #1976d2; }
    &.in-progress { background: #fff3e0; color: #f57c00; }
    &.done { background: #e8f5e9; color: #388e3c; }
  }

  .btn-primary {
    background-color: #1976d2;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);

    &:hover {
      background-color: #1565c0;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
    }

    .icon-plus {
      font-size: 1.1rem;
      font-weight: bold;
    }
  }

  .btn-secondary {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e0e0e0;
      border-color: #ccc;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 450px;
    max-width: 90%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    animation: modalSlideIn 0.2s ease-out;
    overflow: hidden;
  }

  @keyframes modalSlideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 1.25rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fafafa;

    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
      font-weight: 600;
    }
  }

  .modal-content {
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .modal-footer {
    padding: 1.25rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background-color: #fafafa;
  }

  .field {
    margin-bottom: 1.25rem;
    box-sizing: border-box;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #444;
      font-size: 0.9rem;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      background-color: #fff;
      box-sizing: border-box;

      &:hover {
        border-color: #bbb;
      }

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
      }

      &.invalid {
        border-color: #d32f2f;
        &:focus {
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
        }
      }
    }

    .error {
      color: #d32f2f;
      font-size: 0.8rem;
      margin-top: 0.375rem;
    }
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #333;
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
}
</style> 