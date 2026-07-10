import { QuoteCartButton, type QuoteCartItem } from '@/components/QuoteCart';
import { getSafeSiteHref } from '@/lib/site-chrome';

interface DetailItem {
  title?: unknown;
  description?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  link?: unknown;
  quoteId?: unknown;
  category?: unknown;
}

interface FaqItem {
  question?: unknown;
  answer?: unknown;
}

interface LinkItem {
  label?: unknown;
  url?: unknown;
}

export function ItemDetailBlock({ content }: { content: Record<string, unknown> }) {
  const title = getText(content.title);
  const description = getText(content.description);
  const image = getSafeImageUrl(content.image);
  const imageAlt = getText(content.imageAlt) || title;
  const stats = getStrings(content.stats);
  const examples = getStrings(content.examples);
  const directAnswer = getText(content.directAnswer);
  const planningNotes = getStrings(content.planningNotes);
  const relatedItems = getRecords<DetailItem>(content.relatedItems);
  const relatedLinks = getRecords<LinkItem>(content.relatedLinks);
  const faq = getRecords<FaqItem>(content.faq);
  const quoteItem = getQuoteItem(content.quoteItem);

  return (
    <div className="item-detail" data-item-detail="true">
      <section className="section section-white">
        <div className="container item-featured">
          {image && <img alt={imageAlt} className="item-featured-image" src={image} />}
          <div className="item-featured-copy">
            {getText(content.kicker) && <div className="section-kicker">{getText(content.kicker)}</div>}
            <h2 className="section-title-item">{title}</h2>
            {description && <p>{description}</p>}
            {stats.length > 0 && (
              <div className="item-stats" data-item-stat-count={stats.length}>
                {stats.map((stat) => <span key={stat}>{stat}</span>)}
              </div>
            )}
            {examples.length > 0 && (
              <div className="item-use-cases">
                {getText(content.examplesLabel) && <strong>{getText(content.examplesLabel)}</strong>}
                <ul>{examples.map((example) => <li key={example}>{example}</li>)}</ul>
              </div>
            )}
            {quoteItem && <QuoteCartButton item={quoteItem} />}
          </div>
        </div>
      </section>

      {directAnswer && (
        <section className="section section-soft item-direct-answer">
          <div className="container">
            <div className="answer-box"><strong>Direct answer: </strong>{stripDirectAnswerLabel(directAnswer)}</div>
          </div>
        </section>
      )}

      {relatedItems.length > 0 && (
        <section className="section section-white" data-related-item-count={relatedItems.length}>
          <div className="container">
            <div className="section-kicker">Approved catalog items</div>
            <h2 className="section-title">Related Party Pros rentals</h2>
            <div className="item-grid item-detail-related-grid">
              {relatedItems.map((item, index) => {
                const related = normalizeDetailItem(item, index);
                return (
                  <article className="item-card" key={related.quoteId}>
                    <a className="catalog-card-main" href={getSafeSiteHref(related.link, '/catalog')}>
                      {related.image && <img alt={related.imageAlt || related.title} loading="lazy" src={related.image} />}
                      <div className="item-card-body">
                        <h3>{related.title}</h3>
                        {related.description && <p>{related.description}</p>}
                        <span className="catalog-card-link">View details</span>
                      </div>
                    </a>
                    <div className="quote-cart-card-action">
                      <QuoteCartButton item={{
                        id: related.quoteId,
                        title: related.title,
                        image: related.image,
                        imageAlt: related.imageAlt,
                        category: related.category,
                        link: related.link,
                      }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(planningNotes.length > 0 || relatedLinks.length > 0) && (
        <section className="section section-soft item-planning-section">
          <div className="container item-planning-layout">
            {planningNotes.length > 0 && (
              <div>
                <div className="section-kicker">Planning notes</div>
                <h2>Important details before booking</h2>
                {planningNotes.map((note) => <p key={note}>{note}</p>)}
              </div>
            )}
            {relatedLinks.length > 0 && (
              <div>
                <div className="section-kicker">Keep planning</div>
                <h2>Related Party Pros pages</h2>
                <div className="related-grid">
                  {relatedLinks.map((link, index) => (
                    <a href={getSafeSiteHref(getText(link.url), '/catalog')} key={`${getText(link.label)}-${index}`}>
                      {getText(link.label)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="section section-white" data-item-faq-count={faq.length}>
          <div className="container">
            <div className="section-kicker">Questions</div>
            <h2 className="section-title">Frequently asked questions</h2>
            <div className="faq-list">
              {faq.map((item, index) => (
                <article className="faq-item" key={`${getText(item.question)}-${index}`}>
                  <h3>{getText(item.question)}</h3>
                  <p>{getText(item.answer)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function normalizeDetailItem(item: DetailItem, index: number) {
  const title = getText(item.title) || `Catalog item ${index + 1}`;
  const link = getText(item.link);
  return {
    title,
    description: getText(item.description),
    image: getSafeImageUrl(item.image),
    imageAlt: getText(item.imageAlt),
    link,
    category: getText(item.category),
    quoteId: getText(item.quoteId) || link.replace(/^\/+/, '') || `catalog-item-${index + 1}`,
  };
}

function getQuoteItem(value: unknown): QuoteCartItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const id = getText(item.id);
  const title = getText(item.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    image: getSafeImageUrl(item.image),
    imageAlt: getText(item.imageAlt),
    category: getText(item.category),
    link: getText(item.link),
  };
}

function stripDirectAnswerLabel(value: string) {
  return value.replace(/^Direct answer:\s*/i, '');
}

function getSafeImageUrl(value: unknown) {
  const candidate = getText(value);
  return /^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/') ? candidate : '';
}

function getStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function getRecords<T>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((item): item is T => Boolean(item) && typeof item === 'object')
    : [];
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
