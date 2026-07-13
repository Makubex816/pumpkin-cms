export interface TenantRedirectRuntimeConfig {
  tenantId: string;
  apiUrl: string;
  apiKey: string;
}

export interface TenantRedirectRuntimeResolution {
  matched: boolean;
  location: string;
  statusCode: 301 | 302 | 307 | 308;
  preserveQueryString: boolean;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const REDIRECT_STATUS_CODES = new Set([301, 302, 307, 308]);
const EXCLUDED_PREFIXES = ['/admin', '/api', '/preview', '/_next'];
const STATIC_ASSET_PATTERN = /\.(?:avif|bmp|css|csv|eot|gif|ico|jpe?g|js|json|map|mp3|mp4|ogg|otf|pdf|png|svg|ttf|txt|wav|webm|webp|woff2?|xml)$/i;

export function getTenantRedirectRuntimeConfig(
  environment: Record<string, string | undefined>,
): TenantRedirectRuntimeConfig | null {
  const tenantId = environment.PUMPKIN_TENANT_ID?.trim() ?? '';
  const apiUrl = (environment.PUMPKIN_API_URL || environment.NEXT_PUBLIC_PUMPKIN_API_URL || '')
    .trim()
    .replace(/\/+$/, '');
  const apiKey = environment.PUMPKIN_API_KEY?.trim() ?? '';
  return tenantId && apiUrl && apiKey ? { tenantId, apiUrl, apiKey } : null;
}

export function shouldResolveTenantRedirect(pathname: string): boolean {
  const normalized = pathname.startsWith('/') ? pathname.toLowerCase() : `/${pathname.toLowerCase()}`;
  if (normalized === '/favicon.ico' || STATIC_ASSET_PATTERN.test(normalized)) return false;
  return !EXCLUDED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

export async function resolveTenantRedirect(
  config: TenantRedirectRuntimeConfig,
  pathname: string,
  queryString: string,
  fetchImpl: FetchLike = fetch,
): Promise<TenantRedirectRuntimeResolution | null> {
  if (!shouldResolveTenantRedirect(pathname)) return null;

  const endpoint = new URL(
    `/api/redirects/${encodeURIComponent(config.tenantId)}/resolve`,
    `${config.apiUrl}/`,
  );
  endpoint.searchParams.set('sourcePath', pathname);
  if (queryString) endpoint.searchParams.set('query', queryString.replace(/^\?/, ''));

  try {
    const response = await fetchImpl(endpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (response.status === 404) return null;
    if (!response.ok) return null;

    const candidate = (await response.json()) as Partial<TenantRedirectRuntimeResolution>;
    if (
      candidate.matched !== true ||
      typeof candidate.location !== 'string' ||
      !isSafeLocation(candidate.location) ||
      !REDIRECT_STATUS_CODES.has(Number(candidate.statusCode))
    ) {
      return null;
    }

    if (isSameRequest(candidate.location, pathname, queryString)) return null;
    return {
      matched: true,
      location: candidate.location,
      statusCode: Number(candidate.statusCode) as TenantRedirectRuntimeResolution['statusCode'],
      preserveQueryString: candidate.preserveQueryString === true,
    };
  } catch {
    return null;
  }
}

function isSafeLocation(value: string): boolean {
  if (!value || /[\r\n]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const target = new URL(value);
    return target.protocol === 'http:' || target.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSameRequest(location: string, pathname: string, queryString: string): boolean {
  if (!location.startsWith('/') || location.startsWith('//')) return false;
  const target = new URL(location, 'https://tenant.invalid');
  const requestQuery = queryString ? `?${queryString.replace(/^\?/, '')}` : '';
  return target.pathname.toLowerCase() === pathname.toLowerCase() && target.search === requestQuery;
}
