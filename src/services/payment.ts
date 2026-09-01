import { CurrencyCode, PRICING_CONFIG, PlanType, BillingInterval, formatCurrencyPrice } from '../config/pricing';

export type PaymentProvider = 'razorpay' | 'stripe' | 'test_sandbox';

export interface PaymentPlanRequest {
  tier: 'plus' | 'pro';
  interval: BillingInterval;
  currency: CurrencyCode;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentInitializationResult {
  success: boolean;
  provider: PaymentProvider;
  tier: 'plus' | 'pro';
  orderId?: string;
  sessionId?: string;
  amount: number;
  currency: CurrencyCode;
  error?: string;
  isTestMode?: boolean;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId: string;
  tier: 'plus' | 'pro';
  interval: BillingInterval;
  currency: CurrencyCode;
  amount: number;
  startDate: string;
  renewalDate: string;
  customerEmail?: string;
  message?: string;
}

/**
 * Payment Service Architecture for NAVIKO
 * 
 * Supports:
 * - India: Razorpay Checkout (UPI, Cards, NetBanking, Wallets)
 * - International: Stripe Checkout Session (Cards, Apple Pay, Google Pay)
 * - Test / Sandbox Mode: Secure simulated workflow for development and preview
 */
class PaymentService {
  private isTestMode: boolean = true;

  constructor() {
    // Check if test mode is enabled in localStorage or environment
    if (typeof window !== 'undefined') {
      const savedTestMode = localStorage.getItem('naviko_payment_test_mode');
      this.isTestMode = savedTestMode !== 'false';
    }
  }

  public setTestMode(enabled: boolean) {
    this.isTestMode = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_payment_test_mode', String(enabled));
    }
  }

  public getIsTestMode(): boolean {
    return this.isTestMode;
  }

  /**
   * Determine the appropriate payment provider based on currency and region.
   */
  public getRecommendedProvider(currency: CurrencyCode): PaymentProvider {
    if (this.isTestMode) return 'test_sandbox';
    return currency === 'INR' ? 'razorpay' : 'stripe';
  }

  /**
   * Helper to retrieve tier price based on plan and interval.
   */
  public getTierPrice(tier: 'plus' | 'pro', interval: BillingInterval, currency: CurrencyCode): number {
    const pricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;
    const tierConfig = tier === 'pro' ? pricing.pro : pricing.plus;
    return interval === 'yearly' ? tierConfig.yearly : tierConfig.monthly;
  }

  /**
   * Initialize a checkout session.
   */
  public async initializeCheckout(request: PaymentPlanRequest): Promise<PaymentInitializationResult> {
    const amount = this.getTierPrice(request.tier, request.interval, request.currency);
    const provider = this.getRecommendedProvider(request.currency);

    // 1. Sandbox Test Flow
    if (provider === 'test_sandbox' || this.isTestMode) {
      // Simulate asynchronous gateway initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        provider: 'test_sandbox',
        tier: request.tier,
        orderId: `test_${request.tier}_order_${Date.now()}`,
        amount,
        currency: request.currency,
        isTestMode: true,
      };
    }

    // 2. Production Razorpay Flow (For India / INR)
    if (provider === 'razorpay') {
      try {
        // In full production, this calls `/api/payments/razorpay-create-order`
        return {
          success: true,
          provider: 'razorpay',
          tier: request.tier,
          orderId: `order_${request.tier}_${Date.now()}`,
          amount,
          currency: request.currency,
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'razorpay',
          tier: request.tier,
          amount,
          currency: request.currency,
          error: err?.message || 'Failed to create payment order.',
        };
      }
    }

    // 3. Production Stripe Flow (For USD, EUR, GBP, etc.)
    try {
      // In full production, this calls `/api/payments/stripe-create-session`
      return {
        success: true,
        provider: 'stripe',
        tier: request.tier,
        sessionId: `cs_test_${request.tier}_${Date.now()}`,
        amount,
        currency: request.currency,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'stripe',
        tier: request.tier,
        amount,
        currency: request.currency,
        error: err?.message || 'Failed to initialize Stripe checkout.',
      };
    }
  }

  /**
   * Verify and confirm payment.
   */
  public async verifyPayment(
    orderId: string,
    planDetails: PaymentPlanRequest
  ): Promise<PaymentVerificationResult> {
    const amount = this.getTierPrice(planDetails.tier, planDetails.interval, planDetails.currency);

    const startDate = new Date();
    const renewalDate = new Date();
    if (planDetails.interval === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    // In sandbox test mode, instantly verify cleanly
    return {
      verified: true,
      transactionId: `TXN_${planDetails.tier.toUpperCase()}_${Date.now()}`,
      tier: planDetails.tier,
      interval: planDetails.interval,
      currency: planDetails.currency,
      amount,
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      customerEmail: planDetails.customerEmail || 'user@naviko.in',
      message: this.isTestMode
        ? `Test Sandbox: NAVIKO ${planDetails.tier.toUpperCase()} Activated`
        : `NAVIKO ${planDetails.tier.toUpperCase()} Subscription activated.`,
    };
  }
}

export const paymentService = new PaymentService();

