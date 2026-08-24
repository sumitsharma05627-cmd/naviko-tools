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

import { getToolByPath } from './data/toolsData';

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
    if (!toolMeta) return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;

    return (
      <ToolLayout tool={toolMeta} onNavigate={navigate}>
        <Component />
      </ToolLayout>
    );
  };

  // Route matching
  const renderContent = () => {
    const path = currentPath.toLowerCase().replace(/\/$/, '') || '/';

    // Tool Routes
    if (path === '/tools/number-calculator') {
      return renderTool(path, NumberCalculator);
    }
    if (path === '/tools/scientific-calculator') {
      return renderTool(path, ScientificCalculator);
    }
    if (path === '/tools/percentage-calculator') {
      return renderTool(path, PercentageCalculator);
    }
    if (path === '/tools/age-calculator') {
      return renderTool(path, AgeCalculator);
    }
    if (path === '/tools/cgpa-calculator') {
      return renderTool(path, CgpaCalculator);
    }
    if (path === '/tools/unit-converter') {
      return renderTool(path, UnitConverter);
    }
    if (path === '/tools/word-counter') {
      return renderTool(path, WordCounter);
    }
    if (path === '/tools/image-compressor') {
      return renderTool(path, ImageCompressor);
    }
    if (path === '/tools/image-resizer') {
      return renderTool(path, ImageResizer);
    }
    if (path === '/tools/qr-code-generator') {
      return renderTool(path, QrCodeGenerator);
    }
    if (path === '/tools/typing-speed-test') {
      return renderTool(path, TypingSpeedTest);
    }
    if (path === '/tools/resume-builder') {
      return renderTool(path, ResumeBuilder);
    }
    if (path === '/tools/discount-calculator') {
      return renderTool(path, DiscountCalculator);
    }
    if (path === '/tools/simple-interest-calculator') {
      return renderTool(path, SimpleInterestCalculator);
    }
    if (path === '/tools/random-question-generator' || path === '/tools/random-study-question-generator') {
      return renderTool('/tools/random-question-generator', RandomQuestionGenerator);
    }
    if (path === '/tools/study-timetable-generator') {
      return renderTool(path, StudyTimetableGenerator);
    }

    // PDF Tools Routes
    if (path === '/tools/pdf-merge') {
      return renderTool(path, PdfMerge);
    }
    if (path === '/tools/pdf-compressor') {
      return renderTool(path, PdfCompressor);
    }
    if (path === '/tools/jpg-to-pdf') {
      return renderTool(path, JpgToPdf);
    }
    if (path === '/tools/pdf-to-jpg') {
      return renderTool(path, PdfToJpg);
    }
    if (path === '/tools/pdf-split') {
      return renderTool(path, PdfSplit);
    }

    // Image Tools Routes
    if (path === '/tools/image-cropper') {
      return renderTool(path, ImageCropper);
    }
    if (path === '/tools/jpg-to-png') {
      return renderTool(path, JpgToPng);
    }
    if (path === '/tools/png-to-jpg') {
      return renderTool(path, PngToJpg);
    }
    if (path === '/tools/background-remover') {
      return renderTool(path, BackgroundRemover);
    }

    // Student Tools Routes
    if (path === '/tools/attendance-calculator') {
      return renderTool(path, AttendanceCalculator);
    }

    // Finance Tools
    if (path === '/tools/sip-calculator') {
      return renderTool(path, SipCalculator);
    }
    if (path === '/tools/lump-sum-calculator') {
      return renderTool(path, LumpSumCalculator);
    }
    if (path === '/tools/emi-calculator') {
      return renderTool(path, EmiCalculator);
    }
    if (path === '/tools/loan-calculator') {
      return renderTool(path, LoanCalculator);
    }
    if (path === '/tools/gst-calculator') {
      return renderTool(path, GstCalculator);
    }
    if (path === '/tools/compound-interest-calculator') {
      return renderTool(path, CompoundInterestCalculator);
    }
    if (path === '/tools/salary-calculator') {
      return renderTool(path, SalaryCalculator);
    }
    if (path === '/tools/cagr-calculator') {
      return renderTool(path, CagrCalculator);
    }
    if (path === '/tools/fd-calculator') {
      return renderTool(path, FdCalculator);
    }
    if (path === '/tools/fire-calculator') {
      return renderTool(path, FireCalculator);
    }
    if (path === '/tools/inflation-calculator') {
      return renderTool(path, InflationCalculator);
    }
    if (path === '/tools/debt-clock' || path === '/debt-clock' || path === '/tools/india-debt-clock') {
      return renderTool('/tools/debt-clock', DebtClock);
    }
    if (path === '/tools/budget-calculator' || path === '/budget' || path === '/budget-planner' || path === '/tools/budget-planner') {
      return renderTool('/tools/budget-calculator', BudgetCalculator);
    }

    // Category Shortcuts
    if (path === '/finance-tools' || path === '/calculators/finance') {
      return <FinanceToolsPage onNavigate={navigate} />;
    }
    if (path === '/calculators') {
      return <AllToolsPage onNavigate={navigate} initialCategory="calculators" />;
    }
    if (path === '/image-tools') {
      return <AllToolsPage onNavigate={navigate} initialCategory="image" />;
    }
    if (path === '/career-tools') {
      return <AllToolsPage onNavigate={navigate} initialCategory="career" />;
    }

    // Hub Pages
    if (path === '/tools') {
      return <AllToolsPage onNavigate={navigate} />;
    }
    if (path === '/student-tools') {
      return <StudentToolsPage onNavigate={navigate} />;
    }
    if (path === '/pdf-tools') {
      return <PdfToolsPage onNavigate={navigate} />;
    }

    // Blog
    if (path === '/blog') {
      return <BlogPage onNavigate={navigate} />;
    }
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return <BlogPostDetail slug={slug} onNavigate={navigate} />;
    }

    // Legal / Info
    if (path === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (path === '/contact') {
      return <ContactPage />;
    }
    if (path === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (path === '/terms') {
      return <TermsPage />;
    }
    if (path === '/disclaimer') {
      return <DisclaimerPage />;
    }

    // Default: Home Page
    return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
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
