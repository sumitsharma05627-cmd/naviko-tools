import React, { useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Award,
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

interface SourcesPageProps {
  onNavigate: (path: string) => void;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Editorial Standards & Scientific Sources — Evidence Framework | NAVIKO',
    description: 'Learn about NAVIKO\'s evidence-informed editorial standards, nutritional data sources (ICMR-NIN IFCT, USDA), classical Ayurvedic compendiums, and zero-compromise scientific integrity.',
    canonical: '/sources',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-[#16231C] dark:text-[#E8F0EC] transition-colors pb-24">
      <BreadcrumbNavigation
        items={[
          { label: 'Home', path: '/' },
          { label: 'Editorial Standards & Sources', path: '/sources', active: true }
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788]">
            <Award className="w-4 h-4" />
            <span>Integrity &amp; Scientific Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16231C] dark:text-white tracking-tight">
            Editorial Standards &amp; Authoritative Sources
          </h1>
          <p className="text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            At NAVIKO, our mission is to present nutrition science and traditional Ayurvedic knowledge responsibly. We do not promote sensationalist diet fads, miracle cure claims, or unregulated supplement sales. Every tool, meal plan, and botanical monograph is anchored in verifiable, peer-reviewed data.
          </p>
        </div>

        {/* Pillar 1: Nutritional Data Sources */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F1EC] dark:bg-[#1A2E23] flex items-center justify-center text-[#1B4332] dark:text-[#52B788]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#16231C] dark:text-white">
                1. Food Composition &amp; Nutritional Data
              </h2>
              <p className="text-xs text-[#7A8E82]">Primary scientific databases for Indian &amp; international ingredients</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            <p>
              Accurate nutritional analysis of Indian foods requires accounting for regional varieties, pulse cooking methods, moisture loss, and traditional tempering. Our Explorer and Calculator tools reference:
            </p>

            <ul className="space-y-3">
              <li className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637]">
                <strong className="text-[#16231C] dark:text-white">Indian Food Composition Tables (IFCT 2017) — ICMR–NIN:</strong>
                <p className="mt-1 text-xs text-[#586A60] dark:text-[#8FA799]">
                  Published by the National Institute of Nutrition (Hyderabad), Indian Council of Medical Research. The authoritative benchmark for 528 Indian key foods analyzed across 151 nutritional parameters using modern mass spectrometry.
                </p>
              </li>

              <li className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637]">
                <strong className="text-[#16231C] dark:text-white">Dietary Guidelines for Indians (2024 Revision) — ICMR–NIN:</strong>
                <p className="mt-1 text-xs text-[#586A60] dark:text-[#8FA799]">
                  Guidelines on recommended macronutrient distribution, sodium ceiling recommendations (&lt;5g salt/day), oil consumption, and protein adequacy.
                </p>
              </li>

              <li className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637]">
                <strong className="text-[#16231C] dark:text-white">FoodData Central — United States Department of Agriculture (USDA):</strong>
                <p className="mt-1 text-xs text-[#586A60] dark:text-[#8FA799]">
                  Used for standardized micronutrient benchmarks, amino acid profiling, and non-regional staple cross-validation.
                </p>
              </li>

              <li className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637]">
                <strong className="text-[#16231C] dark:text-white">FSSAI Packaging &amp; Labeling Regulations (2020):</strong>
                <p className="mt-1 text-xs text-[#586A60] dark:text-[#8FA799]">
                  Informs our Packaged Food &amp; INS Additives Decoder, ensuring transparency regarding permitted additive levels, Class II preservatives, and front-of-pack warning limits.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 2: Ayurvedic Knowledge Methodology */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F8F0E5] dark:bg-[#252219] flex items-center justify-center text-[#C26347]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#16231C] dark:text-white">
                2. Traditional Ayurvedic Knowledge Framework
              </h2>
              <p className="text-xs text-[#7A8E82]">Classical compendia &amp; contemporary botanical validation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            <p>
              Ayurveda is recognized in India by the Ministry of AYUSH as a formal system of medicine. However, online wellness discourse is plagued by dangerous oversimplifications and false "miracle cure" marketing. NAVIKO applies a strict 2-tier verification standard:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-1.5">
                <div className="font-bold text-[#16231C] dark:text-white text-xs">
                  Classical Literature Benchmark
                </div>
                <p className="text-xs text-[#586A60] dark:text-[#8FA799]">
                  Dravyaguna properties (Rasa, Guna, Virya, Vipaka, Prabhava) are referenced directly from the <strong>Charaka Samhita</strong>, <strong>Sushruta Samhita</strong>, and <strong>Ashtanga Hridaya</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-1.5">
                <div className="font-bold text-[#16231C] dark:text-white text-xs">
                  PubMed &amp; Clinical Evidence Review
                </div>
                <p className="text-xs text-[#586A60] dark:text-[#8FA799]">
                  Every therapeutic claim is cross-referenced with randomized controlled trials (RCTs), systematic Cochrane reviews, and toxicological safety profiles on NCBI/PubMed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Scientific Verdict Definitions */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-[#16231C] dark:text-white">
            3. Our Evidence Evaluation Rubric
          </h2>
          <p className="text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9]">
            In our Myth vs. Evidence section, every common wellness claim is assigned one of four unambiguous verdicts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
              <strong className="text-emerald-900 dark:text-emerald-200">Evidence Supports:</strong>
              <p className="text-emerald-950 dark:text-emerald-300">
                Replicated human clinical trials demonstrate statistically significant, clinically meaningful outcomes that align with biological mechanisms.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
              <strong className="text-amber-900 dark:text-amber-200">Early or Limited Evidence:</strong>
              <p className="text-amber-950 dark:text-amber-300">
                Plausible preclinical or small pilot studies exist, but high-powered multi-center human confirmation is lacking.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1">
              <strong className="text-blue-900 dark:text-blue-200">Evidence Is Mixed:</strong>
              <p className="text-blue-950 dark:text-blue-300">
                Credible studies show contradictory results depending on formulation, dosage, or population subtype.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
              <strong className="text-rose-900 dark:text-rose-200">Not Established:</strong>
              <p className="text-rose-950 dark:text-rose-300">
                No credible human evidence supports the claim, or well-controlled trials have demonstrated that the claim is incorrect.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 4: Zero Tracking & Privacy */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F1EC] dark:bg-[#1A2E23] flex items-center justify-center text-[#1B4332] dark:text-[#52B788]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#16231C] dark:text-white">
                4. User Privacy &amp; Data Ethics
              </h2>
              <p className="text-xs text-[#7A8E82]">Zero health profiling or telemetry data exploitation</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            Personal wellness logging is intimate. All daily logs (water intake, meal tracking, habits, saved foods, and custom routines) are stored locally on your device via HTML5 localStorage. NAVIKO does not harvest, monetize, or sell your health metrics to third-party ad brokers or insurance algorithms.
          </p>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-2 leading-relaxed">
            <h3 className="font-bold text-amber-900 dark:text-amber-100">
              Mandatory Healthcare Disclaimer
            </h3>
            <p>
              NAVIKO is an educational technology and informational wellness platform. The content, calculators, recipes, botanical monographs, and AI responses provided are not intended as medical advice, clinical diagnosis, or a treatment plan.
            </p>
            <p>
              Always consult a qualified physician, registered dietitian, or licensed Ayurvedic practitioner before modifying prescribed medications, undertaking severe caloric restriction, or beginning high-dose botanical supplementation, particularly if you are pregnant, nursing, elderly, or managing chronic conditions (such as diabetes, cardiovascular disease, or kidney disease).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
