import authService from './authService';

class TokenManager {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private lastRefreshAttempt = 0;
  private refreshCooldown = 5000; // 5 seconds cooldown between refresh attempts
  private maxRetries = 3; // Maximum retry attempts for token refresh
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Set up automatic token check every 10 minutes
    this.setupPeriodicTokenCheck();
  }

  // Set up periodic token checking to refresh before expiration
  private setupPeriodicTokenCheck(): void {
    // Check every 10 minutes
    setInterval(() => {
      this.checkAndRefreshToken();
    }, 10 * 60 * 1000); // 10 minutes
  }

  // Proactive token checking and refresh
  private async checkAndRefreshToken(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Check if token needs refresh (within 30 minutes of expiry)
      if (this.shouldRefreshToken(token)) {
        console.log('Proactively refreshing token...');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Proactive token refresh failed:', error);
    }
  }

  // Check if token should be refreshed (within 30 minutes of expiry)
  private shouldRefreshToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

      return (exp - now) < thirtyMinutes;
    } catch (error) {
      console.error('Error parsing token for refresh check:', error);
      return true;
    }
  }

  // Check if token is expired or about to expire (within 5 minutes to allow for refresh)
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      return (exp - now) < fiveMinutes;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Consider invalid tokens as expired
    }
  }

  // Subscribe to token refresh notifications
  subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers when token is refreshed
  private notifySubscribers(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  // Refresh token with proper handling for race conditions, retry logic, and cooldown
  async refreshToken(retryCount = 0): Promise<string | null> {
    const now = Date.now();

    // Check cooldown period to prevent too frequent refresh attempts
    if (now - this.lastRefreshAttempt < this.refreshCooldown) {
      console.log('Token refresh in cooldown period, returning current token');
      return localStorage.getItem('token');
    }

    if (this.isRefreshing) {
      // If refresh is already in progress, wait for it
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;
    this.lastRefreshAttempt = now;

    try {
      console.log(`Attempting token refresh (attempt ${retryCount + 1}/${this.maxRetries + 1})`);

      const newToken = await authService.refreshToken();

      if (newToken) {
        console.log('Token refreshed successfully');
        this.notifySubscribers(newToken);

        // Dispatch success event for UI notification
        if (typeof window !== 'undefined') {
          try {
            const event = new CustomEvent('auth:tokenRefreshed');
            window.dispatchEvent(event);
          } catch (e) {
            console.warn('Could not dispatch token refreshed event:', e);
          }
        }

        return newToken;
      } else {
        // Refresh failed, try retry if we haven't exceeded max retries
        if (retryCount < this.maxRetries) {
          console.log(`Token refresh failed, retrying in 2 seconds... (${retryCount + 1}/${this.maxRetries})`);

          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));

          this.isRefreshing = false; // Reset flag for retry
          return await this.refreshToken(retryCount + 1);
        } else {
          // All retries exhausted, handle refresh failure
          console.error('Token refresh failed after all retries');
          this.handleRefreshFailure();
          return null;
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);

      // Retry on network errors
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        console.log(`Network error during token refresh, retrying in 3 seconds... (${retryCount + 1}/${this.maxRetries})`);

        // Wait 3 seconds before retry on network errors
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.isRefreshing = false; // Reset flag for retry
        return await this.refreshToken(retryCount + 1);
      } else {
        this.handleRefreshFailure();
        return null;
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  // Check if error is a network error worth retrying
  private isNetworkError(error: any): boolean {
    return (
      !error.response || // No response means network issue
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.response?.status >= 500 // Server errors
    );
  }

  private handleRefreshFailure(): void {
    console.log('Handling token refresh failure - clearing tokens and redirecting');

    // Clear all tokens
    authService.clearTokens();

    // Show user-friendly message
    if (typeof window !== 'undefined') {
      // Use a toast notification if available
      try {
        const event = new CustomEvent('auth:tokenExpired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(event);
      } catch (e) {
        console.warn('Could not dispatch token expired event:', e);
      }
    }

    // Redirect to login only if not already on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      // Add a small delay to allow toast to show
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  }

  // Check and refresh token if needed with better error handling
  async ensureValidToken(): Promise<string | null> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }

    try {
      if (this.isTokenExpired(token)) {
        console.log('Token expired or about to expire, attempting refresh...');
        return await this.refreshToken();
      }

      return token;
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      return null;
    }
  }

  // Get token info for debugging
  getTokenInfo(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeRemaining = exp - now;

      return {
        exp: new Date(exp).toISOString(),
        timeRemaining: Math.floor(timeRemaining / 1000 / 60), // minutes
        isExpired: timeRemaining < 0,
        shouldRefresh: this.shouldRefreshToken(token),
        isExpiringSoon: this.isTokenExpired(token)
      };
    } catch (error) {
      return { error: 'Invalid token format' };
    }
  }

  // Clean up timers when needed
  cleanup(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const tokenManager = new TokenManager();

// Add to window for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).tokenManager = tokenManager;
} 