import { buildPageUrl } from '@/lib/metadata';
import { fetchSitemapData } from '@/lib/pumpkin-api';
import { resolveSite } from '@/lib/resolve-site';

export const revalidate = 86400;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const site = resolveSite();
    const entries = await fetchSitemapData(site);
    const xml = generateSitemapXml(entries, site);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('[sitemap.xml] Error generating sitemap:', error);

    return new Response(emptySitemapXml(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

function generateSitemapXml(
  entries: Array<{ pageSlug: string; lastModified: string }>,
  site: ReturnType<typeof resolveSite>
): string {
  const urls = entries
    .map((entry) => {
      const loc = buildPageUrl(site, entry.pageSlug);
      const lastmod = new Date(entry.lastModified).toISOString().split('T')[0];

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function emptySitemapXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
