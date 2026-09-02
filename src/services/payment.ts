import { CurrencyCode, BillingInterval, PlanType } from '../config/pricing';
import { getApiUrl } from '../config/api';

export type SubscriptionState =
  | 'FREE'
  | 'PAYMENT_PENDING'
  | 'TRIAL_ACTIVE'
  | 'ACTIVE'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PaymentPlanRequest {
  tier: 'plus' | 'pro';
  interval: BillingInterval;
  currency: CurrencyCode;
  customerEmail?: string;
  customerName?: string;
  userId: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  status?: SubscriptionState;
  plan?: PlanType;
  message?: string;
  error?: string;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionState;
  plan: PlanType;
  hasActiveSubscription: boolean;
  isTrial?: boolean;
  trialUsed?: boolean;
  trialStartAt?: string | null;
  trialEndsAt?: string | null;
  remainingTrialDays?: number;
  remainingTrialHours?: number;
  startDate: string | null;
  renewalDate: string | null;
  billingInterval: BillingInterval;
  currency?: string;
}

class PaymentService {
  /**
   * Ensures the Razorpay Checkout JavaScript SDK is loaded on the page.
   */
  public async ensureRazorpayLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if ((window as any).Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        // If already loaded
        if ((window as any).Razorpay) {
          resolve(true);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Fetches public server configuration for Razorpay
   */
  public async getGatewayConfig(): Promise<{ keyId: string; isConfigured: boolean; isTestKey: boolean }> {
    try {
      const res = await fetch(getApiUrl('/api/subscription/config'));
      if (!res.ok) {
        return { keyId: '', isConfigured: false, isTestKey: false };
      }
      return await res.json();
    } catch {
      return { keyId: '', isConfigured: false, isTestKey: false };
    }
  }

  /**
   * Helper to retrieve authenticated headers with Bearer token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('naviko_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /**
   * Authoritative subscription status query to the trusted backend.
   */
  public async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
    try {
      const headers = this.getAuthHeaders();
      headers['x-user-id'] = userId;

      const res = await fetch(getApiUrl(`/api/subscription/status?userId=${encodeURIComponent(userId)}`), {
        headers,
      });

      if (!res.ok) {
        return {
          status: 'FREE',
          plan: 'free',
          hasActiveSubscription: false,
          startDate: null,
          renewalDate: null,
          billingInterval: 'yearly',
        };
      }

      return await res.json();
    } catch (err) {
      console.warn('Failed to query subscription status from backend:', err);
      return {
        status: 'FREE',
        plan: 'free',
        hasActiveSubscription: false,
        startDate: null,
        renewalDate: null,
        billingInterval: 'yearly',
      };
    }
  }

  /**
   * Initiates real Razorpay checkout process.
   * NEVER grants subscription on click.
   * Subscription is ONLY activated after successful backend HMAC SHA256 verification.
   */
  public async processPlanPayment(request: PaymentPlanRequest): Promise<PaymentResult> {
    // 1. Validate inputs
    if (!request.userId) {
      return {
        success: false,
        error: 'User ID is missing. Please refresh the page and try again.',
      };
    }

    if (request.tier !== 'plus' && request.tier !== 'pro') {
      return {
        success: false,
        error: 'Invalid plan selected. Only Plus and Pro tiers can be subscribed.',
      };
    }

    // 2. Load Razorpay Checkout SDK
    const isLoaded = await this.ensureRazorpayLoaded();
    if (!isLoaded || !(window as any).Razorpay) {
      return {
        success: false,
        error:
          'Unable to load Razorpay payment gateway script. Please check your internet connection and try again.',
      };
    }

    // 3. Request server to create a verified Razorpay Order
    let orderData: any;
    try {
      const res = await fetch(getApiUrl('/api/subscription/create-order'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          tier: request.tier,
          interval: request.interval,
          currency: request.currency,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
          userId: request.userId,
        }),
      });

      orderData = await res.json();
      if (!res.ok || !orderData.success) {
        return {
          success: false,
          error:
            orderData.error ||
            'Failed to create payment order. Please ensure Razorpay gateway credentials are configured.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to payment server.',
      };
    }

    const { orderId, amount, currency, keyId } = orderData;

    // 4. Open Razorpay Checkout modal
    return new Promise<PaymentResult>((resolve) => {
      let isSettled = false;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'NAVIKO',
        description: `NAVIKO ${request.tier.toUpperCase()} Plan (${request.interval})`,
        image: '/favicon.svg',
        order_id: orderId,
        prefill: {
          email: request.customerEmail || '',
          name: request.customerName || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 5. Send Razorpay payment credentials to the backend for cryptographic signature verification
          try {
            const verifyRes = await fetch(getApiUrl('/api/subscription/verify-payment'), {
              method: 'POST',
              headers: this.getAuthHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: request.userId,
                tier: request.tier,
                interval: request.interval,
              }),
            });

            const verifyResult = await verifyRes.json();

            if (!verifyRes.ok || !verifyResult.success) {
              isSettled = true;
              resolve({
                success: false,
                error:
                  verifyResult.error ||
                  'Payment signature verification failed. Premium access was not granted.',
              });
              return;
            }

            // ONLY HERE — after server verified signature — is payment considered successful!
            isSettled = true;
            resolve({
              success: true,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              status: 'ACTIVE',
              plan: verifyResult.plan,
              message: verifyResult.message || `Upgraded to NAVIKO ${request.tier.toUpperCase()} successfully!`,
            });
          } catch (verifyErr: any) {
            isSettled = true;
            resolve({
              success: false,
              error: verifyErr?.message || 'Server error while verifying Razorpay payment signature.',
            });
          }
        },
        modal: {
          ondismiss: () => {
            if (!isSettled) {
              isSettled = true;
              resolve({
                success: false,
                error: 'Payment window was closed before completion. No charges were made.',
              });
            }
          },
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (resp: any) => {
          if (!isSettled) {
            isSettled = true;
            const desc = resp?.error?.description || resp?.error?.reason || 'Payment failed.';
            resolve({
              success: false,
              error: `Razorpay payment failed: ${desc}`,
            });
          }
        });

        rzp.open();
      } catch (openErr: any) {
        if (!isSettled) {
          isSettled = true;
          resolve({
            success: false,
            error: openErr?.message || 'Failed to initialize Razorpay checkout interface.',
          });
        }
      }
    });
  }

  /**
   * Initiates the ₹1 7-day trial flow via Razorpay Checkout.
   * Securely creates a ₹1 (100 paise) order and verifies cryptographic signature before activating trial.
   */
  public async processTrialPayment(request: {
    userId: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<PaymentResult> {
    if (!request.userId) {
      return { success: false, error: 'User ID is missing. Please refresh the page.' };
    }

    const isLoaded = await this.ensureRazorpayLoaded();
    if (!isLoaded || !(window as any).Razorpay) {
      return {
        success: false,
        error: 'Unable to load Razorpay checkout interface. Please check your internet connection.',
      };
    }

    let orderData: any;
    try {
      const res = await fetch(getApiUrl('/api/subscription/create-trial-order'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userId: request.userId,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
        }),
      });

      orderData = await res.json();
      if (!res.ok || !orderData.success) {
        return {
          success: false,
          error:
            orderData.error ||
            'Failed to create ₹1 trial order. Please ensure Razorpay gateway credentials are configured.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to trial payment server.',
      };
    }

    const { orderId, amount, currency, keyId } = orderData;

    return new Promise<PaymentResult>((resolve) => {
      let isSettled = false;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'NAVIKO',
        description: '₹1 Premium Trial • 7 Days Access (No auto-renewal)',
        image: '/favicon.svg',
        order_id: orderId,
        prefill: {
          email: request.customerEmail || '',
          name: request.customerName || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch(getApiUrl('/api/subscription/verify-trial-payment'), {
              method: 'POST',
              headers: this.getAuthHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: request.userId,
              }),
            });

            const verifyResult = await verifyRes.json();

            if (!verifyRes.ok || !verifyResult.success) {
              isSettled = true;
              resolve({
                success: false,
                error:
                  verifyResult.error ||
                  'Payment signature verification failed. Trial access was not activated.',
              });
              return;
            }

            isSettled = true;
            resolve({
              success: true,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              status: 'TRIAL_ACTIVE',
              plan: 'trial',
              message:
                verifyResult.message ||
                '₹1 Trial payment verified successfully! Your 7-day NAVIKO Premium trial is now active.',
            });
          } catch (verifyErr: any) {
            isSettled = true;
            resolve({
              success: false,
              error: verifyErr?.message || 'Server error while verifying Razorpay trial payment signature.',
            });
          }
        },
        modal: {
          ondismiss: () => {
            if (!isSettled) {
              isSettled = true;
              resolve({
                success: false,
                error: 'Payment window was closed before completion. No charges were made.',
              });
            }
          },
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (resp: any) => {
          if (!isSettled) {
            isSettled = true;
            const desc = resp?.error?.description || resp?.error?.reason || 'Payment failed.';
            resolve({
              success: false,
              error: `Razorpay payment failed: ${desc}`,
            });
          }
        });

        rzp.open();
      } catch (openErr: any) {
        if (!isSettled) {
          isSettled = true;
          resolve({
            success: false,
            error: openErr?.message || 'Failed to initialize Razorpay checkout interface.',
          });
        }
      }
    });
  }

  /**
   * Request subscription cancellation on backend
   */
  public async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/subscription/cancel'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      return { success: data.success, error: data.error };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to cancel subscription' };
    }
  }

  /**
   * Authoritative backend authorization check for premium features/tools
   */
  public async authorizeFeature(
    userId: string,
    requiredTier: 'plus' | 'pro' = 'plus'
  ): Promise<{ authorized: boolean; plan: string; isTrial?: boolean; trialEndsAt?: string; message?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/subscription/authorize-feature'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, requiredTier }),
      });
      const data = await res.json();
      return {
        authorized: !!data.authorized,
        plan: data.plan || 'free',
        isTrial: !!data.isTrial,
        trialEndsAt: data.trialEndsAt,
        message: data.message,
      };
    } catch (err: any) {
      return {
        authorized: false,
        plan: 'free',
        message: err?.message || 'Feature authorization request failed.',
      };
    }
  }
}

export const paymentService = new PaymentService();
