
import React, { createContext, useState, useEffect, useContext } from 'react';
import { NavigateFunction } from 'react-router-dom';
import authService, { 
  LoginCredentials, 
  RegisterCredentials, 
  UserInfo,
  UpdateProfileRequest
} from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: (navigate?: NavigateFunction) => void;
  refreshUserInfo: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileRequest) => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
}

// Define the RoleType interface to properly type the role property
interface RoleType {
  roleName?: string;
  roleId?: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => {},
  logout: () => {},
  refreshUserInfo: async () => {},
  updateUserProfile: async () => {},
  hasRole: () => false,
});

// Export the hook through a direct import
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          console.log('Stored user data:', parsedUser);
          
          // Verify token is still valid by fetching user info
          const userInfo = await authService.getUserInfo();
          console.log('User info verified on init:', userInfo);
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUserInfo = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const userInfo = await authService.getUserInfo();
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log('User info refreshed:', userInfo);
    } catch (error) {
      console.error('Error refreshing user info', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserProfile = async (data: UpdateProfileRequest) => {
    try {
      setIsLoading(true);
      await authService.updateProfile(data);
      await refreshUserInfo(); // Automatically refresh user info after updating profile
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      const errorMessage = error.response?.data || error.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response && response.token && response.user) {
        // Store the user with userId explicitly in localStorage to ensure it's always available
        const userWithId = {
          ...response.user,
          userId: response.user.userId // Ensure userId is explicitly set
        };
        
        setToken(response.token);
        setUser(userWithId);
        
        // Make sure we store the complete user object with userId
        console.log('Storing user data on login:', userWithId);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userWithId));
        
        console.log('Login successful, user set:', userWithId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.register(credentials);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('Registration failed', error);
      // Forward the error to be handled by the registration component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (navigate?: NavigateFunction) => {
    try {
      let userId = user?.userId;
      
      // Check if we have user ID in the current state
      if (!userId) {
        // Try to get user ID from localStorage as a backup
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser.userId;
            console.log('Retrieved userId from localStorage:', userId);
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
          }
        }
      }
      
      console.log('Attempting to logout user with ID:', userId);
      
      // Call the API logout endpoint with the user ID FIRST
      if (userId) {
        // Important: Call the API BEFORE clearing local state
        console.log('Calling authService.logout with userId:', userId);
        await authService.logout(userId);
      } else {
        console.warn('Cannot logout: No user ID available');
      }
      
      // AFTER API call, clear state and localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast.info('You have been logged out');
      
      if (navigate) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear state and localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (navigate) {
        navigate('/login');
      }
    }
  };

  // Helper method to check if user has specified role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.role) return false;
    
    // Handle the case where role might be a string or an object with roleName property
    const userRole = typeof user.role === 'string' 
      ? user.role 
      : (user.role as unknown as RoleType)?.roleName || '';
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  };

  const authValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUserInfo,
    updateUserProfile,
    hasRole,
  };

  console.log('Auth context current state:', { 
    isAuthenticated: !!user && !!token, 
    user, 
    isLoading 
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
