import React, { useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap, Lock, Heart, Globe, ArrowRight } from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';
import { useSEO } from '../utils/seo';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'About NAVIKO — Smart Online Tools & Privacy-First Mission',
    description: 'Learn about NAVIKO: our mission to provide fast, free, and privacy-first online tools for students, professionals, and everyday web users worldwide.',
    canonical: '/about',
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Independent Utility Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About NAVIKO
          </h1>
          <p className="mt-2 text-base text-slate-600 font-medium">
            Smart Tools. Simple Solutions.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
          <p>
            NAVIKO was created with a straightforward purpose: to provide free, high-performance, and completely private online utilities that make everyday calculations, academic workflows, and digital tasks faster and simpler.
          </p>
          <p>
            The modern web is crowded with slow, ad-heavy calculators that force users to register accounts or transmit sensitive personal data to remote servers. NAVIKO is built differently. We prioritize pure client-side processing, immediate performance, and zero intrusive paywalls.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Client-Side Privacy
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your calculations, images, text, and resume details are processed directly in your browser. Nothing is sent to a backend database.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Zero Friction
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                No signups, passwords, or subscriptions. Access any tool instantly on mobile, tablet, or desktop.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 pt-4">Built for Everyone</h2>
          <p>
            Whether you are a student computing semester CGPA, a job candidate crafting an ATS-friendly resume, a developer optimizing raster images, or an everyday user converting measurement units, NAVIKO is designed to be your reliable digital toolbox.
          </p>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Independent online platform • https://naviko.in
            </span>
            <button
              onClick={() => onNavigate('/tools')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <DesktopAdSlot />
        <MobileAdSlot />
      </div>
    </div>
  );
};
