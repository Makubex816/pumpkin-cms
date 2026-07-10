import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { fallbackHomePage } from '@/data';
import { buildMetadata } from '@/lib/metadata';
import { getHostTenantPreviewPage } from '@/lib/host-tenant-routing';
import { fetchPumpkinPage, getFormDefinitionsForPage, getSiteTheme } from '@/lib/pumpkin-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const hostTenantPreview = await getHostTenantPreviewPage();
  if (hostTenantPreview?.preview) {
    return buildMetadata(hostTenantPreview.preview.page);
  }

  const page = (await fetchPumpkinPage('home')) ?? fallbackHomePage;
  return buildMetadata(page);
}

export default async function HomePage() {
  const hostTenantPreview = await getHostTenantPreviewPage();
  if (hostTenantPreview) {
    if (!hostTenantPreview.preview) notFound();

    const { fixture, formDefinitions, page, theme } = hostTenantPreview.preview;
    return (
      <PageRenderer
        page={page}
        blockStyles={theme.blockStyles}
        formDefinitions={formDefinitions}
        previewMode
        tenantId={fixture.tenantId}
        siteKey={fixture.siteKey || fixture.tenantId}
      />
    );
  }

  const [page, theme] = await Promise.all([
    fetchPumpkinPage('home'),
    getSiteTheme(),
  ]);
  const pageToRender = page ?? fallbackHomePage;
  const formDefinitions = await getFormDefinitionsForPage(pageToRender);

  return (
    <PageRenderer
      page={pageToRender}
      blockStyles={theme.blockStyles}
      formDefinitions={formDefinitions}
    />
  );
}
