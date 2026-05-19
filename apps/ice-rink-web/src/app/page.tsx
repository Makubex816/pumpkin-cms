import type { Metadata } from 'next';
import { PageRenderer } from '@/components/PageRenderer';
import { StructuredData } from '@/components/StructuredData';
import { getFallbackHome, getFallbackTheme } from '@/data';
import { getPageForRender, getThemeForRender } from '@/lib/content-source';
import { buildMetadata } from '@/lib/metadata';
import { getRenderMode, getStaticFormAction } from '@/lib/render-mode';
import { resolveSite } from '@/lib/resolve-site';
import { replaceSiteTokens } from '@/lib/token-replace';

export async function generateMetadata(): Promise<Metadata> {
  const site = resolveSite();
  const page = replaceSiteTokens((await getPageForRender(site, 'home')) ?? getFallbackHome(site), site);
  return buildMetadata(page, site);
}

export default async function HomePage() {
  const site = resolveSite();
  const [cmsPage, cmsTheme] = await Promise.all([
    getPageForRender(site, 'home'),
    getThemeForRender(site),
  ]);

  const page = replaceSiteTokens(cmsPage ?? getFallbackHome(site), site);
  const theme = replaceSiteTokens(cmsTheme ?? getFallbackTheme(site), site);

  return (
    <>
      <StructuredData page={page} />
      <PageRenderer
        page={page}
        blockStyles={theme.blockStyles}
        renderMode={getRenderMode()}
        staticFormAction={getStaticFormAction()}
      />
    </>
  );
}
