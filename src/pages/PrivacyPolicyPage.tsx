import React, { useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, FileCheck } from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';
import { useSEO } from '../utils/seo';

export const PrivacyPolicyPage: React.FC = () => {
  useSEO({
    title: 'Privacy Policy — NAVIKO Zero-Storage Architecture',
    description: 'Review the NAVIKO Privacy Policy. Learn about our privacy-first design, client-side processing, cookie usage, and zero personal data retention commitments.',
    canonical: '/privacy-policy',
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Storage Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Last Updated: January 2025 • Effective Immediately
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
              <strong>The NAVIKO Privacy Commitment:</strong> We do not store, harvest, sell, or transmit your calculation numbers, uploaded images, resumes, or typed texts to remote servers. All operations execute strictly in your browser's local sandbox memory.
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900">1. Information We Do Not Collect</h2>
          <p>
            When using NAVIKO’s tools (including Percentage Calculator, Age Calculator, CGPA Calculator, Unit Converter, Word &amp; Character Counter, Image Compressor, Image Resizer, QR Code Generator, Typing Speed Test, and Resume Builder), your input data is processed 100% locally in your client environment. We do not maintain server databases of user calculations or uploaded files.
          </p>

          <h2 className="text-xl font-bold text-slate-900">2. Local Browser Storage</h2>
          <p>
            Certain interactive tools, such as the Resume Builder, utilize your browser's standard <code>localStorage</code> API so you do not lose your draft when refreshing your browser. This information never leaves your personal device and can be cleared at any time by clicking "Clear" or clearing your browser cookies and site data.
          </p>

          <h2 className="text-xl font-bold text-slate-900">3. Analytics &amp; Advertisements</h2>
          <p>
            NAVIKO may display non-intrusive banner advertisements or utilize privacy-conscious traffic analytics to monitor uptime, aggregate visitor metrics, and maintain free server hosting. These providers may use standard anonymized browser cookies to serve relevant ads according to applicable privacy standards (e.g., Google AdSense policies).
          </p>

          <h2 className="text-xl font-bold text-slate-900">4. Third-Party Links</h2>
          <p>
            Our website and educational blog articles may contain links to external reference websites or resources. We are not responsible for the privacy practices or content of third-party domains.
          </p>

          <h2 className="text-xl font-bold text-slate-900">5. Contact Us Regarding Privacy</h2>
          <p>
            If you have questions or inquiries regarding our privacy standards, please reach out via our contact page at <code>https://naviko.in/contact</code>.
          </p>
        </div>

        <DesktopAdSlot />
        <MobileAdSlot />
      </div>
    </div>
  );
};
