/**
 * API Configuration helper for NAVIKO.
 *
 * In local development or unified full-stack hosting, requests use relative paths (/api/...).
 * When deployed to static platforms such as Cloudflare Pages with a decoupled API backend,
 * VITE_API_URL can be configured (e.g. https://api.naviko.in) to route API calls directly to the server.
 */
export const getApiUrl = (endpoint: string): string => {
  const env = (import.meta as any)?.env;
  const envUrl = env?.VITE_API_URL ? String(env.VITE_API_URL) : '';

  const base = envUrl.trim().replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};
