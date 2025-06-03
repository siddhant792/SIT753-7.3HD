<template>
  <form
    class="task-form"
    @submit.prevent="handleSubmit"
  >
    <div class="form-group">
      <label for="title">Title</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        class="form-control"
        required
      >
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        class="form-control"
        rows="4"
      />
    </div>

    <div class="form-group">
      <label for="status">Status</label>
      <select
        id="status"
        v-model="form.status"
        class="form-control"
        required
      >
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
    </div>

    <div class="form-group">
      <label for="priority">Priority</label>
      <select
        id="priority"
        v-model="form.priority"
        class="form-control"
        required
      >
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
    </div>

    <div class="form-group">
      <label for="dueDate">Due Date</label>
      <input
        id="dueDate"
        v-model="form.dueDate"
        type="date"
        class="form-control"
      >
    </div>

    <div class="form-group">
      <label for="tags">Tags</label>
      <div class="tags-input">
        <input
          id="tags"
          v-model="newTag"
          type="text"
          class="form-control"
          placeholder="Type and press Enter to add tags"
          @keydown.enter.prevent="addTag"
        >
        <div class="tags-list">
          <span
            v-for="(tag, index) in form.tags"
            :key="index"
            class="tag"
          >
            {{ tag }}
            <button
              type="button"
              class="tag-remove"
              @click="removeTag(index)"
            >×</button>
          </span>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Save Task' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  taskId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['saved', 'cancel']);

const loading = ref(false);
const newTag = ref('');
const form = ref({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  tags: []
});

onMounted(async () => {
  if (props.taskId) {
    await loadTask();
  }
});

const loadTask = async () => {
  try {
    const response = await axios.get(`/api/tasks/${props.taskId}`);
    const task = response.data;
    form.value = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags || []
    };
  } catch (error) {
    console.error('Failed to load task:', error);
  }
};

const addTag = () => {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (index) => {
  form.value.tags.splice(index, 1);
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const data = {
      ...form.value,
      dueDate: form.value.dueDate || null
    };

    if (props.taskId) {
      await axios.put(`/api/tasks/${props.taskId}`, data);
    } else {
      await axios.post('/api/tasks', data);
    }

    emit('saved');
  } catch (error) {
    console.error('Failed to save task:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.task-form {
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

  .tags-input {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 0.875rem;

      .tag-remove {
        background: none;
        border: none;
        color: inherit;
        margin-left: 0.25rem;
        padding: 0 0.25rem;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;

        &:hover {
          color: #1565c0;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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

    &.btn-primary {
      background: #1976d2;
      color: white;

      &:hover:not(:disabled) {
        background: #1565c0;
      }
    }

    &.btn-secondary {
      background: #f5f5f5;
      color: #333;

      &:hover {
        background: #e0e0e0;
      }
    }
  }
}
</style> 