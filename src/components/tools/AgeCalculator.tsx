import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, Gift, RotateCcw, Copy, Check } from 'lucide-react';

export const AgeCalculator: React.FC = () => {
  const [dob, setDob] = useState<string>('2000-01-15');
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateAge = () => {
    if (!dob || !asOfDate) return null;

    const [bY, bM, bD] = dob.split('-').map(Number);
    const [tY, tM, tD] = asOfDate.split('-').map(Number);

    if (!bY || !bM || !bD || !tY || !tM || !tD) return null;

    const birthDate = new Date(bY, bM - 1, bD);
    const targetDate = new Date(tY, tM - 1, tD);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return null;
    if (birthDate > targetDate) {
      return { isFuture: true };
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total metrics
    const diffTime = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next birthday calculation
    const currentYear = targetDate.getFullYear();
    let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (nextBday < targetDate) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const nextBdayDiff = nextBday.getTime() - targetDate.getTime();
    const daysToNextBday = Math.ceil(nextBdayDiff / (1000 * 60 * 60 * 24));

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDayName = daysOfWeek[birthDate.getDay()];
    const nextBdayDayName = daysOfWeek[nextBday.getDay()];

    return {
      isFuture: false,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysToNextBday,
      nextBdayDate: nextBday.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
      bornDayName,
      nextBdayDayName
    };
  };

  const results = calculateAge();

  const handleCopySummary = () => {
    if (results && !results.isFuture) {
      const text = `Age: ${results.years} Years, ${results.months} Months, ${results.days} Days (${results.totalDays.toLocaleString()} total days). Next birthday in ${results.daysToNextBday} days!`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            Date of Birth (DOB)
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Age as of Date (Today)
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setDob('2000-01-01');
            setAsOfDate(new Date().toISOString().split('T')[0]);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Dates
        </button>

        {results && !results.isFuture && (
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        )}
      </div>

      {/* Main Results Display */}
      {results?.isFuture ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-medium">
          Date of birth cannot be in the future relative to the comparison date.
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* Highlight Cards */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
            <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-2">
              Primary Age Summary
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center sm:text-left mt-4">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-2xl sm:text-4xl font-extrabold text-white">
                  {results.years}
                </div>
                <div className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
                  Years
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-2xl sm:text-4xl font-extrabold text-white">
                  {results.months}
                </div>
                <div className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
                  Months
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-2xl sm:text-4xl font-extrabold text-white">
                  {results.days}
                </div>
                <div className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
                  Days
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-indigo-200 mt-4 font-medium text-center sm:text-left">
              You are exactly <strong className="text-white">{results.years} years, {results.months} months, and {results.days} days</strong> old.
            </p>
          </div>

          {/* Secondary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Next Birthday */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Next Birthday
                </div>
                <div className="text-xl font-extrabold text-amber-950 mt-0.5">
                  {results.daysToNextBday === 0 ? 'Today! 🎂' : `${results.daysToNextBday} Days Left`}
                </div>
                <div className="text-xs text-amber-800 mt-1">
                  {results.nextBdayDate} ({results.nextBdayDayName})
                </div>
              </div>
            </div>

            {/* Total Days Lived */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Total Lived Time
                </div>
                <div className="text-xl font-extrabold text-indigo-950 mt-0.5">
                  {results.totalDays.toLocaleString()} Days
                </div>
                <div className="text-xs text-indigo-700 mt-1">
                  ≈ {results.totalWeeks.toLocaleString()} weeks or {results.totalHours.toLocaleString()} hours
                </div>
              </div>
            </div>

            {/* Born Day */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-3.5 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Born On
                </div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">
                  {results.bornDayName}
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  Day of the week of birth
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
