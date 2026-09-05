import React from 'react';
import { 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Cpu, 
  FileText,
  Activity
} from 'lucide-react';
import { ToolMeta } from '../types';
import { getStructuredToolExplanation } from '../utils/toolKnowledge';

interface ToolKnowledgeBaseProps {
  tool: ToolMeta;
}

export const ToolKnowledgeBase: React.FC<ToolKnowledgeBaseProps> = ({ tool }) => {
  const explanation = getStructuredToolExplanation(tool);

  return (
    <section 
      aria-labelledby="tool-knowledge-heading"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors space-y-8"
    >
      {/* Section Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h2 id="tool-knowledge-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            About {tool.name} &amp; Complete Guide
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
          Everything you need to know: functionality, methodology, practical use, and limitations.
        </p>
      </div>

      {/* Health Safety Disclaimer Callout (For Health / Diet / BMI tools) */}
      {explanation.healthDisclaimer && (
        <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 p-4 sm:p-5 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1">
            <h3 className="font-bold text-amber-950 dark:text-amber-100">
              Important Health &amp; Safety Notice
            </h3>
            <p className="leading-relaxed">
              {explanation.healthDisclaimer}
            </p>
          </div>
        </div>
      )}

      {/* 1. What is this tool & What does it do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3>What is this tool?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {explanation.whatItIs}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3>What does it calculate or do?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {explanation.whatItDoes}
          </p>
        </div>
      </div>

      {/* 2. Who is it useful for & How it works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3>Who is it useful for?</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {explanation.whoItIsFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3>How does it work?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {explanation.howItWorks}
          </p>
        </div>
      </div>

      {/* 3. What do the results mean? */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3>What do the results mean?</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {explanation.resultsMeaning}
        </p>
      </div>

      {/* 4. Important limitations */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3>Important limitations &amp; notes</h3>
        </div>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {explanation.limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
