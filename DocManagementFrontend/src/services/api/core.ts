import axios from 'axios';

// Add custom properties to the axios request config type
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
    _retry?: boolean;
  }
}

const port = 5205;
const address = '192.168.1.94';
// let address = '192.168.0.150';
// let address = 'localhost';
// let address = '172.20.10.4';

const apiUrl = `http://${address}:${port}/api`;

// Create axios instance with default configuration
const api = axios.create({
  // Use the correct port for the API (5205) as seen in the network tab
  baseURL: import.meta.env.VITE_API_URL || apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Use a reasonable timeout to prevent hanging requests
  timeout: 15000, // 15 seconds timeout
});

// Add request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    // Prevent infinite retries by tracking retry attempts
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Ensure URL is properly formed
    if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
      config.url = '/' + config.url;
    }

    // Only reject truly invalid URLs (undefined, null, or empty string)
    // Root path '/' is valid for health checks
    if (!config.url) {
      console.error('Empty or invalid URL detected:', config.url);
      return Promise.reject(new Error('Invalid API endpoint'));
    }

    console.log('API Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 404 errors gracefully
    if (error.response && error.response.status === 404) {
      console.warn('API endpoint not found:', error.config.url);
    }
    
    // Prevent infinite retries
    if (error.config) {
      // If we've already retried, don't retry again
      if (error.config._retryCount >= 1) {
        console.warn('Already retried request, giving up');
        return Promise.reject(error);
      }
      
      // Mark this request as having been retried
      error.config._retryCount = (error.config._retryCount || 0) + 1;
      error.config._retry = true;
    }
    
    return Promise.reject(error);
  }
);

// Add CORS headers to help prevent CORS issues
api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export default api;
