import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { StructuredData } from '@/components/StructuredData';
import { getFallbackPage, getFallbackTheme } from '@/data';
import { getPageForRender, getStaticSlugsForBuild, getThemeForRender } from '@/lib/content-source';
import { buildMetadata, buildNotFoundMetadata } from '@/lib/metadata';
import { getRenderMode, getStaticFormEndpoint, isStaticRenderMode } from '@/lib/render-mode';
import { resolveSite } from '@/lib/resolve-site';
import { replaceSiteTokens } from '@/lib/token-replace';

interface SlugPageProps {
  params: { slug: string[] };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getPagePath(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  return !normalizedSlug || normalizedSlug === 'home' ? '/' : `/${normalizedSlug}`;
}

export async function generateStaticParams() {
  if (!isStaticRenderMode()) {
    return [];
  }

  const site = resolveSite();
  return getStaticSlugsForBuild(site).map((slug) => ({
    slug: slug.split('/').filter(Boolean),
  }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const site = resolveSite();
  const slug = params.slug.join('/');
  const page = (await getPageForRender(site, slug)) ?? getFallbackPage(site, slug);

  if (!page) return buildNotFoundMetadata(site);

  return buildMetadata(replaceSiteTokens(page, site), site);
}

export default async function SlugPage({ params }: SlugPageProps) {
  const site = resolveSite();
  const slug = params.slug.join('/');
  const [cmsPage, cmsTheme] = await Promise.all([
    getPageForRender(site, slug),
    getThemeForRender(site),
  ]);

  if (!isStaticRenderMode() && cmsPage && normalizeSlug(cmsPage.pageSlug) !== normalizeSlug(slug)) {
    permanentRedirect(getPagePath(cmsPage.pageSlug));
  }

  const page = replaceSiteTokens(cmsPage ?? getFallbackPage(site, slug), site);

  if (!page) {
    notFound();
  }

  const theme = replaceSiteTokens(cmsTheme ?? getFallbackTheme(site), site);

  return (
    <>
      <StructuredData page={page} />
      <PageRenderer
        page={page}
        blockStyles={theme.blockStyles}
        designSystem={theme.designSystem}
        renderMode={getRenderMode()}
        staticFormEndpoint={getStaticFormEndpoint()}
      />
    </>
  );
}
