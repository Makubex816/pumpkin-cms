import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { FormDefinition, MenuItem, Page, Theme } from 'pumpkin-ts-models';
import { fallbackTheme } from '@/data';
import { resolveThemePlugin } from '@/themes/registry';

const FIXTURE_ROOT = 'preview-fixtures';
const SAFE_TENANT_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;

export interface PreviewFixture {
  tenantId: string;
  siteKey?: string;
  siteName?: string;
  generatedAt?: string;
  source?: string;
  theme?: Partial<Theme>;
  formDefinitions?: FormDefinition[];
  pages: Record<string, Page>;
}

export interface PreviewPageResult {
  fixture: PreviewFixture;
  page: Page;
  theme: Theme;
  formDefinitions: Record<string, FormDefinition>;
}

export type PreviewUrlMode = 'preview' | 'site';

export interface PreviewFixtureOptions {
  urlMode?: PreviewUrlMode;
}

export interface PreviewSiteResult {
  fixture: PreviewFixture;
  theme: Theme;
  formDefinitions: Record<string, FormDefinition>;
}

export async function getPreviewPage(
  tenantId: string,
  slugParts: string[] = [],
  options: PreviewFixtureOptions = {},
): Promise<PreviewPageResult | null> {
  const fixture = await readPreviewFixture(tenantId);
  if (!fixture) return null;

  const slug = normalizePreviewSlug(slugParts);
  const page = fixture.pages[slug] ?? fixture.pages[slug.replace(/^\/+/, '')];
  if (!page) return null;

  return {
    fixture,
    page,
    theme: resolvePreviewTheme(fixture, options.urlMode ?? 'preview'),
    formDefinitions: mapFormDefinitions(fixture.formDefinitions ?? []),
  };
}

export async function getPreviewSite(
  tenantId: string,
  options: PreviewFixtureOptions = {},
): Promise<PreviewSiteResult | null> {
  const fixture = await readPreviewFixture(tenantId);
  if (!fixture) return null;

  return {
    fixture,
    theme: resolvePreviewTheme(fixture, options.urlMode ?? 'preview'),
    formDefinitions: mapFormDefinitions(fixture.formDefinitions ?? []),
  };
}

export function normalizePreviewSlug(slugParts: string[] = []) {
  const slug = slugParts
    .join('/')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

  return slug || 'home';
}

async function readPreviewFixture(tenantId: string): Promise<PreviewFixture | null> {
  if (!SAFE_TENANT_ID.test(tenantId)) return null;

  for (const fixturePath of getFixturePaths(tenantId)) {
    if (!existsSync(fixturePath)) continue;

    const fixtureText = (await readFile(fixturePath, 'utf8')).replace(/^\uFEFF/, '');
    const fixture = JSON.parse(fixtureText) as PreviewFixture;
    if (fixture.tenantId !== tenantId) return null;
    return fixture;
  }

  return null;
}

function getFixturePaths(tenantId: string) {
  return getFixtureRoots().map((root) => path.join(root, tenantId, 'preview.json'));
}

function getFixtureRoots() {
  const configuredRoot = process.env.PUMPKIN_PREVIEW_FIXTURE_ROOT;
  const roots = [
    configuredRoot ? resolveFixtureRoot(configuredRoot) : null,
    path.join(process.cwd(), FIXTURE_ROOT),
    path.join(process.cwd(), 'apps', 'starter-app', FIXTURE_ROOT),
  ];

  return roots.filter((root): root is string => Boolean(root));
}

function resolveFixtureRoot(root: string) {
  return path.isAbsolute(root) ? root : path.join(process.cwd(), root);
}

function resolvePreviewTheme(fixture: PreviewFixture, urlMode: PreviewUrlMode): Theme {
  const partialTheme = fixture.theme ?? {};
  const themeId = partialTheme.themeId || `${fixture.tenantId}-preview`;
  const menu = prefixMenuUrls(
    partialTheme.menu?.length ? partialTheme.menu : fallbackTheme.menu,
    fixture.tenantId,
    urlMode,
  );

  return resolveThemePlugin({
    ...fallbackTheme,
    ...partialTheme,
    id: partialTheme.id || themeId,
    themeId,
    tenantId: fixture.tenantId,
    name: partialTheme.name || fixture.siteName || fixture.tenantId,
    label: partialTheme.label || partialTheme.name || fixture.siteName || fixture.tenantId,
    isActive: true,
    header: {
      ...fallbackTheme.header,
      ...partialTheme.header,
      classNames: {
        ...fallbackTheme.header.classNames,
        ...partialTheme.header?.classNames,
      },
    },
    footer: {
      ...fallbackTheme.footer,
      ...partialTheme.footer,
      classNames: {
        ...fallbackTheme.footer.classNames,
        ...partialTheme.footer?.classNames,
      },
    },
    blockStyles: {
      ...fallbackTheme.blockStyles,
      ...partialTheme.blockStyles,
    },
    menu,
    themeCssPath: '/themes/pumpkin-default.css',
  } as Theme & { themeCssPath: string });
}

function prefixMenuUrls(menu: MenuItem[], tenantId: string, urlMode: PreviewUrlMode): MenuItem[] {
  return menu.map((item) => ({
    ...item,
    url: prefixPreviewUrl(item.url, tenantId, urlMode),
    children: item.children ? prefixMenuUrls(item.children, tenantId, urlMode) : [],
  }));
}

function prefixPreviewUrl(url: string, tenantId: string, urlMode: PreviewUrlMode) {
  if (!url || url === '#') return url;
  if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;

  const normalized = url.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (urlMode === 'site') {
    if (!normalized || normalized === 'home') return '/';
    return `/${normalized}`;
  }

  if (!normalized || normalized === 'home') return `/preview/${tenantId}`;
  return `/preview/${tenantId}/${normalized}`;
}

function mapFormDefinitions(definitions: FormDefinition[]): Record<string, FormDefinition> {
  return definitions.reduce<Record<string, FormDefinition>>((map, definition) => {
    map[definition.formKey.trim().toLowerCase()] = definition;
    return map;
  }, {});
}
