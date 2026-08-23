import React, { useEffect } from 'react';
import { FileSpreadsheet, ArrowRight, Sparkles, ShieldCheck, Clock, Layers, Scissors, Minimize2, FileImage, Image } from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

interface PdfToolsPageProps {
  onNavigate: (path: string) => void;
}

export const PdfToolsPage: React.FC<PdfToolsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'PDF Tools (Coming Soon) — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const pdfTools = [
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDF documents into one organized file in your preferred order.',
      icon: Layers,
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      description: 'Extract specific page ranges or split large multi-page PDF documents into individual pages.',
      icon: Scissors,
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      description: 'Reduce PDF file size for fast email attachments while maintaining optimal text sharpness.',
      icon: Minimize2,
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF',
      description: 'Convert JPG, PNG, and photo scans into high-quality standardized PDF documents.',
      icon: FileImage,
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      description: 'Convert each page of a PDF document into high-resolution JPG or PNG image files.',
      icon: Image,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Currently in Active Development</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Browser-Based PDF Utilities
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            We are building 100% private, client-side WebAssembly PDF tools with zero server uploads. Coming in our next scheduled release.
          </p>
        </div>

        {/* Coming Soon Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pdfTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>100% Client-Side Engine</span>
                  <span className="font-mono text-[11px]">v1.1 Release</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AdSlot */}
        <DesktopAdSlot className="mb-12" />
        <MobileAdSlot className="mb-8" />

        {/* Privacy Note */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Why We Don't Use Server-Side PDF Converters
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Most online PDF tools upload your sensitive contracts, marksheets, and personal documents to unknown remote servers. At NAVIKO, we are committed to client-only WebAssembly execution so your documents never leave your device.
          </p>
          <button
            onClick={() => onNavigate('/tools')}
            className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Explore Active Working Tools →
          </button>
        </div>
      </div>
    </div>
  );
};
