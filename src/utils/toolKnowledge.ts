import { ToolMeta } from '../types';

export interface StructuredToolExplanation {
  whatItIs: string;
  whatItDoes: string;
  whoItIsFor: string[];
  howItWorks: string;
  resultsMeaning: string;
  limitations: string[];
  healthDisclaimer?: string;
}

/**
 * Returns structured, factual, AI/AEO-optimized content for any tool
 */
export const getStructuredToolExplanation = (tool: ToolMeta): StructuredToolExplanation => {
  // If explicitly defined on tool
  if (
    tool.whatItIs &&
    tool.whatItDoes &&
    tool.whoItIsFor &&
    tool.howItWorks &&
    tool.resultsMeaning &&
    tool.limitations
  ) {
    return {
      whatItIs: tool.whatItIs,
      whatItDoes: tool.whatItDoes,
      whoItIsFor: tool.whoItIsFor,
      howItWorks: tool.howItWorks,
      resultsMeaning: tool.resultsMeaning,
      limitations: tool.limitations,
      healthDisclaimer: tool.category === 'health' ? getHealthDisclaimer(tool.id) : undefined,
    };
  }

  // Specialized explanations for high-importance tools
  switch (tool.id) {
    case 'bmi-calculator':
      return {
        whatItIs:
          'The NAVIKO BMI & Body Metrics Calculator is a privacy-first anthropometric screening tool that assesses weight relative to height using established World Health Organization (WHO) and Indian consensus guidelines.',
        whatItDoes:
          'It computes Body Mass Index (BMI) in kg/m², visualizes the result on an interactive category scale (Underweight, Healthy, Overweight, Obesity), and estimates a reference healthy weight span based on your entered stature.',
        whoItIsFor: [
          'Adults looking for a baseline weight-to-height screening metric',
          'Students studying human biology and health metrics',
          'Individuals tracking long-term body metric tendencies alongside clinical guidance'
        ],
        howItWorks:
          'BMI is calculated using the formula: BMI = weight (kg) ÷ [height (m)]². For imperial inputs, weight in pounds and height in inches are converted according to standard international SI conversion constants.',
        resultsMeaning:
          'For adults 20 and older: Underweight (< 18.5), Healthy weight (18.5 – 24.9), Overweight (25.0 – 29.9), and Obesity (≥ 30.0). Asian/Indian health bodies frequently recommend lower cutoffs (23.0 for overweight and 25.0 for obesity) due to differing body fat distribution.',
        limitations: [
          'BMI does not distinguish between lean muscle tissue, bone mass, and body fat. Muscular individuals often register in overweight categories despite low adiposity.',
          'Does not evaluate visceral fat distribution, waist circumference, or metabolic biomarkers (blood glucose, lipids, blood pressure).',
          'Standard adult cutoffs do not apply to children and teenagers under 18; pediatric growth percentiles must be used instead.'
        ],
        healthDisclaimer:
          'This tool provides educational metric screening only and does NOT constitute medical diagnosis, clinical advice, or individualized weight management treatment. For minors under 18, consult a pediatrician. Always speak with a licensed physician or registered dietitian regarding health concerns.'
      };

    case 'diet-plan-manager':
      return {
        whatItIs:
          'The NAVIKO Diet Plan Manager is a structured meal idea generator and nutritional organization utility designed to assist users in assembling balanced weekly menus according to personal preferences and strict allergen exclusions.',
        whatItDoes:
          'It generates daily meal plans (Breakfast, Lunch, Snacks, Dinner) tailored to dietary styles (Vegetarian, Vegan, Eggitarian, Non-Veg, Jain), filters out selected allergens, provides instant meal substitutions, and builds automated grocery checklists.',
        whoItIsFor: [
          'Individuals and families organizing weekly home meals and grocery budgets',
          'People with specific dietary exclusions seeking meal variety',
          'Students and professionals aiming to maintain structured meal timings'
        ],
        howItWorks:
          'The engine applies constraint-satisfaction algorithms against a database of whole-food meal combinations, eliminating recipes containing chosen allergens and balancing macronutrient representation across the day.',
        resultsMeaning:
          'Results provide practical, whole-food meal suggestions based on balanced nutrition guidelines (carbohydrates, protein sources, fiber, and healthy fats).',
        limitations: [
          'Does not provide medical nutrition therapy (MNT) for clinical illnesses such as diabetes, chronic kidney disease, or celiac disease.',
          'Portion sizes and calorie recommendations are general estimates and may not reflect individual metabolic rates or physical activity demands.',
          'Restrictive eating is contraindicated for minors and individuals with a history of disordered eating.'
        ],
        healthDisclaimer:
          'NAVIKO Diet Plan Manager is an informational and planning utility, not a medical or dietary prescription. It is not intended to prevent, diagnose, or treat any medical condition. Please consult a qualified registered dietitian or medical practitioner before undertaking major dietary modifications.'
      };

    case 'nutrition-science':
      return {
        whatItIs:
          'NAVIKO Nutrition Science is an interactive educational hub exploring essential nutrients, whole food compositions, and evidence-informed principles of balanced eating.',
        whatItDoes:
          'It features a Nutrient Explorer covering macronutrients and 13 essential vitamins and minerals, an Indian and global staple food database, a side-by-side food comparison matrix, a balanced meal builder, and a packaged food label reading guide.',
        whoItIsFor: [
          'Students learning biochemistry, biology, and nutrition science',
          'Consumers who want to understand packaged food labels and ingredient lists',
          'Anyone curious about the vitamin, mineral, and protein density of daily meals'
        ],
        howItWorks:
          'Nutritional values are referenced against public empirical food composition datasets (such as ICMR-NIN Indian Food Composition Tables and USDA FoodData Central). Calculations reflect standard laboratory nutrient densities per 100g and typical culinary serving sizes.',
        resultsMeaning:
          'Values demonstrate relative nutrient density, macronutrient ratios (protein, carbohydrates, dietary fiber, fats), and percentage Daily Value (% DV) to help users understand nutrient distribution across whole foods.',
        limitations: [
          'Agricultural variance, seasonal soil quality, cooking methods, and preparation techniques naturally alter actual nutrient levels in foods.',
          'General % Daily Value figures are standardized for an average 2,000 calorie adult diet and vary with age, lactation, and physical exertion.'
        ],
        healthDisclaimer:
          'Content provided in Nutrition Science is purely educational and does not serve as medical nutrition therapy. Never use nutritional tables as a substitute for professional medical care.'
      };

    case 'sip-calculator':
      return {
        whatItIs:
          'The NAVIKO SIP Calculator is an investment forecasting utility that calculates the expected future maturity value and capital gains from recurring monthly investments in mutual funds or systematic investment plans.',
        whatItDoes:
          'It evaluates compounding returns based on monthly contribution amount, expected annual rate of return, and investment tenure in years. It also models annual step-up contributions and inflation-adjusted purchasing power.',
        whoItIsFor: [
          'Retail investors planning systematic mutual fund contributions',
          'Students and salaried professionals creating long-term wealth goals',
          'Retirement planners evaluating compounding over 10 to 30 year horizons'
        ],
        howItWorks:
          'Calculates maturity using the standard compounding annuity formula: M = P × [ ( (1 + i)^n - 1 ) / i ] × (1 + i), where P is monthly deposit, i is monthly return (annual rate ÷ 1200), and n is total months.',
        resultsMeaning:
          'The output splits your total maturity into "Invested Capital" (your actual out-of-pocket money) and "Estimated Capital Gains" (the compounding growth generated over the investment horizon).',
        limitations: [
          'Assumes a constant annualized rate of return. In reality, equity and mutual fund market returns fluctuate with market volatility and economic cycles.',
          'Calculations do not account for fund management expense ratios, exit loads, or capital gains taxation (LTCG / STCG).'
        ]
      };

    case 'emi-calculator':
      return {
        whatItIs:
          'The NAVIKO Loan EMI Calculator is a financial planning utility that determines monthly repayment amounts, interest outlays, and amortization schedules for home, car, education, and personal loans.',
        whatItDoes:
          'It computes the Equated Monthly Installment (EMI), total interest payable over the loan term, and total repayment amount based on loan principal, annual interest rate, and tenure.',
        whoItIsFor: [
          'Prospective borrowers evaluating home, auto, or personal loan affordability',
          'Homeowners assessing the impact of loan prepayment or tenure adjustments',
          'Financial advisors and consumers comparing bank lending quotes'
        ],
        howItWorks:
          'It implements the standard reducing-balance amortization formula: EMI = [P × r × (1 + r)^n] ÷ [(1 + r)^n - 1], where P is principal, r is periodic monthly interest rate, and n is number of monthly installments.',
        resultsMeaning:
          'The EMI is the fixed amount you pay each month. Early payments consist primarily of interest charges, while later payments increasingly pay down the underlying principal.',
        limitations: [
          'Assumes fixed interest rate over the full tenure. Floating rate loans may adjust over time.',
          'Does not incorporate mandatory processing fees, documentation charges, stamp duties, or loan protection insurance.'
        ]
      };

    case 'salary-calculator':
      return {
        whatItIs:
          'The NAVIKO Salary & In-Hand Tax Calculator is an Indian payroll utility designed to break down Gross Cost-to-Company (CTC) into realistic monthly in-hand compensation.',
        whatItDoes:
          'It calculates deductions including Employee Provident Fund (EPF), Professional Tax (PT), and income tax under both the New Tax Regime (Section 115BAC) and Old Tax Regime with standard deductions.',
        whoItIsFor: [
          'Job candidates reviewing salary offer letters and CTC components',
          'Salaried employees comparing tax liabilities between New and Old regimes',
          'HR professionals and hiring managers communicating take-home pay structures'
        ],
        howItWorks:
          'It computes basic salary, statutory EPF employee contributions (12% of basic up to statutory caps), standard deduction (₹75,000 for New Regime), and applies marginal income tax slabs with cess.',
        resultsMeaning:
          'Indicates your approximate net monthly salary deposited in your bank account, highlighting differences between Gross CTC and take-home pay.',
        limitations: [
          'Variable pay, performance bonuses, joining bonuses, and employer stock options (ESOPs) depend on company release schedules.',
          'Individual tax circumstances (HRA exemptions, 80C deductions, medical insurance) may require formal filing with a Chartered Accountant.'
        ]
      };

    case 'debt-clock':
      return {
        whatItIs:
          'The NAVIKO Debt Clock is an educational macroeconomic tracker visualizing government public debt, per-capita obligations, and interest accumulation for India and major global economies.',
        whatItDoes:
          'It displays live, real-time running estimations of total central and general government public debt, debt-to-GDP ratios, and the theoretical debt burden distributed across the population.',
        whoItIsFor: [
          'Students of economics, public policy, and commerce',
          'Citizens interested in sovereign public finances and national budgets',
          'Researchers examining long-term macroeconomic trends and sovereign borrowing'
        ],
        howItWorks:
          'Uses baseline published figures from the Union Budget documents, Ministry of Finance, Reserve Bank of India, and IMF World Economic Outlook, projecting continuous micro-increments based on annual fiscal deficit estimates.',
        resultsMeaning:
          'Shows how government borrowing finances public infrastructure, social security, and administration, highlighting the pace of interest obligations.',
        limitations: [
          'Figures are mathematical projections based on official annual budget estimates, not live minute-by-minute treasury balance sheets.',
          'Public debt is an aggregate sovereign obligation, not an individual debt collected directly from citizens.'
        ]
      };

    case 'budget-calculator':
      return {
        whatItIs:
          'The NAVIKO 50/30/20 Budget Planner is a personal finance tool based on the time-tested framework popularized by Senator Elizabeth Warren.',
        whatItDoes:
          'It divides your after-tax monthly income into three structured buckets: 50% for Essential Needs, 30% for Lifestyle Wants, and 20% for Savings & Debt Reduction.',
        whoItIsFor: [
          'Students and young professionals budgeting their first salaries',
          'Families seeking clarity on monthly cash flow and expense limits',
          'Anyone working toward debt freedom and emergency fund creation'
        ],
        howItWorks:
          'Applies direct percentage proportional allocations to net monthly income, with customized slider adjustments for high-savings or frugal budgeting targets.',
        resultsMeaning:
          'Offers realistic spending guardrails so you can enjoy discretionary spending without compromising savings or rent obligations.',
        limitations: [
          'In high cost-of-living metropolitan areas, housing and utilities may exceed 50%, requiring localized adjustments.',
          'Does not connect to external banking APIs or record private financial account data.'
        ]
      };

    case 'attendance-calculator':
      return {
        whatItIs:
          'The NAVIKO Attendance Calculator is an academic planning utility designed for college and university students facing mandatory attendance rules (such as 75% or 85% attendance criteria).',
        whatItDoes:
          'It calculates current attendance percentage, the exact number of consecutive upcoming classes you must attend to achieve your target percentage, or how many safe classes you can miss without falling below the limit.',
        whoItIsFor: [
          'College, polytechnic, and university students',
          'Class representatives and academic monitors tracking semester eligibility'
        ],
        howItWorks:
          'Uses discrete mathematical inequalities: If current percentage < target, it solves (Present + X) / (Total + X) ≥ Target. If current percentage ≥ target, it solves Present / (Total + Y) ≥ Target.',
        resultsMeaning:
          'Gives you a concrete, unambiguous target number of lectures to attend or miss so you avoid exam debarment or semester penalties.',
        limitations: [
          'Does not account for institutional medical leave compensations, duty leaves, or practical/lab weightage unless factored into total lecture counts.'
        ]
      };

    case 'cgpa-calculator':
      return {
        whatItIs:
          'The NAVIKO CGPA to Percentage Calculator is an academic conversion tool conforming to CBSE and Indian university grading conventions.',
        whatItDoes:
          'It converts Cumulative Grade Point Average (CGPA) on a 10-point scale into equivalent percentage marks, and vice-versa.',
        whoItIsFor: [
          'High school students (CBSE Class 10 & 12) filling entrance examination forms',
          'Undergraduate and postgraduate students applying for jobs, campus placements, and foreign universities'
        ],
        howItWorks:
          'Applies the standard CBSE conversion factor: Percentage = CGPA × 9.5. For custom university grading scales, allows entering specific conversion formulas or credit point multipliers.',
        resultsMeaning:
          'Provides the official estimated aggregate percentage required on government exam applications and corporate eligibility forms.',
        limitations: [
          'Some autonomous universities and international institutions use specialized credit-weighted formulas (SGPA/CGPA with distinct credit hours) rather than the standard 9.5 multiplier.'
        ]
      };

    case 'resume-builder':
      return {
        whatItIs:
          'The NAVIKO ATS Resume Builder is a client-side, privacy-focused curriculum vitae generator designed to create clean, recruiter-ready resumes that parse smoothly in Applicant Tracking Systems.',
        whatItDoes:
          'It provides single-column, ATS-friendly typography layouts with structured sections for Summary, Experience, Education, Skills, and Projects, exporting directly to clean print-ready PDF.',
        whoItIsFor: [
          'College graduates preparing for campus placement drives',
          'Working professionals updating their CVs for job applications',
          'Career changers requiring a clean, parseable resume structure'
        ],
        howItWorks:
          'Renders semantic HTML structures without complex tables, multi-column sidebars, or unparseable graphical elements that commonly fail ATS OCR scanners.',
        resultsMeaning:
          'Generates a high-scoring ATS template formatted for maximum human and machine readability.',
        limitations: [
          'Resume content, grammar, and relevance to specific job descriptions remain the user\'s responsibility. Always proofread thoroughly before submitting.'
        ]
      };

    case 'typing-speed-test':
      return {
        whatItIs:
          'The NAVIKO Typing Speed Test is an interactive keyboard assessment tool that measures typing proficiency in Words Per Minute (WPM) and character accuracy percentage.',
        whatItDoes:
          'It presents timed typing exercises (1, 2, 3, or 5 minutes), calculates net and gross WPM, tracks typing accuracy, and highlights error distribution in real time.',
        whoItIsFor: [
          'Job seekers preparing for clerical, data entry, and administrative typing tests',
          'Programmers, writers, and students seeking to improve keyboard speed and ergonomics'
        ],
        howItWorks:
          'Uses standard keystroke timing: Gross WPM = (Total characters typed ÷ 5) ÷ Minutes. Net WPM subtracts uncorrected typographical errors to measure effective throughput.',
        resultsMeaning:
          'Under 30 WPM is beginner; 35–50 WPM is average; 50–70 WPM is fast/professional; 70+ WPM is expert level.',
        limitations: [
          'Performance on mobile virtual keyboards is significantly lower than on physical desktop tactile keyboards.'
        ]
      };

    default:
      // Category-based fallback
      return getDefaultCategoryExplanation(tool);
  }
};

const getHealthDisclaimer = (toolId: string): string => {
  return 'The health and wellness utilities on NAVIKO are provided solely for educational and informational purposes. They are NOT a substitute for professional medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay seeking it because of information calculated on this website.';
};

const getDefaultCategoryExplanation = (tool: ToolMeta): StructuredToolExplanation => {
  const categoryName = tool.categoryName || 'Productivity';

  switch (tool.category) {
    case 'calculators':
      return {
        whatItIs: `${tool.name} is a high-precision, client-side online calculation utility on NAVIKO designed for rapid, error-free numerical problem-solving.`,
        whatItDoes: `It evaluates ${tool.shortDescription.toLowerCase()} with live results, instant copying, and formatted mathematical breakdowns.`,
        whoItIsFor: [
          'Students solving homework, science, and engineering exercises',
          'Working professionals needing rapid numerical verification',
          'Everyday users requiring transparent, reliable calculations'
        ],
        howItWorks:
          'Calculations run natively inside your web browser using high-precision JavaScript arithmetic engines, ensuring zero latency and total client-side privacy.',
        resultsMeaning:
          'Results represent exact mathematical solutions based on standard algebraic, geometric, or arithmetic conventions.',
        limitations: [
          'Subject to standard IEEE floating-point precision constraints for extreme astronomical or microscopic values.'
        ]
      };

    case 'finance':
      return {
        whatItIs: `${tool.name} is a free personal finance and investment planning calculator on NAVIKO designed to bring clarity to monetary decisions.`,
        whatItDoes: `It computes ${tool.shortDescription.toLowerCase()}, helping you estimate future outcomes, tax implications, and compounding growth.`,
        whoItIsFor: [
          'Salaried professionals planning investments and savings',
          'Investors evaluating compounding interest and market forecasts',
          'Anyone looking to organize personal finances with transparent math'
        ],
        howItWorks:
          'Applies verified financial formulas and statutory tax logic client-side without collecting any personal bank account numbers or financial identifiers.',
        resultsMeaning:
          'Gives you a projection of monetary balances, repayment schedules, or return figures based on your entered parameters.',
        limitations: [
          'Financial projections are educational estimates. Market returns, interest rate revisions, and future tax legislation may alter realized values.'
        ]
      };

    case 'student':
      return {
        whatItIs: `${tool.name} is an academic productivity utility on NAVIKO built specifically to help students manage courses, tests, and study schedules.`,
        whatItDoes: `It provides ${tool.shortDescription.toLowerCase()}, turning complex academic requirements into structured, actionable steps.`,
        whoItIsFor: [
          'High school, college, and university students',
          'Candidates preparing for competitive entrance examinations (JEE, NEET, UPSC, SSC, GATE)',
          'Educators and academic mentors organizing study plans'
        ],
        howItWorks:
          'Translates study objectives, syllabus weights, and timing constraints into structured planning outputs using proven academic productivity frameworks.',
        resultsMeaning:
          'Offers actionable targets to help you study systematically, prevent backlogs, and maximize exam readiness.',
        limitations: [
          'Academic outcomes depend on personal dedication, consistent revision, and individual syllabus difficulty.'
        ]
      };

    case 'pdf':
      return {
        whatItIs: `${tool.name} is a 100% private, browser-based PDF utility on NAVIKO for processing documents without server uploads.`,
        whatItDoes: `It allows you to ${tool.shortDescription.toLowerCase()} securely inside your browser window.`,
        whoItIsFor: [
          'Students submitting assignments and application forms',
          'Professionals handling sensitive contracts and private documents',
          'Anyone needing fast, watermark-free PDF management'
        ],
        howItWorks:
          'Uses modern WebAssembly and HTML5 File APIs to process PDF streams directly in your browser memory. Your documents never leave your local device.',
        resultsMeaning:
          'Produces a clean, standards-compliant PDF document ready to download, email, or print immediately.',
        limitations: [
          'Processing speed depends on local device memory and CPU performance when handling very large files (e.g. over 100 MB).'
        ]
      };

    case 'image':
      return {
        whatItIs: `${tool.name} is a privacy-first browser image utility on NAVIKO for quick graphical processing.`,
        whatItDoes: `It enables you to ${tool.shortDescription.toLowerCase()} without quality loss or server uploads.`,
        whoItIsFor: [
          'Job applicants resizing photos and signatures for official forms',
          'Web designers, bloggers, and content creators optimizing assets',
          'Students compressing images to meet strict portal upload limits'
        ],
        howItWorks:
          'Leverages client-side HTML5 Canvas and WebAssembly graphics libraries to process pixels locally in your browser with zero server data transfer.',
        resultsMeaning:
          'Delivers an optimized, correctly sized image file ready for immediate download and upload to third-party portals.',
        limitations: [
          'Heavy batch compression of dozens of ultra-high-resolution RAW photos may be constrained by browser memory.'
        ]
      };

    case 'career':
      return {
        whatItIs: `${tool.name} is a professional career preparation utility on NAVIKO built to help job seekers succeed in modern recruitment pipelines.`,
        whatItDoes: `It provides ${tool.shortDescription.toLowerCase()}, helping you present your skills and experience effectively.`,
        whoItIsFor: [
          'College students seeking internships and first jobs',
          'Experienced professionals updating credentials',
          'Job seekers preparing for corporate or government screening tests'
        ],
        howItWorks:
          'Follows established hiring benchmarks and ATS standards to ensure maximum readability and professional presentation.',
        resultsMeaning:
          'Generates formatted materials that help you pass initial automated screening and impress human interviewers.',
        limitations: [
          'Success in recruitment depends on matching your genuine qualifications and skills with specific employer requirements.'
        ]
      };

    default:
      return {
        whatItIs: `${tool.name} is a fast, free, and privacy-focused online utility on NAVIKO.`,
        whatItDoes: `It provides ${tool.shortDescription.toLowerCase()} instantly in your browser without registration or software installation.`,
        whoItIsFor: [
          'Students, professionals, and everyday web users',
          'Anyone seeking clean, straightforward online tools without ads or telemetry'
        ],
        howItWorks:
          'Runs entirely client-side using modern web standards, delivering instant outputs without storing or logging your private inputs.',
        resultsMeaning:
          'Delivers direct, verified outputs ready for immediate practical use.',
        limitations: [
          'Runs in your browser and operates on client-side inputs without external server dependencies.'
        ]
      };
  }
};
