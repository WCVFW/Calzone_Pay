import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api'; // Assuming this is your configured Axios instance
import { AxiosError } from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
  is_active: boolean;
}

interface AuthContextType {
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Function to handle logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Crucial: Clear the Authorization header from the Axios instance
    // This prevents sending stale tokens after logout
    delete api.defaults.headers.common['Authorization'];
    console.log('User logged out. Token and user state cleared.');
  }, []);

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Set Authorization header for this request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me'); // Corrected path
      setUser(response.data);
    } catch (error) {
      console.error('refreshUser error:', error);
      // If refresh fails (e.g., token expired or invalid), log out
      // Check for 401 or 403 specifically to avoid logging out on other API errors
      if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
        console.log('Token invalid or expired. Logging out...');
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]); // Depend on token and logout

  // Function to handle login
  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Immediately try to refresh user after setting new token
    // refreshUser will be called by the useEffect below when token changes
  }, []);

  // Effect to run on component mount and when token changes
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const authContextValue = {
    auth: {
      user,
      token,
      isAuthenticated: !!user,
    },
    login,
    logout,
    refreshUser,
  };

  if (loading) {
    return <div>Loading authentication...</div>; // Or a proper spinner
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};