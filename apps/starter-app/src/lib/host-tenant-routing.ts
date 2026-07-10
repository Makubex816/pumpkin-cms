import { headers } from 'next/headers';
import { getPreviewPage, getPreviewSite } from '@/lib/preview-fixtures';

type HostTenantSource = 'preview-fixture';
type HostTenantFormsMode = 'disabled-preview' | 'live-submit';

export interface HostTenantRoute {
  tenantId: string;
  hosts: string[];
  source: HostTenantSource;
  formsMode: HostTenantFormsMode;
}

const SAFE_TENANT_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;

const BUILT_IN_HOST_TENANT_ROUTES: HostTenantRoute[] = [
  {
    tenantId: 'party-pros-philadelphia',
    hosts: ['partyrentalphiladelphia.com', 'www.partyrentalphiladelphia.com'],
    source: 'preview-fixture',
    formsMode: 'live-submit',
  },
];

export function getCurrentRequestHost() {
  const requestHeaders = headers();
  return normalizeRequestHost(
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'),
  );
}

export function normalizeRequestHost(host: string | null | undefined) {
  if (!host) return '';

  const firstHost = host.split(',')[0]?.trim().toLowerCase() ?? '';
  if (firstHost.startsWith('[')) {
    return firstHost.replace(/\]:(\d+)$/, ']');
  }

  return firstHost.replace(/:\d+$/, '');
}

export function resolveHostTenantRoute(host = getCurrentRequestHost()): HostTenantRoute | null {
  const normalizedHost = normalizeRequestHost(host);
  if (!normalizedHost) return null;

  return getHostTenantRoutes().find((route) =>
    route.hosts.some((routeHost) => normalizeRequestHost(routeHost) === normalizedHost),
  ) ?? null;
}

export async function getHostTenantPreviewPage(slugParts: string[] = []) {
  const route = resolveHostTenantRoute();
  if (!route) return null;

  return {
    route,
    preview: await getPreviewPage(route.tenantId, slugParts, { urlMode: 'site' }),
  };
}

export async function getHostTenantPreviewSite() {
  const route = resolveHostTenantRoute();
  if (!route) return null;

  return {
    route,
    site: await getPreviewSite(route.tenantId, { urlMode: 'site' }),
  };
}

function getHostTenantRoutes(): HostTenantRoute[] {
  return [...readConfiguredRoutes(), ...BUILT_IN_HOST_TENANT_ROUTES];
}

function readConfiguredRoutes(): HostTenantRoute[] {
  const rawRoutes = process.env.PUMPKIN_HOST_TENANT_ROUTES_JSON;
  if (!rawRoutes) return [];

  try {
    const parsed = JSON.parse(rawRoutes) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((route) => normalizeConfiguredRoute(route));
  } catch {
    console.warn('[host-tenant-routing] Ignoring invalid PUMPKIN_HOST_TENANT_ROUTES_JSON.');
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

  return [
    {
      tenantId,
      hosts,
      source: record.source === 'preview-fixture' ? record.source : 'preview-fixture',
      formsMode: record.formsMode === 'live-submit' ? record.formsMode : 'disabled-preview',
    },
  ];
}
