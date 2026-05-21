import type { Page } from 'pumpkin-ts-models';

/**
 * Renders JSON-LD structured data from the Page's seo.structuredData array
 * plus optional public serviceSchema output.
 */
export function StructuredData({ page }: { page: Page }) {
  const structuredData = [
    ...(page.seo.structuredData || []),
    ...buildServiceSchemaEntries(page),
  ];

  if (structuredData.length === 0) return null;

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
    </>
  );
}

function buildServiceSchemaEntries(page: Page) {
  const serviceSchema = page.serviceSchema;
  if (!serviceSchema?.publicSchemaEnabled) return [];
  if (!serviceSchema.serviceName?.trim() || !serviceSchema.serviceType?.trim()) return [];

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceSchema.serviceName,
    serviceType: serviceSchema.serviceType,
    category: serviceSchema.serviceCategory || undefined,
    url: page.seo?.canonicalUrl || undefined,
    description: page.seo?.metaDescription || page.MetaData?.description || undefined,
    audience: serviceSchema.audience?.filter(Boolean).map((name) => ({ '@type': 'Audience', name })),
    areaServed: serviceSchema.areasServed?.filter(hasName).map((area) => ({
      '@type': area.type || 'Place',
      name: area.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: area.city || undefined,
        addressRegion: area.stateCode || undefined,
        addressCountry: area.country || undefined,
      },
      url: area.url || undefined,
    })),
    hasOfferCatalog: serviceSchema.productsOffered?.length
      ? {
          '@type': 'OfferCatalog',
          name: `${serviceSchema.serviceName} products offered`,
          itemListElement: serviceSchema.productsOffered.filter(hasName).map((product) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: product.name,
              serviceType: product.type || undefined,
              category: product.category || undefined,
              description: product.description || undefined,
              url: product.url || undefined,
            },
          })),
        }
      : undefined,
  };

  return [JSON.stringify(removeUndefined(serviceJsonLd))];
}

function hasName(value: { name?: string }) {
  return Boolean(value.name?.trim());
}

function removeUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeUndefined).filter((item) => item !== undefined);
  }

  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, removeUndefined(entry)] as const)
      .filter(([, entry]) => entry !== undefined),
  );
}
