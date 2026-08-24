import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, Award, Plus, Trash2, CheckCircle2, 
  Sparkles, Download, Printer, Share2, RotateCcw, Check, 
  AlertCircle, Target, ArrowRight, Copy, HelpCircle, FileText,
  Sliders, Calendar, BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface SubjectMark {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
}

interface MockTestEntry {
  id: string;
  testName: string;
  date: string;
  totalMarks: number;
  score: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unattempted?: number;
  subjectScores?: SubjectMark[];
  notes?: string;
}

const SAMPLE_TESTS: MockTestEntry[] = [
  {
    id: 'test-1',
    testName: 'Mock 1 (Part Syllabus)',
    date: '2026-01-15',
    totalMarks: 720,
    score: 420,
    correctAnswers: 115,
    incorrectAnswers: 40,
    unattempted: 25,
    subjectScores: [
      { subjectName: 'Physics', marksObtained: 85, maxMarks: 180 },
      { subjectName: 'Chemistry', marksObtained: 110, maxMarks: 180 },
      { subjectName: 'Biology', marksObtained: 225, maxMarks: 360 }
    ],
    notes: 'Struggled with rotational physics and physical chemistry calculation time.'
  },
  {
    id: 'test-2',
    testName: 'Mock 2 (Part Syllabus)',
    date: '2026-01-28',
    totalMarks: 720,
    score: 450,
    correctAnswers: 122,
    incorrectAnswers: 38,
    unattempted: 20,
    subjectScores: [
      { subjectName: 'Physics', marksObtained: 95, maxMarks: 180 },
      { subjectName: 'Chemistry', marksObtained: 120, maxMarks: 180 },
      { subjectName: 'Biology', marksObtained: 235, maxMarks: 360 }
    ],
    notes: 'Improved chemistry kinetics. Still negative marks in physics electrostatics.'
  },
  {
    id: 'test-3',
    testName: 'Mock 3 (Semi-Full)',
    date: '2026-02-10',
    totalMarks: 720,
    score: 472,
    correctAnswers: 128,
    incorrectAnswers: 40,
    unattempted: 12,
    subjectScores: [
      { subjectName: 'Physics', marksObtained: 102, maxMarks: 180 },
      { subjectName: 'Chemistry', marksObtained: 125, maxMarks: 180 },
      { subjectName: 'Biology', marksObtained: 245, maxMarks: 360 }
    ],
    notes: 'Accuracy improved in biology. Need to cut silly mistakes.'
  },
  {
    id: 'test-4',
    testName: 'Mock 4 (Full Syllabus)',
    date: '2026-02-22',
    totalMarks: 720,
    score: 490,
    correctAnswers: 132,
    incorrectAnswers: 38,
    unattempted: 10,
    subjectScores: [
      { subjectName: 'Physics', marksObtained: 110, maxMarks: 180 },
      { subjectName: 'Chemistry', marksObtained: 130, maxMarks: 180 },
      { subjectName: 'Biology', marksObtained: 250, maxMarks: 360 }
    ],
    notes: 'Completed entire paper with 15 minutes left for review.'
  }
];

export const MockTestAnalyzer: React.FC = () => {
  const [tests, setTests] = useState<MockTestEntry[]>(() => {
    const saved = localStorage.getItem('naviko_mock_tests');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return SAMPLE_TESTS;
  });

  const [activeTab, setActiveTab] = useState<'trends' | 'analytics' | 'history'>('trends');
  const [copied, setCopied] = useState<boolean>(false);

  // New Test Modal / Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [testName, setTestName] = useState<string>('Mock Test ' + (tests.length + 1));
  const [testDate, setTestDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState<number>(720);
  const [score, setScore] = useState<number>(510);
  const [correctAnswers, setCorrectAnswers] = useState<number>(135);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(30);
  const [unattempted, setUnattempted] = useState<number>(15);
  const [sub1Name, setSub1Name] = useState<string>('Physics');
  const [sub1Marks, setSub1Marks] = useState<number>(115);
  const [sub1Max, setSub1Max] = useState<number>(180);
  const [sub2Name, setSub2Name] = useState<string>('Chemistry');
  const [sub2Marks, setSub2Marks] = useState<number>(135);
  const [sub2Max, setSub2Max] = useState<number>(180);
  const [sub3Name, setSub3Name] = useState<string>('Biology');
  const [sub3Marks, setSub3Marks] = useState<number>(260);
  const [sub3Max, setSub3Max] = useState<number>(360);
  const [testNotes, setTestNotes] = useState<string>('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('naviko_mock_tests', JSON.stringify(tests));
  }, [tests]);

  // Handle Add Test
  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MockTestEntry = {
      id: 'test-' + Date.now(),
      testName: testName.trim() || 'Mock Test ' + (tests.length + 1),
      date: testDate,
      totalMarks: Math.max(1, totalMarks),
      score: Math.max(0, score),
      correctAnswers: correctAnswers ? Math.max(0, correctAnswers) : undefined,
      incorrectAnswers: incorrectAnswers ? Math.max(0, incorrectAnswers) : undefined,
      unattempted: unattempted ? Math.max(0, unattempted) : undefined,
      subjectScores: [
        { subjectName: sub1Name, marksObtained: sub1Marks, maxMarks: sub1Max },
        { subjectName: sub2Name, marksObtained: sub2Marks, maxMarks: sub2Max },
        { subjectName: sub3Name, marksObtained: sub3Marks, maxMarks: sub3Max }
      ].filter(s => s.subjectName.trim() !== ''),
      notes: testNotes.trim() || undefined
    };

    setTests([...tests, newEntry]);
    setShowAddForm(false);
    setTestName('Mock Test ' + (tests.length + 2));
    setTestNotes('');
  };

  // Remove test
  const handleRemoveTest = (id: string) => {
    setTests(tests.filter(t => t.id !== id));
  };

  // Reset to sample data
  const handleResetToSample = () => {
    setTests(SAMPLE_TESTS);
  };

  // Calculations & Analytics
  const analytics = useMemo(() => {
    if (tests.length === 0) {
      return null;
    }

    const scores = tests.map(t => t.score);
    const percentages = tests.map(t => Math.round((t.score / (t.totalMarks || 1)) * 100 * 10) / 10);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const averagePercentage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Latest Test vs Previous Test Improvement
    const latestTest = tests[tests.length - 1];
    const previousTest = tests.length > 1 ? tests[tests.length - 2] : null;
    const latestImprovement = previousTest ? latestTest.score - previousTest.score : 0;
    const totalGrowth = tests.length > 1 ? latestTest.score - tests[0].score : 0;

    // Trend description
    let trendVerdict = 'Your scores are steady.';
    let trendStatus: 'up' | 'down' | 'stable' = 'stable';

    if (tests.length > 1) {
      if (latestImprovement > 0 && totalGrowth > 0) {
        trendVerdict = 'Your score is trending upward. Great momentum!';
        trendStatus = 'up';
      } else if (latestImprovement < 0) {
        trendVerdict = 'Your recent score has decreased. Review your recent mistakes and weak topics.';
        trendStatus = 'down';
      }
    }

    // Accuracy & Attempt Rate Analytics
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;
    let hasAttemptData = false;

    tests.forEach(t => {
      if (t.correctAnswers !== undefined && t.incorrectAnswers !== undefined) {
        hasAttemptData = true;
        totalCorrect += t.correctAnswers;
        totalIncorrect += t.incorrectAnswers;
        totalUnattempted += (t.unattempted || 0);
      }
    });

    const averageAccuracy = (totalCorrect + totalIncorrect) > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100 * 10) / 10
      : 0;

    const totalQuestionsAll = totalCorrect + totalIncorrect + totalUnattempted;
    const averageAttemptRate = totalQuestionsAll > 0
      ? Math.round(((totalCorrect + totalIncorrect) / totalQuestionsAll) * 100 * 10) / 10
      : 0;

    // Subject Performance Aggregates
    const subjectMap: Record<string, { totalObtained: number; totalMax: number; count: number }> = {};
    tests.forEach(t => {
      t.subjectScores?.forEach(s => {
        if (!subjectMap[s.subjectName]) {
          subjectMap[s.subjectName] = { totalObtained: 0, totalMax: 0, count: 0 };
        }
        subjectMap[s.subjectName].totalObtained += s.marksObtained;
        subjectMap[s.subjectName].totalMax += s.maxMarks;
        subjectMap[s.subjectName].count += 1;
      });
    });

    const subjectStats = Object.keys(subjectMap).map(name => {
      const data = subjectMap[name];
      const avgPct = data.totalMax > 0 ? Math.round((data.totalObtained / data.totalMax) * 100 * 10) / 10 : 0;
      return {
        subjectName: name,
        percentage: avgPct,
        totalObtained: data.totalObtained,
        totalMax: data.totalMax
      };
    }).sort((a, b) => b.percentage - a.percentage);

    const strongestSubject = subjectStats[0] || null;
    const weakestSubject = subjectStats.length > 1 ? subjectStats[subjectStats.length - 1] : null;

    // Chart Data for Line Chart
    const trendChartData = tests.map((t, idx) => ({
      name: t.testName || `Test ${idx + 1}`,
      score: t.score,
      totalMarks: t.totalMarks,
      percentage: Math.round((t.score / t.totalMarks) * 100),
      date: t.date
    }));

    return {
      totalTests: tests.length,
      averageScore,
      averagePercentage,
      highestScore,
      lowestScore,
      latestTest,
      previousTest,
      latestImprovement,
      totalGrowth,
      trendVerdict,
      trendStatus,
      averageAccuracy,
      averageAttemptRate,
      hasAttemptData,
      subjectStats,
      strongestSubject,
      weakestSubject,
      trendChartData
    };
  }, [tests]);

  // Copy Summary
  const handleCopySummary = () => {
    if (!analytics) return;
    const text = `📊 MOCK TEST PERFORMANCE SUMMARY — NAVIKO

• Tests Tracked: ${analytics.totalTests} tests
• Average Score: ${analytics.averageScore} / ${analytics.latestTest.totalMarks} (${analytics.averagePercentage}%)
• Score Range: Lowest: ${analytics.lowestScore} ➔ Highest: ${analytics.highestScore}
• Overall Trend: ${analytics.trendVerdict} (Growth: ${analytics.totalGrowth >= 0 ? `+${analytics.totalGrowth}` : analytics.totalGrowth} marks)
• Average Accuracy: ${analytics.averageAccuracy}% (Attempt Rate: ${analytics.averageAttemptRate}%)

📚 SUBJECT PROFICIENCY:
${analytics.subjectStats.map(s => `• ${s.subjectName}: ${s.percentage}% avg`).join('\n')}

Generated on NAVIKO: https://naviko.in/student-tools/mock-test-analyzer`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Score Trajectory & Mistake Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToSample}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Analyze Mock Test Performance, Accuracy, & Subject Gaps
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-3xl">
            Log your mock exams, detect score trends, track accuracy vs negative markings, and pinpoint high-leverage subjects to maximize your final rank.
          </p>

          {/* Action Row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="py-2 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Mock Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Average Score</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {analytics.averageScore}
            </span>
            <span className="text-xs text-indigo-600 font-bold">
              {analytics.averagePercentage}% Avg Marks
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Highest Score</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {analytics.highestScore}
            </span>
            <span className="text-xs text-slate-500">
              Across {analytics.totalTests} tests
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Average Accuracy</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {analytics.averageAccuracy}%
            </span>
            <span className="text-xs text-slate-500">
              {analytics.averageAttemptRate}% attempt rate
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Overall Progress</span>
            <span className={`text-2xl font-black mt-1 block ${analytics.totalGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {analytics.totalGrowth >= 0 ? `+${analytics.totalGrowth}` : analytics.totalGrowth}
            </span>
            <span className="text-xs text-slate-500">
              from Test 1 to latest
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Visual Trend Chart & Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Chart & Trend Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trend Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Score Trajectory & Progress Chart</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {analytics?.trendVerdict}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* Recharts Line Chart */}
            {analytics && analytics.trendChartData.length > 0 ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trendChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                      formatter={(val: any) => [`${val} marks`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No mock tests logged yet. Click "Log New Mock Test" to get started.
              </div>
            )}

            {/* Trend Status Banner */}
            {analytics && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                analytics.trendStatus === 'up'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : analytics.trendStatus === 'down'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}>
                <Sparkles className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">
                    {analytics.trendStatus === 'up' ? 'Positive Score Trajectory' : analytics.trendStatus === 'down' ? 'Review & Course Correction Needed' : 'Consistent Performance'}
                  </span>
                  <span className="text-[11px] opacity-90">
                    {analytics.trendVerdict}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Test History List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Logged Mock Tests ({tests.length})</span>
            </h3>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {tests.map((t, idx) => {
                const pct = Math.round((t.score / (t.totalMarks || 1)) * 100);
                const prev = idx > 0 ? tests[idx - 1] : null;
                const diff = prev ? t.score - prev.score : null;

                return (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{t.testName}</h4>
                        <span className="text-[10px] text-slate-400">{t.date}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-indigo-600 block">
                            {t.score} / {t.totalMarks}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {pct}% {diff !== null && (
                              <span className={diff >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                ({diff >= 0 ? `+${diff}` : diff})
                              </span>
                            )}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveTest(t.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete test"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Breakdown pill */}
                    {t.subjectScores && t.subjectScores.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        {t.subjectScores.map((s, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                            {s.subjectName}: <strong className="text-slate-900">{s.marksObtained}/{s.maxMarks}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {t.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                        "{t.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Subject Strengths & Focus Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subject Performance Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Subject Strengths & Weaknesses</span>
            </h3>

            {analytics && analytics.subjectStats.length > 0 ? (
              <div className="space-y-4">
                {analytics.subjectStats.map((sub, idx) => (
                  <div key={sub.subjectName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{sub.subjectName}</span>
                      <span className="text-indigo-600">{sub.percentage}% Average</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${sub.percentage}%` }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-emerald-500' : idx === analytics.subjectStats.length - 1 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}

                {/* Key Insight Tags */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  {analytics.strongestSubject && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Strongest Subject</span>
                      <span className="font-extrabold text-xs">{analytics.strongestSubject.subjectName}</span>
                      <span className="text-[10px] text-emerald-600 block">{analytics.strongestSubject.percentage}% score rate</span>
                    </div>
                  )}

                  {analytics.weakestSubject && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
                      <span className="text-[10px] uppercase font-bold text-rose-700 block">Focus Needed</span>
                      <span className="font-extrabold text-xs">{analytics.weakestSubject.subjectName}</span>
                      <span className="text-[10px] text-rose-600 block">{analytics.weakestSubject.percentage}% score rate</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Log test subject scores to analyze subject strengths.
              </div>
            )}
          </div>

          {/* Actionable Strategy Guidance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Recommended Action Strategy</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block mb-0.5">1. Post-Mock Error Notebook</strong>
                <span>Spend at least 1.5x the test duration analyzing mistakes, silly errors, and unattempted questions before giving the next mock.</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block mb-0.5">2. Accuracy Over Speed</strong>
                <span>Negative marks from incorrect guesses severely drag scores down. Target 85%+ net accuracy before expanding question attempts.</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block mb-0.5">3. Weak Section Sprints</strong>
                <span>Dedicate 2-3 focused days solely to {analytics?.weakestSubject?.subjectName || 'your weakest subject'} chapters before your next scheduled test.</span>
              </div>
            </div>
          </div>

          {/* Non-Guarantee Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-500 text-xs">
            <p className="text-[11px] leading-relaxed">
              <strong>Assessment note:</strong> Mock scores are self-evaluation estimates and do not guarantee final exam outcomes or percentiles.
            </p>
          </div>
        </div>
      </div>

      {/* Modal / Overlay for Adding New Mock Test */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Log New Mock Test Result</span>
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                    placeholder="e.g. Mock Test 5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Score Obtained</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Question Attempt Details */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Question Counts (Optional)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Correct</label>
                    <input
                      type="number"
                      min="0"
                      value={correctAnswers}
                      onChange={(e) => setCorrectAnswers(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Incorrect</label>
                    <input
                      type="number"
                      min="0"
                      value={incorrectAnswers}
                      onChange={(e) => setIncorrectAnswers(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Unattempted</label>
                    <input
                      type="number"
                      min="0"
                      value={unattempted}
                      onChange={(e) => setUnattempted(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Subject Breakdown (Optional)</span>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sub1Name}
                      onChange={(e) => setSub1Name(e.target.value)}
                      placeholder="Subject 1"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      value={sub1Marks}
                      onChange={(e) => setSub1Marks(Number(e.target.value))}
                      placeholder="Marks"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={sub1Max}
                      onChange={(e) => setSub1Max(Number(e.target.value))}
                      placeholder="Max"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sub2Name}
                      onChange={(e) => setSub2Name(e.target.value)}
                      placeholder="Subject 2"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      value={sub2Marks}
                      onChange={(e) => setSub2Marks(Number(e.target.value))}
                      placeholder="Marks"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={sub2Max}
                      onChange={(e) => setSub2Max(Number(e.target.value))}
                      placeholder="Max"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sub3Name}
                      onChange={(e) => setSub3Name(e.target.value)}
                      placeholder="Subject 3"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      value={sub3Marks}
                      onChange={(e) => setSub3Marks(Number(e.target.value))}
                      placeholder="Marks"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={sub3Max}
                      onChange={(e) => setSub3Max(Number(e.target.value))}
                      placeholder="Max"
                      className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mistakes & Weak Topic Notes</label>
                <textarea
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Lost 15 marks in organic nomenclature, need formula revision"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Test Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
