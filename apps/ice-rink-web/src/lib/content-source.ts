import 'server-only';

import type { Page, Theme } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { getFallbackTheme } from '@/data';
import { fetchPage, fetchSitemapData, fetchTheme, type SitemapEntry } from '@/lib/pumpkin-api';
import { isStaticRenderMode } from '@/lib/render-mode';
import {
  getStaticPageSlugs,
  getStaticSitemapEntries,
  loadStaticPage,
  loadStaticTheme,
} from '@/lib/static-content';

export async function getPageForRender(site: ResolvedSite, slug: string): Promise<Page | null> {
  if (isStaticRenderMode()) {
    return loadStaticPage(site, slug);
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
  return getStaticPageSlugs(site).filter((slug) => slug !== 'home');
}
