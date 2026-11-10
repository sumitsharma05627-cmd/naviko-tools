import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VersionProvider } from './context/VersionContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CurrencyBanner } from './components/ui/CurrencyBanner';
import { HomePage } from './pages/HomePage';
import { HomePageV1 } from './pages/HomePageV1';
import { HomePageV2 } from './pages/HomePageV2';
import { getToolByPath } from './data/toolsData';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Ambient3DBackground } from './components/3d/Ambient3DBackground';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { syncAdSenseRoutePolicy } from './config/adPolicy';

// AdPolicyWatcher synchronizes route and active paid subscription state with Google AdSense
const AdPolicyWatcher: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const { isAdFree } = useSubscription();

  useEffect(() => {
    syncAdSenseRoutePolicy(currentPath, isAdFree);
  }, [currentPath, isAdFree]);

  return null;
};


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

// Lazy Loaded Secondary & Monetization Pages
const PremiumPage = lazy(() => import('./pages/PremiumPage').then(m => ({ default: m.PremiumPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));

// Lazy Loaded Auth & User Dashboard Pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));

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

// Health & Wellness Tools
const BmiCalculator = lazy(() => import('./components/tools/BmiCalculator').then(m => ({ default: m.BmiCalculator })));
const DietPlanManager = lazy(() => import('./components/tools/DietPlanManager').then(m => ({ default: m.DietPlanManager })));
const NutritionScience = lazy(() => import('./components/tools/NutritionScience').then(m => ({ default: m.NutritionScience })));

// NAVIKO 2.0 Wellness & Nutrition Pages
const FoodExplorerPage = lazy(() => import('./pages/FoodExplorerPage').then(m => ({ default: m.FoodExplorerPage })));
const MealPlannerPage = lazy(() => import('./pages/MealPlannerPage').then(m => ({ default: m.MealPlannerPage })));
const AyurvedaHubPage = lazy(() => import('./pages/AyurvedaHubPage').then(m => ({ default: m.AyurvedaHubPage })));
const HabitTrackerPage = lazy(() => import('./pages/HabitTrackerPage').then(m => ({ default: m.HabitTrackerPage })));
const WellnessCalculatorsPage = lazy(() => import('./pages/WellnessCalculatorsPage').then(m => ({ default: m.WellnessCalculatorsPage })));
const FoodComparisonPage = lazy(() => import('./pages/FoodComparisonPage').then(m => ({ default: m.FoodComparisonPage })));
const LabelAnalyzerPage = lazy(() => import('./pages/LabelAnalyzerPage').then(m => ({ default: m.LabelAnalyzerPage })));
const RecipeExplorerPage = lazy(() => import('./pages/RecipeExplorerPage').then(m => ({ default: m.RecipeExplorerPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then(m => ({ default: m.SourcesPage })));

// NAVIKO 3.0 Vedic Astrology & Vastu Pages
const HomePageV3 = lazy(() => import('./pages/HomePageV3').then(m => ({ default: m.HomePageV3 })));
const KundliPage = lazy(() => import('./pages/KundliPage').then(m => ({ default: m.KundliPage })));
const VastuPage = lazy(() => import('./pages/VastuPage').then(m => ({ default: m.VastuPage })));
const PanchangPage = lazy(() => import('./pages/PanchangPage').then(m => ({ default: m.PanchangPage })));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage').then(m => ({ default: m.NumerologyPage })));
const NaviAiPage = lazy(() => import('./pages/NaviAiPage').then(m => ({ default: m.NaviAiPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

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
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage').then(m => ({ default: m.WaitlistPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

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
  'bmi-calculator': BmiCalculator,
  'bmi': BmiCalculator,
  'diet-plan-manager': DietPlanManager,
  'diet-plan': DietPlanManager,
  'nutrition-science': NutritionScience,
  'nutrition': NutritionScience,
};

// Tool Runner with automatic recent tool tracking
interface ToolWrapperProps {
  toolMeta: any;
  Component: React.ComponentType<any>;
  navigate: (path: string) => void;
}

const ToolWrapper: React.FC<ToolWrapperProps> = ({ toolMeta, Component, navigate }) => {
  const { recordToolUsage } = useAuth();

  useEffect(() => {
    if (toolMeta?.id) {
      recordToolUsage(toolMeta.id);
    }
  }, [toolMeta?.id, recordToolUsage]);

  return (
    <ToolLayout tool={toolMeta} onNavigate={navigate}>
      <Component />
    </ToolLayout>
  );
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

  useEffect(() => {
    syncAdSenseRoutePolicy(currentPath);
  }, [currentPath]);

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
      <ToolWrapper
        toolMeta={toolMeta}
        Component={Component}
        navigate={navigate}
      />
    );
  };

  // Route matching
  const renderContent = () => {
    const rawPath = currentPath.toLowerCase().trim();
    const path = rawPath.replace(/\/$/, '') || '/';

    // 1. Home Routes & Version Specific URLs
    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }
    if (path === '/v1' || path === '/original') {
      return <HomePageV1 onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }
    if (path === '/v2' || path === '/nutrition') {
      return <HomePageV2 onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }
    if (path === '/v3' || path === '/astrology-hub') {
      return <HomePageV3 onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    // 1.0 NAVIKO 3.0 Vedic Astrology & Vastu Routes
    if (path === '/kundli' || path === '/my-kundli' || path === '/birth-chart') {
      return <KundliPage onNavigate={navigate} />;
    }
    if (path === '/astrology' || path === '/jyotish') {
      return <KundliPage onNavigate={navigate} />;
    }
    if (path === '/vastu' || path === '/vastu-shastra' || path === '/floor-plan') {
      return <VastuPage onNavigate={navigate} />;
    }
    if (path === '/panchang' || path === '/muhurat' || path === '/choghadiya') {
      return <PanchangPage onNavigate={navigate} />;
    }
    if (path === '/numerology' || path === '/life-path') {
      return <NumerologyPage onNavigate={navigate} />;
    }
    if (path === '/navi-ai' || path === '/ai-astrologer' || path === '/navi-astrology') {
      return <NaviAiPage onNavigate={navigate} />;
    }
    if (path === '/reports' || path === '/kundli-report' || path === '/vastu-report') {
      return <ReportsPage onNavigate={navigate} />;
    }

    // 1.1 NAVIKO 2.0 Core Wellness & Nutrition Pillars
    if (path === '/food-explorer' || path === '/nutrition-explorer' || path === '/foods') {
      return <FoodExplorerPage onNavigate={navigate} />;
    }
    if (path === '/food-compare' || path === '/compare-foods' || path === '/nutrition-compare') {
      return <FoodComparisonPage onNavigate={navigate} />;
    }
    if (path === '/label-analyzer' || path === '/food-label-analyzer' || path === '/ins-decoder') {
      return <LabelAnalyzerPage onNavigate={navigate} />;
    }
    if (path === '/recipes' || path === '/healthy-recipes' || path === '/indian-recipes') {
      return <RecipeExplorerPage onNavigate={navigate} />;
    }
    if (path === '/sources' || path === '/editorial-standards' || path === '/evidence-standards') {
      return <SourcesPage onNavigate={navigate} />;
    }
    if (path === '/meal-planner' || path === '/diet-planner') {
      return <MealPlannerPage onNavigate={navigate} />;
    }
    if (path === '/ayurveda' || path === '/ayurveda-hub' || path === '/herbs') {
      return <AyurvedaHubPage onNavigate={navigate} />;
    }
    if (path === '/habit-tracker' || path === '/habits' || path === '/daily-habits') {
      return <HabitTrackerPage />;
    }
    if (path === '/wellness-calculators' || path === '/health-calculators' || path === '/wellness') {
      return <WellnessCalculatorsPage />;
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
    if (path === '/health-tools') {
      return <AllToolsPage onNavigate={navigate} initialCategory="health" />;
    }

    // 2.1 Monetization & Account Routes
    if (path === '/pricing' || path === '/plans' || path === '/upgrade') {
      return <PricingPage onNavigate={navigate} />;
    }
    if (path === '/v1/pricing' || path === '/pricing/v1' || path === '/original/pricing') {
      return <PricingPage onNavigate={navigate} defaultVersion="v1" />;
    }
    if (path === '/v2/pricing' || path === '/pricing/v2' || path === '/nutrition/pricing') {
      return <PricingPage onNavigate={navigate} defaultVersion="v2" />;
    }
    if (path === '/v3/pricing' || path === '/pricing/v3' || path === '/astrology/pricing') {
      return <PricingPage onNavigate={navigate} defaultVersion="v3" />;
    }
    if (path === '/premium' || path === '/pro') {
      return <PricingPage onNavigate={navigate} />;
    }
    if (path === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }
    if (path === '/waitlist' || path === '/early-access') {
      return <WaitlistPage onNavigate={navigate} />;
    }
    if (path === '/admin' || path === '/operations') {
      return <AdminPage onNavigate={navigate} />;
    }
    if (path === '/account' || path === '/subscription' || path === '/my-plan') {
      return <AccountPage onNavigate={navigate} />;
    }

    // 2.2 Auth & User Dashboard Routes
    if (path === '/login' || path === '/signin') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (path === '/signup' || path === '/register') {
      return <SignupPage onNavigate={navigate} />;
    }
    if (path === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }
    if (path === '/reset-password') {
      return <ResetPasswordPage onNavigate={navigate} />;
    }
    if (path === '/dashboard' || path === '/user-dashboard' || path === '/home-dashboard') {
      return (
        <DashboardPage
          onNavigate={navigate}
          onOpenPricing={() => navigate('/premium')}
          onOpenTool={(toolId) => {
            const tool = getToolByPath(`/tools/${toolId}`) || getToolByPath(`/tool/${toolId}`);
            if (tool) navigate(tool.path);
            else navigate(`/tools/${toolId}`);
          }}
        />
      );
    }
    if (path === '/profile' || path === '/user-profile') {
      return <ProfilePage onNavigate={navigate} />;
    }
    if (path === '/settings' || path === '/account-settings') {
      return <SettingsPage onNavigate={navigate} />;
    }
    if (path === '/billing' || path === '/invoices') {
      return <BillingPage onNavigate={navigate} onOpenPricing={() => navigate('/premium')} />;
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
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <SubscriptionProvider>
              <VersionProvider>
                <AdPolicyWatcher currentPath={currentPath} />
                <div
                  className="min-h-screen flex flex-col transition-colors duration-200 selection:bg-indigo-500 selection:text-white relative"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                >
                  <Ambient3DBackground />
                  <CurrencyBanner />
                  <Header
                    onNavigate={navigate}
                    onOpenSearch={() => setIsSearchOpen(true)}
                    currentPath={currentPath}
                  />

                  <main className="flex-1">
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoadingFallback />}>
                        {renderContent()}
                      </Suspense>
                    </ErrorBoundary>
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

                  <CookieConsentBanner onNavigate={navigate} />
                </div>
              </VersionProvider>
            </SubscriptionProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
