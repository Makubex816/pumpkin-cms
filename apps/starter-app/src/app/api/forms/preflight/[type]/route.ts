import { NextRequest, NextResponse } from 'next/server';
import { getRegisteredHostTenantIds, resolveHostTenantRouteForHost } from '@/lib/host-tenant-registry';
import { resolveTenantRuntimeConfig } from '@/lib/tenant-runtime-config';

interface RouteContext { params: { type: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const submissionId = typeof body?.submissionId === 'string' ? body.submissionId : crypto.randomUUID();
  const correlationId = typeof body?.correlationId === 'string' ? body.correlationId : crypto.randomUUID();
  const fail = (status: number, errorCode: string, message: string) => NextResponse.json({ ready: false, errorCode, message, submissionId, correlationId, createsFormEntry: false }, { status });
  if (!body) return fail(400, 'invalid_json', 'The request body is not valid JSON.');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const route = resolveHostTenantRouteForHost(host);
  if (!route) return fail(404, 'form_unavailable', 'Form preflight is unavailable.');
  const config = resolveTenantRuntimeConfig(route.tenantId, process.env, getRegisteredHostTenantIds());
  if (!config) return fail(503, 'tenant_runtime_inactive', 'Tenant form runtime is not active.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${config.apiUrl}/api/forms/${encodeURIComponent(config.tenantId)}/preflight/${encodeURIComponent(params.type)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': submissionId, 'X-Pumpkin-Submission-Id': submissionId, 'X-Correlation-Id': correlationId },
      body: JSON.stringify({ ...body, tenantId: config.tenantId, submissionId, correlationId, idempotencyKey: submissionId }),
      signal: controller.signal,
    });
    const text = await response.text();
    return new NextResponse(text, { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json', 'X-Pumpkin-Submission-Id': submissionId, 'X-Correlation-Id': correlationId } });
  } catch (error) {
    const timeoutError = error instanceof DOMException && error.name === 'AbortError';
    return fail(timeoutError ? 504 : 502, timeoutError ? 'upstream_timeout' : 'upstream_transport_error', timeoutError ? 'Preflight exceeded the upstream time limit.' : 'Preflight could not reach the form service.');
  } finally {
    clearTimeout(timeout);
  }
}
