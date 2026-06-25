import 'server-only';

import type { Page, Theme } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { getFallbackHome, getFallbackPage, getFallbackTheme } from '@/data';
import { fetchPage, fetchSitemapData, fetchTheme, type SitemapEntry } from '@/lib/pumpkin-api';
import { getStaticContentSource, isStaticRenderMode } from '@/lib/render-mode';
import {
  getStaticPageSlugs,
  getStaticSitemapEntries,
  loadStaticPage,
  loadStaticTheme,
} from '@/lib/static-content';

const iceRecoveredStaticSlugs = ['home', 'service-areas', 'contact'];

function getIceRecoveredStaticPage(site: ResolvedSite, slug: string): Page | null {
  if (site.key !== 'ice-rink-rentals' || getStaticContentSource() !== 'seed-sites') {
    return null;
  }

  const normalizedSlug = slug === '/' || !slug ? 'home' : slug.replace(/^\/+|\/+$/g, '');
  if (!iceRecoveredStaticSlugs.includes(normalizedSlug)) return null;

  return normalizedSlug === 'home' ? getFallbackHome(site) : getFallbackPage(site, normalizedSlug);
}

export async function getPageForRender(site: ResolvedSite, slug: string): Promise<Page | null> {
  if (isStaticRenderMode()) {
    return getIceRecoveredStaticPage(site, slug) ?? loadStaticPage(site, slug);
  }

  return fetchPage(site, slug);
}

export async function getThemeForRender(site: ResolvedSite): Promise<Theme | null> {
  if (isStaticRenderMode()) {
    return loadStaticTheme(site) ?? getFallbackTheme(site);
  }

  return fetchTheme(site);
}

export async function getSitemapEntriesForRender(site: ResolvedSite): Promise<SitemapEntry[] | null> {
  if (isStaticRenderMode()) {
    return getStaticSitemapEntries(site);
  }

  return fetchSitemapData(site);
}

export function getStaticSlugsForBuild(site: ResolvedSite): string[] {
  if (!isStaticRenderMode()) return [];
  if (site.key === 'ice-rink-rentals' && getStaticContentSource() === 'seed-sites') {
    return iceRecoveredStaticSlugs.filter((slug) => slug !== 'home');
  }

  return getStaticPageSlugs(site).filter((slug) => slug !== 'home');
}
