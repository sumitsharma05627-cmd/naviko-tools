import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, RotateCcw, Scale } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'time' | 'data' | 'speed';

interface UnitDef {
  id: string;
  name: string;
  factor: number; // relative to base unit
  symbol: string;
}

const CATEGORIES: Record<UnitCategory, { name: string; base: string; units: UnitDef[] }> = {
  length: {
    name: 'Length & Distance',
    base: 'm',
    units: [
      { id: 'm', name: 'Meter', factor: 1, symbol: 'm' },
      { id: 'km', name: 'Kilometer', factor: 1000, symbol: 'km' },
      { id: 'cm', name: 'Centimeter', factor: 0.01, symbol: 'cm' },
      { id: 'mm', name: 'Millimeter', factor: 0.001, symbol: 'mm' },
      { id: 'mi', name: 'Mile', factor: 1609.344, symbol: 'mi' },
      { id: 'yd', name: 'Yard', factor: 0.9144, symbol: 'yd' },
      { id: 'ft', name: 'Foot', factor: 0.3048, symbol: 'ft' },
      { id: 'in', name: 'Inch', factor: 0.0254, symbol: 'in' },
      { id: 'nmi', name: 'Nautical Mile', factor: 1852, symbol: 'nmi' },
    ]
  },
  weight: {
    name: 'Weight & Mass',
    base: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram', factor: 1, symbol: 'kg' },
      { id: 'g', name: 'Gram', factor: 0.001, symbol: 'g' },
      { id: 'mg', name: 'Milligram', factor: 0.000001, symbol: 'mg' },
      { id: 'ton', name: 'Metric Ton', factor: 1000, symbol: 't' },
      { id: 'lb', name: 'Pound', factor: 0.45359237, symbol: 'lb' },
      { id: 'oz', name: 'Ounce', factor: 0.028349523, symbol: 'oz' },
      { id: 'st', name: 'Stone', factor: 6.35029318, symbol: 'st' },
    ]
  },
  temperature: {
    name: 'Temperature',
    base: 'C',
    units: [
      { id: 'C', name: 'Celsius', factor: 1, symbol: '°C' },
      { id: 'F', name: 'Fahrenheit', factor: 1, symbol: '°F' },
      { id: 'K', name: 'Kelvin', factor: 1, symbol: 'K' },
    ]
  },
  area: {
    name: 'Area',
    base: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter', factor: 1, symbol: 'm²' },
      { id: 'sqkm', name: 'Square Kilometer', factor: 1000000, symbol: 'km²' },
      { id: 'sqft', name: 'Square Foot', factor: 0.092903, symbol: 'ft²' },
      { id: 'sqyd', name: 'Square Yard', factor: 0.836127, symbol: 'yd²' },
      { id: 'acre', name: 'Acre', factor: 4046.8564224, symbol: 'ac' },
      { id: 'hectare', name: 'Hectare', factor: 10000, symbol: 'ha' },
      { id: 'sqmi', name: 'Square Mile', factor: 2589988.11, symbol: 'mi²' },
    ]
  },
  volume: {
    name: 'Volume',
    base: 'l',
    units: [
      { id: 'l', name: 'Liter', factor: 1, symbol: 'L' },
      { id: 'ml', name: 'Milliliter', factor: 0.001, symbol: 'mL' },
      { id: 'cum', name: 'Cubic Meter', factor: 1000, symbol: 'm³' },
      { id: 'gal', name: 'US Gallon', factor: 3.78541, symbol: 'gal' },
      { id: 'floz', name: 'US Fluid Ounce', factor: 0.0295735, symbol: 'fl oz' },
      { id: 'cuft', name: 'Cubic Foot', factor: 28.3168, symbol: 'ft³' },
    ]
  },
  time: {
    name: 'Time',
    base: 's',
    units: [
      { id: 's', name: 'Second', factor: 1, symbol: 's' },
      { id: 'ms', name: 'Millisecond', factor: 0.001, symbol: 'ms' },
      { id: 'min', name: 'Minute', factor: 60, symbol: 'min' },
      { id: 'h', name: 'Hour', factor: 3600, symbol: 'hr' },
      { id: 'd', name: 'Day', factor: 86400, symbol: 'd' },
      { id: 'wk', name: 'Week', factor: 604800, symbol: 'wk' },
      { id: 'yr', name: 'Year (365d)', factor: 31536000, symbol: 'yr' },
    ]
  },
  data: {
    name: 'Digital Data & Storage',
    base: 'B',
    units: [
      { id: 'B', name: 'Byte', factor: 1, symbol: 'B' },
      { id: 'KB', name: 'Kilobyte (KB)', factor: 1024, symbol: 'KB' },
      { id: 'MB', name: 'Megabyte (MB)', factor: 1024 * 1024, symbol: 'MB' },
      { id: 'GB', name: 'Gigabyte (GB)', factor: 1024 * 1024 * 1024, symbol: 'GB' },
      { id: 'TB', name: 'Terabyte (TB)', factor: Math.pow(1024, 4), symbol: 'TB' },
      { id: 'PB', name: 'Petabyte (PB)', factor: Math.pow(1024, 5), symbol: 'PB' },
    ]
  },
  speed: {
    name: 'Speed',
    base: 'mps',
    units: [
      { id: 'mps', name: 'Meter per second', factor: 1, symbol: 'm/s' },
      { id: 'kmh', name: 'Kilometer per hour', factor: 0.277778, symbol: 'km/h' },
      { id: 'mph', name: 'Miles per hour', factor: 0.44704, symbol: 'mph' },
      { id: 'knot', name: 'Knot', factor: 0.514444, symbol: 'kn' },
    ]
  }
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('10');
  const [copied, setCopied] = useState<boolean>(false);

  const currentCat = CATEGORIES[category];

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const firstTwo = CATEGORIES[newCat].units;
    setFromUnit(firstTwo[0].id);
    setToUnit(firstTwo[1] ? firstTwo[1].id : firstTwo[0].id);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const convert = (): number | null => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;

    if (category === 'temperature') {
      // Temperature conversion formulas
      if (fromUnit === toUnit) return val;
      let celsius = val;
      if (fromUnit === 'F') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      if (toUnit === 'C') return celsius;
      if (toUnit === 'F') return (celsius * 9) / 5 + 32;
      if (toUnit === 'K') return celsius + 273.15;
    } else {
      const fromFactor = currentCat.units.find((u) => u.id === fromUnit)?.factor || 1;
      const toFactor = currentCat.units.find((u) => u.id === toUnit)?.factor || 1;
      const baseVal = val * fromFactor;
      return baseVal / toFactor;
    }
    return null;
  };

  const convertedResult = convert();

  const fromUnitObj = currentCat.units.find((u) => u.id === fromUnit);
  const toUnitObj = currentCat.units.find((u) => u.id === toUnit);

  const handleCopy = () => {
    if (convertedResult !== null) {
      navigator.clipboard.writeText(convertedResult.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {(Object.keys(CATEGORIES) as UnitCategory[]).map((catKey) => {
          const cat = CATEGORIES[catKey];
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main Conversion Control */}
      <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Left Input (From) */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              From ({fromUnitObj?.name})
            </label>
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter amount..."
              className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 shadow-xs"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-500"
            >
              {currentCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Center Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 flex items-center justify-center transition-all"
              aria-label="Swap units"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Result (To) */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              To ({toUnitObj?.name})
            </label>
            <div className="w-full text-base font-bold px-4 py-3 bg-indigo-50/50 border border-indigo-200/60 rounded-xl text-indigo-950 truncate min-h-[48px] flex items-center">
              {convertedResult !== null ? (
                <span>{convertedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              ) : (
                <span className="text-slate-400 font-normal">--</span>
              )}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-indigo-500"
            >
              {currentCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setInputValue('')}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Input
        </button>

        <button
          onClick={handleCopy}
          disabled={convertedResult === null}
          className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Result!' : 'Copy Converted Value'}
        </button>
      </div>

      {/* Primary Result Box */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
          Conversion Result
        </div>
        <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
          {convertedResult !== null ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span>{inputValue} {fromUnitObj?.symbol}</span>
              <span className="text-indigo-400 font-light">=</span>
              <span className="text-emerald-400">
                {convertedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnitObj?.symbol}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-xl font-normal">Please enter a valid number</span>
          )}
        </div>
        <div className="text-xs text-indigo-200 font-mono mt-3">
          Category: {currentCat.name} • Precise Real-Time Arithmetic
        </div>
      </div>
    </div>
  );
};
