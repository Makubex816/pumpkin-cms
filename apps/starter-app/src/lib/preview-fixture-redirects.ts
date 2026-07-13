import previewRegistry from '@/generated/preview-fixture-registry.json';

export interface PreviewFixtureRedirectResolution {
  location: string;
  statusCode: 301 | 302 | 307 | 308;
}

interface RegistryRedirect {
  sourcePath: string;
  targetPath: string;
  statusCode: 301 | 302 | 307 | 308;
  preserveQueryString: boolean;
}

interface RegistryTenant {
  redirects?: RegistryRedirect[];
}

const registry = previewRegistry as {
  schemaVersion: string;
  tenants: Record<string, RegistryTenant>;
};

export function resolvePreviewFixtureRedirect(
  pathname: string,
  rawQuery = '',
): PreviewFixtureRedirectResolution | null {
  const match = pathname.match(/^\/preview\/([a-z0-9][a-z0-9-]{1,80})(\/.*)?$/i);
  if (!match) return null;

  const tenantId = match[1].toLowerCase();
  const tenant = registry.tenants[tenantId];
  if (!tenant?.redirects?.length) return null;

  const sourcePath = normalizePath(match[2] || '/');
  const redirect = tenant.redirects.find((candidate) => normalizePath(candidate.sourcePath) === sourcePath);
  if (!redirect || ![301, 302, 307, 308].includes(redirect.statusCode)) return null;

  const targetPath = normalizePath(redirect.targetPath);
  const target = `/preview/${tenantId}${targetPath === '/' ? '' : targetPath}`;
  const location = redirect.preserveQueryString && rawQuery
    ? `${target}?${rawQuery.replace(/^\?/, '')}`
    : target;
  if (location === `${pathname}${rawQuery ? `?${rawQuery.replace(/^\?/, '')}` : ''}`) return null;

  return { location, statusCode: redirect.statusCode };
}

export function isTenantPreviewPath(pathname: string) {
  return /^\/preview\/[a-z0-9][a-z0-9-]{1,80}(?:\/|$)/i.test(pathname);
}

function normalizePath(value: string) {
  const clean = `/${String(value || '/').split(/[?#]/, 1)[0]}`
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '');
  return clean || '/';
}
