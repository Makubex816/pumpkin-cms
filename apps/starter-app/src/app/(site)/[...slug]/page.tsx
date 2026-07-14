import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PackageStaticPreview } from '@/components/PackageStaticPreview';
import { PageRenderer } from '@/components/PageRenderer';
import { buildMetadata } from '@/lib/metadata';
import {
  getHostTenantPackagePage,
  getHostTenantPreviewPage,
  isCurrentRequestStarterFallbackHost,
} from '@/lib/host-tenant-routing';
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
  const hostTenantPackage = await getHostTenantPackagePage(params.slug);
  if (hostTenantPackage) return buildPackageMetadata(hostTenantPackage.packagePreview.page);

  const hostTenantPreview = await getHostTenantPreviewPage(params.slug);
  if (hostTenantPreview?.preview) {
    return buildMetadata(hostTenantPreview.preview.page);
  }

  if (hostTenantPreview && !hostTenantPreview.preview) {
    return { title: 'Page Not Found' };
  }

  if (!isCurrentRequestStarterFallbackHost()) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const page = await fetchPumpkinPage(normalizeSlug(params.slug));
  if (!page) return { title: 'Page Not Found' };
  return buildMetadata(page);
}

export default async function SlugPage({ params }: SlugPageProps) {
  const hostTenantPackage = await getHostTenantPackagePage(params.slug);
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

  if (!isCurrentRequestStarterFallbackHost()) notFound();

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
