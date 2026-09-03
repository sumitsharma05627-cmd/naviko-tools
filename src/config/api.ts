/**
 * API Configuration helper for NAVIKO.
 *
 * Exclusively uses same-origin relative paths (/api/...) for all API requests.
 * No external backend URLs, no hardcoded domains, and no configuration required.
 */
export const getApiUrl = (endpoint: string): string => {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

