import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Copy, Check, Info, Calculator, Award } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  gradePoint: string; // e.g. "9" or "8.5"
  credit: string; // e.g. "4"
}

export const CgpaCalculator: React.FC = () => {
  const [conversionType, setConversionType] = useState<'cbse' | 'ten' | 'custom'>('cbse');
  const [customMultiplier, setCustomMultiplier] = useState<string>('9.5');
  const [copied, setCopied] = useState<boolean>(false);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics / Computing', gradePoint: '9', credit: '4' },
    { id: '2', name: 'Data Structures & Algorithms', gradePoint: '10', credit: '4' },
    { id: '3', name: 'Digital Logic Systems', gradePoint: '8.5', credit: '3' },
    { id: '4', name: 'Technical Communication', gradePoint: '9', credit: '2' },
    { id: '5', name: 'Physics / Engineering Lab', gradePoint: '8', credit: '3' },
  ]);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: `Subject ${subjects.length + 1}`,
        gradePoint: '',
        credit: '3'
      }
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleReset = () => {
    setSubjects([
      { id: '1', name: 'Subject 1', gradePoint: '', credit: '4' },
      { id: '2', name: 'Subject 2', gradePoint: '', credit: '3' },
      { id: '3', name: 'Subject 3', gradePoint: '', credit: '3' },
      { id: '4', name: 'Subject 4', gradePoint: '', credit: '2' },
    ]);
  };

  // Calculate SGPA/CGPA
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let validCount = 0;

  subjects.forEach((s) => {
    const gp = parseFloat(s.gradePoint);
    const cr = parseFloat(s.credit) || 1;
    if (!isNaN(gp) && gp >= 0 && gp <= 10) {
      totalWeightedPoints += gp * cr;
      totalCredits += cr;
      validCount++;
    }
  });

  const cgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

  // Percentage conversion
  let multiplier = 9.5;
  if (conversionType === 'ten') multiplier = 10.0;
  if (conversionType === 'custom') {
    const parsed = parseFloat(customMultiplier);
    multiplier = isNaN(parsed) ? 9.5 : parsed;
  }

  const percentage = cgpa * multiplier;

  const handleCopy = () => {
    if (cgpa > 0) {
      const summary = `CGPA / SGPA: ${cgpa.toFixed(2)} | Equivalent Percentage: ${percentage.toFixed(2)}% (Formula: CGPA × ${multiplier})`;
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-900">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Institution Grading Note:</strong> Most Indian universities and CBSE use the <strong>9.5 multiplier</strong> (Percentage = CGPA × 9.5). Some international colleges use 10.0 or institution-specific scales. You can toggle the formula multiplier below anytime.
        </div>
      </div>

      {/* Conversion Standard Selector */}
      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Percentage Conversion Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setConversionType('cbse')}
            className={`p-3 rounded-xl text-left border text-xs sm:text-sm transition-all ${
              conversionType === 'cbse'
                ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600 font-semibold text-indigo-950'
                : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>CBSE / Standard (× 9.5)</span>
              {conversionType === 'cbse' && <Award className="w-4 h-4 text-indigo-600" />}
            </div>
            <span className="text-[11px] text-slate-500 font-normal mt-1 block">
              Standard for CBSE, AICTE &amp; VTU
            </span>
          </button>

          <button
            onClick={() => setConversionType('ten')}
            className={`p-3 rounded-xl text-left border text-xs sm:text-sm transition-all ${
              conversionType === 'ten'
                ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600 font-semibold text-indigo-950'
                : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Direct Scale (× 10.0)</span>
              {conversionType === 'ten' && <Award className="w-4 h-4 text-indigo-600" />}
            </div>
            <span className="text-[11px] text-slate-500 font-normal mt-1 block">
              Direct linear 10-point scale
            </span>
          </button>

          <button
            onClick={() => setConversionType('custom')}
            className={`p-3 rounded-xl text-left border text-xs sm:text-sm transition-all ${
              conversionType === 'custom'
                ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600 font-semibold text-indigo-950'
                : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Custom Multiplier</span>
              {conversionType === 'custom' && <Award className="w-4 h-4 text-indigo-600" />}
            </div>
            <span className="text-[11px] text-slate-500 font-normal mt-1 block">
              Specify your college's multiplier
            </span>
          </button>
        </div>

        {conversionType === 'custom' && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Enter custom multiplier:</span>
            <input
              type="number"
              step="0.01"
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(e.target.value)}
              className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. 9.0"
            />
          </div>
        )}
      </div>

      {/* Subjects Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            Subject &amp; Grade Points
          </h3>
          <span className="text-xs text-slate-500">
            {subjects.length} subjects added
          </span>
        </div>

        <div className="space-y-2">
          {subjects.map((sub, idx) => (
            <div
              key={sub.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                  placeholder="Subject name (e.g. Algorithms)"
                  className="w-full text-xs sm:text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-1/2 sm:w-32">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={sub.gradePoint}
                    onChange={(e) => updateSubject(sub.id, 'gradePoint', e.target.value)}
                    placeholder="Grade (0-10)"
                    className="w-full text-xs sm:text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-900"
                  />
                </div>

                <div className="w-1/2 sm:w-28">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="20"
                    value={sub.credit}
                    onChange={(e) => updateSubject(sub.id, 'credit', e.target.value)}
                    placeholder="Credits"
                    className="w-full text-xs sm:text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-900"
                  />
                </div>

                <button
                  onClick={() => removeSubject(sub.id)}
                  disabled={subjects.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg hover:bg-rose-50 transition-colors"
                  aria-label="Remove subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add and Reset Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={addSubject}
            className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        </div>
      </div>

      {/* Results Box */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
              Calculated Academic Performance
            </div>

            <div className="flex flex-wrap items-baseline gap-6 mt-3">
              <div>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {validCount > 0 ? cgpa.toFixed(2) : '--'}
                </div>
                <div className="text-xs text-indigo-200 font-medium mt-1 uppercase tracking-wider">
                  CGPA / SGPA
                </div>
              </div>

              <div className="h-10 w-px bg-white/20 hidden sm:block"></div>

              <div>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-emerald-400">
                  {validCount > 0 ? `${percentage.toFixed(2)}%` : '--'}
                </div>
                <div className="text-xs text-indigo-200 font-medium mt-1 uppercase tracking-wider">
                  Equivalent Percentage (×{multiplier})
                </div>
              </div>
            </div>

            <div className="text-xs text-indigo-200 mt-4 font-mono">
              Total Credits: {totalCredits} • Evaluated Subjects: {validCount} of {subjects.length}
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleCopy}
              disabled={validCount === 0}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Summary!' : 'Copy CGPA Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
