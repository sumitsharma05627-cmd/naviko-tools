import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RotateCcw, Delete, History, Info, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

type AngleMode = 'deg' | 'rad';

export const ScientificCalculator: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [isHyperbolic, setIsHyperbolic] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [isResultEvaluated, setIsResultEvaluated] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<{ expr: string; result: string; mode: string }[]>(() => {
    try {
      const saved = localStorage.getItem('naviko_sci_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('naviko_sci_calc_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  const playClickSound = (freq = 700) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch {}
  };

  // Helper Factorial
  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) {
      res *= i;
    }
    return res;
  };

  // Advanced Expression Parser & Evaluator
  const evaluateScientific = (raw: string): string => {
    try {
      let expr = raw
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e(?![a-zA-Z0-9_])/g, `${Math.E}`)
        .replace(/φ/g, `${(1 + Math.sqrt(5)) / 2}`)
        .replace(/Ans/g, `${lastAnswer}`);

      // Factorial replacement n! -> fact(n)
      expr = expr.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

      // Custom Math context functions
      const toRad = (angle: number) => (angleMode === 'deg' ? (angle * Math.PI) / 180 : angle);
      const toDeg = (rad: number) => (angleMode === 'deg' ? (rad * 180) / Math.PI : rad);

      const customContext = {
        sin: (x: number) => Math.sin(toRad(x)),
        cos: (x: number) => Math.cos(toRad(x)),
        tan: (x: number) => {
          const rad = toRad(x);
          // check for 90 deg asymptotic infinity
          if (angleMode === 'deg' && Math.abs(x % 180) === 90) return Infinity;
          return Math.tan(rad);
        },
        asin: (x: number) => toDeg(Math.asin(x)),
        acos: (x: number) => toDeg(Math.acos(x)),
        atan: (x: number) => toDeg(Math.atan(x)),
        sinh: (x: number) => Math.sinh(x),
        cosh: (x: number) => Math.cosh(x),
        tanh: (x: number) => Math.tanh(x),
        asinh: (x: number) => Math.asinh(x),
        acosh: (x: number) => Math.acosh(x),
        atanh: (x: number) => Math.atanh(x),
        ln: (x: number) => Math.log(x),
        log: (x: number) => Math.log10(x),
        log2: (x: number) => Math.log2(x),
        sqrt: (x: number) => Math.sqrt(x),
        cbrt: (x: number) => Math.cbrt(x),
        abs: (x: number) => Math.abs(x),
        fact: factorial,
        rand: () => Math.random(),
      };

      // Exponents: x^y to **
      expr = expr.replace(/\^/g, '**');

      // Functions token mapping
      expr = expr.replace(/(asin|acos|atan|asinh|acosh|atanh|sin|cos|tan|sinh|cosh|tanh|ln|log2|log|sqrt|cbrt|abs|fact|rand)/g, 'ctx.$1');

      // Percentage handling
      expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      // eslint-disable-next-line no-new-func
      const resultFn = new Function('ctx', `"use strict"; return (${expr});`);
      const result = resultFn(customContext);

      if (typeof result !== 'number' || isNaN(result)) {
        return 'Error';
      }

      if (!isFinite(result)) {
        return result > 0 ? 'Infinity' : '-Infinity';
      }

      // Format floating precision cleanly
      const rounded = Number(Math.round(Number(result + 'e+12')) + 'e-12');
      return String(rounded);
    } catch {
      return 'Error';
    }
  };

  const handleInput = (val: string) => {
    playClickSound(600);
    if (isResultEvaluated || display === '0' || display === 'Error') {
      setDisplay(val);
      setIsResultEvaluated(false);
    } else {
      setDisplay(display + val);
    }
  };

  const handleFunction = (fnName: string) => {
    playClickSound(650);
    if (isResultEvaluated || display === '0' || display === 'Error') {
      setDisplay(`${fnName}(`);
      setIsResultEvaluated(false);
    } else {
      setDisplay(`${display}${fnName}(`);
    }
  };

  const handleEquals = () => {
    playClickSound(900);
    if (display === 'Error') return;

    const res = evaluateScientific(display);

    if (res !== 'Error' && res !== 'Infinity' && res !== '-Infinity') {
      const numRes = parseFloat(res);
      setLastAnswer(numRes);
      const newEntry = {
        expr: display,
        result: res,
        mode: angleMode.toUpperCase(),
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 29)]);
      setDisplay(res);
      setIsResultEvaluated(true);
    } else {
      setDisplay(res);
      setIsResultEvaluated(true);
    }
  };

  const handleClear = () => {
    playClickSound(400);
    setDisplay('0');
    setIsResultEvaluated(false);
  };

  const handleBackspace = () => {
    playClickSound(450);
    if (isResultEvaluated || display === 'Error' || display.length <= 1) {
      setDisplay('0');
      setIsResultEvaluated(false);
      return;
    }
    // Check if deleting a multi-char function name like "sin(", "sqrt("
    const fnMatch = display.match(/(asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|ln|log|sqrt|cbrt|abs)\($/);
    if (fnMatch) {
      setDisplay(display.slice(0, -fnMatch[0].length) || '0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleInput('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleInput('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleInput('−');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === '^') {
        e.preventDefault();
        handleInput('^');
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
        handleInput('%');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
              Advanced Scientific Calculator
            </span>
            <span className="text-[10px] text-slate-400">
              Trigonometry, Logarithms, Hyperbolic &amp; Engineering Math
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* DEG / RAD Switcher */}
          <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setAngleMode('deg')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                angleMode === 'deg' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              DEG
            </button>
            <button
              onClick={() => setAngleMode('rad')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                angleMode === 'rad' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              RAD
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Scientific Body */}
        <div className="lg:col-span-8 space-y-4">
          {/* Display screen */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {angleMode.toUpperCase()}
                </span>
                {memory !== 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    M: {memory}
                  </span>
                )}
                {lastAnswer !== 0 && (
                  <span className="text-slate-400 text-[11px]">
                    Ans = {lastAnswer}
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Display Expression */}
            <div className="text-right">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black tracking-tight text-white select-all break-all overflow-x-auto min-h-[56px] flex items-center justify-end">
                {display}
              </div>
            </div>
          </div>

          {/* Mode Function Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100/90 rounded-2xl border border-slate-200">
            <div className="flex gap-2">
              <button
                onClick={() => setIsSecond(!isSecond)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isSecond
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                2nd (Shift)
              </button>

              <button
                onClick={() => setIsHyperbolic(!isHyperbolic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isHyperbolic
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                hyp
              </button>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setMemory(0);
                  playClickSound(600);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
              >
                MC
              </button>
              <button
                onClick={() => {
                  handleInput(String(memory));
                  playClickSound(600);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
              >
                MR
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(display) || 0;
                  setMemory((m) => m + val);
                  playClickSound(600);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
              >
                M+
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(display) || 0;
                  setMemory((m) => m - val);
                  playClickSound(600);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
              >
                M-
              </button>
            </div>
          </div>

          {/* Main Keypad Grid (6 columns scientific layout) */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-3 sm:p-4 rounded-3xl bg-slate-100/90 border border-slate-200 shadow-inner">
            {/* Row 1: Trigonometry & Functions */}
            <button
              onClick={() => handleFunction(isSecond ? (isHyperbolic ? 'asinh' : 'asin') : (isHyperbolic ? 'sinh' : 'sin'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? (isHyperbolic ? 'sinh⁻¹' : 'sin⁻¹') : (isHyperbolic ? 'sinh' : 'sin')}
            </button>
            <button
              onClick={() => handleFunction(isSecond ? (isHyperbolic ? 'acosh' : 'acos') : (isHyperbolic ? 'cosh' : 'cos'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? (isHyperbolic ? 'cosh⁻¹' : 'cos⁻¹') : (isHyperbolic ? 'cosh' : 'cos')}
            </button>
            <button
              onClick={() => handleFunction(isSecond ? (isHyperbolic ? 'atanh' : 'atan') : (isHyperbolic ? 'tanh' : 'tan'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? (isHyperbolic ? 'tanh⁻¹' : 'tan⁻¹') : (isHyperbolic ? 'tanh' : 'tan')}
            </button>
            <button
              onClick={() => handleInput('(')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-all active:scale-95 cursor-pointer font-mono"
            >
              (
            </button>
            <button
              onClick={() => handleInput(')')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-all active:scale-95 cursor-pointer font-mono"
            >
              )
            </button>
            <button
              onClick={handleClear}
              className="py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-700 hover:text-white font-bold text-sm border border-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              AC
            </button>

            {/* Row 2: Logs & Powers */}
            <button
              onClick={() => (isSecond ? handleFunction('exp') : handleFunction('ln'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? 'eˣ' : 'ln'}
            </button>
            <button
              onClick={() => (isSecond ? handleInput('10^(') : handleFunction('log'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? '10ˣ' : 'log'}
            </button>
            <button
              onClick={() => (isSecond ? handleFunction('cbrt') : handleFunction('sqrt'))}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              {isSecond ? '∛x' : '√x'}
            </button>
            <button
              onClick={() => handleInput('^')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              xʸ
            </button>
            <button
              onClick={() => handleInput('^2')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              x²
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Row 3: Constants & Numbers */}
            <button
              onClick={() => handleInput('π')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              π
            </button>
            <button
              onClick={() => handleInput('e')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              e
            </button>
            <button
              onClick={() => handleInput('7')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              7
            </button>
            <button
              onClick={() => handleInput('8')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              8
            </button>
            <button
              onClick={() => handleInput('9')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              9
            </button>
            <button
              onClick={() => handleInput('÷')}
              className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              ÷
            </button>

            {/* Row 4: Factorial & Numbers */}
            <button
              onClick={() => handleInput('!')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              n!
            </button>
            <button
              onClick={() => handleFunction('abs')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              |x|
            </button>
            <button
              onClick={() => handleInput('4')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              4
            </button>
            <button
              onClick={() => handleInput('5')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              5
            </button>
            <button
              onClick={() => handleInput('6')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              6
            </button>
            <button
              onClick={() => handleInput('×')}
              className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              ×
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleInput('1/(')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              1/x
            </button>
            <button
              onClick={() => handleInput('%')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition-all active:scale-95 cursor-pointer font-mono"
            >
              %
            </button>
            <button
              onClick={() => handleInput('1')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              1
            </button>
            <button
              onClick={() => handleInput('2')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              2
            </button>
            <button
              onClick={() => handleInput('3')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              3
            </button>
            <button
              onClick={() => handleInput('−')}
              className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              −
            </button>

            {/* Row 6 */}
            <button
              onClick={() => handleInput('Ans')}
              className="py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              Ans
            </button>
            <button
              onClick={() => handleFunction('rand')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition-all active:scale-95 cursor-pointer font-mono"
            >
              RND
            </button>
            <button
              onClick={() => handleInput('0')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              0
            </button>
            <button
              onClick={() => handleInput('.')}
              className="py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-mono"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl border border-emerald-400 shadow-md transition-all active:scale-95 cursor-pointer font-mono"
            >
              =
            </button>
            <button
              onClick={() => handleInput('+')}
              className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg border border-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Right Tape & Science Formula Reference */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Scientific History Tape
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Scientific operations and trigonometric results will be logged here.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDisplay(item.result);
                      setIsResultEvaluated(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group text-right"
                  >
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">{item.mode}</span>
                      <span className="truncate max-w-[140px]">{item.expr} =</span>
                    </div>
                    <div className="text-base font-bold text-slate-900 group-hover:text-indigo-600 font-mono mt-0.5">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Key Mathematical Constants
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Pi (π)</span>
                <span className="font-mono font-bold text-indigo-300">3.1415926535...</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Euler's Number (e)</span>
                <span className="font-mono font-bold text-emerald-300">2.7182818284...</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Golden Ratio (φ)</span>
                <span className="font-mono font-bold text-amber-300">1.6180339887...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
