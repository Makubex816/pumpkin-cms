import type { Metadata } from 'next';
import type { OpenGraphData, Page, SeoData, TwitterCardData } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';

export function buildPageUrl(site: ResolvedSite, slug?: string | null): string {
  const normalizedSlug = (slug || '').replace(/^\/+|\/+$/g, '');
  if (!normalizedSlug || normalizedSlug === 'home') return site.canonicalUrl;
  return `${site.canonicalUrl}/${normalizedSlug}`;
}

export function buildMetadata(page: Page, site: ResolvedSite): Metadata {
  const { seo, MetaData: meta } = page;
  const canonicalUrl = buildPageUrl(site, page.pageSlug);
  const title = seo.metaTitle || meta.title || site.brand;
  const description =
    seo.metaDescription ||
    meta.description ||
    `${site.service} for events, seasonal activations, and private rentals.`;

  return {
    metadataBase: new URL(site.canonicalUrl),
    title,
    description,
    keywords: seo.keywords,
    authors: meta.author ? [{ name: meta.author }] : undefined,
    robots: seo.robots || 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages: buildAlternateLanguages(seo),
    },
    openGraph: buildOpenGraph(seo.openGraph, seo, site, canonicalUrl),
    twitter: buildTwitter(seo.twitterCard, title, description, site),
  };
}

export function buildDefaultMetadata(site: ResolvedSite): Metadata {
  return {
    metadataBase: new URL(site.canonicalUrl),
    title: {
      default: site.brand,
      template: `%s | ${site.brand}`,
    },
    description: `${site.service} for events, seasonal activations, private parties, and commercial venues.`,
    alternates: {
      canonical: site.canonicalUrl,
    },
    openGraph: {
      title: site.brand,
      description: `${site.service} for events and venues.`,
      type: 'website',
      url: site.canonicalUrl,
      siteName: site.brand,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: site.brand,
      description: `${site.service} for events and venues.`,
    },
  };
}

export function buildNotFoundMetadata(site: ResolvedSite): Metadata {
  return {
    metadataBase: new URL(site.canonicalUrl),
    title: `Page Not Found | ${site.brand}`,
    robots: 'noindex, nofollow',
  };
}

function buildOpenGraph(
  og: OpenGraphData,
  seo: SeoData,
  site: ResolvedSite,
  canonicalUrl: string
): Metadata['openGraph'] {
  const image = absoluteUrl(og['og:image'], site);

  return {
    title: og['og:title'] || seo.metaTitle || site.brand,
    description: og['og:description'] || seo.metaDescription || `${site.service} for events and venues.`,
    type: (og['og:type'] as 'website') || 'website',
    url: canonicalUrl,
    siteName: og['og:site_name'] || site.brand,
    locale: og['og:locale'] || 'en_US',
    images: image ? [{ url: image, alt: og['og:image:alt'] || site.brand }] : undefined,
  };
}

function buildTwitter(
  tw: TwitterCardData,
  title: string,
  description: string,
  site: ResolvedSite
): Metadata['twitter'] {
  const image = absoluteUrl(tw['twitter:image'], site);

  return {
    card: (tw['twitter:card'] as 'summary_large_image') || 'summary_large_image',
    title: tw['twitter:title'] || title,
    description: tw['twitter:description'] || description,
    images: image ? [image] : undefined,
    site: tw['twitter:site'],
    creator: tw['twitter:creator'],
  };
}

function buildAlternateLanguages(seo: SeoData): Record<string, string> | undefined {
  if (!seo.alternateUrls || seo.alternateUrls.length === 0) return undefined;

  const map: Record<string, string> = {};
  for (const alt of seo.alternateUrls) {
    map[alt.hrefLang] = alt.href;
  }

  return map;
}

function absoluteUrl(value: string | undefined, site: ResolvedSite): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${site.canonicalUrl}/${value.replace(/^\/+/, '')}`;
}
