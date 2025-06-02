
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  TASKS: {
    BASE: '/api/tasks',
    STATS: '/api/tasks/stats',
    RECENT: '/api/tasks/recent',
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    READ_ALL: '/api/notifications/read-all',
  },
  TENANT: {
    CURRENT: '/api/tenant/current',
    BASE: '/api/tenants',
    INVITE: '/api/tenant/invite',
    USERS: '/api/tenant/users',
    SWITCH: '/api/tenant/switch',
  },
};


export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
};


export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};


export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};


export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  USER_INVITED: 'user_invited',
  USER_REMOVED: 'user_removed',
  ROLE_UPDATED: 'role_updated',
};


export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  TENANT: 'tenant',
  THEME: 'theme',
  LANGUAGE: 'language',
};


export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};


export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
};


export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};


export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
};


export const FILE_UPLOADS = {
  MAX_SIZE: 5 * 1024 * 1024, 
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILES: 5,
};


export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  TASK_TITLE_MAX_LENGTH: 100,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
};


export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  TOO_MANY_FILES: 'Too many files',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
};


export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  LOGOUT: 'Successfully logged out',
  REGISTER: 'Successfully registered',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  USER_INVITED: 'User invited successfully',
  USER_REMOVED: 'User removed successfully',
  ROLE_UPDATED: 'Role updated successfully',
};


export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  TASK_UPDATED: 'task_updated',
  TASK_CREATED: 'task_created',
  TASK_DELETED: 'task_deleted',
  NOTIFICATION: 'notification',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
};


export const ROUTE_NAMES = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  NOT_FOUND: 'not-found',
};


export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
}; 