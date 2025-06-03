<template>
  <div class="task-list">
    <!-- Filters -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search tasks..."
          class="form-control"
        >
      </div>

      <div class="filter-group">
        <select
          v-model="filters.status"
          class="form-control"
        >
          <option value="">
            All Statuses
          </option>
          <option value="TODO">
            To Do
          </option>
          <option value="IN_PROGRESS">
            In Progress
          </option>
          <option value="DONE">
            Done
          </option>
        </select>

        <select
          v-model="filters.priority"
          class="form-control"
        >
          <option value="">
            All Priorities
          </option>
          <option value="LOW">
            Low
          </option>
          <option value="MEDIUM">
            Medium
          </option>
          <option value="HIGH">
            High
          </option>
        </select>

        <input
          v-model="filters.dueDate"
          type="date"
          class="form-control"
          placeholder="Filter by due date"
        >
      </div>
    </div>

    <!-- Task Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="task in filteredTasks"
            :key="task.id"
          >
            <td>
              <span class="task-title">{{ task.title }}</span>
            </td>
            <td>
              <span :class="['status-badge', task.status.toLowerCase()]">
                {{ task.status }}
              </span>
            </td>
            <td>
              <span :class="['priority-badge', task.priority.toLowerCase()]">
                {{ task.priority }}
              </span>
            </td>
            <td>{{ formatDate(task.dueDate) }}</td>
            <td>
              <div class="tags">
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td>
              <div class="actions">
                <button
                  class="btn-icon"
                  title="Edit"
                  @click="$emit('edit', task)"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  title="Delete"
                  @click="confirmDelete(task)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="dialog-overlay"
    >
      <div class="dialog">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this task?</p>
        <div class="dialog-actions">
          <button
            class="btn btn-secondary"
            @click="showDeleteDialog = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger"
            :disabled="deleting"
            @click="deleteTask"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit', 'refresh']);

const filters = ref({
  search: '',
  status: '',
  priority: '',
  dueDate: ''
});

const showDeleteDialog = ref(false);
const taskToDelete = ref(null);
const deleting = ref(false);

const filteredTasks = computed(() => {
  return props.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         task.description.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesStatus = !filters.value.status || task.status === filters.value.status;
    const matchesPriority = !filters.value.priority || task.priority === filters.value.priority;
    const matchesDueDate = !filters.value.dueDate || task.dueDate === filters.value.dueDate;

    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });
});

const formatDate = (date) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString();
};

const confirmDelete = (task) => {
  taskToDelete.value = task;
  showDeleteDialog.value = true;
};

const deleteTask = async () => {
  if (!taskToDelete.value) return;

  deleting.value = true;
  try {
    await axios.delete(`/api/tasks/${taskToDelete.value.id}`);
    emit('refresh');
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('Failed to delete task:', error);
  } finally {
    deleting.value = false;
    taskToDelete.value = null;
  }
};
</script>

<style lang="scss" scoped>
.task-list {
  .filters {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .search-box {
      flex: 1;
      min-width: 200px;
    }

    .filter-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }

  .form-control {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      font-weight: 600;
      color: #666;
      background: #f5f5f5;
    }

    .task-title {
      font-weight: 500;
    }
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;

    &.todo { background: #e3f2fd; color: #1976d2; }
    &.in_progress { background: #fff3e0; color: #f57c00; }
    &.done { background: #e8f5e9; color: #388e3c; }
  }

  .priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;

    &.low { background: #e8f5e9; color: #388e3c; }
    &.medium { background: #fff3e0; color: #f57c00; }
    &.high { background: #ffebee; color: #d32f2f; }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;

    .tag {
      padding: 0.25rem 0.5rem;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 0.75rem;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-icon {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    font-size: 1.25rem;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  .dialog-overlay {
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

  .dialog {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    min-width: 300px;

    h3 {
      margin: 0 0 1rem;
    }

    p {
      margin: 0 0 1.5rem;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &.btn-secondary {
      background: #f5f5f5;
      color: #333;

      &:hover {
        background: #e0e0e0;
      }
    }

    &.btn-danger {
      background: #d32f2f;
      color: white;

      &:hover:not(:disabled) {
        background: #b71c1c;
      }
    }
  }
}
</style> 