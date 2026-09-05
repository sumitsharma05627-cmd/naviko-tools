import React, { useEffect } from 'react';
import { FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';
import { useSEO } from '../utils/seo';

export const TermsPage: React.FC = () => {
  useSEO({
    title: 'Terms of Service — NAVIKO',
    description: 'Read the Terms of Service governing the use of NAVIKO free online tools, subscription memberships, intellectual property, and acceptable use.',
    canonical: '/terms',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Usage Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Last Updated: January 2025
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using NAVIKO (https://naviko.in), you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the website.
          </p>

          <h2 className="text-xl font-bold text-slate-900">2. Permitted Use</h2>
          <p>
            NAVIKO grants you a personal, non-exclusive, non-transferable, revocable license to access and use our calculators, text tools, image tools, and educational guides for personal, educational, and commercial productivity purposes.
          </p>

          <h2 className="text-xl font-bold text-slate-900">3. Intellectual Property</h2>
          <p>
            The software interface, branding, tool architectures, and written educational articles on NAVIKO are protected by copyright and intellectual property laws. You retain full ownership and intellectual rights over any content, resumes, or images you process using our tools.
          </p>

          <h2 className="text-xl font-bold text-slate-900">4. Prohibited Activities</h2>
          <p>
            You agree not to attempt to disrupt the website infrastructure, introduce malicious scripts, or reverse engineer proprietary systems.
          </p>

          <h2 className="text-xl font-bold text-slate-900">5. Modifications to the Service</h2>
          <p>
            NAVIKO reserves the right to modify, update, or temporarily discontinue any tool or feature at any time without prior notice.
          </p>
        </div>

        <DesktopAdSlot />
        <MobileAdSlot />
      </div>
    </div>
  );
};
