import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Users,
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { safeApiFetch } from '../services/apiClient';

interface WaitlistPageProps {
  onNavigate: (path: string) => void;
}

interface EarlyAccessStatus {
  totalCapacity: number;
  enrolledCount: number;
  remainingSpots: number;
  isWaitlistOpen: boolean;
  isFull: boolean;
}

export const WaitlistPage: React.FC<WaitlistPageProps> = ({ onNavigate }) => {
  const [status, setStatus] = useState<EarlyAccessStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    primaryInterest: 'Nutrition & Meal Planning',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await safeApiFetch<any>('/api/early-access/status');
        if (res.ok && res.data?.success) {
          setStatus(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch early access status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await safeApiFetch<any>('/api/waitlist/join', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.ok && res.data?.success) {
        setSubmittedEntry(res.data.entry);
      } else {
        setErrorMessage(res.data?.error || res.error || 'Failed to submit waitlist registration.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred while joining waitlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to NAVIKO</span>
        </button>

        {submittedEntry ? (
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Waitlist Registration Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                You're on the Priority List!
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Thank you for applying for NAVIKO Early Access. Your registration is recorded under priority ID:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 inline-block">
              {submittedEntry.id} • {submittedEntry.email}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('/')}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Explore Public Tools
              </button>
              <button
                onClick={() => onNavigate('/pricing')}
                className="py-2.5 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
              >
                View Membership Plans
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Priority Early-Access Program</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Join the NAVIKO Early-Access Waitlist
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                NAVIKO operates a strictly capacity-controlled membership model to ensure high-speed computing, privacy protection, and dedicated support for every member.
              </p>
            </div>

            {/* Real Capacity Tracker */}
            {status && (
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Official Program Capacity
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {status.enrolledCount} of {status.totalCapacity} places enrolled
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span
                    className={`inline-block text-xs font-black px-3 py-1 rounded-full ${
                      status.remainingSpots > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {status.remainingSpots > 0
                      ? `${status.remainingSpots} Spots Remaining`
                      : 'At Capacity • Waitlist Active'}
                  </span>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Profession / Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Student">Student (University / High School)</option>
                    <option value="Professional">Working Professional / Tech</option>
                    <option value="Freelancer">Freelancer / Creator</option>
                    <option value="Nutritionist">Nutritionist / Dietitian</option>
                    <option value="Fitness">Fitness Coach / Athlete</option>
                    <option value="Family">Family Health Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Interest in NAVIKO
                  </label>
                  <select
                    value={formData.primaryInterest}
                    onChange={(e) => setFormData({ ...formData, primaryInterest: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Nutrition & Meal Planning">Indian Food Nutrition &amp; Meal Planner</option>
                    <option value="Ayurveda & Habits">Evidence-Aware Ayurveda &amp; Habits</option>
                    <option value="Productivity & Calculators">46+ All-in-One Tools Suite</option>
                    <option value="Finance & Compounding">Finance Calculators &amp; Budgeting</option>
                    <option value="Complete Platform">All Features (NAVIKO 1.0 &amp; 2.0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  How do you plan to use NAVIKO? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Share what specific goals or projects you are working on..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-wide shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Application...' : 'Request Priority Early-Access'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>No spam. Your email is only used for account access and approval notifications.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
