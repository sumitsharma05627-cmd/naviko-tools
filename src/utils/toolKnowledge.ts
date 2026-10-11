import { ToolMeta } from '../types';

export interface StructuredToolExplanation {
  whatItIs: string;
  whatItDoes: string;
  whoItIsFor: string[];
  howItWorks: string;
  resultsMeaning: string;
  limitations: string[];
  healthDisclaimer?: string;
  examples?: { title: string; explanation: string; value?: string }[];
}

/**
 * Returns structured, factual, authentic, non-boilerplate content for all tools
 */
export const getStructuredToolExplanation = (tool: ToolMeta): StructuredToolExplanation => {
  // If explicitly customized on tool object
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
      examples: tool.examples
    };
  }

  // Specialized, high-value explanations by exact tool ID
  switch (tool.id) {
    // ----------------------------------------------------
    // CALCULATORS & MATHEMATICS
    // ----------------------------------------------------
    case 'percentage-calculator':
      return {
        whatItIs:
          'The NAVIKO Percentage Calculator is a multi-mode arithmetic utility designed to evaluate proportional values, percentage difference, percent increase, and percentage decrease.',
        whatItDoes:
          'It computes four core mathematical relationships: finding X% of Y, determining what percentage X is of Y, calculating percentage increase (growth/markup), and calculating percentage decrease (discounts/reductions).',
        whoItIsFor: [
          'Students calculating exam marks and academic score distributions',
          'Shoppers and retail consumers verifying clearance discounts and sales tax',
          'Business owners and accountants analyzing profit margins and revenue growth',
          'Investors tracking portfolio percentage variations'
        ],
        howItWorks:
          'Calculations use standard algebraic formulas: X% of Y = (X ÷ 100) × Y. Percentage Share = (X ÷ Y) × 100. Percentage Change from Value A to Value B = ((B − A) ÷ |A|) × 100. Decimal fractions are formatted with exact two-place precision.',
        resultsMeaning:
          'A positive change value indicates percentage growth or markup; a negative change value indicates reduction or discount. The step-by-step breakdown displays the exact fractional equivalent used in the computation.',
        limitations: [
          'Division by zero is mathematically undefined: computing a percentage change from a starting baseline of 0 cannot produce a finite percentage.',
          'Extreme numbers exceeding standard IEEE 754 double precision limits may experience rounding approximations.'
        ],
        examples: [
          {
            title: 'Calculating Sales Tax / GST',
            explanation: 'Finding 18% tax on a $250 purchase: (18 ÷ 100) × 250 = $45.00 tax outlay.',
            value: '$250 + $45.00 = $295.00 Total'
          },
          {
            title: 'Exam Score Percentage',
            explanation: 'Obtaining 485 marks out of 600 maximum marks: (485 ÷ 600) × 100 = 80.83%.',
            value: '485 / 600 = 80.83%'
          },
          {
            title: 'Salary Increment Calculation',
            explanation: 'A compensation raise from $50,000 to $57,500: ((57,500 − 50,000) ÷ 50,000) × 100 = +15.00%.',
            value: 'Growth: +15.00%'
          }
        ]
      };

    case 'age-calculator':
      return {
        whatItIs:
          'The NAVIKO Age Calculator is a chronological date-interval calculator that computes exact elapsed age between a birth date and any reference date down to years, months, days, hours, and minutes.',
        whatItDoes:
          'It evaluates completed years, calendar months, and remaining days, total lifetime days elapsed, total hours, and a live countdown to your upcoming birthday with the day of the week.',
        whoItIsFor: [
          'Candidates verifying age eligibility criteria for civil service, banking, or defense examinations',
          'Parents tracking infant developmental milestone months',
          'Human resource administrators verifying employee retirement or service duration',
          'Anyone tracking personal milestones and birthday countdowns'
        ],
        howItWorks:
          'Calculations account for the varying calendar lengths of Gregorian months (28, 29, 30, and 31 days) and leap-year rules (divisible by 4, except centuries not divisible by 400). It does not use static 365.25 day approximations.',
        resultsMeaning:
          'Outputs your official statutory chronological age as recognized by government departments, passport authorities, and academic examination boards.',
        limitations: [
          'Follows the Gregorian calendar convention. Historical dates prior to Gregorian calendar adoption (October 1582) use the proleptic Gregorian calendar.',
          'Does not account for daylight saving time hour shifts in specific local jurisdictions.'
        ],
        examples: [
          {
            title: 'Official Statutory Age Verification',
            explanation: 'A candidate born on August 15, 2000 calculating age as of October 1, 2026.',
            value: '26 Years, 1 Month, 16 Days'
          },
          {
            title: 'Total Lifetime Days Elapsed',
            explanation: 'Exact cumulative day count without rounding approximations.',
            value: '9,543 Total Days'
          }
        ]
      };

    case 'number-calculator':
      return {
        whatItIs:
          'The NAVIKO Number Calculator is an arithmetic desktop calculator featuring full keyboard input, four-register memory storage (MC, MR, M+, M-), an undoable calculation tape history, and numbers-to-words spelling.',
        whatItDoes:
          'It executes addition, subtraction, multiplication, division, percentage, and polarity negation, maintaining an interactive tape history of recent calculations and converting numeric outputs into plain English words.',
        whoItIsFor: [
          'Accountants and bookkeepers checking invoices and balancing ledgers',
          'Students solving straightforward homework problems with keyboard ergonomics',
          'Professionals writing cheques requiring exact numbers spelled in words'
        ],
        howItWorks:
          'Implements a state machine adhering to standard algebraic operator precedence. The memory register functions accumulate running sums directly in client-side memory without external API dependencies.',
        resultsMeaning:
          'Results represent immediate arithmetic evaluations. The number-in-words feature translates digits into both Indian (Lakhs/Crores) and Western (Millions/Billions) conventions.',
        limitations: [
          'Standard display limits calculations to 16 significant digits to avoid floating-point binary conversion inaccuracies.',
          'Division by zero returns Error.'
        ],
        examples: [
          {
            title: 'Balancing Household Outlays',
            explanation: 'Summing multiple receipt items: $1,450 + $320 + $2,180 = $3,950.',
            value: 'Spelled: "Three Thousand Nine Hundred Fifty"'
          }
        ]
      };

    case 'scientific-calculator':
      return {
        whatItIs:
          'The NAVIKO Scientific Calculator is an advanced engineering and mathematical computing tool supporting trigonometry, logarithms, powers, factorials, and fundamental mathematical constants.',
        whatItDoes:
          'It calculates trigonometric functions (sin, cos, tan), inverses (arcsin, arccos, arctan), hyperbolic functions (sinh, cosh, tanh), natural logarithms (ln), base-10 logarithms (log), roots, factorials (n!), and constants (π, e, φ).',
        whoItIsFor: [
          'Engineering and physical science university students',
          'High school STEM students preparing for advanced mathematics examinations',
          'Software developers calculating logarithmic complexities and geometric transformations'
        ],
        howItWorks:
          'Trigonometric functions support dynamic switching between Degree (DEG) and Radian (RAD) modes via the relationship: radians = degrees × (π / 180). Factorial evaluations use high-precision recurrence.',
        resultsMeaning:
          'Displays high-precision floating-point outputs formatted up to 12 decimal places with automatic scientific exponential notation for values exceeding display widths.',
        limitations: [
          'tan(90°) and tan(270°) evaluate to undefined / infinity as asymptotes.',
          'Factorials for integers n > 170 exceed 64-bit IEEE double-precision limits and return overflow.'
        ],
        examples: [
          {
            title: 'Trigonometric Wave Evaluation',
            explanation: 'Calculating the sine of 45 degrees in DEG mode: sin(45°) = 0.70710678.',
            value: 'sin(45°) = 0.707107'
          },
          {
            title: 'Acoustic / Signal Decibel Logarithm',
            explanation: 'Evaluating sound intensity power: 10 × log10(1,000) = 30 dB.',
            value: '10 × log10(1000) = 30'
          }
        ]
      };

    case 'discount-calculator':
      return {
        whatItIs:
          'The NAVIKO Discount Calculator is a retail pricing utility that computes sale savings, final payable prices, and stacked promotional discounts.',
        whatItDoes:
          'It calculates net price after a single percentage discount, handles stacked multi-tier promotions (e.g., 20% off plus an extra 10% coupon), and computes final price including sales tax.',
        whoItIsFor: [
          'Shoppers calculating true out-of-pocket prices during clearance sales',
          'Retail merchants configuring seasonal promotional tags',
          'Consumers auditing checkout receipts against shelf markdowns'
        ],
        howItWorks:
          'Single discount: Savings = Original Price × (Discount % ÷ 100). Final Price = Original Price − Savings. When stacking discounts, secondary coupons apply to the already discounted price, not the initial gross price.',
        resultsMeaning:
          'Reveals the genuine effective discount. For example, a 20% discount followed by an additional 10% coupon equals a 28% overall net reduction, rather than 30%.',
        limitations: [
          'Does not account for store-specific minimum purchase spend caps or category brand exclusions.'
        ],
        examples: [
          {
            title: 'Single Clearance Markdown',
            explanation: 'A $120 winter jacket discounted by 35%: Savings = $42.00.',
            value: 'Payable: $78.00 (Saved: $42.00)'
          },
          {
            title: 'Stacked Coupon Promotion',
            explanation: 'A $200 appliance with 20% store markdown plus 10% member coupon: $200 − $40 = $160; $160 − $16 = $144.',
            value: 'Payable: $144.00 (Effective discount: 28%)'
          }
        ]
      };

    case 'cgpa-calculator':
      return {
        whatItIs:
          'The NAVIKO CGPA to Percentage Calculator is an academic grading conversion tool conforming to CBSE and Indian university standards.',
        whatItDoes:
          'It converts Cumulative Grade Point Average (CGPA) on a 10-point scale into equivalent percentage marks, and provides reverse conversion from percentage to CGPA.',
        whoItIsFor: [
          'High school students (CBSE Class 10 & 12) filling national competitive exam forms',
          'Undergraduate and postgraduate students applying for job drives, civil services, and foreign university admissions'
        ],
        howItWorks:
          'Applies the official CBSE conversion factor: Percentage = CGPA × 9.5. For customized university grading scales, allows modifying the conversion multiplier.',
        resultsMeaning:
          'Provides the recognized aggregate percentage figure required on government examination applications and corporate eligibility forms.',
        limitations: [
          'Certain autonomous universities use credit-weighted formulas (SGPA weighted by semester credit hours) rather than the standard 9.5 factor. Check your university mark sheet reverse guidelines.'
        ],
        examples: [
          {
            title: 'CBSE 10-Point Scale Conversion',
            explanation: 'Converting an 8.6 CGPA to percentage using the 9.5 multiplier: 8.6 × 9.5 = 81.70%.',
            value: '8.6 CGPA = 81.70%'
          }
        ]
      };

    // ----------------------------------------------------
    // FINANCE & WEALTH SUITE
    // ----------------------------------------------------
    case 'sip-calculator':
      return {
        whatItIs:
          'The NAVIKO SIP Calculator is an investment forecasting utility that calculates the expected maturity value and capital gains from recurring monthly investments in mutual funds or systematic investment plans.',
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
        ],
        examples: [
          {
            title: 'Long-Term 15-Year Wealth Creation',
            explanation: 'Investing ₹5,000 monthly for 15 years at an expected 12% annualized return: Total deposit ₹9,00,000.',
            value: 'Maturity: ₹25,22,880 (Gains: ₹16,22,880)'
          }
        ]
      };

    case 'lump-sum-calculator':
      return {
        whatItIs:
          'The NAVIKO Lump Sum Investment Calculator projects the compounding growth of a one-time capital investment over multi-year horizons.',
        whatItDoes:
          'It calculates future maturity value, total return on investment (ROI), wealth multiple, and inflation-adjusted future purchasing power.',
        whoItIsFor: [
          'Investors deploying surplus annual bonuses, gratuity, or inheritance capital',
          'Savers comparing mutual fund equity lump sums against bank fixed deposits',
          'Long-term retirement planners evaluating single-deposit asset allocations'
        ],
        howItWorks:
          'Applies the compound growth formula: A = P × (1 + r)^t, where P is the initial principal, r is the annual expected return rate expressed as a decimal, and t is tenure in years.',
        resultsMeaning:
          'Distinguishes between your original initial principal and accumulated capital appreciation, demonstrating the geometric effect of long-term compounding.',
        limitations: [
          'Assumes constant compound growth; does not capture real-world market drawdowns or sequence-of-returns risk.'
        ],
        examples: [
          {
            title: '10-Year Lump Sum Compounding',
            explanation: 'Investing ₹1,00,000 upfront at an expected 12% annual return for 10 years: 100000 × (1.12)^10.',
            value: 'Maturity: ₹3,10,585 (3.1x initial capital)'
          }
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
        ],
        examples: [
          {
            title: 'Home Loan 20-Year Amortization',
            explanation: 'A ₹30,00,000 home loan at 8.5% per annum for 20 years (240 months).',
            value: 'Monthly EMI: ₹26,035 (Total Interest: ₹32,48,318)'
          }
        ]
      };

    case 'loan-calculator':
      return {
        whatItIs:
          'The NAVIKO Comprehensive Loan Calculator estimates monthly installment obligations, finance charges, and amortization balances across personal, auto, and commercial loans.',
        whatItDoes:
          'It calculates fixed monthly debt payments, total interest paid over the life of the loan, and visually contrasts principal repayment vs lender interest costs.',
        whoItIsFor: [
          'Auto loan applicants comparing 3-year vs 5-year financing terms',
          'Small business owners evaluating working capital borrowing costs',
          'Individuals consolidating credit card balances into fixed-rate personal loans'
        ],
        howItWorks:
          'Applies reducing-balance loan amortization schedules: calculates periodic interest based on remaining unpaid principal balance after each payment.',
        resultsMeaning:
          'Highlights the true finance charge of borrowing and shows how extending loan duration lowers monthly EMI but significantly increases total interest paid.',
        limitations: [
          'Excludes one-time origination charges, prepayment penalties, and state stamp duties.'
        ],
        examples: [
          {
            title: 'Personal Loan Financing',
            explanation: '$10,000 borrowed at 10.5% annual interest for 3 years (36 months).',
            value: 'Monthly: $325.02 (Total Interest: $1,700.86)'
          }
        ]
      };

    case 'simple-interest-calculator':
      return {
        whatItIs:
          'The NAVIKO Simple Interest Calculator is a non-compounding interest calculator for short-term loans, promissory notes, and fixed rate credit contracts.',
        whatItDoes:
          'It calculates total interest earned or owed, final maturity sum, and annual yield using principal, interest rate, and duration in days, months, or years.',
        whoItIsFor: [
          'Students studying elementary commercial arithmetic and banking principles',
          'Small business proprietors issuing informal vendor credit notes',
          'Borrowers evaluating non-compounding promissory loans'
        ],
        howItWorks:
          'Formula: SI = (P × R × T) ÷ 100, where P is principal amount, R is annual interest rate percentage, and T is time duration in years. Final amount = P + SI.',
        resultsMeaning:
          'Unlike compound interest, the annual interest charge remains identical every single year because interest is never added back to the principal base.',
        limitations: [
          'Does not represent compound commercial bank savings accounts, fixed deposits, or mutual fund investments.'
        ],
        examples: [
          {
            title: 'Short-Term Commercial Note',
            explanation: '$5,000 loaned at 6% simple interest for 2.5 years: (5,000 × 6 × 2.5) ÷ 100.',
            value: 'Interest: $750.00 (Total: $5,750.00)'
          }
        ]
      };

    case 'compound-interest-calculator':
      return {
        whatItIs:
          'The NAVIKO Compound Interest Calculator evaluates the growth of invested capital across multiple compounding frequencies including annual, semi-annual, quarterly, monthly, and daily.',
        whatItDoes:
          'It calculates final maturity value, total compound interest accrued, effective annual percentage yield (APY/EAR), and provides year-by-year balance tables.',
        whoItIsFor: [
          'Savers comparing bank certificates of deposit (CDs) and savings yields',
          'Investors analyzing compounding asset appreciation over multi-decade horizons',
          'Educators demonstrating the exponential growth of reinvested earnings'
        ],
        howItWorks:
          'Formula: A = P × (1 + r/n)^(n × t), where P is principal, r is nominal annual interest rate (decimal), n is compounding events per year, and t is time in years. Effective Annual Rate: EAR = (1 + r/n)^n − 1.',
        resultsMeaning:
          'Demonstrates how higher compounding frequencies generate slightly higher yields because earned interest begins accumulating interest earlier.',
        limitations: [
          'Does not automatically deduct annual income tax or TDS on interest earnings.'
        ],
        examples: [
          {
            title: 'Quarterly Compounded Certificate',
            explanation: '$10,000 invested at 7% compounded quarterly for 5 years: n = 4, t = 5.',
            value: 'Maturity: $14,147.78 (Interest: $4,147.78)'
          }
        ]
      };

    case 'gst-calculator':
      return {
        whatItIs:
          'The NAVIKO GST Calculator is an Indian Goods and Services Tax computation utility supporting standard slab rates (5%, 12%, 18%, 28%) and custom tax rates.',
        whatItDoes:
          'It calculates GST Exclusive amounts (adding tax to base prices) and GST Inclusive amounts (extracting tax from retail totals), breaking output down into Central GST (CGST) and State GST (SGST).',
        whoItIsFor: [
          'Freelancers and business owners generating compliant tax invoices',
          'Retailers checking net supplier costs and consumer tax breakdowns',
          'Shoppers verifying retail bill tax charges'
        ],
        howItWorks:
          'Adding GST: GST = (Base × Rate) ÷ 100; Total = Base + GST. Removing GST: Base = (Gross × 100) ÷ (100 + Rate); GST = Gross − Base. For intra-state transactions, CGST and SGST each receive exactly 50% of total GST.',
        resultsMeaning:
          'Separates net product cost from statutory tax remittances, ensuring accurate accounting ledgers and tax filing reconciliation.',
        limitations: [
          'Does not calculate specialized compensation cess or inverted duty tariff structures.'
        ],
        examples: [
          {
            title: 'Adding 18% GST to Service Invoice',
            explanation: 'Consulting service fee of ₹10,000: GST = ₹1,800 (CGST ₹900 + SGST ₹900).',
            value: 'Gross Payable: ₹11,800.00'
          },
          {
            title: 'Extracting 12% GST from Retail Price',
            explanation: 'A product bought for ₹1,120 inclusive of 12% GST: Base = (1,120 × 100) ÷ 112 = ₹1,000.',
            value: 'Base: ₹1,000.00 (GST: ₹120.00)'
          }
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
        ],
        examples: [
          {
            title: '₹12,00,000 CTC Take-Home Estimate',
            explanation: 'Under the New Tax Regime with ₹75,000 standard deduction and statutory EPF.',
            value: 'Est. In-Hand: ~₹84,000 - ₹87,000 / month'
          }
        ]
      };

    case 'cagr-calculator':
      return {
        whatItIs:
          'The NAVIKO CAGR Calculator computes the Compound Annual Growth Rate of an investment, business revenue, or asset over multi-year periods.',
        whatItDoes:
          'It calculates the constant annual geometric progression rate that connects an initial starting value to an ending value over a specified number of years.',
        whoItIsFor: [
          'Equity investors evaluating multi-year stock and mutual fund performances',
          'Entrepreneurs and business executives reporting annualized revenue growth',
          'Analysts comparing competing assets across varying timeframes'
        ],
        howItWorks:
          'Formula: CAGR = (Ending Value ÷ Beginning Value)^(1 ÷ t) − 1, where t is the investment duration in years.',
        resultsMeaning:
          'Smooths out erratic market ups and downs to report the annualized equivalent rate. A 15% CAGR means the investment grew at the equivalent of a steady 15% compounded annually.',
        limitations: [
          'Masks interim market volatility. An asset could crash 40% and rebound, yielding the same CAGR as a steady fixed deposit.'
        ],
        examples: [
          {
            title: '5-Year Portfolio Compounding',
            explanation: 'An initial investment of ₹2,00,000 growing to ₹4,50,000 over 5 years: (4,50,000 ÷ 2,00,000)^(1/5) − 1.',
            value: 'CAGR: 17.61% per annum'
          }
        ]
      };

    case 'fd-calculator':
      return {
        whatItIs:
          'The NAVIKO Fixed Deposit (FD) Calculator estimates maturity values and cumulative interest payouts for bank term deposits across Indian scheduled commercial banks.',
        whatItDoes:
          'It calculates maturity amounts using standard quarterly compounding rules, supports monthly payout options, and includes senior citizen interest rate premiums (+0.50%).',
        whoItIsFor: [
          'Conservative savers seeking guaranteed capital preservation',
          'Retirees planning fixed periodic interest cash flows',
          'Individuals allocating emergency savings funds'
        ],
        howItWorks:
          'Applies quarterly compounding convention: A = P × (1 + r/4)^(4 × t), where P is principal, r is annual interest rate (decimal), and t is duration in years.',
        resultsMeaning:
          'Indicates the guaranteed maturity sum receivable from the banking institution at term completion.',
        limitations: [
          'Does not deduct Tax Deducted at Source (TDS) under Section 194A if annual interest exceeds statutory thresholds (₹40,000 for regular depositors, ₹50,000 for senior citizens).'
        ],
        examples: [
          {
            title: '3-Year Term Deposit',
            explanation: '₹2,00,000 placed in a bank fixed deposit for 3 years at 7.25% per annum.',
            value: 'Maturity: ₹2,47,786 (Interest: ₹47,786)'
          }
        ]
      };

    case 'fire-calculator':
      return {
        whatItIs:
          'The NAVIKO FIRE Calculator is a Financial Independence, Retire Early planning utility based on the classic Trinity Study 4% Safe Withdrawal Rate framework.',
        whatItDoes:
          'It calculates your target FIRE retirement number, estimated years to financial freedom based on current savings rate, and annual passive withdrawal allowances.',
        whoItIsFor: [
          'Early and mid-career professionals pursuing financial independence',
          'Individuals aiming to transition into passion projects or early retirement',
          'Savers looking to understand their required long-term wealth targets'
        ],
        howItWorks:
          'Formula: FIRE Target = Annual Living Expenses × 25 (assuming standard 4% SWR) or × 33 (conservative 3% SWR). Years to FIRE are modeled using compound returns on ongoing monthly savings.',
        resultsMeaning:
          'Defines the liquid portfolio milestone where capital gains and dividends can sustainably cover annual living expenses indefinitely without capital depletion.',
        limitations: [
          'Healthcare inflation, major lifestyle changes, and prolonged economic stagflation can increase real living expenses over multi-decade retirements.'
        ],
        examples: [
          {
            title: '4% Rule FIRE Target',
            explanation: 'Annual family expenses of ₹12,00,000: 12,00,000 × 25.',
            value: 'FIRE Number: ₹3,00,00,000 (₹3 Crore)'
          }
        ]
      };

    case 'inflation-calculator':
      return {
        whatItIs:
          'The NAVIKO Inflation Calculator estimates the purchasing power erosion of money over time and projects future costs of living.',
        whatItDoes:
          'It calculates what a sum of money today will be worth in future years, or how much future currency you will need to purchase today\'s equivalent basket of goods.',
        whoItIsFor: [
          'Retirement planners modeling real future living costs',
          'Parents estimating future higher education college expenses',
          'Investors evaluating real inflation-adjusted investment returns'
        ],
        howItWorks:
          'Formula: Future Cost = Current Cost × (1 + i)^t, where i is the annual inflation rate (decimal) and t is time in years.',
        resultsMeaning:
          'Shows the stealth cost of compounding inflation and highlights why holding non-yielding cash diminishes real wealth over time.',
        limitations: [
          'Specialized sectors (such as private higher education and medical healthcare) frequently experience inflation rates 2x to 3x higher than general CPI headline figures.'
        ],
        examples: [
          {
            title: '15-Year Higher Education Cost',
            explanation: 'A university course costing ₹15,00,000 today with an assumed 8% annual education inflation over 15 years.',
            value: 'Future Cost: ₹47,58,255'
          }
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
          'Uses baseline published figures from Union Budget documents, the Ministry of Finance, Reserve Bank of India, and IMF World Economic Outlook, projecting continuous micro-increments based on annual fiscal deficit estimates.',
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
        ],
        examples: [
          {
            title: '₹60,000 Monthly Salary Allocation',
            explanation: 'Needs (50%): ₹30,000. Wants (30%): ₹18,000. Savings/Investments (20%): ₹12,000.',
            value: 'Needs ₹30k | Wants ₹18k | Savings ₹12k'
          }
        ]
      };

    // ----------------------------------------------------
    // STUDENT & ACADEMIC PRODUCTIVITY
    // ----------------------------------------------------
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
        ],
        examples: [
          {
            title: 'Bouncing Back to 75% Attendance',
            explanation: 'Attended 38 out of 60 classes (63.33%). Target is 75%. Solving (38 + X) ÷ (60 + X) ≥ 0.75.',
            value: 'Must attend next 28 classes in a row'
          },
          {
            title: 'Safe Classes to Miss',
            explanation: 'Attended 54 out of 60 classes (90.00%). Target is 75%. Solving 54 ÷ (60 + Y) ≥ 0.75.',
            value: 'Can safely miss next 12 classes'
          }
        ]
      };

    case 'study-timetable-generator':
      return {
        whatItIs:
          'The NAVIKO Study Timetable Generator is an automated study scheduling utility that structures daily revision schedules based on active subjects, exam dates, and daily available study hours.',
        whatItDoes:
          'It allocates dedicated revision blocks, balances dense theoretical subjects with problem-solving exercises, and schedules spaced Pomodoro rest intervals.',
        whoItIsFor: [
          'Students preparing for board examinations (CBSE/ICSE/State boards)',
          'Candidates preparing for national entrance tests (JEE, NEET, UPSC, GATE, CAT)',
          'University students organizing semester final study schedules'
        ],
        howItWorks:
          'Distributes daily study hours using subject difficulty weights, alternating demanding analytical topics with lighter reading to maintain cognitive focus and prevent fatigue.',
        resultsMeaning:
          'Produces an actionable hourly daily schedule eliminating decision paralysis and procrastination.',
        limitations: [
          'Real academic progress requires consistent discipline; the timetable should be adjusted if personal comprehension speeds vary.'
        ],
        examples: [
          {
            title: '6-Hour Daily Study Plan',
            explanation: 'Balancing 4 subjects: Two 90-minute focus blocks, two 60-minute revision blocks, and three 15-minute breaks.',
            value: '4 Subjects | 4 Focus Blocks | 3 Rest Breaks'
          }
        ]
      };

    case 'can-i-finish-my-syllabus':
      return {
        whatItIs:
          'The NAVIKO Syllabus Completion Estimator is an academic feasibility utility evaluating whether your remaining course topics can be finished before your target exam date.',
        whatItDoes:
          'It computes required daily study hours, weekly chapter completion pace, and assigns an objective feasibility rating (Comfortable, Challenging, or Critical).',
        whoItIsFor: [
          'High school and college students experiencing pre-exam syllabus anxiety',
          'Coaching institute students tracking chapter backlogs before test series',
          'Self-study aspirants calibrating revision velocities'
        ],
        howItWorks:
          'Formula: Required Daily Hours = (Remaining Chapters × Avg Hours per Chapter) ÷ Remaining Days. Identifies workload gaps against realistic daily study capacity.',
        resultsMeaning:
          'Replaces vague anxiety with concrete metrics showing exactly how many chapters must be completed each week to finish on time.',
        limitations: [
          'Assumes uniform chapter complexity; foundational chapters often require more revision time than summary review topics.'
        ],
        examples: [
          {
            title: 'Pre-Exam Feasibility Check',
            explanation: '24 chapters left at 3 hours each with 30 days remaining: 72 hours total workload.',
            value: 'Required Pace: 2.4 Study Hours / Day (Feasible)'
          }
        ]
      };

    case 'backlog-recovery-planner':
      return {
        whatItIs:
          'The NAVIKO Backlog Recovery Planner is an academic triage utility designed to eliminate missed lecture backlogs without compromising ongoing syllabus coursework.',
        whatItDoes:
          'It structures a dual-track study schedule allocating 70% of study time to current coursework and 30% to systematic backlog recovery, calculating the exact date when backlogs will be fully cleared.',
        whoItIsFor: [
          'Students who missed lectures due to illness, competitions, or personal events',
          'Candidates trapped in the vicious cycle of skipping current classes to catch up on old topics'
        ],
        howItWorks:
          'Prevents syllabus snowballing by strictly ring-fencing current class hours while steadily chipping away at past backlogs during dedicated catch-up slots.',
        resultsMeaning:
          'Provides a clear, stress-free recovery trajectory with an exact target completion countdown date.',
        limitations: [
          'Requires committing additional study hours on weekends to accelerate recovery.'
        ],
        examples: [
          {
            title: '15-Hour Backlog Clearance',
            explanation: '15 hours of accumulated physics backlogs dedicating 1.5 extra catch-up hours per day.',
            value: 'Target: 10 Days to Zero Backlog'
          }
        ]
      };

    case 'study-decision-planner':
      return {
        whatItIs:
          'The NAVIKO Study Decision Matrix is an academic triage tool that prioritizes topics when exam preparation time is constrained.',
        whatItDoes:
          'It scores syllabus chapters using an Eisenhower-inspired matrix combining Exam Marks Weightage, Current Mastery Level, and Estimated Study Time Required.',
        whoItIsFor: [
          'Students with limited preparation time before semester examinations',
          'Test takers aiming to maximize aggregate scores through strategic revision'
        ],
        howItWorks:
          'Calculates Return on Time Invested (ROTI): Priority Score = (Exam Marks × (1 − Current Mastery)) ÷ Estimated Study Hours.',
        resultsMeaning:
          'Directs your immediate attention toward high-weightage topics where score improvement per hour studied is mathematically highest.',
        limitations: [
          'Should not be used to entirely abandon mandatory exam sections that enforce minimum passing cutoffs.'
        ],
        examples: [
          {
            title: 'Topic Prioritization Comparison',
            explanation: 'Topic A (12 marks, 2 hrs needed) yields 6.0 marks/hr vs Topic B (4 marks, 6 hrs needed) yielding 0.67 marks/hr.',
            value: 'Prioritize Topic A (9x Higher Return on Time)'
          }
        ]
      };

    case 'mock-test-analyzer':
      return {
        whatItIs:
          'The NAVIKO Mock Test Performance Analyzer is a diagnostic assessment tool evaluating mock exam attempts, negative marking penalties, and question-level accuracy.',
        whatItDoes:
          'It calculates gross marks, penalty deductions, overall accuracy percentage, and categorizes error types (conceptual misunderstanding vs careless miscalculation vs time pressure).',
        whoItIsFor: [
          'Aspirants preparing for competitive entrance examinations (JEE, NEET, UPSC, SSC, GRE, SAT, CAT)',
          'Educators diagnosing student test-taking habits'
        ],
        howItWorks:
          'Formula: Net Score = (Correct Answers × Mark per Question) − (Incorrect Answers × Negative Penalty). Accuracy Rate = (Correct ÷ Total Attempted) × 100.',
        resultsMeaning:
          'Reveals whether excessive blind guessing is penalizing your composite rank and highlights subject areas needing conceptual remediation.',
        limitations: [
          'Diagnostic accuracy relies on honest categorization of why questions were answered incorrectly.'
        ],
        examples: [
          {
            title: 'Negative Marking Penalty Analysis',
            explanation: '70 attempted questions: 54 correct (+216 marks), 16 incorrect (-16 marks penalty).',
            value: 'Net Score: 200 Marks (Accuracy: 77.1%)'
          }
        ]
      };

    case 'random-question-generator':
      return {
        whatItIs:
          'The NAVIKO Random Question Generator is an active recall study tool that displays randomized conceptual challenge questions across multiple subject disciplines.',
        whatItDoes:
          'It shuffles concept prompts across Mathematics, Computer Science, Physics, Chemistry, and Logical Reasoning to stimulate memory retrieval.',
        whoItIsFor: [
          'Students utilizing active recall and flashcard study techniques',
          'Candidates preparing for technical interview screenings and viva examinations'
        ],
        howItWorks:
          'Implements Fisher-Yates array shuffling algorithms to select non-repeating prompts from categorized subject repositories.',
        resultsMeaning:
          'Forces active cognitive retrieval, which cognitive science studies show produces up to 50% higher long-term memory retention compared to passive re-reading.',
        limitations: [
          'Questions are conceptual recall prompts, not full multi-step laboratory examination papers.'
        ]
      };

    // ----------------------------------------------------
    // PDF & DOCUMENT PROCESSING
    // ----------------------------------------------------
    case 'pdf-merge':
      return {
        whatItIs:
          'The NAVIKO PDF Merge Tool is a 100% private, browser-based document combiner that unifies multiple PDF files into a single organized document.',
        whatItDoes:
          'It merges multiple PDF files in your preferred sequence, preserves vector typography and embedded graphics, and generates an unwatermarked, downloadable PDF.',
        whoItIsFor: [
          'Job seekers combining cover letters, resumes, and reference certificates',
          'Students assembling homework assignments and project reports',
          'Legal and business professionals compiling contract annexures and exhibits'
        ],
        howItWorks:
          'Processes PDF streams entirely in your local browser memory using modern WebAssembly and JavaScript PDF engines. Your documents are never uploaded to any external server.',
        resultsMeaning:
          'Produces an ISO 32000-compliant PDF file readable across all standard PDF viewers and desktop operating systems.',
        limitations: [
          'Files exceeding 150 MB or containing thousands of high-resolution scanned pages may process slower depending on device RAM memory.'
        ],
        examples: [
          {
            title: 'Job Application Package',
            explanation: 'Combining a 1-page cover letter, 2-page resume, and 3-page portfolio PDF into one unified 6-page submission.',
            value: '3 Documents → 1 Clean PDF'
          }
        ]
      };

    case 'pdf-split':
      return {
        whatItIs:
          'The NAVIKO PDF Split Tool extracts specific pages or page intervals from multi-page PDF documents entirely inside your browser.',
        whatItDoes:
          'It extracts specified page ranges (e.g., pages 1-3, 5, 8-10) or splits documents into individual standalone single-page PDF files.',
        whoItIsFor: [
          'Applicants needing to submit specific pages of a tax return or bank statement',
          'Students extracting relevant chapters from larger textbook PDFs'
        ],
        howItWorks:
          'Parses the PDF document cross-reference table and page tree dictionaries locally, creating new catalog references for selected pages without re-encoding text.',
        resultsMeaning:
          'Generates lightweight PDF files containing only the extracted pages with original vector fidelity intact.',
        limitations: [
          'Encrypted or password-protected PDF files must have password security removed prior to splitting.'
        ],
        examples: [
          {
            title: 'Extracting Quarterly Statement',
            explanation: 'Extracting pages 8 to 11 from a 48-page annual financial statement PDF.',
            value: 'Extract Pages 8-11 → New 4-Page PDF'
          }
        ]
      };

    case 'pdf-compressor':
      return {
        whatItIs:
          'The NAVIKO PDF Compressor reduces PDF file sizes directly in your browser to meet strict upload portal thresholds.',
        whatItDoes:
          'It re-samples high-DPI raster images, strips redundant metadata, and compacts PDF streams to compress documents under portal limits (e.g., 500 KB or 1 MB).',
        whoItIsFor: [
          'Candidates submitting application packages to portals with strict file size caps',
          'Professionals emailing document attachments with email server limits'
        ],
        howItWorks:
          'Extracts embedded JPEG/PNG image objects within the PDF structure, downsamples excessive DPI resolution, and re-encodes compressed streams client-side.',
        resultsMeaning:
          'Significantly decreases file size while maintaining readable text and document clarity.',
        limitations: [
          'PDFs composed purely of vector text or already-compressed images will experience minimal file size reduction.'
        ],
        examples: [
          {
            title: 'Government Portal Submission',
            explanation: 'Compressing a 6.8 MB scanned document package down to 780 KB to meet a 1 MB portal cap.',
            value: '6.8 MB → 780 KB (88% reduction)'
          }
        ]
      };

    case 'jpg-to-pdf':
      return {
        whatItIs:
          'The NAVIKO JPG to PDF Converter transforms image files (JPEG, PNG, WebP) into formatted, printable multi-page PDF documents.',
        whatItDoes:
          'It combines single or multiple images into a standardized PDF with options for A4, Letter, or native image aspect ratios, margins, and orientation.',
        whoItIsFor: [
          'Students digitizing handwritten homework photos into single PDF files',
          'Employees compiling photographed receipts into expense reports'
        ],
        howItWorks:
          'Packages raw image binary streams directly inside standard PDF page dictionary wrappers without lossy re-encoding.',
        resultsMeaning:
          'Creates a universally shareable PDF document from separate photo files.',
        limitations: [
          'Image orientation depends on camera EXIF tags; ensure photos are right-side-up before conversion.'
        ],
        examples: [
          {
            title: 'Converting 4 Lecture Photo Notes',
            explanation: 'Combining 4 smartphone photos into an A4 PDF document for homework submission.',
            value: '4 JPG Photos → 1 Standard A4 PDF'
          }
        ]
      };

    case 'pdf-to-jpg':
      return {
        whatItIs:
          'The NAVIKO PDF to JPG Converter renders pages of PDF documents as high-resolution JPEG image files.',
        whatItDoes:
          'It extracts each page of a PDF document at 150 or 300 DPI resolution, saving them as individual JPEG images ready for presentations or social sharing.',
        whoItIsFor: [
          'Presenters inserting PDF pages into PowerPoint or Keynote decks',
          'Web designers extracting graphics and slide thumbnails from PDF reports'
        ],
        howItWorks:
          'Renders PDF vector commands onto high-resolution HTML5 Canvas buffers and exports via the browser\'s native image rasterizer.',
        resultsMeaning:
          'Produces high-clarity image reproductions of the PDF pages.',
        limitations: [
          'High-DPI rendering of very large multi-page documents requires sufficient browser RAM.'
        ],
        examples: [
          {
            title: 'Extracting Infographic Slide',
            explanation: 'Exporting page 3 of a 12-page research PDF as a 300 DPI high-resolution JPEG.',
            value: 'PDF Page 3 → High-Res JPEG Image'
          }
        ]
      };

    // ----------------------------------------------------
    // IMAGE & GRAPHIC SUITE
    // ----------------------------------------------------
    case 'image-compressor':
      return {
        whatItIs:
          'The NAVIKO Image Compressor is a privacy-first browser image utility that reduces JPEG, PNG, and WebP file sizes to specific kilobyte thresholds.',
        whatItDoes:
          'It compresses images to target file sizes (e.g., under 20 KB, 50 KB, 100 KB, 200 KB) required by official exam and visa application portals.',
        whoItIsFor: [
          'Job applicants resizing passport photos and signature scans for official forms',
          'Web designers optimizing assets for faster page load times',
          'Students compressing images to meet portal upload caps'
        ],
        howItWorks:
          'Employs binary search iterative quality scaling and bilinear canvas downsampling entirely in local browser memory without server uploads.',
        resultsMeaning:
          'Delivers an optimized, correctly sized image file ready for immediate download and upload to third-party portals.',
        limitations: [
          'Extremely aggressive compression (e.g., compressing 10 MB down to 15 KB) will introduce visible JPEG block compression artifacts.'
        ],
        examples: [
          {
            title: 'Passport Photo Compression',
            explanation: 'Compressing a 3.5 MB digital photo down to 45 KB for a civil service portal requiring < 50 KB.',
            value: '3.5 MB → 45 KB (98% reduction)'
          }
        ]
      };

    case 'image-resizer':
      return {
        whatItIs:
          'The NAVIKO Image Resizer adjusts pixel dimensions, aspect ratios, and resolution of digital images directly in your browser.',
        whatItDoes:
          'It resizes images to exact width and height pixel specifications, centimeters, or inches with aspect ratio locking and DPI options.',
        whoItIsFor: [
          'Applicants formatting passport photos (e.g., 3.5cm × 4.5cm or 2×2 inches)',
          'Content creators sizing YouTube thumbnails, avatars, and banner graphics'
        ],
        howItWorks:
          'Renders pixels onto an off-screen HTML5 Canvas utilizing bicubic interpolation algorithms to preserve edge sharpness.',
        resultsMeaning:
          'Modifies physical pixel dimensions without corrupting file integrity or uploading data to external servers.',
        limitations: [
          'Upscaling very small low-resolution images to large dimensions cannot invent missing detail and will appear soft.'
        ],
        examples: [
          {
            title: 'Square Profile Picture Resizing',
            explanation: 'Resizing an arbitrary 1920×1080 photograph to a standard 400×400 square avatar.',
            value: '1920×1080 → 400×400 Pixels'
          }
        ]
      };

    case 'image-cropper':
      return {
        whatItIs:
          'The NAVIKO Image Cropper is an interactive visual framing tool allowing users to crop, rotate, and zoom images with custom aspect ratio presets.',
        whatItDoes:
          'It provides visual framing with presets for 1:1 square, 4:3, 16:9 widescreen, and passport ratios with real-time pixel boundary previews.',
        whoItIsFor: [
          'Job applicants isolating headshot portraits from group photos',
          'Social media creators framing banner images and profile photos'
        ],
        howItWorks:
          'Maps interactive bounding box coordinates to slice the exact pixel matrix on an HTML5 Canvas buffer before exporting.',
        resultsMeaning:
          'Exports only the selected rectangular sub-region at native image resolution.',
        limitations: [
          'Cropping permanently discards pixels outside the selected bounding frame in the exported file.'
        ]
      };

    case 'jpg-to-png':
      return {
        whatItIs:
          'The NAVIKO JPG to PNG Converter transforms lossy JPEG images into lossless PNG format with transparency support.',
        whatItDoes:
          'It decodes JPEG color matrices and encodes them into PNG-24 with Deflate compression, ready for editing in Photoshop, Figma, or Canva.',
        whoItIsFor: [
          'Designers requiring PNG format for graphic layers and mockups',
          'Users preparing assets for software that requires PNG files'
        ],
        howItWorks:
          'Extracts pixel arrays in browser memory and formats PNG IDAT binary chunks locally.',
        resultsMeaning:
          'Delivers a lossless PNG file with zero generational compression loss.',
        limitations: [
          'Converting a JPG to PNG cannot magically generate transparency if the original JPG had a solid background.'
        ]
      };

    case 'png-to-jpg':
      return {
        whatItIs:
          'The NAVIKO PNG to JPG Converter transforms heavy PNG images into lightweight, optimized JPEG files with customizable background fills.',
        whatItDoes:
          'It replaces transparent alpha pixels with a solid background color (default white) and encodes pixels to JPEG with adjustable quality compression.',
        whoItIsFor: [
          'Website owners converting heavy PNG screenshots into lightweight JPEGs to speed up website loading',
          'Users saving device storage space'
        ],
        howItWorks:
          'Draws PNG pixels onto a canvas initialized with a solid background fill before running JPEG discrete cosine transform encoding.',
        resultsMeaning:
          'Typically achieves 60% to 80% file size reduction while preserving visual quality for photographic content.',
        limitations: [
          'Permanently removes transparent alpha channels; JPEG format does not support transparency.'
        ]
      };

    case 'background-remover':
      return {
        whatItIs:
          'The NAVIKO Background Remover is a browser-based utility that isolates subjects and removes solid or uniform backgrounds from images.',
        whatItDoes:
          'It detects background color thresholds, feathers subject edges, and replaces backgrounds with transparent alpha channels.',
        whoItIsFor: [
          'E-commerce merchants preparing clean product photos',
          'Professionals creating transparent portrait avatars for presentations'
        ],
        howItWorks:
          'Calculates RGB Euclidean color distance and edge contrast matrices directly in the browser\'s Canvas ImageData buffer.',
        resultsMeaning:
          'Outputs a transparent PNG image ready to overlay onto any background color or presentation slide.',
        limitations: [
          'Complex backgrounds with intricate hair or low-contrast edges require manual touch-up compared to solid studio backdrops.'
        ]
      };

    // ----------------------------------------------------
    // CAREER & GENERAL PRODUCTIVITY
    // ----------------------------------------------------
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

    case 'unit-converter':
      return {
        whatItIs:
          'The NAVIKO Universal Unit Converter is a multi-dimensional conversion utility covering Length, Weight, Temperature, Area, Volume, Speed, and Digital Storage units.',
        whatItDoes:
          'It converts measurements across metric (SI) and imperial systems with bidirectional live conversions and exact conversion formula breakdowns.',
        whoItIsFor: [
          'Engineering and physics students converting homework units',
          'International travelers converting kilometers, miles, Celsius, and Fahrenheit',
          'Home cooks converting culinary recipe grams, ounces, milliliters, and cups'
        ],
        howItWorks:
          'Normalizes input values to standard base SI units (meters, kilograms, Kelvin) before projecting to target unit values using high-precision conversion constants.',
        resultsMeaning:
          'Provides exact conversion figures conforming to the International Bureau of Weights and Measures (BIPM).',
        limitations: [
          'Temperature conversions follow affine algebraic shifts ((°F − 32) × 5/9 = °C) rather than simple linear multipliers.'
        ],
        examples: [
          {
            title: 'Height & Distance Conversion',
            explanation: 'Converting 5 feet 10 inches to centimeters: (5 × 30.48) + (10 × 2.54).',
            value: '5 ft 10 in = 177.80 cm'
          },
          {
            title: 'Weight Conversion',
            explanation: 'Converting 68 kilograms to pounds: 68 × 2.20462.',
            value: '68 kg = 149.91 lbs'
          }
        ]
      };

    case 'word-counter':
      return {
        whatItIs:
          'The NAVIKO Word & Character Counter is a real-time text analysis utility measuring words, characters, sentences, paragraphs, and reading duration.',
        whatItDoes:
          'It tracks total words, characters with spaces, characters without spaces, sentence count, paragraph count, and estimates reading and speaking times.',
        whoItIsFor: [
          'College applicants checking essay length against strict Common App word caps',
          'Bloggers, writers, and journalists monitoring article length',
          'Social media managers crafting character-limited posts'
        ],
        howItWorks:
          'Uses Unicode-aware regex tokenizers to count word boundaries, spaces, and sentences. Reading duration assumes an average adult reading velocity of 225 words per minute.',
        resultsMeaning:
          'Ensures your writing fits within required limits and gives you an accurate sense of how long audiences take to read your content.',
        limitations: [
          'Hyphenated words and compound terms can vary between lexical style guides.'
        ],
        examples: [
          {
            title: 'College Admissions Essay Check',
            explanation: 'Checking a Common App essay against the strict 650-word maximum limit.',
            value: '624 Words | 3,840 Characters | ~2.7 min read'
          }
        ]
      };

    case 'qr-code-generator':
      return {
        whatItIs:
          'The NAVIKO QR Code Generator creates custom matrix barcodes for URLs, plain text, Wi-Fi network credentials, email addresses, and phone numbers.',
        whatItDoes:
          'It generates high-resolution QR codes with customizable foreground and background colors, configurable error correction (L, M, Q, H), and one-click PNG export.',
        whoItIsFor: [
          'Restaurant and retail owners creating contactless digital menu codes',
          'Event coordinators generating check-in badge links',
          'Professionals adding vCard contact QR codes to business cards'
        ],
        howItWorks:
          'Encodes data according to ISO/IEC 18004 specifications with Reed-Solomon error correction codes allowing codes to scan even if up to 30% damaged or obscured.',
        resultsMeaning:
          'Produces standard scannable QR codes readable by all modern smartphone cameras.',
        limitations: [
          'Encoding very long URLs (> 800 characters) creates extremely dense pixel grids that require high-resolution printing to scan reliably.'
        ],
        examples: [
          {
            title: 'Wi-Fi Network Quick Connect',
            explanation: 'Encoding SSID and WPA password for instant guest connection without typing credentials.',
            value: 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;'
          }
        ]
      };

    // ----------------------------------------------------
    // HEALTH & WELLNESS (WITH MANDATORY DISCLAIMERS)
    // ----------------------------------------------------
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

    default:
      return getDefaultCategoryExplanation(tool);
  }
};

const getHealthDisclaimer = (toolId: string): string => {
  return 'The health and wellness utilities on NAVIKO are provided solely for educational and informational purposes. They are NOT a substitute for professional medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay seeking it because of information calculated on this website.';
};

const getDefaultCategoryExplanation = (tool: ToolMeta): StructuredToolExplanation => {
  return {
    whatItIs: `${tool.name} is a dedicated, privacy-focused online utility on NAVIKO built for rapid, accurate browser-based productivity.`,
    whatItDoes: `It provides ${tool.shortDescription.toLowerCase()}, executing all computations and transformations locally on your device.`,
    whoItIsFor: [
      'Students, educators, and academic researchers',
      'Working professionals seeking reliable daily digital tools',
      'Users prioritizing 100% client-side privacy without registration'
    ],
    howItWorks:
      'Runs natively inside your modern browser using HTML5, WebAssembly, and JavaScript standards, ensuring zero data transmission to external servers.',
    resultsMeaning:
      'Delivers immediate, verified results formatted for clear practical use.',
    limitations: [
      'Operates within client-side browser memory without storing history to a remote database.'
    ]
  };
};
