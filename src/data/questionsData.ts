export interface StudyQuestion {
  id: string;
  subject: 'math' | 'physics' | 'chemistry' | 'biology' | 'coding' | 'history' | 'aptitude' | 'gk';
  subjectName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  hint?: string;
  formulaOrCode?: string;
}

export const STUDY_QUESTIONS: StudyQuestion[] = [
  // MATHEMATICS
  {
    id: 'math-1',
    subject: 'math',
    subjectName: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'easy',
    question: 'What is the derivative of f(x) = x³ - 5x² + 7x - 9 with respect to x?',
    options: ['3x² - 10x + 7', 'x² - 5x + 7', '3x² - 10x', '3x³ - 10x² + 7'],
    correctAnswerIndex: 0,
    explanation: 'Using the power rule d/dx[xⁿ] = n·xⁿ⁻¹: d/dx(x³) = 3x², d/dx(-5x²) = -10x, d/dx(7x) = 7, and d/dx(-9) = 0. Combining these gives 3x² - 10x + 7.',
    hint: 'Apply the power rule d/dx[xⁿ] = n·xⁿ⁻¹ to each individual term.',
    formulaOrCode: 'd/dx[a·xⁿ] = a·n·xⁿ⁻¹'
  },
  {
    id: 'math-2',
    subject: 'math',
    subjectName: 'Mathematics',
    topic: 'Algebra & Matrices',
    difficulty: 'medium',
    question: 'If matrix A is a 2x2 matrix with elements [3, 2; 1, 4], what is its determinant det(A)?',
    options: ['10', '14', '12', '7'],
    correctAnswerIndex: 0,
    explanation: 'For a 2x2 matrix [[a, b], [c, d]], det(A) = ad - bc. Here, a=3, b=2, c=1, d=4. det(A) = (3 × 4) - (2 × 1) = 12 - 2 = 10.',
    hint: 'Subtract the product of the off-diagonal elements from the product of the main diagonal elements.',
    formulaOrCode: 'det([a, b; c, d]) = ad - bc'
  },
  {
    id: 'math-3',
    subject: 'math',
    subjectName: 'Mathematics',
    topic: 'Probability',
    difficulty: 'easy',
    question: 'What is the probability of rolling a sum of 7 with two standard 6-sided dice?',
    options: ['1/6 (6/36)', '1/12 (3/36)', '1/9 (4/36)', '5/36'],
    correctAnswerIndex: 0,
    explanation: 'There are 6 pairs that add to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) out of 36 total outcomes. 6/36 simplifies to 1/6 (≈16.67%).',
    hint: 'List pairs: (1,6), (2,5), (3,4)...'
  },
  {
    id: 'math-4',
    subject: 'math',
    subjectName: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'medium',
    question: 'Which of the following is equivalent to sin(2θ)?',
    options: ['2 sin(θ) cos(θ)', 'sin²(θ) - cos²(θ)', '2 cos²(θ) - 1', 'cos(2θ) / tan(θ)'],
    correctAnswerIndex: 0,
    explanation: 'The double-angle identity for sine states sin(2θ) = 2 sin(θ) cos(θ).',
    formulaOrCode: 'sin(2θ) = 2 sin(θ) cos(θ)'
  },
  {
    id: 'math-5',
    subject: 'math',
    subjectName: 'Mathematics',
    topic: 'Arithmetic Progression',
    difficulty: 'hard',
    question: 'What is the sum of the first 20 terms of the arithmetic progression: 3, 7, 11, 15, ...?',
    options: ['820', '780', '840', '800'],
    correctAnswerIndex: 0,
    explanation: 'First term a = 3, common difference d = 4, n = 20. S_n = n/2 × [2a + (n - 1)d] = 20/2 × [2(3) + (19 × 4)] = 10 × [6 + 76] = 10 × 82 = 820.',
    formulaOrCode: 'S_n = (n/2) × [2a + (n-1)d]'
  },

  // PHYSICS
  {
    id: 'phys-1',
    subject: 'physics',
    subjectName: 'Physics',
    topic: 'Mechanics',
    difficulty: 'easy',
    question: 'An object of mass 5 kg accelerates at 4 m/s². What is the net force acting on the object?',
    options: ['20 N', '9 N', '1.25 N', '40 N'],
    correctAnswerIndex: 0,
    explanation: 'According to Newton’s Second Law: F = m × a. Force = 5 kg × 4 m/s² = 20 Newtons (N).',
    hint: 'Use Newton\'s second law: Force = mass × acceleration.',
    formulaOrCode: 'F = m · a'
  },
  {
    id: 'phys-2',
    subject: 'physics',
    subjectName: 'Physics',
    topic: 'Electromagnetism',
    difficulty: 'medium',
    question: 'If a resistor of 10 Ω has a current of 2 A flowing through it, what is the power dissipated in the resistor?',
    options: ['40 W', '20 W', '5 W', '100 W'],
    correctAnswerIndex: 0,
    explanation: 'Power P = I² × R. Here, I = 2 A and R = 10 Ω. P = (2)² × 10 = 4 × 10 = 40 Watts.',
    formulaOrCode: 'P = I² · R = V · I = V² / R'
  },
  {
    id: 'phys-3',
    subject: 'physics',
    subjectName: 'Physics',
    topic: 'Optics',
    difficulty: 'easy',
    question: 'What phenomenon causes a rainbow to display separate colors when sunlight passes through raindrops?',
    options: ['Dispersion & Total Internal Reflection', 'Diffraction only', 'Polarization only', 'Interference only'],
    correctAnswerIndex: 0,
    explanation: 'Sunlight undergoes refraction, dispersion (splitting into constituent wavelengths due to varying refractive index), and total internal reflection within water droplets.',
    hint: 'Light splits into different colors based on wavelength-dependent refractive indices.'
  },
  {
    id: 'phys-4',
    subject: 'physics',
    subjectName: 'Physics',
    topic: 'Thermodynamics',
    difficulty: 'hard',
    question: 'What is the maximum theoretical efficiency of a Carnot heat engine operating between 600 K (source) and 300 K (sink)?',
    options: ['50%', '33.3%', '66.7%', '75%'],
    correctAnswerIndex: 0,
    explanation: 'Carnot efficiency η = 1 - (T_cold / T_hot) = 1 - (300 / 600) = 1 - 0.5 = 0.50 or 50%.',
    formulaOrCode: 'η = 1 - (T_cold / T_hot)'
  },

  // CHEMISTRY
  {
    id: 'chem-1',
    subject: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids & Bases',
    difficulty: 'easy',
    question: 'A solution has a hydrogen ion concentration [H⁺] of 1 × 10⁻⁴ M. What is its pH?',
    options: ['4.0 (Acidic)', '10.0 (Basic)', '7.0 (Neutral)', '1.4 (Acidic)'],
    correctAnswerIndex: 0,
    explanation: 'pH is defined as -log₁₀[H⁺]. Therefore, pH = -log₁₀(10⁻⁴) = 4.0. Since pH < 7, it is an acidic solution.',
    formulaOrCode: 'pH = -log₁₀[H⁺]'
  },
  {
    id: 'chem-2',
    subject: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry',
    difficulty: 'medium',
    question: 'What is the functional group present in an ester?',
    options: ['-COO- (Carbonyl bonded to oxygen)', '-CHO (Aldehyde)', '-COOH (Carboxylic acid)', '-CONH₂ (Amide)'],
    correctAnswerIndex: 0,
    explanation: 'Esters are characterized by the functional group -COO- (R-CO-O-R\') formed by the condensation reaction between a carboxylic acid and an alcohol.',
    hint: 'Esters are responsible for sweet fruity aromas.'
  },
  {
    id: 'chem-3',
    subject: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Periodic Table',
    difficulty: 'easy',
    question: 'Which of the following elements has the highest electronegativity on the Pauling scale?',
    options: ['Fluorine (F ≈ 3.98)', 'Oxygen (O ≈ 3.44)', 'Chlorine (Cl ≈ 3.16)', 'Nitrogen (N ≈ 3.04)'],
    correctAnswerIndex: 0,
    explanation: 'Fluorine (F) is the most electronegative element in the periodic table with a value of approximately 3.98 on the Pauling scale.',
    hint: 'Top right halogen.'
  },

  // BIOLOGY
  {
    id: 'bio-1',
    subject: 'biology',
    subjectName: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'easy',
    question: 'Which organelle is known as the "powerhouse of the cell" because it generates most of the chemical energy ATP?',
    options: ['Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus', 'Lysosome'],
    correctAnswerIndex: 0,
    explanation: 'Mitochondria generate adenosine triphosphate (ATP) through cellular respiration and oxidative phosphorylation.',
    hint: 'Produces ATP through cellular respiration.'
  },
  {
    id: 'bio-2',
    subject: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics',
    difficulty: 'medium',
    question: 'In DNA, which nitrogenous base pairs with Adenine (A) via two hydrogen bonds?',
    options: ['Thymine (T)', 'Cytosine (C)', 'Guanine (G)', 'Uracil (U)'],
    correctAnswerIndex: 0,
    explanation: 'According to Chargaff’s rules and the Watson-Crick model, Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds in DNA (Uracil replaces Thymine in RNA).',
    formulaOrCode: 'A = T (2 H-bonds) | G ≡ C (3 H-bonds)'
  },
  {
    id: 'bio-3',
    subject: 'biology',
    subjectName: 'Biology',
    topic: 'Human Physiology',
    difficulty: 'medium',
    question: 'Which hormone, produced by the beta cells of the islets of Langerhans in the pancreas, lowers blood glucose levels?',
    options: ['Insulin', 'Glucagon', 'Thyroxine', 'Cortisol'],
    correctAnswerIndex: 0,
    explanation: 'Insulin facilitates cellular uptake of glucose from the bloodstream into liver, fat, and skeletal muscle cells, lowering blood glucose concentration.',
    hint: 'Produced by beta cells in the pancreas.'
  },

  // CODING & COMPUTER SCIENCE
  {
    id: 'code-1',
    subject: 'coding',
    subjectName: 'Computer Science',
    topic: 'Algorithms & Complexity',
    difficulty: 'easy',
    question: 'What is the average and worst-case time complexity of searching an element in a balanced Binary Search Tree (BST) of n elements?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correctAnswerIndex: 0,
    explanation: 'In a balanced BST (like AVL or Red-Black Tree), the tree height is log₂(n), allowing search, insertion, and deletion operations to complete in O(log n) time.',
    formulaOrCode: 'Time Complexity: O(log n)'
  },
  {
    id: 'code-2',
    subject: 'coding',
    subjectName: 'Computer Science',
    topic: 'Data Structures',
    difficulty: 'easy',
    question: 'Which data structure operates on the Last-In, First-Out (LIFO) principle?',
    options: ['Stack', 'Queue', 'Array', 'Linked List'],
    correctAnswerIndex: 0,
    explanation: 'A Stack follows LIFO (Last-In, First-Out) where the last element inserted is the first one popped. A Queue follows FIFO (First-In, First-Out).',
    hint: 'Think of a stack of plates or the browser undo stack.'
  },
  {
    id: 'code-3',
    subject: 'coding',
    subjectName: 'Computer Science',
    topic: 'JavaScript / Web Tech',
    difficulty: 'medium',
    question: 'What will `typeof NaN` return in JavaScript?',
    options: ['"number"', '"undefined"', '"NaN"', '"object"'],
    correctAnswerIndex: 0,
    explanation: 'In JavaScript (IEEE 754 floating-point standard), NaN stands for "Not-a-Number", but its data type is officially numeric (`"number"`).',
    formulaOrCode: 'typeof NaN === "number"'
  },
  {
    id: 'code-4',
    subject: 'coding',
    subjectName: 'Computer Science',
    topic: 'Databases & SQL',
    difficulty: 'medium',
    question: 'Which SQL clause is used to filter group results created by the `GROUP BY` clause?',
    options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
    correctAnswerIndex: 0,
    explanation: 'WHERE filters rows before aggregation, whereas HAVING filters groups after aggregation with aggregate functions (COUNT, SUM, AVG).',
    formulaOrCode: 'SELECT dept, AVG(salary) FROM emp GROUP BY dept HAVING AVG(salary) > 50000;'
  },

  // REASONING & APTITUDE
  {
    id: 'apt-1',
    subject: 'aptitude',
    subjectName: 'Aptitude & Logic',
    topic: 'Number Series',
    difficulty: 'easy',
    question: 'What is the next number in the sequence: 2, 6, 12, 20, 30, 42, ___?',
    options: ['56', '54', '52', '60'],
    correctAnswerIndex: 0,
    explanation: 'The differences between consecutive terms are increasing consecutive even numbers: +4, +6, +8, +10, +12, so the next difference is +14. 42 + 14 = 56. (Alternatively, n² + n for n=1,2,3,4,5,6,7 -> 7² + 7 = 56).',
    hint: 'Look at the differences: +4, +6, +8, +10, +12...'
  },
  {
    id: 'apt-2',
    subject: 'aptitude',
    subjectName: 'Aptitude & Logic',
    topic: 'Time and Work',
    difficulty: 'medium',
    question: 'A can finish a task in 12 days, and B can finish it in 24 days. Working together, in how many days will they finish the task?',
    options: ['8 days', '6 days', '9 days', '10 days'],
    correctAnswerIndex: 0,
    explanation: '1-day work of A = 1/12. 1-day work of B = 1/24. Combined 1-day work = (2 + 1)/24 = 3/24 = 1/8. Therefore, together they take 8 days.',
    formulaOrCode: 'Total Days = (A × B) / (A + B) = (12 × 24) / (12 + 24) = 288 / 36 = 8'
  },
  {
    id: 'apt-3',
    subject: 'aptitude',
    subjectName: 'Aptitude & Logic',
    topic: 'Profit & Loss',
    difficulty: 'medium',
    question: 'An item is bought for ₹500 and sold for ₹650. What is the profit percentage?',
    options: ['30%', '25%', '35%', '23.07%'],
    correctAnswerIndex: 0,
    explanation: 'Profit = Selling Price - Cost Price = 650 - 500 = ₹150. Profit % = (Profit / Cost Price) × 100 = (150 / 500) × 100 = 30%.',
    formulaOrCode: 'Profit % = [(SP - CP) / CP] × 100'
  },

  // HISTORY & GENERAL KNOWLEDGE
  {
    id: 'gk-1',
    subject: 'gk',
    subjectName: 'General Knowledge',
    topic: 'Space & Astronomy',
    difficulty: 'easy',
    question: 'Which planet in our Solar System has the shortest day (fastest rotation period on its axis)?',
    options: ['Jupiter (approx. 9.9 hours)', 'Mercury', 'Earth', 'Saturn'],
    correctAnswerIndex: 0,
    explanation: 'Jupiter is the fastest-spinning planet in our solar system, completing one full rotation on its axis in just under 10 hours (approx. 9 hours and 55 minutes).',
    hint: 'The largest gas giant.'
  },
  {
    id: 'hist-1',
    subject: 'history',
    subjectName: 'History & Civics',
    topic: 'Indian Constitution',
    difficulty: 'easy',
    question: 'Who served as the Chairman of the Drafting Committee of the Constituent Assembly of India?',
    options: ['Dr. B. R. Ambedkar', 'Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
    correctAnswerIndex: 0,
    explanation: 'Dr. Bhimrao Ramji Ambedkar was appointed Chairman of the Drafting Committee on August 29, 1947, and is recognized as the chief architect of the Constitution of India.',
    hint: 'Chief architect of the Indian Constitution.'
  }
];

export const SUBJECT_OPTIONS = [
  { id: 'all', name: 'All Subjects', icon: 'Sparkles', color: 'indigo' },
  { id: 'math', name: 'Mathematics', icon: 'Calculator', color: 'blue' },
  { id: 'physics', name: 'Physics', icon: 'Zap', color: 'amber' },
  { id: 'chemistry', name: 'Chemistry', icon: 'FlaskConical', color: 'emerald' },
  { id: 'biology', name: 'Biology', icon: 'Heart', color: 'rose' },
  { id: 'coding', name: 'Computer Science', icon: 'Code', color: 'teal' },
  { id: 'aptitude', name: 'Aptitude & Logic', icon: 'Target', color: 'purple' },
  { id: 'history', name: 'History & Civics', icon: 'BookOpen', color: 'orange' },
  { id: 'gk', name: 'General Knowledge', icon: 'Globe', color: 'cyan' },
];
