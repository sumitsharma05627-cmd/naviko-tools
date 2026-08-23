import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Globe,
  DollarSign,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Users,
  Activity,
  Award,
  BarChart3,
  Search,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ArrowUpRight,
  TrendingDown,
  Scale
} from 'lucide-react';

interface CountryDebtData {
  id: string;
  name: string;
  code: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  usdExchangeRate: number; // 1 USD = X Local Currency
  eurExchangeRate: number; // 1 EUR = X Local Currency
  // Baseline at Jan 1, 2026 (Local Currency)
  baselineTimestamp: number;
  baseDebtLocal: number;
  // Annual growth in local currency (Fiscal deficit / sovereign borrowing)
  annualGrowthRateLocal: number;
  // Interest rate on sovereign debt (%)
  avgInterestRatePercent: number;
  // GDP in local currency
  annualGdpLocal: number;
  // Population
  population: number;
  // Taxpayer / workforce count
  taxpayers: number;
  // Key source info
  debtCategory: 'Critical (>120%)' | 'High (80-120%)' | 'Moderate (50-80%)' | 'Low (<50%)';
  notes: string;
  equivalents: {
    label: string;
    costLocal: number;
    unit: string;
  }[];
}

const COUNTRIES_DEBT_DB: CountryDebtData[] = [
  {
    id: 'india',
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    usdExchangeRate: 83.5,
    eurExchangeRate: 91.2,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 185400000000000, // ₹185.4 Lakh Crores (General Govt Debt - Centre + States)
    annualGrowthRateLocal: 17300000000000, // ~₹17.3 Lakh Crores / year deficit (~₹54,800/sec)
    avgInterestRatePercent: 7.1, // Average cost of sovereign borrowing
    annualGdpLocal: 326000000000000, // ~₹326 Lakh Crores Nominal GDP (~$3.9 Trillion)
    population: 1440000000,
    taxpayers: 92000000, // Income tax filers
    debtCategory: 'High (80-120%)',
    notes: 'Includes combined Central and State Governments general gross debt according to Ministry of Finance & RBI fiscal monitors.',
    equivalents: [
      { label: 'Chandrayaan-3 Moon Missions (₹615 Cr each)', costLocal: 6150000000, unit: 'missions' },
      { label: 'Expressway Highways (₹30 Cr per km)', costLocal: 300000000, unit: 'km of 8-lane expressway' },
      { label: 'AI Supercomputer Centers (₹1,000 Cr each)', costLocal: 10000000000, unit: 'supercomputing hubs' }
    ]
  },
  {
    id: 'usa',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    usdExchangeRate: 1,
    eurExchangeRate: 1.09,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 35200000000000, // $35.2 Trillion
    annualGrowthRateLocal: 2050000000000, // ~$2.05 Trillion annual federal deficit (~$65,000/sec)
    avgInterestRatePercent: 3.3,
    annualGdpLocal: 28400000000000, // ~$28.4 Trillion GDP
    population: 337000000,
    taxpayers: 154000000,
    debtCategory: 'Critical (>120%)',
    notes: 'Total public debt outstanding tracked by US Treasury Bureau of the Fiscal Service.',
    equivalents: [
      { label: 'Aircraft Carriers ($13B Ford-Class)', costLocal: 13000000000, unit: 'supercarriers' },
      { label: 'Apollo-scale Space Programs ($150B)', costLocal: 150000000000, unit: 'space programs' },
      { label: '100% Free US College Tuition for all (10 yrs)', costLocal: 800000000000, unit: 'decade programs' }
    ]
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    currencySymbol: '¥',
    currencyCode: 'JPY',
    usdExchangeRate: 154.5,
    eurExchangeRate: 168.0,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 1310000000000000, // ¥1,310 Trillion JPY
    annualGrowthRateLocal: 31000000000000, // ¥31 Trillion / yr
    avgInterestRatePercent: 0.8, // Low JGB yield environment
    annualGdpLocal: 595000000000000, // ~¥595 Trillion
    population: 124000000,
    taxpayers: 59000000,
    debtCategory: 'Critical (>120%)',
    notes: 'World highest debt-to-GDP among major economies, heavily held domestically by Bank of Japan and pension funds.',
    equivalents: [
      { label: 'Shinkansen Bullet Train Lines (¥1.5T)', costLocal: 1500000000000, unit: 'bullet train lines' },
      { label: 'Tokyo Olympic Arenas (¥300B)', costLocal: 300000000000, unit: 'mega stadiums' }
    ]
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    usdExchangeRate: 0.79,
    eurExchangeRate: 0.86,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 2750000000000, // £2.75 Trillion
    annualGrowthRateLocal: 120000000000, // £120 Billion / yr
    avgInterestRatePercent: 4.2,
    annualGdpLocal: 2790000000000, // ~£2.79 Trillion
    population: 68500000,
    taxpayers: 33000000,
    debtCategory: 'High (80-120%)',
    notes: 'Public sector net debt excluding public sector banks, monitored by UK Office for National Statistics (ONS).',
    equivalents: [
      { label: 'NHS Annual Budget (£180B)', costLocal: 180000000000, unit: 'years of entire NHS healthcare' },
      { label: 'HS2 High Speed Rail Projects (£65B)', costLocal: 65000000000, unit: 'mega high-speed rail networks' }
    ]
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    currencySymbol: '€',
    currencyCode: 'EUR',
    usdExchangeRate: 0.92,
    eurExchangeRate: 1.0,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 2640000000000, // €2.64 Trillion
    annualGrowthRateLocal: 75000000000, // €75 Billion / yr
    avgInterestRatePercent: 2.6,
    annualGdpLocal: 4180000000000, // ~€4.18 Trillion
    population: 84400000,
    taxpayers: 42000000,
    debtCategory: 'Moderate (50-80%)',
    notes: 'Constitutionally bound by Schuldenbremse (Debt Brake) rules keeping Debt-to-GDP comparatively low in the Eurozone.',
    equivalents: [
      { label: 'Offshore Wind Mega Farms (€4B)', costLocal: 4000000000, unit: 'clean wind power parks' },
      { label: 'Berlin Airport scale megaprojects (€7B)', costLocal: 7000000000, unit: 'international airports' }
    ]
  },
  {
    id: 'china',
    name: 'China',
    code: 'CN',
    flag: '🇨🇳',
    currencySymbol: '¥',
    currencyCode: 'CNY',
    usdExchangeRate: 7.23,
    eurExchangeRate: 7.89,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 93500000000000, // ~¥93.5 Trillion CNY General Govt
    annualGrowthRateLocal: 7200000000000, // ~¥7.2 Trillion / yr
    avgInterestRatePercent: 2.8,
    annualGdpLocal: 130000000000000, // ~¥130 Trillion
    population: 1410000000,
    taxpayers: 280000000,
    debtCategory: 'Moderate (50-80%)',
    notes: 'Official general government debt as reported by Ministry of Finance. Excludes unofficial Local Government Financing Vehicles (LGFV).',
    equivalents: [
      { label: 'Three Gorges Dam Scale Projects (¥250B)', costLocal: 250000000000, unit: 'mega hydro power dams' },
      { label: 'High-speed Rail Network (¥150B per 1000km)', costLocal: 150000000000, unit: '1,000-km high-speed routes' }
    ]
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    currencySymbol: '€',
    currencyCode: 'EUR',
    usdExchangeRate: 0.92,
    eurExchangeRate: 1.0,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 3180000000000, // €3.18 Trillion
    annualGrowthRateLocal: 140000000000, // €140 Billion / yr
    avgInterestRatePercent: 3.1,
    annualGdpLocal: 2860000000000, // ~€2.86 Trillion
    population: 68200000,
    taxpayers: 30500000,
    debtCategory: 'High (80-120%)',
    notes: 'Public debt evaluated by INSEE; debt-to-GDP exceeds 110% driven by social transfers and infrastructure programs.',
    equivalents: [
      { label: 'Nuclear EPR Reactors (€12B)', costLocal: 12000000000, unit: 'next-gen nuclear power plants' },
      { label: 'TGV Fast-train lines (€8B)', costLocal: 8000000000, unit: 'cross-country high-speed tracks' }
    ]
  },
  {
    id: 'canada',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    currencySymbol: 'CA$',
    currencyCode: 'CAD',
    usdExchangeRate: 1.36,
    eurExchangeRate: 1.48,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 2190000000000, // CA$2.19 Trillion
    annualGrowthRateLocal: 65000000000, // CA$65 Billion / yr
    avgInterestRatePercent: 3.5,
    annualGdpLocal: 2950000000000, // CA$2.95 Trillion
    population: 40500000,
    taxpayers: 21000000,
    debtCategory: 'Moderate (50-80%)',
    notes: 'Combined federal and provincial gross debt as tracked by Department of Finance Canada.',
    equivalents: [
      { label: 'Trans-Canada Highway Modernization ($15B)', costLocal: 15000000000, unit: 'nationwide highway upgrades' }
    ]
  },
  {
    id: 'australia',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    usdExchangeRate: 1.52,
    eurExchangeRate: 1.66,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 1040000000000, // A$1.04 Trillion
    annualGrowthRateLocal: 38000000000, // A$38 Billion / yr
    avgInterestRatePercent: 3.8,
    annualGdpLocal: 2620000000000, // A$2.62 Trillion
    population: 27100000,
    taxpayers: 14500000,
    debtCategory: 'Moderate (50-80%)',
    notes: 'Gross Australian government securities on issue managed by the Australian Office of Financial Management (AOFM).',
    equivalents: [
      { label: 'Submarine Fleet Procurement ($20B)', costLocal: 20000000000, unit: 'defense submarine fleets' }
    ]
  },
  {
    id: 'brazil',
    name: 'Brazil',
    code: 'BR',
    flag: '🇧🇷',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    usdExchangeRate: 5.45,
    eurExchangeRate: 5.95,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 8850000000000, // R$8.85 Trillion
    annualGrowthRateLocal: 680000000000, // R$680 Billion / yr
    avgInterestRatePercent: 10.5, // High SELIC rate environment
    annualGdpLocal: 11200000000000, // R$11.2 Trillion
    population: 216000000,
    taxpayers: 42000000,
    debtCategory: 'High (80-120%)',
    notes: 'General government gross debt calculated by the Central Bank of Brazil (BCB).',
    equivalents: [
      { label: 'Amazon Rainforest Protection Fund (R$5B)', costLocal: 5000000000, unit: 'climate conservation funds' }
    ]
  },
  {
    id: 'russia',
    name: 'Russia',
    code: 'RU',
    flag: '🇷🇺',
    currencySymbol: '₽',
    currencyCode: 'RUB',
    usdExchangeRate: 91.5,
    eurExchangeRate: 99.8,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 31200000000000, // ₽31.2 Trillion RUB
    annualGrowthRateLocal: 3400000000000, // ₽3.4 Trillion / yr
    avgInterestRatePercent: 12.0,
    annualGdpLocal: 185000000000000, // ₽185 Trillion
    population: 144000000,
    taxpayers: 65000000,
    debtCategory: 'Low (<50%)',
    notes: 'One of the lowest public debt-to-GDP ratios globally (<20%), though high domestic interest yields.',
    equivalents: [
      { label: 'Siberian Gas Pipeline Mega Projects (₽800B)', costLocal: 800000000000, unit: 'transcontinental pipelines' }
    ]
  },
  {
    id: 'world',
    name: 'Global World Debt',
    code: 'GL',
    flag: '🌍',
    currencySymbol: '$',
    currencyCode: 'USD',
    usdExchangeRate: 1,
    eurExchangeRate: 1.09,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 104500000000000, // $104.5 Trillion USD Sovereign Debt
    annualGrowthRateLocal: 5400000000000, // ~$5.4 Trillion annual addition (~$171,000/sec)
    avgInterestRatePercent: 3.8,
    annualGdpLocal: 110000000000000, // ~$110 Trillion World GDP
    population: 8120000000,
    taxpayers: 2600000000,
    debtCategory: 'High (80-120%)',
    notes: 'Aggregated total sovereign public debt of all United Nations member countries tracked by IMF and World Bank.',
    equivalents: [
      { label: 'Global Clean Energy Transition ($4.5T/yr)', costLocal: 4500000000000, unit: 'years of total clean energy transition' },
      { label: 'Global Eradication of Extreme Poverty ($200B/yr)', costLocal: 200000000000, unit: 'centuries of world poverty eradication' }
    ]
  }
];

type CurrencyView = 'LOCAL' | 'USD' | 'EUR';
type NumberScale = 'STANDARD' | 'INDIAN'; // Lakhs/Crores vs Millions/Billions/Trillions

export const DebtClock: React.FC = () => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('india');
  const [currencyView, setCurrencyView] = useState<CurrencyView>('LOCAL');
  const [numberScale, setNumberScale] = useState<NumberScale>('INDIAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'debt' | 'ratio' | 'perCapita' | 'growth'>('debt');
  
  // Custom simulator state
  const [simMonthlyPerCitizen, setSimMonthlyPerCitizen] = useState<number>(500);

  // Time elapsed in session
  const [sessionStartTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // RAF loop for smooth microsecond ticking
  useEffect(() => {
    let animId: number;
    const updateTick = () => {
      setCurrentTime(Date.now());
      animId = requestAnimationFrame(updateTick);
    };
    animId = requestAnimationFrame(updateTick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const activeCountry = useMemo(() => {
    return COUNTRIES_DEBT_DB.find((c) => c.id === selectedCountryId) || COUNTRIES_DEBT_DB[0];
  }, [selectedCountryId]);

  // Set number scale appropriately when country changes
  useEffect(() => {
    if (activeCountry.id === 'india') {
      setNumberScale('INDIAN');
    }
  }, [activeCountry.id]);

  // Live Calculations for current country
  const liveStats = useMemo(() => {
    const elapsedSeconds = (currentTime - activeCountry.baselineTimestamp) / 1000;
    const sessionElapsedSeconds = Math.max(0, (currentTime - sessionStartTime) / 1000);

    const growthPerSecondLocal = activeCountry.annualGrowthRateLocal / (365.25 * 24 * 3600);
    const totalDebtLocal = activeCountry.baseDebtLocal + elapsedSeconds * growthPerSecondLocal;

    const sessionDebtAccumulatedLocal = sessionElapsedSeconds * growthPerSecondLocal;

    // Currency conversion factor
    let convFactor = 1;
    let currSymbol = activeCountry.currencySymbol;
    let currCode = activeCountry.currencyCode;

    if (currencyView === 'USD') {
      convFactor = 1 / activeCountry.usdExchangeRate;
      currSymbol = '$';
      currCode = 'USD';
    } else if (currencyView === 'EUR') {
      convFactor = 1 / activeCountry.eurExchangeRate;
      currSymbol = '€';
      currCode = 'EUR';
    }

    const totalDebtDisplay = totalDebtLocal * convFactor;
    const growthPerSecDisplay = growthPerSecondLocal * convFactor;
    const growthPerMinDisplay = growthPerSecDisplay * 60;
    const growthPerHourDisplay = growthPerSecDisplay * 3600;
    const growthPerDayDisplay = growthPerSecDisplay * 86400;

    const debtPerCitizen = totalDebtDisplay / activeCountry.population;
    const debtPerTaxpayer = totalDebtDisplay / activeCountry.taxpayers;

    const debtToGdpRatio = (totalDebtLocal / activeCountry.annualGdpLocal) * 100;

    // Annual Interest Cost
    const annualInterestCost = totalDebtDisplay * (activeCountry.avgInterestRatePercent / 100);
    const interestPerSecond = annualInterestCost / (365.25 * 24 * 3600);
    const sessionInterest = sessionElapsedSeconds * (growthPerSecondLocal * convFactor * (activeCountry.avgInterestRatePercent / 100));

    return {
      totalDebtDisplay,
      totalDebtLocal,
      convFactor,
      currSymbol,
      currCode,
      growthPerSecDisplay,
      growthPerMinDisplay,
      growthPerHourDisplay,
      growthPerDayDisplay,
      debtPerCitizen,
      debtPerTaxpayer,
      debtToGdpRatio,
      annualInterestCost,
      interestPerSecond,
      sessionDebtAccumulated: sessionDebtAccumulatedLocal * convFactor,
      sessionInterest,
      sessionElapsedSeconds
    };
  }, [currentTime, activeCountry, currencyView, sessionStartTime]);

  // Format numbers helper
  const formatCurrency = (val: number, decimals: number = 0, isCompact: boolean = false) => {
    const sym = liveStats.currSymbol;
    if (isCompact) {
      if (numberScale === 'INDIAN' && activeCountry.id === 'india' && currencyView === 'LOCAL') {
        if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)} Lakh Cr`;
        if (val >= 1e7) return `${sym}${(val / 1e7).toFixed(2)} Cr`;
        if (val >= 1e5) return `${sym}${(val / 1e5).toFixed(2)} Lakh`;
      }
      if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)} Trillion`;
      if (val >= 1e9) return `${sym}${(val / 1e9).toFixed(2)} Billion`;
      if (val >= 1e6) return `${sym}${(val / 1e6).toFixed(2)} Million`;
      if (val >= 1e3) return `${sym}${(val / 1e3).toFixed(1)}k`;
    }

    if (numberScale === 'INDIAN' && activeCountry.id === 'india' && currencyView === 'LOCAL') {
      return `${sym} ${val.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}`;
    }

    return `${sym} ${val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  // Format raw integer with commas for big ticker
  const formatTicker = (val: number) => {
    const rounded = Math.floor(val);
    if (numberScale === 'INDIAN' && activeCountry.id === 'india' && currencyView === 'LOCAL') {
      return rounded.toLocaleString('en-IN');
    }
    return rounded.toLocaleString('en-US');
  };

  // Filtered and sorted table countries
  const tableData = useMemo(() => {
    const elapsedSeconds = (currentTime - new Date('2026-01-01T00:00:00Z').getTime()) / 1000;
    
    return COUNTRIES_DEBT_DB.map((c) => {
      const growthPerSec = c.annualGrowthRateLocal / (365.25 * 24 * 3600);
      const totalLocal = c.baseDebtLocal + elapsedSeconds * growthPerSec;
      const totalUsd = totalLocal / c.usdExchangeRate;
      const ratio = (totalLocal / c.annualGdpLocal) * 100;
      const perCapitaUsd = totalUsd / c.population;
      const growthPerSecUsd = growthPerSec / c.usdExchangeRate;

      return {
        ...c,
        totalLocal,
        totalUsd,
        ratio,
        perCapitaUsd,
        growthPerSecUsd
      };
    })
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'debt') return b.totalUsd - a.totalUsd;
      if (sortBy === 'ratio') return b.ratio - a.ratio;
      if (sortBy === 'perCapita') return b.perCapitaUsd - a.perCapitaUsd;
      if (sortBy === 'growth') return b.growthPerSecUsd - a.growthPerSecUsd;
      return 0;
    });
  }, [currentTime, searchQuery, sortBy]);

  // Debt-to-GDP category badge color
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Critical (>120%)':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High (80-120%)':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Moderate (50-80%)':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Low (<50%)':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-10" id="debt-clock-container">
      {/* 1. Country Selection Bar & Quick Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>{activeCountry.flag}</span>
                  <span>{activeCountry.name} National Debt Clock</span>
                </h2>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryColor(activeCountry.debtCategory)}`}>
                  {activeCountry.debtCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time microsecond ticker reflecting sovereign fiscal trajectories &amp; debt issuance.
              </p>
            </div>
          </div>

          {/* Unit & Currency View Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setCurrencyView('LOCAL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currencyView === 'LOCAL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`View in ${activeCountry.currencyCode}`}
              >
                {activeCountry.currencyCode} ({activeCountry.currencySymbol})
              </button>
              <button
                onClick={() => setCurrencyView('USD')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currencyView === 'USD'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrencyView('EUR')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currencyView === 'EUR'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EUR (€)
              </button>
            </div>

            {/* Indian numbering toggle for India */}
            {activeCountry.id === 'india' && currencyView === 'LOCAL' && (
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setNumberScale('INDIAN')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    numberScale === 'INDIAN'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lakh / Crore
                </button>
                <button
                  onClick={() => setNumberScale('STANDARD')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    numberScale === 'STANDARD'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Trillion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Country:
          </span>
          {COUNTRIES_DEBT_DB.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountryId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                selectedCountryId === c.id
                  ? 'bg-indigo-500/20 text-white border-indigo-500/50 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. THE MAIN MASTER DEBT TICKER DISPLAY */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Glow Accent */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE NATIONAL PUBLIC DEBT TICKER</span>
          </div>

          {/* Big Odometer Display */}
          <div>
            <div className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1.5">
              Total Outstanding Gross Debt
            </div>
            <div className="font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white select-all">
              <span className="text-rose-400 mr-2">{liveStats.currSymbol}</span>
              <span>{formatTicker(liveStats.totalDebtDisplay)}</span>
            </div>

            {/* Indian system breakdown if India is selected */}
            {activeCountry.id === 'india' && currencyView === 'LOCAL' && (
              <div className="mt-3 inline-block px-4 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-sm font-bold">
                ≈ ₹{(liveStats.totalDebtLocal / 1e12).toFixed(3)} Lakh Crore (Trillion INR)
              </div>
            )}
            {activeCountry.id === 'usa' && currencyView === 'LOCAL' && (
              <div className="mt-3 inline-block px-4 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-sm font-bold">
                ≈ ${(liveStats.totalDebtLocal / 1e12).toFixed(3)} Trillion USD
              </div>
            )}
          </div>

          {/* Growth Speed Highlight */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-slate-800/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Growing by:</span>
              <span className="font-mono font-bold text-amber-300">
                +{formatCurrency(liveStats.growthPerSecDisplay, 2)} / second
              </span>
            </div>
            <div className="hidden md:inline text-slate-600">•</div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Daily additions:</span>
              <span className="font-mono font-bold text-rose-300">
                +{formatCurrency(liveStats.growthPerDayDisplay, 0, true)} / day
              </span>
            </div>
            <div className="hidden md:inline text-slate-600">•</div>
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Avg Borrowing Yield:</span>
              <span className="font-mono font-bold text-indigo-300">
                {activeCountry.avgInterestRatePercent}% / yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE METRIC CARDS GRID (Per Citizen, Per Taxpayer, Debt-to-GDP, Interest) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Debt per Citizen */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Debt Per Citizen</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
            {formatCurrency(liveStats.debtPerCitizen, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Population:</span>
            <span className="font-semibold text-slate-300">{(activeCountry.population / 1e6).toFixed(1)}M citizens</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Card 2: Debt per Working Taxpayer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Debt Per Taxpayer</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {formatCurrency(liveStats.debtPerTaxpayer, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Taxpayers:</span>
            <span className="font-semibold text-slate-300">{(activeCountry.taxpayers / 1e6).toFixed(1)}M filers</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }} />
          </div>
        </div>

        {/* Card 3: Debt to GDP Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Debt-to-GDP Ratio</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1">
            <span>{liveStats.debtToGdpRatio.toFixed(1)}%</span>
            <span className="text-xs font-bold text-slate-400 uppercase">of GDP</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Nominal GDP:</span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(activeCountry.annualGdpLocal * liveStats.convFactor, 0, true)}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                liveStats.debtToGdpRatio > 100
                  ? 'bg-rose-500'
                  : liveStats.debtToGdpRatio > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, liveStats.debtToGdpRatio / 2)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Pure Interest Expense */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Annual Interest Burden</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-rose-400">
            {formatCurrency(liveStats.annualInterestCost, 0, true)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Interest Cost / Sec:</span>
            <span className="font-semibold text-rose-300 font-mono">
              +{formatCurrency(liveStats.interestPerSecond, 1)}/s
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
      </div>

      {/* 4. LIVE SESSION IMPACT: "Debt Accumulated While on this page" */}
      <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Debt Accumulated During Your Visit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {Math.floor(liveStats.sessionElapsedSeconds)}s elapsed
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              In the exact time you have had this page open, {activeCountry.name}&apos;s national public debt has grown by:
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-mono text-2xl sm:text-3xl font-black text-rose-400 animate-pulse">
            +{formatCurrency(liveStats.sessionDebtAccumulated, 2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Includes ~{formatCurrency(liveStats.sessionInterest, 2)} in pure interest obligations
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE: REAL-WORLD EQUIVALENTS & PERSPECTIVE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>{activeCountry.name} Debt in Real-World Perspective</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              What does {formatCurrency(liveStats.totalDebtDisplay, 0, true)} look like in terms of mega-infrastructure?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCountry.equivalents.map((item, idx) => {
            const count = Math.floor(liveStats.totalDebtLocal / item.costLocal);
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">{item.label}</div>
                  <div className="font-mono text-2xl font-black text-indigo-400">
                    {count.toLocaleString()}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Equivalent to:</span>
                  <span className="font-semibold text-slate-300">{item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. CITIZEN PAYOFF SIMULATOR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Sovereign Debt Payoff Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Calculate how much each citizen would need to contribute to amortize {activeCountry.name}&apos;s debt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              If every citizen contributed monthly ({activeCountry.currencySymbol}):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={simMonthlyPerCitizen}
                onChange={(e) => setSimMonthlyPerCitizen(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-right text-emerald-400">
                {activeCountry.currencySymbol} {simMonthlyPerCitizen.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Annual revenue raised: {formatCurrency(simMonthlyPerCitizen * 12 * activeCountry.population * liveStats.convFactor, 0, true)} / year across {(activeCountry.population / 1e6).toFixed(0)}M people.
            </p>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Time required to clear current debt:</span>
              <span className="font-mono text-base font-bold text-white">
                {Math.ceil(liveStats.totalDebtLocal / (simMonthlyPerCitizen * 12 * activeCountry.population))} Years
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Total per citizen lump sum required today:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatCurrency(liveStats.debtPerCitizen, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Total per taxpayer lump sum required today:</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {formatCurrency(liveStats.debtPerTaxpayer, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. GLOBAL COMPARISON MATRIX & LEADERBOARD TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>World Sovereign Debt Leaderboard &amp; Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live comparison normalized across global currencies in USD ($)
            </p>
          </div>

          {/* Search & Sorter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setSortBy('debt')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  sortBy === 'debt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Total Debt
              </button>
              <button
                onClick={() => setSortBy('ratio')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  sortBy === 'ratio' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Debt/GDP %
              </button>
              <button
                onClick={() => setSortBy('perCapita')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  sortBy === 'perCapita' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Per Capita
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Total Debt (USD)</th>
                <th className="py-3 px-4 text-right">Debt-to-GDP</th>
                <th className="py-3 px-4 text-right">Debt Per Citizen</th>
                <th className="py-3 px-4 text-right">Growth / Sec</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {tableData.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    selectedCountryId === c.id ? 'bg-indigo-950/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                    ${(c.totalUsd / 1e12).toFixed(2)} Trillion
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span
                      className={
                        c.ratio > 100
                          ? 'text-rose-400'
                          : c.ratio > 75
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {c.ratio.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ${Math.round(c.perCapitaUsd).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-300">
                    +${Math.round(c.growthPerSecUsd).toLocaleString()}/s
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(
                        c.debtCategory
                      )}`}
                    >
                      {c.debtCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedCountryId(c.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. EDUCATIONAL SECTION: UNDERSTANDING PUBLIC DEBT */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-indigo-400" />
          <span>Understanding Sovereign Debt &amp; Fiscal Deficit</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              What is National Public Debt?
            </h4>
            <p>
              National debt represents the total accumulated borrowing of a sovereign government over its entire history to finance fiscal deficits—when expenditures (infrastructure, defense, welfare, interest payments) exceed tax and non-tax revenues.
            </p>
            <p>
              Governments borrow primarily by issuing treasury bills, sovereign bonds, and government securities (G-Secs) purchased by domestic banks, pension funds, insurers, and international investors.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              India&apos;s FRBM Act &amp; Debt Safety Targets
            </h4>
            <p>
              In India, the <strong>Fiscal Responsibility and Budget Management (FRBM) Act</strong> aims to limit General Government Debt to below <strong>60% of GDP</strong> (40% Central Govt + 20% States) and fiscal deficit to <strong>3.0% of GDP</strong>.
            </p>
            <p>
              Unlike foreign debt-vulnerable nations, over <strong>95% of India&apos;s public debt is denominated in Indian Rupees (INR)</strong> and held domestically by RBI, commercial banks, and EPFO, insulating India from foreign currency default risks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
