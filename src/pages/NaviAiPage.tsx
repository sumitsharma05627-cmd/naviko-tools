import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Globe,
  Sun,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateKundli, BirthDetails } from '../services/astrology/calculationEngine';

interface NaviAiPageProps {
  onNavigate: (path: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'navi';
  text: string;
  timestamp: string;
  source?: string;
}

export const NaviAiPage: React.FC<NaviAiPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cached sample Kundli Context for authentic grounded answers
  const [kundliContext] = useState(() =>
    generateKundli({
      name: user?.name || 'Aarav',
      year: 1998,
      month: 11,
      day: 15,
      hour: 14,
      minute: 30,
      city: 'New Delhi',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    })
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'navi',
      text:
        language === 'hi'
          ? `प्रणाम! मैं **NAVI** हूँ, NAVIKO 3.0 का आपका वैदिक ज्योतिष (Jyotish) व वास्तु सलाहकार। मैं प्रामाणिक पंचांग, गणना-आधारित कुंडली और पारंपरिक वास्तु सिद्धांतों पर मार्गदर्शन प्रदान करता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?`
          : `Namaste! I am **NAVI**, your dedicated Vedic Astrology and Vastu Shastra AI guide on NAVIKO 3.0. Grounded strictly in classical Indian ephemeris calculations and Vastu Purusha Mandala principles, I explain charts, Dasha life cycles, and directional balance with clarity and no fear-based predictions. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/astrology/navi-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          language,
          kundliContext,
          vastuContext: {
            propertyType: 'Home',
            facingDirection: 'East',
            overallScore: 82,
            grade: 'A',
          },
        }),
      });

      const data = await response.json();
      const naviMsg: ChatMessage = {
        id: `navi_${Date.now()}`,
        sender: 'navi',
        text: data.reply || 'I am reflecting upon your query according to classical Vedic principles.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, naviMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'navi',
        text:
          language === 'hi'
            ? 'क्षमा करें, उत्तर प्राप्त करने में तकनीकी समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Apologies, I encountered a connection delay. Please re-submit your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    {
      en: 'What does my current Vimshottari Mahadasha indicate?',
      hi: 'मेरी वर्तमान विंशोत्तरी महादशा क्या संकेत देती है?',
    },
    {
      en: 'Where should the kitchen and Mandir be placed according to Vastu?',
      hi: 'वास्तु के अनुसार रसोई और पूजा घर कहाँ होना चाहिए?',
    },
    {
      en: 'Can you explain the significance of Budhaditya Yoga?',
      hi: 'बुधादित्य योग का क्या महत्व और प्रभाव होता है?',
    },
    {
      en: 'What are effective practical remedies for West-facing homes?',
      hi: 'पश्चिम मुखी मकान के लिए व्यावहारिक वास्तु उपाय क्या हैं?',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span className="text-white">NAVI AI Vedic Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-amber-400" />
              <span>NAVI AI Astrological Guide</span>
            </h1>
          </div>

          {/* Bilingual Language Switcher */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-[#0d1326] rounded-3xl border border-indigo-900/60 shadow-2xl overflow-hidden flex flex-col h-[640px]">
          {/* Active Context Banner */}
          <div className="bg-[#090f21] px-5 py-2.5 border-b border-indigo-950 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Grounded in verified Vedic calculations
            </span>
            <span>
              Lagna: <strong>{kundliContext.ascendant.rashiName}</strong> • Moon: <strong>{kundliContext.moonDetails.rashiName} ({kundliContext.moonDetails.nakshatraName})</strong> • Mahadasha: <strong>{kundliContext.vimshottariDasha.currentMahadasha}</strong>
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-1">
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="uppercase tracking-wider text-[9px] text-amber-400/80 font-bold">
                        {msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Classical Ephemeris'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>NAVI is consulting Vedic astronomical rules &amp; Shastras...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="p-3 bg-[#0a0f21] border-t border-indigo-950/70 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-2">
              Suggestions:
            </span>
            {PROMPT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(language === 'hi' ? item.hi : item.en)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
              >
                {language === 'hi' ? item.hi : item.en}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-[#090e1f] border-t border-indigo-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'अपनी कुंडली, दशा या वास्तु संबंधित प्रश्न पूछें...'
                    : 'Ask about your Kundli chart, Dasha transit, or Vastu direction...'
                }
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-amber-500/20"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Ethical Standards & Safety Assurance */}
        <div className="p-4 rounded-2xl bg-[#0d1326] border border-amber-500/20 text-xs text-slate-300 space-y-1">
          <div className="font-black text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>NAVI Ethical AI Constitution</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            NAVI combines classical Brihat Parashara Hora Shastra rules with the Google Gemini API. NAVI strictly refrains from deterministic fatalism, health scare-mongering, or recommending costly rituals. All interpretations provide reflective spiritual and psychological empowerment.
          </p>
        </div>
      </div>
    </div>
  );
};
