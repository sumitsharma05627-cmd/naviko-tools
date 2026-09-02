import { getApiUrl } from '../config/api';

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
      const res = await fetch(getApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, anonymousUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed.' };
      }
      return data;
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
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe, anonymousUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email or password.' };
      }
      return data;
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

      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Session expired.' };
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error fetching profile.' };
    }
  }

  public async logout(token?: string | null): Promise<void> {
    try {
      const headers = this.getAuthHeaders(token);
      await fetch(getApiUrl('/api/auth/logout'), {
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
      const res = await fetch(getApiUrl('/api/auth/logout-all'), {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to logout from all devices.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error revoking sessions.' };
    }
  }

  public async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to generate reset link.' };
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error requesting password reset.' };
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }
      return data;
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
      const res = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update profile.' };
      }
      return { success: true, user: resData.user };
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
      const res = await fetch(getApiUrl('/api/auth/change-password'), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error changing password.' };
    }
  }

  public async recordRecentTool(toolId: string, token?: string | null): Promise<string[]> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(getApiUrl('/api/user/recent-tools'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ toolId }),
      });
      const data = await res.json();
      return data.recentTools || [toolId];
    } catch {
      return [toolId];
    }
  }

  public async getRecentTools(token?: string | null): Promise<string[]> {
    try {
      const headers = this.getAuthHeaders(token);
      const res = await fetch(getApiUrl('/api/user/recent-tools'), { headers });
      const data = await res.json();
      return data.recentTools || [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
