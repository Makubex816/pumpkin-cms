export type SiteKey = 'ice-rink-rentals' | 'roller-rink-rentals';

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
  shortBrand: string;
  legalName: string;
  service: string;
  serviceKeyword: string;
  product: ProductTokens;
  domainRouting: {
    domain: string;
    brandName: string;
    publicContactEmail: string;
    quoteRequestEmail: string;
    supportEmail: string;
    replyToEmail: string;
    fromName: string;
    fromEmail: string;
    contactPageSlug: string;
    primaryPhone: string;
    mailtoLinksEnabled: boolean;
    defaultLeadRoutingMode: string;
    defaultRecipientGroup: string;
    staticFormEndpointKey: string;
    emailProvider: string;
    emailProviderStatus: string;
    mxStatus: string;
    spfStatus: string;
    dkimStatus: string;
    dmarcStatus: string;
    notes: string;
  };
  featureFlags: {
    pages: boolean;
    forms: boolean;
    sitemap: boolean;
  };
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
    shortBrand: 'Ice Skating Rink Rentals',
    legalName: 'Ice Skating Rink Rentals',
    service: 'Portable Ice Rink Rentals',
    serviceKeyword: 'portable ice rink rentals',
    product: {
      singular: 'portable ice rink',
      plural: 'portable ice rinks',
    },
    domainRouting: {
      domain: 'iceskatingrinkrentals.com',
      brandName: 'Ice Skating Rink Rentals',
      publicContactEmail: '',
      quoteRequestEmail: '',
      supportEmail: '',
      replyToEmail: '',
      fromName: 'Ice Skating Rink Rentals',
      fromEmail: '',
      contactPageSlug: 'contact',
      primaryPhone: '',
      mailtoLinksEnabled: false,
      defaultLeadRoutingMode: 'manual_review_then_provider_match',
      defaultRecipientGroup: 'quote_requests',
      staticFormEndpointKey: '',
      emailProvider: '',
      emailProviderStatus: 'not_configured',
      mxStatus: 'unknown',
      spfStatus: 'unknown',
      dkimStatus: 'unknown',
      dmarcStatus: 'unknown',
      notes: 'Non-secret routing metadata only. Do not store provider credentials here.',
    },
    featureFlags: {
      pages: true,
      forms: true,
      sitemap: true,
    },
  },
  {
    key: 'roller-rink-rentals',
    domain: 'rollerrinkrentals.com',
    localHosts: ['roller.localhost:3002'],
    tenantEnv: 'ROLLER_RINK_RENTALS_TENANT_ID',
    apiKeyEnv: 'ROLLER_RINK_RENTALS_API_KEY',
    canonicalEnv: 'ROLLER_RINK_RENTALS_CANONICAL_URL',
    brand: 'Roller Rink Rentals',
    shortBrand: 'Roller Rink Rentals',
    legalName: 'Roller Rink Rentals',
    service: 'Portable Roller Rink Rentals',
    serviceKeyword: 'roller rink rentals',
    product: {
      singular: 'portable roller rink',
      plural: 'portable roller rinks',
    },
    domainRouting: {
      domain: 'rollerrinkrentals.com',
      brandName: 'Roller Rink Rentals',
      publicContactEmail: '',
      quoteRequestEmail: '',
      supportEmail: '',
      replyToEmail: '',
      fromName: 'Roller Rink Rentals',
      fromEmail: '',
      contactPageSlug: 'contact',
      primaryPhone: '',
      mailtoLinksEnabled: false,
      defaultLeadRoutingMode: 'manual_review_then_provider_match',
      defaultRecipientGroup: 'quote_requests',
      staticFormEndpointKey: '',
      emailProvider: '',
      emailProviderStatus: 'not_configured',
      mxStatus: 'unknown',
      spfStatus: 'unknown',
      dkimStatus: 'unknown',
      dmarcStatus: 'unknown',
      notes: 'Non-secret routing metadata only. Do not store provider credentials here.',
    },
    featureFlags: {
      pages: true,
      forms: true,
      sitemap: true,
    },
  },
];

export const defaultSite = sites[0];

export function findSiteByKey(siteKey: SiteKey): SiteDefinition {
  return sites.find((site) => site.key === siteKey) ?? defaultSite;
}

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
  return resolveSiteEnvironment(site, rawHost);
}

export function resolveStaticSiteDefinition(siteKey: SiteKey): ResolvedSite {
  const site = findSiteByKey(siteKey);
  return resolveSiteEnvironment(site, site.domain, site.key);
}

function resolveSiteEnvironment(
  site: SiteDefinition,
  rawHost?: string | null,
  tenantFallback = ''
): ResolvedSite {
  const tenantId = process.env[site.tenantEnv] || '';
  const apiKey = process.env[site.apiKeyEnv] || '';
  const canonicalUrl = getSiteCanonicalUrl(site);
  const missingEnv = [
    tenantId || tenantFallback ? '' : site.tenantEnv,
    apiKey ? '' : site.apiKeyEnv,
  ].filter(Boolean);

  return {
    ...site,
    host: normalizeHost(rawHost),
    tenantId: tenantId || tenantFallback,
    apiKey,
    canonicalUrl,
    missingEnv,
  };
}
