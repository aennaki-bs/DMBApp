
import api from './core';
import { setupInterceptors } from './interceptors';
import { checkApiConnection } from './connectionCheck';

// Set up interceptors
setupInterceptors();

// Export the api instance and utilities
export { checkApiConnection };
export default api;
