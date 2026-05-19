import { resolveSite } from '@/lib/resolve-site';
import { generateRobotsTxt } from '@/lib/static-artifacts';

export const revalidate = 86400;

export async function GET() {
  const site = resolveSite();

  return new Response(generateRobotsTxt(site), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
