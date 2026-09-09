import {
  AssistantIntent,
  AssistantResponse,
  AssistantToolEntry,
  ClarificationType,
  SessionContext,
} from './types';
import { NAVIKO_TOOLS_REGISTRY } from './toolRegistry';

/**
 * Format currency in Indian numbering format (e.g. ₹5,00,000)
 */
export function formatINR(val: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `₹${Math.round(val).toLocaleString()}`;
  }
}

/**
 * Perform on-the-fly SIP calculation with error resilience
 */
function computeSIP(monthlyP: number, annualR: number, years: number) {
  if (monthlyP <= 0 || annualR <= 0 || years <= 0) {
    return null;
  }
  const i = annualR / 12 / 100;
  const n = Math.round(years * 12);
  const factor = Math.pow(1 + i, n);
  const maturity = Math.round(monthlyP * ((factor - 1) / i) * (1 + i));
  const invested = Math.round(monthlyP * n);
  const gain = maturity - invested;

  return { maturity, invested, gain, monthlyP, annualR, years };
}

/**
 * Perform on-the-fly Loan EMI calculation with error resilience
 */
function computeEMI(principal: number, annualR: number, years: number) {
  if (principal <= 0 || annualR <= 0 || years <= 0) {
    return null;
  }
  const r = annualR / 12 / 100;
  const n = Math.round(years * 12);
  const factor = Math.pow(1 + r, n);
  const emi = Math.round((principal * r * factor) / (factor - 1));
  const totalAmount = emi * n;
  const totalInterest = totalAmount - principal;

  return { emi, totalAmount, totalInterest, principal, annualR, years };
}

/**
 * Perform on-the-fly Attendance calculation
 */
function computeAttendance(attended: number, total: number) {
  if (total <= 0 || attended < 0 || attended > total) {
    return null;
  }
  const pct = Number(((attended / total) * 100).toFixed(1));
  const meets75 = pct >= 75;

  let bunkable = 0;
  let needed = 0;

  if (meets75) {
    bunkable = Math.max(0, Math.floor(attended / 0.75) - total);
  } else {
    needed = Math.max(0, Math.ceil((0.75 * total - attended) / 0.25));
  }

  return { pct, meets75, bunkable, needed, attended, total };
}

/**
 * Perform on-the-fly BMI calculation
 */
function computeBMI(weightKg: number, heightCm: number) {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal weight';

  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
  } else if (bmi >= 30) {
    category = 'Obese';
  }

  return { bmi, category, weightKg, heightCm };
}

/**
 * Generate smart, context-aware responses with prioritized ANSWER -> EXPLANATION -> ACTION
 */
export function generateResponse(
  query: string,
  intent: AssistantIntent,
  confidence: number,
  tool: AssistantToolEntry | null,
  context: SessionContext,
  rankedTools: AssistantToolEntry[] = []
): { response: AssistantResponse; updatedClarification?: ClarificationType } {
  const q = query.toLowerCase().trim();
  const entities = context.entities;
  const effectiveTool =
    tool ||
    (context.lastToolId ? NAVIKO_TOOLS_REGISTRY.find((t) => t.id === context.lastToolId) || null : null);

  // 1. GREETINGS & CASUAL AFFIRMATIONS
  if (intent === 'GENERAL_QUESTION') {
    if (/thank/i.test(q)) {
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `You're welcome! Whenever you need financial projections, study planning, or PDF tools, I'm right here to help.`,
          intent,
          confidence: 0.98,
          quickReplies: ['Calculate SIP', 'Make ATS Resume', 'Compress PDF', 'Loan EMI'],
        },
      };
    }

    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Hello! I'm Navi, your NAVIKO assistant.\n\nI can help you run financial and academic calculations directly, find the right privacy-first tool, or guide you through our 46+ free utilities.\n\nWhat would you like to calculate or work on?`,
        intent,
        confidence: 0.98,
        quickReplies: ['📈 Calculate SIP', '🏦 Loan EMI', '📄 ATS Resume', '🗜️ Compress PDF'],
      },
    };
  }

  // 2. SMART UNKNOWN HANDLING (Confidence < 0.40)
  if (confidence < 0.40 || intent === 'UNKNOWN') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `I'm not completely sure what you mean.\n\nAre you looking for:\n• **Finance** — SIP, Loan EMI, Salary Tax, GST, Budgeting\n• **Student tools** — Attendance & Bunk, CGPA, Study Planner\n• **Career** — ATS Resume Builder with PDF export\n• **PDF tools** — Compress, Merge, Split, JPG to PDF\n• **Image tools** — Background Remover, Cropper, KB Compressor\n• **Calculators** — BMI, Age, Scientific, Percentage`,
        intent: 'UNKNOWN',
        confidence,
        actionButton: { label: 'Browse All 46+ Tools', path: '/all-tools' },
        quickReplies: ['Finance tools', 'Student tools', 'PDF tools', 'ATS Resume'],
      },
    };
  }

  // 3. BROAD TOOL RECOMMENDATION / MONEY MANAGEMENT (Section 5)
  // "help me manage my money", "I want to manage my money"
  if (
    q.includes('manage my money') ||
    q.includes('manage money') ||
    q.includes('money management') ||
    q.includes('financial planning')
  ) {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here are the most relevant NAVIKO tools for managing your money:\n\n1. **SIP & Step-Up Calculator** — Plan systematic monthly investments and compound growth.\n2. **Loan EMI Calculator** — Manage loan repayments, interest costs, and amortization.\n3. **Salary & In-Hand Tax Calculator** — Estimate net take-home pay and tax deductions.\n4. **Budget Calculator (50/30/20)** — Allocate income across needs, wants, and savings.`,
        intent: 'FINANCE',
        confidence: 0.95,
        recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator'),
        rankedTools: rankedTools.length > 0 ? rankedTools : NAVIKO_TOOLS_REGISTRY.filter((t) => t.category === 'finance').slice(0, 4),
        actionButton: { label: 'Open Finance Tools Hub', path: '/finance-tools' },
        quickReplies: ['SIP Calculator', 'Loan EMI', 'Salary Tax', '50/30/20 Budget'],
      },
    };
  }

  // 4. TOOL DISCOVERY / "WHAT TOOLS DO YOU HAVE"
  if (intent === 'TOOL_DISCOVERY') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `NAVIKO has 46+ privacy-first tools running 100% in your browser. Here are our top categories:\n\n• **Finance**: SIP, Loan EMI, Salary Tax, GST, FD, FIRE Calculator\n• **Student**: Attendance & Bunk, CGPA to %, Study Decision, Backlog Recovery\n• **Career**: ATS Resume Builder with single-column export\n• **PDF Suite**: Compress, Merge, Split, JPG to PDF (zero server upload)\n• **Image Suite**: Background Remover, KB Compressor, Cropper\n• **Health**: BMI Calculator, Diet Planner, Macro Nutrition`,
        intent: 'TOOL_DISCOVERY',
        confidence: 0.95,
        actionButton: { label: 'Explore All Tools Directory', path: '/all-tools' },
        quickReplies: ['Calculate SIP', 'Loan EMI', 'ATS Resume', 'Compress PDF'],
      },
    };
  }

  // 5. PREMIUM & PRICING
  if (intent === 'PREMIUM') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `NAVIKO offers simple, transparent access:\n\n• **Free Forever**: All core 46+ tools with unlimited client-side calculations.\n• **₹1 7-Day Trial**: Experience full Premium access for 7 days (no auto-debit, never auto-renews).\n• **NAVIKO Plus (₹49/mo)**: 50 heavy operations/day, saved meal plans, and mock test analytics.\n• **NAVIKO Pro (₹149/mo)**: 200 heavy operations/day, batch processing, and ad-free experience.`,
        intent: 'PREMIUM',
        confidence: 0.95,
        actionButton: { label: 'View Premium Plans', path: '/premium' },
        quickReplies: ['Activate ₹1 Trial', 'NAVIKO Plus Details', 'Browse Free Tools'],
      },
    };
  }

  // 6. ACCOUNT & PROFILE
  if (intent === 'ACCOUNT') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `You can securely manage your NAVIKO account, subscriptions, and preferences in your Profile.\n\nAll session data is private with token-based client-side authentication.`,
        intent: 'ACCOUNT',
        confidence: 0.95,
        actionButton: { label: 'Go to Profile', path: '/profile' },
        quickReplies: ['Login', 'View Subscription', 'Explore Free Tools'],
      },
    };
  }

  // 7. RESUME & CAREER
  if (intent === 'RESUME' || effectiveTool?.id === 'resume-builder') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here is the **ATS-Friendly Resume Builder**:\n\n• Single-column layout engineered to pass automated recruiter screeners\n• Pre-formulated impact bullet points for freshers and experienced candidates\n• Instant live preview with local browser PDF generation\n• 100% private — your career details never leave your device`,
        intent: 'RESUME',
        confidence: 0.96,
        recommendedTool: effectiveTool || NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'resume-builder'),
        actionButton: { label: 'Open ATS Resume Builder', path: '/tools/resume-builder' },
        quickReplies: ['ATS formatting tips', 'Explore Student Tools', 'Open Resume Builder'],
      },
    };
  }

  // 8. PDF TOOLS (Compress, Merge, Split)
  if (intent === 'PDF') {
    if (effectiveTool?.id === 'pdf-compressor' || q.includes('compress') || q.includes('size') || q.includes('kam')) {
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can help you reduce your PDF size right in your browser.\n\n• **Browser-only processing**: Documents stay in your local memory with zero server uploads\n• **Custom compression levels**: Shrink files to meet upload limits (e.g. under 200KB or 500KB)\n• Fast, private, and works completely offline`,
          intent: 'PDF',
          confidence: 0.96,
          recommendedTool: effectiveTool || NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'pdf-compressor'),
          actionButton: { label: 'Open PDF Compressor', path: '/tools/pdf-compressor' },
          quickReplies: ['Compress PDF', 'Merge PDF', 'Split PDF', 'JPG to PDF'],
        },
      };
    }

    if (effectiveTool?.id === 'pdf-merge' || q.includes('merge') || q.includes('combine')) {
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `You can combine multiple PDF files into one clean document with our **PDF Merge** tool.\n\n• Arrange documents in your custom sequence\n• Processed locally inside browser memory\n• Unlimited free page merging with instant download`,
          intent: 'PDF',
          confidence: 0.95,
          recommendedTool: effectiveTool || NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'pdf-merge'),
          actionButton: { label: 'Open PDF Merge Tool', path: '/tools/pdf-merge' },
          quickReplies: ['Compress PDF', 'Split PDF', 'Convert JPG to PDF'],
        },
      };
    }

    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here are the NAVIKO PDF tools:\n\n1. **Compress PDF** — Reduce file size for portals and emails.\n2. **Merge PDF** — Combine multiple documents into one.\n3. **JPG to PDF** — Convert certificate images and scans into formatted PDFs.\n4. **Split PDF** — Extract specific page ranges.`,
        intent: 'PDF',
        confidence: 0.92,
        actionButton: { label: 'Open PDF Tools Hub', path: '/pdf-tools' },
        quickReplies: ['Compress PDF', 'Merge PDF', 'Split PDF', 'JPG to PDF'],
      },
    };
  }

  // 9. IMAGE TOOLS
  if (intent === 'IMAGE_TOOLS') {
    if (effectiveTool?.id === 'background-remover' || q.includes('background') || q.includes('bg')) {
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `You can remove photo backgrounds directly in your browser with our **Background Remover**:\n\n• Creates transparent PNG cutouts for signatures, profile pictures, and products\n• Adjustable edge feathering and tolerance\n• 100% private — photos never touch a remote server`,
          intent: 'IMAGE_TOOLS',
          confidence: 0.95,
          recommendedTool: effectiveTool || NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'background-remover'),
          actionButton: { label: 'Open Background Remover', path: '/tools/background-remover' },
          quickReplies: ['Crop Image', 'Compress Image', 'Convert to PNG'],
        },
      };
    }

    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here are our private browser-based image utilities:\n\n• **Background Remover**: Clean transparent PNG cutouts\n• **Image Cropper**: Custom and official dimensions (Passport 3.5×4.5 cm, 1:1, 16:9)\n• **Image Compressor**: Compress to exact target sizes (<50KB, <20KB)\n• **Format Converter**: JPG to PNG & PNG to JPG`,
        intent: 'IMAGE_TOOLS',
        confidence: 0.92,
        actionButton: { label: 'Open Image Tools Hub', path: '/image-tools' },
        quickReplies: ['Remove Background', 'Crop Image', 'Compress Image'],
      },
    };
  }

  // 10. FINANCE (SIP, EMI, SALARY/TAX, GST)
  if (intent === 'FINANCE') {
    // A. SIP / MUTUAL FUND COMPOUNDING
    const isSip =
      effectiveTool?.id === 'sip-calculator' ||
      q.includes('sip') ||
      context.awaitingClarification === 'SIP_DETAILS';

    if (isSip) {
      const amount = entities.amount;
      const tenure = entities.tenureYears;
      const rate = entities.rate || 12;

      // Both Amount & Tenure available -> Calculate immediately!
      if (amount && tenure) {
        if (q.includes('compare')) {
          const res10 = computeSIP(amount, rate, 10);
          const res15 = computeSIP(amount, rate, 15);
          if (res10 && res15) {
            return {
              response: {
                id: `resp-${Date.now()}`,
                text: `Here is a side-by-side comparison for **${formatINR(amount)}/month** at ${rate}% return:\n\n**10-Year Horizon:**\n• Total Invested: ${formatINR(res10.invested)}\n• Estimated Gain: ${formatINR(res10.gain)}\n• Expected Corpus: **${formatINR(res10.maturity)}**\n\n**15-Year Horizon:**\n• Total Invested: ${formatINR(res15.invested)}\n• Estimated Gain: **${formatINR(res15.gain)}** (+${formatINR(res15.gain - res10.gain)})\n• Expected Corpus: **${formatINR(res15.maturity)}**\n\nStaying invested for 5 additional years more than doubles your wealth gain due to compounding.`,
                intent: 'FINANCE',
                confidence: 0.96,
                recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator'),
                actionButton: { label: 'Open SIP Calculator', path: '/tools/sip-calculator' },
                quickReplies: ['Make it 15 years', 'Make it 20 years', 'Try Step-Up SIP'],
              },
            };
          }
        }

        const result = computeSIP(amount, rate, tenure);
        if (result) {
          const { maturity, invested, gain } = result;
          const intro = q.includes('what if') || q.includes('make it') || q.includes('change')
            ? `I've updated your calculation:`
            : `I can calculate that for you. Based on the details you've given, let's estimate your SIP growth:`;

          return {
            response: {
              id: `resp-${Date.now()}`,
              text: `${intro}\n\n• **Monthly Investment**: ${formatINR(amount)}\n• **Duration**: ${tenure} Years (${tenure * 12} months)\n• **Expected Return**: ${rate}% p.a.\n• **Total Invested**: ${formatINR(invested)}\n• **Estimated Wealth Gain**: **${formatINR(gain)}**\n• **Expected Corpus at Maturity**: **${formatINR(maturity)}**\n\nCompounding accelerates noticeably during the second half of your tenure.`,
              intent: 'FINANCE',
              confidence: 0.96,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator'),
              actionButton: { label: 'Open Interactive SIP Calculator', path: '/tools/sip-calculator' },
              quickReplies: [
                'Change amount',
                'Make it 15 years',
                'Change rate to 8%',
                'Try Step-Up SIP',
              ],
            },
          };
        }
      }

      // Only tenure is known -> Ask concisely for amount
      if (tenure && !amount) {
        return {
          response: {
            id: `resp-${Date.now()}`,
            text: `Got it — an investment duration of **${tenure} years**.\n\nWhat monthly amount would you like to invest? (e.g. *₹5,000* or *₹10,000*)`,
            intent: 'FINANCE',
            confidence: 0.92,
            requiresClarification: true,
            quickReplies: ['₹2,500', '₹5,000', '₹10,000', '₹20,000'],
          },
          updatedClarification: 'SIP_DETAILS',
        };
      }

      // Only amount is known -> Calculate standard 10 years at 12%
      if (amount && !tenure) {
        const result = computeSIP(amount, rate, 10);
        if (result) {
          const { maturity, invested, gain } = result;
          return {
            response: {
              id: `resp-${Date.now()}`,
              text: `I can calculate that for you. For a monthly SIP of **${formatINR(amount)}** over a standard 10-year horizon at ${rate}% expected return:\n\n• **Invested (10 years)**: ${formatINR(invested)}\n• **Estimated Gain**: ${formatINR(gain)}\n• **Expected Corpus**: **${formatINR(maturity)}**\n\nWant to see how it grows over 15 or 20 years?`,
              intent: 'FINANCE',
              confidence: 0.95,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator'),
              actionButton: { label: 'Customize in SIP Calculator', path: '/tools/sip-calculator' },
              quickReplies: ['Make it 15 years', 'Make it 20 years', 'What if I invest 7000?'],
            },
          };
        }
      }

      // Neither provided -> Prompt with clear details and action
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can calculate your SIP compound returns.\n\nTell me your monthly investment and duration (e.g. *"₹5,000 for 10 years"*), or launch the interactive calculator below.`,
          intent: 'FINANCE',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator'),
          actionButton: { label: 'Open SIP Calculator', path: '/tools/sip-calculator' },
          quickReplies: ['₹5,000 for 10 years', '₹10,000 for 15 years', 'Step-Up SIP'],
        },
      };
    }

    // B. LOAN EMI CALCULATOR
    const isEmi =
      effectiveTool?.id === 'emi-calculator' ||
      q.includes('emi') ||
      q.includes('loan') ||
      context.awaitingClarification === 'EMI_DETAILS';

    if (isEmi) {
      const principal = entities.amount;
      const tenure = entities.tenureYears || 5;
      const rate = entities.rate || 9.0;

      if (principal) {
        if (q.includes('compare')) {
          const res5 = computeEMI(principal, rate, 5);
          const res10 = computeEMI(principal, rate, 10);
          if (res5 && res10) {
            return {
              response: {
                id: `resp-${Date.now()}`,
                text: `Here is a side-by-side comparison of loan tenures for **${formatINR(principal)}** at ${rate}% interest:\n\n**5-Year Tenure:**\n• Monthly EMI: **${formatINR(res5.emi)}**\n• Total Interest: ${formatINR(res5.totalInterest)}\n• Total Repayment: ${formatINR(res5.totalAmount)}\n\n**10-Year Tenure:**\n• Monthly EMI: **${formatINR(res10.emi)}** (saves ${formatINR(res5.emi - res10.emi)}/mo)\n• Total Interest: ${formatINR(res10.totalInterest)} (extra ${formatINR(res10.totalInterest - res5.totalInterest)} in interest)\n• Total Repayment: ${formatINR(res10.totalAmount)}\n\nA shorter tenure saves substantial interest, while a longer tenure gives lower monthly payments.`,
                intent: 'FINANCE',
                confidence: 0.96,
                recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'emi-calculator'),
                actionButton: { label: 'Open EMI Calculator', path: '/tools/emi-calculator' },
                quickReplies: ['Keep 5 years', 'Keep 10 years', 'Try 15 years', 'Calculate SIP'],
              },
            };
          }
        }

        const result = computeEMI(principal, rate, tenure);
        if (result) {
          const { emi, totalAmount, totalInterest } = result;
          const intro = q.includes('make the loan') || q.includes('make it') || q.includes('change')
            ? `Here is your updated loan schedule:`
            : `I can calculate that for you. Based on the loan details:`;

          return {
            response: {
              id: `resp-${Date.now()}`,
              text: `${intro}\n\n• **Loan Amount**: ${formatINR(principal)}\n• **Interest Rate**: ${rate}% p.a.\n• **Tenure**: ${tenure} Years (${Math.round(tenure * 12)} months)\n• **Monthly EMI**: **${formatINR(emi)}**\n• **Total Interest**: ${formatINR(totalInterest)}\n• **Total Payable**: **${formatINR(totalAmount)}**`,
              intent: 'FINANCE',
              confidence: 0.96,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'emi-calculator'),
              actionButton: { label: 'Open Full EMI Calculator & Amortization', path: '/tools/emi-calculator' },
              quickReplies: ['Make the loan 10 lakh', 'Change to 10 years', 'Change rate to 8.5%', 'Calculate SIP'],
            },
          };
        }
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can calculate your loan EMI, total interest, and repayment schedule.\n\nTell me the loan amount, interest rate, and tenure (e.g. *"5 lakh loan at 9% for 5 years"*), or open the calculator below.`,
          intent: 'FINANCE',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'emi-calculator'),
          actionButton: { label: 'Open EMI Calculator', path: '/tools/emi-calculator' },
          quickReplies: ['5 lakh loan 9% 5 years', '20 lakh loan 8.5% 15 years', 'SIP Calculator'],
        },
      };
    }

    // C. SALARY & TAX (New Tax Regime FY 2024-25)
    const isSalary =
      effectiveTool?.id === 'salary-calculator' ||
      q.includes('tax') ||
      q.includes('salary') ||
      q.includes('in hand') ||
      q.includes('take home');

    if (isSalary) {
      const ctc = entities.amount;
      if (ctc && ctc >= 100000) {
        const stdDeduction = 75000;
        const taxable = Math.max(0, ctc - stdDeduction);
        let tax = 0;
        if (taxable > 300000) {
          if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
          else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.1;
          else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
          else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.2;
          else tax = 140000 + (taxable - 1500000) * 0.3;
        }
        if (taxable <= 700000) tax = 0; // Section 87A rebate
        const cess = tax * 0.04;
        const totalTax = Math.round(tax + cess);
        const epf = Math.round(Math.min(ctc * 0.12, 1800 * 12));
        const annualTakeHome = ctc - totalTax - epf;
        const monthlyInHand = Math.round(annualTakeHome / 12);

        return {
          response: {
            id: `resp-${Date.now()}`,
            text: `Here is your in-hand salary estimate under the New Tax Regime (with ₹75,000 standard deduction):\n\n• **Annual Gross CTC**: ${formatINR(ctc)}\n• **Standard Deduction**: ₹75,000\n• **Estimated Annual Tax**: ${formatINR(totalTax)}\n• **Estimated Annual EPF**: ~${formatINR(epf)}\n• **Estimated Monthly In-Hand**: **${formatINR(monthlyInHand)}**`,
            intent: 'FINANCE',
            confidence: 0.95,
            recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'salary-calculator'),
            actionButton: { label: 'Open Detailed Salary Tax Calculator', path: '/tools/salary-calculator' },
            quickReplies: ['Calculate SIP with in-hand', '50/30/20 Budget Plan', 'GST Calculator'],
          },
        };
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can estimate your monthly take-home salary, EPF, and tax liability under the latest New Tax Regime.\n\nWhat is your annual CTC? (e.g. *"₹10 Lakhs"* or *"12 lakh CTC"*), or open the tool below.`,
          intent: 'FINANCE',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'salary-calculator'),
          actionButton: { label: 'Calculate In-Hand Salary', path: '/tools/salary-calculator' },
          quickReplies: ['6 Lakhs CTC', '10 Lakhs CTC', '15 Lakhs CTC', 'SIP Calculator'],
        },
      };
    }

    // D. GST CALCULATOR
    if (effectiveTool?.id === 'gst-calculator' || q.includes('gst')) {
      const rate = entities.gstRate || 18;
      const base = entities.amount;
      if (base) {
        const gstAmount = Math.round((base * rate) / 100);
        const total = base + gstAmount;
        return {
          response: {
            id: `resp-${Date.now()}`,
            text: `Here is the GST calculation:\n\n• **Base Amount**: ${formatINR(base)}\n• **GST Rate**: ${rate}%\n• **GST Tax Amount**: ${formatINR(gstAmount)} (CGST: ${formatINR(gstAmount / 2)}, SGST: ${formatINR(gstAmount / 2)})\n• **Total (Inclusive)**: **${formatINR(total)}**`,
            intent: 'FINANCE',
            confidence: 0.95,
            recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'gst-calculator'),
            actionButton: { label: 'Open Full GST Calculator', path: '/tools/gst-calculator' },
            quickReplies: ['12% GST', '28% GST', 'Salary Tax Calculator'],
          },
        };
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can calculate GST amounts (5%, 12%, 18%, 28%) with instant CGST and SGST splits.\n\nTell me the amount and rate (e.g. *"18% GST on 5000"*), or launch the calculator below.`,
          intent: 'FINANCE',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'gst-calculator'),
          actionButton: { label: 'Open GST Calculator', path: '/tools/gst-calculator' },
          quickReplies: ['18% GST on 5000', '12% GST on 2500', 'Salary Tax Calculator'],
        },
      };
    }

    // General Finance Hub
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here are the top NAVIKO financial calculators:\n\n1. **SIP & Step-Up Calculator** — Mutual fund wealth compounding.\n2. **Loan EMI Calculator** — Installments, interest, and payoff schedules.\n3. **Salary & In-Hand Tax Calculator** — Net take-home pay and tax deductions.\n4. **GST Calculator** — Business invoice and tax breakdown.`,
        intent: 'FINANCE',
        confidence: 0.9,
        actionButton: { label: 'Open Finance Tools Hub', path: '/finance-tools' },
        quickReplies: ['Calculate SIP', 'Loan EMI', 'In-Hand Salary', 'GST Calculator'],
      },
    };
  }

  // 11. STUDENT TOOLS (Attendance, CGPA, Study Planners)
  if (intent === 'STUDENT') {
    // Attendance & Bunk
    if (effectiveTool?.id === 'attendance-calculator' || q.includes('attendance') || q.includes('bunk')) {
      const attended = entities.attendedClasses;
      const total = entities.totalClasses;

      if (attended !== undefined && total !== undefined && total > 0) {
        if (q.includes('tomorrow') || q.includes('can i bunk') || q.includes('can i miss')) {
          const newAttended = attended;
          const newTotal = total + 1;
          const newPct = Number(((newAttended / newTotal) * 100).toFixed(1));
          const canBunk = newPct >= 75;
          return {
            response: {
              id: `resp-${Date.now()}`,
              text: canBunk
                ? `Yes, you can safely bunk tomorrow! Bunking 1 class will adjust your attendance from **${((attended / total) * 100).toFixed(1)}%** to **${newPct}%**, remaining above the 75% threshold.`
                : `No, you shouldn't bunk tomorrow! Bunking 1 class will drop your attendance from **${((attended / total) * 100).toFixed(1)}%** down to **${newPct}%**, which falls below the required 75% mark.`,
              intent: 'STUDENT',
              confidence: 0.96,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'attendance-calculator'),
              actionButton: { label: 'Open Attendance & Bunk Calculator', path: '/tools/attendance-calculator' },
              quickReplies: ['Check Attendance', 'CGPA Calculator', 'Study Plan'],
            },
          };
        }

        const result = computeAttendance(attended, total);
        if (result) {
          const { pct, meets75, bunkable, needed } = result;
          return {
            response: {
              id: `resp-${Date.now()}`,
              text: `Here is your attendance analysis:\n\n• **Attended**: ${attended} of ${total} classes\n• **Current Attendance**: **${pct}%**\n• **75% Status**: ${
                meets75
                  ? `Safe! You can safely bunk **${bunkable}** more ${bunkable === 1 ? 'class' : 'classes'} and remain at or above 75%.`
                  : `Below requirement. You need to attend **${needed}** consecutive ${needed === 1 ? 'class' : 'classes'} without bunking to reach 75%.`
              }`,
              intent: 'STUDENT',
              confidence: 0.96,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'attendance-calculator'),
              actionButton: { label: 'Open Attendance & Bunk Calculator', path: '/tools/attendance-calculator' },
              quickReplies: ['CGPA Calculator', 'Study Plan', 'ATS Resume Builder'],
            },
          };
        }
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can calculate your attendance percentage and find out how many classes you can safely bunk above 75%, or how many you must attend to recover.\n\nTell me your numbers (e.g. *"34 out of 45 classes"*), or launch the tool below.`,
          intent: 'STUDENT',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'attendance-calculator'),
          actionButton: { label: 'Open Attendance Calculator', path: '/tools/attendance-calculator' },
          quickReplies: ['30 out of 40 classes', '38 out of 50 classes', 'CGPA Calculator'],
        },
      };
    }

    // CGPA to %
    if (effectiveTool?.id === 'cgpa-calculator' || q.includes('cgpa') || q.includes('gpa')) {
      const cgpa = entities.cgpa;
      if (cgpa !== undefined) {
        const cbsePct = (cgpa * 9.5).toFixed(2);
        const collegePct = ((cgpa - 0.75) * 10).toFixed(2);
        return {
          response: {
            id: `resp-${Date.now()}`,
            text: `Here is the percentage conversion for **${cgpa} CGPA**:\n\n• **CBSE Formula (CGPA × 9.5)**: **${cbsePct}%**\n• **10-Point College Scale [(CGPA - 0.75) × 10]**: **${collegePct}%**`,
            intent: 'STUDENT',
            confidence: 0.96,
            recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'cgpa-calculator'),
            actionButton: { label: 'Open CGPA Calculator', path: '/tools/cgpa-calculator' },
            quickReplies: ['Attendance Calculator', 'Study Plan', 'ATS Resume Builder'],
          },
        };
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can convert your 10-point CGPA into standard percentage using CBSE and university formulas.\n\nEnter your CGPA (e.g. *"8.4 CGPA"*), or open the tool below.`,
          intent: 'STUDENT',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'cgpa-calculator'),
          actionButton: { label: 'Open CGPA Calculator', path: '/tools/cgpa-calculator' },
          quickReplies: ['8.4 CGPA', '9.2 CGPA', '7.8 CGPA', 'Attendance Calculator'],
        },
      };
    }

    // Study Planners / Decision
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `Here are our top student tools:\n\n1. **Attendance & Bunk Calculator** — Safe bunk limit and 75% recovery targets.\n2. **CGPA to % Converter** — CBSE and university conversion formulas.\n3. **Study Decision & Backlog Planners** — Feasible exam prep schedules and chapter trackers.\n4. **ATS Resume Builder** — Single-column recruiter-ready resumes.`,
        intent: 'STUDENT',
        confidence: 0.92,
        actionButton: { label: 'Open Student Tools Hub', path: '/student-tools' },
        quickReplies: ['Check Attendance', 'Convert CGPA', 'Study Plan', 'ATS Resume'],
      },
    };
  }

  // 12. CALCULATORS & HEALTH (BMI, Discount, Math)
  if (intent === 'CALCULATORS') {
    if (effectiveTool?.id === 'bmi-calculator' || q.includes('bmi')) {
      const w = entities.weightKg;
      const h = entities.heightCm;

      if (w && h) {
        const result = computeBMI(w, h);
        if (result) {
          const { bmi, category } = result;
          return {
            response: {
              id: `resp-${Date.now()}`,
              text: `Here is your Body Mass Index (BMI) assessment:\n\n• **Weight**: ${w} kg\n• **Height**: ${h} cm\n• **BMI**: **${bmi} kg/m²**\n• **Classification**: **${category}** (Healthy range: 18.5 - 24.9)`,
              intent: 'CALCULATORS',
              confidence: 0.96,
              recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'bmi-calculator'),
              actionButton: { label: 'Open Full BMI Calculator', path: '/tools/bmi-calculator' },
              quickReplies: ['Diet Planner', 'Water Intake Calculator', 'Scientific Calculator'],
            },
          };
        }
      }

      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `I can calculate your BMI and healthy weight classification.\n\nTell me your weight and height (e.g. *"70 kg 175 cm"*), or open the calculator below.`,
          intent: 'CALCULATORS',
          confidence: 0.92,
          recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'bmi-calculator'),
          actionButton: { label: 'Open BMI Calculator', path: '/tools/bmi-calculator' },
          quickReplies: ['70 kg 175 cm', '60 kg 165 cm', '80 kg 180 cm'],
        },
      };
    }

    // Discount
    if (effectiveTool?.id === 'discount-calculator' || q.includes('discount')) {
      const disc = entities.discountPct;
      const price = entities.amount;
      if (disc && price) {
        const saved = Math.round((price * disc) / 100);
        const finalPrice = price - saved;
        return {
          response: {
            id: `resp-${Date.now()}`,
            text: `Here is your discount breakdown:\n\n• **Original Price**: ${formatINR(price)}\n• **Discount**: ${disc}% (You save: ${formatINR(saved)})\n• **Final Price**: **${formatINR(finalPrice)}**`,
            intent: 'CALCULATORS',
            confidence: 0.96,
            recommendedTool: NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'discount-calculator'),
            actionButton: { label: 'Open Discount Calculator', path: '/tools/discount-calculator' },
            quickReplies: ['20% off 1500', '15% off 4000', 'GST Calculator'],
          },
        };
      }
    }

    if (effectiveTool) {
      return {
        response: {
          id: `resp-${Date.now()}`,
          text: `**${effectiveTool.name}**\n\n${effectiveTool.description}`,
          intent: 'CALCULATORS',
          confidence: 0.92,
          recommendedTool: effectiveTool,
          actionButton: { label: `Open ${effectiveTool.name}`, path: effectiveTool.route },
          quickReplies: ['Scientific Calculator', 'Percentage Calculator', 'Age Calculator'],
        },
      };
    }
  }

  // 13. GENERAL NAVIKO (About, Client-side privacy)
  if (intent === 'GENERAL_NAVIKO') {
    return {
      response: {
        id: `resp-${Date.now()}`,
        text: `NAVIKO is designed with a strict **100% Client-Side Privacy Architecture**:\n\n• All calculations, PDF operations, image compression, and resume rendering happen directly in your browser memory\n• Zero server file uploads or data storage\n• No third-party AI APIs or external trackers\n• Fast, offline-capable, and completely private`,
        intent: 'GENERAL_NAVIKO',
        confidence: 0.95,
        actionButton: { label: 'Read Privacy Policy', path: '/privacy-policy' },
        quickReplies: ['Explore Free Tools', 'View Premium Plans', 'Contact Support'],
      },
    };
  }

  // Fallback to Smart Unknown Handling
  return {
    response: {
      id: `resp-${Date.now()}`,
      text: `I'm not completely sure what you mean.\n\nAre you looking for:\n• **Finance** — SIP, Loan EMI, Salary Tax, GST\n• **Student tools** — Attendance & Bunk, CGPA, Study Planner\n• **Career** — ATS Resume Builder\n• **PDF tools** — Compress PDF, Merge PDF, Split PDF\n• **Image tools** — Background Remover, Image Compressor\n• **Calculators** — BMI, Age, Scientific, Percentage`,
      intent: 'UNKNOWN',
      confidence: 0.25,
      actionButton: { label: 'Browse All 46+ Tools', path: '/all-tools' },
      quickReplies: ['Finance Tools', 'Student Tools', 'PDF Tools', 'Resume Builder'],
    },
  };
}
