import type { ResolvedSite } from '@/config/sites';
import { buildPageUrl } from '@/lib/metadata';

export interface SitemapLikeEntry {
  pageSlug: string;
  lastModified: string;
}

export function generateSitemapXml(entries: SitemapLikeEntry[], site: ResolvedSite): string {
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

export function generateRobotsTxt(site: ResolvedSite): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site.canonicalUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export function emptySitemapXml(): string {
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
