import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  Search,
  ExternalLink,
  Flame,
  Droplet,
  Sun,
  Moon,
  ShieldAlert,
  Leaf,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Copy,
  Printer,
  Calendar,
  Share2
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import {
  AYURVEDA_HERBS,
  AYURVEDA_SCIENCE_ARTICLES,
  MYTH_VS_EVIDENCE_DATABASE,
  DINACHARYA_ROUTINE_STEPS,
  AyurvedaHerb,
  AyurvedaScienceArticle,
  MythVsEvidenceItem,
  DinacharyaRoutineStep
} from '../data/ayurvedaData';

interface AyurvedaHubPageProps {
  onNavigate: (path: string) => void;
}

export const AyurvedaHubPage: React.FC<AyurvedaHubPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'herbs' | 'articles' | 'myths' | 'dinacharya'>('herbs');
  const [herbSearch, setHerbSearch] = useState('');
  const [selectedHerbCategory, setSelectedHerbCategory] = useState<string>('all');
  const [selectedHerb, setSelectedHerb] = useState<AyurvedaHerb | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<AyurvedaScienceArticle | null>(null);

  // Myth vs Evidence filter states
  const [mythSearch, setMythSearch] = useState('');
  const [mythCategory, setMythCategory] = useState<string>('all');
  const [selectedMyth, setSelectedMyth] = useState<MythVsEvidenceItem | null>(null);

  // Dinacharya Interactive Builder states
  const [wakeUpTime, setWakeUpTime] = useState<string>('06:00');
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>(
    DINACHARYA_ROUTINE_STEPS.map((s) => s.id)
  );
  const [copiedRoutine, setCopiedRoutine] = useState(false);

  useSEO({
    title: 'Ayurveda & Nutrition Science Knowledge Hub — Evidence Meets Tradition | NAVIKO',
    description: 'Explore traditional Ayurvedic herbs, Ahara Vidhi, Dinacharya routine builder, and myth vs modern clinical evidence reviews. Sourced with ICMR-NIN, Charaka Samhita, and PubMed references.',
    canonical: '/ayurveda',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filter botanicals
  const filteredHerbs = AYURVEDA_HERBS.filter((herb) => {
    const matchesSearch =
      herbSearch.trim() === '' ||
      herb.name.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.hindiName.includes(herbSearch) ||
      herb.botanicalName.toLowerCase().includes(herbSearch.toLowerCase()) ||
      herb.shortSummary.toLowerCase().includes(herbSearch.toLowerCase());

    const matchesCat = selectedHerbCategory === 'all' || herb.category === selectedHerbCategory;
    return matchesSearch && matchesCat;
  });

  // Filter myths
  const filteredMyths = MYTH_VS_EVIDENCE_DATABASE.filter((item) => {
    const matchesSearch =
      mythSearch.trim() === '' ||
      item.claim.toLowerCase().includes(mythSearch.toLowerCase()) ||
      item.whatModernEvidenceShows.toLowerCase().includes(mythSearch.toLowerCase()) ||
      item.whatTraditionSays.toLowerCase().includes(mythSearch.toLowerCase());

    const matchesCat = mythCategory === 'all' || item.category === mythCategory;
    return matchesSearch && matchesCat;
  });

  // Helper to calculate clock time from wakeUpTime + offsetHours
  const calculateTimelineHour = (wakeTimeStr: string, offsetHours: number) => {
    const [wakeH, wakeM] = wakeTimeStr.split(':').map(Number);
    const totalMinutes = wakeH * 60 + wakeM + Math.round(offsetHours * 60);
    const normalizedMins = ((totalMinutes % 1440) + 1440) % 1440;
    const hours24 = Math.floor(normalizedMins / 60);
    const mins = normalizedMins % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const toggleStepSelection = (stepId: string) => {
    if (selectedStepIds.includes(stepId)) {
      setSelectedStepIds(selectedStepIds.filter((id) => id !== stepId));
    } else {
      setSelectedStepIds([...selectedStepIds, stepId]);
    }
  };

  const copyRoutineToClipboard = () => {
    const selectedSteps = DINACHARYA_ROUTINE_STEPS.filter((s) => selectedStepIds.includes(s.id));
    const lines = [
      `NAVIKO Dinacharya (Circadian Wellness Routine)`,
      `Wake-up Time: ${wakeUpTime}`,
      `--------------------------------------------`,
      ...selectedSteps.map((step) => {
        const timeStr = calculateTimelineHour(wakeUpTime, step.suggestedOffsetHoursFromWake);
        return `[${timeStr}] ${step.name} (${step.durationMins} mins)\n• ${step.description}\n`;
      }),
      `Generated on https://naviko.in - Science Meets Tradition.`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedRoutine(true);
    setTimeout(() => setCopiedRoutine(false), 3000);
  };

  const getVerdictBadge = (verdict: MythVsEvidenceItem['verdict']) => {
    switch (verdict) {
      case 'Evidence supports':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Evidence Supports</span>
          </span>
        );
      case 'Early or limited evidence':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Early / Limited Evidence</span>
          </span>
        );
      case 'Evidence is mixed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Info className="w-3.5 h-3.5" />
            <span>Evidence Is Mixed</span>
          </span>
        );
      case 'Not established':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Established</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-[#16231C] dark:text-[#E8F0EC] transition-colors pb-24">
      <BreadcrumbNavigation
        items={[
          { label: 'Home', path: '/' },
          { label: 'Ayurveda Knowledge Hub', path: '/ayurveda', active: true }
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Banner */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-2">
            <span>Evidence-Informed Traditional Knowledge</span>
            <span aria-hidden="true">·</span>
            <span>Science Meets Tradition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16231C] dark:text-white tracking-tight">
            Ayurveda &amp; Nutrition Science Hub
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            Discover the botanical wisdom of Indian herbs, spices, and dietary traditions. We separate clinical evidence from traditional lore, highlight safety warnings, and present classical and modern citations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F2ECE4] dark:bg-[#13221A] rounded-2xl max-w-3xl mb-10 border border-[#E8E2D9] dark:border-[#22382C] overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('herbs');
              setSelectedArticle(null);
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'herbs'
                ? 'bg-[#1B4332] text-white shadow-xs dark:bg-[#2D6A4F]'
                : 'text-[#4D6156] dark:text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white'
            }`}
          >
            <Leaf className="w-4 h-4 shrink-0" />
            <span>Herbs &amp; Spices ({AYURVEDA_HERBS.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('articles');
              setSelectedHerb(null);
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'articles'
                ? 'bg-[#1B4332] text-white shadow-xs dark:bg-[#2D6A4F]'
                : 'text-[#4D6156] dark:text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Science Articles</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('myths');
              setSelectedHerb(null);
              setSelectedArticle(null);
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'myths'
                ? 'bg-[#1B4332] text-white shadow-xs dark:bg-[#2D6A4F]'
                : 'text-[#4D6156] dark:text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Myth vs Evidence ({MYTH_VS_EVIDENCE_DATABASE.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('dinacharya');
              setSelectedHerb(null);
              setSelectedArticle(null);
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'dinacharya'
                ? 'bg-[#1B4332] text-white shadow-xs dark:bg-[#2D6A4F]'
                : 'text-[#4D6156] dark:text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 shrink-0" />
            <span>Daily Routine</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: HERBS & SPICES EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'herbs' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8E82]" />
                <input
                  type="text"
                  value={herbSearch}
                  onChange={(e) => setHerbSearch(e.target.value)}
                  placeholder="Search botanical profiles (e.g. Turmeric, Amla, Ginger, Ashwagandha, Tulsi)..."
                  className="w-full pl-12 pr-10 py-3.5 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl border border-[#D5CCC0] dark:border-[#2B4637] text-sm text-[#16231C] dark:text-white placeholder-[#7A8E82] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#52B788]"
                />
                {herbSearch && (
                  <button
                    onClick={() => setHerbSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#7A8E82] hover:text-[#16231C] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Botanicals' },
                  { id: 'spice', label: 'Spices' },
                  { id: 'herb', label: 'Herbs & Leaves' },
                  { id: 'root', label: 'Roots & Rhizomes' },
                  { id: 'fruit', label: 'Fruits' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedHerbCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                      selectedHerbCategory === cat.id
                        ? 'bg-[#1B4332] text-white dark:bg-[#2D6A4F]'
                        : 'bg-[#F2ECE4] dark:bg-[#1A2E23] text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#E8E0D5] dark:hover:bg-[#233B2E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHerbs.map((herb) => (
                <div
                  key={herb.id}
                  onClick={() => setSelectedHerb(herb)}
                  className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-lg font-bold text-[#16231C] dark:text-white group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                          {herb.name}
                        </h3>
                        <span className="text-xs font-semibold text-[#586A60] dark:text-[#8FA799]">
                          {herb.hindiName}
                        </span>
                      </div>
                      <div className="text-xs italic text-[#7A8E82] font-serif mt-0.5">
                        {herb.botanicalName}
                      </div>
                    </div>

                    <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed line-clamp-2">
                      {herb.shortSummary}
                    </p>

                    <div className="p-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl text-[11px] text-[#4D6156] dark:text-[#9FB7A9] space-y-1">
                      <div>
                        <strong>Virya (Potency): </strong>
                        <span>{herb.ayurvedicEnergetics.virya}</span>
                      </div>
                      <div>
                        <strong>Dosha: </strong>
                        <span className="line-clamp-1">{herb.ayurvedicEnergetics.doshaEffect}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2ECE4] dark:border-[#22382C] flex items-center justify-between text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">
                    <span>View Scientific Profile</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AYURVEDA SCIENCE ARTICLES */}
        {/* ========================================================================= */}
        {activeTab === 'articles' && (
          <div className="space-y-8">
            {selectedArticle ? (
              <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-10 shadow-xs space-y-8">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-xs font-bold text-[#1B4332] dark:text-[#52B788] hover:underline cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Back to all articles</span>
                </button>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#586A60] dark:text-[#8FA799]">
                    <span className="font-semibold text-[#1B4332] dark:text-[#52B788]">{selectedArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedArticle.readTime}</span>
                    <span aria-hidden="true">·</span>
                    <span>Reviewed: {selectedArticle.publishedDate}</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#16231C] dark:text-white leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                    {selectedArticle.subtitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] text-xs text-[#586A60] dark:text-[#8FA799]">
                  <strong>Editorial Note: </strong>
                  Reviewed by {selectedArticle.reviewedBy}. Sourced through classical Ayurvedic Samhitas and peer-reviewed modern trials.
                </div>

                <div className="space-y-6">
                  {selectedArticle.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[#16231C] dark:text-white">
                        {section.heading}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-white dark:bg-[#13221A] border border-[#E8E2D9] dark:border-[#22382C] space-y-1.5">
                          <div className="font-bold text-[#1B4332] dark:text-[#52B788] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Modern Physiological Science</span>
                          </div>
                          <p className="text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                            {section.modernScience}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-[#13221A] border border-[#E8E2D9] dark:border-[#22382C] space-y-1.5">
                          <div className="font-bold text-[#C26347] flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Classical Ayurvedic Wisdom</span>
                          </div>
                          <p className="text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                            {section.ayurvedicTradition}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-[#2D6A4F] dark:text-[#52B788] font-medium">
                        {section.evidenceEvaluation}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedArticle.references && selectedArticle.references.length > 0 && (
                  <div className="pt-6 border-t border-[#F2ECE4] dark:border-[#22382C] space-y-2">
                    <h4 className="text-xs font-bold text-[#16231C] dark:text-white uppercase tracking-wider">
                      Authoritative Sources &amp; Citations
                    </h4>
                    <ul className="text-xs text-[#7A8E82] space-y-1">
                      {selectedArticle.references.map((ref, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span>•</span>
                          <span>{ref.citation} — {ref.organization}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AYURVEDA_SCIENCE_ARTICLES.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#586A60] dark:text-[#8FA799]">
                        <span className="font-semibold text-[#1B4332] dark:text-[#52B788]">{article.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#16231C] dark:text-white group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed line-clamp-3">
                        {article.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F2ECE4] dark:border-[#22382C] flex items-center justify-between text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">
                      <span>Read Evidence Review</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MYTH VS EVIDENCE */}
        {/* ========================================================================= */}
        {activeTab === 'myths' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8E82]" />
                <input
                  type="text"
                  value={mythSearch}
                  onChange={(e) => setMythSearch(e.target.value)}
                  placeholder="Search popular health claims (e.g. honey lemon water, raw salad, ashwagandha, milk and fish)..."
                  className="w-full pl-12 pr-10 py-3.5 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl border border-[#D5CCC0] dark:border-[#2B4637] text-sm text-[#16231C] dark:text-white placeholder-[#7A8E82] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#52B788]"
                />
                {mythSearch && (
                  <button
                    onClick={() => setMythSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#7A8E82] hover:text-[#16231C] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'Fat Loss & Metabolism', label: 'Weight & Metabolism' },
                  { id: 'Herbal Medicine', label: 'Herbs & Botanicals' },
                  { id: 'Digestion & Gut', label: 'Digestion & Gut' },
                  { id: 'Food Combinations', label: 'Food Combinations' },
                  { id: 'Sleep & Circadian', label: 'Circadian Biology' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setMythCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                      mythCategory === cat.id
                        ? 'bg-[#1B4332] text-white dark:bg-[#2D6A4F]'
                        : 'bg-[#F2ECE4] dark:bg-[#1A2E23] text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#E8E0D5] dark:hover:bg-[#233B2E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Claims Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMyths.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-7 shadow-xs space-y-4 hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold text-[#586A60] dark:text-[#8FA799] uppercase tracking-wider">
                      {item.category}
                    </span>
                    {getVerdictBadge(item.verdict)}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#16231C] dark:text-white leading-snug">
                    "{item.claim}"
                  </h3>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-1">
                      <div className="text-xs font-bold text-[#1B4332] dark:text-[#52B788]">
                        What Modern Clinical Science Shows
                      </div>
                      <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                        {item.whatModernEvidenceShows}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F8F5EE] dark:bg-[#16281F] border border-[#E8E2D9] dark:border-[#22382C] space-y-1">
                      <div className="text-xs font-bold text-[#C26347]">
                        What Traditional Texts Actually State
                      </div>
                      <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                        {item.whatTraditionSays}
                      </p>
                    </div>

                    <div className="text-xs text-[#586A60] dark:text-[#8FA799] pt-1">
                      <strong className="text-[#16231C] dark:text-white">Scientific Nuance: </strong>
                      {item.nuanceAndLimitations}
                    </div>
                  </div>

                  {item.references && item.references.length > 0 && (
                    <div className="pt-3 border-t border-[#F2ECE4] dark:border-[#22382C] text-[11px] text-[#7A8E82] space-y-0.5">
                      <div className="font-semibold text-[#586A60] dark:text-[#8FA799]">Citations:</div>
                      {item.references.map((ref, idx) => (
                        <div key={idx}>• {ref}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTERACTIVE DINACHARYA ROUTINE BUILDER */}
        {/* ========================================================================= */}
        {activeTab === 'dinacharya' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Intro & Controls */}
            <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mb-1">
                    Interactive Chronobiology Tool
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#16231C] dark:text-white">
                    Personalized Dinacharya Builder
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#4D6156] dark:text-[#9FB7A9] max-w-xl leading-relaxed">
                    Set your morning waking time. We calculate your customized circadian timeline matching classical Ayurvedic doshic peaks with biological cortisol and melatonin shifts.
                  </p>
                </div>

                {/* Wake-up time input */}
                <div className="p-4 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl border border-[#D5CCC0] dark:border-[#2B4637] flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#2D6A4F] dark:text-[#52B788]" />
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8E82]">
                      Your Wake-Up Time
                    </label>
                    <input
                      type="time"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value || '06:00')}
                      className="text-base font-bold text-[#16231C] dark:text-white bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#F2ECE4] dark:border-[#22382C]">
                <div className="text-xs text-[#586A60] dark:text-[#8FA799]">
                  <strong>{selectedStepIds.length}</strong> of {DINACHARYA_ROUTINE_STEPS.length} practices selected
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyRoutineToClipboard}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1A2E23] hover:bg-[#F2ECE4] dark:hover:bg-[#233B2E] text-xs font-bold text-[#16231C] dark:text-white border border-[#D5CCC0] dark:border-[#2B4637] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedRoutine ? 'Copied to Clipboard!' : 'Copy Routine'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Routine</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Circadian Timeline */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#16231C] dark:text-white">
                Your 24-Hour Circadian Schedule
              </h3>

              <div className="space-y-3">
                {DINACHARYA_ROUTINE_STEPS.map((step) => {
                  const isSelected = selectedStepIds.includes(step.id);
                  const scheduledTime = calculateTimelineHour(wakeUpTime, step.suggestedOffsetHoursFromWake);

                  return (
                    <div
                      key={step.id}
                      onClick={() => toggleStepSelection(step.id)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-white dark:bg-[#13221A] border-[#1B4332] dark:border-[#52B788] shadow-xs'
                          : 'bg-[#F2ECE4]/60 dark:bg-[#13221A]/50 border-transparent opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] text-white'
                              : 'border-[#A3B8AD] bg-white dark:bg-[#1A2E23]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#16231C] dark:text-white">
                              {step.name}
                            </span>
                            <span className="text-xs text-[#7A8E82] font-serif">
                              {step.sanskritName}
                            </span>
                          </div>

                          <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed max-w-xl">
                            {step.description}
                          </p>

                          <div className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] italic">
                            {step.ayurvedicReference}
                          </div>
                        </div>
                      </div>

                      {/* Right pill: Calculated time */}
                      <div className="shrink-0 text-left sm:text-right pl-10 sm:pl-0">
                        <div className="text-sm font-black text-[#1B4332] dark:text-[#52B788]">
                          {scheduledTime}
                        </div>
                        <div className="text-[11px] text-[#7A8E82]">
                          ~{step.durationMins} mins · {step.phase}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Herb Details */}
        {selectedHerb && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-1">
                    <span>{selectedHerb.category.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedHerb.family}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#16231C] dark:text-white">
                    {selectedHerb.name}
                  </h2>
                  <div className="text-xs sm:text-sm font-medium text-[#586A60] dark:text-[#8FA799] mt-0.5">
                    {selectedHerb.hindiName} · {selectedHerb.sanskritName} · <span className="italic">{selectedHerb.botanicalName}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedHerb(null)}
                  className="p-2 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#1A2E23] text-[#7A8E82] hover:text-[#16231C] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Energetics */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-2 text-xs">
                <div className="font-bold text-[#1B4332] dark:text-[#52B788]">
                  Ayurvedic Energetics (Dravyaguna)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#4D6156] dark:text-[#9FB7A9]">
                  <div><strong>Rasa (Taste):</strong> {selectedHerb.ayurvedicEnergetics.rasa.join(', ')}</div>
                  <div><strong>Virya (Potency):</strong> {selectedHerb.ayurvedicEnergetics.virya}</div>
                  <div><strong>Vipaka (Post-digestive):</strong> {selectedHerb.ayurvedicEnergetics.vipaka}</div>
                  <div><strong>Dosha Effect:</strong> {selectedHerb.ayurvedicEnergetics.doshaEffect}</div>
                </div>
              </div>

              {/* Modern Science */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#16231C] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Modern Pharmacological Evidence</span>
                </h4>
                <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
                  {selectedHerb.modernResearchSummary}
                </p>
                <div className="text-xs text-[#7A8E82] italic">
                  <strong>Limitations: </strong> {selectedHerb.evidenceLimitations}
                </div>
              </div>

              {/* Contraindications */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Safety Contraindications &amp; Warnings</span>
                </div>
                <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-1 list-disc pl-4">
                  {selectedHerb.contraindicationsAndWarnings.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedHerb(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Responsible Safety Notice */}
        <div className="mt-12 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-6 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1 leading-relaxed">
            <h4 className="font-bold text-amber-900 dark:text-amber-100">
              Responsible Traditional Knowledge &amp; Regulatory Note
            </h4>
            <p>
              The articles and botanical profiles on NAVIKO are provided for educational review and cultural appreciation. They do not constitute clinical prescribing or diagnostic medical advice. Ayurvedic herbs should not replace prescribed medications for cardiovascular diseases, diabetes, oncology, or acute infections. Always discuss botanical supplements with your licensed healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
