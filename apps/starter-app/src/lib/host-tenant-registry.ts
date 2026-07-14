import hostTenantRoutes from '@/generated/host-tenant-routes.json';

export type HostTenantSource = 'preview-fixture';
export type HostTenantFormsMode = 'disabled-preview' | 'live-submit';

export interface HostTenantRoute {
  tenantId: string;
  hosts: string[];
  source: HostTenantSource;
  formsMode: HostTenantFormsMode;
}

const SAFE_TENANT_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
const LOCAL_STARTER_HOSTS = new Set(['127.0.0.1', '[::1]', 'localhost']);
const COMMITTED_HOST_TENANT_ROUTES = hostTenantRoutes.routes.flatMap((route) =>
  normalizeConfiguredRoute(route),
);

export function normalizeRequestHost(host: string | null | undefined) {
  if (!host) return '';

  const firstHost = host.split(',')[0]?.trim().toLowerCase() ?? '';
  if (firstHost.startsWith('[')) return firstHost.replace(/\]:(\d+)$/, ']');
  return firstHost.replace(/:\d+$/, '');
}

export function resolveHostTenantRouteForHost(
  host: string | null | undefined,
  environment: Record<string, string | undefined> = process.env,
) {
  const normalizedHost = normalizeRequestHost(host);
  if (!normalizedHost) return null;

  return getHostTenantRoutes(environment).find((route) =>
    route.hosts.some((routeHost) => normalizeRequestHost(routeHost) === normalizedHost),
  ) ?? null;
}

export function isStarterFallbackHost(
  host: string | null | undefined,
  environment: Record<string, string | undefined> = process.env,
) {
  const normalizedHost = normalizeRequestHost(host);
  if (!normalizedHost) return false;
  if (LOCAL_STARTER_HOSTS.has(normalizedHost)) return true;

  const configuredHosts = [
    environment.WEBSITE_HOSTNAME,
    ...(environment.PUMPKIN_STARTER_FALLBACK_HOSTS ?? '').split(','),
  ];
  return configuredHosts.some((candidate) =>
    Boolean(candidate) && normalizeRequestHost(candidate) === normalizedHost,
  );
}

export function getHostTenantRoutes(
  environment: Record<string, string | undefined> = process.env,
): HostTenantRoute[] {
  return [...readConfiguredRoutes(environment), ...COMMITTED_HOST_TENANT_ROUTES];
}

export function getRegisteredHostTenantIds(
  environment: Record<string, string | undefined> = process.env,
) {
  return Array.from(new Set(getHostTenantRoutes(environment).map((route) => route.tenantId)));
}

function readConfiguredRoutes(environment: Record<string, string | undefined>) {
  const rawRoutes = environment.PUMPKIN_HOST_TENANT_ROUTES_JSON;
  if (!rawRoutes) return [];

  try {
    const parsed = JSON.parse(rawRoutes) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((route) => normalizeConfiguredRoute(route));
  } catch {
    return [];
  }
}

function normalizeConfiguredRoute(route: unknown): HostTenantRoute[] {
  if (!route || typeof route !== 'object') return [];

  const record = route as {
    tenantId?: unknown;
    hosts?: unknown;
    source?: unknown;
    formsMode?: unknown;
  };
  const tenantId = typeof record.tenantId === 'string' ? record.tenantId.trim() : '';
  const hosts = Array.isArray(record.hosts)
    ? record.hosts.filter((host): host is string => typeof host === 'string')
    : [];
  if (!SAFE_TENANT_ID.test(tenantId) || hosts.length === 0) return [];

  return [{
    tenantId,
    hosts,
    source: 'preview-fixture',
    formsMode: record.formsMode === 'live-submit' ? 'live-submit' : 'disabled-preview',
  }];
}
