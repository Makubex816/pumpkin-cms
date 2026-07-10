import type { IHtmlBlock } from 'pumpkin-ts-models';
import { CatalogIndexBlock } from '@/components/CatalogIndexBlock';
import { getSafeSiteHref } from '@/lib/site-chrome';

const CATALOG_BLOCK_TYPES = new Set([
  'CatalogHero',
  'CatalogIndex',
  'PillStrip',
  'Callout',
  'CatalogGrid',
  'ContentGrid',
  'LinkGrid',
  'FinalCTA',
]);

interface CatalogBlock extends IHtmlBlock {
  content: Record<string, unknown>;
}

interface ActionItem {
  label?: unknown;
  url?: unknown;
  variant?: unknown;
}

interface CardItem {
  title?: unknown;
  description?: unknown;
  image?: unknown;
  imageAlt?: unknown;
  link?: unknown;
  media?: unknown;
}

interface LinkItem {
  label?: unknown;
  url?: unknown;
}

export function isCatalogBlock(block: IHtmlBlock) {
  return CATALOG_BLOCK_TYPES.has(block.type);
}

export function CatalogBlockRenderer({ block }: { block: IHtmlBlock }) {
  const catalogBlock = block as CatalogBlock;

  switch (catalogBlock.type) {
    case 'CatalogHero':
      return <CatalogHero content={catalogBlock.content} />;
    case 'CatalogIndex':
      return <CatalogIndexBlock content={catalogBlock.content} />;
    case 'PillStrip':
      return <PillStrip content={catalogBlock.content} />;
    case 'Callout':
      return <Callout content={catalogBlock.content} />;
    case 'CatalogGrid':
      return <CatalogGrid content={catalogBlock.content} />;
    case 'ContentGrid':
      return <ContentGrid content={catalogBlock.content} />;
    case 'LinkGrid':
      return <LinkGrid content={catalogBlock.content} />;
    case 'FinalCTA':
      return <FinalCta content={catalogBlock.content} />;
    default:
      return null;
  }
}

function CatalogHero({ content }: { content: Record<string, unknown> }) {
  const media = getMedia(content.media);
  const actions = getRecords<ActionItem>(content.actions);

  return (
    <section className="hero">
      <div className={`container hero-grid${media.url ? '' : ' hero-grid--single'}`}>
        <div>
          {getText(content.eyebrow) && <div className="eyebrow">{getText(content.eyebrow)}</div>}
          <h1>{getText(content.headline)}</h1>
          {getText(content.subheadline) && <p className="lead">{getText(content.subheadline)}</p>}
          {actions.length > 0 && (
            <div className="hero-actions">
              {actions.map((action, index) => (
                <a
                  key={`${getText(action.label)}-${index}`}
                  className={`btn ${getActionClass(action.variant)}`}
                  href={getSafeSiteHref(getText(action.url))}
                >
                  {getText(action.label)}
                </a>
              ))}
            </div>
          )}
        </div>
        {media.url && (
          <aside className="hero-card">
            <img src={media.url} alt={media.alt} fetchPriority="high" />
            {getText(content.imageCaption) && <p>{getText(content.imageCaption)}</p>}
          </aside>
        )}
      </div>
    </section>
  );
}

function PillStrip({ content }: { content: Record<string, unknown> }) {
  const items = getStrings(content.items);
  if (items.length === 0) return null;

  return (
    <div className="brand-strip">
      <div className="container">
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function Callout({ content }: { content: Record<string, unknown> }) {
  return (
    <section className={`section ${getToneClass(content.tone)}`}>
      <div className="container">
        <div className="answer-box">
          {getText(content.label) && <strong>{getText(content.label)} </strong>}
          {getText(content.body)}
        </div>
      </div>
    </section>
  );
}

function CatalogGrid({ content }: { content: Record<string, unknown> }) {
  const cards = getRecords<CardItem>(content.cards);

  return (
    <section className={`section ${getToneClass(content.tone)}`}>
      <div className="container">
        <SectionHeading content={content} />
        <div className="item-grid">
          {cards.map((card, index) => {
            const media = getMedia(card.media, card.image, card.imageAlt);
            return (
              <a
                className="item-card"
                href={getSafeSiteHref(getText(card.link), '/contact')}
                key={`${getText(card.title)}-${index}`}
              >
                {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
                <div className="item-card-body">
                  <h3>{getText(card.title)}</h3>
                  {getText(card.description) && <p>{getText(card.description)}</p>}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContentGrid({ content }: { content: Record<string, unknown> }) {
  const cards = getRecords<CardItem>(content.cards);

  return (
    <section className={`section ${getToneClass(content.tone)}`}>
      <div className="container content-grid">
        {cards.map((card, index) => (
          <article className="content-card" key={`${getText(card.title)}-${index}`}>
            <h2>{getText(card.title)}</h2>
            <p>{getText(card.description)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LinkGrid({ content }: { content: Record<string, unknown> }) {
  const links = getRecords<LinkItem>(content.links);

  return (
    <section className={`section ${getToneClass(content.tone)} link-grid-section`}>
      <div className="container">
        <SectionHeading content={content} />
        <div className="related-grid">
          {links.map((link, index) => (
            <a
              href={getSafeSiteHref(getText(link.url))}
              key={`${getText(link.label)}-${index}`}
            >
              {getText(link.label)}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ content }: { content: Record<string, unknown> }) {
  const actions = getRecords<ActionItem>(content.actions);

  return (
    <section className="final-cta">
      <div className="container">
        <h2>{getText(content.title)}</h2>
        {getText(content.body) && <p>{getText(content.body)}</p>}
        <div className="hero-actions">
          {actions.map((action, index) => (
            <a
              className={`btn ${getActionClass(action.variant)}`}
              href={getSafeSiteHref(getText(action.url))}
              key={`${getText(action.label)}-${index}`}
            >
              {getText(action.label)}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ content }: { content: Record<string, unknown> }) {
  return (
    <>
      {getText(content.kicker) && <div className="section-kicker">{getText(content.kicker)}</div>}
      {getText(content.title) && <h2 className="section-title">{getText(content.title)}</h2>}
      {getText(content.description) && <p className="section-description">{getText(content.description)}</p>}
    </>
  );
}

function getMedia(mediaValue: unknown, imageValue?: unknown, altValue?: unknown) {
  const media = mediaValue && typeof mediaValue === 'object'
    ? mediaValue as Record<string, unknown>
    : {};
  const candidate = getText(media.publicUrl) || getText(media.url) || getText(imageValue);
  const url = /^(https?:)?\/\//i.test(candidate) || candidate.startsWith('/') ? candidate : '';
  const alt = getText(media.alt) || getText(media.title) || getText(altValue);
  return { url, alt };
}

function getActionClass(value: unknown) {
  const variant = getText(value);
  if (variant === 'light') return 'btn-light';
  if (variant === 'outline') return 'btn-outline';
  if (variant === 'dark') return 'btn-dark';
  return 'btn-primary';
}

function getToneClass(value: unknown) {
  return getText(value) === 'white' ? 'section-white' : 'section-soft';
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function getRecords<T>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((item): item is T => Boolean(item) && typeof item === 'object')
    : [];
}
