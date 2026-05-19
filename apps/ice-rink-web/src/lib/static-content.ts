import 'server-only';

import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import type { Page, Theme } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { getStaticContentSource } from '@/lib/render-mode';

export interface StaticSitemapEntry {
  pageSlug: string;
  lastModified: string;
}

function getRepoRoot() {
  return path.resolve(process.cwd(), '../..');
}

function getSeedSitesRoot() {
  return path.join(getRepoRoot(), 'tools', 'ice-rink-local-seed', 'seed-sites');
}

function getStaticSiteRoot(site: ResolvedSite) {
  const source = getStaticContentSource();

  if (source === 'seed-sites') {
    return path.join(getSeedSitesRoot(), site.key);
  }

  if (source === 'cms-snapshot') {
    return path.join(process.cwd(), '.static-content-snapshots', site.key);
  }

  const explicitRoot = process.env.STATIC_CONTENT_DIR;
  if (explicitRoot) {
    return path.resolve(process.cwd(), explicitRoot, site.key);
  }

  return path.join(process.cwd(), '.static-content', site.key);
}

function readJsonFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;

  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

export function getStaticPagesDir(site: ResolvedSite) {
  return path.join(getStaticSiteRoot(site), 'pages');
}

export function loadStaticPages(site: ResolvedSite): Page[] {
  const pagesDir = getStaticPagesDir(site);
  if (!existsSync(pagesDir)) return [];

  return readdirSync(pagesDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => readJsonFile<Page>(path.join(pagesDir, fileName)))
    .filter((page): page is Page => Boolean(page));
}

export function loadStaticPage(site: ResolvedSite, slug: string): Page | null {
  const normalizedSlug = slug === '/' || !slug ? 'home' : slug.replace(/^\/+|\/+$/g, '');
  return loadStaticPages(site).find((page) => page.pageSlug === normalizedSlug) ?? null;
}

export function loadStaticTheme(site: ResolvedSite): Theme | null {
  return readJsonFile<Theme>(path.join(getStaticSiteRoot(site), 'theme.json'));
}

export function getStaticPageSlugs(site: ResolvedSite): string[] {
  return loadStaticPages(site)
    .filter((page) => page.isPublished)
    .map((page) => page.pageSlug)
    .sort((a, b) => a.localeCompare(b));
}

export function getStaticSitemapEntries(site: ResolvedSite): StaticSitemapEntry[] {
  return loadStaticPages(site)
    .filter((page) => page.isPublished && page.includeInSitemap)
    .map((page) => ({
      pageSlug: page.pageSlug,
      lastModified: page.MetaData?.updatedAt || page.publishedAt || new Date().toISOString(),
    }))
    .sort((a, b) => a.pageSlug.localeCompare(b.pageSlug));
}
