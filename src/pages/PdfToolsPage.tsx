import React, { useEffect } from 'react';
import {
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  Image as ImageIcon
} from 'lucide-react';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

interface PdfToolsPageProps {
  onNavigate: (path: string) => void;
}

export const PdfToolsPage: React.FC<PdfToolsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'Free Online PDF Tools (100% Private & Browser-Based) — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const pdfTools = [
    {
      id: 'pdf-merge',
      name: 'Merge PDF Files',
      path: '/tools/pdf-merge',
      description: 'Combine multiple PDF documents into one organized file in your preferred order.',
      icon: Layers,
      tag: 'Popular'
    },
    {
      id: 'pdf-compressor',
      name: 'Compress PDF',
      path: '/tools/pdf-compressor',
      description: 'Reduce PDF file size for fast portal uploads and emails while maintaining optimal text sharpness.',
      icon: Minimize2,
      tag: 'Optimized'
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF Converter',
      path: '/tools/jpg-to-pdf',
      description: 'Convert JPG, PNG, and photo scans into high-quality standardized A4/Letter PDF documents.',
      icon: FileImage,
      tag: 'Fast'
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG Converter',
      path: '/tools/pdf-to-jpg',
      description: 'Extract and convert each page of a PDF document into high-resolution JPG pictures.',
      icon: ImageIcon,
      tag: 'High-Res'
    },
    {
      id: 'pdf-split',
      name: 'Split PDF Pages',
      path: '/tools/pdf-split',
      description: 'Extract specific page ranges (e.g., 1-4, 7) or separate large multi-page PDFs into single pages.',
      icon: Scissors,
      tag: 'Instant'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy — Zero Server Uploads</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Free Online PDF Utilities
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Merge, compress, split, and convert PDF documents directly in your browser. Fast, secure, and completely free with no file limits.
          </p>
        </div>

        {/* Active Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pdfTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.path)}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* AdSlot */}
        <DesktopAdSlot className="mb-12" />
        <MobileAdSlot className="mb-8" />

        {/* Privacy Note */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Why NAVIKO PDF Tools Are 100% Secure
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Most online PDF tools upload your sensitive contracts, marksheets, and personal documents to remote cloud servers. At NAVIKO, all PDF processing executes locally in your browser memory using WebAssembly &amp; JavaScript. Your documents never leave your computer or phone.
          </p>
          <button
            onClick={() => onNavigate('/tools')}
            className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Explore All 25+ Tools →
          </button>
        </div>
      </div>
    </div>
  );
};
