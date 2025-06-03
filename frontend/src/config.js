export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:3001'
}; 