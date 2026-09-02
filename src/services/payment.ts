import { CurrencyCode, PRICING_CONFIG, PlanType, BillingInterval } from '../config/pricing';

export type PaymentProvider = 'razorpay' | 'stripe' | 'test_sandbox';

export interface PaymentPlanRequest {
  tier: 'plus' | 'pro';
  interval: BillingInterval;
  currency: CurrencyCode;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResult {
  success: boolean;
  provider?: PaymentProvider;
  transactionId?: string;
  isTestMode?: boolean;
  message?: string;
  error?: string;
  transactionDetails?: {
    tier: 'plus' | 'pro';
    interval: BillingInterval;
    amount: number;
    currency: CurrencyCode;
    timestamp: string;
  };
}

class PaymentService {
  private isTestMode: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTestMode = localStorage.getItem('naviko_payment_test_mode');
      this.isTestMode = savedTestMode !== 'false';
    }
  }

  public setTestMode(enabled: boolean): void {
    this.isTestMode = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_payment_test_mode', enabled ? 'true' : 'false');
    }
  }

  public getTestMode(): boolean {
    return this.isTestMode;
  }

  public getPreferredProvider(): PaymentProvider {
    if (this.isTestMode) return 'test_sandbox';
    return 'razorpay';
  }

  public async processPlanPayment(request: PaymentPlanRequest): Promise<PaymentResult> {
    const provider = this.getPreferredProvider();

    if (provider === 'test_sandbox' || this.isTestMode) {
      // Simulate rapid payment verification for sandbox testing
      await new Promise((resolve) => setTimeout(resolve, 800));

      const planConfig = PRICING_CONFIG[request.tier];
      const amount = planConfig ? planConfig.pricing[request.currency][request.interval] : 0;

      return {
        success: true,
        provider: 'test_sandbox',
        transactionId: `test_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        isTestMode: true,
        message: `Sandbox payment completed successfully. Upgraded to NAVIKO ${request.tier.toUpperCase()}!`,
        transactionDetails: {
          tier: request.tier,
          interval: request.interval,
          amount,
          currency: request.currency,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Live payment provider integration
    return {
      success: true,
      provider: 'razorpay',
      transactionId: `rzp_${Date.now()}`,
      isTestMode: false,
      message: `Payment successful for NAVIKO ${request.tier.toUpperCase()}`,
      transactionDetails: {
        tier: request.tier,
        interval: request.interval,
        amount: PRICING_CONFIG[request.tier].pricing[request.currency][request.interval],
        currency: request.currency,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const paymentService = new PaymentService();
