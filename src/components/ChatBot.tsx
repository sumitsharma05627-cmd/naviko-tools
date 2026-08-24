import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Calculator,
  RotateCcw,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  FileText,
  Percent,
  Sliders,
  Compass
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
  timestamp: string;
}

const PRESET_PROMPTS = [
  '📄 Merge or Compress PDF',
  '🎓 Attendance & Bunk Calculator',
  '📈 Calculate SIP Growth',
  '🖼️ Remove Image Background',
  '💼 In-Hand Salary & Tax Slabs',
  '🧮 Open Scientific Calculator',
];

const WELCOME_TEXT = `Hi! I'm Navi 👋
Your private NAVIKO assistant.

I can help you find the right NAVIKO tool, perform supported calculations, and guide you around the website — without requiring an API key.

What would you like to do?`;

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: WELCOME_TEXT,
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

  // Safe client-side math & dedicated formula evaluator
  const tryEvaluateSpecificCalculations = (
    query: string
  ): { text: string; action?: { label: string; path: string } } | null => {
    const q = query.toLowerCase().trim();

    // 1. CGPA Conversion e.g. "8.4 cgpa" or "cgpa 9.0 to percentage"
    const cgpaMatch = q.match(/(?:cgpa|gpa)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)/i) ||
                      q.match(/(\d+(?:\.\d+)?)\s*(?:cgpa|gpa)/i);
    if (cgpaMatch && (q.includes('to') || q.includes('percent') || q.includes('percentage') || q.includes('convert') || q.includes('cgpa') || q.includes('gpa'))) {
      const cgpaVal = parseFloat(cgpaMatch[1]);
      if (cgpaVal >= 0 && cgpaVal <= 10) {
        const standardPct = (cgpaVal * 9.5).toFixed(2);
        return {
          text: `🎓 **CGPA to Percentage Calculation**\n\n• **CGPA**: ${cgpaVal}\n• **Standard Percentage (CBSE / 9.5 Formula)**: **${standardPct}%**\n\nFor 10-point scale universities using (CGPA - 0.75) × 10, it equals **${((cgpaVal - 0.75) * 10).toFixed(2)}%**.`,
          action: { label: 'Open CGPA Calculator', path: '/tools/cgpa-calculator' },
        };
      }
    }

    // 2. GST Calculation e.g. "18% gst on 5000" or "gst 18% 2500"
    const gstMatch = q.match(/(\d+(?:\.\d+)?)%\s*gst\s*(?:on|\*|of)?\s*(\d+(?:\.\d+)?)/i) ||
                     q.match(/gst\s*(?:of|at)?\s*(\d+(?:\.\d+)?)%\s*(?:on|\*|of)?\s*(\d+(?:\.\d+)?)/i);
    if (gstMatch) {
      const rate = parseFloat(gstMatch[1]);
      const base = parseFloat(gstMatch[2]);
      if (rate > 0 && base > 0) {
        const gstAmount = (base * rate) / 100;
        const total = base + gstAmount;
        return {
          text: `🧾 **GST Calculation Result**\n\n• **Base Amount**: ₹${base.toLocaleString('en-IN')}\n• **GST Rate**: ${rate}%\n• **GST Amount**: ₹${gstAmount.toLocaleString('en-IN')}\n• **Total Amount (Inclusive)**: **₹${total.toLocaleString('en-IN')}**`,
          action: { label: 'Open GST Calculator', path: '/tools/gst-calculator' },
        };
      }
    }

    // 3. Discount Calculation e.g. "20% discount on 1500" or "25% off 4000"
    const discountMatch = q.match(/(\d+(?:\.\d+)?)%\s*(?:discount|off)\s*(?:on|from|of)?\s*(\d+(?:\.\d+)?)/i);
    if (discountMatch) {
      const disc = parseFloat(discountMatch[1]);
      const price = parseFloat(discountMatch[2]);
      if (disc > 0 && price > 0) {
        const saved = (price * disc) / 100;
        const finalPrice = price - saved;
        return {
          text: `🏷️ **Discount Calculation Result**\n\n• **Original Price**: ₹${price.toLocaleString('en-IN')}\n• **Discount**: ${disc}% (Savings: ₹${saved.toLocaleString('en-IN')})\n• **Final Price**: **₹${finalPrice.toLocaleString('en-IN')}**`,
          action: { label: 'Open Discount Calculator', path: '/tools/discount-calculator' },
        };
      }
    }

    // 4. Attendance ratio e.g. "attended 34 out of 45" or "attendance 30/40"
    const attMatch = q.match(/(?:attendance|attended)\s*(\d+)\s*(?:out of|\/)\s*(\d+)/i) ||
                     q.match(/(\d+)\s*(?:out of|\/)\s*(\d+)\s*(?:attendance|classes)/i);
    if (attMatch) {
      const attended = parseInt(attMatch[1], 10);
      const total = parseInt(attMatch[2], 10);
      if (total > 0 && attended <= total) {
        const pct = ((attended / total) * 100).toFixed(1);
        const meets75 = parseFloat(pct) >= 75;
        return {
          text: `📊 **Attendance Calculation**\n\n• **Attended**: ${attended} / ${total} classes\n• **Current Attendance**: **${pct}%**\n• **75% Criteria**: ${
            meets75
              ? `✅ You are safe! You meet the 75% requirement.`
              : `⚠️ Below 75%! You need to attend more classes to reach the requirement.`
          }`,
          action: { label: 'Open Attendance & Bunk Calculator', path: '/tools/attendance-calculator' },
        };
      }
    }

    // 5. Percentage of a number e.g. "15% of 50000"
    const cleaned = q.replace(/calculate|what is|compute|solve|\?/g, '').trim();
    const pctMatch = cleaned.match(/(\d+(?:\.\d+)?)%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const val = parseFloat(pctMatch[2]);
      const res = (pct / 100) * val;
      return {
        text: `🧮 **Percentage Calculation Result:**\n\n${pct}% of ${val.toLocaleString('en-IN')} = **${res.toLocaleString('en-IN')}**`,
        action: { label: 'Open Percentage Calculator', path: '/tools/percentage-calculator' },
      };
    }

    // 6. General arithmetic expressions e.g. "45 * 120 + 350", "(5000 / 12) + 100"
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
          return {
            text: `🧮 **Math Calculation Result:**\n\n${sanitized} = **${rounded.toLocaleString('en-IN')}**`,
            action: { label: 'Open Number Calculator', path: '/tools/number-calculator' },
          };
        }
      } catch {
        return null;
      }
    }

    return null;
  };

  // Rule-based intent matcher for all NAVIKO tools and common topics
  const processQuery = (rawQuery: string): { text: string; action?: { label: string; path: string } } => {
    const q = rawQuery.toLowerCase().trim();

    // Check specific calculations first
    const calcRes = tryEvaluateSpecificCalculations(q);
    if (calcRes) {
      return calcRes;
    }

    // --- PDF Tools ---
    if (q.includes('merge pdf') || q.includes('combine pdf') || q.includes('join pdf') || q.includes('merge documents') || q.includes('merge files')) {
      return {
        text: '📄 **Merge PDF Files**\n\nCombine multiple PDF documents into a single organized file in your custom order. 100% private and runs in your browser without uploading files to any server.',
        action: { label: 'Open PDF Merge Tool', path: '/tools/pdf-merge' },
      };
    }

    if (q.includes('compress pdf') || q.includes('reduce pdf') || q.includes('shrink pdf') || q.includes('pdf size') || q.includes('pdf kb')) {
      return {
        text: '🗜️ **PDF Compressor**\n\nReduce PDF file sizes for emails, college portals, and job applications while preserving high text and image clarity.',
        action: { label: 'Open PDF Compressor', path: '/tools/pdf-compressor' },
      };
    }

    if (q.includes('jpg to pdf') || q.includes('image to pdf') || q.includes('png to pdf') || q.includes('photo to pdf') || q.includes('convert images to pdf')) {
      return {
        text: '🖼️ **JPG to PDF Converter**\n\nConvert photos, document scans, and PNG/JPG images into formatted A4 or Letter PDF documents with custom margins and orientations.',
        action: { label: 'Open JPG to PDF Converter', path: '/tools/jpg-to-pdf' },
      };
    }

    if (q.includes('pdf to jpg') || q.includes('pdf to image') || q.includes('pdf to png') || q.includes('extract pdf images') || q.includes('convert pdf to images')) {
      return {
        text: '📸 **PDF to JPG Converter**\n\nExtract and convert every page of your PDF documents into crystal-clear high-resolution JPG or PNG images with 1-click bulk ZIP download.',
        action: { label: 'Open PDF to JPG Converter', path: '/tools/pdf-to-jpg' },
      };
    }

    if (q.includes('split pdf') || q.includes('extract pdf') || q.includes('cut pdf') || q.includes('separate pdf')) {
      return {
        text: '✂️ **Split PDF Pages**\n\nExtract specific page ranges (e.g., 1-4, 7) or split a large multi-page document into individual single-page PDF files.',
        action: { label: 'Open PDF Split Tool', path: '/tools/pdf-split' },
      };
    }

    if (q === 'pdf' || q.includes('pdf tools') || q.includes('all pdf')) {
      return {
        text: '📑 **NAVIKO PDF Utilities Suite**\n\nWe provide 5 browser-based PDF tools with zero server uploads:\n\n1. **Merge PDF**: Combine multiple files\n2. **Compress PDF**: Shrink file size\n3. **JPG to PDF**: Images to document\n4. **PDF to JPG**: High-resolution page export\n5. **Split PDF**: Extract page ranges',
        action: { label: 'Explore PDF Tools Hub', path: '/pdf-tools' },
      };
    }

    // --- Image Tools ---
    if (q.includes('crop') || q.includes('aspect ratio') || q.includes('passport photo crop') || q.includes('crop image')) {
      return {
        text: '📐 **Image Cropper**\n\nCrop and adjust photos with aspect ratio presets (1:1 Square, 16:9, 4:3, 3:2, and Indian Passport Photo 3.5×4.5 cm), zoom slider, and 90° rotation.',
        action: { label: 'Open Image Cropper', path: '/tools/image-cropper' },
      };
    }

    if (q.includes('background remover') || q.includes('remove background') || q.includes('bg remover') || q.includes('transparent background') || q.includes('cutout')) {
      return {
        text: '🪄 **Background Remover**\n\nRemove solid photo backgrounds, isolate product shots and signatures, and export transparent PNGs with custom tolerance and edge feathering.',
        action: { label: 'Open Background Remover', path: '/tools/background-remover' },
      };
    }

    if (q.includes('jpg to png') || q.includes('jpeg to png')) {
      return {
        text: '🔄 **JPG to PNG Converter**\n\nConvert JPEG images to high-quality lossless PNG format with optional background transparency controls and batch ZIP download.',
        action: { label: 'Open JPG to PNG Converter', path: '/tools/jpg-to-png' },
      };
    }

    if (q.includes('png to jpg') || q.includes('png to jpeg')) {
      return {
        text: '🔄 **PNG to JPG Converter**\n\nConvert PNG graphics and screenshots to lightweight JPG images with custom background canvas fill (white, black, custom hex) and quality controls.',
        action: { label: 'Open PNG to JPG Converter', path: '/tools/png-to-jpg' },
      };
    }

    if (q.includes('compress image') || q.includes('reduce image size') || q.includes('shrink image') || q.includes('image under 50kb') || q.includes('photo kb')) {
      return {
        text: '🗜️ **Image Compressor**\n\nCompress JPG, PNG, and WebP images down to exact file size targets (e.g. under 20KB or 50KB for government portals and exam registrations).',
        action: { label: 'Open Image Compressor', path: '/tools/image-compressor' },
      };
    }

    if (q.includes('resize image') || q.includes('image dimensions') || q.includes('scale image') || q.includes('change width height')) {
      return {
        text: '🖼️ **Image Resizer**\n\nScale image dimensions (width & height in pixels or percentage) with aspect ratio lock and file format conversion.',
        action: { label: 'Open Image Resizer', path: '/tools/image-resizer' },
      };
    }

    if (q === 'image' || q.includes('image tools') || q.includes('photo tools')) {
      return {
        text: '🎨 **NAVIKO Image Utilities Suite**\n\nClient-side image tools running in browser memory:\n\n• **Background Remover**: Create transparent cutouts\n• **Image Cropper**: Crop with standard presets\n• **JPG to PNG / PNG to JPG**: Format converters\n• **Image Compressor & Resizer**: Exact KB optimization',
        action: { label: 'Explore Image Tools Hub', path: '/image-tools' },
      };
    }

    // --- Student & Academic Tools ---
    if (q.includes('decision') || q.includes('study decision') || q.includes('study plan') || q.includes('personalized study plan')) {
      return {
        text: '🧭 **Study Decision Planner**\n\nCreate a realistic, personalized study plan based on your exam deadline, target score, available hours, subject difficulty, and revision needs with instant feasibility scoring.',
        action: { label: 'Open Study Decision Planner', path: '/student-tools/study-decision-planner' },
      };
    }

    if (q.includes('backlog') || q.includes('syllabus backlog') || q.includes('recover backlog') || q.includes('catch up on syllabus') || q.includes('behind schedule')) {
      return {
        text: '📚 **Backlog Recovery Planner**\n\nGenerate a day-by-day structured recovery roadmap with difficulty-adjusted workloads, revision buffers, and an interactive chapter tracker to clear pending chapters without burning out.',
        action: { label: 'Open Backlog Recovery Planner', path: '/student-tools/backlog-recovery-planner' },
      };
    }

    if (q.includes('can i finish') || q.includes('finish syllabus') || q.includes('complete syllabus') || q.includes('finish my syllabus') || q.includes('syllabus calculator')) {
      return {
        text: '⏱️ **Can I Finish My Syllabus? Calculator**\n\nInstantly check if your available daily study hours are enough to finish remaining chapters before your exam date, with exact buffer calculations and what-if pace adjustments.',
        action: { label: 'Check Syllabus Feasibility', path: '/student-tools/can-i-finish-my-syllabus' },
      };
    }

    if (q.includes('mock test') || q.includes('mock analyzer') || q.includes('test series') || q.includes('mock score') || q.includes('test accuracy') || q.includes('score trajectory')) {
      return {
        text: '📈 **Mock Test Performance Analyzer**\n\nLog mock test scores, view your score trajectory on interactive charts, calculate net accuracy vs negative marking, and identify your strongest and weakest subjects.',
        action: { label: 'Open Mock Test Analyzer', path: '/student-tools/mock-test-analyzer' },
      };
    }

    if (q.includes('attendance') || q.includes('bunk') || q.includes('75%') || q.includes('75 percent') || q.includes('skip class') || q.includes('how many classes')) {
      return {
        text: '🎓 **Attendance & Bunk Calculator**\n\nCalculate your exact attendance percentage and see how many classes you can safely bunk while staying above 75%, or how many consecutive classes you must attend to recover.',
        action: { label: 'Open Attendance Calculator', path: '/tools/attendance-calculator' },
      };
    }

    if (q.includes('cgpa') || q.includes('gpa') || q.includes('convert cgpa') || q.includes('grade point') || q.includes('marks to percentage')) {
      return {
        text: '🎓 **CGPA to Percentage Calculator**\n\nConvert university and CBSE CGPA into percentage. The standard formula is **Percentage = CGPA × 9.5**. Also supports custom college conversion formulas.',
        action: { label: 'Open CGPA Calculator', path: '/tools/cgpa-calculator' },
      };
    }

    if (q.includes('timetable') || q.includes('study timetable') || q.includes('study plan') || q.includes('revision schedule')) {
      return {
        text: '📅 **Study Timetable Generator**\n\nGenerate customized daily and weekly study schedules based on your subjects, exam dates, difficulty levels, and preferred study hours.',
        action: { label: 'Open Timetable Generator', path: '/tools/study-timetable-generator' },
      };
    }

    if (q.includes('random question') || q.includes('interview question') || q.includes('quiz') || q.includes('study questions')) {
      return {
        text: '❓ **Random Question Generator**\n\nPractice interview prep, coding concepts, general knowledge, aptitude, and revision questions categorized by topic.',
        action: { label: 'Open Question Generator', path: '/tools/random-question-generator' },
      };
    }

    if (q.includes('typing') || q.includes('speed test') || q.includes('wpm') || q.includes('typing test')) {
      return {
        text: '⌨️ **Typing Speed Test**\n\nMeasure your Words Per Minute (WPM), net accuracy, and error rate with timed passages and real-time keystroke feedback.',
        action: { label: 'Take Typing Test', path: '/tools/typing-speed-test' },
      };
    }

    if (q.includes('resume') || q.includes('cv') || q.includes('ats resume') || q.includes('resume builder')) {
      return {
        text: '📄 **ATS-Friendly Resume Builder**\n\nBuild clean, professional, single-column resumes engineered to pass automated Applicant Tracking Systems with instant PDF export.',
        action: { label: 'Open Resume Builder', path: '/tools/resume-builder' },
      };
    }

    if (q.includes('student tools') || q.includes('student hub') || q.includes('college tools')) {
      return {
        text: '🎓 **NAVIKO Student Tools Hub**\n\nDedicated utilities for high school and university students:\n\n• Attendance & Bunk Calculator\n• CGPA to Percentage Converter\n• Study Timetable Generator\n• ATS Resume Builder\n• Typing Speed Test & Practice Questions',
        action: { label: 'Open Student Tools Hub', path: '/student-tools' },
      };
    }

    // --- Financial Tools ---
    if (q.includes('debt') || q.includes('debt clock') || q.includes('national debt') || q.includes('public debt') || q.includes('india debt') || q.includes('gdp ratio')) {
      return {
        text: '🇮🇳 **Government Debt Estimator & Clock (India & World)**\n\n• **Central Govt Liabilities (Union Budget)**: ~₹185.27 Lakh Crore (56.8% of GDP)\n• **General Govt Debt (Centre + States)**: ~₹265.30 Lakh Crore (81.3% of GDP)\n• **Estimated Net Annual Borrowing Rate**: +₹5.12 Lakh / second (Union Budget fiscal deficit)\n• **Debt Equivalent Per Citizen**: ~₹1,28,660\n• Includes comparative models for USA, Japan, UK, China, and Germany with transparent official methodologies.',
        action: { label: 'Open Debt Estimator', path: '/tools/debt-clock' },
      };
    }

    if (q.includes('sip') || q.includes('systematic investment') || q.includes('mutual fund') || q.includes('step up sip')) {
      return {
        text: '📈 **SIP & Step-Up Calculator**\n\nCalculate mutual fund wealth compounding over 5 to 30 years. Easily model annual step-up contributions to see the exponential impact on your final maturity corpus.',
        action: { label: 'Open SIP Calculator', path: '/tools/sip-calculator' },
      };
    }

    if (q.includes('lump sum') || q.includes('lumpsum') || q.includes('one time investment')) {
      return {
        text: '💰 **Lump Sum Investment Calculator**\n\nCalculate estimated returns on one-time mutual fund investments, stocks, or index funds using compound annual interest formulas.',
        action: { label: 'Open Lump Sum Calculator', path: '/tools/lump-sum-calculator' },
      };
    }

    if (q.includes('salary') || q.includes('in hand') || q.includes('in-hand') || q.includes('tax regime') || q.includes('ctc') || q.includes('take home') || q.includes('tax slab')) {
      return {
        text: '💼 **Salary & In-Hand Tax Calculator**\n\nBreakdown gross CTC into Monthly In-Hand Take-Home, EPF, Professional Tax, and Income Tax with the latest New Tax Regime ₹75,000 standard deduction and slab comparisons.',
        action: { label: 'Calculate In-Hand Salary', path: '/tools/salary-calculator' },
      };
    }

    if (q.includes('emi') || q.includes('loan') || q.includes('home loan') || q.includes('car loan') || q.includes('personal loan')) {
      return {
        text: '🏦 **Loan EMI Calculator**\n\nCalculate exact monthly EMI installments, total interest payable, loan-to-interest breakdown, and complete year-by-year amortization schedules.',
        action: { label: 'Open EMI Calculator', path: '/tools/emi-calculator' },
      };
    }

    if (q.includes('gst') || q.includes('tax calculation')) {
      return {
        text: '🧾 **GST Calculator**\n\nCompute GST (5%, 12%, 18%, 28%) for both GST-Exclusive and GST-Inclusive pricing, with complete CGST & SGST / IGST tax splits.',
        action: { label: 'Open GST Calculator', path: '/tools/gst-calculator' },
      };
    }

    if (q.includes('compound interest') || q.includes('compounding')) {
      return {
        text: '📊 **Compound Interest Calculator**\n\nCalculate compound interest with flexible compounding frequencies (Monthly, Quarterly, Half-Yearly, Annually) and optional periodic deposits.',
        action: { label: 'Open Compound Interest Calculator', path: '/tools/compound-interest-calculator' },
      };
    }

    if (q.includes('simple interest') || q.includes('si calculator')) {
      return {
        text: '💵 **Simple Interest Calculator**\n\nCalculate simple interest using the fundamental formula `SI = (P × R × T) / 100` with clear principle vs interest breakdown.',
        action: { label: 'Open Simple Interest Calculator', path: '/tools/simple-interest-calculator' },
      };
    }

    if (q.includes('cagr') || q.includes('compound annual growth')) {
      return {
        text: '📈 **CAGR Calculator**\n\nCalculate the Compound Annual Growth Rate of any investment: `CAGR = ((End Value / Start Value) ^ (1 / Years)) - 1`.',
        action: { label: 'Open CAGR Calculator', path: '/tools/cagr-calculator' },
      };
    }

    if (q.includes('fd') || q.includes('fixed deposit') || q.includes('bank fd')) {
      return {
        text: '🏦 **Fixed Deposit (FD) Calculator**\n\nCalculate bank FD maturity amounts, quarterly compounding returns, and total interest for regular and senior citizens.',
        action: { label: 'Open FD Calculator', path: '/tools/fd-calculator' },
      };
    }

    if (q.includes('fire') || q.includes('retire early') || q.includes('4% rule') || q.includes('financial independence')) {
      return {
        text: '🔥 **FIRE (Financial Independence, Retire Early)**\n\nThe 4% Safe Withdrawal Rule suggests building a nest egg of **25x your annual expenses**. For example, ₹10 Lakhs annual expense requires a target corpus of `₹10L × 25 = ₹2.5 Crores`.',
        action: { label: 'Open FIRE Calculator', path: '/tools/fire-calculator' },
      };
    }

    if (q.includes('inflation') || q.includes('purchasing power') || q.includes('future value')) {
      return {
        text: '📉 **Inflation Calculator**\n\nEstimate how inflation erodes purchasing power over time and determine what future basket of expenses will cost.',
        action: { label: 'Open Inflation Calculator', path: '/tools/inflation-calculator' },
      };
    }

    if (q.includes('50/30/20') || q.includes('50 30 20') || q.includes('budget') || q.includes('budgeting rule')) {
      return {
        text: '💡 **The 50/30/20 Budgeting Rule**\n\n• **50% Needs**: Rent, groceries, utility bills, EMIs\n• **30% Wants**: Entertainment, dining out, leisure\n• **20% Savings**: SIPs, emergency funds, debt payoff',
        action: { label: 'Open Budget Calculator', path: '/tools/budget-calculator' },
      };
    }

    if (q.includes('rule of 72') || q.includes('double money')) {
      return {
        text: '⚡ **The Rule of 72**\n\nTo estimate how many years it takes to double your investment at a fixed annual return `R%`, divide 72 by `R`.\n\n*Example:* At 12% expected annual return, `72 / 12 = 6 years` to double your capital.',
        action: { label: 'Calculate SIP Compounding', path: '/tools/sip-calculator' },
      };
    }

    if (q.includes('finance tools') || q.includes('investment tools') || q.includes('money tools')) {
      return {
        text: '💰 **NAVIKO Financial Tools Hub**\n\nOur full suite of 13+ financial calculators includes SIP, Lump Sum, EMI, Salary In-Hand, GST, Compound Interest, FD, FIRE, Debt Clock, and Budgeting.',
        action: { label: 'Open Finance Tools Hub', path: '/finance-tools' },
      };
    }

    // --- Math & Daily Utilities ---
    if (q.includes('scientific') || q.includes('sin') || q.includes('cos') || q.includes('tan') || q.includes('log') || q.includes('trig') || q.includes('radian')) {
      return {
        text: '📐 **Scientific Calculator**\n\nFeatures Trigonometry, Hyperbolic functions, Logarithms (ln, log10), Exponents, Square & Cube Roots, Radian/Degree toggles, and constants (π, e, φ).',
        action: { label: 'Open Scientific Calculator', path: '/tools/scientific-calculator' },
      };
    }

    if (q.includes('percentage') || q.includes('percent')) {
      return {
        text: '🔢 **Percentage Calculator**\n\nSolve percentage problems: "What is X% of Y?", "X is what % of Y?", percentage increase/decrease, and discount values.',
        action: { label: 'Open Percentage Calculator', path: '/tools/percentage-calculator' },
      };
    }

    if (q.includes('discount') || q.includes('sale price')) {
      return {
        text: '🏷️ **Discount Calculator**\n\nCalculate discounted final prices, total savings, and additional stacked percentage discounts for retail sales.',
        action: { label: 'Open Discount Calculator', path: '/tools/discount-calculator' },
      };
    }

    if (q.includes('age') || q.includes('birthday') || q.includes('dob') || q.includes('how old')) {
      return {
        text: '🎂 **Age & Birthday Calculator**\n\nFind your exact age in years, months, and days, along with a live countdown to your next birthday and total days lived.',
        action: { label: 'Open Age Calculator', path: '/tools/age-calculator' },
      };
    }

    if (q.includes('unit converter') || q.includes('convert units') || q.includes('km to miles') || q.includes('kg to lbs') || q.includes('celsius to fahrenheit')) {
      return {
        text: '🔄 **Unit Converter**\n\nConvert between length, weight, temperature, speed, area, and digital storage units with instant bidirectional calculations.',
        action: { label: 'Open Unit Converter', path: '/tools/unit-converter' },
      };
    }

    if (q.includes('word counter') || q.includes('character count') || q.includes('count words') || q.includes('reading time')) {
      return {
        text: '📝 **Word Counter & Text Analyzer**\n\nAnalyze text for word count, character count, sentence count, estimated reading & speaking time, and keyword density.',
        action: { label: 'Open Word Counter', path: '/tools/word-counter' },
      };
    }

    if (q.includes('qr code') || q.includes('create qr') || q.includes('generate qr') || q.includes('qr generator')) {
      return {
        text: '📱 **QR Code Generator**\n\nGenerate custom QR codes for URLs, WiFi networks, contact vCards, emails, and plain text with PNG & SVG downloads.',
        action: { label: 'Open QR Code Generator', path: '/tools/qr-code-generator' },
      };
    }

    if (q.includes('calculator') || q.includes('basic calc') || q.includes('number calculator')) {
      return {
        text: '🔢 **Standard Number Calculator**\n\nClean numeric calculator with calculation history tape, memory registers (M+, M-, MR, MC), and keyboard shortcuts.',
        action: { label: 'Open Number Calculator', path: '/tools/number-calculator' },
      };
    }

    // --- Website Info & Privacy ---
    if (q.includes('privacy') || q.includes('data') || q.includes('safe') || q.includes('security')) {
      return {
        text: '🛡️ **100% Client-Side Privacy**\n\nNAVIKO tools process all calculations, PDFs, images, and student resumes directly inside your browser memory. Your documents and data are never uploaded to any remote server.',
        action: { label: 'Read Privacy Policy', path: '/privacy-policy' },
      };
    }

    if (q.includes('about') || q.includes('what is naviko') || q.includes('who made')) {
      return {
        text: '🧭 **About NAVIKO**\n\nNAVIKO is a collection of 25+ fast, free, and private online tools designed for students, professionals, investors, and creators.',
        action: { label: 'Learn More About NAVIKO', path: '/about' },
      };
    }

    if (q.includes('blog') || q.includes('article') || q.includes('guide')) {
      return {
        text: '📚 **NAVIKO Knowledge Hub & Blog**\n\nExplore in-depth articles on personal finance, student productivity, exam tips, and PDF/image optimization.',
        action: { label: 'Visit Blog & Articles', path: '/blog' },
      };
    }

    if (q === 'tools' || q.includes('all tools') || q.includes('list of tools') || q.includes('directory')) {
      return {
        text: '🧰 **NAVIKO Tools Directory**\n\nExplore our complete collection of 25+ tools across 5 categories:\n\n• **PDF Tools**: Merge, Compress, JPG ⇄ PDF, Split\n• **Image Tools**: Background Remover, Cropper, Converters, Resizer\n• **Student Tools**: Attendance, CGPA, Timetable, Resume, Typing\n• **Finance Tools**: SIP, Loan EMI, Salary Tax, Debt Clock, FIRE\n• **Math & Utilities**: Scientific Calc, Age, Discount, QR Generator',
        action: { label: 'Browse All 25+ Tools', path: '/tools' },
      };
    }

    // --- Greetings ---
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('good morning') || q.includes('good evening') || q.includes('good afternoon')) {
      return {
        text: '👋 Hello! I am Navi, your private assistant for NAVIKO.\n\nI can help you locate any of our 25+ offline tools, solve math calculations, or explain financial concepts. What would you like to explore?',
      };
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('awesome') || q.includes('great')) {
      return {
        text: 'You\'re very welcome! Feel free to ask if you need help finding another tool or calculating something else on NAVIKO.',
      };
    }

    // --- Polite Out-of-Scope Fallback ---
    return {
      text: `I specialize in helping you navigate NAVIKO's offline tools and performing supported on-page calculations.\n\nWhile I don't have general web browsing or generative AI capabilities, I can immediately assist you with:\n\n• **PDF Tools**: Merge, compress, split, convert JPG ⇄ PDF\n• **Image Utilities**: Crop, remove background, compress, convert JPG ⇄ PNG\n• **Student Tools**: Attendance & bunk calculator, CGPA conversion, resume builder\n• **Financial & Math Calculators**: SIP, EMI, Salary, GST, Scientific calculator\n\nTry asking for any tool (e.g. *"Attendance calculator"* or *"Compress PDF"*), or enter a calculation like \`18% of 50000\`!`,
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

    // Brief realistic delay
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
    }, 350);
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
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Ask Navi
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-950">
              Assistant
            </span>
            {/* Ambient indicator */}
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
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
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
                  <h3 className="font-bold text-sm text-white">Navi Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Private Guide
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">In-browser assistant • No API key required</p>
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
                onClick={() => {
                  setMessages([
                    {
                      id: 'msg-welcome',
                      sender: 'bot',
                      text: WELCOME_TEXT,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Chat"
                aria-label="Reset Chat"
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
                            // Simple formatting for bold **text** and `code`
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
                          title="Copy text"
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
        </div>
      )}
    </>
  );
};
