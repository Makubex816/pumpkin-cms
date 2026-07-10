import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { buildMetadata } from '@/lib/metadata';
import { getHostTenantPreviewPage } from '@/lib/host-tenant-routing';
import { fetchPumpkinPage, getFormDefinitionsForPage, getSiteTheme } from '@/lib/pumpkin-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SlugPageProps {
  params: {
    slug: string[];
  };
}

function normalizeSlug(slugParts: string[]) {
  return slugParts.join('/').toLowerCase();
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const hostTenantPreview = await getHostTenantPreviewPage(params.slug);
  if (hostTenantPreview?.preview) {
    return buildMetadata(hostTenantPreview.preview.page);
  }

  if (hostTenantPreview && !hostTenantPreview.preview) {
    return { title: 'Page Not Found' };
  }

  const page = await fetchPumpkinPage(normalizeSlug(params.slug));
  if (!page) return { title: 'Page Not Found' };
  return buildMetadata(page);
}

export default async function SlugPage({ params }: SlugPageProps) {
  const hostTenantPreview = await getHostTenantPreviewPage(params.slug);
  if (hostTenantPreview) {
    if (!hostTenantPreview.preview) notFound();

    const { fixture, formDefinitions, page, theme } = hostTenantPreview.preview;
    return (
      <PageRenderer
        page={page}
        blockStyles={theme.blockStyles}
        formDefinitions={formDefinitions}
        previewMode={hostTenantPreview.route.formsMode !== 'live-submit'}
        tenantId={fixture.tenantId}
        siteKey={fixture.siteKey || fixture.tenantId}
      />
    );
  }

  const [page, theme] = await Promise.all([
    fetchPumpkinPage(normalizeSlug(params.slug)),
    getSiteTheme(),
  ]);

  if (!page) {
    notFound();
  }

  const formDefinitions = await getFormDefinitionsForPage(page);

  return (
    <PageRenderer
      page={page}
      blockStyles={theme.blockStyles}
      formDefinitions={formDefinitions}
    />
  );
}
