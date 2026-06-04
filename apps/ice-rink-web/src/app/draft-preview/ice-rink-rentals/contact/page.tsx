import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DraftPreviewClient } from '@/app/draft-preview/ice-rink-rentals/DraftPreviewClient';
import { getPreviewApiBaseUrl, isDraftPreviewEnabled } from '@/app/draft-preview/ice-rink-rentals/previewConfig';
import { resolveStaticSiteDefinition } from '@/config/sites';
import { getFallbackTheme } from '@/data';

export const metadata: Metadata = {
  title: 'Ice Contact Draft Preview',
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

export default function IceContactDraftPreviewPage() {
  if (!isDraftPreviewEnabled()) {
    notFound();
  }

  const site = resolveStaticSiteDefinition('ice-rink-rentals');
  const fallbackTheme = getFallbackTheme(site);

  return (
    <DraftPreviewClient
      apiBaseUrl={getPreviewApiBaseUrl()}
      fallbackTheme={fallbackTheme}
      pageSlug="contact"
      previewScope="Ice contact draft only"
      publicPath="/contact"
      storageKey="pumpkin_ice_contact_preview_jwt"
      tenantId={site.tenantId || 'ice-rink-rentals'}
    />
  );
}
