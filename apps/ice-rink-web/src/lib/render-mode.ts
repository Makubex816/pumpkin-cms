import 'server-only';

import type { SiteKey } from '@/config/sites';

export type PumpkinRenderMode = 'runtime' | 'static';

const validSiteKeys = new Set<SiteKey>(['ice-rink-rentals', 'roller-rink-rentals']);
const defaultStaticFormEndpoints: Partial<Record<SiteKey, string>> = {
  'ice-rink-rentals': '/api/static-contact',
};

export function getRenderMode(): PumpkinRenderMode {
  return process.env.PUMPKIN_RENDER_MODE === 'static' ? 'static' : 'runtime';
}

export function isStaticRenderMode(): boolean {
  return getRenderMode() === 'static';
}

export function getStaticSiteKey(): SiteKey | null {
  const rawSiteKey = process.env.STATIC_SITE_KEY || process.env.SITE_KEY || '';
  return validSiteKeys.has(rawSiteKey as SiteKey) ? rawSiteKey as SiteKey : null;
}

export function getStaticContentSource(): string {
  return process.env.STATIC_CONTENT_SOURCE || 'seed-sites';
}

export function getStaticFormAction(): string {
  return getStaticFormEndpoint();
}

export function getStaticFormEndpoint(): string {
  const configuredEndpoint = (
    process.env.NEXT_PUBLIC_STATIC_FORM_ENDPOINT ||
    process.env.STATIC_FORM_ENDPOINT ||
    process.env.NEXT_PUBLIC_STATIC_FORM_ACTION ||
    process.env.STATIC_FORM_ACTION ||
    ''
  );

  if (configuredEndpoint) return configuredEndpoint;
  if (!isStaticRenderMode()) return '';

  const staticSiteKey = getStaticSiteKey();
  return staticSiteKey ? defaultStaticFormEndpoints[staticSiteKey] || '' : '';
}
