import authService from './authService';

class TokenManager {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  // Check if token is expired or about to expire (within 5 minutes)
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

  // Refresh token with proper handling for race conditions
  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If refresh is already in progress, wait for it
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await authService.refreshToken();
      
      if (newToken) {
        this.notifySubscribers(newToken);
        return newToken;
      } else {
        // Refresh failed, redirect to login
        this.handleRefreshFailure();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleRefreshFailure();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private handleRefreshFailure(): void {
    // Clear all tokens
    authService.clearTokens();
    
    // Redirect to login only if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // Check and refresh token if needed
  async ensureValidToken(): Promise<string | null> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      console.log('Token expired, attempting refresh...');
      return await this.refreshToken();
    }

    return token;
  }
}

export const tokenManager = new TokenManager(); 