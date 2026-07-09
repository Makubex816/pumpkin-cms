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

export async function getPreviewPage(tenantId: string, slugParts: string[] = []): Promise<PreviewPageResult | null> {
  const fixture = await readPreviewFixture(tenantId);
  if (!fixture) return null;

  const slug = normalizePreviewSlug(slugParts);
  const page = fixture.pages[slug] ?? fixture.pages[slug.replace(/^\/+/, '')];
  if (!page) return null;

  return {
    fixture,
    page,
    theme: resolvePreviewTheme(fixture),
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

    const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as PreviewFixture;
    if (fixture.tenantId !== tenantId) return null;
    return fixture;
  }

  return null;
}

function getFixturePaths(tenantId: string) {
  return [
    path.join(process.cwd(), FIXTURE_ROOT, tenantId, 'preview.json'),
    path.join(process.cwd(), 'apps', 'starter-app', FIXTURE_ROOT, tenantId, 'preview.json'),
  ];
}

function resolvePreviewTheme(fixture: PreviewFixture): Theme {
  const partialTheme = fixture.theme ?? {};
  const themeId = partialTheme.themeId || `${fixture.tenantId}-preview`;
  const menu = prefixMenuUrls(
    partialTheme.menu?.length ? partialTheme.menu : fallbackTheme.menu,
    fixture.tenantId,
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

function prefixMenuUrls(menu: MenuItem[], tenantId: string): MenuItem[] {
  return menu.map((item) => ({
    ...item,
    url: prefixPreviewUrl(item.url, tenantId),
    children: item.children ? prefixMenuUrls(item.children, tenantId) : [],
  }));
}

function prefixPreviewUrl(url: string, tenantId: string) {
  if (!url || url === '#') return url;
  if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;

  const normalized = url.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!normalized || normalized === 'home') return `/preview/${tenantId}`;
  return `/preview/${tenantId}/${normalized}`;
}

function mapFormDefinitions(definitions: FormDefinition[]): Record<string, FormDefinition> {
  return definitions.reduce<Record<string, FormDefinition>>((map, definition) => {
    map[definition.formKey.trim().toLowerCase()] = definition;
    return map;
  }, {});
}

