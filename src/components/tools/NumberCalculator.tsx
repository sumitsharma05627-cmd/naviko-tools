import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Copy, Check, RotateCcw, Delete, History, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNumberWords } from '../../utils/finance';

export const NumberCalculator: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<{ expr: string; result: string; time: string }[]>(() => {
    try {
      const saved = localStorage.getItem('naviko_num_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isResultEvaluated, setIsResultEvaluated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('naviko_num_calc_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Audio beep generator using Web Audio API (optional, toggleable)
  const playClickSound = (freq = 600) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Safe evaluation of mathematical arithmetic expression
  const safeEvaluate = (expr: string): string => {
    try {
      // Replace display operators with JS operators
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');

      // Check for valid characters only
      if (!/^[\d\.\+\-\*\/\(\)\s\%]+$/.test(sanitized)) {
        return 'Error';
      }

      // Handle percentage
      sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return 'Error';
      }

      // Limit precision to avoid 0.0000000000000004 issues
      const formatted = Number(Math.round(Number(result + 'e+10')) + 'e-10');
      return String(formatted);
    } catch {
      return 'Error';
    }
  };

  // Handle digit input
  const handleDigit = (digit: string) => {
    playClickSound(550);
    if (isResultEvaluated || display === '0' || display === 'Error') {
      setDisplay(digit);
      setIsResultEvaluated(false);
    } else {
      if (display.length < 18) {
        setDisplay(display + digit);
      }
    }
  };

  // Handle decimal dot
  const handleDecimal = () => {
    playClickSound(580);
    if (isResultEvaluated || display === 'Error') {
      setDisplay('0.');
      setIsResultEvaluated(false);
      return;
    }
    const parts = display.split(/[\+\−×÷]/);
    const currentNum = parts[parts.length - 1];
    if (!currentNum.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle Operators (+, -, ×, ÷)
  const handleOperator = (op: string) => {
    playClickSound(700);
    if (display === 'Error') return;

    if (isResultEvaluated) {
      setEquation(display + ' ' + op);
      setDisplay('0');
      setIsResultEvaluated(false);
      return;
    }

    if (equation) {
      const fullExpr = equation + ' ' + display;
      const intermediate = safeEvaluate(fullExpr);
      if (intermediate !== 'Error') {
        setEquation(intermediate + ' ' + op);
        setDisplay('0');
      } else {
        setEquation(display + ' ' + op);
        setDisplay('0');
      }
    } else {
      setEquation(display + ' ' + op);
      setDisplay('0');
    }
  };

  // Handle Equal / Calculate
  const handleEquals = () => {
    playClickSound(880);
    if (!equation && !isResultEvaluated) return;

    const fullExpr = equation ? `${equation} ${display}` : display;
    const res = safeEvaluate(fullExpr);

    if (res !== 'Error') {
      const newEntry = {
        expr: fullExpr,
        result: res,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 29)]);
      setDisplay(res);
      setEquation('');
      setIsResultEvaluated(true);
    } else {
      setDisplay('Error');
    }
  };

  // Clear / All Clear
  const handleClear = () => {
    playClickSound(400);
    setDisplay('0');
    setEquation('');
    setIsResultEvaluated(false);
  };

  // Backspace
  const handleBackspace = () => {
    playClickSound(450);
    if (isResultEvaluated || display === 'Error') {
      setDisplay('0');
      setIsResultEvaluated(false);
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Invert Sign (+/-)
  const handleSign = () => {
    playClickSound(520);
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  // Percentage (%)
  const handlePercentage = () => {
    playClickSound(620);
    if (display === 'Error') return;
    try {
      const val = parseFloat(display) / 100;
      setDisplay(String(val));
    } catch {
      setDisplay('Error');
    }
  };

  // Memory Functions
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-') => {
    playClickSound(650);
    const currVal = parseFloat(display) || 0;
    if (action === 'MC') {
      setMemory(0);
    } else if (action === 'MR') {
      setDisplay(String(memory));
      setIsResultEvaluated(true);
    } else if (action === 'M+') {
      setMemory((prev) => prev + currVal);
    } else if (action === 'M-') {
      setMemory((prev) => prev - currVal);
    }
  };

  // Copy result
  const handleCopy = () => {
    const textToCopy = display;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const parsedNumber = parseFloat(display);
  const wordsRepresentation = !isNaN(parsedNumber) && Math.abs(parsedNumber) < 100000000000
    ? formatNumberWords(Math.abs(parsedNumber), 'INR')
    : null;

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
              Standard Number Calculator
            </span>
            <span className="text-[10px] text-slate-400">
              High Precision • Full Keyboard &amp; Memory Support
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={soundEnabled ? 'Mute key clicks' : 'Enable key clicks'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showHistory
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Calculator Body */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Display Console */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                {memory !== 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    M ({memory})
                  </span>
                )}
                <span className="font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {equation || 'Ready'}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Big Main Display */}
            <div className="text-right">
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white select-all break-all overflow-x-auto">
                {display}
              </div>
              {wordsRepresentation && display !== '0' && (
                <div className="text-xs text-indigo-300 font-medium mt-2 truncate">
                  ≈ {wordsRepresentation}
                </div>
              )}
            </div>
          </div>

          {/* Memory Bar */}
          <div className="grid grid-cols-4 gap-2">
            {(['MC', 'MR', 'M+', 'M-'] as const).map((mKey) => (
              <button
                key={mKey}
                onClick={() => handleMemory(mKey)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  mKey === 'MR' && memory !== 0
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {mKey}
              </button>
            ))}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-4 sm:p-5 rounded-3xl bg-slate-100/80 border border-slate-200 shadow-inner">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="py-3.5 sm:py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-700 hover:text-white font-bold text-base sm:text-lg border border-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-base sm:text-lg border border-slate-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={handlePercentage}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-base sm:text-lg border border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              %
            </button>
            <button
              onClick={() => handleOperator('÷')}
              className="py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleDigit('7')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              7
            </button>
            <button
              onClick={() => handleDigit('8')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              8
            </button>
            <button
              onClick={() => handleDigit('9')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              9
            </button>
            <button
              onClick={() => handleOperator('×')}
              className="py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleDigit('4')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              4
            </button>
            <button
              onClick={() => handleDigit('5')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              5
            </button>
            <button
              onClick={() => handleDigit('6')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              6
            </button>
            <button
              onClick={() => handleOperator('−')}
              className="py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleDigit('1')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              1
            </button>
            <button
              onClick={() => handleDigit('2')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              2
            </button>
            <button
              onClick={() => handleDigit('3')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              3
            </button>
            <button
              onClick={() => handleOperator('+')}
              className="py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={handleSign}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-base sm:text-lg border border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              ±
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 text-slate-900 font-black text-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-2xl border border-emerald-400 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              =
            </button>
          </div>
        </div>

        {/* Right Column: History and Shortcuts */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* History Panel */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Calculation Tape
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No previous calculations yet. Results will appear here automatically.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDisplay(item.result);
                      setIsResultEvaluated(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group text-right"
                  >
                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                      <span>{item.expr} =</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 font-mono mt-0.5">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Keyboard Guide */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Keyboard Shortcuts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span>Numbers / Math</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded">0-9 + - * /</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span>Calculate</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded">Enter / =</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span>Clear All</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-rose-500/20 text-rose-300 rounded">Esc / C</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span>Delete</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded">Backspace</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
