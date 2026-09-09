import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  RotateCcw,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Star,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import {
  processUserQuery,
  createInitialContext,
  submitFeedback,
  addFeedbackToSessionContext,
  FEEDBACK_CATEGORIES,
  SessionContext,
  FeedbackCategory,
  AssistantIntent,
} from '../services/ai';
import { useAuth } from '../context/AuthContext';

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
  rankedTools?: Array<{
    id: string;
    name: string;
    route: string;
  }>;
  quickReplies?: string[];
  intent?: AssistantIntent;
  toolId?: string;
  userQuery?: string;
  feedbackGiven?: 'helpful' | 'not-helpful';
  timestamp: string;
}

const PRESET_PROMPTS = [
  '📄 Make ATS Resume',
  '📈 Calculate SIP Growth',
  '🎓 Attendance & Bunk Calc',
  '🗜️ Compress PDF File',
  '💼 Salary & Tax In-Hand',
  '🏦 Loan EMI Calculator',
];

const WELCOME_TEXT = `Hi! I'm Navi 👋
Your private NAVIKO assistant.

I can help you find the right NAVIKO tool, calculate investments and EMIs, check college attendance, or format ATS resumes — 100% free with no external API keys.

What would you like to accomplish today?`;

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Session context for multi-turn local intelligence
  const [sessionContext, setSessionContext] = useState<SessionContext>(createInitialContext);

  // Feedback Modal State
  const [feedbackModalMsg, setFeedbackModalMsg] = useState<Message | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>('WRONG_ANSWER');
  const [feedbackRating, setFeedbackRating] = useState<number>(3);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSuccessBanner, setFeedbackSuccessBanner] = useState<boolean>(false);
  const [feedbackSuccessText, setFeedbackSuccessText] = useState<string>(
    'Thanks! Your feedback has been recorded.'
  );

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: WELCOME_TEXT,
      quickReplies: ['📈 Calculate SIP', '📄 Make ATS Resume', '🗜️ Compress PDF', '🏦 Loan EMI'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

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

    // Natural brief response delay
    setTimeout(() => {
      const { response, nextContext } = processUserQuery(query, sessionContext);
      setSessionContext(nextContext);

      const botMsg: Message = {
        id: response.id,
        sender: 'bot',
        text: response.text,
        action: response.actionButton,
        rankedTools: response.rankedTools?.map((t) => ({
          id: t.id,
          name: t.name,
          route: t.route,
        })),
        quickReplies: response.quickReplies,
        intent: response.intent,
        toolId: response.recommendedTool?.id,
        userQuery: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 280);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setSessionContext(createInitialContext());
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: WELCOME_TEXT,
        quickReplies: ['📈 Calculate SIP', '📄 Make ATS Resume', '🗜️ Compress PDF', '🏦 Loan EMI'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleHelpfulClick = (msg: Message) => {
    const feedbackItem = submitFeedback({
      messageId: msg.id,
      query: msg.userQuery || 'N/A',
      helpful: true,
      rating: 5,
      intent: msg.intent || 'UNKNOWN',
      toolId: msg.toolId,
      userId: user?.id ? String(user.id) : undefined,
      isAnonymous: !user?.id,
    });

    // Store feedback in the existing session context
    setSessionContext((prev) => addFeedbackToSessionContext(prev, feedbackItem));

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedbackGiven: 'helpful' } : m))
    );

    setFeedbackSuccessText('Thanks! Marked helpful 👍');
    setFeedbackSuccessBanner(true);
    setTimeout(() => setFeedbackSuccessBanner(false), 3000);
  };

  const handleNotHelpfulClick = (msg: Message) => {
    setFeedbackModalMsg(msg);
    setSelectedCategory('WRONG_ANSWER');
    setFeedbackRating(2);
    setFeedbackComment('');
  };

  const handleSubmitDetailedFeedback = () => {
    if (!feedbackModalMsg) return;

    const feedbackItem = submitFeedback({
      messageId: feedbackModalMsg.id,
      query: feedbackModalMsg.userQuery || 'N/A',
      helpful: false,
      rating: feedbackRating,
      category: selectedCategory,
      comment: feedbackComment.trim() || undefined,
      intent: feedbackModalMsg.intent || 'UNKNOWN',
      toolId: feedbackModalMsg.toolId,
      userId: user?.id ? String(user.id) : undefined,
      isAnonymous: !user?.id,
    });

    // Store feedback in the existing session context
    setSessionContext((prev) => addFeedbackToSessionContext(prev, feedbackItem));

    setMessages((prev) =>
      prev.map((m) => (m.id === feedbackModalMsg.id ? { ...m, feedbackGiven: 'not-helpful' } : m))
    );

    setFeedbackModalMsg(null);
    setFeedbackSuccessText('Thanks! Your feedback has been recorded.');
    setFeedbackSuccessBanner(true);
    setTimeout(() => setFeedbackSuccessBanner(false), 4000);
  };

  // Extract quick replies from the latest bot message
  const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
  const activeQuickReplies = lastBotMsg?.quickReplies;

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            id="navi-chat-button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30"
            aria-label="Open Navi Assistant"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">Ask Navi</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-950">
              Assistant
            </span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div
          id="navi-chat-window"
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[85vh]'
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
                  <h3 className="font-bold text-sm text-white">Navi Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Local Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">100% Private • No API keys required</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="navi-minimize-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                id="navi-clear-btn"
                onClick={handleResetChat}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Chat Session"
                aria-label="Reset Chat Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="navi-close-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Feedback Success Notification */}
              {feedbackSuccessBanner && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-3.5 py-2 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between transition-all shrink-0">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {feedbackSuccessText}
                  </span>
                  <button
                    onClick={() => setFeedbackSuccessBanner(false)}
                    className="text-emerald-600 dark:text-emerald-400 hover:opacity-75"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

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

                    <div className="max-w-[86%] space-y-1.5 group">
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <div className="whitespace-pre-line break-words">
                          {msg.text.split('\n').map((line, lIdx) => {
                            const formatted = line
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>'
                              )
                              .replace(
                                /`(.*?)`/g,
                                '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">$1</code>'
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

                        {/* Action Link Button */}
                        {msg.action && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id={`navi-action-${msg.id}`}
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

                        {/* Ranked Tool Suggestions (when multiple apply) */}
                        {msg.rankedTools && msg.rankedTools.length > 1 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Related Tools
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                              {msg.rankedTools.slice(0, 4).map((tool) => (
                                <button
                                  key={tool.id}
                                  onClick={() => {
                                    onNavigate(tool.route);
                                    setIsOpen(false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/60 dark:border-slate-700/60 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span>{tool.name}</span>
                                  <ArrowRight className="w-3 h-3 text-indigo-500" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedback UI Block after AI Responses */}
                        {msg.sender === 'bot' && msg.id !== 'msg-welcome' && (
                          <div
                            id={`feedback-block-${msg.id}`}
                            className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400"
                          >
                            {msg.feedbackGiven ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                {msg.feedbackGiven === 'helpful' ? 'Marked helpful 👍' : 'Feedback recorded 👎'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-medium">Was this helpful?</span>
                                <div className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70">
                                  <button
                                    id={`feedback-thumbs-up-${msg.id}`}
                                    onClick={() => handleHelpfulClick(msg)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer font-medium text-[11px]"
                                    title="Helpful"
                                    aria-label="Helpful"
                                  >
                                    <span role="img" aria-label="thumbs up">👍</span>
                                    <span>Helpful</span>
                                  </button>
                                  <button
                                    id={`feedback-thumbs-down-${msg.id}`}
                                    onClick={() => handleNotHelpfulClick(msg)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer font-medium text-[11px]"
                                    title="Not helpful"
                                    aria-label="Not helpful"
                                  >
                                    <span role="img" aria-label="thumbs down">👎</span>
                                    <span>Not helpful</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300 transition-opacity flex items-center gap-1 cursor-pointer p-1"
                              title="Copy text"
                              aria-label="Copy text"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'user' && (
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-300 transition-opacity flex items-center gap-1 cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
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

              {/* Contextual Quick Replies */}
              {activeQuickReplies && activeQuickReplies.length > 0 && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                  {activeQuickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      id={`quick-reply-${idx}`}
                      onClick={() => handleSend(reply)}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer shadow-2xs"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Preset suggestion chips (when no active contextual quick replies) */}
              {(!activeQuickReplies || activeQuickReplies.length === 0) && (
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
              )}

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
                    id="navi-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for a tool, formula, or calculation..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    id="navi-send-btn"
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

          {/* Feedback Modal / Overlay */}
          {feedbackModalMsg && (
            <div
              id="feedback-modal"
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
            >
              <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      What could be improved?
                    </h4>
                  </div>
                  <button
                    onClick={() => setFeedbackModalMsg(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating 1-5 stars */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Rate this response:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Select a reason:
                  </label>
                  <div className="space-y-1">
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                          selectedCategory === cat.id
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                            : 'border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedbackCategory"
                          value={cat.id}
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                        />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Optional Comment */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Additional feedback (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what could be improved..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalMsg(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-feedback-btn"
                    type="button"
                    onClick={handleSubmitDetailedFeedback}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Submit feedback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
