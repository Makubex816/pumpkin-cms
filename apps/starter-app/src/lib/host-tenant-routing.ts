import { headers } from 'next/headers';
import {
  getRegisteredHostTenantIds,
  isStarterFallbackHost,
  normalizeRequestHost,
  resolveHostTenantRouteForHost,
} from '@/lib/host-tenant-registry';
import type { HostTenantRoute } from '@/lib/host-tenant-registry';
import {
  getPackageStaticPreviewPage,
  getPreviewPage,
  getPreviewSite,
} from '@/lib/preview-fixtures';
import { resolveTenantRuntimeConfig } from '@/lib/tenant-runtime-config';

export type { HostTenantRoute } from '@/lib/host-tenant-registry';
export { normalizeRequestHost } from '@/lib/host-tenant-registry';

export function getCurrentRequestHost() {
  const requestHeaders = headers();
  return normalizeRequestHost(
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'),
  );
}

export function resolveHostTenantRoute(host = getCurrentRequestHost()): HostTenantRoute | null {
  return resolveHostTenantRouteForHost(host);
}

export function isCurrentRequestStarterFallbackHost() {
  return isStarterFallbackHost(getCurrentRequestHost());
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

export async function getHostTenantPackagePage(slugParts: string[] = []) {
  const route = resolveHostTenantRoute();
  if (!route) return null;

  const packagePreview = await getPackageStaticPreviewPage(route.tenantId, slugParts);
  if (!packagePreview) return null;

  const runtimeConfig = resolveTenantRuntimeConfig(
    route.tenantId,
    process.env,
    getRegisteredHostTenantIds(),
  );
  return {
    route,
    packagePreview,
    formsEnabled: route.formsMode === 'live-submit' && Boolean(runtimeConfig),
  };
}

export async function getHostTenantPackageSite() {
  return getHostTenantPackagePage([]);
}
