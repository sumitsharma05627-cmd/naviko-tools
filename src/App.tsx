import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { getToolByPath } from './data/toolsData';

// Fallback loader for lazy-loaded tools and secondary routes
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="w-9 h-9 border-3 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
    <span className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Loading NAVIKO...</span>
  </div>
);

// Lazy Loaded Auxiliary Components
const ToolLayout = lazy(() => import('./components/ToolLayout').then(m => ({ default: m.ToolLayout })));
const ChatBot = lazy(() => import('./components/ChatBot').then(m => ({ default: m.ChatBot })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));

// Lazy Loaded Tool Components
const NumberCalculator = lazy(() => import('./components/tools/NumberCalculator').then(m => ({ default: m.NumberCalculator })));
const ScientificCalculator = lazy(() => import('./components/tools/ScientificCalculator').then(m => ({ default: m.ScientificCalculator })));
const PercentageCalculator = lazy(() => import('./components/tools/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const AgeCalculator = lazy(() => import('./components/tools/AgeCalculator').then(m => ({ default: m.AgeCalculator })));
const CgpaCalculator = lazy(() => import('./components/tools/CgpaCalculator').then(m => ({ default: m.CgpaCalculator })));
const UnitConverter = lazy(() => import('./components/tools/UnitConverter').then(m => ({ default: m.UnitConverter })));
const WordCounter = lazy(() => import('./components/tools/WordCounter').then(m => ({ default: m.WordCounter })));
const ImageCompressor = lazy(() => import('./components/tools/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const ImageResizer = lazy(() => import('./components/tools/ImageResizer').then(m => ({ default: m.ImageResizer })));
const QrCodeGenerator = lazy(() => import('./components/tools/QrCodeGenerator').then(m => ({ default: m.QrCodeGenerator })));
const TypingSpeedTest = lazy(() => import('./components/tools/TypingSpeedTest').then(m => ({ default: m.TypingSpeedTest })));
const ResumeBuilder = lazy(() => import('./components/tools/ResumeBuilder').then(m => ({ default: m.ResumeBuilder })));
const DiscountCalculator = lazy(() => import('./components/tools/DiscountCalculator').then(m => ({ default: m.DiscountCalculator })));
const SimpleInterestCalculator = lazy(() => import('./components/tools/SimpleInterestCalculator').then(m => ({ default: m.SimpleInterestCalculator })));
const RandomQuestionGenerator = lazy(() => import('./components/tools/RandomQuestionGenerator').then(m => ({ default: m.RandomQuestionGenerator })));
const StudyTimetableGenerator = lazy(() => import('./components/tools/StudyTimetableGenerator').then(m => ({ default: m.StudyTimetableGenerator })));

// PDF & Image & Student Tools
const PdfMerge = lazy(() => import('./components/tools/PdfMerge').then(m => ({ default: m.PdfMerge })));
const PdfCompressor = lazy(() => import('./components/tools/PdfCompressor').then(m => ({ default: m.PdfCompressor })));
const JpgToPdf = lazy(() => import('./components/tools/JpgToPdf').then(m => ({ default: m.JpgToPdf })));
const PdfToJpg = lazy(() => import('./components/tools/PdfToJpg').then(m => ({ default: m.PdfToJpg })));
const PdfSplit = lazy(() => import('./components/tools/PdfSplit').then(m => ({ default: m.PdfSplit })));
const ImageCropper = lazy(() => import('./components/tools/ImageCropper').then(m => ({ default: m.ImageCropper })));
const JpgToPng = lazy(() => import('./components/tools/JpgToPng').then(m => ({ default: m.JpgToPng })));
const PngToJpg = lazy(() => import('./components/tools/PngToJpg').then(m => ({ default: m.PngToJpg })));
const BackgroundRemover = lazy(() => import('./components/tools/BackgroundRemover').then(m => ({ default: m.BackgroundRemover })));
const AttendanceCalculator = lazy(() => import('./components/tools/AttendanceCalculator').then(m => ({ default: m.AttendanceCalculator })));
const StudyDecisionPlanner = lazy(() => import('./components/tools/StudyDecisionPlanner').then(m => ({ default: m.StudyDecisionPlanner })));
const BacklogRecoveryPlanner = lazy(() => import('./components/tools/BacklogRecoveryPlanner').then(m => ({ default: m.BacklogRecoveryPlanner })));
const CanIFinishMySyllabus = lazy(() => import('./components/tools/CanIFinishMySyllabus').then(m => ({ default: m.CanIFinishMySyllabus })));
const MockTestAnalyzer = lazy(() => import('./components/tools/MockTestAnalyzer').then(m => ({ default: m.MockTestAnalyzer })));

// Finance Tool Components
const SipCalculator = lazy(() => import('./components/tools/SipCalculator').then(m => ({ default: m.SipCalculator })));
const LumpSumCalculator = lazy(() => import('./components/tools/LumpSumCalculator').then(m => ({ default: m.LumpSumCalculator })));
const EmiCalculator = lazy(() => import('./components/tools/EmiCalculator').then(m => ({ default: m.EmiCalculator })));
const LoanCalculator = lazy(() => import('./components/tools/LoanCalculator').then(m => ({ default: m.LoanCalculator })));
const GstCalculator = lazy(() => import('./components/tools/GstCalculator').then(m => ({ default: m.GstCalculator })));
const CompoundInterestCalculator = lazy(() => import('./components/tools/CompoundInterestCalculator').then(m => ({ default: m.CompoundInterestCalculator })));
const SalaryCalculator = lazy(() => import('./components/tools/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const CagrCalculator = lazy(() => import('./components/tools/CagrCalculator').then(m => ({ default: m.CagrCalculator })));
const FdCalculator = lazy(() => import('./components/tools/FdCalculator').then(m => ({ default: m.FdCalculator })));
const FireCalculator = lazy(() => import('./components/tools/FireCalculator').then(m => ({ default: m.FireCalculator })));
const InflationCalculator = lazy(() => import('./components/tools/InflationCalculator').then(m => ({ default: m.InflationCalculator })));
const DebtClock = lazy(() => import('./components/tools/DebtClock').then(m => ({ default: m.DebtClock })));
const BudgetCalculator = lazy(() => import('./components/tools/BudgetCalculator').then(m => ({ default: m.BudgetCalculator })));

// Lazy Loaded Secondary Pages
const AllToolsPage = lazy(() => import('./pages/AllToolsPage').then(m => ({ default: m.AllToolsPage })));
const StudentToolsPage = lazy(() => import('./pages/StudentToolsPage').then(m => ({ default: m.StudentToolsPage })));
const FinanceToolsPage = lazy(() => import('./pages/FinanceToolsPage').then(m => ({ default: m.FinanceToolsPage })));
const PdfToolsPage = lazy(() => import('./pages/PdfToolsPage').then(m => ({ default: m.PdfToolsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail').then(m => ({ default: m.BlogPostDetail })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then(m => ({ default: m.DisclaimerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Central Tool Component Registry for dynamic routing
const TOOL_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'number-calculator': NumberCalculator,
  'scientific-calculator': ScientificCalculator,
  'percentage-calculator': PercentageCalculator,
  'age-calculator': AgeCalculator,
  'cgpa-calculator': CgpaCalculator,
  'unit-converter': UnitConverter,
  'word-counter': WordCounter,
  'image-compressor': ImageCompressor,
  'image-resizer': ImageResizer,
  'qr-code-generator': QrCodeGenerator,
  'typing-speed-test': TypingSpeedTest,
  'resume-builder': ResumeBuilder,
  'discount-calculator': DiscountCalculator,
  'simple-interest-calculator': SimpleInterestCalculator,
  'random-question-generator': RandomQuestionGenerator,
  'random-study-question-generator': RandomQuestionGenerator,
  'study-timetable-generator': StudyTimetableGenerator,
  'pdf-merge': PdfMerge,
  'pdf-compressor': PdfCompressor,
  'jpg-to-pdf': JpgToPdf,
  'pdf-to-jpg': PdfToJpg,
  'pdf-split': PdfSplit,
  'image-cropper': ImageCropper,
  'jpg-to-png': JpgToPng,
  'png-to-jpg': PngToJpg,
  'background-remover': BackgroundRemover,
  'attendance-calculator': AttendanceCalculator,
  'study-decision-planner': StudyDecisionPlanner,
  'backlog-recovery-planner': BacklogRecoveryPlanner,
  'can-i-finish-my-syllabus': CanIFinishMySyllabus,
  'mock-test-analyzer': MockTestAnalyzer,
  'sip-calculator': SipCalculator,
  'lump-sum-calculator': LumpSumCalculator,
  'emi-calculator': EmiCalculator,
  'loan-calculator': LoanCalculator,
  'gst-calculator': GstCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'salary-calculator': SalaryCalculator,
  'cagr-calculator': CagrCalculator,
  'fd-calculator': FdCalculator,
  'fire-calculator': FireCalculator,
  'inflation-calculator': InflationCalculator,
  'debt-clock': DebtClock,
  'india-debt-clock': DebtClock,
  'budget-calculator': BudgetCalculator,
  'budget-planner': BudgetCalculator,
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Render Tool wrapper
  const renderTool = (path: string, Component: React.ComponentType<any>) => {
    const toolMeta = getToolByPath(path);
    if (!toolMeta) {
      return (
        <NotFoundPage
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          requestedPath={path}
        />
      );
    }

    return (
      <ToolLayout tool={toolMeta} onNavigate={navigate}>
        <Component />
      </ToolLayout>
    );
  };

  // Route matching
  const renderContent = () => {
    const rawPath = currentPath.toLowerCase().trim();
    const path = rawPath.replace(/\/$/, '') || '/';

    // 1. Home Route (Instant Eager Render for fastest LCP)
    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    // 2. Hub & Category Pages
    if (path === '/tools') {
      return <AllToolsPage onNavigate={navigate} />;
    }
    if (path === '/student-tools') {
      return <StudentToolsPage onNavigate={navigate} />;
    }
    if (path === '/finance-tools' || path === '/calculators/finance') {
      return <FinanceToolsPage onNavigate={navigate} />;
    }
    if (path === '/pdf-tools') {
      return <PdfToolsPage onNavigate={navigate} />;
    }
    if (path === '/image-tools') {
      return <AllToolsPage onNavigate={navigate} initialCategory="image" />;
    }
    if (path === '/career-tools') {
      return <AllToolsPage onNavigate={navigate} initialCategory="career" />;
    }
    if (path === '/calculators') {
      return <AllToolsPage onNavigate={navigate} initialCategory="calculators" />;
    }

    // 3. Blog Routes
    if (path === '/blog') {
      return <BlogPage onNavigate={navigate} />;
    }
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return <BlogPostDetail slug={slug} onNavigate={navigate} />;
    }

    // 4. Legal / Info Pages
    if (path === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (path === '/contact') {
      return <ContactPage />;
    }
    if (path === '/privacy-policy' || path === '/privacy') {
      return <PrivacyPolicyPage />;
    }
    if (path === '/terms' || path === '/terms-of-service') {
      return <TermsPage />;
    }
    if (path === '/disclaimer') {
      return <DisclaimerPage />;
    }

    // 5. Legacy & E-commerce Redirect Handlers (e.g. old NAVIKO Shop URLs)
    const oldShopRoutes = [
      '/shop', '/products', '/cart', '/checkout', '/collections',
      '/t-shirts', '/tshirts', '/apparel', '/store', '/order-status', '/track-order'
    ];
    if (oldShopRoutes.includes(path)) {
      return <AllToolsPage onNavigate={navigate} />;
    }

    // 6. Dynamic Tool Route Lookup (Supports /tools/xyz, /student-tools/xyz, /finance-tools/xyz, /pdf-tools/xyz, etc.)
    const toolMeta = getToolByPath(path);
    if (toolMeta) {
      const Component = TOOL_COMPONENTS[toolMeta.id] || TOOL_COMPONENTS[toolMeta.slug];
      if (Component) {
        return renderTool(toolMeta.path, Component);
      }
    }

    // 7. Dedicated 404 Fallback when route is truly invalid
    return (
      <NotFoundPage
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        requestedPath={currentPath}
      />
    );
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
          <Header
            onNavigate={navigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            currentPath={currentPath}
          />

          <main className="flex-1">
            <Suspense fallback={<PageLoadingFallback />}>
              {renderContent()}
            </Suspense>
          </main>

          <Footer onNavigate={navigate} />

          <Suspense fallback={null}>
            <ChatBot onNavigate={navigate} />
          </Suspense>

          {isSearchOpen && (
            <Suspense fallback={null}>
              <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onNavigate={(path) => navigate(path)}
              />
            </Suspense>
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
