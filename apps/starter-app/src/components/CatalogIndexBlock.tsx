'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { QuoteCartButton } from '@/components/QuoteCart';
import { getSafeSiteHref } from '@/lib/site-chrome';

interface CatalogItem {
  title?: unknown;
  description?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  link?: unknown;
  category?: unknown;
  quoteId?: unknown;
}

interface CatalogIndexContent {
  kicker?: unknown;
  title?: unknown;
  description?: unknown;
  searchPlaceholder?: unknown;
  categoryLabels?: unknown;
  items?: unknown;
  quoteEnabled?: unknown;
}

export function CatalogIndexBlock({ content }: { content: Record<string, unknown> }) {
  const catalog = content as CatalogIndexContent;
  const searchId = useId();
  const categoryId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const items = getItems(catalog.items);
  const categoryLabels = getCategoryLabels(catalog.categoryLabels);
  const categories = getCategories(items);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = useMemo(
    () => items.filter((item) => {
      const matchesCategory = category === 'all' || item.categories.includes(category);
      const matchesQuery = !normalizedQuery
        || `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    }),
    [category, items, normalizedQuery],
  );

  return (
    <section className="section section-white catalog-index" data-catalog-index="true">
      <div className="container">
        {getText(catalog.kicker) && <div className="section-kicker">{getText(catalog.kicker)}</div>}
        {getText(catalog.title) && <h2 className="section-title">{getText(catalog.title)}</h2>}
        {getText(catalog.description) && <p className="section-description">{getText(catalog.description)}</p>}

        <div className="catalog-controls" role="search">
          <label className="catalog-control" htmlFor={searchId}>
            <span className="catalog-control-label"><Search aria-hidden="true" size={17} /> Search catalog</span>
            <input
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={getText(catalog.searchPlaceholder) || 'Search catalog items'}
              type="search"
              value={query}
            />
          </label>
          <label className="catalog-control" htmlFor={categoryId}>
            <span className="catalog-control-label"><SlidersHorizontal aria-hidden="true" size={17} /> Category</span>
            <select id={categoryId} onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>{categoryLabels[value] || titleCase(value)}</option>
              ))}
            </select>
          </label>
        </div>

        <p aria-live="polite" className="catalog-results-count">
          Showing {visibleItems.length} of {items.length} catalog items
        </p>

        {visibleItems.length > 0 ? (
          <div className="item-grid catalog-item-grid">
            {visibleItems.map((item) => (
              <article
                className="item-card"
                data-catalog-item={item.title}
                data-item-route={item.link}
                key={`${item.link}-${item.title}`}
              >
                <a className="catalog-card-main" href={getSafeSiteHref(item.link, '/catalog')}>
                  {item.image && <img alt={item.imageAlt || item.title} loading="lazy" src={item.image} />}
                  <div className="item-card-body">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    <span className="catalog-card-link">View details</span>
                  </div>
                </a>
                {catalog.quoteEnabled === true && (
                  <div className="quote-cart-card-action">
                    <QuoteCartButton item={{
                      id: item.quoteId,
                      title: item.title,
                      image: item.image,
                      imageAlt: item.imageAlt,
                      category: item.categories.map((value) => categoryLabels[value] || titleCase(value)).join(', '),
                      link: item.link,
                    }} />
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">No catalog items match those filters.</div>
        )}
      </div>
    </section>
  );
}

function getItems(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const item = entry as CatalogItem;
    const title = getText(item.title);
    const link = getText(item.link);
    if (!title || !link) return [];

    return [{
      title,
      description: getText(item.description),
      image: getSafeImageUrl(item.image),
      imageAlt: getText(item.imageAlt),
      link,
      quoteId: getText(item.quoteId) || link.replace(/^\/+/, ''),
      categories: getText(item.category).split(/\s+/).filter(Boolean),
    }];
  });
}

function getCategories(items: ReturnType<typeof getItems>) {
  return Array.from(new Set(items.flatMap((item) => item.categories))).sort();
}

function getCategoryLabels(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, label]) => {
      const text = getText(label);
      return text ? [[key, text]] : [];
    }),
  );
}

function getSafeImageUrl(value: unknown) {
  const candidate = getText(value);
  return /^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/') ? candidate : '';
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function titleCase(value: string) {
  return value.replace(/(^|[-\s])\w/g, (letter) => letter.toUpperCase());
}
