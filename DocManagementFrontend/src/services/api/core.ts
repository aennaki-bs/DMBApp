import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  // Use HTTP for localhost connections to avoid SSL errors
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5204/api',
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.94:5204/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add reasonable timeout to prevent hanging requests
  timeout: 15000, // 15 seconds timeout
});

// Add CORS headers to help prevent CORS issues
api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export default api;
