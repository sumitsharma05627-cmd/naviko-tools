import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

export const DisclaimerPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Disclaimer — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Legal Disclaimer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Disclaimer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Please review the following disclaimers regarding calculator outputs and educational materials.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              All tools, calculators, algorithms, and articles on NAVIKO are provided for general informational, educational, and productivity purposes only.
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900">1. Accuracy of Calculations</h2>
          <p>
            While every effort is made to ensure that all formulas (such as percentage calculations, age chronologies, unit conversions, and university CGPA models) follow standard mathematical conventions, NAVIKO makes no warranties regarding the absolute precision for formal legal, financial, or statutory submissions.
          </p>

          <h2 className="text-xl font-bold text-slate-900">2. Academic &amp; University Standards</h2>
          <p>
            Different educational boards and institutions may use varying conversion multipliers for CGPA/GPA calculations (e.g. CBSE 9.5 factor vs Mumbai University 7.1 vs US 4.0 scale). Users should verify institution-specific formulas with their academic registrar.
          </p>

          <h2 className="text-xl font-bold text-slate-900">3. No Professional Advice</h2>
          <p>
            The content and tools available on NAVIKO do not constitute official financial, legal, medical, or academic advice. You should consult certified professionals for specialized requirements.
          </p>

          <h2 className="text-xl font-bold text-slate-900">4. Limitation of Liability</h2>
          <p>
            Under no circumstances shall NAVIKO or its developers be held liable for any direct, indirect, incidental, or consequential damages resulting from the use of or inability to use the tools or materials provided on this platform.
          </p>
        </div>

        <DesktopAdSlot />
        <MobileAdSlot />
      </div>
    </div>
  );
};
