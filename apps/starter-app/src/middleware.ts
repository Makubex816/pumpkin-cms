import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantRedirect, shouldResolveTenantRedirect } from '@/lib/tenant-redirect-runtime';
import {
  isTenantPreviewPath,
  resolveHostFixtureRedirect,
  resolvePreviewFixtureRedirect,
} from '@/lib/preview-fixture-redirects';
import {
  getRegisteredHostTenantIds,
  resolveHostTenantRouteForHost,
} from '@/lib/host-tenant-registry';
import { resolveTenantRuntimeConfig } from '@/lib/tenant-runtime-config';

export async function middleware(request: NextRequest) {
  const previewRedirect = resolvePreviewFixtureRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search.slice(1),
  );
  if (previewRedirect) {
    const response = NextResponse.redirect(
      new URL(previewRedirect.location, getRequestOrigin(request)),
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

  const requestHost = getRequestHost(request);
  const hostFixtureRedirect = resolveHostFixtureRedirect(
    requestHost,
    request.nextUrl.pathname,
    request.nextUrl.search.slice(1),
  );
  if (hostFixtureRedirect) {
    return NextResponse.redirect(
      new URL(hostFixtureRedirect.location, getRequestOrigin(request)),
      hostFixtureRedirect.statusCode,
    );
  }

  if (!shouldResolveTenantRedirect(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hostRoute = resolveHostTenantRouteForHost(requestHost);
  const tenantRuntimeConfig = hostRoute
    ? resolveTenantRuntimeConfig(hostRoute.tenantId, process.env, getRegisteredHostTenantIds())
    : null;
  const runtimeConfig = tenantRuntimeConfig
    ? {
        tenantId: tenantRuntimeConfig.tenantId,
        apiUrl: tenantRuntimeConfig.apiUrl,
        apiKey: tenantRuntimeConfig.apiKey,
      }
    : null;
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

function getRequestOrigin(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto')?.split(',', 1)[0].trim()
    || request.nextUrl.protocol.replace(/:$/, '')
    || 'https';
  return `${protocol}://${getRequestHost(request)}`;
}
