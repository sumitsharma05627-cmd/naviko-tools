import { getApiUrl } from '../config/api';
import { safeApiFetch } from './apiClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  recentTools: string[];
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    emailNotifications?: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  subscription?: any;
  error?: string;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  resetLink?: string;
  error?: string;
}

class AuthService {
  private getAuthHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('naviko_auth_token') : null);
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  public async signup(
    name: string,
    email: string,
    password: string,
    anonymousUserId?: string
  ): Promise<AuthResponse> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await safeApiFetch<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password, anonymousUserId }),
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.data?.error || res.error || 'Registration failed.' };
      }
      return res.data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network connection error during registration.' };
    }
  }

  public async login(
    email: string,
    password: string,
    rememberMe = true,
    anonymousUserId?: string
  ): Promise<AuthResponse> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await safeApiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, rememberMe, anonymousUserId }),
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.data?.error || res.error || 'Incorrect email or password.' };
      }
      return res.data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network connection error during login.' };
    }
  }

  public async getCurrentUser(token?: string | null): Promise<AuthResponse> {
    try {
      const headers = this.getAuthHeaders(token);
      if (!headers['Authorization']) {
        return { success: false, error: 'No active session token' };
      }

      const res = await safeApiFetch<AuthResponse>('/api/auth/me', {
        headers,
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || res.data?.error || 'Session expired.' };
      }
      return res.data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error fetching profile.' };
    }
  }

  public async logout(token?: string | null): Promise<void> {
    try {
      const headers = this.getAuthHeaders(token);
      await safeApiFetch('/api/auth/logout', {
        method: 'POST',
        headers,
      });
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
  }

  public async logoutAll(token?: string | null): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await safeApiFetch<{ success: boolean; message?: string; error?: string }>('/api/auth/logout-all', {
        method: 'POST',
        headers,
      });
      if (!res.ok || !res.data) {
        return { success: false, error: res.error || res.data?.error || 'Failed to logout from all devices.' };
      }
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error revoking sessions.' };
    }
  }

  public async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const res = await safeApiFetch<ForgotPasswordResponse>('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok || !res.data) {
        return { success: false, message: res.error || (res.data as any)?.error || 'Failed to generate reset link.' };
      }
      return res.data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error requesting password reset.' };
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const res = await safeApiFetch<AuthResponse>('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || res.data?.error || 'Failed to reset password.' };
      }
      return res.data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during password reset.' };
    }
  }

  public async updateProfile(
    data: { name?: string; preferences?: any },
    token?: string | null
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await safeApiFetch<{ success: boolean; user?: AuthUser; error?: string }>('/api/auth/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || res.data?.error || 'Failed to update profile.' };
      }
      return { success: true, user: res.data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating profile.' };
    }
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    token?: string | null
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await safeApiFetch<{ success: boolean; message?: string; error?: string }>('/api/auth/change-password', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || res.data?.error || 'Failed to change password.' };
      }
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error changing password.' };
    }
  }

  public async recordRecentTool(toolId: string, token?: string | null): Promise<string[]> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await safeApiFetch<{ recentTools?: string[] }>('/api/user/recent-tools', {
        method: 'POST',
        headers,
        body: JSON.stringify({ toolId }),
      });
      return res.data?.recentTools || [toolId];
    } catch {
      return [toolId];
    }
  }

  public async getRecentTools(token?: string | null): Promise<string[]> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await safeApiFetch<{ recentTools?: string[] }>('/api/user/recent-tools', { headers });
      return res.data?.recentTools || [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
