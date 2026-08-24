import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ToolLayout } from './components/ToolLayout';
import { ChatBot } from './components/ChatBot';

// Tool Components
import { NumberCalculator } from './components/tools/NumberCalculator';
import { ScientificCalculator } from './components/tools/ScientificCalculator';
import { PercentageCalculator } from './components/tools/PercentageCalculator';
import { AgeCalculator } from './components/tools/AgeCalculator';
import { CgpaCalculator } from './components/tools/CgpaCalculator';
import { UnitConverter } from './components/tools/UnitConverter';
import { WordCounter } from './components/tools/WordCounter';
import { ImageCompressor } from './components/tools/ImageCompressor';
import { ImageResizer } from './components/tools/ImageResizer';
import { QrCodeGenerator } from './components/tools/QrCodeGenerator';
import { TypingSpeedTest } from './components/tools/TypingSpeedTest';
import { ResumeBuilder } from './components/tools/ResumeBuilder';
import { DiscountCalculator } from './components/tools/DiscountCalculator';
import { SimpleInterestCalculator } from './components/tools/SimpleInterestCalculator';
import { RandomQuestionGenerator } from './components/tools/RandomQuestionGenerator';
import { StudyTimetableGenerator } from './components/tools/StudyTimetableGenerator';

// New PDF & Image & Student Tools
import { PdfMerge } from './components/tools/PdfMerge';
import { PdfCompressor } from './components/tools/PdfCompressor';
import { JpgToPdf } from './components/tools/JpgToPdf';
import { PdfToJpg } from './components/tools/PdfToJpg';
import { PdfSplit } from './components/tools/PdfSplit';
import { ImageCropper } from './components/tools/ImageCropper';
import { JpgToPng } from './components/tools/JpgToPng';
import { PngToJpg } from './components/tools/PngToJpg';
import { BackgroundRemover } from './components/tools/BackgroundRemover';
import { AttendanceCalculator } from './components/tools/AttendanceCalculator';
import { StudyDecisionPlanner } from './components/tools/StudyDecisionPlanner';
import { BacklogRecoveryPlanner } from './components/tools/BacklogRecoveryPlanner';
import { CanIFinishMySyllabus } from './components/tools/CanIFinishMySyllabus';
import { MockTestAnalyzer } from './components/tools/MockTestAnalyzer';

// Finance Tool Components
import { SipCalculator } from './components/tools/SipCalculator';
import { LumpSumCalculator } from './components/tools/LumpSumCalculator';
import { EmiCalculator } from './components/tools/EmiCalculator';
import { LoanCalculator } from './components/tools/LoanCalculator';
import { GstCalculator } from './components/tools/GstCalculator';
import { CompoundInterestCalculator } from './components/tools/CompoundInterestCalculator';
import { SalaryCalculator } from './components/tools/SalaryCalculator';
import { CagrCalculator } from './components/tools/CagrCalculator';
import { FdCalculator } from './components/tools/FdCalculator';
import { FireCalculator } from './components/tools/FireCalculator';
import { InflationCalculator } from './components/tools/InflationCalculator';
import { DebtClock } from './components/tools/DebtClock';
import { BudgetCalculator } from './components/tools/BudgetCalculator';

// Pages
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { StudentToolsPage } from './pages/StudentToolsPage';
import { FinanceToolsPage } from './pages/FinanceToolsPage';
import { PdfToolsPage } from './pages/PdfToolsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostDetail } from './pages/BlogPostDetail';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { getToolByPath } from './data/toolsData';

// Central Tool Component Registry for dynamic routing
const TOOL_COMPONENTS: Record<string, React.FC> = {
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
  const renderTool = (path: string, Component: React.FC) => {
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

    // 1. Home Route
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
            {renderContent()}
          </main>

          <Footer onNavigate={navigate} />

          <ChatBot onNavigate={navigate} />

          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectTool={(path) => navigate(path)}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
