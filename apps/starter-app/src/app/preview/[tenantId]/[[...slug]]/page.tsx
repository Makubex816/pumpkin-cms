import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FooterClassNames, HeaderClassNames } from 'pumpkin-block-views';
import { PackageStaticPreview } from '@/components/PackageStaticPreview';
import { PageRenderer } from '@/components/PageRenderer';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { buildMetadata } from '@/lib/metadata';
import {
  getPackageStaticPreviewPage,
  getPreviewPage,
  normalizePreviewSlug,
} from '@/lib/preview-fixtures';
import { getSiteChrome } from '@/lib/site-chrome';
import { getThemeCssPath } from '@/themes/registry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PreviewPageProps {
  params: {
    tenantId: string;
    slug?: string[];
  };
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const packagePreview = await getPackageStaticPreviewPage(params.tenantId, params.slug ?? []);
  if (packagePreview) {
    return {
      title: { absolute: packagePreview.page.title },
      description: packagePreview.page.description,
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
    };
  }

  const preview = await getPreviewPage(params.tenantId, params.slug ?? []);
  if (!preview) return { title: 'Preview Not Found', robots: 'noindex, nofollow' };

  return {
    ...buildMetadata(preview.page),
    robots: 'noindex, nofollow',
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const packagePreview = await getPackageStaticPreviewPage(params.tenantId, params.slug ?? []);
  if (packagePreview) {
    return <PackageStaticPreview fixture={packagePreview.fixture} page={packagePreview.page} />;
  }

  const preview = await getPreviewPage(params.tenantId, params.slug ?? []);
  if (!preview) notFound();

  const { fixture, formDefinitions, page, theme } = preview;
  const slug = normalizePreviewSlug(params.slug ?? []);
  const chrome = getSiteChrome(theme);

  return (
    <>
      <link rel="stylesheet" href={getThemeCssPath(theme)} />
      {theme.header.logoUrl && <link rel="icon" href={theme.header.logoUrl} />}
      <div className="bg-orange-50 px-4 py-2 text-center text-sm font-semibold text-orange-950">
        Preview mode for {fixture.siteName || fixture.tenantId}: unpublished fixture content, forms disabled.
      </div>
      <SiteHeader
        header={theme.header}
        menu={theme.menu}
        classNames={theme.header.classNames as HeaderClassNames}
        chrome={chrome}
      />
      <main data-preview-mode="compiled-fixture" data-preview-tenant={fixture.tenantId} data-preview-slug={slug}>
        <PageRenderer
          page={page}
          blockStyles={theme.blockStyles}
          formDefinitions={formDefinitions}
          previewMode
          tenantId={fixture.tenantId}
          siteKey={fixture.siteKey || fixture.tenantId}
        />
      </main>
      <SiteFooter
        footer={theme.footer}
        menu={theme.menu}
        logoUrl={theme.header.logoUrl}
        logoAlt={theme.header.logoAlt}
        classNames={theme.footer.classNames as FooterClassNames}
        chrome={chrome}
      />
    </>
  );
}
