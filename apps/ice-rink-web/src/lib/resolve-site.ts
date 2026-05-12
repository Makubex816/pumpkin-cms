import 'server-only';

import { headers } from 'next/headers';
import { resolveSiteDefinition, type ResolvedSite } from '@/config/sites';

export function resolveSite(): ResolvedSite {
  const headerList = headers();
  const forwardedHost = headerList.get('x-forwarded-host');
  const host = forwardedHost || headerList.get('host');

  return resolveSiteDefinition(host);
}

export function resolveSiteFromHost(host?: string | null): ResolvedSite {
  return resolveSiteDefinition(host);
}
