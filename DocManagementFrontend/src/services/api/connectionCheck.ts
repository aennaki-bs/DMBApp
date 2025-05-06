
import api from './core';

// Simple method to test if API is available
// Try to make a basic request to the server without assuming a specific endpoint
export const checkApiConnection = async () => {
  try {
    // Try to access the base API URL - this doesn't need to hit a specific endpoint
    // The connection will fail early if the server is completely unreachable
    await api.get('', { 
      timeout: 5000,
      // Don't throw for 404 errors - we just want to check if the server responds at all
      validateStatus: (status) => status < 500
    });
    return true;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};
