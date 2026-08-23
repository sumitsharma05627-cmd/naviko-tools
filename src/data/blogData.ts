import { BlogPost } from '../types';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-calculate-percentage',
    title: 'How to Calculate Percentage: Complete Formulas & Real-World Examples',
    description: 'Learn how to calculate percentages, percentage increases, percentage discounts, and exam score conversions with straightforward formulas and step-by-step examples.',
    readTime: '4 min read',
    category: 'Mathematics & Study',
    publishedDate: 'August 2026',
    content: [
      {
        heading: 'What is a Percentage?',
        body: [
          'A percentage represents a number or ratio expressed as a fraction of 100. The word originates from the Latin per centum, meaning "by the hundred". It is symbolized by the "%" sign.',
          'Percentages are fundamental in daily life—from calculating retail discounts and sales tax to analyzing financial returns and university examination results.'
        ]
      },
      {
        heading: 'The Basic Percentage Formula',
        body: [
          'To calculate what percentage a number X is of another number Y, divide X by Y and multiply the result by 100.',
          'For example, if you scored 45 marks out of 50 in an exam, the percentage is (45 ÷ 50) × 100 = 90%.'
        ],
        formula: 'Percentage (%) = (Part / Whole) × 100'
      },
      {
        heading: 'How to Calculate Percentage Increase and Decrease',
        body: [
          'When comparing a past value to a new value, the percentage change formula tells you the exact rate of growth or reduction.',
          'Step 1: Find the absolute difference (New Value - Original Value).',
          'Step 2: Divide the difference by the original value.',
          'Step 3: Multiply by 100 to obtain the percentage.'
        ],
        formula: 'Percentage Change = ((New Value - Original Value) / Original Value) × 100',
        tips: [
          'A positive result indicates a percentage increase (e.g. salary hike or inflation).',
          'A negative result indicates a percentage decrease or discount.',
          'Use the NAVIKO Percentage Calculator tool for instant, error-free results.'
        ]
      }
    ]
  },
  {
    slug: 'how-to-calculate-cgpa',
    title: 'How to Calculate CGPA and Convert It to Percentage (CBSE & University Rules)',
    description: 'A clear guide explaining how Cumulative Grade Point Average (CGPA) and Semester GPA (SGPA) are calculated, with official CBSE 9.5 multiplier rules.',
    readTime: '5 min read',
    category: 'Student Guide',
    publishedDate: 'August 2026',
    content: [
      {
        heading: 'Understanding CGPA vs SGPA',
        body: [
          'SGPA (Semester Grade Point Average) evaluates your academic performance in one specific semester by weighting each subject\'s grade points by its course credits.',
          'CGPA (Cumulative Grade Point Average) represents the overall weighted average across all semesters completed in your academic program.'
        ]
      },
      {
        heading: 'Formula for Semester Grade Point Average (SGPA)',
        body: [
          'SGPA is computed by summing the product of course credits (Ci) and grade points scored (Gi) for each subject, and dividing by the total semester credits.',
          'For instance, if you have a 4-credit course with an A grade (9 points) and a 3-credit course with a B grade (8 points), your total weighted points are (4×9) + (3×8) = 60, divided by (4+3)=7 credits = 8.57 SGPA.'
        ],
        formula: 'SGPA = Σ(Credit × Grade Point) / Σ(Total Credits)'
      },
      {
        heading: 'Why Multiply CGPA by 9.5 for Percentage?',
        body: [
          'The Central Board of Secondary Education (CBSE) and many universities in India determined the 9.5 multiplier by analyzing the score distribution of top-ranking students.',
          'Because the maximum 10 CGPA historically corresponded to roughly a 95% average rather than 100%, multiplying by 9.5 provides a realistic percentage equivalence for admissions and job applications.'
        ],
        formula: 'Equivalent Percentage (%) = CGPA × 9.5',
        tips: [
          'Always verify if your specific college or university uses a 10x multiplier or 9.5x standard.',
          'Use the NAVIKO CGPA Calculator to configure custom credit weights and instant conversion scales.'
        ]
      }
    ]
  },
  {
    slug: 'how-to-improve-typing-speed',
    title: 'How to Improve Your Typing Speed: Proven Techniques for 80+ WPM',
    description: 'Actionable touch-typing strategies, finger positioning guidelines, and ergonomic practices to boost your words-per-minute speed and accuracy.',
    readTime: '4 min read',
    category: 'Career & Skills',
    publishedDate: 'August 2026',
    content: [
      {
        heading: 'Mastering the Home Row Position',
        body: [
          'Touch typing relies on muscle memory rather than visual hunting and pecking. The foundation begins at the home row: fingers of the left hand rest on A-S-D-F, and the right hand rests on J-K-L-;',
          'Notice the small tactile bumps on the "F" and "J" keys on every standard keyboard—they allow you to reposition your index fingers accurately without glancing down.'
        ]
      },
      {
        heading: 'Accuracy Before Speed',
        body: [
          'The most common obstacle in learning to type quickly is rushing. Every typo requires pressing backspace, which disrupts your typing rhythm and drastically lowers your Net WPM.',
          'Focus on maintaining 95%+ accuracy first. Once your fingers reliably hit the correct keys without hesitation, speed naturally increases exponentially.'
        ],
        tips: [
          'Maintain relaxed wrists and sit with an upright posture.',
          'Do not look down at the keyboard; trust your spatial muscle memory.',
          'Practice 10 to 15 minutes daily using the NAVIKO Typing Speed Test to track measurable progress.'
        ]
      }
    ]
  },
  {
    slug: 'how-to-create-a-good-resume',
    title: 'How to Create an ATS-Friendly Resume that Lands Interviews',
    description: 'Essential guidelines for formatting, keyword optimization, and action-verb phrasing to pass Applicant Tracking Systems (ATS) and impress recruiters.',
    readTime: '6 min read',
    category: 'Career Advice',
    publishedDate: 'August 2026',
    content: [
      {
        heading: 'What is an Applicant Tracking System (ATS)?',
        body: [
          'An Applicant Tracking System (ATS) is software used by recruiters and HR teams to filter, scan, and rank incoming resumes before a human recruiter reviews them.',
          'Complex visual graphics, nested tables, non-standard fonts, and embedded images frequently cause ATS parsers to fail. Clean semantic text layouts are essential for high match scores.'
        ]
      },
      {
        heading: 'Structuring Your Resume Sections',
        body: [
          '1. Header: Full Name, Clean Email, Phone Number, City/Country, LinkedIn URL.',
          '2. Professional Summary: 2–3 sentences highlighting your core competencies, domain experience, and key accomplishments.',
          '3. Core Skills: Categorized into Technical Skills, Tools/Frameworks, and Soft Skills.',
          '4. Professional Experience: Reverse chronological order with bullet points starting with strong action verbs (e.g. Engineered, Spearheaded, Accelerated).',
          '5. Education & Certifications: Degrees, institution names, graduation years, and relevant credentials.'
        ],
        tips: [
          'Quantify your achievements with numbers (e.g., "Increased page load performance by 40%").',
          'Keep your resume to 1 page for early-career professionals, or 2 pages for senior roles.',
          'Use the free NAVIKO Resume Builder to generate a clean, ATS-optimized PDF instantly.'
        ]
      }
    ]
  }
];
