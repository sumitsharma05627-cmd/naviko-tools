/**
 * API Configuration helper for NAVIKO.
 *
 * Defaults strictly to standard relative paths (/api/...) for same-domain deployments,
 * container hosting, reverse proxies, and Cloudflare.
 *
 * If a decoupled API backend is explicitly configured via VITE_API_URL, it will prepend it.
 * Otherwise, it never invents hostnames or calls localhost.
 */
export const getApiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const env = (import.meta as any)?.env;
  const envUrl = env?.VITE_API_URL ? String(env.VITE_API_URL).trim() : '';

  // Only use external URL if it is a non-empty absolute URL (http:// or https://)
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    const base = envUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }

  // Strictly relative path for all same-domain and production deployments
  return path;
};
