import { NextRequest, NextResponse } from 'next/server';
import {
  getRegisteredHostTenantIds,
  resolveHostTenantRouteForHost,
} from '@/lib/host-tenant-registry';
import { resolveTenantRuntimeConfig } from '@/lib/tenant-runtime-config';

interface SubmitRouteContext {
  params: {
    type: string;
  };
}

export async function POST(request: NextRequest, { params }: SubmitRouteContext) {
  const requestHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const route = resolveHostTenantRouteForHost(requestHost);
  if (!route || route.formsMode !== 'live-submit') {
    return NextResponse.json({ message: 'Form submission is unavailable.' }, { status: 404 });
  }

  const config = resolveTenantRuntimeConfig(route.tenantId, process.env, getRegisteredHostTenantIds());

  if (!config) {
    return NextResponse.json(
      { message: 'Tenant form runtime is not active.' },
      { status: 503 },
    );
  }

  const formData = await request.json() as Record<string, unknown>;
  const requestedFormKey = params.type.trim().toLowerCase();
  const payloadFormKey = typeof formData.formKey === 'string' ? formData.formKey.trim().toLowerCase() : '';
  if (payloadFormKey && payloadFormKey !== requestedFormKey) {
    return NextResponse.json({ message: 'Form identity mismatch.' }, { status: 400 });
  }

  const response = await fetch(
    `${config.apiUrl}/api/forms/${encodeURIComponent(config.tenantId)}/submit/${encodeURIComponent(params.type)}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        tenantId: route.tenantId,
        formKey: requestedFormKey,
      }),
    },
  );

  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? 'application/json';

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
    },
  });
}
