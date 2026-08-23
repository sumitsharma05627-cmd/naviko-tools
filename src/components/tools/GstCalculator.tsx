import React, { useState, useMemo } from 'react';
import { 
  Percent, Copy, Check, FileText, Printer, Plus, Trash2, 
  HelpCircle, ShieldCheck, Sparkles, Building2, Layers
} from 'lucide-react';
import { formatCurrency, formatNumberWords } from '../../utils/finance';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gstRate: number;
}

export const GstCalculator: React.FC = () => {
  const [calculationType, setCalculationType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [amount, setAmount] = useState<number>(10000);
  const [selectedGstRate, setSelectedGstRate] = useState<number>(18);
  const [customRate, setCustomRate] = useState<string>('');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra'); // intra = CGST+SGST, inter = IGST
  const [activeTab, setActiveTab] = useState<'single' | 'invoice' | 'slabs'>('single');
  const [copied, setCopied] = useState(false);

  // Multi-item invoice state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', name: 'Software Consulting / Design', price: 25000, quantity: 1, gstRate: 18 },
    { id: '2', name: 'Hardware / Electronics Item', price: 4500, quantity: 2, gstRate: 18 },
    { id: '3', name: 'Office Stationery & Books', price: 800, quantity: 3, gstRate: 12 },
  ]);

  const activeRate = customRate !== '' ? Number(customRate) || 0 : selectedGstRate;

  // Single Item GST Math
  const singleCalc = useMemo(() => {
    const rawAmount = Math.max(0, amount);
    const rate = Math.max(0, activeRate);

    if (calculationType === 'exclusive') {
      // Add GST (Net + Tax = Total)
      const basePrice = rawAmount;
      const gstAmount = (basePrice * rate) / 100;
      const totalAmount = basePrice + gstAmount;
      const cgst = supplyType === 'intra' ? gstAmount / 2 : 0;
      const sgst = supplyType === 'intra' ? gstAmount / 2 : 0;
      const igst = supplyType === 'inter' ? gstAmount : 0;

      return {
        basePrice,
        gstAmount,
        totalAmount,
        cgst,
        sgst,
        igst,
        rate
      };
    } else {
      // Remove GST (MRP inclusive -> Base Price & GST)
      const totalAmount = rawAmount;
      const basePrice = totalAmount / (1 + rate / 100);
      const gstAmount = totalAmount - basePrice;
      const cgst = supplyType === 'intra' ? gstAmount / 2 : 0;
      const sgst = supplyType === 'intra' ? gstAmount / 2 : 0;
      const igst = supplyType === 'inter' ? gstAmount : 0;

      return {
        basePrice,
        gstAmount,
        totalAmount,
        cgst,
        sgst,
        igst,
        rate
      };
    }
  }, [calculationType, amount, activeRate, supplyType]);

  // Invoice Calculator Math
  const invoiceCalc = useMemo(() => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalGst = 0;

    const itemDetails = invoiceItems.map((item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemTax = (itemSubtotal * item.gstRate) / 100;
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      totalGst += itemTax;
      if (supplyType === 'intra') {
        totalCgst += itemTax / 2;
        totalSgst += itemTax / 2;
      } else {
        totalIgst += itemTax;
      }

      return {
        ...item,
        itemSubtotal,
        itemTax,
        itemTotal
      };
    });

    const grandTotal = subtotal + totalGst;

    return {
      subtotal,
      totalGst,
      totalCgst,
      totalSgst,
      totalIgst,
      grandTotal,
      itemDetails
    };
  }, [invoiceItems, supplyType]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: 'New Product / Service',
      price: 1000,
      quantity: 1,
      gstRate: 18
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleCopySummary = () => {
    const summary = `🇮🇳 GST Calculation Summary (${calculationType === 'exclusive' ? 'Add GST' : 'Remove GST'}):\n• Base Net Price: ₹${Math.round(singleCalc.basePrice).toLocaleString('en-IN')}\n• GST Rate: ${singleCalc.rate}%\n• Total GST: ₹${Math.round(singleCalc.gstAmount).toLocaleString('en-IN')}${supplyType === 'intra' ? ` (CGST: ₹${Math.round(singleCalc.cgst).toLocaleString('en-IN')}, SGST: ₹${Math.round(singleCalc.sgst).toLocaleString('en-IN')})` : ` (IGST: ₹${Math.round(singleCalc.igst).toLocaleString('en-IN')})`}\n• Final Gross Amount: ₹${Math.round(singleCalc.totalAmount).toLocaleString('en-IN')}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Tab Navigator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🇮🇳 Quick GST Calculator
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'invoice'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📄 Multi-Item GST Bill
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'slabs'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 GST Slab Rates Guide
          </button>
        </div>

        {/* State Supply Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Supply:</span>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setSupplyType('intra')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                supplyType === 'intra'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Intra-State: Within same state (CGST + SGST)"
            >
              Intra-State (CGST+SGST)
            </button>
            <button
              onClick={() => setSupplyType('inter')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                supplyType === 'inter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Inter-State: Outside state (IGST)"
            >
              Inter-State (IGST)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Quick GST Calculator */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
            {/* Calculation Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                onClick={() => setCalculationType('exclusive')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  calculationType === 'exclusive'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ➕ Add GST (Exclusive)
              </button>
              <button
                onClick={() => setCalculationType('inclusive')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  calculationType === 'inclusive'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ➖ Remove GST (Inclusive / MRP)
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span>
                  {calculationType === 'exclusive' ? 'Base / Net Amount (₹)' : 'Total Price with GST / MRP (₹)'}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 10000"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                {formatNumberWords(amount, 'INR')} Rupees
              </p>
            </div>

            {/* Indian GST Slab Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Indian GST Slab Rate
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[0, 3, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSelectedGstRate(rate);
                      setCustomRate('');
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center font-mono font-bold text-sm transition-all cursor-pointer ${
                      customRate === '' && selectedGstRate === rate
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {rate}%
                    <span className="block text-[9px] opacity-70 font-normal font-sans">
                      {rate === 0
                        ? 'Exempt'
                        : rate === 3
                        ? 'Gold'
                        : rate === 5
                        ? 'Essential'
                        : rate === 12
                        ? 'Standard'
                        : rate === 18
                        ? 'Common'
                        : 'Luxury'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Rate Input */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Or enter custom rate:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder="e.g. 0.25, 7.5"
                    className="w-28 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Quick Helper Notes */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> GST Structure Note:
              </div>
              <p>
                {supplyType === 'intra'
                  ? 'Intra-State: Tax split equally into Central GST (CGST 50%) and State GST (SGST 50%).'
                  : 'Inter-State: Integrated GST (IGST 100%) applied for inter-state supply to the Central Government.'}
              </p>
            </div>
          </div>

          {/* Result Output Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Tax Invoice Summary
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
                  {singleCalc.rate}% GST
                </span>
              </div>

              {/* Total Gross Amount Display */}
              <div className="space-y-1 mb-6">
                <span className="text-xs text-slate-400 font-medium">
                  {calculationType === 'exclusive' ? 'Total Amount (Gross with Tax)' : 'Net Base Amount (Excluding Tax)'}
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                  ₹{Math.round(singleCalc.totalAmount).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 font-mono pt-1">
                  {formatNumberWords(singleCalc.totalAmount, 'INR')} Rupees
                </div>
              </div>

              {/* Itemized Tax Breakdown */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-300">Net Base Price:</span>
                  <span className="font-mono font-bold text-white">
                    ₹{Math.round(singleCalc.basePrice).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-emerald-300 font-bold">Total GST Tax ({singleCalc.rate}%):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +₹{Math.round(singleCalc.gstAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                {supplyType === 'intra' ? (
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">CGST ({(singleCalc.rate / 2).toFixed(1)}%): </span>
                      <span className="font-mono font-bold text-slate-200">
                        ₹{Math.round(singleCalc.cgst).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">SGST ({(singleCalc.rate / 2).toFixed(1)}%): </span>
                      <span className="font-mono font-bold text-slate-200">
                        ₹{Math.round(singleCalc.sgst).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/10 text-xs flex justify-between">
                    <span className="text-slate-400">IGST ({singleCalc.rate}%): </span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{Math.round(singleCalc.igst).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopySummary}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                <span>{copied ? 'Copied GST Breakdown!' : 'Copy GST Summary'}</span>
              </button>
            </div>

            {/* Formula Explainer */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" /> Calculation Formula:
              </h4>
              {calculationType === 'exclusive' ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>GST Amount = (Base Price × GST%) / 100</div>
                  <div>Total Amount = Base Price + GST Amount</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold pt-1">
                    ₹{amount} + (₹{amount} × {singleCalc.rate}%) = ₹{Math.round(singleCalc.totalAmount)}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Base Price = Total Price / (1 + GST% / 100)</div>
                  <div>GST Amount = Total Price - Base Price</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold pt-1">
                    ₹{amount} / (1 + {singleCalc.rate / 100}) = ₹{Math.round(singleCalc.basePrice)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Item GST Bill Generator */}
      {activeTab === 'invoice' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors print:p-0 print:border-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> GST Tax Invoice Generator
              </h3>
              <p className="text-xs text-slate-500">
                Add multiple items with custom GST rates to generate an itemized invoice bill.
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3">Item Description</th>
                  <th className="py-3 px-3">Rate (₹)</th>
                  <th className="py-3 px-3">Qty</th>
                  <th className="py-3 px-3">GST %</th>
                  <th className="py-3 px-3">Tax (₹)</th>
                  <th className="py-3 px-3">Total (₹)</th>
                  <th className="py-3 px-2 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoiceCalc.itemDetails.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent font-medium text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(item.id, 'price', Number(e.target.value))}
                        className="w-24 bg-transparent font-mono font-bold text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="w-14 bg-transparent font-mono font-bold text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleUpdateItem(item.id, 'gstRate', Number(e.target.value))}
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 dark:text-slate-200 outline-none"
                      >
                        {[0, 3, 5, 12, 18, 28].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      ₹{Math.round(item.itemTax).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{Math.round(item.itemTotal).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2 text-right print:hidden">
                      {invoiceItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="w-full sm:w-80 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Net):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{Math.round(invoiceCalc.subtotal).toLocaleString('en-IN')}
                </span>
              </div>
              {supplyType === 'intra' ? (
                <>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total CGST:</span>
                    <span className="font-mono font-bold">
                      ₹{Math.round(invoiceCalc.totalCgst).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total SGST:</span>
                    <span className="font-mono font-bold">
                      ₹{Math.round(invoiceCalc.totalSgst).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total IGST:</span>
                  <span className="font-mono font-bold">
                    ₹{Math.round(invoiceCalc.totalIgst).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono">₹{Math.round(invoiceCalc.grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GST Slab Rates Guide */}
      {activeTab === 'slabs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              rate: '0% (Exempt)',
              items: 'Fresh fruits, vegetables, milk, eggs, curd, unbranded flour, salt, bread, sanitary napkins, public education & health services.',
              color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            },
            {
              rate: '3% (Special)',
              items: 'Gold, silver, platinum, diamonds, precious & semi-precious stones, imitation jewelry.',
              color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
            },
            {
              rate: '5% (Essential)',
              items: 'Packaged food items, sugar, tea, coffee, edible oils, medicines, footwear under ₹1,000, apparel under ₹1,000, railways, economy flight tickets.',
              color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            },
            {
              rate: '12% (Standard I)',
              items: 'Computers, butter, ghee, frozen meat, fruit juices, Ayurvedic medicines, diagnostic kits, business class air tickets.',
              color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            },
            {
              rate: '18% (Standard II - Most Common)',
              items: 'Software services, banking & financial services, telecom, restaurants in hotels, capital goods, hair oil, toothpaste, printers, monitors.',
              color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
            },
            {
              rate: '28% (Luxury & Sin Goods)',
              items: 'Automobiles, motorcycles, air conditioners, refrigerators, dishwashers, aerated drinks, cigarettes, gaming consoles.',
              color: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
            },
          ].map((slab, i) => (
            <div key={i} className={`p-5 rounded-3xl border ${slab.color} space-y-2`}>
              <div className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                <span>{slab.rate}</span>
                <Layers className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {slab.items}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
