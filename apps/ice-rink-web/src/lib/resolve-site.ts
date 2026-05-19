import 'server-only';

import { headers } from 'next/headers';
import {
  resolveSiteDefinition,
  resolveStaticSiteDefinition,
  type ResolvedSite,
} from '@/config/sites';
import { getStaticSiteKey, isStaticRenderMode } from '@/lib/render-mode';

export function resolveSite(): ResolvedSite {
  if (isStaticRenderMode()) {
    const staticSiteKey = getStaticSiteKey();
    if (!staticSiteKey) {
      throw new Error('Static render mode requires SITE_KEY or STATIC_SITE_KEY.');
    }

    return resolveStaticSiteDefinition(staticSiteKey);
  }

  const headerList = headers();
  const forwardedHost = headerList.get('x-forwarded-host');
  const host = forwardedHost || headerList.get('host');

  return resolveSiteDefinition(host);
}

export function resolveSiteFromHost(host?: string | null): ResolvedSite {
  return resolveSiteDefinition(host);
}
