import React, { useState, useMemo } from 'react';
import { 
  Tag, Percent, Copy, Check, ShoppingBag, Sparkles, 
  RotateCcw, ArrowRight, DollarSign, Calculator, HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const DiscountCalculator: React.FC = () => {
  const [mode, setMode] = useState<'standard' | 'bogo' | 'reverse'>('standard');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Standard Mode State
  const [originalPrice, setOriginalPrice] = useState<number>(2500);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [hasExtraDiscount, setHasExtraDiscount] = useState<boolean>(false);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // BOGO Mode State
  const [buyCount, setBuyCount] = useState<number>(2);
  const [getCount, setGetCount] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(800);

  // Reverse Mode State
  const [reverseMode, setReverseMode] = useState<'findOriginal' | 'findPercent'>('findOriginal');
  const [salePriceInput, setSalePriceInput] = useState<number>(1750);
  const [discountPercentInput, setDiscountPercentInput] = useState<number>(30);
  const [revOrigPriceInput, setRevOrigPriceInput] = useState<number>(2500);

  const [copied, setCopied] = useState<boolean>(false);

  const currencySymbol = CURRENCIES[currency]?.symbol || '₹';

  // Standard Calculations
  const standardCalc = useMemo(() => {
    const orig = Math.max(0, originalPrice);
    const d1 = Math.max(0, Math.min(100, discountPercent));
    const qty = Math.max(1, quantity);
    
    // First discount
    const priceAfterFirst = orig * (1 - d1 / 100);
    const firstSavings = orig * (d1 / 100);

    // Stacked second discount
    const d2 = hasExtraDiscount ? Math.max(0, Math.min(100, extraDiscountPercent)) : 0;
    const priceAfterSecond = priceAfterFirst * (1 - d2 / 100);
    const extraSavings = priceAfterFirst * (d2 / 100);

    // Total discount before tax
    const totalSavingsPerUnit = firstSavings + extraSavings;
    const effectiveDiscountPercent = orig > 0 ? (totalSavingsPerUnit / orig) * 100 : 0;

    // Tax calculation
    const taxRate = Math.max(0, taxPercent);
    const taxAmountPerUnit = priceAfterSecond * (taxRate / 100);
    const finalPricePerUnit = priceAfterSecond + taxAmountPerUnit;

    // Totals for full quantity
    const totalOriginal = orig * qty;
    const totalSavings = totalSavingsPerUnit * qty;
    const totalFinal = finalPricePerUnit * qty;
    const totalTax = taxAmountPerUnit * qty;

    return {
      priceAfterFirst,
      priceAfterSecond,
      firstSavings,
      extraSavings,
      totalSavingsPerUnit,
      effectiveDiscountPercent,
      taxAmountPerUnit,
      finalPricePerUnit,
      totalOriginal,
      totalSavings,
      totalFinal,
      totalTax
    };
  }, [originalPrice, discountPercent, hasExtraDiscount, extraDiscountPercent, taxPercent, quantity]);

  // BOGO Calculations
  const bogoCalc = useMemo(() => {
    const buy = Math.max(1, buyCount);
    const free = Math.max(1, getCount);
    const price = Math.max(0, itemUnitPrice);

    const totalItems = buy + free;
    const totalFullPrice = totalItems * price;
    const totalPaid = buy * price;
    const totalSaved = free * price;
    const effectiveDiscount = (totalSaved / totalFullPrice) * 100;
    const effectivePricePerItem = totalPaid / totalItems;

    return {
      totalItems,
      totalFullPrice,
      totalPaid,
      totalSaved,
      effectiveDiscount,
      effectivePricePerItem
    };
  }, [buyCount, getCount, itemUnitPrice]);

  // Reverse Calculations
  const reverseCalc = useMemo(() => {
    if (reverseMode === 'findOriginal') {
      const sale = Math.max(0, salePriceInput);
      const disc = Math.max(0, Math.min(99.99, discountPercentInput));
      const original = disc < 100 ? sale / (1 - disc / 100) : sale;
      const saved = original - sale;
      return {
        result: Math.round(original),
        saved: Math.round(saved),
        label: 'Calculated Original Price'
      };
    } else {
      const orig = Math.max(0.01, revOrigPriceInput);
      const sale = Math.max(0, salePriceInput);
      const saved = orig - sale;
      const discPercent = (saved / orig) * 100;
      return {
        result: Math.max(0, Number(discPercent.toFixed(2))),
        saved: Math.max(0, Math.round(saved)),
        label: 'Calculated Discount Percentage'
      };
    }
  }, [reverseMode, salePriceInput, discountPercentInput, revOrigPriceInput]);

  const handleCopySummary = () => {
    let summary = '';
    if (mode === 'standard') {
      summary = `🏷️ Discount Summary:\n• Original: ${formatCurrency(standardCalc.totalOriginal, currency)}\n• Final Pay: ${formatCurrency(standardCalc.totalFinal, currency)}\n• You Saved: ${formatCurrency(standardCalc.totalSavings, currency)} (${standardCalc.effectiveDiscountPercent.toFixed(1)}% off)`;
    } else if (mode === 'bogo') {
      summary = `🎁 Buy ${buyCount} Get ${getCount} Free:\n• Total Items: ${bogoCalc.totalItems}\n• Total Paid: ${formatCurrency(bogoCalc.totalPaid, currency)}\n• Total Saved: ${formatCurrency(bogoCalc.totalSaved, currency)} (${bogoCalc.effectiveDiscount.toFixed(1)}% effective off)`;
    } else {
      summary = `🔍 Reverse Discount:\n• ${reverseCalc.label}: ${reverseMode === 'findOriginal' ? formatCurrency(reverseCalc.result, currency) : `${reverseCalc.result}%`}`;
    }

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setMode('standard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏷️ Standard & Double Discount
          </button>
          <button
            onClick={() => setMode('bogo')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'bogo'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎁 Buy X Get Y Free
          </button>
          <button
            onClick={() => setMode('reverse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'reverse'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔍 Reverse Calc
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {CURRENCIES[c as CurrencyCode].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODE 1: Standard & Stacked Discount */}
      {mode === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span>Original Price ({currencySymbol})</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {formatCurrency(originalPrice, currency)}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  placeholder="e.g. 2500"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Discount Slider & Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Discount Percentage</span>
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg font-mono font-bold text-sm">
                  {discountPercent}% OFF
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10, 15, 20, 25, 30, 40, 50, 60, 70].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      discountPercent === pct
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Extra / Stacked Discount Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Additional &apos;Stacked&apos; Discount (e.g. Extra coupon)
                  </span>
                  <span className="text-xs text-slate-500">
                    Apply secondary discount on top of the already reduced price
                  </span>
                </div>
                <button
                  onClick={() => setHasExtraDiscount(!hasExtraDiscount)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    hasExtraDiscount ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      hasExtraDiscount ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {hasExtraDiscount && (
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 space-y-2 animate-in fade-in duration-200">
                  <div className="flex justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span>Extra Coupon Discount</span>
                    <span className="font-mono">{extraDiscountPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={extraDiscountPercent}
                    onChange={(e) => setExtraDiscountPercent(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Quantity & Sales Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity / Items
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sales Tax / VAT (%) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxPercent || ''}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  placeholder="e.g. 5, 12, 18"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Results Output Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
              {/* Savings Ribbon */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Best Deal Result
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-black">
                  {standardCalc.effectiveDiscountPercent.toFixed(1)}% OFF Total
                </span>
              </div>

              {/* Final Price Display */}
              <div className="space-y-1 mb-6">
                <span className="text-xs text-slate-400 font-medium">You Pay:</span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                  {formatCurrency(standardCalc.totalFinal, currency)}
                </div>
                {quantity > 1 && (
                  <div className="text-xs text-slate-400 font-mono pt-1">
                    ({formatCurrency(standardCalc.finalPricePerUnit, currency)} per item)
                  </div>
                )}
              </div>

              {/* Savings Highlights */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-300">Original Total:</span>
                  <span className="text-slate-400 line-through font-mono">
                    {formatCurrency(standardCalc.totalOriginal, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-emerald-300 font-bold">Total Savings:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    -{formatCurrency(standardCalc.totalSavings, currency)}
                  </span>
                </div>
                {standardCalc.totalTax > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-white/10">
                    <span>Includes Tax ({taxPercent}%):</span>
                    <span className="font-mono">+{formatCurrency(standardCalc.totalTax, currency)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopySummary}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                  <span>{copied ? 'Copied Receipt!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handleTriggerConfetti}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Celebrate Deal"
                >
                  🎉
                </button>
              </div>
            </div>

            {/* Quick Price Tag Visual Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-500" /> Calculation Formula:
              </h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-slate-600 dark:text-slate-400 space-y-1">
                <div>1. Discount = {currencySymbol}{originalPrice} × {discountPercent}% = {currencySymbol}{Math.round(standardCalc.firstSavings)}</div>
                {hasExtraDiscount && (
                  <div>2. Extra Off = ({currencySymbol}{Math.round(standardCalc.priceAfterFirst)}) × {extraDiscountPercent}% = {currencySymbol}{Math.round(standardCalc.extraSavings)}</div>
                )}
                <div>3. Final = ({currencySymbol}{originalPrice} - {currencySymbol}{Math.round(standardCalc.totalSavingsPerUnit)}) {taxPercent > 0 ? `+ ${taxPercent}% Tax` : ''} = <strong>{currencySymbol}{Math.round(standardCalc.finalPricePerUnit)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Buy X Get Y Free (BOGO) */}
      {mode === 'bogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" /> &quot;Buy X, Get Y Free&quot; Promotion Optimizer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Buy Quantity (Paid)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBuyCount(Math.max(1, buyCount - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={buyCount}
                    onChange={(e) => setBuyCount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                  <button
                    onClick={() => setBuyCount(buyCount + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Get Quantity (Free)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGetCount(Math.max(1, getCount - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={getCount}
                    onChange={(e) => setGetCount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                  <button
                    onClick={() => setGetCount(getCount + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Unit Price Per Single Item ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={itemUnitPrice || ''}
                onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                placeholder="e.g. 800"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
              />
            </div>

            {/* Quick BOGO Archetype Presets */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Common Retail Deals:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { buy: 1, get: 1, label: 'Buy 1 Get 1 Free (50% Off)' },
                  { buy: 2, get: 1, label: 'Buy 2 Get 1 Free (33.3% Off)' },
                  { buy: 3, get: 2, label: 'Buy 3 Get 2 Free (40% Off)' },
                  { buy: 4, get: 1, label: 'Buy 4 Get 1 Free (20% Off)' },
                ].map((deal, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBuyCount(deal.buy);
                      setGetCount(deal.get);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      buyCount === deal.buy && getCount === deal.get
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {deal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-800/60 space-y-6">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Equivalent Deal Breakdown
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-2">
                {bogoCalc.effectiveDiscount.toFixed(1)}% OFF
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Equivalent flat percentage discount across all items.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Items in Cart:</span>
                <span className="font-bold text-white">{bogoCalc.totalItems} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Regular Value:</span>
                <span className="line-through text-slate-400 font-mono">
                  {formatCurrency(bogoCalc.totalFullPrice, currency)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold text-base pt-2 border-t border-white/10">
                <span>You Pay (for {buyCount}):</span>
                <span className="font-mono">{formatCurrency(bogoCalc.totalPaid, currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Effective Cost Per Item:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(bogoCalc.effectivePricePerItem, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Deal!' : 'Copy Deal Summary'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: Reverse Discount */}
      {mode === 'reverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setReverseMode('findOriginal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reverseMode === 'findOriginal'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Find Original Price (from Sale Price)
              </button>
              <button
                onClick={() => setReverseMode('findPercent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reverseMode === 'findPercent'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Find Discount % (from 2 Prices)
              </button>
            </div>

            {reverseMode === 'findOriginal' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Final / Sale Price You Paid ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salePriceInput || ''}
                    onChange={(e) => setSalePriceInput(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Discount Percentage Applied (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={discountPercentInput || ''}
                    onChange={(e) => setDiscountPercentInput(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Original Regular Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={revOrigPriceInput || ''}
                    onChange={(e) => setRevOrigPriceInput(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Discounted / Sale Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salePriceInput || ''}
                    onChange={(e) => setSalePriceInput(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
                  />
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-800/60 space-y-6">
            <div>
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                {reverseCalc.label}
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-purple-300 mt-2">
                {reverseMode === 'findOriginal'
                  ? formatCurrency(reverseCalc.result, currency)
                  : `${reverseCalc.result}% OFF`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Money Saved:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {formatCurrency(reverseCalc.saved, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
