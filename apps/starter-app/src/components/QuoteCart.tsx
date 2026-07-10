'use client';

import { Check, ChevronDown, ChevronUp, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSafeSiteHref } from '@/lib/site-chrome';

export interface QuoteCartItem {
  id: string;
  title: string;
  image?: string;
  imageAlt?: string;
  category?: string;
  link?: string;
}

interface QuoteCartContextValue {
  hydrated: boolean;
  items: QuoteCartItem[];
  addItem: (item: QuoteCartItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const storageKey = useMemo(() => `pumpkin:quote-cart:${safeStorageSegment(tenantId)}`, [tenantId]);
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setItems(normalizeItems(parsed));
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hydrated, items, storageKey]);

  const value = useMemo<QuoteCartContextValue>(() => ({
    hydrated,
    items,
    addItem: (item) => setItems((current) => current.some((entry) => entry.id === item.id)
      ? current
      : [...current, normalizeItem(item)]),
    removeItem: (id) => setItems((current) => current.filter((entry) => entry.id !== id)),
    clearItems: () => setItems([]),
  }), [hydrated, items]);

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function QuoteCartButton({ item, label = 'Add to Cart' }: { item: QuoteCartItem; label?: string }) {
  const cart = useQuoteCart();
  const normalized = normalizeItem(item);
  const added = cart.items.some((entry) => entry.id === normalized.id);

  return (
    <button
      className={`btn btn-small quote-cart-add${added ? ' is-added' : ''}`}
      data-add-to-cart={normalized.id}
      disabled={!cart.hydrated || added}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        cart.addItem(normalized);
      }}
      type="button"
    >
      {added ? <Check aria-hidden="true" size={17} /> : <Plus aria-hidden="true" size={17} />}
      {added ? 'Added' : label}
    </button>
  );
}

export function QuoteCartTrayBlock({ content }: { content: Record<string, unknown> }) {
  const cart = useQuoteCart();
  const [expanded, setExpanded] = useState(false);
  const title = getText(content.title) || 'Quote Cart';
  const quoteUrl = getSafeSiteHref(getText(content.quoteUrl), '/contact#quote-request');

  if (!cart.hydrated || cart.items.length === 0) return null;

  return (
    <>
      <div aria-hidden="true" className="quote-cart-spacer" />
      <aside aria-label={title} className="quote-cart-tray" data-quote-cart-tray="true">
        <div className="quote-cart-tray-inner">
          <button
            aria-expanded={expanded}
            className="quote-cart-summary"
            onClick={() => setExpanded((current) => !current)}
            title={expanded ? 'Collapse quote cart' : 'Review quote cart'}
            type="button"
          >
            <ShoppingCart aria-hidden="true" size={20} />
            <span>{title}</span>
            <span className="quote-cart-count">{cart.items.length}</span>
            {expanded ? <ChevronDown aria-hidden="true" size={18} /> : <ChevronUp aria-hidden="true" size={18} />}
          </button>
          <a className="btn btn-primary btn-small quote-cart-request" href={quoteUrl}>Request a Quote</a>
        </div>

        {expanded && (
          <div className="quote-cart-panel">
            <div className="quote-cart-panel-head">
              <strong>{cart.items.length} selected {cart.items.length === 1 ? 'item' : 'items'}</strong>
              <button className="quote-cart-icon-button" onClick={() => setExpanded(false)} title="Close quote cart" type="button">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="quote-cart-items">
              {cart.items.map((item) => (
                <div className="quote-cart-row" key={item.id}>
                  {item.image ? <img alt={item.imageAlt || ''} src={item.image} /> : <div className="quote-cart-image-fallback">Catalog</div>}
                  <div className="quote-cart-row-copy">
                    {item.link ? <a href={getSafeSiteHref(item.link, '/catalog')}>{item.title}</a> : <strong>{item.title}</strong>}
                    {item.category && <span>{item.category}</span>}
                  </div>
                  <button
                    className="quote-cart-icon-button"
                    onClick={() => cart.removeItem(item.id)}
                    title={`Remove ${item.title}`}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="quote-cart-panel-actions">
              <button className="btn btn-outline btn-small" onClick={cart.clearItems} type="button">Clear Cart</button>
              <a className="btn btn-primary btn-small" href={quoteUrl}>Request a Quote</a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function useQuoteCart() {
  const value = useContext(QuoteCartContext);
  if (!value) throw new Error('Quote cart components require QuoteCartProvider.');
  return value;
}

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const normalized = normalizeItem(item as QuoteCartItem);
    return normalized.id && normalized.title ? [normalized] : [];
  }).slice(0, 100);
}

function normalizeItem(item: QuoteCartItem): QuoteCartItem {
  return {
    id: getText(item.id).slice(0, 160),
    title: getText(item.title).slice(0, 200),
    image: getSafeImageUrl(item.image),
    imageAlt: getText(item.imageAlt).slice(0, 240),
    category: getText(item.category).slice(0, 120),
    link: getSafeSiteHref(getText(item.link), '/catalog'),
  };
}

function safeStorageSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80) || 'tenant';
}

function getSafeImageUrl(value: unknown) {
  const candidate = getText(value);
  return /^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/') ? candidate : '';
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
