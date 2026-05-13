import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { StructuredData } from '@/components/StructuredData';
import { getFallbackPage, getFallbackTheme } from '@/data';
import { buildMetadata, buildNotFoundMetadata } from '@/lib/metadata';
import { fetchPage, fetchTheme } from '@/lib/pumpkin-api';
import { resolveSite } from '@/lib/resolve-site';
import { replaceSiteTokens } from '@/lib/token-replace';

interface SlugPageProps {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const site = resolveSite();
  const slug = params.slug.join('/');
  const page = (await fetchPage(site, slug)) ?? getFallbackPage(site, slug);

  if (!page) return buildNotFoundMetadata(site);

  return buildMetadata(replaceSiteTokens(page, site), site);
}

export default async function SlugPage({ params }: SlugPageProps) {
  const site = resolveSite();
  const slug = params.slug.join('/');
  const [cmsPage, cmsTheme] = await Promise.all([
    fetchPage(site, slug),
    fetchTheme(site),
  ]);

  const page = replaceSiteTokens(cmsPage ?? getFallbackPage(site, slug), site);

  if (!page) {
    notFound();
  }

  const theme = replaceSiteTokens(cmsTheme ?? getFallbackTheme(site), site);

  return (
    <>
      <StructuredData page={page} />
      <PageRenderer page={page} blockStyles={theme.blockStyles} />
    </>
  );
}
