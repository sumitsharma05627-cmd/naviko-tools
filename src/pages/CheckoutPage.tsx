import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Crown,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Zap,
  CreditCard,
  QrCode,
  Building,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  PRICING_CONFIG,
  PlanType,
  BillingInterval,
  PlanId,
  resolveOfficialPricing,
  formatCurrencyPrice
} from '../config/pricing';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, user } = useAuth();
  const {
    currency,
    upgradeToTier,
    startTrial,
    subscriptionStatus,
    plan: currentPlan
  } = useSubscription();

  // Read initial plan from URL query param
  const getInitialPlanId = (): PlanId => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan') as PlanId;
      if (
        planParam === 'founding_member' ||
        planParam === 'premium_yearly' ||
        planParam === 'premium_monthly' ||
        planParam === 'plus_yearly' ||
        planParam === 'plus_monthly' ||
        planParam === 'business_yearly' ||
        planParam === 'business_monthly' ||
        planParam === 'custom_plan' ||
        planParam === 'trial'
      ) {
        return planParam;
      }
    }
    return 'premium_yearly'; // Default to best-value yearly
  };

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(getInitialPlanId);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [customSelections] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('naviko_custom_selections');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const officialPlan = resolveOfficialPricing({
    planId: selectedPlanId,
    currency,
    customSelections: selectedPlanId === 'custom_plan' ? customSelections : undefined,
  });

  const handleCompletePayment = async () => {
    if (!isAuthenticated || !user) {
      onNavigate(`/login?redirect=/checkout?plan=${selectedPlanId}`);
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (selectedPlanId === 'trial') {
        const res = await startTrial(user.email);
        if (res.success) {
          setStatusMessage({ type: 'success', text: res.message || 'Trial activated!' });
          setTimeout(() => onNavigate('/dashboard'), 1500);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Failed to start trial.' });
        }
      } else {
        const tier = officialPlan.tier as any;
        const interval = officialPlan.interval as BillingInterval;
        const res = await upgradeToTier(
          tier,
          interval,
          user.email,
          selectedPlanId === 'custom_plan' ? customSelections : undefined
        );

        if (res.success) {
          setStatusMessage({ type: 'success', text: res.message || 'Payment confirmed and plan activated!' });
          setTimeout(() => onNavigate('/dashboard'), 1500);
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Payment could not be completed. Please try again.'
          });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Unexpected payment error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/pricing')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans &amp; Pricing</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan Selection & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Secure Checkout
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Unlock NAVIKO's full productivity and wellness workspace.
              </p>
            </div>

            {/* Step 1: Select Plan Tier */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Step 1: Choose Your Plan
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  100% Satisfaction Guarantee
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Option Custom: Tailored Plan */}
                {selectedPlanId === 'custom_plan' && (
                  <label
                    onClick={() => setSelectedPlanId('custom_plan')}
                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 cursor-pointer shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="plan_choice"
                        checked={selectedPlanId === 'custom_plan'}
                        onChange={() => setSelectedPlanId('custom_plan')}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            Custom Tailored Subscription
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Custom Config
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {customSelections?.seats || 1} Seat{(customSelections?.seats || 1) > 1 ? 's' : ''} •{' '}
                          {customSelections?.aiTier ? customSelections.aiTier.toUpperCase() : 'STARTER'} AI •{' '}
                          {customSelections?.storageTier ? customSelections.storageTier.toUpperCase() : 'BASIC'} Storage
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-slate-950 dark:text-white">
                        {officialPlan.formattedPrice}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {officialPlan.interval === 'yearly' ? '/year' : '/month'}
                      </div>
                    </div>
                  </label>
                )}

                {/* Option A: Annual Premium */}
                <label
                  onClick={() => setSelectedPlanId('premium_yearly')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlanId === 'premium_yearly'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan_choice"
                      checked={selectedPlanId === 'premium_yearly'}
                      onChange={() => setSelectedPlanId('premium_yearly')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          Annual Premium Pass
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Best Value • Save 17%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Billed annually. Full unrestricted access for 12 months.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-950 dark:text-white">
                      ₹4,999
                    </div>
                    <div className="text-[10px] text-slate-400">/year (~₹416/mo)</div>
                  </div>
                </label>

                {/* Option B: Monthly Premium */}
                <label
                  onClick={() => setSelectedPlanId('premium_monthly')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlanId === 'premium_monthly'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan_choice"
                      checked={selectedPlanId === 'premium_monthly'}
                      onChange={() => setSelectedPlanId('premium_monthly')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          Monthly Premium Pass
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          Flexible
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Billed monthly. Cancel anytime in 1 click.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-950 dark:text-white">
                      ₹499
                    </div>
                    <div className="text-[10px] text-slate-400">/month</div>
                  </div>
                </label>

                {/* Option C: Founding Member Offer */}
                <label
                  onClick={() => setSelectedPlanId('founding_member')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlanId === 'founding_member'
                      ? 'border-amber-500 bg-gradient-to-r from-amber-50/50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan_choice"
                      checked={selectedPlanId === 'founding_member'}
                      onChange={() => setSelectedPlanId('founding_member')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-500" />
                          Founding Member Pass
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white px-2 py-0.5 rounded-full">
                          Lifetime Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        One-time payment. Permanent entitlement to all current &amp; future tools.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-amber-600 dark:text-amber-400">
                      ₹7,999
                    </div>
                    <div className="text-[10px] text-slate-400">One-time payment</div>
                  </div>
                </label>

                {/* Option D: ₹1 7-Day Trial */}
                <label
                  onClick={() => setSelectedPlanId('trial')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlanId === 'trial'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan_choice"
                      checked={selectedPlanId === 'trial'}
                      onChange={() => setSelectedPlanId('trial')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        7-Day Trial Pass
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Verify payment with ₹1 and test all premium tools for 7 days.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      ₹1
                    </div>
                    <div className="text-[10px] text-slate-400">7-day access</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Step 2: Payment Method
              </span>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">NetBanking</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Payments processed through 256-bit encrypted Razorpay Gateway. We never store card details.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              <h2 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Selected Plan</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {officialPlan.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Billing Term</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {officialPlan.interval === 'lifetime' ? 'One-Time Lifetime' : officialPlan.interval}
                  </span>
                </div>

                {officialPlan.customQuote ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Monthly Base Access</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {currency === 'INR' ? `₹${officialPlan.customQuote.baseMonthly}` : `$${officialPlan.customQuote.baseMonthly}`}
                      </span>
                    </div>
                    {officialPlan.customQuote.categoryAddon > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Tool Suites Add-on</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{currency === 'INR' ? `₹${officialPlan.customQuote.categoryAddon}` : `$${officialPlan.customQuote.categoryAddon}`}
                        </span>
                      </div>
                    )}
                    {officialPlan.customQuote.aiAddon > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">AI Tier Add-on</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{currency === 'INR' ? `₹${officialPlan.customQuote.aiAddon}` : `$${officialPlan.customQuote.aiAddon}`}
                        </span>
                      </div>
                    )}
                    {officialPlan.customQuote.seatCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Extra Team Seats</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{currency === 'INR' ? `₹${officialPlan.customQuote.seatCost}` : `$${officialPlan.customQuote.seatCost}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal Before Tax</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {officialPlan.customQuote.formattedSubtotal}
                      </span>
                    </div>
                    {officialPlan.customQuote.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Annual Discount (20%)</span>
                        <span>-{officialPlan.customQuote.formattedDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Applicable GST (18%)</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        +{officialPlan.customQuote.formattedTax}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {officialPlan.formattedPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Taxes &amp; Fees (GST 18%)</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Inclusive
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-base sm:text-lg font-black">
                  <span className="text-slate-900 dark:text-white">Total Due</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {officialPlan.formattedPrice}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🖨️ Print / Save Tax Estimate</span>
              </button>

              {/* Status Banner */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Account Check */}
              {!isAuthenticated ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Account Required</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Please log in or create an account so your subscription is tied to your email.
                  </p>
                  <button
                    onClick={() => onNavigate(`/login?redirect=/checkout?plan=${selectedPlanId}`)}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Purchasing as:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {user?.email}
                  </span>
                </div>
              )}

              {/* Complete Payment Button */}
              <button
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wide shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {selectedPlanId === 'trial'
                        ? 'Pay ₹1 to Start Trial'
                        : selectedPlanId === 'founding_member'
                        ? 'Claim Founding Membership'
                        : 'Get Premium Access'}
                    </span>
                  </>
                )}
              </button>

              {/* Security Assurance */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Immediate access to all 46+ tools and nutrition features</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Cancel anytime in 1 click from your account dashboard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>7-day risk-free money back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
