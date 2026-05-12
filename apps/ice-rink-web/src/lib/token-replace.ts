import type { ResolvedSite } from '@/config/sites';

const tokenPattern = /\{\{\s*(brand|service|product|products|canonicalUrl|domain)\s*\}\}/gi;

export function replaceSiteTokensInString(value: string, site: ResolvedSite): string {
  return value.replace(tokenPattern, (match, token: string) => {
    switch (token.toLowerCase()) {
      case 'brand':
        return site.brand;
      case 'service':
        return site.service;
      case 'product':
        return site.product.singular;
      case 'products':
        return site.product.plural;
      case 'canonicalurl':
        return site.canonicalUrl;
      case 'domain':
        return site.domain;
      default:
        return match;
    }
  });
}

export function replaceSiteTokens<T>(value: T, site: ResolvedSite): T {
  if (typeof value === 'string') {
    return replaceSiteTokensInString(value, site) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceSiteTokens(item, site)) as T;
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = replaceSiteTokens(item, site);
    }
    return output as T;
  }

  return value;
}
