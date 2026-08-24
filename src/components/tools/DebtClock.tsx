import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Search,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Scale,
  FileText,
  Building,
  ShieldAlert,
  Database,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface CountryDebtData {
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
  baseDebtLocal: number; // Primary metric shown (e.g. Central Govt liabilities or official gross debt)
  
  // Explicit definitions and citations
  debtDefinition: string;
  debtScope: 'Central Government Liabilities' | 'General Government Gross Debt' | 'Public Sector Net Debt' | 'Federal Public Debt';
  referencePeriod: string;
  primarySource: string;
  sourceUrl?: string;
  lastUpdated: string;
  
  // Annual growth in local currency (Derived from documented fiscal deficit / net annual borrowing)
  annualGrowthRateLocal: number;
  annualGrowthBasis: string;
  
  // Documented official annual interest expenditure (Local Currency)
  annualInterestExpLocal: number;
  interestExpSource: string;
  
  // GDP in local currency & source
  annualGdpLocal: number;
  gdpReferencePeriod: string;
  gdpSource: string;
  
  // Population & source
  population: number;
  populationPeriod: string;
  populationSource: string;
  
  // Taxpayer / ITR filers count & exact definition
  taxpayers: number;
  taxpayerDefinition: string;
  taxpayerSource: string;
  
  // Secondary debt comparison metrics (especially for India Central vs General Govt)
  generalGovtDebtLocal?: number;
  generalGovtGdpRatio?: number;
  generalGovtSource?: string;
  
  // Key category info
  debtCategory: 'Critical (>120%)' | 'High (80-120%)' | 'Moderate (50-80%)' | 'Low (<50%)';
  notes: string;
  
  // Documented real-world project cost benchmarks for illustrative scale visualization
  equivalents: {
    label: string;
    costLocal: number;
    unit: string;
    source: string;
    year: string;
  }[];
}

export const COUNTRIES_DEBT_DB: CountryDebtData[] = [
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
    baseDebtLocal: 185270000000000, // ₹185.27 Lakh Crore (Central Government Total Liabilities)
    debtDefinition: 'Central Government Total Liabilities (Union Government Debt & Other Liabilities)',
    debtScope: 'Central Government Liabilities',
    referencePeriod: 'FY 2024–25 (Revised Estimates) / FY 2025–26 (Budget Estimates)',
    primarySource: 'Ministry of Finance, Government of India — Union Budget (Statement of Liabilities / Receipt Budget)',
    lastUpdated: 'February 2025 (Union Budget baseline)',
    annualGrowthRateLocal: 16133120000000, // ₹16.13 Lakh Crore / year fiscal deficit (Union Budget FY 2024-25 RE / FY 2025-26 BE)
    annualGrowthBasis: 'Annual Fiscal Deficit / Net Borrowing Requirement of ₹16.13 Lakh Cr (Union Budget)',
    annualInterestExpLocal: 11630000000000, // ₹11.63 Lakh Crore / year (Major Head 2049: Interest Payments)
    interestExpSource: 'Union Budget — Expenditure Profile (Major Head 2049: Appropriation for Reduction or Avoidance of Debt & Interest Payments)',
    annualGdpLocal: 326350000000000, // ₹326.35 Lakh Crore (~$3.90 Trillion USD)
    gdpReferencePeriod: 'FY 2024–25 / FY 2025–26 Nominal GDP Estimate',
    gdpSource: 'Ministry of Statistics & Programme Implementation (MoSPI) & Union Budget Macroeconomic Framework',
    population: 1440000000,
    populationPeriod: '2025–2026 Projection',
    populationSource: 'UIDAI / Ministry of Health & Family Welfare (MoHFW) / UN Population Division',
    taxpayers: 86100000, // 8.61 Crore Income-Tax Return Filers
    taxpayerDefinition: 'Income-Tax Return (ITR) Filers',
    taxpayerSource: 'Central Board of Direct Taxes (CBDT), Ministry of Finance (Official Data for AY 2024–25)',
    generalGovtDebtLocal: 265300000000000, // ₹265.30 Lakh Crore General Govt Debt (Centre + States)
    generalGovtGdpRatio: 81.3, // ~81.3% of GDP
    generalGovtSource: 'RBI Handbook of Statistics on the Indian Economy & IMF Fiscal Monitor (Centre + States Combined)',
    debtCategory: 'Moderate (50-80%)',
    notes: 'Primary counter tracks Central Government Total Liabilities (56.8% of GDP). When combined with State Governments (General Government Debt), total consolidated debt is ~81.3% of GDP. Over 95% of sovereign debt is rupee-denominated and held domestically.',
    equivalents: [
      {
        label: 'Chandrayaan-3 Moon Missions (₹615 Cr each)',
        costLocal: 6150000000,
        unit: 'space lunar missions',
        source: 'ISRO Official Approved Mission Budget',
        year: '2023'
      },
      {
        label: '8-Lane National Expressway Construction (₹30 Cr / km)',
        costLocal: 300000000,
        unit: 'km of 8-lane expressway',
        source: 'NHAI Project Capital Cost Benchmark',
        year: '2024'
      },
      {
        label: 'National Supercomputing AI / HPC Centers (₹1,000 Cr each)',
        costLocal: 10000000000,
        unit: 'supercomputer AI clusters',
        source: 'National Supercomputing Mission (MeitY / C-DAC)',
        year: '2024'
      }
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
    baseDebtLocal: 35400000000000, // $35.40 Trillion USD
    debtDefinition: 'Total Public Debt Outstanding (Debt Held by the Public + Intragovernmental Holdings)',
    debtScope: 'Federal Public Debt',
    referencePeriod: 'FY 2024 / FY 2025',
    primarySource: 'US Department of the Treasury — Bureau of the Fiscal Service (Debt to the Penny)',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 1900000000000, // $1.90 Trillion USD annual federal deficit
    annualGrowthBasis: 'Congressional Budget Office (CBO) & US Treasury Baseline Federal Deficit ($1.90T/yr)',
    annualInterestExpLocal: 1050000000000, // $1.05 Trillion USD Net Interest
    interestExpSource: 'US Treasury Monthly Treasury Statement — Net Interest on the Public Debt',
    annualGdpLocal: 28650000000000, // $28.65 Trillion USD
    gdpReferencePeriod: '2024–2025 Annualized',
    gdpSource: 'US Bureau of Economic Analysis (BEA) — Current-Dollar GDP',
    population: 337000000,
    populationPeriod: '2025–2026 Projection',
    populationSource: 'US Census Bureau — National Population Estimates',
    taxpayers: 162000000,
    taxpayerDefinition: 'Individual Income Tax Return Filers',
    taxpayerSource: 'Internal Revenue Service (IRS) Data Book',
    debtCategory: 'Critical (>120%)',
    notes: 'Total federal debt outstanding exceeds 123% of GDP, driven by federal budget deficits and mandatory entitlement spending.',
    equivalents: [
      {
        label: 'Ford-Class Supercarriers ($13B each)',
        costLocal: 13000000000,
        unit: 'nuclear supercarriers',
        source: 'US Congressional Research Service (CRS)',
        year: '2023'
      },
      {
        label: 'Apollo / Artemis Lunar Exploration Programs ($150B)',
        costLocal: 150000000000,
        unit: 'deep space programs',
        source: 'NASA Inspector General Audit',
        year: '2024'
      }
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
    debtDefinition: 'Central Government Gross Debt (JGBs, Financing Bills, and Government Borrowings)',
    debtScope: 'Central Government Liabilities',
    referencePeriod: 'FY 2024–2025',
    primarySource: 'Ministry of Finance Japan (MOF) — Debt Management Report & Bank of Japan (BOJ)',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 28500000000000, // ¥28.5 Trillion JPY annual borrowing
    annualGrowthBasis: 'Annual National Budget Bond Issuance Plan (Ministry of Finance Japan)',
    annualInterestExpLocal: 10200000000000, // ¥10.2 Trillion JPY
    interestExpSource: 'MOF Japan — Debt Servicing Costs in the General Account Budget',
    annualGdpLocal: 595000000000000, // ¥595 Trillion JPY
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Cabinet Office, Government of Japan — National Accounts',
    population: 124000000,
    populationPeriod: '2025 Projection',
    populationSource: 'Statistics Bureau of Japan (Ministry of Internal Affairs)',
    taxpayers: 67000000,
    taxpayerDefinition: 'Income-Earning Taxable Workforce',
    taxpayerSource: 'National Tax Agency Japan (NTA)',
    debtCategory: 'Critical (>120%)',
    notes: 'World highest debt-to-GDP ratio (>220% Central, ~255% General Govt per IMF), heavily held domestically by Bank of Japan and domestic institutional funds.',
    equivalents: [
      {
        label: 'Shinkansen Bullet Train Mega Lines (¥1.5T each)',
        costLocal: 1500000000000,
        unit: 'high-speed rail routes',
        source: 'Japan Railway Construction Agency Benchmark',
        year: '2023'
      }
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
    baseDebtLocal: 2780000000000, // £2.78 Trillion GBP
    debtDefinition: 'Public Sector Net Debt excluding public sector banks (PSND ex)',
    debtScope: 'Public Sector Net Debt',
    referencePeriod: 'FY 2024–2025',
    primarySource: 'Office for National Statistics (ONS) & HM Treasury — Public Sector Finances',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 120000000000, // £120 Billion GBP annual net borrowing
    annualGrowthBasis: 'Office for Budget Responsibility (OBR) Public Sector Net Borrowing Forecast',
    annualInterestExpLocal: 108000000000, // £108 Billion GBP
    interestExpSource: 'ONS — Central Government Debt Interest Payable (Gross)',
    annualGdpLocal: 2820000000000, // £2.82 Trillion GBP
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'ONS UK National Accounts',
    population: 68500000,
    populationPeriod: '2025 Projection',
    populationSource: 'ONS Population Estimates for the UK',
    taxpayers: 35500000,
    taxpayerDefinition: 'Income Tax Payers',
    taxpayerSource: 'HM Revenue & Customs (HMRC) Statistics',
    debtCategory: 'High (80-120%)',
    notes: 'Public sector net debt is approximately 98.6% of GDP. Monitored by the Office for Budget Responsibility (OBR).',
    equivalents: [
      {
        label: 'NHS Annual Health Service Budget (£180B)',
        costLocal: 180000000000,
        unit: 'years of entire NHS service',
        source: 'Department of Health & Social Care Budget',
        year: '2024'
      }
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
    baseDebtLocal: 2620000000000, // €2.62 Trillion EUR
    debtDefinition: 'General Government Gross Debt (Maastricht Treaty Definition — Federal, States, Municipalities & Social Security)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'Deutsche Bundesbank & Federal Statistical Office (Destatis)',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 65000000000, // €65 Billion EUR net borrowing
    annualGrowthBasis: 'Federal Ministry of Finance (BMF) Financial Plan & Net Borrowing Limit',
    annualInterestExpLocal: 42000000000, // €42 Billion EUR
    interestExpSource: 'BMF Federal Budget — Debt Management & Interest Expenditure',
    annualGdpLocal: 4180000000000, // €4.18 Trillion EUR
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Destatis — German Gross Domestic Product at Current Prices',
    population: 84400000,
    populationPeriod: '2025 Projection',
    populationSource: 'Destatis Population Statistics',
    taxpayers: 42000000,
    taxpayerDefinition: 'Income Tax Return Filers & Employees',
    taxpayerSource: 'Federal Ministry of Finance Tax Statistics',
    debtCategory: 'Moderate (50-80%)',
    notes: 'Bound constitutionally by the Schuldenbremse (Debt Brake) rules, maintaining one of the lowest debt-to-GDP ratios in the G7 (~62.7%).',
    equivalents: [
      {
        label: 'Offshore Wind Farm Megaclusters (€4B each)',
        costLocal: 4000000000,
        unit: 'major offshore wind complexes',
        source: 'Federal Ministry for Economic Affairs (BMWK)',
        year: '2024'
      }
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
    baseDebtLocal: 92500000000000, // ¥92.5 Trillion CNY
    debtDefinition: 'Central & Local Government Budgetary Gross Debt (Official Ministry of Finance Scope)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'Ministry of Finance of the People\'s Republic of China & National Bureau of Statistics (NBS)',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 4060000000000, // ¥4.06 Trillion CNY budget deficit
    annualGrowthBasis: 'National People\'s Congress (NPC) Approved Fiscal Deficit Target',
    annualInterestExpLocal: 1250000000000, // ¥1.25 Trillion CNY
    interestExpSource: 'Ministry of Finance PRC — Government Debt Servicing Budget',
    annualGdpLocal: 132000000000000, // ¥132.0 Trillion CNY
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'National Bureau of Statistics of China (NBS)',
    population: 1410000000,
    populationPeriod: '2025 Projection',
    populationSource: 'NBS National Demographic Projections',
    taxpayers: 280000000,
    taxpayerDefinition: 'Individual Income Tax (IIT) Filers & Urban Workforce',
    taxpayerSource: 'State Taxation Administration (STA)',
    debtCategory: 'Moderate (50-80%)',
    notes: 'Reflects official government budgetary debt (~70.1% of GDP). Note that unofficial Local Government Financing Vehicle (LGFV) liabilities are tracked separately by the IMF.',
    equivalents: [
      {
        label: 'Three Gorges Dam Scale Hydropower Complexes (¥250B)',
        costLocal: 250000000000,
        unit: 'hydro-electric mega dams',
        source: 'China Three Gorges Corporation Project Audit',
        year: '2023'
      }
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
    baseDebtLocal: 3160000000000, // €3.16 Trillion EUR
    debtDefinition: 'General Government Gross Debt (Maastricht Definition — Central State, Local Authorities & Social Security)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'INSEE (National Institute of Statistics and Economic Studies) & Banque de France',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 145000000000, // €145 Billion EUR
    annualGrowthBasis: 'Ministry of Economy and Finance (Bercy) Public Deficit Forecast',
    annualInterestExpLocal: 54000000000, // €54 Billion EUR
    interestExpSource: 'Agence France Trésor (AFT) — State Debt Charge',
    annualGdpLocal: 2850000000000, // €2.85 Trillion EUR
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'INSEE National Accounts',
    population: 68200000,
    populationPeriod: '2025 Projection',
    populationSource: 'INSEE Demographic Census',
    taxpayers: 39000000,
    taxpayerDefinition: 'Tax Households (Foyers Fiscaux)',
    taxpayerSource: 'Direction Générale des Finances Publiques (DGFiP)',
    debtCategory: 'High (80-120%)',
    notes: 'General government gross debt exceeds 110% of GDP, evaluated on Maastricht criteria by INSEE.',
    equivalents: [
      {
        label: 'EPR Nuclear Power Reactors (€12B each)',
        costLocal: 12000000000,
        unit: 'next-generation nuclear plants',
        source: 'French Court of Audit (Cour des Comptes)',
        year: '2024'
      }
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
    baseDebtLocal: 2180000000000, // CA$2.18 Trillion CAD
    debtDefinition: 'Federal & Provincial Consolidated Gross Debt',
    debtScope: 'General Government Gross Debt',
    referencePeriod: 'FY 2024–2025',
    primarySource: 'Department of Finance Canada (Federal Budget) & Statistics Canada',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 55000000000, // CA$55 Billion CAD
    annualGrowthBasis: 'Department of Finance Canada Fiscal Reference Tables',
    annualInterestExpLocal: 52000000000, // CA$52 Billion CAD
    interestExpSource: 'Public Accounts of Canada — Public Debt Charges',
    annualGdpLocal: 2960000000000, // CA$2.96 Trillion CAD
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Statistics Canada — Gross Domestic Product',
    population: 40500000,
    populationPeriod: '2025 Projection',
    populationSource: 'Statistics Canada Population Clock Estimates',
    taxpayers: 22000000,
    taxpayerDefinition: 'Individual T1 Tax Return Filers',
    taxpayerSource: 'Canada Revenue Agency (CRA)',
    debtCategory: 'Moderate (50-80%)',
    notes: 'Consolidated federal and provincial debt is approximately 73.6% of GDP.',
    equivalents: [
      {
        label: 'Trans-Canada Highway Infrastructure Overhauls (CA$15B)',
        costLocal: 15000000000,
        unit: 'national highway networks',
        source: 'Infrastructure Canada Project Allocations',
        year: '2023'
      }
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
    baseDebtLocal: 1020000000000, // A$1.02 Trillion AUD
    debtDefinition: 'Australian Government Gross Securities on Issue (AGS)',
    debtScope: 'Federal Public Debt',
    referencePeriod: 'FY 2024–2025',
    primarySource: 'Australian Office of Financial Management (AOFM) & Commonwealth Treasury',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 32000000000, // A$32 Billion AUD
    annualGrowthBasis: 'Commonwealth Budget Underlying Cash Balance Forecast',
    annualInterestExpLocal: 23000000000, // A$23 Billion AUD
    interestExpSource: 'AOFM Annual Report & Commonwealth Budget Paper No. 1',
    annualGdpLocal: 2650000000000, // A$2.65 Trillion AUD
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Australian Bureau of Statistics (ABS)',
    population: 27100000,
    populationPeriod: '2025 Projection',
    populationSource: 'ABS National Population Clock',
    taxpayers: 15000000,
    taxpayerDefinition: 'Individual Tax Return Lodgers',
    taxpayerSource: 'Australian Taxation Office (ATO) Taxation Statistics',
    debtCategory: 'Low (<50%)',
    notes: 'Commonwealth gross debt is 38.5% of GDP (General Government Debt combined is ~54.2% per IMF).',
    equivalents: [
      {
        label: 'Major Defense Fleet Procurements (A$20B)',
        costLocal: 20000000000,
        unit: 'naval defense procurement batches',
        source: 'Department of Defence Capital Investment Program',
        year: '2024'
      }
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
    baseDebtLocal: 8850000000000, // R$8.85 Trillion BRL
    debtDefinition: 'General Government Gross Debt (DBGG — Central Government, Social Security & Regional Governments)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'Banco Central do Brasil (BCB) & National Treasury of Brazil (STN)',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 680000000000, // R$680 Billion BRL
    annualGrowthBasis: 'Central Bank of Brazil Fiscal Statistics Bulletin (PSND & Fiscal Deficit)',
    annualInterestExpLocal: 720000000000, // R$720 Billion BRL
    interestExpSource: 'Banco Central do Brasil — Nominal Interest on General Government Debt',
    annualGdpLocal: 11200000000000, // R$11.20 Trillion BRL
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Instituto Brasileiro de Geografia e Estatística (IBGE)',
    population: 216000000,
    populationPeriod: '2025 Projection',
    populationSource: 'IBGE Demographic Estimates',
    taxpayers: 42000000,
    taxpayerDefinition: 'Individual Tax Return Declarants (IRPF)',
    taxpayerSource: 'Receita Federal do Brasil',
    debtCategory: 'Moderate (50-80%)',
    notes: 'General government gross debt represents approximately 79.0% of GDP, with substantial interest servicing costs linked to SELIC interest benchmark rates.',
    equivalents: [
      {
        label: 'National Climate & Amazon Rainforest Protection Fund (R$5B)',
        costLocal: 5000000000,
        unit: 'major environmental conservation funds',
        source: 'BNDES Amazon Fund Portfolio',
        year: '2024'
      }
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
    debtDefinition: 'General Government Gross Debt (Domestic OFZ Bonds & Foreign Sovereign Debt)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'Ministry of Finance of the Russian Federation (Minfin) & Bank of Russia',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 3400000000000, // ₽3.4 Trillion RUB
    annualGrowthBasis: 'Federal Budget Law on Deficit & Borrowing Plan',
    annualInterestExpLocal: 2400000000000, // ₽2.4 Trillion RUB
    interestExpSource: 'Minfin Russia — Federal Debt Servicing Line Items',
    annualGdpLocal: 185000000000000, // ₽185.0 Trillion RUB
    gdpReferencePeriod: '2024–2025 Nominal GDP',
    gdpSource: 'Federal State Statistics Service (Rosstat)',
    population: 144000000,
    populationPeriod: '2025 Projection',
    populationSource: 'Rosstat Population Figures',
    taxpayers: 65000000,
    taxpayerDefinition: 'Registered Personal Income Tax (NDFL) Payers',
    taxpayerSource: 'Federal Tax Service of Russia (FNS)',
    debtCategory: 'Low (<50%)',
    notes: 'Public debt-to-GDP is among the lowest worldwide (<17%), though domestic borrowing yields remain elevated.',
    equivalents: [
      {
        label: 'Transcontinental Gas Pipeline Systems (₽800B)',
        costLocal: 800000000000,
        unit: 'cross-continental pipeline corridors',
        source: 'Energy Ministry Infrastructure Baseline',
        year: '2023'
      }
    ]
  },
  {
    id: 'world',
    name: 'Global Sovereign Debt (All Nations)',
    code: 'GL',
    flag: '🌍',
    currencySymbol: '$',
    currencyCode: 'USD',
    usdExchangeRate: 1,
    eurExchangeRate: 1.09,
    baselineTimestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    baseDebtLocal: 104500000000000, // $104.5 Trillion USD
    debtDefinition: 'Total Aggregated Global Sovereign General Government Gross Debt (All UN Member States)',
    debtScope: 'General Government Gross Debt',
    referencePeriod: '2024–2025',
    primarySource: 'International Monetary Fund (IMF) Fiscal Monitor & World Bank Sovereign Debt Statistics',
    lastUpdated: 'Q1 2025 baseline',
    annualGrowthRateLocal: 5200000000000, // $5.20 Trillion USD
    annualGrowthBasis: 'IMF Global Fiscal Deficit Aggregates ($5.20 Trillion annual net addition)',
    annualInterestExpLocal: 3400000000000, // $3.40 Trillion USD
    interestExpSource: 'IMF / Bank for International Settlements (BIS) Global Debt Servicing Estimate',
    annualGdpLocal: 110000000000000, // $110.0 Trillion USD
    gdpReferencePeriod: '2024–2025 Global GDP',
    gdpSource: 'World Bank World Development Indicators & IMF WEO Database',
    population: 8120000000,
    populationPeriod: '2025 Projection',
    populationSource: 'United Nations Population Division',
    taxpayers: 2600000000,
    taxpayerDefinition: 'Estimated Global Formal Workforce',
    taxpayerSource: 'International Labour Organization (ILO)',
    debtCategory: 'High (80-120%)',
    notes: 'Consolidated public debt of all sovereign governments globally tracked by the IMF. Global sovereign debt-to-GDP stands at approximately 95%.',
    equivalents: [
      {
        label: 'Annual Global Clean Energy Transition Investment ($4.5T/yr)',
        costLocal: 4500000000000,
        unit: 'years of total planetary clean energy transition',
        source: 'International Energy Agency (IEA) World Energy Outlook',
        year: '2024'
      }
    ]
  }
];

type CurrencyView = 'LOCAL' | 'USD' | 'EUR';
type NumberScale = 'STANDARD' | 'INDIAN'; // Lakhs/Crores vs Millions/Billions/Trillions
type IndiaViewMode = 'CENTRAL' | 'GENERAL'; // Central Govt (Union) vs General Govt (Centre + States)

export const DebtClock: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCountryId, setSelectedCountryId] = useState<string>('india');
  const [currencyView, setCurrencyView] = useState<CurrencyView>('LOCAL');
  const [numberScale, setNumberScale] = useState<NumberScale>('INDIAN');
  const [indiaViewMode, setIndiaViewMode] = useState<IndiaViewMode>('CENTRAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'debt' | 'ratio' | 'perCapita' | 'growth'>('debt');
  const [activeTab, setActiveTab] = useState<'clock' | 'sources' | 'calculator' | 'leaderboard'>('clock');
  
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

  const rawCountry = useMemo(() => {
    return COUNTRIES_DEBT_DB.find((c) => c.id === selectedCountryId) || COUNTRIES_DEBT_DB[0];
  }, [selectedCountryId]);

  // Handle India Central vs General Government toggle
  const activeCountry = useMemo(() => {
    if (rawCountry.id === 'india' && indiaViewMode === 'GENERAL' && rawCountry.generalGovtDebtLocal) {
      return {
        ...rawCountry,
        baseDebtLocal: rawCountry.generalGovtDebtLocal,
        debtDefinition: 'General Government Consolidated Gross Debt (Central Government + All State Governments Combined)',
        debtScope: 'General Government Gross Debt' as const,
        notes: 'Includes consolidated liabilities of both the Central Union Government and all State Governments (net of inter-governmental holdings), as compiled by RBI & IMF.',
        annualGrowthRateLocal: 22500000000000 // ~₹22.5 Lakh Cr consolidated general deficit
      };
    }
    return rawCountry;
  }, [rawCountry, indiaViewMode]);

  // Set number scale appropriately when country changes
  useEffect(() => {
    if (activeCountry.id === 'india') {
      setNumberScale('INDIAN');
    }
  }, [activeCountry.id]);

  // Deterministic Live Calculations for current country
  // Derivation: Growth per second = Annual growth / 31,536,000 seconds (exact 365 days)
  const liveStats = useMemo(() => {
    const elapsedSeconds = (currentTime - activeCountry.baselineTimestamp) / 1000;
    const sessionElapsedSeconds = Math.max(0, (currentTime - sessionStartTime) / 1000);

    // Exact mathematical derivation from official annual net borrowing
    const SECONDS_PER_YEAR = 31536000; // 365 * 24 * 3600
    const growthPerSecondLocal = activeCountry.annualGrowthRateLocal / SECONDS_PER_YEAR;
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
    const growthPerDayDisplay = (activeCountry.annualGrowthRateLocal / 365) * convFactor;

    // Statistical divisions
    const debtPerCitizen = totalDebtDisplay / activeCountry.population;
    const debtPerTaxpayer = totalDebtDisplay / activeCountry.taxpayers;

    // Debt to GDP ratio = (Debt / Nominal GDP) * 100
    const debtToGdpRatio = (totalDebtLocal / activeCountry.annualGdpLocal) * 100;

    // Documented Annual Interest Expenditure Rate
    const annualInterestLocal = activeCountry.annualInterestExpLocal;
    const annualInterestDisplay = annualInterestLocal * convFactor;
    const interestPerSecond = (annualInterestLocal / SECONDS_PER_YEAR) * convFactor;
    const effectiveBorrowingRate = (annualInterestLocal / activeCountry.baseDebtLocal) * 100;
    
    // Estimated interest accrued during session
    const sessionInterest = sessionElapsedSeconds * interestPerSecond;

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
      annualInterestCost: annualInterestDisplay,
      interestPerSecond,
      effectiveBorrowingRate,
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

  // Filtered and sorted table countries (normalized to USD for fair comparison)
  const tableData = useMemo(() => {
    const elapsedSeconds = (currentTime - new Date('2026-01-01T00:00:00Z').getTime()) / 1000;
    const SECONDS_PER_YEAR = 31536000;
    
    return COUNTRIES_DEBT_DB.map((c) => {
      const growthPerSec = c.annualGrowthRateLocal / SECONDS_PER_YEAR;
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
    <div className="space-y-8" id="debt-clock-container">
      {/* 1. Country Selection Bar & Quick Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>{activeCountry.flag}</span>
                  <span>{activeCountry.name} Government Debt Estimator</span>
                </h2>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryColor(activeCountry.debtCategory)}`}>
                  {activeCountry.debtCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic mathematical model based on official Ministry of Finance &amp; Central Bank baselines.
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

        {/* India Sector Toggle: Central Government vs General Government */}
        {rawCountry.id === 'india' && (
          <div className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Debt Definition Scope:</span>
            </div>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setIndiaViewMode('CENTRAL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  indiaViewMode === 'CENTRAL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Central Govt Liabilities (56.8% GDP)</span>
              </button>
              <button
                onClick={() => setIndiaViewMode('GENERAL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  indiaViewMode === 'GENERAL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>General Govt — Centre + States (81.3% GDP)</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Country Pills */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Country:
          </span>
          {COUNTRIES_DEBT_DB.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCountryId(c.id);
                setIndiaViewMode('CENTRAL');
              }}
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

      {/* 2. THE MAIN MASTER ESTIMATED DEBT TICKER DISPLAY */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Glow Accent */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Transparent Status Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>ESTIMATED SOVEREIGN DEBT COUNTER</span>
          </div>

          {/* Big Odometer Display */}
          <div>
            <div className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1.5">
              {activeCountry.debtDefinition}
            </div>
            <div className="font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white select-all">
              <span className="text-rose-400 mr-2">{liveStats.currSymbol}</span>
              <span>{formatTicker(liveStats.totalDebtDisplay)}</span>
            </div>

            {/* Indian system breakdown if India is selected */}
            {activeCountry.id === 'india' && currencyView === 'LOCAL' && (
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold">
                ≈ ₹{(liveStats.totalDebtLocal / 1e12).toFixed(3)} Lakh Crore (Trillion INR)
              </div>
            )}
            {activeCountry.id === 'usa' && currencyView === 'LOCAL' && (
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold">
                ≈ ${(liveStats.totalDebtLocal / 1e12).toFixed(3)} Trillion USD
              </div>
            )}
          </div>

          {/* Transparent Model Disclaimer */}
          <div className="max-w-3xl mx-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] sm:text-xs text-slate-400 text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300">Methodology &amp; Transparency: </span>
              This counter is a deterministic estimate calculated from the latest available official baseline figure (
              <span className="text-slate-200 font-semibold">{activeCountry.primarySource}</span>, {activeCountry.referencePeriod}) and the annual budgetary net borrowing change. It is an illustrative educational model, not an official real-time government telemetry measurement.
            </div>
          </div>

          {/* Growth Speed Highlight */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-slate-800/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Estimated Annual Borrowing:</span>
              <span className="font-mono font-bold text-amber-300">
                +{formatCurrency(liveStats.growthPerSecDisplay, 2)} / second
              </span>
            </div>
            <div className="hidden md:inline text-slate-600">•</div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Daily Net Addition:</span>
              <span className="font-mono font-bold text-rose-300">
                +{formatCurrency(liveStats.growthPerDayDisplay, 0, true)} / day
              </span>
            </div>
            <div className="hidden md:inline text-slate-600">•</div>
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Effective Interest Cost:</span>
              <span className="font-mono font-bold text-indigo-300">
                {liveStats.effectiveBorrowingRate.toFixed(2)}% / yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE METRIC CARDS GRID (Per Citizen, Per Tax Filer, Debt-to-GDP, Interest Expenditure) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Debt Equivalent Per Citizen */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Debt Equiv. Per Citizen</span>
              <div className="group/tip relative">
                <Users className="w-4 h-4 text-blue-400 cursor-help" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
              {formatCurrency(liveStats.debtPerCitizen, 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Population ({activeCountry.populationPeriod}):</span>
              <span className="font-semibold text-slate-300">{(activeCountry.population / 1e6).toFixed(1)}M citizens</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Statistical division by population. Does not represent personal or legal liability.
          </div>
        </div>

        {/* Card 2: Debt Equivalent Per Tax Filer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Per Income-Tax Filer</span>
              <DollarSign className="w-4 h-4 text-emerald-400 cursor-help" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {formatCurrency(liveStats.debtPerTaxpayer, 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>{activeCountry.taxpayerDefinition}:</span>
              <span className="font-semibold text-slate-300">{(activeCountry.taxpayers / 1e6).toFixed(1)}M filers</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Source: {activeCountry.taxpayerSource}. Debt is sovereign-backed, not personal debt.
          </div>
        </div>

        {/* Card 3: Debt to GDP Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Debt-to-GDP Ratio</span>
              <Scale className="w-4 h-4 text-amber-400 cursor-help" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1">
              <span>{liveStats.debtToGdpRatio.toFixed(1)}%</span>
              <span className="text-xs font-bold text-slate-400 uppercase">of GDP</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Nominal GDP:</span>
              <span className="font-semibold text-slate-300">
                {formatCurrency(activeCountry.annualGdpLocal * liveStats.convFactor, 0, true)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            {activeCountry.gdpSource} ({activeCountry.gdpReferencePeriod}).
          </div>
        </div>

        {/* Card 4: Annual Interest Expenditure */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Budget Interest Service</span>
              <TrendingUp className="w-4 h-4 text-rose-400 cursor-help" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-rose-400">
              {formatCurrency(liveStats.annualInterestCost, 0, true)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Avg Budget Rate / Sec:</span>
              <span className="font-semibold text-rose-300 font-mono">
                +{formatCurrency(liveStats.interestPerSecond, 1)}/s
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Annual budgetary allocation rate (Major Head 2049 / official accounts).
          </div>
        </div>
      </div>

      {/* 4. LIVE SESSION IMPACT: "Estimated Growth While Visiting This Page" */}
      <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Estimated Debt Added During Your Visit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {Math.floor(liveStats.sessionElapsedSeconds)}s elapsed
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Calculated from {activeCountry.name}&apos;s annualized net borrowing rate of +{formatCurrency(liveStats.growthPerSecDisplay, 2)}/sec:
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-mono text-2xl sm:text-3xl font-black text-rose-400">
            +{formatCurrency(liveStats.sessionDebtAccumulated, 2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Includes ~{formatCurrency(liveStats.sessionInterest, 2)} in annualized interest service cost
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE: DOCUMENTED REAL-WORLD SCALE PERSPECTIVE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>{activeCountry.name} Sovereign Debt in Project Benchmark Scale</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Illustrative comparison visualizing total sovereign debt against official project budgets.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Illustrative scale only (not debt liquidation)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCountry.equivalents.map((item, idx) => {
            const count = Math.floor(liveStats.totalDebtLocal / item.costLocal);
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1">{item.label}</div>
                  <div className="font-mono text-2xl font-black text-indigo-400 mt-2">
                    {count.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-medium">
                    {item.unit}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-800/80 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="text-slate-300 font-semibold">{item.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Benchmark Year:</span>
                    <span className="text-slate-300">{item.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. CITIZEN AMORTIZATION SIMULATION CALCULATOR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Hypothetical Citizen Amortization Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Mathematical simulation showing the theoretical timeframe if citizen contributions were allocated to amortize sovereign debt.
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
              Theoretical annual contribution: {formatCurrency(simMonthlyPerCitizen * 12 * activeCountry.population * liveStats.convFactor, 0, true)} / year across {(activeCountry.population / 1e6).toFixed(0)}M citizens.
            </p>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Time to amortize current debt:</span>
              <span className="font-mono text-base font-bold text-white">
                {Math.ceil(liveStats.totalDebtLocal / (simMonthlyPerCitizen * 12 * activeCountry.population))} Years
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Current debt per citizen (statistical):</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatCurrency(liveStats.debtPerCitizen, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Current debt per tax filer (statistical):</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {formatCurrency(liveStats.debtPerTaxpayer, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Economic Context:</span> Sovereign governments do not typically pay off their total national debt through citizen lump sums. Modern sovereign debt is rolled over and managed sustainably by keeping the debt growth rate lower than the nominal GDP growth rate.
        </div>
      </div>

      {/* 7. GLOBAL COMPARISON MATRIX & LEADERBOARD TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>World Sovereign Debt Leaderboard (Official Baselines)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standardized comparison across sovereign economies normalized in USD ($)
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
                <th className="py-3 px-4 text-right">Per Capita (USD)</th>
                <th className="py-3 px-4 text-right">Est. Borrowing / s</th>
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
                        setIndiaViewMode('CENTRAL');
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

      {/* 8. DATA, METHODOLOGY & OFFICIAL SOURCES SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Data Sources, Methodology &amp; Definitions
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of official source documents, formulas, and reporting boundaries.
            </p>
          </div>
        </div>

        {/* Definition Differences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-indigo-300">1. Central Govt Liabilities</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Total debt obligations of the Union Government alone (e.g. ₹185.27 Lakh Cr in India ~56.8% GDP), tracked directly in Union Budget Receipt documents.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-300">2. General Government Debt</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Consolidated debt of Central + all State/Provincial governments combined (e.g. ~81.3% GDP for India), used by IMF and RBI for macroeconomic health assessments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-300">3. Sovereign External Debt</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Debt owed to foreign creditors denominated in foreign currencies. For India, sovereign external debt is under 4% of total liabilities, insulating it from currency runs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-rose-300">4. Fiscal Deficit vs Total Debt</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Total Debt is the accumulated historical liability. Fiscal deficit is the net new borrowing in a single financial year (e.g. ₹16.13 Lakh Cr in FY 2024-25/26).
            </p>
          </div>
        </div>

        {/* Detailed Country Data Sheet */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Active Country Source Dossier: {activeCountry.name}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
              <div className="text-slate-500 font-semibold">Primary Source:</div>
              <div className="text-white font-medium mt-0.5">{activeCountry.primarySource}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">Reference Period:</div>
              <div className="text-white font-medium mt-0.5">{activeCountry.referencePeriod}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">Data Nature:</div>
              <div className="text-emerald-400 font-medium mt-0.5">Official Reported Baseline + Deterministic Model</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">Annual Net Borrowing Basis:</div>
              <div className="text-white font-medium mt-0.5">{activeCountry.annualGrowthBasis}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">Interest Expenditure Source:</div>
              <div className="text-white font-medium mt-0.5">{activeCountry.interestExpSource}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">Taxpayer / Filer Baseline:</div>
              <div className="text-white font-medium mt-0.5">{activeCountry.taxpayerDefinition} ({activeCountry.taxpayerSource})</div>
            </div>
          </div>
        </div>

        {/* Educational Note on FRBM Act */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Understanding India&apos;s FRBM Act &amp; Fiscal Glide Path</span>
          </h4>
          <p>
            Under India&apos;s <strong>Fiscal Responsibility and Budget Management (FRBM) Act</strong> and revised fiscal frameworks, the Union Government targets reducing the Central Fiscal Deficit to below <strong>4.5% of GDP by FY 2025–26</strong> and progressively steering General Government Debt towards sustainable macroeconomic benchmarks.
          </p>
          <p>
            Because over <strong>95% of India&apos;s sovereign liabilities are internal, rupee-denominated, and held by domestic institutions (RBI, commercial banks, and pension funds)</strong>, sovereign credit risk is structurally protected from external currency liquidity crises.
          </p>
        </div>
      </div>
    </div>
  );
};
