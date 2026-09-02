import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  recentTools: string[];
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (data: { name?: string; preferences?: any }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  recordToolUsage: (toolId: string) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naviko_auth_token');
    }
    return null;
  });

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('naviko_recent_tools');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Verify and fetch authenticated user profile on mount
  const refreshAuth = useCallback(async () => {
    const activeToken = typeof window !== 'undefined' ? localStorage.getItem('naviko_auth_token') : token;
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser(activeToken);
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.recentTools && res.user.recentTools.length > 0) {
          setRecentTools(res.user.recentTools);
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_uid', res.user.id);
          localStorage.setItem('naviko_user_email', res.user.email);
        }
      } else {
        // Token invalid or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem('naviko_auth_token');
        }
        setToken(null);
        setUser(null);
      }
    } catch {
      // Network or offline: keep last known state if available or fallback
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Login handler
  const login = useCallback(
    async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const anonymousUserId = typeof window !== 'undefined' ? localStorage.getItem('naviko_uid') || undefined : undefined;
        const res = await authService.login(email, password, rememberMe, anonymousUserId);

        if (res.success && res.token && res.user) {
          setToken(res.token);
          setUser(res.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('naviko_auth_token', res.token);
            localStorage.setItem('naviko_uid', res.user.id);
            localStorage.setItem('naviko_user_email', res.user.email);
            if (res.user.recentTools) {
              localStorage.setItem('naviko_recent_tools', JSON.stringify(res.user.recentTools));
              setRecentTools(res.user.recentTools);
            }
          }
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: res.error || 'Invalid credentials' };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Login failed.' };
      }
    },
    []
  );

  // Signup handler
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const anonymousUserId = typeof window !== 'undefined' ? localStorage.getItem('naviko_uid') || undefined : undefined;
        const res = await authService.signup(name, email, password, anonymousUserId);

        if (res.success && res.token && res.user) {
          setToken(res.token);
          setUser(res.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('naviko_auth_token', res.token);
            localStorage.setItem('naviko_uid', res.user.id);
            localStorage.setItem('naviko_user_email', res.user.email);
          }
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: res.error || 'Registration failed' };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Signup error.' };
      }
    },
    []
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('naviko_auth_token');
      }
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Logout All devices handler
  const logoutAll = useCallback(async () => {
    try {
      const res = await authService.logoutAll(token);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('naviko_auth_token');
      }
      setToken(null);
      setUser(null);
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to logout from all devices.' };
    }
  }, [token]);

  // Update profile handler
  const updateProfile = useCallback(
    async (data: { name?: string; preferences?: any }) => {
      const res = await authService.updateProfile(data, token);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [token]
  );

  // Change password handler
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      return await authService.changePassword(currentPassword, newPassword, token);
    },
    [token]
  );

  // Record tool usage
  const recordToolUsage = useCallback(
    (toolId: string) => {
      setRecentTools((prev) => {
        const filtered = prev.filter((id) => id !== toolId);
        const updated = [toolId, ...filtered].slice(0, 12);
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_recent_tools', JSON.stringify(updated));
        }
        return updated;
      });

      if (token) {
        authService.recordRecentTool(toolId, token).catch(() => {});
      }
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        recentTools,
        login,
        signup,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        recordToolUsage,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
