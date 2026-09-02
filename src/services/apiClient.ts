import { getApiUrl } from '../config/api';

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  isHtml?: boolean;
  isEmpty?: boolean;
}

/**
 * Safely parses any fetch Response, guaranteeing it NEVER throws:
 * "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
 *
 * Robustly inspects:
 * - HTTP Status code (200, 400, 401, 403, 404, 500, 502, 503, 504, etc.)
 * - Content-Type header (application/json vs text/html vs empty)
 * - Response text body (empty string, HTML error pages, Cloudflare errors)
 * - Safe debug logging (URL, Status, Content-Type, Body empty flag, Parsed error)
 * - ZERO exposure of secrets, tokens, or credentials
 */
export async function parseSafeApiResponse<T = any>(
  res: Response,
  endpointLabel: string
): Promise<SafeApiResponse<T>> {
  const status = res.status;
  const contentType = (res.headers?.get('content-type') || '').toLowerCase();
  const url = res.url || endpointLabel;

  let rawText = '';
  try {
    rawText = await res.text();
  } catch (err: any) {
    const errorMsg = 'Unable to connect to the server. Please try again.';
    const debugDetails = `Unable to read response stream on ${endpointLabel} (HTTP ${status}): ${err?.message || 'Network read error'}`;
    logSafeApiDebug(url, status, contentType, true, debugDetails);
    return {
      ok: false,
      status,
      data: null,
      error: errorMsg,
      isEmpty: true,
    };
  }

  const trimmed = rawText.trim();
  const isEmpty = trimmed.length === 0;

  // 1. Handle completely empty response body (causes "Unexpected end of JSON input")
  if (isEmpty) {
    const errorMsg = 'Unable to connect to the server. Please try again.';
    const debugDetails = `API returned an empty response body (HTTP ${status} on ${endpointLabel}).`;
    logSafeApiDebug(url, status, contentType, true, debugDetails);
    return {
      ok: false,
      status,
      data: null,
      error: errorMsg,
      isEmpty: true,
    };
  }

  // 2. Handle HTML response pages (e.g. Cloudflare error pages, 404 SPA fallback, Nginx 502 error)
  const isHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head');

  if (isHtml) {
    const errorMsg = 'Unable to connect to the server. Please try again.';
    const debugDetails = `API returned an HTML page instead of JSON (HTTP ${status} on ${endpointLabel}). Potential SPA fallback or Cloudflare gateway error.`;
    logSafeApiDebug(url, status, contentType, false, debugDetails);
    return {
      ok: false,
      status,
      data: null,
      error: errorMsg,
      isHtml: true,
    };
  }

  // 3. Attempt JSON parse safely
  try {
    const data = JSON.parse(trimmed) as T;
    const isSuccess = res.ok && !(data as any)?.error && (data as any)?.success !== false;
    let parsedError: string | undefined;
    if (typeof (data as any)?.error === 'string') {
      parsedError = (data as any).error;
    } else if (typeof (data as any)?.error?.message === 'string') {
      parsedError = (data as any).error.message;
    } else if (typeof (data as any)?.message === 'string' && !res.ok) {
      parsedError = (data as any).message;
    } else if (!res.ok) {
      parsedError = `Request failed (HTTP ${status})`;
    }

    logSafeApiDebug(url, status, contentType, false, parsedError);

    return {
      ok: isSuccess,
      status,
      data,
      error: parsedError,
    };
  } catch (parseErr: any) {
    const errorMsg = 'Unable to connect to the server. Please try again.';
    const debugDetails = `JSON parse failed on ${endpointLabel} (HTTP ${status}): ${parseErr?.message || 'Invalid syntax'}`;
    logSafeApiDebug(url, status, contentType, false, debugDetails);
    return {
      ok: false,
      status,
      data: null,
      error: errorMsg,
    };
  }
}

/**
 * Safe development & runtime logger.
 * Explicitly satisfies Section 10:
 * - request URL
 * - HTTP status
 * - response Content-Type
 * - whether response body is empty
 * - parsed error message
 * - NEVER logs secrets, passwords, or credentials
 */
function logSafeApiDebug(
  url: string,
  status: number,
  contentType: string,
  isEmpty: boolean,
  parsedErrorMessage?: string
) {
  // Strip any accidental query token/secret params from the URL before logging
  const sanitizedUrl = url.replace(/(token|secret|key|password)=[^&]+/gi, '$1=[REDACTED]');

  const debugInfo = {
    requestUrl: sanitizedUrl,
    httpStatus: status,
    contentType: contentType || 'none',
    isBodyEmpty: isEmpty,
    parsedErrorMessage: parsedErrorMessage || null,
  };

  if (status >= 400 || parsedErrorMessage) {
    console.warn('[NAVIKO API DEBUG - ERROR]', debugInfo);
  } else {
    console.log('[NAVIKO API DEBUG - SUCCESS]', debugInfo);
  }
}

/**
 * Safe fetch wrapper that automatically routes through getApiUrl and parses with parseSafeApiResponse.
 */
export async function safeApiFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<SafeApiResponse<T>> {
  const url = getApiUrl(endpoint);
  try {
    const res = await fetch(url, options);
    return await parseSafeApiResponse<T>(res, endpoint);
  } catch (networkErr: any) {
    const errorMsg = 'Unable to connect to the server. Please try again.';
    const debugDetails = `Network connection failure reaching ${endpoint}: ${networkErr?.message || 'Unable to connect'}`;
    logSafeApiDebug(url, 0, 'none', true, debugDetails);
    return {
      ok: false,
      status: 0,
      data: null,
      error: errorMsg,
      isEmpty: true,
    };
  }
}
