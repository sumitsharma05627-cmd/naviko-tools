import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, RotateCcw, Volume2, HelpCircle, CheckCircle2, 
  XCircle, Zap, Brain, Trophy, ChevronRight, Shuffle, 
  Plus, Bookmark, BookOpen, Layers, Flame, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STUDY_QUESTIONS, SUBJECT_OPTIONS, StudyQuestion } from '../../data/questionsData';

export const RandomQuestionGenerator: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeMode, setActiveMode] = useState<'flashcard' | 'quiz' | 'sprint'>('flashcard');

  // Custom User Deck state persisted in localStorage
  const [customQuestions, setCustomQuestions] = useState<StudyQuestion[]>(() => {
    const saved = localStorage.getItem('naviko_custom_questions');
    return saved ? JSON.parse(saved) : [];
  });

  // Mastered & Review Lists
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('naviko_mastered_questions');
    return saved ? JSON.parse(saved) : [];
  });

  // Current Question Index & Pool
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Quiz Mode State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [quizTotalAttempted, setQuizTotalAttempted] = useState<number>(0);

  // Sprint Mode State
  const [sprintTimeLeft, setSprintTimeLeft] = useState<number>(60);
  const [isSprintActive, setIsSprintActive] = useState<boolean>(false);
  const [sprintScore, setSprintScore] = useState<number>(0);
  const [sprintHighScore, setSprintHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('naviko_sprint_highscore')) || 0;
  });

  // Custom Question Form Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOption1, setNewOption1] = useState('');
  const [newOption2, setNewOption2] = useState('');
  const [newOption3, setNewOption3] = useState('');
  const [newOption4, setNewOption4] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newSubject, setNewSubject] = useState<'math' | 'physics' | 'chemistry' | 'biology' | 'coding' | 'history' | 'aptitude' | 'gk'>('math');

  // Filtered Questions Pool
  const filteredQuestions = useMemo(() => {
    const combined = [...STUDY_QUESTIONS, ...customQuestions];
    return combined.filter((q) => {
      const matchSubject = selectedSubject === 'all' || q.subject === selectedSubject;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchSubject && matchDiff;
    });
  }, [selectedSubject, selectedDifficulty, customQuestions]);

  const currentQ: StudyQuestion | undefined = filteredQuestions[currentIdx % (filteredQuestions.length || 1)];

  // Shuffle or Next
  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setSelectedOption(null);
    setIsAnswered(false);
    if (filteredQuestions.length > 1) {
      let nextIndex = Math.floor(Math.random() * filteredQuestions.length);
      if (nextIndex === currentIdx) {
        nextIndex = (currentIdx + 1) % filteredQuestions.length;
      }
      setCurrentIdx(nextIndex);
    }
  };

  // Sprint Timer
  useEffect(() => {
    let timer: any;
    if (isSprintActive && sprintTimeLeft > 0) {
      timer = setInterval(() => {
        setSprintTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (sprintTimeLeft === 0 && isSprintActive) {
      setIsSprintActive(false);
      if (sprintScore > sprintHighScore) {
        setSprintHighScore(sprintScore);
        localStorage.setItem('naviko_sprint_highscore', sprintScore.toString());
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
    return () => clearInterval(timer);
  }, [isSprintActive, sprintTimeLeft, sprintScore, sprintHighScore]);

  const startSprint = () => {
    setSprintScore(0);
    setSprintTimeLeft(60);
    setIsSprintActive(true);
    handleNext();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswerIndex;
    if (isCorrect) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      setQuizScore((prev) => prev + 1);
      setQuizStreak((prev) => prev + 1);
      if (isSprintActive) {
        setSprintScore((prev) => prev + 1);
        setTimeout(() => handleNext(), 500);
      }
    } else {
      setQuizStreak(0);
      if (isSprintActive) {
        setTimeout(() => handleNext(), 600);
      }
    }
    setQuizTotalAttempted((prev) => prev + 1);
  };

  const toggleMastered = (id: string) => {
    let updated: string[];
    if (masteredIds.includes(id)) {
      updated = masteredIds.filter((i) => i !== id);
    } else {
      updated = [...masteredIds, id];
    }
    setMasteredIds(updated);
    localStorage.setItem('naviko_mastered_questions', JSON.stringify(updated));
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOption1.trim() || !newOption2.trim()) return;

    const newQ: StudyQuestion = {
      id: `custom-${Date.now()}`,
      subject: newSubject,
      subjectName: newSubject.toUpperCase(),
      topic: 'Custom User Deck',
      difficulty: 'medium',
      question: newQuestionText.trim(),
      options: [newOption1.trim(), newOption2.trim(), newOption3.trim() || 'Option C', newOption4.trim() || 'Option D'],
      correctAnswerIndex: newCorrectIdx,
      explanation: newExplanation.trim() || 'Custom flashcard explanation provided by user.'
    };

    const updated = [...customQuestions, newQ];
    setCustomQuestions(updated);
    localStorage.setItem('naviko_custom_questions', JSON.stringify(updated));

    // Reset Form
    setNewQuestionText('');
    setNewOption1('');
    setNewOption2('');
    setNewOption3('');
    setNewOption4('');
    setNewExplanation('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Navigator & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveMode('flashcard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'flashcard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎴 Flashcard Flip
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 MCQ Quiz Mode
          </button>
          <button
            onClick={() => setActiveMode('sprint')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'sprint'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚡ 60s Speed Sprint
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Custom Question
        </button>
      </div>

      {/* Subject and Difficulty Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Subject:</span>
          {SUBJECT_OPTIONS.slice(0, 6).map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedSubject === sub.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {activeMode === 'flashcard' && currentQ && (
        <div className="space-y-6">
          {/* Card Meta Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-full">
                {currentQ.subjectName} • {currentQ.topic}
              </span>
              <span className="capitalize px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-medium">
                {currentQ.difficulty}
              </span>
            </div>
            <button
              onClick={() => toggleMastered(currentQ.id)}
              className={`flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                masteredIds.includes(currentQ.id)
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{masteredIds.includes(currentQ.id) ? 'Mastered ✨' : 'Mark Mastered'}</span>
            </button>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative min-h-[300px] sm:min-h-[340px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-3xl p-8 shadow-md flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl group select-none"
          >
            {!isFlipped ? (
              // Front: Question
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Card
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakQuestion(currentQ.question);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {currentQ.question}
                  </h3>
                  {currentQ.formulaOrCode && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      {currentQ.formulaOrCode}
                    </div>
                  )}
                </div>

                <div className="text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-y-[-2px] transition-transform">
                  💡 Click anywhere on the card to reveal Answer & Explanation ↷
                </div>
              </div>
            ) : (
              // Back: Answer & Explanation
              <div className="space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  <span>✓ Correct Answer</span>
                  <span className="text-slate-400 font-normal">Click to flip back</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 font-bold text-lg text-emerald-900 dark:text-emerald-200">
                    {currentQ.options[currentQ.correctAnswerIndex]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Detailed Explanation:
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  Topic: {currentQ.topic}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4">
            {currentQ.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? currentQ.hint : 'Need a Hint?'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="ml-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Next Random Question</span>
            </button>
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {activeMode === 'quiz' && currentQ && (
        <div className="space-y-6">
          {/* Quiz Scoreboard */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold block">Score</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {quizScore} / {quizTotalAttempted}
              </span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold block">Streak</span>
              <span className="text-2xl font-black text-amber-500 font-mono flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> {quizStreak}
              </span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold block">Accuracy</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {quizTotalAttempted > 0 ? `${Math.round((quizScore / quizTotalAttempted) * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {currentQ.subjectName} • {currentQ.topic}
              </span>
              <span className="capitalize">{currentQ.difficulty}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

                if (isAnswered) {
                  if (idx === currentQ.correctAnswerIndex) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm font-bold';
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm font-bold';
                  } else {
                    btnStyle = 'opacity-40 border-transparent';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === currentQ.correctAnswerIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && selectedOption === idx && idx !== currentQ.correctAnswerIndex && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Post-Answer Explanation Box */}
            {isAnswered && (
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Explanation:
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPRINT MODE (60s) */}
      {activeMode === 'sprint' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          {!isSprintActive && sprintTimeLeft === 60 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                60-Second Speed Recall Sprint
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Answer as many questions correctly as you can in 1 minute. Fast reflexes, instant recall!
              </p>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Personal High Score: <span className="text-amber-500 font-mono font-black">{sprintHighScore} points</span>
              </div>
              <button
                onClick={startSprint}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-2xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                🚀 Start 60s Challenge!
              </button>
            </div>
          ) : isSprintActive && currentQ ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-2xl font-mono font-black text-amber-500">
                    {sprintTimeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <Trophy className="w-4 h-4 text-emerald-500" /> Score:
                  <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {sprintScore}
                  </span>
                </div>
              </div>

              {/* Sprint Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-1000"
                  style={{ width: `${(sprintTimeLeft / 60) * 100}%` }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentQ.question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-left text-xs font-bold transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Sprint Completed Result
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl font-black text-emerald-500 font-mono">
                🎉 Time&apos;s Up!
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                You scored <span className="text-emerald-600 dark:text-emerald-400 text-xl font-mono">{sprintScore}</span> correct answers!
              </p>
              <button
                onClick={startSprint}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                🔄 Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Custom Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              ➕ Add Custom Study Question
            </h3>

            <form onSubmit={handleCreateCustom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="coding">Computer Science</option>
                  <option value="aptitude">Aptitude & Logic</option>
                  <option value="history">History & Civics</option>
                  <option value="gk">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Text</label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter question..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Option 1 (A)</label>
                  <input
                    required
                    type="text"
                    value={newOption1}
                    onChange={(e) => setNewOption1(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Option 2 (B)</label>
                  <input
                    required
                    type="text"
                    value={newOption2}
                    onChange={(e) => setNewOption2(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Option 3 (C)</label>
                  <input
                    type="text"
                    value={newOption3}
                    onChange={(e) => setNewOption3(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Option 4 (D)</label>
                  <input
                    type="text"
                    value={newOption4}
                    onChange={(e) => setNewOption4(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Correct Option</label>
                <select
                  value={newCorrectIdx}
                  onChange={(e) => setNewCorrectIdx(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value={0}>Option 1 (A)</option>
                  <option value={1}>Option 2 (B)</option>
                  <option value={2}>Option 3 (C)</option>
                  <option value={3}>Option 4 (D)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Explanation</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Why is this correct?"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
