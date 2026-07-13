import { NextRequest, NextResponse } from 'next/server';
import {
  getTenantRedirectRuntimeConfig,
  resolveTenantRedirect,
  shouldResolveTenantRedirect,
} from '@/lib/tenant-redirect-runtime';

export async function middleware(request: NextRequest) {
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
