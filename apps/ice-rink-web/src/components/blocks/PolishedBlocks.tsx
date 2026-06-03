'use client';

import React from 'react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  Gift,
  HelpCircle,
  Mail,
  MapPin,
  MapPinned,
  PackageCheck,
  PartyPopper,
  Phone,
  Ruler,
  School,
  Send,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Tent,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { IHtmlBlock } from 'pumpkin-ts-models';
import type { FormDefinition } from 'pumpkin-ts-models';
import { FormBlockView, type FormBlockSubmitPayload } from 'pumpkin-block-views';

type CmsContent = Record<string, unknown>;
type CmsBlock = IHtmlBlock & {
  id?: string;
  name?: string;
  enabled?: boolean;
  content: CmsContent;
};
type CmsImage = {
  src: string;
  alt: string;
  caption: string;
  mediaAssetId: string;
};

export interface ContactSubmitPayload {
  formId: string;
  formKey?: string;
  pageSlug: string;
  sourcePage?: string;
  siteKey?: string;
  tenantId?: string;
  formType?: string;
  staticEndpointRef?: string;
  leadRecipientRef?: string;
  formData: Record<string, string>;
}

interface SubmitHandler {
  (payload: ContactSubmitPayload): Promise<void> | void;
}

interface PolishedBlockProps {
  block: CmsBlock;
  pageSlug?: string;
  tenantId?: string;
  siteKey?: string;
  formDefinitions?: FormDefinition[];
  onContactSubmit?: SubmitHandler;
}

const iconMap: Record<string, LucideIcon> = {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Gift,
  HelpCircle,
  Mail,
  MapPin,
  MapPinned,
  PackageCheck,
  PartyPopper,
  Phone,
  Ruler,
  School,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Tent,
  Users,
  Warehouse,
  Wrench,
};

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function getArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getIcon(name: unknown): LucideIcon {
  const key = getString(name);
  return iconMap[key] ?? Circle;
}

function getBlockContent(block: CmsBlock): CmsContent {
  return block.content ?? {};
}

function getSectionVariant(block: CmsBlock): string {
  const content = getBlockContent(block);
  return getString(content.sectionVariant) || getString(content.variant) || getString(content.type);
}

function isVariant(block: CmsBlock, variant: string): boolean {
  return getSectionVariant(block) === variant;
}

function getImage(value: unknown): CmsImage {
  if (!value || typeof value !== 'object') {
    return { src: '', alt: '', caption: '', mediaAssetId: '' };
  }

  const image = value as CmsContent;
  return {
    src: getString(image.publicUrl) || getString(image.url) || getString(image.src),
    alt: getString(image.alt) || getString(image.altText),
    caption: getString(image.caption),
    mediaAssetId: getString(image.mediaAssetId) || getString(image.assetId),
  };
}

function getBlockMedia(content: CmsContent, fallbackUrlKey = 'mainImage'): CmsImage {
  const image = getImage(content.media || content.image || content.featuredImage);
  if (image.src) return image;

  return {
    src: getString(content[fallbackUrlKey]) || getString(content.backgroundImage),
    alt: getString(content[`${fallbackUrlKey}AltText`]) || getString(content.alt) || getString(content.imageAlt),
    caption: getString(content.caption),
    mediaAssetId: getString(content.mediaAssetId) || getString(content.assetId) || getString(content[`${fallbackUrlKey}MediaAssetId`]),
  };
}

function getPartnerContent(content: CmsContent): CmsContent {
  return isRecord(content.partner) ? content.partner : {};
}

function getPartnerLogo(partner: CmsContent): CmsImage {
  return getImage(partner.logoMedia || partner.logoRequirement || partner.logo || partner.media);
}

function isPpecPartnerBlock(block: CmsBlock): boolean {
  const content = getBlockContent(block);
  const partner = getPartnerContent(content);
  const partnerName = getString(partner.name);
  return /Party Pros East Coast|PPEC/i.test(partnerName || JSON.stringify(content));
}

function getApprovedPartnerHref(content: CmsContent, partner: CmsContent): string {
  const cta = isRecord(content.cta) ? content.cta : {};
  const candidate =
    getString(partner.url) ||
    getString(content.partnerUrl) ||
    getString(cta.href) ||
    getString(content.buttonLink);
  const source = getString(partner.urlSource) || getString(content.urlSource);
  if (/^https:\/\/partyproseastcoast\.com\/?$/i.test(candidate) && source) return candidate;
  if (candidate.startsWith('#')) return candidate;
  return '';
}

function getCardGridColumns(layout: string, count: number): string {
  if (layout.includes('2') || count === 2) {
    return 'md:grid-cols-2';
  }

  return 'md:grid-cols-2 lg:grid-cols-3';
}

function getFieldName(field: CmsContent, label: string, index: number): string {
  const configuredName = getString(field.name) || getString(field.key);
  const source = configuredName || label;
  const normalized = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `field-${index + 1}`;
}

export function renderPolishedBlock({
  block,
  pageSlug,
  tenantId,
  siteKey,
  formDefinitions,
  onContactSubmit,
}: PolishedBlockProps): React.ReactNode | null {
  switch (block.type) {
    case 'Hero':
      if (isVariant(block, 'heroMedia')) return <IceHeroMediaSection block={block} />;
      return <PolishedHeroBlock block={block} />;
    case 'TrustBar':
      if (isPpecPartnerBlock(block)) return <IcePpecPartnerBandSection block={block} />;
      if (isVariant(block, 'trustBand')) return <IceTrustBandSection block={block} />;
      return <PolishedTrustBarBlock block={block} />;
    case 'CardGrid':
      if (isVariant(block, 'mediaUseCaseGrid')) return <IceMediaUseCaseGridSection block={block} />;
      if (isVariant(block, 'splitFeature')) return <IceSplitFeatureSection block={block} />;
      if (isVariant(block, 'planningTopics')) return <IcePlanningTopicsSection block={block} />;
      return <PolishedCardGridBlock block={block} />;
    case 'HowItWorks':
      if (isVariant(block, 'processSteps')) return <IceProcessStepsSection block={block} />;
      return <PolishedHowItWorksBlock block={block} />;
    case 'FAQ':
      if (isVariant(block, 'faqAccordion')) return <IceFaqAccordionSection block={block} />;
      return <PolishedFAQBlock block={block} />;
    case 'ServiceAreaMap':
      if (isVariant(block, 'serviceAreaTeaser')) return <IceServiceAreaTeaserSection block={block} />;
      return null;
    case 'PrimaryCTA':
      if (isVariant(block, 'ppecPartnerBand') || isVariant(block, 'partnerBrandBand') || isVariant(block, 'partnerResourceCta') || isPpecPartnerBlock(block)) {
        return <IcePpecPartnerBandSection block={block} />;
      }
      if (isVariant(block, 'finalCta')) return <IceFinalCtaSection block={block} />;
      return <PolishedPrimaryCTABlock block={block} />;
    case 'Contact':
      return <PolishedContactBlock block={block} pageSlug={pageSlug} onSubmit={onContactSubmit} />;
    case 'formBlock':
      return (
        <FormBlockView
          block={block as unknown as import('pumpkin-ts-models').FormBlock}
          definitions={formDefinitions}
          tenantId={tenantId}
          siteKey={siteKey}
          pageSlug={pageSlug}
          onSubmit={(payload: FormBlockSubmitPayload) => onContactSubmit?.(payload)}
        />
      );
    default:
      return null;
  }
}

export function IcePpecPartnerBandSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const partner = getPartnerContent(content);
  const logo = getPartnerLogo(partner);
  const cta = isRecord(content.cta) ? content.cta : {};
  const headline = getString(content.headline) || getString(content.title, 'Planning more than the rink?');
  const description =
    getString(content.description) ||
    getString(content.subtitle) ||
    'Party Pros East Coast can help larger events discuss additional event rental equipment, entertainment ideas, and logistics around the rink experience.';
  const contentButtonText = getString(content.buttonText);
  const buttonText =
    getString(content.partnerCtaLabel) ||
    getString(cta.label) ||
    (/Party Pros|PPEC/i.test(contentButtonText) ? contentButtonText : 'Explore Party Pros East Coast');
  const buttonHref = getApprovedPartnerHref(content, partner);
  const secondaryButtonText = getString(content.secondaryButtonText) || (!/Party Pros|PPEC/i.test(contentButtonText) ? contentButtonText : '');
  const secondaryButtonLink = getString(content.secondaryButtonLink) || (!/Party Pros|PPEC/i.test(contentButtonText) ? getString(content.buttonLink) : '');
  const partnerName = getString(partner.name, 'Party Pros East Coast');
  const displayRole = getString(partner.displayRole, 'Event rental partner');

  return (
    <section className="ice-section ice-section--ppec-partner" aria-label="Party Pros East Coast partner resource">
      <div className="cms-container cms-container-wide">
        <article className="ppec-partner-band">
          <div className="ppec-partner-copy">
            {getString(content.eyebrow) && <p className="ppec-partner-eyebrow">{getString(content.eyebrow)}</p>}
            <h2 className="ppec-partner-heading">{headline}</h2>
            <p className="ppec-partner-text">{description}</p>
            <div className="ppec-partner-cta">
              {buttonHref ? (
                <a className="ppec-button ppec-button--primary" href={buttonHref}>
                  {buttonText}
                  <ArrowRight className="ppec-button__icon" aria-hidden="true" />
                </a>
              ) : (
                <span className="ppec-button ppec-button--disabled" aria-disabled="true">
                  Partner URL needs approval
                </span>
              )}
              {secondaryButtonText && secondaryButtonLink && (
                <a className="ppec-button ppec-button--secondary" href={secondaryButtonLink}>
                  {secondaryButtonText}
                </a>
              )}
            </div>
          </div>

          <div className="ppec-partner-card">
            <div className="ppec-partner-logo-wrap">
              {logo.src ? (
                <img className="ppec-partner-logo" src={logo.src} alt={logo.alt || `${partnerName} logo`} />
              ) : (
                <span className="ppec-partner-logo-missing">{partnerName}</span>
              )}
            </div>
            <p className="ppec-partner-card-label">{displayRole}</p>
            <p className="ppec-partner-card-name">{partnerName}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export function IceHeroMediaSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const image = getBlockMedia(content);
  const primaryCta = isRecord(content.primaryCta) ? content.primaryCta : {};
  const secondaryCta = isRecord(content.secondaryCta) ? content.secondaryCta : {};
  const buttonText = getString(primaryCta.label) || getString(content.buttonText);
  const buttonLink = getString(primaryCta.href) || getString(content.buttonLink, '/contact');
  const secondaryButtonText = getString(secondaryCta.label) || getString(content.secondaryButtonText);
  const secondaryButtonLink = getString(secondaryCta.href) || getString(content.secondaryButtonLink, '/service-areas');

  return (
    <div className="ice-section ice-section--hero">
      <div className="cms-container cms-container-wide">
        <div>
          {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
          <h1 className="ice-heading">{getString(content.headline)}</h1>
          {getString(content.subheadline) && <p className="ice-copy">{getString(content.subheadline)}</p>}
          {(buttonText || secondaryButtonText) && (
            <div className="ice-button-row">
              {buttonText && (
                <a className="ice-button ice-button--primary" href={buttonLink}>
                  {buttonText}
                  <ArrowRight className="ice-button__icon" aria-hidden="true" />
                </a>
              )}
              {secondaryButtonText && (
                <a className="ice-button ice-button--secondary" href={secondaryButtonLink}>
                  {secondaryButtonText}
                </a>
              )}
            </div>
          )}
        </div>
        {image.src && (
          <figure className="ice-media">
            <img className="ice-media__image" src={image.src} alt={image.alt || getString(content.headline)} />
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        )}
      </div>
    </div>
  );
}

export function IceTrustBandSection({ block }: { block: CmsBlock }) {
  const items = getArray<CmsContent>(getBlockContent(block).items);
  if (!items.length) return null;

  return (
    <div className="ice-section ice-section--cards">
      <div className="cms-container cms-container-wide">
        <div className="ice-grid ice-grid--4">
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <article className="ice-card ice-card--feature" key={`${getString(item.title, 'Trust item')}-${index}`}>
                <Icon className="ice-card__icon" aria-hidden="true" />
                <h2>{getString(item.title)}</h2>
                {getString(item.text) && <p>{getString(item.text)}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function IceMediaUseCaseGridSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const cards = getArray<CmsContent>(content.cards);

  return (
    <div className="ice-section ice-section--media">
      <div className="cms-container cms-container-wide">
        <div className="ice-section__intro">
          {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
          <h2 className="ice-heading">{getString(content.title)}</h2>
          {getString(content.subtitle) && <p className="ice-copy">{getString(content.subtitle)}</p>}
        </div>
        <div className="ice-grid ice-grid--3">
          {cards.map((card, index) => {
            const image = getImage(card.media || card.image);
            return (
              <article className="ice-card ice-card--media" key={`${getString(card.title, 'Use case')}-${index}`}>
                {image.src && (
                  <figure className="ice-media">
                    <img className="ice-media__image" src={image.src} alt={image.alt || getString(card.title)} />
                  </figure>
                )}
                <div>
                  <h3>{getString(card.title)}</h3>
                  <p>{getString(card.description)}</p>
                  {getString(card.ctaHref) && getString(card.ctaLabel) && (
                    <a href={getString(card.ctaHref)} className="ice-card__link">
                      {getString(card.ctaLabel)}
                      <ArrowRight className="ice-button__icon" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function IceSplitFeatureSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const image = getBlockMedia(content, 'image');
  const bullets = getArray<unknown>(content.bullets).map((item) => getString(item)).filter(Boolean);

  return (
    <div className="ice-section ice-section--cards">
      <div className="cms-container cms-container-wide">
        <div className="ice-grid ice-grid--2">
          {image.src && (
            <figure className="ice-media">
              <img className="ice-media__image" src={image.src} alt={image.alt || getString(content.title)} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          )}
          <article className="ice-card ice-card--feature">
            {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
            <h2>{getString(content.title)}</h2>
            <p>{getString(content.description)}</p>
            {bullets.length > 0 && (
              <ul className="ice-list">
                {bullets.map((bullet) => (
                  <li key={bullet}>
                    <CheckCircle2 className="ice-list__icon" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

export function IceProcessStepsSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const steps = getArray<CmsContent>(content.steps);

  return (
    <div className="ice-section ice-section--process">
      <div className="cms-container cms-container-wide">
        <div className="ice-section__intro">
          {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
          <h2 className="ice-heading">{getString(content.title)}</h2>
          {getString(content.subtitle) && <p className="ice-copy">{getString(content.subtitle)}</p>}
        </div>
        <div className="ice-grid ice-grid--4">
          {steps.map((step, index) => (
            <article className="ice-card ice-card--feature" key={`${getString(step.title, 'Step')}-${index}`}>
              <div className="ice-step-number">{index + 1}</div>
              <h3>{getString(step.title)}</h3>
              <p>{getString(step.text)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IcePlanningTopicsSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const topics = getArray<CmsContent | string>(content.topics);

  return (
    <div className="ice-section ice-section--planning">
      <div className="cms-container cms-container-wide">
        <div className="ice-grid ice-grid--2">
          <div>
            {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
            <h2 className="ice-heading">{getString(content.title)}</h2>
            {getString(content.subtitle) && <p className="ice-copy">{getString(content.subtitle)}</p>}
          </div>
          <div className="ice-grid ice-grid--2">
            {topics.map((topic, index) => {
              const label = typeof topic === 'string' ? topic : getString(topic.title || topic.label);
              const description = typeof topic === 'string' ? '' : getString(topic.description);
              return (
                <article className="ice-card ice-card--feature" key={`${label || 'Topic'}-${index}`}>
                  <h3>{label}</h3>
                  {description && <p>{description}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IceServiceAreaTeaserSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const buttonText = getString(content.buttonText, 'View service areas');
  const buttonLink = getString(content.buttonLink, '/service-areas');

  return (
    <div className="ice-section ice-section--service-area">
      <div className="cms-container cms-container-wide">
        <article className="ice-card ice-card--feature">
          {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
          <h2>{getString(content.title)}</h2>
          <p>{getString(content.description)}</p>
          <a className="ice-button ice-button--secondary" href={buttonLink}>
            {buttonText}
            <ArrowRight className="ice-button__icon" aria-hidden="true" />
          </a>
        </article>
      </div>
    </div>
  );
}

export function IceFaqAccordionSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const items = getArray<CmsContent>(content.items);

  return (
    <div className="ice-section ice-section--faq">
      <div className="cms-container cms-container-standard">
        <div className="ice-section__intro">
          <h2 className="ice-heading">{getString(content.title)}</h2>
          {getString(content.subtitle) && <p className="ice-copy">{getString(content.subtitle)}</p>}
        </div>
        <div className="ice-faq-list">
          {items.map((item, index) => (
            <details className="ice-card ice-card--feature" key={`${getString(item.question, 'Question')}-${index}`} open={index === 0}>
              <summary>
                <span>{getString(item.question)}</span>
                <HelpCircle className="ice-card__icon" aria-hidden="true" />
              </summary>
              <p>{getString(item.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IceFinalCtaSection({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const buttonText = getString(content.buttonText);
  const buttonLink = getString(content.buttonLink, '/contact');

  return (
    <div className="ice-section ice-section--cta">
      <div className="cms-container cms-container-wide">
        <div>
          {getString(content.eyebrow) && <p className="ice-eyebrow">{getString(content.eyebrow)}</p>}
          <h2 className="ice-heading">{getString(content.title)}</h2>
          {getString(content.description) && <p className="ice-copy">{getString(content.description)}</p>}
        </div>
        {buttonText && (
          <a className="ice-button ice-button--primary" href={buttonLink}>
            {buttonText}
            <ArrowRight className="ice-button__icon" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function isRecord(value: unknown): value is CmsContent {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function PolishedHeroBlock({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const headline = getString(content.headline);
  const subheadline = getString(content.subheadline);
  const eyebrow = getString(content.eyebrow);
  const buttonText = getString(content.buttonText);
  const buttonLink = getString(content.buttonLink, '/contact');
  const secondaryButtonText = getString(content.secondaryButtonText);
  const secondaryButtonLink = getString(content.secondaryButtonLink, '/ice-rink-rentals');
  const trustLine = getString(content.trustLine);
  const backgroundImage = getString(content.backgroundImage);
  const mainImage = getString(content.mainImage);

  return (
    <div
      className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_12%_14%,rgba(186,230,253,0.95),transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eff6ff_46%,#dbeafe_100%)]"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className="absolute inset-0 bg-white/40" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[540px] max-w-6xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-6 md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] md:px-8 md:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-4 inline-flex w-fit rounded-full border border-sky-200 bg-white/85 px-4 py-1.5 text-xs font-bold uppercase text-sky-800 shadow-sm">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              {subheadline}
            </p>
          )}

          {(buttonText || secondaryButtonText) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {buttonText && (
                <a
                  href={buttonLink}
                  className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/15 transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  {buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {secondaryButtonText && (
                <a
                  href={secondaryButtonLink}
                  className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border border-sky-200 bg-white/90 px-6 py-3 text-sm font-bold text-sky-800 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          )}

          {trustLine && <p className="mt-6 max-w-xl text-sm font-semibold leading-6 text-slate-600">{trustLine}</p>}
        </div>

        <div className="relative hidden md:block">
          {mainImage ? (
            <div
              className="aspect-[4/3] rounded-3xl border border-white/70 bg-cover bg-center shadow-2xl shadow-sky-900/20"
              style={{ backgroundImage: `url(${mainImage})` }}
              role="img"
              aria-label={getString(content.mainImageAltText, headline)}
            />
          ) : (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl shadow-sky-900/15 backdrop-blur">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Date', CalendarCheck],
                  ['Venue', MapPin],
                  ['Setup', Wrench],
                  ['Quote', ClipboardCheck],
                ].map(([label, Icon]) => {
                  const IconComponent = Icon as LucideIcon;
                  return (
                    <div key={label as string} className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                      <IconComponent className="h-6 w-6 text-sky-700" aria-hidden="true" />
                      <p className="mt-3 text-sm font-extrabold text-slate-950">{label as string}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase text-sky-700">Planning path</p>
                <p className="mt-2 text-xl font-extrabold leading-tight text-slate-950">
                  {headline || 'Rental planning'}
                </p>
                {subheadline && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{subheadline}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PolishedTrustBarBlock({ block }: { block: CmsBlock }) {
  const items = getArray<CmsContent>(getBlockContent(block).items);

  if (!items.length) return null;

  return (
    <div className="border-y border-sky-100 bg-white py-8">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={`${getString(item.title, 'Trust item')}-${index}`}
                className="min-h-[150px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-extrabold text-slate-950">{getString(item.title)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{getString(item.text)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PolishedCardGridBlock({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const cards = getArray<CmsContent>(content.cards);
  const layout = getString(content.layout, 'grid-3');
  const columns = getCardGridColumns(layout, cards.length);

  return (
    <div className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
            {getString(content.title)}
          </h2>
          {getString(content.subtitle) && (
            <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">{getString(content.subtitle)}</p>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-5 ${columns}`}>
          {cards.map((card, index) => {
            const Icon = getIcon(card.icon);
            const link = getString(card.link);
            const title = getString(card.title);

            return (
              <article
                key={`${title || 'Card'}-${index}`}
                className="group flex min-h-[230px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 transition group-hover:bg-sky-700 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold leading-tight text-slate-950">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{getString(card.description)}</p>
                {link && (
                  <a
                    href={link}
                    className="mt-5 inline-flex w-fit items-center text-sm font-bold text-sky-700 transition hover:text-sky-900"
                  >
                    Learn more
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PolishedHowItWorksBlock({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const steps = getArray<CmsContent>(content.steps);

  return (
    <div className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase text-sky-700">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
            {getString(content.title)}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={`${getString(step.title, 'Step')}-${index}`}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-sky-700 text-sm font-extrabold text-white shadow-lg shadow-sky-900/15">
                {index + 1}
              </div>
              <h3 className="text-lg font-extrabold leading-tight text-slate-950">{getString(step.title)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{getString(step.text)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PolishedFAQBlock({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const items = getArray<CmsContent>(content.items);

  return (
    <div className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 md:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
            {getString(content.title)}
          </h2>
          {getString(content.subtitle) && (
            <p className="mt-3 text-base leading-7 text-slate-600">{getString(content.subtitle)}</p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <details
              key={`${getString(item.question, 'Question')}-${index}`}
              className="group rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left text-base font-extrabold text-slate-950 transition hover:bg-sky-50">
                <span>{getString(item.question)}</span>
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-5 text-sm leading-6 text-slate-600">{getString(item.answer)}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PolishedPrimaryCTABlock({ block }: { block: CmsBlock }) {
  const content = getBlockContent(block);
  const buttonText = getString(content.buttonText);
  const buttonLink = getString(content.buttonLink, '/contact');
  const secondaryText = getString(content.secondaryText);
  const secondaryLinkText = getString(content.secondaryLinkText);
  const secondaryLink = getString(content.secondaryLink);

  return (
    <div className="relative overflow-hidden bg-sky-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(186,230,253,0.25),transparent_32%)]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
            {getString(content.title)}
          </h2>
          {getString(content.description) && (
            <p className="mt-4 text-base leading-7 text-sky-50 md:text-lg">{getString(content.description)}</p>
          )}
          {(secondaryText || secondaryLinkText) && (
            <p className="mt-4 text-sm font-medium text-sky-100">
              {secondaryText}{' '}
              {secondaryLinkText && secondaryLink && (
                <a href={secondaryLink} className="font-bold text-white underline underline-offset-4 hover:text-sky-100">
                  {secondaryLinkText}
                </a>
              )}
            </p>
          )}
        </div>

        {buttonText && (
          <a
            href={buttonLink}
            className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-sky-800 shadow-lg transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-800"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

export function PolishedContactBlock({
  block,
  pageSlug,
  onSubmit,
}: {
  block: CmsBlock;
  pageSlug?: string;
  onSubmit?: SubmitHandler;
}) {
  const content = getBlockContent(block);
  const fields = getArray<CmsContent>(content.formFields);
  const formId = getString(content.id, block.id ?? 'contact');
  const resolvedPageSlug = pageSlug || 'contact';
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');
  const statusRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    if (status === 'success' || status === 'error') {
      statusRef.current?.focus();
    }
  }, [status, message]);

  async function submitContactForm(payload: ContactSubmitPayload) {
    if (onSubmit) {
      await onSubmit(payload);
      return;
    }

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Unable to submit the contact form. Please try again.');
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: Record<string, string> = {};

    formData.forEach((value, key) => {
      values[key] = String(value);
    });

    setStatus('submitting');
    setMessage('Sending your quote request...');

    try {
      await submitContactForm({
        formId,
        pageSlug: resolvedPageSlug,
        formData: values,
      });
      form.reset();
      setStatus('success');
      setMessage(getString(content.thankYouMessage).trim() || 'Thanks - your quote request was submitted.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to send your quote request. Please try again.');
    }
  };

  return (
    <div className="bg-white py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-6 md:p-8">
          <p className="text-sm font-bold uppercase text-sky-700">Quote request</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
            {getString(content.title)}
          </h2>
          {getString(content.subtitle) && (
            <p className="mt-4 text-base leading-7 text-slate-600">{getString(content.subtitle)}</p>
          )}

          <div className="mt-8 space-y-4">
            {getString(content.email) && (
              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Email</p>
                  <a href={`mailto:${getString(content.email)}`} className="text-sm font-bold text-slate-950 hover:text-sky-800">
                    {getString(content.email)}
                  </a>
                </div>
              </div>
            )}
            {getString(content.phone) && (
              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Phone</p>
                  <p className="text-sm font-bold text-slate-950">{getString(content.phone)}</p>
                </div>
              </div>
            )}
            {getString(content.hours) && (
              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Response timing</p>
                  <p className="text-sm leading-6 text-slate-700">{getString(content.hours)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={status === 'submitting'}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field, index) => {
              const label = getString(field.label, `Field ${index + 1}`);
              const type = getString(field.type, 'text');
              const name = getFieldName(field, label, index);
              const required = getBoolean(field.required);
              const placeholder = getString(field.placeholder);
              const helpText = getString(field.helpText);
              const inputType = type === 'phone' ? 'tel' : type;
              const options = getArray<unknown>(field.options)
                .map((option) => getString(option))
                .filter(Boolean);
              const isTextarea = type === 'textarea';
              const isSelect = type === 'select';
              const isCheckbox = type === 'checkbox';
              const isHidden = type === 'hidden';

              return (
                <label
                  key={`${label}-${index}`}
                  className={isTextarea || isCheckbox || isHidden ? 'sm:col-span-2' : undefined}
                >
                  {!isHidden && (
                    <span className="mb-1.5 block text-sm font-bold text-slate-800">
                      {label}
                      {required && <span className="text-sky-700"> *</span>}
                    </span>
                  )}
                  {isHidden ? (
                    <input name={name} type="hidden" value={placeholder} />
                  ) : isTextarea ? (
                    <textarea
                      name={name}
                      required={required}
                      disabled={status === 'submitting'}
                      placeholder={placeholder}
                      className="min-h-[130px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-200"
                    />
                  ) : isSelect ? (
                    <select
                      name={name}
                      required={required}
                      disabled={status === 'submitting'}
                      defaultValue=""
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="" disabled>{placeholder || 'Select an option'}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : isCheckbox ? (
                    <span className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                      <input
                        name={name}
                        type="checkbox"
                        required={required}
                        disabled={status === 'submitting'}
                        value="true"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-500"
                      />
                      <span>{placeholder || label}</span>
                    </span>
                  ) : (
                    <input
                      name={name}
                      type={inputType}
                      required={required}
                      disabled={status === 'submitting'}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-200"
                    />
                  )}
                  {helpText && <span className="mt-1.5 block text-xs text-slate-500">{helpText}</span>}
                </label>
              );
            })}
          </div>

          {status !== 'idle' && message && (
            <p
              ref={statusRef}
              tabIndex={-1}
              className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold outline-none ${
                status === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : status === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-800'
                    : 'border border-sky-200 bg-sky-50 text-sky-800'
              }`}
              role={status === 'error' ? 'alert' : 'status'}
              aria-live={status === 'error' ? 'assertive' : 'polite'}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-6 inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/15 transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          >
            {status === 'submitting' ? 'Sending...' : getString(content.submitButtonText, 'Send Request')}
            <Send className="ml-2 h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
