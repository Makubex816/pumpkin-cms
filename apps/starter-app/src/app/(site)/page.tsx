import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PackageStaticPreview } from '@/components/PackageStaticPreview';
import { PageRenderer } from '@/components/PageRenderer';
import { fallbackHomePage } from '@/data';
import { buildMetadata } from '@/lib/metadata';
import {
  getHostTenantPackagePage,
  getHostTenantPreviewPage,
  isCurrentRequestStarterFallbackHost,
} from '@/lib/host-tenant-routing';
import { fetchPumpkinPage, getFormDefinitionsForPage, getSiteTheme } from '@/lib/pumpkin-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const hostTenantPackage = await getHostTenantPackagePage();
  if (hostTenantPackage) return buildPackageMetadata(hostTenantPackage.packagePreview.page);

  const hostTenantPreview = await getHostTenantPreviewPage();
  if (hostTenantPreview?.preview) {
    return buildMetadata(hostTenantPreview.preview.page);
  }

  if (!isCurrentRequestStarterFallbackHost()) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const page = (await fetchPumpkinPage('home')) ?? fallbackHomePage;
  return buildMetadata(page);
}

export default async function HomePage() {
  const hostTenantPackage = await getHostTenantPackagePage();
  if (hostTenantPackage) {
    return (
      <PackageStaticPreview
        fixture={hostTenantPackage.packagePreview.fixture}
        formsEnabled={hostTenantPackage.formsEnabled}
        mode="site"
        page={hostTenantPackage.packagePreview.page}
      />
    );
  }

  const hostTenantPreview = await getHostTenantPreviewPage();
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

  if (!isCurrentRequestStarterFallbackHost()) notFound();

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

function buildPackageMetadata(page: { title: string; description: string; canonicalUrl: string }): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.canonicalUrl || undefined },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
