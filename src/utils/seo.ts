import { useEffect } from 'react';

export const CANONICAL_DOMAIN = 'https://naviko.in';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  robots?: string; // 'index, follow' | 'noindex, follow' | 'noindex, nofollow'
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Safely updates or creates a <meta> tag by name or property
 */
export const updateMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string): void => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Safely updates or creates the <link rel="canonical"> tag
 */
export const updateCanonicalUrl = (url: string): void => {
  if (typeof document === 'undefined') return;
  // Ensure the URL is clean and normalized with the canonical domain
  let cleanUrl = url;
  if (!cleanUrl.startsWith('http')) {
    const normalizedPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    cleanUrl = `${CANONICAL_DOMAIN}${normalizedPath}`;
  }
  // Strip trailing slash unless it is root
  if (cleanUrl !== `${CANONICAL_DOMAIN}/` && cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.replace(/\/+$/, '');
  }

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', cleanUrl);
};

/**
 * Safely injects or updates a JSON-LD structured data script
 */
export const updateJsonLd = (scriptId: string, data: Record<string, any> | Array<Record<string, any>> | null): void => {
  if (typeof document === 'undefined') return;
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!data) {
    if (scriptEl && scriptEl.parentNode) {
      scriptEl.parentNode.removeChild(scriptEl);
    }
    return;
  }

  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  try {
    scriptEl.textContent = JSON.stringify(data);
  } catch (err) {
    console.error('Failed to serialize JSON-LD script', err);
  }
};

/**
 * Comprehensive SEO management hook for React SPA components
 */
export const useSEO = ({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = `${CANONICAL_DOMAIN}/android-chrome-512x512.png`,
  jsonLd
}: SEOProps): void => {
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Meta description & robots
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'robots', robots);

    // 3. Canonical link
    const canonicalPath = canonical || (typeof window !== 'undefined' ? window.location.pathname : '/');
    updateCanonicalUrl(canonicalPath);

    // 4. OpenGraph metadata
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage);
    const resolvedCanonical = canonical?.startsWith('http')
      ? canonical
      : `${CANONICAL_DOMAIN}${canonical?.startsWith('/') ? canonical : `/${canonical || ''}`}`;
    updateMetaTag('property', 'og:url', resolvedCanonical);

    // 5. Twitter / X card metadata
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);
    updateMetaTag('name', 'twitter:url', resolvedCanonical);

    // 6. JSON-LD structured data
    const schemaScriptId = 'naviko-route-schema';
    if (jsonLd) {
      updateJsonLd(schemaScriptId, jsonLd);
    }

    return () => {
      // Optional cleanup of route-specific schema when unmounting
      if (jsonLd) {
        updateJsonLd(schemaScriptId, null);
      }
    };
  }, [title, description, canonical, robots, ogType, ogImage, JSON.stringify(jsonLd)]);
};
