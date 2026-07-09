import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { FooterClassNames, HeaderClassNames } from 'pumpkin-block-views';
import { PageRenderer } from '@/components/PageRenderer';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { buildMetadata } from '@/lib/metadata';
import { getPreviewPage, normalizePreviewSlug } from '@/lib/preview-fixtures';
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
  const preview = await getPreviewPage(params.tenantId, params.slug ?? []);
  if (!preview) return { title: 'Preview Not Found', robots: 'noindex, nofollow' };

  return {
    ...buildMetadata(preview.page),
    robots: 'noindex, nofollow',
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const preview = await getPreviewPage(params.tenantId, params.slug ?? []);
  if (!preview) notFound();

  const { fixture, formDefinitions, page, theme } = preview;
  const slug = normalizePreviewSlug(params.slug ?? []);

  return (
    <>
      <link rel="stylesheet" href={getThemeCssPath(theme)} />
      <div className="bg-orange-50 px-4 py-2 text-center text-sm font-semibold text-orange-950">
        Preview mode for {fixture.siteName || fixture.tenantId}: unpublished fixture content, forms disabled.
      </div>
      <SiteHeader
        header={theme.header}
        menu={theme.menu}
        classNames={theme.header.classNames as HeaderClassNames}
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
      />
    </>
  );
}

