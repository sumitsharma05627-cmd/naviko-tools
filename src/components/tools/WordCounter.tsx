import React, { useState } from 'react';
import { Copy, Check, RotateCcw, FileText, AlignLeft, Clock, Mic, Sparkles } from 'lucide-react';

export const WordCounter: React.FC = () => {
  const [text, setText] = useState<string>(
    'NAVIKO provides smart, free online tools designed for students, job seekers, creators, and everyday productivity. Everything runs locally in your browser for absolute speed and privacy.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Statistics Calculations
  const trimmed = text.trim();
  const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = wordsArray.length;

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

  // Reading time (average 200 words per minute)
  const readingTimeMin = (wordCount / 200).toFixed(1);
  // Speaking time (average 130 words per minute)
  const speakingTimeMin = (wordCount / 130).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  // Case transforms
  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(
      text
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
    );
  };
  const removeExtraSpaces = () => {
    setText(text.replace(/\s+/g, ' ').trim());
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
            {wordCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mt-1">
            Words
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {charCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">
            Characters
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {charCountNoSpaces.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">
            No Spaces
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {sentences.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">
            Sentences
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {paragraphs.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">
            Paragraphs
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {readingTimeMin}m
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1">
            Read Time
          </div>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative">
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here to inspect real-time word count, characters, sentences, and estimated reading time..."
          className="w-full text-sm sm:text-base p-4 sm:p-5 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 leading-relaxed resize-y shadow-xs"
        />
      </div>

      {/* Action and Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">
            Transform:
          </span>
          <button
            onClick={toUppercase}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
          >
            UPPERCASE
          </button>
          <button
            onClick={toLowercase}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
          >
            lowercase
          </button>
          <button
            onClick={toTitleCase}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
          >
            Title Case
          </button>
          <button
            onClick={removeExtraSpaces}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
          >
            Clean Spaces
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={!text}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-4 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 rounded-xl border border-indigo-100 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>

      {/* Speaking vs Reading Duration details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estimated Silent Reading
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              ≈ {readingTimeMin} min (based on 200 WPM)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estimated Speech / Presentation
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              ≈ {speakingTimeMin} min (based on 130 WPM speech)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
