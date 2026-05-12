import React from 'react';
import type { IHtmlBlock } from 'pumpkin-ts-models';

interface EnhancedHeroContent extends Record<string, unknown> {
  headline?: string;
  subheadline?: string;
  backgroundImage?: string;
  mainImage?: string;
  mainImageAltText?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  trustLine?: string;
  eyebrow?: string;
}

interface EnhancedHeroBlock extends IHtmlBlock {
  type: 'Hero';
  content: EnhancedHeroContent;
}

type EnhancedHeroClassNames = Record<string, string>;

interface EnhancedHeroBlockProps {
  block: EnhancedHeroBlock;
  classNames?: EnhancedHeroClassNames;
}

const defaults: EnhancedHeroClassNames = {
  root: 'relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#e0f2fe_42%,_#bae6fd_100%)]',
  overlay: 'absolute inset-0 bg-white/10',
  container: 'relative z-10 mx-auto grid min-h-[520px] max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] md:px-8 md:py-20',
  eyebrow: 'mb-4 inline-flex w-fit rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase text-sky-800 shadow-sm',
  headline: 'max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl lg:text-6xl',
  subheadline: 'mt-5 max-w-2xl text-base leading-8 text-slate-700 md:text-lg',
  actions: 'mt-8 flex flex-col gap-3 sm:flex-row sm:items-center',
  button: 'inline-flex min-h-12 items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/15 transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
  secondaryButton: 'inline-flex min-h-12 items-center justify-center rounded-full border border-sky-200 bg-white/85 px-6 py-3 text-sm font-bold text-sky-800 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
  trustLine: 'mt-6 max-w-xl text-sm font-semibold leading-6 text-slate-600',
  mainImage: 'w-full rounded-2xl border border-white/60 object-cover shadow-2xl shadow-sky-900/20',
  visual: 'relative hidden md:block',
  visualCard: 'rounded-3xl border border-white/70 bg-white/75 p-6 shadow-2xl shadow-sky-900/15 backdrop-blur',
  visualKicker: 'text-xs font-bold uppercase text-sky-700',
  visualTitle: 'mt-4 text-2xl font-extrabold leading-tight text-slate-950',
  visualText: 'mt-3 text-sm leading-6 text-slate-600',
};

export function EnhancedHeroBlock({ block, classNames }: EnhancedHeroBlockProps) {
  const cx = { ...defaults, ...classNames };
  const { content } = block;

  return (
    <section
      className={cx.root}
      style={
        content.backgroundImage
          ? { backgroundImage: `url(${content.backgroundImage})` }
          : undefined
      }
    >
      <div className={cx.overlay} aria-hidden="true" />
      <div className={cx.container}>
        <div>
          {content.eyebrow && <p className={cx.eyebrow}>{content.eyebrow}</p>}
          <h1 className={cx.headline}>{content.headline}</h1>
          {content.subheadline && <p className={cx.subheadline}>{content.subheadline}</p>}

          <div className={cx.actions}>
            {content.buttonText && (
              <a href={content.buttonLink || '/contact'} className={cx.button}>
                {content.buttonText}
              </a>
            )}
            {content.secondaryButtonText && (
              <a href={content.secondaryButtonLink || '/ice-rink-rentals'} className={cx.secondaryButton}>
                {content.secondaryButtonText}
              </a>
            )}
          </div>

          {content.trustLine && <p className={cx.trustLine}>{content.trustLine}</p>}
        </div>

        <div className={cx.visual} aria-hidden={!content.mainImage}>
          {content.mainImage ? (
            <>
              {/* CMS image URLs can be local or tenant-managed external assets. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.mainImage}
                alt={content.mainImageAltText || ''}
                className={cx.mainImage}
              />
            </>
          ) : (
            <div className={cx.visualCard}>
              <p className={cx.visualKicker}>Rental planning</p>
              <p className={cx.visualTitle}>Dates, venue fit, setup needs, and quote support in one clear path.</p>
              <p className={cx.visualText}>
                Built for event planners comparing portable rink rental options before peak seasonal dates.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
