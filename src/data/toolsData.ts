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
    name: 'Government Debt Estimator & Clock (India & World)',
    slug: 'debt-clock',
    path: '/tools/debt-clock',
    category: 'finance',
    categoryName: 'Finance & Wealth',
    description: 'Sovereign public debt counter & analyzer for India, United States, Japan, UK, China, and world economies with statistical per-citizen debt, Debt-to-GDP ratios, annual borrowing rates, and documented methodology.',
    shortDescription: 'Sovereign debt estimator for India, USA, Japan, and world economies with Debt-to-GDP & per-capita metrics.',
    iconName: 'Globe',
    popular: true,
    studentHub: false,
    status: 'active',
    tags: ['debt clock', 'india debt clock', 'national debt', 'sovereign debt', 'debt to gdp', 'public debt', 'us debt clock', 'gdp', 'fiscal deficit', 'economy', 'budget'],
    features: [
      'Deterministic sovereign debt estimators for India, USA, Japan, UK, Germany, China, etc. derived from official fiscal baselines',
      'Calculates statistical Debt Equivalent Per Citizen and Per Income-Tax Return Filer',
      'Explicit separation between Central Government Liabilities (56.8% of GDP) and General Government Debt (81.3% of GDP)',
      'Budgetary annual interest servicing rates and fiscal deficit growth metrics',
      'Documented infrastructure project scale comparators (Chandrayaan-3, expressways, supercomputer hubs)',
      'Interactive hypothetical citizen amortization calculator and global sovereign debt matrix'
    ],
    howToUse: [
      'Select any country (e.g. India 🇮🇳, USA 🇺🇸, Japan 🇯🇵) from the top country selector.',
      'For India, toggle between Central Government Liabilities (Union Budget) and General Government Consolidated Debt (Centre + States).',
      'Toggle currency view between Local Currency (₹ INR), USD ($), or EUR (€).',
      'For India, switch easily between Indian numbering (Lakh / Crore) and Standard (Trillions).',
      'Explore estimated annual borrowing rates, daily net additions, and session debt counter.',
      'Review the transparent Data & Methodology section for official source citations (Ministry of Finance, RBI, CBDT, IMF).'
    ],
    faqs: [
      {
        question: 'What is India\'s Total Government Debt?',
        answer: 'As per Union Budget documents (Ministry of Finance), Central Government Total Liabilities stand at approximately ₹185.27 Lakh Crore (~56.8% of GDP). When combined with all State Governments (General Government Debt tracked by RBI and IMF), consolidated gross debt is approximately ₹265.30 Lakh Crore (~81.3% of GDP).'
      },
      {
        question: 'Is India\'s sovereign debt risky compared to other major economies?',
        answer: 'Over 95% of India\'s sovereign liabilities are internal, rupee-denominated, and held by domestic financial institutions (commercial banks, insurance, EPFO, and RBI), shielding India from external currency liquidity crises. For comparison, Japan\'s Debt-to-GDP exceeds 220% and the USA exceeds 123%.'
      },
      {
        question: 'How is the debt counter calculated?',
        answer: 'The counter is a deterministic mathematical model based on the latest available official baseline figure published by respective finance ministries (e.g. Union Budget Statement of Liabilities) and the official annual fiscal deficit / net borrowing rate divided across 31,536,000 seconds in a year.'
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
  },
  {
    id: 'pdf-merge',
    name: 'Merge PDF Files',
    slug: 'pdf-merge',
    path: '/tools/pdf-merge',
    category: 'pdf',
    categoryName: 'PDF Tools',
    description: 'Combine multiple PDF documents into a single organized file in seconds. Drag-and-drop file reordering, individual page previews, and 100% private in-browser client-side merging.',
    shortDescription: 'Combine multiple PDF files into one in your browser securely.',
    iconName: 'FileSpreadsheet',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Merge PDF Online Free — Combine Multiple PDF Files | NAVIKO',
    metaDescription: 'Merge and combine multiple PDF documents into a single PDF file online for free. 100% secure client-side browser processing with drag-and-drop page reordering.',
    relatedToolPaths: ['/tools/pdf-split', '/tools/pdf-compressor', '/tools/jpg-to-pdf', '/tools/pdf-to-jpg'],
    tags: ['pdf merge', 'merge pdf', 'combine pdf', 'join pdf files', 'pdf binder', 'pdf joiner', 'free pdf merger'],
    features: [
      'Drag and drop upload for unlimited PDF documents',
      'Interactive drag-to-reorder cards to adjust document sequence',
      '100% client-side WebAssembly & JavaScript execution — your files never touch any server',
      'Shows individual file names, page counts, and sizes',
      'Instant one-click high-speed merged PDF download'
    ],
    howToUse: [
      'Upload two or more PDF files using drag-and-drop or the file selector.',
      'Reorder your documents using the up/down controls or drag handles.',
      'Click "Merge PDF Files" to combine them instantly.',
      'Click "Download Merged PDF" to save your single combined file.'
    ],
    faqs: [
      {
        question: 'Are my confidential PDF documents uploaded to your servers?',
        answer: 'No! NAVIKO processes PDF files directly in your browser using client-side JavaScript. Your files never leave your device.'
      },
      {
        question: 'Is there a limit on how many PDFs I can merge?',
        answer: 'You can merge as many PDF files as your device memory supports, with zero restrictions or daily quotas.'
      }
    ]
  },
  {
    id: 'pdf-compressor',
    name: 'Compress PDF',
    slug: 'pdf-compressor',
    path: '/tools/pdf-compressor',
    category: 'pdf',
    categoryName: 'PDF Tools',
    description: 'Reduce PDF file size quickly without losing text clarity or quality. Perfect for meeting portal upload limits (under 2MB, 500KB, or 100KB) with 3 optimization presets.',
    shortDescription: 'Reduce PDF file size securely in your browser for job and exam portals.',
    iconName: 'Minimize2',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Compress PDF Online Free — Reduce PDF File Size | NAVIKO',
    metaDescription: 'Compress and reduce PDF file size online without losing readability. Meet exam and job application upload limits with fast, private client-side compression.',
    relatedToolPaths: ['/tools/pdf-merge', '/tools/pdf-split', '/tools/jpg-to-pdf', '/tools/image-compressor'],
    tags: ['pdf compress', 'compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf under 100kb', 'pdf under 200kb', 'pdf optimizer'],
    features: [
      '3 Compression modes: Extreme Compression, Recommended Balance, and High Quality',
      'Calculates exact percentage and megabyte savings in real-time',
      'Optimizes document objects, uncompressed metadata, and redundant streams',
      '100% private browser-based execution with zero file uploads',
      'Quick target preset badges for government and university portal limits'
    ],
    howToUse: [
      'Select or drop your PDF document.',
      'Choose your preferred compression level (Recommended, Extreme, or High Quality).',
      'Click "Compress PDF Document".',
      'Compare original vs compressed size and download the optimized PDF.'
    ],
    faqs: [
      {
        question: 'Will text in my compressed PDF remain sharp and searchable?',
        answer: 'Yes! PDF structure optimization retains standard font vectors and selectable text while stripping duplicate metadata streams.'
      },
      {
        question: 'Is it safe to compress sensitive financial or identity PDFs?',
        answer: 'Yes, because compression runs 100% locally in your web browser. No files are transmitted across the internet.'
      }
    ]
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    slug: 'jpg-to-pdf',
    path: '/tools/jpg-to-pdf',
    category: 'pdf',
    categoryName: 'PDF Tools',
    description: 'Convert JPG, PNG, and WebP images into a single professional PDF document. Customize page orientation (Portrait/Landscape), margin spacing, and page sizing (A4, Letter, Fit to Image).',
    shortDescription: 'Convert JPG & PNG images into a clean multi-page PDF document.',
    iconName: 'FileText',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'JPG to PDF Converter Free — Convert Images to PDF Online | NAVIKO',
    metaDescription: 'Convert JPG, PNG, and WebP images to PDF online for free. Arrange pages, set A4 margins, customize orientation, and download high-quality PDFs instantly.',
    relatedToolPaths: ['/tools/pdf-to-jpg', '/tools/pdf-merge', '/tools/pdf-compressor', '/tools/jpg-to-png'],
    tags: ['jpg to pdf', 'image to pdf', 'photos to pdf', 'png to pdf', 'convert jpg to pdf', 'create pdf from images', 'photo pdf maker'],
    features: [
      'Convert single or batch JPG, PNG, and WebP photos into one organized PDF',
      'Page size selector: A4 (Standard Document), US Letter, or Fit to Image Dimensions',
      'Page Orientation: Auto, Portrait (Vertical), or Landscape (Horizontal)',
      'Margin controls: None, Small (15pt), or Normal (30pt) for printing',
      'Reorder images before generating the PDF document'
    ],
    howToUse: [
      'Upload one or more JPG, PNG, or WebP images.',
      'Drag and drop cards or use arrow buttons to arrange your desired page sequence.',
      'Select your target page size (e.g. A4) and orientation.',
      'Click "Convert to PDF" and download your document.'
    ],
    faqs: [
      {
        question: 'Can I combine multiple JPG photos into a single PDF document?',
        answer: 'Yes! You can select multiple images at once, and each image will be converted into an organized page in your generated PDF.'
      },
      {
        question: 'Which page size should I use for official document submission?',
        answer: 'A4 is the international standard for most university, job, and government application documents.'
      }
    ]
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    slug: 'pdf-to-jpg',
    path: '/tools/pdf-to-jpg',
    category: 'pdf',
    categoryName: 'PDF Tools',
    description: 'Extract and convert PDF pages into high-resolution JPG images directly in your browser. Choose render DPI (Standard, High, Ultra-HD), preview all pages, and download as single images or ZIP archive.',
    shortDescription: 'Convert PDF pages into high-resolution JPG pictures in your browser.',
    iconName: 'Image',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'PDF to JPG Converter Online Free — Extract High Quality Images | NAVIKO',
    metaDescription: 'Convert PDF pages into high-quality JPG images for free. Extract individual pages or download all rendered pages in a single ZIP file. 100% private in-browser tool.',
    relatedToolPaths: ['/tools/jpg-to-pdf', '/tools/pdf-split', '/tools/pdf-merge', '/tools/png-to-jpg'],
    tags: ['pdf to jpg', 'pdf to image', 'convert pdf to jpeg', 'extract pdf pages as images', 'pdf to picture', 'save pdf as jpg'],
    features: [
      'Renders every PDF page to crisp, high-resolution JPG format',
      'Selectable Render Resolution: Standard (150 DPI), High (200 DPI), or Ultra (300 DPI)',
      'Live visual thumbnails of all rendered pages with page number badges',
      'Download individual pages or one-click batch download in a ZIP archive',
      '100% private client-side rendering with PDF.js'
    ],
    howToUse: [
      'Upload your PDF document by clicking or dropping the file.',
      'Select your preferred rendering quality (150 DPI to 300 DPI).',
      'Click "Convert All Pages to JPG".',
      'Download individual JPG pages or click "Download All (ZIP)".'
    ],
    faqs: [
      {
        question: 'Can I extract a specific single page from my PDF?',
        answer: 'Yes! Once converted, every page has its own "Download Page" button so you can save just the pages you need.'
      },
      {
        question: 'How clear will the extracted images be?',
        answer: 'You can choose between 150 DPI (fast and lightweight) up to 300 DPI (print-quality Ultra HD clarity).'
      }
    ]
  },
  {
    id: 'pdf-split',
    name: 'Split PDF Pages',
    slug: 'pdf-split',
    path: '/tools/pdf-split',
    category: 'pdf',
    categoryName: 'PDF Tools',
    description: 'Extract specific pages, page ranges (e.g. 1-3, 5, 8-10), or split all pages into separate PDF files. Fast, secure, and client-side with zero server transmission.',
    shortDescription: 'Extract page ranges or split all pages into separate PDF files.',
    iconName: 'Scissors',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Split PDF Online Free — Extract Pages from PDF | NAVIKO',
    metaDescription: 'Split PDF files online for free. Extract specific page ranges, separate individual pages, or delete unneeded pages from any PDF document safely in your browser.',
    relatedToolPaths: ['/tools/pdf-merge', '/tools/pdf-compressor', '/tools/pdf-to-jpg', '/tools/jpg-to-pdf'],
    tags: ['split pdf', 'extract pdf pages', 'separate pdf', 'cut pdf', 'divide pdf', 'extract pages from pdf', 'pdf splitter'],
    features: [
      'Extract custom page ranges with intuitive syntax (e.g., "1-3, 5, 8-12")',
      'Separate every page into individual single-page PDF files bundled in a ZIP',
      'Interactive visual thumbnail grid with page count indicators',
      '100% private browser-based PDF processing',
      'Instant download with zero file size restrictions'
    ],
    howToUse: [
      'Upload the PDF file you want to split or extract from.',
      'Choose "Custom Range" to extract specific pages (e.g. 1-4, 7) or "Split Every Page".',
      'Click "Split & Extract PDF".',
      'Download your extracted PDF or ZIP archive.'
    ],
    faqs: [
      {
        question: 'How do I specify multiple page ranges?',
        answer: 'You can use commas and hyphens, for example: "1-3, 5, 8-10" will extract pages 1, 2, 3, 5, 8, 9, and 10 into your new PDF.'
      },
      {
        question: 'Are my original PDF files modified or overwritten?',
        answer: 'No. The tool generates a new output document in your browser memory; your original source file remains untouched.'
      }
    ]
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    slug: 'image-cropper',
    path: '/tools/image-cropper',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Crop images with precision aspect ratios (1:1 Square, 16:9 Landscape, 4:3, 3:2, Passport Photo 35x45mm, and Freeform). Rotate, flip, zoom, and download in PNG, JPG, or WebP.',
    shortDescription: 'Crop, rotate, and frame photos with standard aspect ratios and passport presets.',
    iconName: 'Crop',
    popular: true,
    studentHub: false,
    status: 'active',
    seoTitle: 'Image Cropper Online Free — Crop Photos to Exact Aspect Ratio | NAVIKO',
    metaDescription: 'Crop images online for free with exact aspect ratios (1:1, 16:9, 4:3, Passport photo 35x45mm). Rotate, zoom, and export in PNG, JPG, or WebP format.',
    relatedToolPaths: ['/tools/image-resizer', '/tools/image-compressor', '/tools/background-remover', '/tools/jpg-to-png'],
    tags: ['image cropper', 'crop photo', 'crop image online', 'aspect ratio crop', 'passport photo crop', 'square crop', 'photo trimmer'],
    features: [
      'Aspect ratio presets: Freeform, 1:1 Square, 16:9 Banner, 4:3 Standard, 3:2 Photography, and 35×45mm Passport',
      'Interactive draggable crop handles with rule-of-thirds grid alignment overlay',
      'Image transformations: 90° Clockwise Rotation, Horizontal Flip, and Zoom Controls',
      'Export format options: PNG (Lossless), JPG (Optimized), or WebP with quality slider',
      'Displays live output pixel dimensions and estimated file size'
    ],
    howToUse: [
      'Upload a JPG, PNG, or WebP photo.',
      'Select your desired aspect ratio preset (e.g. 1:1 for Instagram or 35x45mm for Passport).',
      'Drag and resize the crop selection box over your subject.',
      'Click "Apply Crop & Download" to save the cropped picture.'
    ],
    faqs: [
      {
        question: 'Can I crop photos for passport and visa applications?',
        answer: 'Yes! Select the "Passport (35×45mm)" ratio preset to frame your head and shoulders according to standard official visa requirements.'
      },
      {
        question: 'Does cropping reduce photo quality?',
        answer: 'Cropping extracts your chosen pixel region directly from the original source image at maximum clarity.'
      }
    ]
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    slug: 'jpg-to-png',
    path: '/tools/jpg-to-png',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Convert JPG and JPEG photos into lossless PNG format with transparent background color replacement options, batch processing, and ZIP download.',
    shortDescription: 'Convert JPG images to lossless PNG format with transparency options.',
    iconName: 'Image',
    popular: true,
    studentHub: false,
    status: 'active',
    seoTitle: 'JPG to PNG Converter Online Free — Convert JPEG to PNG Lossless | NAVIKO',
    metaDescription: 'Convert JPG images to lossless PNG format online for free. Support for batch conversion, optional transparent backdrop replacement, and ZIP download.',
    relatedToolPaths: ['/tools/png-to-jpg', '/tools/image-cropper', '/tools/image-compressor', '/tools/background-remover'],
    tags: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'image converter', 'lossless png', 'photo to png'],
    features: [
      'Batch conversion of multiple JPG images to lossless PNG in seconds',
      'Smart transparency option: key out white backgrounds into transparent alpha channels',
      'Side-by-side preview with original and converted pixel metrics',
      'Download individual PNG files or all at once via ZIP archive',
      '100% private in-browser HTML5 Canvas conversion'
    ],
    howToUse: [
      'Upload one or more JPG images.',
      'Optionally toggle transparent background if converting logos or graphics with white backdrops.',
      'Click "Convert to PNG".',
      'Download individual PNG files or click "Download All (ZIP)".'
    ],
    faqs: [
      {
        question: 'Why convert JPG to PNG?',
        answer: 'PNG uses lossless compression and supports alpha channel transparency, making it ideal for graphics, logos, icons, and text-heavy images.'
      },
      {
        question: 'Can I convert multiple JPGs at the same time?',
        answer: 'Yes! You can drag and drop dozens of photos and download them all with one click in a ZIP archive.'
      }
    ]
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    slug: 'png-to-jpg',
    path: '/tools/png-to-jpg',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Convert heavy PNG images into lightweight, optimized JPG files. Customize background color for transparent areas (White, Black, or Custom Color) and adjust quality.',
    shortDescription: 'Convert PNG images to lightweight JPG photos with background color controls.',
    iconName: 'Image',
    popular: true,
    studentHub: false,
    status: 'active',
    seoTitle: 'PNG to JPG Converter Online Free — Reduce Image Size | NAVIKO',
    metaDescription: 'Convert PNG images to JPG format online for free. Replace transparency with white or custom background color and reduce file size by up to 80%.',
    relatedToolPaths: ['/tools/jpg-to-png', '/tools/image-compressor', '/tools/image-resizer', '/tools/background-remover'],
    tags: ['png to jpg', 'convert png to jpeg', 'png to jpg converter', 'reduce png size', 'png converter', 'image format converter'],
    features: [
      'Convert transparent or opaque PNGs to high-compression JPG format',
      'Custom background color selection (White, Black, Off-White, or Hex Color Picker) for transparent PNGs',
      'Adjustable JPG compression quality slider (50% to 100%)',
      'Calculates file size reduction percentage for each image',
      'Batch conversion with one-click ZIP download'
    ],
    howToUse: [
      'Select or drop your PNG image files.',
      'Choose the background fill color for transparent sections (White is standard).',
      'Adjust compression quality to your preference (default is 92%).',
      'Click "Convert to JPG" and download your converted images.'
    ],
    faqs: [
      {
        question: 'What happens to transparent backgrounds when converted to JPG?',
        answer: 'Because JPG does not support transparency, transparent areas are filled with your chosen background color (e.g. pure white).'
      },
      {
        question: 'How much file size reduction can I expect?',
        answer: 'PNG to JPG conversion frequently reduces file size by 60% to 85%, making pictures load much faster on websites and emails.'
      }
    ]
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    slug: 'background-remover',
    path: '/tools/background-remover',
    category: 'image',
    categoryName: 'Image Tools',
    description: 'Isolate subjects and remove image backgrounds instantly in your browser. Color keying, eyedropper sampling, edge feathering, and solid backdrop replacement with transparent PNG download.',
    shortDescription: 'Remove image backgrounds and isolate subjects 100% in your browser.',
    iconName: 'Scissors',
    popular: true,
    studentHub: false,
    status: 'active',
    seoTitle: 'Background Remover Online Free — Remove Image Backgrounds | NAVIKO',
    metaDescription: 'Remove photo backgrounds online for free. Isolate product photos, signatures, and portraits with edge feathering and instant transparent PNG download.',
    relatedToolPaths: ['/tools/image-cropper', '/tools/jpg-to-png', '/tools/png-to-jpg', '/tools/image-compressor'],
    tags: ['background remover', 'remove background', 'transparent background', 'transparent png', 'cutout photo', 'remove white background', 'bg remover'],
    features: [
      'Client-side color segmentation and edge-detection engine',
      'Interactive Eyedropper tool: sample any background color directly on your image',
      'Tolerance and edge softness sliders for smooth, halo-free subject boundaries',
      'Background replacement modes: Transparent PNG, Pure White, or Solid Color Backdrop',
      '100% private browser processing — zero image uploads to any remote server'
    ],
    howToUse: [
      'Upload your photo, signature, or graphic.',
      'The tool auto-detects the background color, or use the Eyedropper to click any background pixel.',
      'Adjust the Tolerance and Edge Softness sliders until your subject is cleanly isolated.',
      'Click "Download Transparent PNG".'
    ],
    faqs: [
      {
        question: 'Can I remove backgrounds from signatures and scanned logos?',
        answer: 'Yes! Use the eyedropper to click the paper background, adjust tolerance, and download a clean transparent PNG signature for digital documents.'
      },
      {
        question: 'Are my private photos uploaded to a cloud server?',
        answer: 'No. The entire background removal algorithm executes locally in your browser memory using HTML5 Canvas.'
      }
    ]
  },
  {
    id: 'attendance-calculator',
    name: 'Attendance Calculator',
    slug: 'attendance-calculator',
    path: '/tools/attendance-calculator',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Calculate college and school attendance percentage, find out how many classes you MUST attend to reach 75% or 80%, or how many classes you can safely miss (bunk) without falling short.',
    shortDescription: 'Calculate attendance %, safe bunks allowed, and classes needed for 75%.',
    iconName: 'GraduationCap',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Attendance Calculator — Calculate 75% Criteria & Safe Bunks | NAVIKO',
    metaDescription: 'Calculate your college attendance percentage online. Find out how many classes you can safely miss or how many consecutive classes you must attend to reach 75% or 80%.',
    relatedToolPaths: ['/tools/cgpa-calculator', '/tools/study-timetable-generator', '/tools/percentage-calculator', '/tools/random-question-generator'],
    tags: ['attendance calculator', 'college attendance', 'bunk calculator', '75 percent attendance', 'attendance percentage', 'student attendance', 'semester attendance'],
    features: [
      'Instant attendance percentage calculation with live visual progress meter',
      'Safe Bunks Calculator: calculates exact number of classes you can miss while staying above target',
      'Shortage Recovery: calculates consecutive classes required to reach 75%, 80%, or 85%',
      'Subject-Wise Multi-Course Tracker: monitor individual subjects and total aggregate attendance',
      'Quick target preset buttons (65%, 75%, 80%, 85%)'
    ],
    howToUse: [
      'Enter your total classes conducted and classes attended.',
      'Set your target attendance percentage (e.g. 75%).',
      'Read your customized advice (Safe bunks buffer vs Required recovery classes).',
      'Switch to the "Subject-Wise Tracker" tab to calculate attendance across multiple course subjects.'
    ],
    faqs: [
      {
        question: 'How do you calculate how many classes you can safely bunk?',
        answer: 'Formula: Safe Bunks = Floor((Attended Classes - (Target% / 100) × Total Classes) / (Target% / 100)). If positive, you can miss that many classes without dropping below your target.'
      },
      {
        question: 'How do you calculate classes needed to reach 75% attendance?',
        answer: 'Formula: Required Classes = Ceil(((Target% / 100) × Total Classes - Attended Classes) / (1 - (Target% / 100))).'
      }
    ]
  },
  {
    id: 'study-decision-planner',
    name: 'Study Decision Planner',
    slug: 'study-decision-planner',
    path: '/student-tools/study-decision-planner',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Create a realistic, personalized study plan based on your exam date, target score, available hours, subject strengths, chapters, and revision requirements with instant feasibility scoring.',
    shortDescription: 'Create a personalized study plan based on target score, available time, and subjects.',
    iconName: 'Compass',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Study Decision Planner – Create a Personalized Study Plan | NAVIKO',
    metaDescription: 'Create a realistic personalized study plan based on your exam, target score, available time, subjects, chapters, and deadlines. Calculate daily study hours and buffer capacity.',
    relatedToolPaths: [
      '/student-tools/backlog-recovery-planner',
      '/student-tools/can-i-finish-my-syllabus',
      '/student-tools/mock-test-analyzer',
      '/tools/study-timetable-generator',
      '/tools/attendance-calculator'
    ],
    tags: ['study decision planner', 'study plan generator', 'exam study planner', 'neet study plan', 'jee study schedule', 'cbse study plan', 'personalized study schedule', 'study planner'],
    features: [
      'Personalized study capacity math based on exam deadline and daily available hours',
      'Realistic feasibility verdict (Green / Yellow / Red) without false guarantees',
      'Subject prioritization weighted by difficulty and remaining chapters',
      'Daily time allocation and weekly chapter targets across all subjects',
      'Built-in buffer days, mock test schedule, and revision time allocation',
      'One-click plan export, printable view, clipboard copy, and Web Share'
    ],
    howToUse: [
      'Select your exam preset (e.g. NEET, JEE, CBSE, CUET, College Finals) or create a custom exam.',
      'Enter your exam target date, current score baseline, and target score goal.',
      'Adjust your available daily study hours, weekly rest days, and study session length.',
      'Add or modify subjects, remaining chapter counts, and proficiency levels (Strong/Average/Weak).',
      'Review your feasibility status, daily subject breakdown, and copy or download your personalized study plan.'
    ],
    faqs: [
      {
        question: 'How is the feasibility verdict calculated?',
        answer: 'The planner compares your total available study hours (effective study days × daily hours) against the total hours required (core chapter hours adjusted for subject difficulty + 18% revision + 10% mock tests). A capacity ratio ≥ 105% indicates a realistic schedule.'
      },
      {
        question: 'Can I export or print my study plan?',
        answer: 'Yes. You can copy the complete structured plan to your clipboard, save it as a text file to your device, or print it directly with clean formatting.'
      }
    ]
  },
  {
    id: 'backlog-recovery-planner',
    name: 'Backlog Recovery Planner',
    slug: 'backlog-recovery-planner',
    path: '/student-tools/backlog-recovery-planner',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Recover from a large syllabus backlog with a structured step-by-step daily recovery schedule. Calculates difficulty-adjusted workload, revision, tests, and tracks daily progress.',
    shortDescription: 'Recover from large syllabus backlogs with day-by-day schedules and progress tracking.',
    iconName: 'Layers',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Backlog Recovery Planner – Finish Your Syllabus | NAVIKO',
    metaDescription: 'Recover from a large syllabus backlog with a structured step-by-step daily recovery schedule. Calculates workload, subject allocation, revision buffers, and tracks chapter progress.',
    relatedToolPaths: [
      '/student-tools/study-decision-planner',
      '/student-tools/can-i-finish-my-syllabus',
      '/student-tools/mock-test-analyzer',
      '/tools/study-timetable-generator'
    ],
    tags: ['backlog recovery planner', 'syllabus backlog', 'study backlog', 'catch up on syllabus', 'study recovery schedule', 'exam backlog', 'chapter tracker'],
    features: [
      'Difficulty-adjusted workload allocation (Easy / Medium / Hard chapters)',
      'Sequential Day-by-Day recovery schedule with dedicated revision notes and test days',
      'Interactive Chapter Tracker with Not Started / In Progress / Completed states',
      'Live progress percentage and pace velocity indicator (Ahead / On Track / Behind)',
      'Local storage persistence so your marked chapters are saved automatically',
      'Print and copy options for physical study desk tracking'
    ],
    howToUse: [
      'Enter the number of days available for your backlog recovery sprint.',
      'Set your daily available study hours and preferred daily revision time.',
      'Add or organize your subjects and list the specific backlog chapters.',
      'View your generated day-by-day roadmap in the "Day-by-Day Schedule" tab.',
      'Mark chapters as completed in the "Interactive Chapter Tracker" as you study.'
    ],
    faqs: [
      {
        question: 'Does the planner account for chapter difficulty?',
        answer: 'Yes. The algorithm applies weighted time allocations (Hard = 5.0h, Medium = 3.5h, Easy = 2.5h) to ensure difficult conceptual chapters receive proportional focus.'
      },
      {
        question: 'Will my completed chapter progress be saved?',
        answer: 'Yes. Your chapter statuses and subject lists are automatically saved locally in your browser memory so you can return anytime.'
      }
    ]
  },
  {
    id: 'can-i-finish-my-syllabus',
    name: 'Can I Finish My Syllabus?',
    slug: 'can-i-finish-my-syllabus',
    path: '/student-tools/can-i-finish-my-syllabus',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Instant study time calculator to determine if you have enough hours to complete your remaining syllabus before your exam with buffer margin analysis.',
    shortDescription: 'Instant calculator to check if you have enough study time before exams.',
    iconName: 'Clock',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Can I Finish My Syllabus? – Study Time Calculator | NAVIKO',
    metaDescription: 'Instantly calculate if you have enough study hours to complete your remaining syllabus before exams. See your buffer margin, required chapters per day, and pace adjustments.',
    relatedToolPaths: [
      '/student-tools/study-decision-planner',
      '/student-tools/backlog-recovery-planner',
      '/student-tools/mock-test-analyzer',
      '/tools/attendance-calculator'
    ],
    tags: ['can i finish my syllabus', 'study time calculator', 'exam time calculator', 'syllabus completion calculator', 'study hours required', 'study buffer calculator'],
    features: [
      'Instant feasibility verdict (Comfortable / Possible / Unlikely) without fear-based messaging',
      'Accurate buffer margin calculation in extra hours and days',
      'Required daily and weekly chapter completion velocity',
      'What-if scenario modeling (+1h and +2h daily study adjustments)',
      '100% client-side calculation with zero delay'
    ],
    howToUse: [
      'Enter the number of chapters remaining in your syllabus.',
      'Enter the estimated average study hours required per chapter.',
      'Enter the number of days remaining until your exam.',
      'Set your available daily study hours and study days per week.',
      'Check your instant feasibility verdict and practical adjustments.'
    ],
    faqs: [
      {
        question: 'How do you calculate if I can finish my syllabus?',
        answer: 'The tool multiplies remaining chapters by average hours per chapter to calculate Total Hours Required, and multiplies available study days by daily study hours to find Total Hours Available. The difference is your Buffer Margin.'
      },
      {
        question: 'What if the verdict is "Unlikely"?',
        answer: 'An unlikely verdict simply means your current daily study hours create a time deficit. The tool gives practical tips on increasing daily hours or prioritizing high-yield chapters to eliminate the deficit.'
      }
    ]
  },
  {
    id: 'mock-test-analyzer',
    name: 'Mock Test Performance Analyzer',
    slug: 'mock-test-analyzer',
    path: '/student-tools/mock-test-analyzer',
    category: 'student',
    categoryName: 'Student & Study Tools',
    description: 'Track and analyze your mock test scores, accuracy, attempt rate, score trajectory, and subject strengths with clean visual charts and actionable insights.',
    shortDescription: 'Track mock test scores, accuracy %, score trajectory, and weak subject areas.',
    iconName: 'TrendingUp',
    popular: true,
    studentHub: true,
    status: 'active',
    seoTitle: 'Mock Test Performance Analyzer – Track Your Scores | NAVIKO',
    metaDescription: 'Track and analyze your mock test scores, accuracy, attempt rate, score trajectory, and subject strengths with clean charts and actionable study recommendations.',
    relatedToolPaths: [
      '/student-tools/study-decision-planner',
      '/student-tools/backlog-recovery-planner',
      '/student-tools/can-i-finish-my-syllabus',
      '/tools/cgpa-calculator'
    ],
    tags: ['mock test analyzer', 'mock test score tracker', 'test series analysis', 'accuracy calculator', 'neet mock analysis', 'jee test tracker', 'exam performance tracker'],
    features: [
      'Interactive score progression line chart across all attempted mock tests',
      'Accuracy vs Attempt Rate analytics to identify negative marking leaks',
      'Subject-wise strength and weakness ranking',
      'Score trajectory detection (Upward trend / Review required / Steady)',
      'Mistake and error notebook tracking per mock test',
      'Local storage persistence and printable performance summaries'
    ],
    howToUse: [
      'Click "Log New Mock Test" to enter your test score, total marks, and date.',
      'Optionally input correct, incorrect, and unattempted question counts.',
      'Add subject-wise score breakdowns (e.g. Physics, Chemistry, Biology, Math).',
      'View your score progression trajectory on the interactive chart.',
      'Review your strongest and weakest subject areas to guide your next study sprint.'
    ],
    faqs: [
      {
        question: 'How does the analyzer determine score trends?',
        answer: 'It calculates the score delta between consecutive mock tests and compares the latest performance against your historical average to detect upward momentum or score dips.'
      },
      {
        question: 'Why is tracking accuracy important in mock tests?',
        answer: 'In competitive exams with negative marking (like NEET and JEE), incorrect guesses drastically lower your rank. Tracking accuracy helps you focus on cutting negative marks before attempting more questions.'
      }
    ]
  }
];

export const getToolByPath = (path: string): ToolMeta | undefined => {
  const cleanPath = path.split('?')[0].toLowerCase().replace(/\/$/, '') || '/';
  
  // 1. Direct exact path match
  const direct = TOOLS_DATA.find((t) => t.path.toLowerCase() === cleanPath);
  if (direct) return direct;

  // 2. Direct slug or id match
  const directSlug = TOOLS_DATA.find((t) => t.slug.toLowerCase() === cleanPath || t.id.toLowerCase() === cleanPath);
  if (directSlug) return directSlug;

  // 3. Extract last segment (slug) from path prefixes like /tools/..., /student-tools/..., /finance-tools/..., /pdf-tools/..., /image-tools/..., /career-tools/..., /calculators/...
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const matchBySlug = TOOLS_DATA.find((t) => 
      t.slug.toLowerCase() === lastSegment || 
      t.id.toLowerCase() === lastSegment
    );
    if (matchBySlug) return matchBySlug;
  }

  // 4. Check specific legacy/alias paths
  if (cleanPath === '/tools/budget-planner' || cleanPath === '/budget' || cleanPath === '/budget-planner') {
    return TOOLS_DATA.find((t) => t.id === 'budget-calculator');
  }
  if (cleanPath === '/tools/india-debt-clock' || cleanPath === '/debt-clock') {
    return TOOLS_DATA.find((t) => t.id === 'debt-clock');
  }
  if (cleanPath === '/tools/random-study-question-generator') {
    return TOOLS_DATA.find((t) => t.id === 'random-question-generator');
  }

  return undefined;
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
    description: 'Standard number, scientific, percentage, age, discount, and numerical math calculators.',
    icon: 'Calculator',
    path: '/calculators',
    toolsCount: 6
  },
  {
    id: 'student',
    title: 'Student Tools',
    description: 'Study Decision Planner, Backlog Recovery, Syllabus Calculator, Mock Test Analyzer, Attendance, CGPA, and Timetables.',
    icon: 'GraduationCap',
    path: '/student-tools',
    toolsCount: 11
  },
  {
    id: 'pdf',
    title: 'PDF Tools',
    description: 'Merge, split, compress, and convert PDF documents 100% privately in your browser.',
    icon: 'FileSpreadsheet',
    path: '/pdf-tools',
    toolsCount: 5,
    isComingSoon: false
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Crop, resize, compress, convert JPG/PNG, and remove backgrounds with client-side privacy.',
    icon: 'Image',
    path: '/image-tools',
    toolsCount: 6
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
    id: 'other',
    title: 'Other Tools',
    description: 'QR Code generators, Unit converters, and Word counters for daily productivity.',
    icon: 'Sparkles',
    path: '/tools?category=other',
    toolsCount: 3
  }
];
