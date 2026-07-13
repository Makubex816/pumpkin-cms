import { NextRequest, NextResponse } from 'next/server';
import {
  getTenantRedirectRuntimeConfig,
  resolveTenantRedirect,
  shouldResolveTenantRedirect,
} from '@/lib/tenant-redirect-runtime';
import {
  isTenantPreviewPath,
  resolvePreviewFixtureRedirect,
} from '@/lib/preview-fixture-redirects';

export async function middleware(request: NextRequest) {
  const previewRedirect = resolvePreviewFixtureRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search.slice(1),
  );
  if (previewRedirect) {
    const requestHost = getRequestHost(request);
    const requestProtocol = request.headers.get('x-forwarded-proto')?.split(',', 1)[0].trim()
      || request.nextUrl.protocol.replace(/:$/, '')
      || 'https';
    const response = NextResponse.redirect(
      new URL(previewRedirect.location, `${requestProtocol}://${requestHost}`),
      previewRedirect.statusCode,
    );
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  if (isTenantPreviewPath(request.nextUrl.pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  if (!shouldResolveTenantRedirect(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const runtimeConfig = getTenantRedirectRuntimeConfig(process.env);
  if (!runtimeConfig) return NextResponse.next();

  const resolution = await resolveTenantRedirect(
    runtimeConfig,
    request.nextUrl.pathname,
    request.nextUrl.search.slice(1),
  );
  if (!resolution) return NextResponse.next();

  return NextResponse.redirect(new URL(resolution.location, request.url), resolution.statusCode);
}

export const config = {
  matcher: '/:path*',
};

function getRequestHost(request: NextRequest) {
  const candidate = request.headers.get('host')?.trim()
    || request.headers.get('x-forwarded-host')?.split(',', 1)[0].trim()
    || request.nextUrl.host;
  return /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(candidate) ? candidate : request.nextUrl.host;
}
