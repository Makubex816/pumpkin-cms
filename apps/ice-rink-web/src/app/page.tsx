import type { Metadata } from 'next';
import { PageRenderer } from '@/components/PageRenderer';
import { StructuredData } from '@/components/StructuredData';
import { getFallbackHome, getFallbackTheme } from '@/data';
import { buildMetadata } from '@/lib/metadata';
import { fetchPage, fetchTheme } from '@/lib/pumpkin-api';
import { resolveSite } from '@/lib/resolve-site';
import { replaceSiteTokens } from '@/lib/token-replace';

export async function generateMetadata(): Promise<Metadata> {
  const site = resolveSite();
  const page = replaceSiteTokens((await fetchPage(site, 'home')) ?? getFallbackHome(site), site);
  return buildMetadata(page, site);
}

export default async function HomePage() {
  const site = resolveSite();
  const [cmsPage, cmsTheme] = await Promise.all([
    fetchPage(site, 'home'),
    fetchTheme(site),
  ]);

  const page = replaceSiteTokens(cmsPage ?? getFallbackHome(site), site);
  const theme = replaceSiteTokens(cmsTheme ?? getFallbackTheme(site), site);

  return (
    <>
      <StructuredData page={page} />
      <PageRenderer page={page} blockStyles={theme.blockStyles} />
    </>
  );
}
