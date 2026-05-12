export type SiteKey = 'ice-rink-rentals' | 'second-product-rentals';

export interface ProductTokens {
  singular: string;
  plural: string;
}

export interface SiteDefinition {
  key: SiteKey;
  domain: string;
  localHosts: string[];
  tenantEnv: string;
  apiKeyEnv: string;
  canonicalEnv: string;
  brand: string;
  service: string;
  product: ProductTokens;
}

export interface ResolvedSite extends SiteDefinition {
  host: string;
  tenantId: string;
  apiKey: string;
  canonicalUrl: string;
  missingEnv: string[];
}

export const sites: SiteDefinition[] = [
  {
    key: 'ice-rink-rentals',
    domain: 'iceskatingrinkrentals.com',
    localHosts: ['localhost:3002', '127.0.0.1:3002'],
    tenantEnv: 'ICE_RINK_RENTALS_TENANT_ID',
    apiKeyEnv: 'ICE_RINK_RENTALS_API_KEY',
    canonicalEnv: 'ICE_RINK_RENTALS_CANONICAL_URL',
    brand: 'Ice Skating Rink Rentals',
    service: 'Portable Ice Rink Rentals',
    product: {
      singular: 'portable ice rink',
      plural: 'portable ice rinks',
    },
  },
  {
    key: 'second-product-rentals',
    domain: 'second-domain-placeholder.com',
    localHosts: ['second.localhost:3002'],
    tenantEnv: 'SECOND_PRODUCT_TENANT_ID',
    apiKeyEnv: 'SECOND_PRODUCT_API_KEY',
    canonicalEnv: 'SECOND_PRODUCT_CANONICAL_URL',
    brand: 'Second Product Rentals',
    service: 'Second Product Rentals',
    product: {
      singular: 'second product',
      plural: 'second products',
    },
  },
];

export const defaultSite = sites[0];

export function normalizeHost(rawHost?: string | null): string {
  if (!rawHost) return '';

  const firstHost = rawHost.split(',')[0]?.trim().toLowerCase() ?? '';
  const withoutProtocol = firstHost.replace(/^https?:\/\//, '');
  const withoutPath = withoutProtocol.split('/')[0] ?? '';
  const match = withoutPath.match(/^([^:]+)(:\d+)?$/);

  if (!match) return withoutPath.replace(/^www\./, '');

  const hostname = match[1].replace(/^www\./, '');
  const port = match[2] ?? '';
  return `${hostname}${port}`;
}

export function findSiteByHost(rawHost?: string | null): SiteDefinition {
  const host = normalizeHost(rawHost);

  return (
    sites.find((site) => {
      const domain = normalizeHost(site.domain);
      const localHosts = site.localHosts.map(normalizeHost);
      return host === domain || localHosts.includes(host);
    }) ?? defaultSite
  );
}

export function getSiteCanonicalUrl(site: SiteDefinition): string {
  const rawCanonical = process.env[site.canonicalEnv] || `https://${site.domain}`;
  const withProtocol = /^https?:\/\//i.test(rawCanonical)
    ? rawCanonical
    : `https://${rawCanonical}`;

  return withProtocol.replace(/\/+$/, '');
}

export function resolveSiteDefinition(rawHost?: string | null): ResolvedSite {
  const site = findSiteByHost(rawHost);
  const tenantId = process.env[site.tenantEnv] || '';
  const apiKey = process.env[site.apiKeyEnv] || '';
  const canonicalUrl = getSiteCanonicalUrl(site);
  const missingEnv = [
    tenantId ? '' : site.tenantEnv,
    apiKey ? '' : site.apiKeyEnv,
  ].filter(Boolean);

  return {
    ...site,
    host: normalizeHost(rawHost),
    tenantId,
    apiKey,
    canonicalUrl,
    missingEnv,
  };
}
