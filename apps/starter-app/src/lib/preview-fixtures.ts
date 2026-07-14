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

export interface PackageStaticPreviewRoute {
  route: string;
  sourceFile: string;
  sourceSha256: string;
  title: string;
  h1: string;
  description: string;
  canonicalUrl: string;
  bodyClass: string;
  html: string;
  inlineCss: string;
  stylesheets: string[];
  structuredData: Array<Record<string, unknown> | unknown[]>;
  anchorIds: string[];
  counts: {
    links: number;
    forms: number;
    controls: number;
    images: number;
    airstripLinks: number;
  };
  disposition: 'preserved' | 'safely_adapted_equivalent' | 'owner_approved_change';
}

export interface PackageStaticPreviewFixture {
  schemaVersion: 'pumpkin-preview-fixture/v1';
  fixtureSchemaVersion: string;
  compilerVersion: string;
  tenantId: string;
  siteName: string;
  renderMode: 'package-static';
  previewOnly: true;
  immutable: true;
  source: {
    sourcePackageSha256: string;
    normalizedPackageSha256: string;
    referencePreviewSha256: string;
    backupManifestSha256: string;
    backupChecksumManifestSha256: string;
    compilerSourceSha256: string;
    fidelityStatus: string;
  };
  routes: Record<string, PackageStaticPreviewRoute>;
  redirects: Array<{
    sourcePath: string;
    targetPath: string;
    statusCode: 301 | 302 | 307 | 308;
    preserveQueryString: boolean;
    source: 'page-owned' | 'tenant-generic';
  }>;
  forms: {
    definitions: Array<{
      formKey: string;
      status: string;
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
        label?: string;
      }>;
    }>;
    instances: Array<{
      id: string;
      route: string;
      normalizedFormKey: string;
    }>;
    submissionMode: string;
  };
  counts: Record<string, number>;
  integrity: { fixtureSha256: string };
}

type AnyPreviewFixture = PreviewFixture | PackageStaticPreviewFixture;

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

export interface PackageStaticPreviewPageResult {
  fixture: PackageStaticPreviewFixture;
  page: PackageStaticPreviewRoute;
  slug: string;
}

const fixtureCache = new Map<string, Promise<AnyPreviewFixture | null>>();

export async function getPreviewPage(
  tenantId: string,
  slugParts: string[] = [],
  options: PreviewFixtureOptions = {},
): Promise<PreviewPageResult | null> {
  const fixture = await readPreviewFixture(tenantId);
  if (!fixture || isPackageStaticFixture(fixture)) return null;

  const slug = normalizePreviewSlug(slugParts);
  const page = getPageCandidates(slug)
    .map((candidate) => fixture.pages[candidate])
    .find((candidate): candidate is Page => Boolean(candidate));
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
  if (!fixture || isPackageStaticFixture(fixture)) return null;

  return {
    fixture,
    theme: resolvePreviewTheme(fixture, options.urlMode ?? 'preview'),
    formDefinitions: mapFormDefinitions(fixture.formDefinitions ?? []),
  };
}

export async function getPackageStaticPreviewPage(
  tenantId: string,
  slugParts: string[] = [],
): Promise<PackageStaticPreviewPageResult | null> {
  const fixture = await readPreviewFixture(tenantId);
  if (!fixture || !isPackageStaticFixture(fixture)) return null;

  const slug = normalizePreviewSlug(slugParts);
  const page = getPageCandidates(slug)
    .map((candidate) => fixture.routes[candidate])
    .find((candidate): candidate is PackageStaticPreviewRoute => Boolean(candidate));
  if (!page) return null;

  return { fixture, page, slug };
}

export function normalizePreviewSlug(slugParts: string[] = []) {
  const slug = slugParts
    .join('/')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

  return slug || 'home';
}

async function readPreviewFixture(tenantId: string): Promise<AnyPreviewFixture | null> {
  if (!SAFE_TENANT_ID.test(tenantId)) return null;

  const cached = fixtureCache.get(tenantId);
  if (cached) return cached;

  const pending = readPreviewFixtureUncached(tenantId);
  fixtureCache.set(tenantId, pending);
  return pending;
}

async function readPreviewFixtureUncached(tenantId: string): Promise<AnyPreviewFixture | null> {

  for (const fixturePath of getFixturePaths(tenantId)) {
    if (!existsSync(fixturePath)) continue;

    const fixtureText = (await readFile(fixturePath, 'utf8')).replace(/^\uFEFF/, '');
    const fixture = JSON.parse(fixtureText) as AnyPreviewFixture;
    if (fixture.tenantId !== tenantId) return null;
    return fixture;
  }

  return null;
}

function isPackageStaticFixture(fixture: AnyPreviewFixture): fixture is PackageStaticPreviewFixture {
  return 'renderMode' in fixture
    && fixture.renderMode === 'package-static'
    && 'schemaVersion' in fixture
    && fixture.schemaVersion === 'pumpkin-preview-fixture/v1';
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
  const sourceMenu = partialTheme.menu?.length ? partialTheme.menu : fallbackTheme.menu;
  const menu = prefixMenuUrls(
    ensureCatalogMenuItem(sourceMenu, fixture.pages),
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
    themeCssPath: getFixtureThemeCssPath(partialTheme),
  } as Theme & { themeCssPath: string });
}

function getFixtureThemeCssPath(partialTheme: Partial<Theme>) {
  const extendedTheme = partialTheme as Partial<Theme> & {
    themeCssPath?: unknown;
    cssPath?: unknown;
  };
  const candidate = typeof extendedTheme.themeCssPath === 'string'
    ? extendedTheme.themeCssPath.trim()
    : typeof extendedTheme.cssPath === 'string'
      ? extendedTheme.cssPath.trim()
      : '';

  return /^\/themes\/[a-z0-9][a-z0-9._-]*\.css$/i.test(candidate)
    ? candidate
    : '/themes/pumpkin-default.css';
}

function getPageCandidates(slug: string) {
  const normalized = slug.replace(/^\/+/, '');
  const withoutHtml = normalized.replace(/\.html$/i, '');
  const aliases = normalized === 'index.html' || normalized === 'index' ? ['home'] : [];
  return Array.from(new Set([normalized, withoutHtml, ...aliases]));
}

function ensureCatalogMenuItem(menu: MenuItem[], pages: Record<string, Page>) {
  const hasCatalogPage = Boolean(pages.catalog ?? pages['catalog.html']);
  const hasCatalogMenuItem = menu.some((item) =>
    item.url.replace(/^\/+|\/+$/g, '').replace(/\.html$/i, '') === 'catalog',
  );
  if (!hasCatalogPage || hasCatalogMenuItem) return menu;

  const homeOrder = menu.find((item) => item.url === '/' || item.url === 'home')?.order ?? 0;
  return [
    ...menu.map((item) => item.order > homeOrder ? { ...item, order: item.order + 1 } : item),
    {
      label: 'Catalog',
      url: '/catalog',
      target: '_self',
      icon: '',
      order: homeOrder + 1,
      isVisible: true,
      children: [],
    },
  ];
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
