import 'server-only';

import type { Page, Theme } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';

export interface SitemapEntry {
  pageSlug: string;
  lastModified: string;
}

interface SitemapResponse {
  tenantId: string;
  pages: SitemapEntry[];
  count: number;
}

const API_URL = (process.env.PUMPKIN_API_URL || 'http://localhost:5064').replace(/\/+$/, '');

function hasContentApiCredentials(site: ResolvedSite): boolean {
  if (!site.tenantId || !site.apiKey) {
    console.warn(
      `[ice-rink-web] Missing Pumpkin API env for ${site.key}: ${site.missingEnv.join(', ') || 'unknown'}`
    );
    return false;
  }

  return true;
}

function encodeSlugPath(slug: string): string {
  return slug
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

async function fetchJson<T>(
  url: string,
  site: ResolvedSite,
  revalidate: number
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${site.apiKey}`,
        Accept: 'application/json',
      },
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(`[ice-rink-web] ${response.status} ${response.statusText} for ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('[ice-rink-web] Pumpkin API fetch error:', error);
    return null;
  }
}

export async function fetchPage(site: ResolvedSite, slug: string): Promise<Page | null> {
  if (!hasContentApiCredentials(site)) return null;

  const encodedTenantId = encodeURIComponent(site.tenantId);
  const encodedSlug = encodeSlugPath(slug || 'home');
  const url = `${API_URL}/api/pages/${encodedTenantId}/${encodedSlug}`;

  return fetchJson<Page>(url, site, 60);
}

export async function fetchTheme(site: ResolvedSite): Promise<Theme | null> {
  if (!hasContentApiCredentials(site)) return null;

  const encodedTenantId = encodeURIComponent(site.tenantId);
  const url = `${API_URL}/api/themes/${encodedTenantId}`;

  return fetchJson<Theme>(url, site, 300);
}

export async function fetchSitemapData(site: ResolvedSite): Promise<SitemapEntry[]> {
  if (!hasContentApiCredentials(site)) return [];

  const encodedTenantId = encodeURIComponent(site.tenantId);
  const url = `${API_URL}/api/tenant/${encodedTenantId}/sitemap`;
  const response = await fetchJson<SitemapResponse>(url, site, 86400);

  return response?.pages ?? [];
}
