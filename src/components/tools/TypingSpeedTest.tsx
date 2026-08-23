import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Timer, Award, CheckCircle2, AlertCircle, Sparkles, Zap, Flame } from 'lucide-react';

const PASSAGES = [
  "Technology continues to reshape how we learn, communicate, and solve everyday challenges. With modern web tools and instant access to information, students and professionals around the globe can build remarkable projects and enhance their skills with greater speed and clarity than ever before in human history.",
  "Consistent practice and deliberate focus are the two most powerful elements in mastering touch typing. By maintaining proper ergonomic posture and keeping your fingers relaxed on the home row keys, your subconscious muscle memory takes over and your typing speed increases naturally without strain.",
  "Clear thinking leads to concise writing and effective problem solving. When designing software applications, simplicity is not the absence of clutter, but the presence of purpose. Every feature must serve a genuine user need with minimal friction and maximum reliability.",
  "The pursuit of knowledge is an ongoing journey that spans across disciplines. Whether analyzing mathematical formulas, exploring computer science algorithms, or learning a new language, curiosity and steady perseverance will consistently outshine raw talent alone."
];

export const TypingSpeedTest: React.FC = () => {
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPassage = PASSAGES[passageIndex];

  const resetTest = (duration: number = selectedDuration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedDuration(duration);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setUserInput('');
    setPassageIndex(Math.floor(Math.random() * PASSAGES.length));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    const val = e.target.value;
    if (!isActive && val.length > 0) {
      setIsActive(true);
    }

    setUserInput(val);

    // If user completes the whole text
    if (val.length >= currentPassage.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  // Metrics Calculation
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === currentPassage[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  const timeElapsed = selectedDuration - timeLeft;
  const minutes = timeElapsed > 0 ? timeElapsed / 60 : 0.0001;

  // Standard formula: (all typed chars / 5) / minutes
  const rawWpm = Math.round((userInput.length / 5) / minutes) || 0;
  const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes)) || 0;
  const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
  const cpm = Math.round(correctChars / minutes) || 0;

  const getRank = (wpm: number) => {
    if (wpm >= 90) return { title: 'Typing God ⚡', badge: 'Diamond', color: 'text-amber-500' };
    if (wpm >= 70) return { title: 'Master Typist 🚀', badge: 'Platinum', color: 'text-purple-600' };
    if (wpm >= 50) return { title: 'Fast Professional 💼', badge: 'Gold', color: 'text-indigo-600' };
    if (wpm >= 35) return { title: 'Intermediate Standard 👍', badge: 'Silver', color: 'text-emerald-600' };
    return { title: 'Developing Typist 🌱', badge: 'Bronze', color: 'text-slate-600' };
  };

  const rank = getRank(netWpm);

  return (
    <div className="space-y-6">
      {/* Top Test Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Duration:
          </span>
          <div className="flex items-center gap-1">
            {[30, 60, 120].map((dur) => (
              <button
                key={dur}
                onClick={() => resetTest(dur)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedDuration === dur
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800">
            <Timer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Time: <strong className="text-indigo-600 text-sm">{timeLeft}s</strong></span>
          </div>

          <button
            onClick={() => resetTest()}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Test
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950">
            {netWpm}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mt-0.5">
            Net WPM
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {accuracy}%
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5">
            Accuracy
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {cpm}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
            Chars / Min
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-100 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-950">
            {incorrectChars}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mt-0.5">
            Errors
          </div>
        </div>
      </div>

      {/* Passage Display Area */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-base sm:text-lg leading-relaxed font-mono select-none tracking-wide">
        {currentPassage.split('').map((char, index) => {
          let colorClass = 'text-slate-400';
          let bgClass = '';

          if (index < userInput.length) {
            if (userInput[index] === char) {
              colorClass = 'text-emerald-700 bg-emerald-100/50 rounded-xs font-semibold';
            } else {
              colorClass = 'text-white bg-rose-500 rounded-xs font-bold';
            }
          } else if (index === userInput.length) {
            bgClass = 'border-b-2 border-indigo-600 animate-pulse bg-indigo-50 font-bold text-slate-900';
          }

          return (
            <span key={index} className={`${colorClass} ${bgClass}`}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Typing Input */}
      {!isFinished ? (
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={3}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here... the timer begins with your first keystroke!"
            disabled={isFinished}
            className="w-full text-base sm:text-lg p-4 font-mono bg-white border-2 border-indigo-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl outline-none transition-all text-slate-900 shadow-sm"
          />
        </div>
      ) : (
        /* Test Completion Score Card */
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" /> Test Completed
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Performance Report Card
              </h3>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs uppercase tracking-wider text-indigo-200">Proficiency Tier</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {rank.title}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-white">{netWpm}</div>
              <div className="text-xs text-indigo-200 font-semibold mt-1">Net WPM</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">{accuracy}%</div>
              <div className="text-xs text-indigo-200 font-semibold mt-1">Accuracy</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-indigo-300">{correctChars}</div>
              <div className="text-xs text-indigo-200 font-semibold mt-1">Correct Chars</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-rose-400">{incorrectChars}</div>
              <div className="text-xs text-indigo-200 font-semibold mt-1">Errors Made</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => resetTest()}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Take Another Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
