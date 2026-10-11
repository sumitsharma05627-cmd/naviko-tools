/**
 * NAVIKO Google AdSense Placement & Policy Controller
 *
 * Enforces strict compliance with Google AdSense Publisher Policies:
 * 1. Prohibits ads on screens without publisher content (login, signup, dashboard, account,
 *    settings, billing, checkout, legal, contact, 404, loading, and error states).
 * 2. Prohibits ads on locked tool states, paywalls, or thin result states.
 * 3. Restricts ads strictly to high-value public pages with substantial original publisher content:
 *    - Homepage (/)
 *    - Category & Hub pages (/tools, /student-tools, /finance-tools, /pdf-tools, /image-tools, /career-tools, /calculators, /health-tools)
 *    - Long-form Editorial Blog (/blog, /blog/:slug)
 *    - Unlocked Public Tools with complete Knowledge Base and FAQs
 * 4. Completely suppresses ads for NAVIKO Plus and Pro members.
 * 5. Coordinates SPA ad request pausing (pauseAdRequests) across route transitions.
 */

export interface AdPolicyContext {
  path?: string;
  isPremium?: boolean;
  isToolLocked?: boolean;
  hasSubstantialContent?: boolean;
}

/**
 * Routes that must NEVER display Google AdSense ads
 */
export const FORBIDDEN_AD_ROUTES: (string | RegExp)[] = [
  // Authentication & account recovery
  /^\/login/,
  /^\/signin/,
  /^\/signup/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/reset-password/,

  // User dashboards & private account management
  /^\/dashboard/,
  /^\/user-dashboard/,
  /^\/home-dashboard/,
  /^\/profile/,
  /^\/user-profile/,
  /^\/settings/,
  /^\/account-settings/,
  /^\/billing/,
  /^\/invoices/,
  /^\/account/,
  /^\/subscription/,
  /^\/my-plan/,

  // Monetization & checkout flows
  /^\/premium/,
  /^\/pricing/,
  /^\/pro/,
  /^\/upgrade/,
  /^\/cart/,
  /^\/checkout/,

  // Utility forms & legal documentation (screens without editorial publisher content)
  /^\/contact/,
  /^\/privacy/,
  /^\/privacy-policy/,
  /^\/terms/,
  /^\/terms-of-service/,
  /^\/disclaimer/,

  // Error & missing pages
  /^\/404/,
];

/**
 * Public routes explicitly authorized for ads due to substantial publisher content
 */
export const ALLOWED_AD_HUB_ROUTES = new Set([
  '/',
  '/tools',
  '/student-tools',
  '/finance-tools',
  '/pdf-tools',
  '/image-tools',
  '/career-tools',
  '/calculators',
  '/health-tools',
  '/blog',
]);

/**
 * Checks whether a given route and context is authorized for Google AdSense placements
 */
export function isAdPlacementAllowed(context: AdPolicyContext): boolean {
  // 1. Paid subscribers receive 100% ad-free experience
  if (context.isPremium) return false;

  // 2. Locked tools / paywall states have no active utility content for the user
  if (context.isToolLocked) return false;

  // 3. Flags for thin states
  if (context.hasSubstantialContent === false) return false;

  const rawPath = context.path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const cleanPath = rawPath.toLowerCase().trim().replace(/\/$/, '') || '/';

  // 4. Check forbidden route patterns
  for (const pattern of FORBIDDEN_AD_ROUTES) {
    if (typeof pattern === 'string' && cleanPath === pattern) {
      return false;
    }
    if (pattern instanceof RegExp && pattern.test(cleanPath)) {
      return false;
    }
  }

  // 5. Check allowed Hub / Directory / Blog routes
  if (ALLOWED_AD_HUB_ROUTES.has(cleanPath)) {
    return true;
  }

  // 6. Blog article details (/blog/:slug) are rich editorial publisher content
  if (cleanPath.startsWith('/blog/')) {
    return true;
  }

  // 7. Individual Tool Routes (/tools/:slug, /student-tools/:slug, etc.)
  // Allowed ONLY when tool is unlocked and accompanied by full publisher documentation
  if (
    cleanPath.startsWith('/tools/') ||
    cleanPath.startsWith('/student-tools/') ||
    cleanPath.startsWith('/finance-tools/') ||
    cleanPath.startsWith('/pdf-tools/') ||
    cleanPath.startsWith('/health-tools/') ||
    cleanPath.startsWith('/calculators/') ||
    cleanPath.startsWith('/image-tools/') ||
    cleanPath.startsWith('/career-tools/')
  ) {
    return true;
  }

  // By default, disallow unrecognized routes to avoid inadvertent ad leakage
  return false;
}

/**
 * Updates Google AdSense SPA request state during route navigation
 */
export function syncAdSenseRoutePolicy(path: string, isPremium: boolean = false): void {
  if (typeof window === 'undefined') return;

  const allowed = isAdPlacementAllowed({ path, isPremium });

  try {
    const adsbygoogle = ((window as any).adsbygoogle = (window as any).adsbygoogle || []);
    // Signal AdSense to pause auto-ad injection on screens without publisher content
    adsbygoogle.pauseAdRequests = allowed ? 0 : 1;
  } catch (e) {
    // Gracefully handle ad-blocker environments
  }
}
