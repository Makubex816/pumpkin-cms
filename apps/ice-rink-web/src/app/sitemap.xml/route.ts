import { getFallbackSitemapEntries } from '@/data';
import { getSitemapEntriesForRender } from '@/lib/content-source';
import { resolveSite } from '@/lib/resolve-site';
import { generateSitemapXml } from '@/lib/static-artifacts';

export const revalidate = 86400;

export async function GET() {
  const site = resolveSite();
  const entries = (await getSitemapEntriesForRender(site)) ?? getFallbackSitemapEntries();
  const xml = generateSitemapXml(entries, site);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
