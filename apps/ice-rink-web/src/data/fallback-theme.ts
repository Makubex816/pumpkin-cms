import type { Theme } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { replaceSiteTokens } from '@/lib/token-replace';

const fallbackThemeTemplate: Theme = {
  id: 'fallback-theme',
  themeId: 'fallback-theme',
  tenantId: '',
  name: '{{brand}} Default Theme',
  description: 'Default rental-site theme used when Pumpkin CMS has no active theme.',
  isActive: true,
  header: {
    logoUrl: '',
    logoAlt: '{{brand}}',
    sticky: true,
    ctaText: 'Get a Quote',
    ctaUrl: '/contact',
    ctaTarget: '_self',
    classNames: {
      root: 'sticky top-0 z-50 w-full border-b border-sky-100 bg-white/90 backdrop-blur-md',
      container: 'max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between h-16',
      logoWrapper: 'flex items-center gap-2.5 group',
      logoIcon: 'hidden',
      logoText: 'text-lg font-extrabold text-slate-950 tracking-tight group-hover:text-sky-700 transition-colors',
      nav: 'hidden md:flex items-center gap-7 text-sm font-medium text-slate-600',
      navLink: 'hover:text-sky-700 transition-colors',
      ctaButton: 'hidden md:inline-flex items-center gap-2 px-5 py-2 bg-sky-700 text-white text-sm font-bold rounded-full hover:bg-sky-800 transition-all shadow-sm',
    },
  },
  footer: {
    copyright: 'Copyright {year} {{brand}}. All rights reserved.',
    description: '{{service}} for events, seasonal activations, venues, and private celebrations.',
    classNames: {
      root: 'w-full border-t border-sky-100 bg-slate-950 text-white',
      container: 'max-w-6xl mx-auto px-6 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8',
      brandSection: 'md:col-span-2',
      brandLogoWrapper: 'flex items-center gap-2',
      brandLogoIcon: 'hidden',
      brandLogoText: 'text-lg font-extrabold text-white',
      brandDescription: 'text-sm text-slate-300 mt-2 max-w-sm',
      columnTitle: 'text-xs font-bold uppercase tracking-widest text-sky-200 mb-3',
      columnList: 'space-y-2 text-sm text-slate-300',
      columnLink: 'hover:text-white transition-colors',
      bottomBar: 'border-t border-white/10',
      bottomBarInner: 'max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between text-xs text-slate-400',
      builtWith: 'underline hover:text-white transition-colors',
    },
  },
  blockStyles: {},
  menu: [
    { label: 'Rentals', url: '/ice-rink-rentals', target: '_self', icon: '', order: 1, isVisible: true, children: [] },
    { label: 'Events', url: '/events-holiday-activations', target: '_self', icon: '', order: 2, isVisible: true, children: [] },
    { label: 'Service Areas', url: '#service-area-map', target: '_self', icon: '', order: 3, isVisible: true, children: [] },
    { label: 'FAQ', url: '#faq', target: '_self', icon: '', order: 4, isVisible: true, children: [] },
    { label: 'Contact', url: '/contact', target: '_self', icon: '', order: 5, isVisible: true, children: [] },
  ],
  createdAt: '2026-05-12T00:00:00Z',
  updatedAt: '2026-05-12T00:00:00Z',
};

export function getFallbackTheme(site: ResolvedSite): Theme {
  return {
    ...replaceSiteTokens(fallbackThemeTemplate, site),
    id: `${site.key}-fallback-theme`,
    themeId: `${site.key}-fallback-theme`,
    tenantId: site.tenantId || site.key,
  };
}
