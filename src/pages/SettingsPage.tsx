import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, LogOut, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, changePassword, logoutAll, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm text-slate-500">Please sign in to access account settings.</p>
          <button
            onClick={() => onNavigate('/login?redirect=/settings')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess(res.message || 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Failed to change password.');
      }
    } catch {
      setPasswordError('An unexpected network error occurred.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to sign out from all devices? You will need to log back in.')) {
      return;
    }

    setIsLoggingOutAll(true);
    try {
      const res = await logoutAll();
      if (res.success) {
        onNavigate('/login');
      } else {
        setSessionMessage(res.error || 'Failed to revoke sessions.');
      }
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account Security & Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your credentials and manage active sessions across your devices.
          </p>
        </div>

        {/* Change Password Section */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                New Password <span className="normal-case font-normal text-slate-400">(min. 8 characters)</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? 'Hide password characters' : 'Show password characters'}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* Sessions Section */}
        <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Sessions</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            If you suspect unauthorized access or are logging out of a shared public workstation, you can invalidate all existing tokens across all browsers immediately.
          </p>

          {sessionMessage && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {sessionMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900/60 cursor-pointer transition-all disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOutAll ? 'Revoking sessions...' : 'Sign Out of All Devices'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
