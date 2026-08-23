import { ToolMeta } from '../types';

export const TOOLS_DATA: ToolMeta[] = [
  {
    id: 'number-calculator',
    name: 'Number Calculator',
    slug: 'number-calculator',
    path: '/tools/number-calculator',
    category: 'calculators',
    categoryName: 'Calculators',
    description: 'High-precision standard numerical calculator with arithmetic operations, memory registers (M+, M-, MR, MC), calculation tape history, keyboard shortcuts, and number-to-words converter.',
    shortDescription: 'Standard number calculator with memory, history tape, and keyboard input.',
    iconName: 'Calculator',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['calculator', 'basic calculator', 'math', 'arithmetic', 'number calculator', 'standard calculator', 'addition', 'multiplication'],
    features: [
      'Clean tactile numpad with live mathematical expression evaluation',
      'Memory registers: MC, MR, M+, and M- with active storage indicators',
      'Persistent calculation history tape with one-click result recall and copy',
      'Full physical keyboard shortcut support for rapid desktop calculation',
      'Instant numbers-in-words conversion in Indian and Western formatting'
    ],
    howToUse: [
      'Click or type numbers using your keyboard or on-screen keypad.',
      'Use arithmetic operators (+, −, ×, ÷) to chain mathematical operations.',
      'Press Enter or the = button to evaluate the result.',
      'Click previous history entries to reload their numbers into your active calculation.'
    ],
    faqs: [
      {
        question: 'Can I use my computer keyboard to calculate?',
        answer: 'Yes! You can use the top number row or your keyboard numpad, along with Enter (=), Backspace (Delete), and Esc (Clear).'
      },
      {
        question: 'How do the Memory buttons (M+, M-, MR, MC) work?',
        answer: 'M+ adds the current display to memory, M- subtracts it, MR recalls the saved memory value, and MC clears the memory.'
      }
    ]
  },
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    slug: 'scientific-calculator',
    path: '/tools/scientific-calculator',
    category: 'calculators',
    categoryName: 'Calculators',
    description: 'Advanced scientific calculator supporting Trigonometry (sin, cos, tan), Inverse & Hyperbolic functions, Logarithms (ln, log10), Powers (xʸ, x²), Factorials (n!), Roots, DEG/RAD modes, and mathematical constants.',
    shortDescription: 'Advanced scientific calculator with trig, logs, powers, and Deg/Rad modes.',
    iconName: 'Sparkles',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['scientific calculator', 'trigonometry', 'sin', 'cos', 'tan', 'log', 'ln', 'exponential', 'algebra', 'engineering math', 'degree', 'radian'],
    features: [
      'Full trigonometric suite: sin, cos, tan, inverse (arcsin, arccos, arctan), and hyperbolic (sinh, cosh, tanh)',
      'Dual Angle Mode toggle: Degrees (DEG) and Radians (RAD)',
      'Exponential & Logarithms: natural ln, base-10 log, base-2 log, xʸ, x², x³, √x, ∛x',
      'Constants: Pi (π = 3.14159...), Euler (e = 2.71828...), and Golden Ratio (φ)',
      'Calculation tape history with Ans (previous answer) recall'
    ],
    howToUse: [
      'Toggle between DEG (Degrees) and RAD (Radians) depending on your problem set.',
      'Use the "2nd" (Shift) button to reveal inverse functions like sin⁻¹, cos⁻¹, eˣ, and 10ˣ.',
      'Combine parentheses and mathematical constants to evaluate complex formulas.',
      'Press = or Enter to view the high-precision output.'
    ],
    faqs: [
      {
        question: 'What angle mode is used for trigonometry?',
        answer: 'By default, the calculator is set to Degrees (DEG). You can switch to Radians (RAD) at any time using the top mode toggle.'
      },
      {
        question: 'Does this scientific calculator handle large factorials and exponents?',
        answer: 'Yes! It utilizes high-precision IEEE floating point calculations to reliably evaluate exponents and factorials.'
      }
    ]
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    slug: 'percentage-calculator',
    path: '/tools/percentage-calculator',
    category: 'calculators',
    categoryName: 'Calculators',
    description: 'Easily calculate percentage of values, percentage difference, percent increase, and percentage decrease with step-by-step formula breakdowns.',
    shortDescription: 'Calculate X% of Y, percentage increase, decrease, and proportion.',
    iconName: 'Percent',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['percentage', 'math', 'discount', 'percent increase', 'fraction', 'calculator', 'exam marks'],
    features: [
      'Find X% of any given number Y',
      'Calculate what percentage X is of Y',
      'Compute exact percentage increase or growth',
      'Compute exact percentage decrease or discount',
      'One-click instant copy & calculation breakdown'
    ],
    howToUse: [
      'Select the desired calculation mode from the top tab selector.',
      'Enter the numerical values into the provided input fields.',
      'Results update in real-time as you type with the complete mathematical formula.',
      'Click the Copy button to quickly copy the computed answer to your clipboard.'
    ],
    faqs: [
      {
        question: 'How do you calculate the percentage of a number?',
        answer: 'To find X% of Y, multiply the value Y by X and then divide by 100. For example, 20% of 150 is (20 × 150) / 100 = 30.'
      },
      {
        question: 'How is percentage increase calculated?',
        answer: 'Percentage Increase = ((New Value - Original Value) / Original Value) × 100.'
      },
      {
        question: 'Is this calculator free and private?',
        answer: 'Yes, 100% free and client-side. No numbers or data are stored on any server.'
      }
    ]
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    slug: 'age-calculator',
    path: '/tools/age-calculator',
    category: 'calculators',
    categoryName: 'Calculators',
    description: 'Calculate your exact age in years, months, days, total hours, minutes, and find out the exact countdown to your next birthday.',
    shortDescription: 'Calculate exact age in years, months, days, and next birthday countdown.',
    iconName: 'Calendar',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['age', 'birthday', 'date of birth', 'dob', 'years', 'months', 'days', 'countdown'],
    features: [
      'Exact age broken down into years, months, and days',
      'Total lived duration in days, weeks, hours, and minutes',
      'Next birthday countdown tracker with day of the week',
      'Born day of the week and zodiac insight',
      'Zero server tracking, fully client-side'
    ],
    howToUse: [
      'Pick your Date of Birth in the date picker input.',
      'Optionally adjust the "Age at Date" if calculating age at a past or future milestone.',
      'Instantly see your exact age and birthday timeline.'
    ],
    faqs: [
      {
        question: 'How does the leap year factor into age calculation?',
        answer: 'The calculator uses precise calendar calculations accounting for leap years and different month day lengths (28, 29, 30, 31 days).'
      },
      {
        question: 'Is my birth date uploaded anywhere?',
        answer: 'No. All calculations run strictly inside your browser environment.'
      }
    ]
  },
  {
    id: 'cgpa-calculator',
    name: 'CGPA Calculator',
    slug: 'cgpa-calculator',
    path: '/tools/cgpa-calculator',
    category: 'student',
    categoryName: 'Student Tools',
    description: 'Calculate cumulative grade point average (CGPA), semester GPA, and convert CGPA to percentage using standard university formulas (CBSE 9.5x, 10x, or Custom Multipliers).',
    shortDescription: 'Calculate CGPA, SGPA, and convert to percentage with custom scales.',
    iconName: 'GraduationCap',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['cgpa', 'sgpa', 'gpa', 'university', 'college', 'semester', 'grade points', 'percentage conversion'],
    features: [
      'Add or remove multiple subjects and semesters seamlessly',
      'Support for Grade Points (10-point scale) & Credit Weighted calculation',
      'Multiple Percentage Conversion formulas: CBSE 9.5x standard, 10.0x scale, or custom multiplier',
      'Semester summary breakdown and total credit tally',
      'Save configuration or reset anytime'
    ],
    howToUse: [
      'Enter course name (optional), Grade Point earned, and Credit Hours for each subject.',
      'Click "Add Subject" to append more courses to your semester.',
      'Select your university conversion standard (e.g. CBSE 9.5x multiplier) to see the equivalent percentage.',
      'Export or copy your final CGPA summary.'
    ],
    faqs: [
      {
        question: 'Why is the standard CBSE/University formula 9.5?',
        answer: 'CBSE and many technical universities established 9.5 based on the average marks distribution (95% roughly corresponding to 10 CGPA).'
      },
      {
        question: 'What is the difference between SGPA and CGPA?',
        answer: 'SGPA (Semester Grade Point Average) measures performance in a single semester, while CGPA (Cumulative Grade Point Average) aggregates all completed semesters.'
      }
    ]
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    slug: 'unit-converter',
    path: '/tools/unit-converter',
    category: 'other',
    categoryName: 'Calculators & Converters',
    description: 'Universal unit converter supporting Length, Weight, Temperature, Area, Volume, Time, Speed, and Digital Storage units with instant real-time conversion.',
    shortDescription: 'Convert between length, weight, temperature, data storage, and more.',
    iconName: 'Scale',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['converter', 'units', 'metric', 'imperial', 'celsius', 'fahrenheit', 'meters', 'feet', 'kilograms', 'pounds', 'storage'],
    features: [
      '8 Comprehensive Categories: Length, Mass/Weight, Temperature, Area, Volume, Time, Speed, Digital Storage',
      'Instant bidirectional conversion as you type',
      'One-click unit swap button',
      'Displays full precision values and conversion mathematical relationship'
    ],
    howToUse: [
      'Choose the measurement category (e.g., Length, Temperature).',
      'Select the "From" unit and the "To" unit.',
      'Type your value into the input field to receive instantaneous conversion results.'
    ],
    faqs: [
      {
        question: 'How do you convert Celsius to Fahrenheit?',
        answer: 'Fahrenheit = (Celsius × 9/5) + 32. For example, 100°C = (100 × 1.8) + 32 = 212°F.'
      },
      {
        question: 'How does digital storage conversion work?',
        answer: 'Digital storage uses standard binary (1024 Bytes = 1 KB) or decimal bases, accurately converting between Bytes, KB, MB, GB, TB, and PB.'
      }
    ]
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    slug: 'word-counter',
    path: '/tools/word-counter',
    category: 'other',
    categoryName: 'Writing & Text Tools',
    description: 'Real-time text analyzer that counts words, characters, spaces, sentences, paragraphs, reading time, and estimated speaking duration with zero server upload.',
    shortDescription: 'Real-time word, character, sentence counter, and reading time estimator.',
    iconName: 'FileText',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['word counter', 'character count', 'reading time', 'text editor', 'essay', 'character limit', 'tweet counter'],
    features: [
      'Instant counts: Words, Total Characters, Characters (No Spaces), Sentences, Paragraphs',
      'Accurate Reading Time (based on 200 wpm) & Speaking Time (130 wpm)',
      'Top frequent keywords density inspector',
      'Text transformation utilities: UPPERCASE, lowercase, Title Case, sentence case, Clean extra whitespace',
      'One-click copy text and clear actions'
    ],
    howToUse: [
      'Type or paste your text directly into the main text box.',
      'The statistic cards will dynamically update in real time with word and character tallies.',
      'Use the utility toolbar to format, capitalize, or clear your text as needed.'
    ],
    faqs: [
      {
        question: 'What is the average reading speed used?',
        answer: 'We calculate reading time based on an industry standard benchmark of 200 to 250 words per minute for silent adult reading.'
      },
      {
        question: 'Is my confidential text private?',
        answer: 'Yes. All text parsing happens directly inside your browser memory; nothing is transmitted to any server.'
      }
    ]
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    slug: 'image-compressor',
    path: '/tools/image-compressor',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Compress PNG, JPEG, and WebP images directly in your browser without quality loss. Reduce file size by up to 80% with adjustable quality slider.',
    shortDescription: 'Reduce image file size directly in your browser with live preview.',
    iconName: 'Image',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['image compressor', 'compress image', 'reduce image size', 'jpg compress', 'png compress', 'optimize photo'],
    features: [
      'Client-side HTML5 Canvas compression — 100% private and fast',
      'Adjustable quality percentage slider from 10% to 100%',
      'Side-by-side original vs compressed visual comparison',
      'Displays exact byte savings and percentage size reduction',
      'Instant high-speed download of optimized image'
    ],
    howToUse: [
      'Drag and drop an image file (JPG, PNG, WebP) or click "Browse Image".',
      'Adjust the compression quality slider to balance file size and visual fidelity.',
      'Inspect the before & after comparison and total KB saved.',
      'Click "Download Compressed Image".'
    ],
    faqs: [
      {
        question: 'Are my images uploaded to your servers?',
        answer: 'No! NAVIKO uses the HTML5 Canvas client-side API. Your photos never leave your device.'
      },
      {
        question: 'Which formats are supported?',
        answer: 'JPEG, PNG, WebP, and standard web raster image formats.'
      }
    ]
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    slug: 'image-resizer',
    path: '/tools/image-resizer',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Resize image dimensions in pixels or percentages. Lock or unlock aspect ratio, choose export format, and crop or scale photos with precision.',
    shortDescription: 'Resize photos to exact width and height with aspect ratio lock.',
    iconName: 'Maximize2',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['image resizer', 'resize photo', 'dimensions', 'aspect ratio', 'crop image', 'pixel size'],
    features: [
      'Set exact Width and Height in pixels',
      'Lock Aspect Ratio toggle to maintain original proportions without distortion',
      'Preset quick dimensions (Social Media, Passport, Full HD 1080p, 720p, Icon)',
      'Export to JPEG, PNG, or WebP format with custom quality',
      '100% browser-based processing'
    ],
    howToUse: [
      'Upload an image from your computer or phone.',
      'Type the target width or height, or pick a standard preset.',
      'Keep "Lock Aspect Ratio" checked to avoid squishing the image.',
      'Click "Apply & Download Resized Image".'
    ],
    faqs: [
      {
        question: 'Can I upscale small images?',
        answer: 'Yes, you can specify larger dimensions, though keeping the source resolution is recommended for optimum sharpness.'
      },
      {
        question: 'Is there a limit on image dimensions?',
        answer: 'The tool works with standard browser image handling, easily processing high-resolution camera photos up to 4K+.'
      }
    ]
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    slug: 'qr-code-generator',
    path: '/tools/qr-code-generator',
    category: 'other',
    categoryName: 'Productivity Tools',
    description: 'Generate high-resolution custom QR codes for websites, plain text, Wi-Fi networks, contact cards, emails, and phone numbers with instant PNG download.',
    shortDescription: 'Create custom, high-resolution QR codes for URLs and text instantly.',
    iconName: 'QrCode',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['qr code', 'qr generator', 'barcode', 'scannable code', 'wifi qr', 'url qr'],
    features: [
      'Generate QR codes for URLs, Plain Text, Contact details, Phone numbers',
      'Customizable color picker for Foreground and Background tones',
      'Selectable Error Correction Levels (L, M, Q, H) for scannability',
      'High-definition resolution selector up to 1024x1024px',
      'One-click PNG image download and direct clipboard copy'
    ],
    howToUse: [
      'Type or paste the URL or text in the content box.',
      'Optionally customize the color scheme and margin size.',
      'Preview the live QR code in the canvas box.',
      'Click "Download QR Code (PNG)" to save your code.'
    ],
    faqs: [
      {
        question: 'Do these QR codes ever expire?',
        answer: 'No! These are static QR codes encoding your text directly. They never expire and do not route through any third-party redirection link.'
      },
      {
        question: 'Can all phone cameras scan these?',
        answer: 'Yes, our QR codes adhere to the global ISO/IEC 18004 standard compatible with iOS and Android camera apps.'
      }
    ]
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    slug: 'typing-speed-test',
    path: '/tools/typing-speed-test',
    category: 'career',
    categoryName: 'Career & Skills',
    description: 'Test your typing speed (WPM) and accuracy with randomized paragraph tests, live error highlights, and real-time CPM tracking across 30s, 60s, or 120s.',
    shortDescription: 'Test your WPM typing speed and accuracy with timed challenges.',
    iconName: 'Keyboard',
    popular: false,
    studentHub: true,
    status: 'active',
    tags: ['typing test', 'wpm', 'typing speed', 'words per minute', 'keyboard accuracy', 'touch typing'],
    features: [
      'Real-time WPM (Words Per Minute) and Accuracy calculation',
      'Selectable test timers: 30 Seconds, 60 Seconds, 120 Seconds',
      'Curated passage library spanning diverse topics & difficulty levels',
      'Character-by-character color feedback (Correct, Incorrect, Active cursor)',
      'Detailed Performance Summary score card with rating grade'
    ],
    howToUse: [
      'Select your preferred duration (e.g. 60 seconds).',
      'Click on the typing input field to begin; the timer starts automatically with your first keypress.',
      'Type the displayed text accurately.',
      'Review your comprehensive WPM, net speed, accuracy, and error breakdown when the timer finishes.'
    ],
    faqs: [
      {
        question: 'How is WPM calculated?',
        answer: 'Standard formula: (Total characters typed / 5) / (Time in minutes) - (Uncorrected errors / Time in minutes).'
      },
      {
        question: 'What is considered a good typing speed?',
        answer: 'The average typing speed is around 40 WPM. Professional typists typically achieve 65–85+ WPM.'
      }
    ]
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    slug: 'resume-builder',
    path: '/tools/resume-builder',
    category: 'career',
    categoryName: 'Career Tools',
    description: 'Create an ATS-friendly, clean professional resume in minutes. Add education, work experience, projects, skills, certifications, and download as clean PDF.',
    shortDescription: 'Build professional, ATS-friendly resumes with live preview and PDF export.',
    iconName: 'Briefcase',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['resume builder', 'cv maker', 'ats resume', 'job application', 'curriculum vitae', 'cover letter', 'career'],
    features: [
      'Structured sections: Contact Info, Summary, Education, Experience, Projects, Skills, Certifications, Languages',
      'Add, remove, and reorder multiple entry items effortlessly',
      '3 Polished ATS-friendly templates: Modern Clean, Executive Slate, Minimalist Serif',
      '1-Click "Load Sample Data" to quickly see a filled template',
      'Local Browser Auto-Save: Never lose your resume progress',
      'Native Pixel-Perfect Print & PDF Export'
    ],
    howToUse: [
      'Fill in your personal details, summary, and work/education history in the form editor.',
      'Switch templates anytime in the preview pane to see different styling.',
      'Click "Print / Save PDF" to open the browser print dialog and save as a high-quality PDF.'
    ],
    faqs: [
      {
        question: 'Are these resumes ATS-friendly?',
        answer: 'Yes! Our templates use clean semantic headings, standard font hierarchies, and linear layouts that Applicant Tracking Systems (ATS) can parse cleanly without tables or complex graphics.'
      },
      {
        question: 'Is my private career data stored anywhere?',
        answer: 'Never. All data is saved exclusively inside your browser localStorage.'
      }
    ]
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    slug: 'sip-calculator',
    path: '/tools/sip-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate future returns on your Systematic Investment Plan (SIP) in mutual funds with step-up annual growth, inflation adjustments, and interactive compounding charts.',
    shortDescription: 'Calculate SIP maturity returns, compounding growth, and wealth gain.',
    iconName: 'TrendingUp',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['sip', 'mutual funds', 'investment', 'compounding', 'wealth', 'sip calculator', 'step up sip', 'finance', 'returns'],
    features: [
      'Interactive monthly SIP investment sliders with preset quick amounts',
      'Step-up SIP annual percentage increase simulator',
      'Inflation-adjusted real purchasing power view',
      'Interactive Area Chart and Donut ratio split (Invested vs Wealth Gain)',
      'Complete year-by-year schedule table with one-click export'
    ],
    howToUse: [
      'Enter your desired monthly investment amount in ₹ or your local currency.',
      'Set the expected annual rate of return (CAGR) and total investment duration in years.',
      'Optionally enable Annual Step-Up (%) or Inflation Adjustment for deeper financial planning.',
      'Inspect the live growth graph and copy your investment blueprint to your clipboard.'
    ],
    faqs: [
      {
        question: 'What is a SIP (Systematic Investment Plan)?',
        answer: 'A SIP allows you to invest a fixed amount regularly (e.g. monthly) into mutual funds or index funds, leveraging rupee cost averaging and power of compounding.'
      },
      {
        question: 'What is a Step-Up SIP?',
        answer: 'A Step-Up SIP automatically increases your monthly contribution by a fixed percentage (e.g., 10%) each year as your salary or income grows, multiplying long-term wealth.'
      },
      {
        question: 'What return rate should I assume for equity mutual funds?',
        answer: 'Broad market indices like Nifty 50 or S&P 500 have historically delivered around 12%–14% CAGR over 10+ year horizons.'
      }
    ]
  },
  {
    id: 'lump-sum-calculator',
    name: 'Lump Sum Investment Calculator',
    slug: 'lump-sum-calculator',
    path: '/tools/lump-sum-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate compounded future returns on one-time lump sum investments in mutual funds, stocks, or index ETFs with Rule of 72 doubling timeline.',
    shortDescription: 'Calculate compound returns and wealth multiplier on one-time investments.',
    iconName: 'DollarSign',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['lump sum', 'investment', 'compound interest', 'cagr', 'mutual fund', 'stocks', 'wealth'],
    features: [
      'One-time principal investment compounding engine',
      'Calculates total wealth multiplier (e.g. 3.5x)',
      'Rule of 72 automatic doubling time insight',
      'Year-by-year compounding trajectory chart'
    ],
    howToUse: [
      'Input the total one-time lump sum amount to invest.',
      'Set the anticipated annual interest or return rate and time horizon.',
      'View your final compounded corpus and doubling timeline.'
    ],
    faqs: [
      {
        question: 'What is the Rule of 72 in finance?',
        answer: 'The Rule of 72 is a quick formula to estimate how many years it takes to double your money: Years to double ≈ 72 / (Annual Return Rate).'
      }
    ]
  },
  {
    id: 'emi-calculator',
    name: 'EMI & Loan Calculator',
    slug: 'emi-calculator',
    path: '/tools/emi-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate monthly loan EMI for Home Loans, Car Loans, Personal Loans, and Education Loans with interactive amortization schedule and prepayment interest saver simulator.',
    shortDescription: 'Calculate monthly EMI, interest breakdown, and loan prepayment savings.',
    iconName: 'Landmark',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'interest', 'amortization', 'prepayment', 'mortgage'],
    features: [
      'Quick loan presets for Home, Car, Personal, and Education loans',
      'Principal vs Total Interest Donut breakdown chart',
      'Yearly loan amortization repayment schedule table',
      'Prepayment & Extra Monthly EMI simulator to save lakhs in interest'
    ],
    howToUse: [
      'Select the loan category or type your loan principal amount.',
      'Adjust the bank interest rate (% p.a.) and tenure in years.',
      'Review your exact monthly EMI and total interest payable.',
      'Use the Prepayment slider to see how paying extra cuts years off your loan.'
    ],
    faqs: [
      {
        question: 'How is monthly EMI calculated?',
        answer: 'EMI = [P × r × (1+r)^n] / [(1+r)^n - 1], where P is Principal, r is periodic monthly rate, and n is total months.'
      },
      {
        question: 'How does loan prepayment save interest?',
        answer: 'Every extra rupee paid goes directly towards reducing the principal loan balance, significantly lowering the compound interest calculated on subsequent months.'
      }
    ]
  },
  {
    id: 'salary-calculator',
    name: 'Salary & In-Hand Tax Calculator',
    slug: 'salary-calculator',
    path: '/tools/salary-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Convert annual CTC to monthly in-hand take home salary with New Tax Regime (Budget 2024-2026) vs Old Tax Regime comparison, EPF, Gratuity, and Professional Tax deductions.',
    shortDescription: 'CTC to in-hand monthly take-home salary and New vs Old Tax comparison.',
    iconName: 'Briefcase',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['salary calculator', 'in hand salary', 'ctc to in hand', 'income tax', 'new regime', 'old regime', 'epf', 'tds', 'take home'],
    features: [
      'Instant CTC to monthly in-hand take-home breakdown',
      'Comparison between New Tax Regime and Old Tax Regime',
      'Includes Standard Deduction (₹75k for New Regime), Section 87A rebate, EPF, and PT',
      'Customizable 80C, 80D, and HRA exemption sliders for Old Regime'
    ],
    howToUse: [
      'Enter your Annual CTC in ₹ (e.g., 12,00,000 for 12 LPA).',
      'Toggle whether EPF, Gratuity, or Professional Tax are included in your offer letter.',
      'Switch between New and Old Tax Regimes to find out which regime gives you higher in-hand pay.'
    ],
    faqs: [
      {
        question: 'What is the Standard Deduction in the New Tax Regime?',
        answer: 'The Union Budget increased the standard deduction for salaried individuals under the New Tax Regime to ₹75,000.'
      },
      {
        question: 'Up to what salary is income tax NIL under New Regime?',
        answer: 'With the ₹75,000 standard deduction and Section 87A rebate, annual income up to ₹7.75 Lakhs is effectively zero tax!'
      }
    ]
  },
  {
    id: 'cagr-calculator',
    name: 'CAGR Returns Calculator',
    slug: 'cagr-calculator',
    path: '/tools/cagr-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate Compound Annual Growth Rate (CAGR), absolute return percentages, and investment growth multipliers for mutual funds, stocks, and real estate.',
    shortDescription: 'Compute CAGR compound annual growth rate and absolute return %.',
    iconName: 'Percent',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['cagr', 'returns', 'annual growth', 'mutual fund returns', 'stock cagr', 'portfolio'],
    features: [
      'Calculates exact CAGR % per annum',
      'Shows Total Absolute Return % and Net Profit',
      'Computes investment growth multiplier (e.g. 2.45x)',
      'One-click summary copy'
    ],
    howToUse: [
      'Enter the starting (initial) value of your investment.',
      'Enter the final value and the duration in years.',
      'Instantly get the annualized compounded return rate.'
    ],
    faqs: [
      {
        question: 'What is CAGR?',
        answer: 'CAGR (Compound Annual Growth Rate) represents the mean annual growth rate of an investment over a specified period of time longer than one year.'
      }
    ]
  },
  {
    id: 'fd-calculator',
    name: 'Fixed Deposit (FD) & RD Calculator',
    slug: 'fd-calculator',
    path: '/tools/fd-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate maturity amount and total interest for Fixed Deposits (FD) and Recurring Deposits (RD) with monthly, quarterly, and annual compounding plus Senior Citizen benefits.',
    shortDescription: 'Calculate maturity value and interest for bank FD and RD accounts.',
    iconName: 'Landmark',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['fd calculator', 'fixed deposit', 'rd calculator', 'recurring deposit', 'bank interest', 'senior citizen'],
    features: [
      'Supports both Fixed Deposit (Lump sum) and Recurring Deposit (Monthly)',
      'Quarterly and monthly compounding formulas',
      'Senior Citizen (+0.50%) rate boost toggle',
      'Visual breakdown chart of principal vs interest'
    ],
    howToUse: [
      'Choose whether you want to calculate FD or RD.',
      'Enter the deposit amount, bank interest rate, and tenure.',
      'Review total maturity value and interest accrued.'
    ],
    faqs: [
      {
        question: 'How frequently do Indian banks compound FD interest?',
        answer: 'Most Indian scheduled commercial banks compound fixed deposit interest on a quarterly basis.'
      }
    ]
  },
  {
    id: 'fire-calculator',
    name: 'FIRE (Retirement) Calculator',
    slug: 'fire-calculator',
    path: '/tools/fire-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Plan early retirement and financial freedom with the FIRE (Financial Independence Retire Early) calculator. Computes Lean, Standard, and Fat FIRE corpus targets and required monthly SIP.',
    shortDescription: 'Calculate your early retirement target corpus and monthly SIP required.',
    iconName: 'Flame',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['fire calculator', 'financial freedom', 'retire early', 'retirement planner', '4 percent rule', 'gen z finance'],
    features: [
      'Standard 25x Rule (4% Safe Withdrawal Rate) computation',
      'Lean FIRE, Standard FIRE, and Fat FIRE milestone targets',
      'Calculates exact monthly SIP investment needed from today to retire on time',
      'Factors in post-retirement inflation and existing savings'
    ],
    howToUse: [
      'Set your current age and target early retirement age.',
      'Input your current monthly living expenses and expected inflation rate.',
      'See your target freedom corpus and monthly investment required.'
    ],
    faqs: [
      {
        question: 'What is the 4% Rule in FIRE?',
        answer: 'The 4% rule (from the Trinity Study) states that you can withdraw 4% of your retirement portfolio annually (adjusted for inflation) with high probability of never running out of money.'
      },
      {
        question: 'What is Lean FIRE vs Fat FIRE?',
        answer: 'Lean FIRE covers only basic minimal living expenses (~20x), while Fat FIRE allows for luxurious living, travel, and high discretionary spending (~35x+).'
      }
    ]
  },
  {
    id: 'inflation-calculator',
    name: 'Inflation & Purchasing Power Calculator',
    slug: 'inflation-calculator',
    path: '/tools/inflation-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Calculate how inflation erodes purchasing power over time and discover the future cost of your financial goals in 5, 10, or 20 years.',
    shortDescription: 'Calculate purchasing power loss and future cost of goods due to inflation.',
    iconName: 'TrendingDown',
    popular: false,
    studentHub: false,
    status: 'active',
    tags: ['inflation', 'purchasing power', 'future cost', 'value of money', 'inflation calculator', 'cost of living'],
    features: [
      'Shows future cost of present day items after inflation',
      'Calculates real purchasing power value of uninvested cash',
      'Yearly purchasing power erosion trajectory chart',
      'One-click summary copy'
    ],
    howToUse: [
      'Enter the present cost or amount.',
      'Adjust the expected inflation rate and time period in years.',
      'View the future required cost and purchasing power loss.'
    ],
    faqs: [
      {
        question: 'Why is beating inflation important?',
        answer: 'If your money sits in a low-interest bank account earning less than the inflation rate, your real purchasing power declines every single year.'
      }
    ]
  },
  {
    id: 'debt-clock',
    name: 'National Debt Clock (India & World)',
    slug: 'debt-clock',
    path: '/tools/debt-clock',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Real-time sovereign public debt clock for India, United States, Japan, UK, China, and world economies with per-citizen debt, debt-to-GDP ratios, growth tickers, and payoff simulator.',
    shortDescription: 'Live national debt clock for India, USA, Japan, and world with per-capita metrics.',
    iconName: 'Globe',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['debt clock', 'india debt clock', 'national debt', 'sovereign debt', 'debt to gdp', 'public debt', 'us debt clock', 'gdp', 'fiscal deficit', 'economy', 'budget'],
    features: [
      'Live real-time microsecond ticking national debt counters for India, USA, Japan, UK, Germany, China, etc.',
      'Calculates live Debt Per Citizen (Per Capita) and Debt Per Working Taxpayer',
      'Debt-to-GDP safety gauge with FRBM benchmark targets',
      'Real-world perspective comparators: Chandrayaan space missions, expressways, AI hubs',
      'Interactive citizen debt payoff and amortization simulation calculator',
      'Global sovereign debt leaderboard with sortable matrix in INR, USD, and EUR'
    ],
    howToUse: [
      'Select any country (e.g. India 🇮🇳, USA 🇺🇸, Japan 🇯🇵) from the top country selector.',
      'Toggle currency view between Local Currency (₹ INR), USD ($), or EUR (€).',
      'For India, easily switch between Indian numbering (Lakh / Crore) and Standard (Trillions).',
      'Explore live growth rates per second, daily additions, and session debt accumulated while viewing the page.',
      'Use the Payoff Simulator slider to see the impact of citizen monthly contributions.'
    ],
    faqs: [
      {
        question: 'What is India\'s Total National Public Debt?',
        answer: 'India\'s combined General Government Debt (Central Government + State Governments) is approximately ₹185+ Lakh Crores (around 81% of GDP), with an annual growth rate of roughly ₹17.3 Lakh Crores driven by capital infrastructure investments and fiscal deficits.'
      },
      {
        question: 'Is India\'s National Debt dangerous compared to other countries?',
        answer: 'Unlike many developing countries, over 95% of India\'s sovereign debt is denominated in domestic currency (INR) and held by domestic financial institutions like RBI, banks, and EPFO, insulating India from foreign exchange default shocks. For comparison, Japan has a Debt-to-GDP over 250% and the USA over 120%.'
      },
      {
        question: 'How is the live debt clock calculated?',
        answer: 'The clock uses official sovereign baseline figures from finance ministries and central banks, compounding continuously based on official annual borrowing projections, fiscal deficit targets, and bond yield interest trajectories.'
      }
    ]
  },
  {
    id: 'budget-calculator',
    name: '50/30/20 Budget Planner',
    slug: 'budget-calculator',
    path: '/tools/budget-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Scientifically balance your income between 50% Needs, 30% Wants, and 20% Savings with itemized expense manager, health alerts, and 5-year wealth growth projections.',
    shortDescription: 'Plan monthly budget with 50/30/20 rule, expense ledger, and wealth projections.',
    iconName: 'PieChart',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['budget', 'budget planner', '50 30 20 rule', 'expense tracker', 'personal finance', 'money manager', 'monthly budget', 'savings planner'],
    features: [
      'Automatic 50/30/20 Target Allocation calculation from take-home salary & side income',
      'Dynamic Itemized Expenses & Savings Ledger with custom line items',
      'Instant Budget Health Diagnostic: Overspending alert, heavy needs warning, golden balance',
      '5-Year Compound Savings Wealth Accumulation projection at 12% CAGR',
      'Instant archetypes: College Student, Tech Professional, Family of Four, Freelancer'
    ],
    howToUse: [
      'Enter your monthly take-home salary and optional side hustle inflows.',
      'Review your target 50% Needs, 30% Wants, and 20% Savings limits.',
      'Add or modify your specific expense entries in the itemized ledger.',
      'Check your Budget Health status and 5-Year compound savings forecast.'
    ],
    faqs: [
      {
        question: 'What is the 50/30/20 Budgeting Rule?',
        answer: 'Popularized by Elizabeth Warren, it splits your after-tax income into: 50% for Needs (Rent, food, utilities), 30% for Wants (Dining out, streaming, shopping), and 20% for Savings and debt repayment.'
      },
      {
        question: 'What if my Needs exceed 50% of my income?',
        answer: 'In high-cost cities, needs may temporarily take 55-60%. Focus on trimming non-essential wants and increasing income, aiming to allocate at least 10-15% towards savings until you reach 20%.'
      }
    ]
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    slug: 'discount-calculator',
    path: '/tools/discount-calculator',
    category: 'calculators',
    categoryName: 'Calculators & Shopping',
    description: 'Calculate instant sale price, percentage discount, stacked double coupon discounts, Buy X Get Y Free promotions, sales tax addition, and reverse discount pricing.',
    shortDescription: 'Calculate percentage off, double discounts, BOGO deals, and sale prices.',
    iconName: 'Percent',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['discount', 'sale', 'percent off', 'bogo', 'coupon', 'savings', 'shopping', 'black friday', 'retail discount'],
    features: [
      'Standard & Stacked (Double) Coupon discount calculations',
      'Buy X Get Y Free (BOGO) retail deal optimizer and equivalent flat % off',
      'Reverse discount calculator: Find original price or % off from sale price',
      'Optional sales tax / VAT addition and quantity multipliers',
      'One-click summary copy and celebratory savings feedback'
    ],
    howToUse: [
      'Enter the original retail price of your item.',
      'Select or drag the discount percentage slider (or click quick presets like 30%, 50%).',
      'Toggle additional stacked discounts or sales tax if applicable.',
      'Switch tabs to calculate Buy-X-Get-Y-Free promotions or reverse discount prices.'
    ],
    faqs: [
      {
        question: 'How do stacked / double discounts work?',
        answer: 'Stacked discounts apply successively: an initial 40% off reduces $100 to $60, then an extra 10% coupon takes $6 off the $60, giving a final price of $54 (total 46% off, not 50%).'
      },
      {
        question: 'What is the true discount of "Buy 2 Get 1 Free"?',
        answer: 'Buy 2 Get 1 Free gives you 3 items for the price of 2, which equals a 33.33% flat discount across all items.'
      }
    ]
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator 🇮🇳',
    slug: 'gst-calculator',
    path: '/tools/gst-calculator',
    category: 'finance',
    categoryName: 'Finance & Tax Tools',
    description: 'Accurate Indian Goods and Services Tax (GST) calculator with Add GST (Exclusive) and Remove GST (MRP Inclusive) modes, Intra-State (CGST + SGST) vs Inter-State (IGST) split, and Multi-Item Invoice Generator.',
    shortDescription: 'Calculate Indian GST, CGST, SGST, IGST, and itemized tax invoices.',
    iconName: 'Building2',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['gst', 'gst calculator', 'india', 'cgst', 'sgst', 'igst', 'tax invoice', 'hsn', 'mrp tax', 'vat'],
    features: [
      'Dual modes: Add GST (Exclusive) & Remove GST (Inclusive / MRP)',
      'Indian GST Slabs: 0%, 3% (Gold), 5%, 12%, 18%, 28% + Custom Rates',
      'Intra-State (CGST 50% + SGST 50%) vs Inter-State (IGST 100%) auto-split',
      'Multi-Item GST Invoice Generator with printable PDF-ready layout',
      'Indian number-to-words representation and comprehensive GST rate guide'
    ],
    howToUse: [
      'Choose whether to Add GST (Exclusive) or Remove GST from an MRP amount.',
      'Enter the amount and pick your Indian GST slab rate (e.g. 18%).',
      'Toggle Intra-State for CGST+SGST or Inter-State for IGST.',
      'Use the Multi-Item GST Bill tab to generate itemized customer invoices.'
    ],
    faqs: [
      {
        question: 'What is the formula to remove GST from an inclusive MRP price?',
        answer: 'Base Price = Total Price / (1 + GST% / 100). For example, ₹1,180 with 18% GST gives Base Price = 1180 / 1.18 = ₹1,000, and GST = ₹180.'
      },
      {
        question: 'When is CGST + SGST applied vs IGST?',
        answer: 'When buyer and seller are in the same Indian state (Intra-State), CGST and SGST are applied in equal 50% parts. When in different states (Inter-State), IGST is applied.'
      }
    ]
  },
  {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    slug: 'loan-calculator',
    path: '/tools/loan-calculator',
    category: 'finance',
    categoryName: 'Finance & Loans',
    description: 'Comprehensive Loan suite: Compare 2 or 3 loans side-by-side with processing fee analysis, calculate loan eligibility based on salary & FOIR, test early prepayment interest savings, and inspect yearly amortization charts.',
    shortDescription: 'Compare loans, check borrowing eligibility, and calculate prepayment savings.',
    iconName: 'Landmark',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['loan', 'loan calculator', 'home loan', 'car loan', 'loan comparison', 'eligibility', 'prepayment', 'amortization', 'interest savings'],
    features: [
      'Side-by-Side Loan Comparison: Identifies the cheaper bank option factoring in processing fees',
      'Loan Affordability & Eligibility Estimator based on Take-Home Salary & FOIR debt limits',
      'Prepayment & Payoff Optimizer: Simulates extra monthly or lump-sum prepayments and years saved',
      'Interactive Yearly Loan Amortization Schedule and Principal vs Interest chart'
    ],
    howToUse: [
      'Switch between "Compare 2 Loans", "Loan Eligibility", "Prepayment", or "Amortization".',
      'Enter loan amounts, interest rates, tenure, and bank processing fees.',
      'Review side-by-side cost differences and the cheaper loan recommendation.',
      'Simulate extra prepayments to see lakhs saved in total interest.'
    ],
    faqs: [
      {
        question: 'What does FOIR stand for in loan eligibility?',
        answer: 'FOIR stands for Fixed Obligation to Income Ratio. Most Indian banks restrict total monthly loan EMIs to a maximum of 40% to 50% of your net monthly take-home salary.'
      },
      {
        question: 'How much interest can I save by making 1 extra EMI prepayment per year?',
        answer: 'Paying just 1 extra EMI each year on a 20-year home loan can reduce your loan tenure by approximately 3 to 4 years and save 15% to 20% of your total loan interest.'
      }
    ]
  },
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    slug: 'simple-interest-calculator',
    path: '/tools/simple-interest-calculator',
    category: 'calculators',
    categoryName: 'Calculators & Finance',
    description: 'High-precision Simple Interest calculator (SI = PRT/100) with interactive solvers for Principal (P), Rate (R), and Time (T), step-by-step mathematical working, and linear growth charts.',
    shortDescription: 'Calculate SI = P×R×T/100, solve for P, R, or T, with step-by-step formula math.',
    iconName: 'Calculator',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['simple interest', 'si calculator', 'math', 'principal', 'rate of interest', 'prt formula', 'linear interest', 'school math', 'aptitude'],
    features: [
      'Calculate Simple Interest and Total Maturity Value (A = P + SI)',
      'Algebraic solvers: Solve for Principal (P), Rate (R), or Time (T)',
      'Flexible time units: Years, Months, or Days (365 basis)',
      'Step-by-step mathematical substitution and formula walkthrough',
      'Linear growth area chart and comparison note with compound interest'
    ],
    howToUse: [
      'Choose what to calculate (Interest, Principal, Rate, or Time).',
      'Enter your Principal Amount, Annual Interest Rate, and Time Period.',
      'View the instant Simple Interest earned, maturity total, and step-by-step formula math.'
    ],
    faqs: [
      {
        question: 'What is the Simple Interest formula?',
        answer: 'Simple Interest (SI) = (Principal × Rate × Time) / 100. Total Maturity Amount (A) = Principal + SI.'
      },
      {
        question: 'Where is Simple Interest used in real life?',
        answer: 'Simple interest is commonly used for short-term personal loans, car loans, auto financing, promissory notes, and school/competitive exam mathematics.'
      }
    ]
  },
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    slug: 'compound-interest-calculator',
    path: '/tools/compound-interest-calculator',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Exponential Compound Interest calculator supporting regular periodic contributions (SIP), compounding frequencies (Daily, Monthly, Quarterly, Annually), inflation adjustment, and Rule of 72 doubling forecasts.',
    shortDescription: 'Calculate compound interest with regular deposits, inflation adjustment, and charts.',
    iconName: 'TrendingUp',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['compound interest', 'ci calculator', 'investing', 'sip', 'wealth', 'exponential growth', 'rule of 72', 'inflation', 'stock market', 'mutual funds'],
    features: [
      'Exponential compound interest formula with regular periodic contributions (Monthly, Quarterly, Annually)',
      'Compounding frequencies: Daily (365x), Monthly (12x), Quarterly (4x), Semi-Annually, Annually',
      'Inflation-adjusted real purchasing power projection',
      'Rule of 72 wealth doubling time milestone badge',
      'Interactive visual trajectory Area Chart and Principal vs Interest donut'
    ],
    howToUse: [
      'Enter your starting investment principal.',
      'Add optional recurring contributions (e.g. ₹10,000 monthly).',
      'Set your expected annual return rate and investment horizon in years.',
      'Toggle inflation adjustment to see future purchasing power in today\'s money.'
    ],
    faqs: [
      {
        question: 'What is the Rule of 72?',
        answer: 'The Rule of 72 is a quick mental formula to estimate how many years it takes for your investment to double: Years to Double = 72 / Annual Interest Rate. At 12% return, your money doubles in approx 6 years.'
      },
      {
        question: 'Why does compound interest grow so much faster than simple interest?',
        answer: 'In compound interest, you earn interest not just on your initial principal, but also on all previous interest accumulated over time ("interest on interest").'
      }
    ]
  },
  {
    id: 'random-question-generator',
    name: 'Random Study Question Generator',
    slug: 'random-question-generator',
    path: '/tools/random-question-generator',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Dynamic question generator and flashcard quiz engine across Mathematics, Physics, Chemistry, Biology, Computer Science, Aptitude, History, and GK with 3D flashcards, MCQ quizzes, 60s speed sprints, and custom deck builder.',
    shortDescription: 'Flashcard review, MCQ quizzes, 60s sprints, and question generator across 8 subjects.',
    iconName: 'Brain',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['study', 'questions', 'quiz', 'flashcards', 'exam prep', 'math questions', 'physics', 'coding', 'aptitude', 'speed quiz'],
    features: [
      'Rich offline question repository across 8 subjects & difficulty tiers',
      '3 Interactive Modes: 3D Flip Flashcards, MCQ Quiz with Streaks, and 60-Second Timed Sprint',
      'Detailed explanations, formulas, hints, and Text-to-Speech audio reader',
      'Custom Flashcard Deck Builder: Save your own study questions to browser storage',
      'Personal High Score tracking and mastery bookmarking'
    ],
    howToUse: [
      'Filter by your preferred subject (e.g. Mathematics, Coding, Physics) or difficulty.',
      'Switch between Flashcard flip mode, MCQ Quiz mode, or 60s Speed Sprint.',
      'Click on flashcards to flip and reveal the step-by-step explanation.',
      'Click "Add Custom Question" to create your own custom study deck.'
    ],
    faqs: [
      {
        question: 'Can I add my own questions to the study deck?',
        answer: 'Yes! Click "Add Custom Question" to create your own flashcard with options and explanations. It is securely saved in your browser storage.'
      },
      {
        question: 'What subjects are covered?',
        answer: 'Mathematics, Physics, Chemistry, Biology, Computer Science & Coding, Logical Reasoning & Aptitude, History & Civics, and General Knowledge.'
      }
    ]
  },
  {
    id: 'study-timetable-generator',
    name: 'Study Timetable Generator',
    slug: 'study-timetable-generator',
    path: '/tools/study-timetable-generator',
    category: 'student',
    categoryName: 'Student & Productivity',
    description: 'Intelligent Study Timetable and Revision Planner that schedules prioritized study sessions, energy chronotype slots, Pomodoro intervals, live exam countdown, interactive daily checklists, and .ICS calendar export.',
    shortDescription: 'Generate balanced study schedules, track daily sessions, and export to calendar.',
    iconName: 'Calendar',
    popular: true,
    studentHub: true,
    status: 'active',
    tags: ['timetable', 'study planner', 'exam schedule', 'pomodoro', 'revision', 'calendar', 'ics export', 'student timetable'],
    features: [
      'Algorithmic scheduling balancing subject difficulty, priorities, and study chronotype (Morning/Night)',
      'Live Target Exam Countdown clock and daily focus velocity tracker',
      'Today\'s Interactive Checklist with completion progress bar and celebration confetti',
      'Export directly to Google Calendar, Apple Calendar, and Outlook via standard .ICS file',
      'Clean high-contrast printable view for physical study desks'
    ],
    howToUse: [
      'Set your target exam name and exam date.',
      'Choose your preferred study chronotype (Morning Early Bird, Afternoon, Night Owl) and daily study hours.',
      'Add your subjects with difficulty and priority ratings.',
      'View your weekly schedule, check off today\'s focus sessions, or export to your calendar app.'
    ],
    faqs: [
      {
        question: 'How do I import this timetable into Google Calendar or Apple Calendar?',
        answer: 'Click the "Download .ICS Calendar" button. Open Google Calendar or Apple Calendar, choose "Import", and select the downloaded file to auto-populate your recurring study sessions.'
      },
      {
        question: 'How does the scheduling algorithm decide which subjects to place first?',
        answer: 'High-priority and difficult subjects are scheduled during peak energy hours based on your chronotype, while weekends automatically integrate active recall and revision blocks.'
      }
    ]
  }
];

export const getToolByPath = (path: string): ToolMeta | undefined => {
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return TOOLS_DATA.find((t) => t.path === cleanPath);
};

export const getToolBySlug = (slug: string): ToolMeta | undefined => {
  return TOOLS_DATA.find((t) => t.slug === slug);
};

export const CATEGORIES_META = [
  {
    id: 'finance',
    title: 'Finance & Wealth',
    description: 'National Debt Clock, 50/30/20 Budget Planner, SIP compounding, Loan EMI, In-hand Salary tax, CAGR, and FIRE calculators.',
    icon: 'TrendingUp',
    path: '/finance-tools',
    toolsCount: 10
  },
  {
    id: 'calculators',
    title: 'Calculators',
    description: 'Standard number, scientific, percentage, age, and numerical math calculators.',
    icon: 'Calculator',
    path: '/calculators',
    toolsCount: 5
  },
  {
    id: 'student',
    title: 'Student Tools',
    description: 'Essential utilities for students, exams, grading, and everyday study productivity.',
    icon: 'GraduationCap',
    path: '/student-tools',
    toolsCount: 6
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Fast, browser-based image compression and dimension resizing without privacy risks.',
    icon: 'Image',
    path: '/image-tools',
    toolsCount: 2
  },
  {
    id: 'career',
    title: 'Career Tools',
    description: 'ATS-friendly resume builder and typing speed assessments for job seekers.',
    icon: 'Briefcase',
    path: '/career-tools',
    toolsCount: 2
  },
  {
    id: 'pdf',
    title: 'PDF Tools',
    description: 'Upcoming suite of browser-based PDF utilities: Merge, Split, Compress, and Convert.',
    icon: 'FileSpreadsheet',
    path: '/pdf-tools',
    toolsCount: 5,
    isComingSoon: true
  },
  {
    id: 'other',
    title: 'Other Tools',
    description: 'QR Code generators, Unit converters, and Word counters for daily productivity.',
    icon: 'Sparkles',
    path: '/tools?category=other',
    toolsCount: 3
  }
];
