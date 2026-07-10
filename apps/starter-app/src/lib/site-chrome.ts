import type { Theme } from 'pumpkin-ts-models';

export interface SiteChromeLink {
  label: string;
  url: string;
}

export interface SiteChromeFooterColumn {
  title: string;
  links: SiteChromeLink[];
}

export interface SiteChromeConfig {
  variant?: 'catalog';
  brandSubtitle?: string;
  announcement?: {
    text?: string;
    linkText?: string;
    linkUrl?: string;
  };
  footer?: {
    brandName?: string;
    description?: string;
    phoneLabel?: string;
    phoneUrl?: string;
    address?: string;
    note?: string;
    columns?: SiteChromeFooterColumn[];
  };
}

interface ThemeWithSiteChrome extends Theme {
  siteChrome?: SiteChromeConfig;
}

export function getSiteChrome(theme: Theme): SiteChromeConfig | undefined {
  const chrome = (theme as ThemeWithSiteChrome).siteChrome;
  return chrome?.variant === 'catalog' ? chrome : undefined;
}

export function getSafeSiteHref(value: string | null | undefined, fallback = '#') {
  const candidate = value?.trim() ?? '';
  if (!candidate) return fallback;

  if (
    candidate.startsWith('/')
    || candidate.startsWith('#')
    || /^(https?:|mailto:|tel:)/i.test(candidate)
  ) {
    return candidate;
  }

  return fallback;
}
