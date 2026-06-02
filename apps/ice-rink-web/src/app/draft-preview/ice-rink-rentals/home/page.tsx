import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DraftPreviewClient } from '@/app/draft-preview/ice-rink-rentals/home/DraftPreviewClient';
import { resolveStaticSiteDefinition } from '@/config/sites';
import { getFallbackTheme } from '@/data';
import { isStaticRenderMode } from '@/lib/render-mode';

export const metadata: Metadata = {
  title: 'Ice Homepage Draft Preview',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function isDraftPreviewEnabled() {
  if (isStaticRenderMode()) return false;
  if (process.env.PUMPKIN_DRAFT_PREVIEW_ENABLED === 'true') return true;
  if (process.env.NEXT_PUBLIC_PUMPKIN_DRAFT_PREVIEW_ENABLED === 'true') return true;

  return process.env.NODE_ENV !== 'production';
}

function getPreviewApiBaseUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_PUMPKIN_API_URL ||
    process.env.PUMPKIN_API_URL ||
    'http://localhost:5064';

  try {
    const url = new URL(rawUrl);
    url.username = '';
    url.password = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return 'http://localhost:5064';
  }
}

export default function IceHomepageDraftPreviewPage() {
  if (!isDraftPreviewEnabled()) {
    notFound();
  }

  const site = resolveStaticSiteDefinition('ice-rink-rentals');
  const fallbackTheme = getFallbackTheme(site);

  return (
    <DraftPreviewClient
      apiBaseUrl={getPreviewApiBaseUrl()}
      fallbackTheme={fallbackTheme}
      pageSlug="home"
      tenantId={site.tenantId || 'ice-rink-rentals'}
    />
  );
}
