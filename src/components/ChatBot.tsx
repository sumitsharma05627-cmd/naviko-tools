import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Calculator,
  RotateCcw,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';

interface ChatBotProps {
  onNavigate: (path: string) => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  action?: {
    label: string;
    path: string;
  };
  calcResult?: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  '🇮🇳 Show India & Global Debt Clock',
  '📈 Calculate monthly SIP growth',
  '🧮 Open Scientific Calculator',
  '💼 New vs Old Tax Regime slabs',
  '🎓 How to convert CGPA to %',
  '🔥 What is the 4% FIRE rule?',
];

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: '👋 Hi! I am **Navi**, your offline Smart Assistant.\n\nI can help you find tools, solve math calculations, explain financial formulas, and guide your productivity—**100% private, zero API keys required!**',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isMinimized]);

  // Safe client-side math evaluator
  const tryEvaluateMath = (query: string): string | null => {
    // Clean string to check if it's a math expression
    const cleaned = query
      .toLowerCase()
      .replace(/calculate|what is|compute|solve|\?/g, '')
      .trim();

    // Check for percentage e.g. "15% of 50000"
    const pctMatch = cleaned.match(/(\d+(\.\d+)?)%\s*(of|\*)\s*(\d+(\.\d+)?)/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const val = parseFloat(pctMatch[4]);
      const res = (pct / 100) * val;
      return `${pct}% of ${val} = **${res.toLocaleString('en-IN')}**`;
    }

    // Check for standard arithmetic operators
    const sanitized = cleaned
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/x/g, '*');

    if (/^[\d\.\+\-\*\/\(\)\s\^\%]+$/.test(sanitized) && /[\+\-\*\/\^]/.test(sanitized)) {
      try {
        const jsExpr = sanitized.replace(/\^/g, '**').replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${jsExpr})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          const rounded = Number(Math.round(Number(res + 'e+6')) + 'e-6');
          return `${sanitized} = **${rounded.toLocaleString('en-IN')}**`;
        }
      } catch {
        return null;
      }
    }
    return null;
  };

  // Rule-based NLP intent responder (Offline, 0 API integration)
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Math calculation check
    const mathRes = tryEvaluateMath(q);
    if (mathRes) {
      return {
        text: `🧮 **Calculation Result:**\n\n${mathRes}\n\nNeed complex formulas? You can also use our **Scientific** or **Standard Number** calculators!`,
        action: { label: 'Open Number Calculator', path: '/tools/number-calculator' },
      };
    }

    // 1.5. Debt Clock & Sovereign Debt
    if (q.includes('debt') || q.includes('debt clock') || q.includes('national debt') || q.includes('public debt') || q.includes('gdp ratio') || q.includes('fiscal deficit') || q.includes('country debt')) {
      return {
        text: '🇮🇳 **National Debt Clock (India & World)**\n\n• **India Gross Debt**: ~₹185.4 Lakh Crores (~81% of GDP)\n• **Growth Speed**: +₹54,800 every single second\n• **Per Citizen Debt**: ~₹1,28,000 per Indian citizen\n• **Global Comparison**: Live trackers for USA ($35T+), Japan (258% GDP), UK, China, Germany, and World Total!',
        action: { label: 'View Live National Debt Clock', path: '/tools/debt-clock' },
      };
    }

    // 2. Scientific Calculator
    if (q.includes('scientific') || q.includes('sin') || q.includes('cos') || q.includes('tan') || q.includes('log') || q.includes('trig') || q.includes('factorial')) {
      return {
        text: '📐 **Scientific Calculator**\n\nOur full scientific calculator supports Trigonometry (sin, cos, tan), Hyperbolic, Logarithms (ln, log10), Powers (xʸ, x²), Roots, Deg/Rad modes, and constants (π, e, φ).',
        action: { label: 'Open Scientific Calculator', path: '/tools/scientific-calculator' },
      };
    }

    // 3. Number / Basic Calculator
    if (q.includes('calculator') && (q.includes('basic') || q.includes('number') || q.includes('simple') || q.includes('standard') || q.includes('calc'))) {
      return {
        text: '🔢 **Standard Number Calculator**\n\nClean, tactile numerical calculator with calculation history tape, memory registers (M+, M-, MR, MC), keyboard shortcuts, and currency words.',
        action: { label: 'Open Number Calculator', path: '/tools/number-calculator' },
      };
    }

    // 4. SIP & Compounding
    if (q.includes('sip') || q.includes('systematic investment') || q.includes('mutual fund') || q.includes('step up')) {
      return {
        text: '📈 **SIP & Step-Up Calculator**\n\nCalculate mutual fund wealth compounding. With a 10% annual Step-Up, you can double your total corpus over a 15–20 year horizon thanks to compounding interest.',
        action: { label: 'Launch SIP Calculator', path: '/tools/sip-calculator' },
      };
    }

    // 5. Salary & Tax Slabs
    if (q.includes('salary') || q.includes('tax') || q.includes('in hand') || q.includes('in-hand') || q.includes('ctc') || q.includes('take home') || q.includes('deduction')) {
      return {
        text: '💼 **Salary & In-Hand Tax Calculator**\n\nBreakdown your gross CTC into In-Hand Monthly Take-Home, EPF, Professional Tax, and Income Tax with the FY 2024-25 / 2025-26 New Tax Regime ₹75,000 standard deduction.',
        action: { label: 'Calculate In-Hand Salary', path: '/tools/salary-calculator' },
      };
    }

    // 6. EMI & Loan
    if (q.includes('emi') || q.includes('loan') || q.includes('home loan') || q.includes('car loan') || q.includes('interest')) {
      return {
        text: '🏦 **Loan EMI Calculator**\n\nCompute exact monthly EMI, total interest payable, and complete year-by-year amortization schedules for home, car, and personal loans.',
        action: { label: 'Calculate Loan EMI', path: '/tools/emi-calculator' },
      };
    }

    // 7. CGPA & Academic
    if (q.includes('cgpa') || q.includes('gpa') || q.includes('cbse') || q.includes('grade') || q.includes('marks')) {
      return {
        text: '🎓 **CGPA to Percentage Calculator**\n\nFor CBSE & standard Indian universities, the standard formula is **Percentage = CGPA × 9.5**. For 10-point scale universities, it can also be `(CGPA - 0.75) × 10`.',
        action: { label: 'Open CGPA Calculator', path: '/tools/cgpa-calculator' },
      };
    }

    // 8. FIRE & Retirement
    if (q.includes('fire') || q.includes('retire') || q.includes('financial independence') || q.includes('4% rule') || q.includes('swr')) {
      return {
        text: '🔥 **FIRE (Financial Independence, Retire Early)**\n\nThe famous **4% Safe Withdrawal Rule (25x annual expenses)** dictates your target nest egg. For instance, if your yearly expenses are ₹12 Lakhs, your FIRE target is `₹12L × 25 = ₹3 Crores`.',
        action: { label: 'Open FIRE Calculator', path: '/tools/fire-calculator' },
      };
    }

    // 9. CAGR
    if (q.includes('cagr') || q.includes('compound annual')) {
      return {
        text: '📊 **CAGR (Compound Annual Growth Rate)**\n\nFormula: `CAGR = ((Final Value / Initial Value) ^ (1 / Years)) - 1`. It measures the smoothed annual return of investments.',
        action: { label: 'Open CAGR Calculator', path: '/tools/cagr-calculator' },
      };
    }

    // 10. Age & Birthday
    if (q.includes('age') || q.includes('birthday') || q.includes('dob') || q.includes('how old')) {
      return {
        text: '🎂 **Age & Birthday Countdown**\n\nFind your exact age in years, months, days, total hours, minutes, and exact live countdown to your next birthday.',
        action: { label: 'Open Age Calculator', path: '/tools/age-calculator' },
      };
    }

    // 11. Resume Builder
    if (q.includes('resume') || q.includes('cv') || q.includes('ats') || q.includes('job') || q.includes('interview')) {
      return {
        text: '📄 **ATS-Friendly Resume Builder**\n\nCreate modern, clean, single-column ATS-optimized resumes that pass automated Applicant Tracking Systems with 1-click PDF download.',
        action: { label: 'Build Resume for Free', path: '/tools/resume-builder' },
      };
    }

    // 12. Image Compression & Resize
    if (q.includes('image') || q.includes('compress') || q.includes('resize') || q.includes('photo') || q.includes('pic') || q.includes('kb') || q.includes('mb')) {
      return {
        text: '🖼️ **Image Compressor & Resizer**\n\nCompress JPEG/PNG/WebP photos down to targeted file sizes (e.g., under 50KB for government forms) 100% in your browser without uploading to any server.',
        action: { label: 'Open Image Compressor', path: '/tools/image-compressor' },
      };
    }

    // 13. Typing Speed
    if (q.includes('typing') || q.includes('speed') || q.includes('wpm')) {
      return {
        text: '⌨️ **Typing Speed Assessment**\n\nTest your Words Per Minute (WPM), net accuracy, and error tracking with real-time feedback and certification tier badges.',
        action: { label: 'Take Typing Test', path: '/tools/typing-speed-test' },
      };
    }

    // 14. 50/30/20 Rule
    if (q.includes('50/30/20') || q.includes('50 30 20') || q.includes('budget rule')) {
      return {
        text: '💡 **The 50/30/20 Budgeting Rule**\n\n- **50% Needs**: Rent, groceries, bills, utilities, EMIs.\n- **30% Wants**: Dining out, shopping, hobbies, travel.\n- **20% Savings & Investments**: SIPs, Emergency fund, Retirement.',
        action: { label: 'Calculate In-Hand Budget', path: '/tools/salary-calculator' },
      };
    }

    // 15. Rule of 72
    if (q.includes('rule of 72') || q.includes('double money')) {
      return {
        text: '⚡ **The Rule of 72**\n\nTo find out how many years it takes to double your money at a fixed annual interest rate `R%`, divide 72 by `R`.\n\n*Example:* At 12% mutual fund returns, `72 / 12 = 6 years` to double your money!',
        action: { label: 'Explore SIP Compounding', path: '/tools/sip-calculator' },
      };
    }

    // 16. Privacy & Security
    if (q.includes('privacy') || q.includes('data') || q.includes('safe') || q.includes('offline') || q.includes('secure')) {
      return {
        text: '🛡️ **100% Client-Side Privacy**\n\nNAVIKO runs exclusively inside your browser memory using HTML5/WebAssembly. None of your calculations, resumes, images, or notes ever touch a backend server.',
        action: { label: 'Read Privacy Policy', path: '/privacy-policy' },
      };
    }

    // 17. Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste')) {
      return {
        text: '👋 Hello! How can I assist your productivity today? You can ask me to calculate equations, explain financial concepts, or recommend any of NAVIKO\'s 18+ smart tools!',
      };
    }

    // Default Fallback
    return {
      text: `I'm here to help! You can ask me to:\n\n- Solve arithmetic (e.g. \`calculate 18% of 75000\`)\n- Find tools for SIP, Salary tax, Loans, Resumes, or Image compression\n- Explain financial rules like **50/30/20**, **Rule of 72**, or **FIRE**`,
      action: { label: 'Browse All Tools Directory', path: '/tools' },
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural brief AI thinking time
    setTimeout(() => {
      const response = processQuery(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30"
            aria-label="Open Navi AI Assistant"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Ask Navi
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-950">
              Offline AI
            </span>
            {/* Ambient pulse */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Navi Smart Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Client AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">100% Offline • No API Required</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'msg-welcome',
                      sender: 'bot',
                      text: 'Chat history cleared. How can I help you next?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 dark:bg-slate-950/80">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="max-w-[84%] space-y-1.5 group">
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <div className="whitespace-pre-line break-words">
                          {msg.text.split('\n').map((line, lIdx) => {
                            // Simple formatting for bold **text**
                            const formatted = line.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>'
                            );
                            return (
                              <p
                                key={lIdx}
                                className={lIdx > 0 ? 'mt-1.5' : ''}
                                dangerouslySetInnerHTML={{ __html: formatted }}
                              />
                            );
                          })}
                        </div>

                        {/* Action Link Button if available */}
                        {msg.action && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                onNavigate(msg.action!.path);
                                setIsOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                            >
                              <span>{msg.action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-center text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Preset suggestion chips */}
              <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                {PRESET_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200/60 dark:border-slate-700 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask math, financial rules, or find a tool..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
