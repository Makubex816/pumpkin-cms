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
  const startedAt = Date.now();
  const requestBody = await request.json().catch(() => null) as Record<string, unknown> | null;
  const submissionId = typeof requestBody?.submissionId === 'string' && requestBody.submissionId
    ? requestBody.submissionId
    : crypto.randomUUID();
  const correlationId = typeof requestBody?.correlationId === 'string' && requestBody.correlationId
    ? requestBody.correlationId
    : crypto.randomUUID();
  const failure = (status: number, errorCode: string, message: string, persistenceCompleted = false) => NextResponse.json({
    success: false,
    errorCode,
    message,
    submissionId,
    correlationId,
    retryable: false,
    persistenceCompleted,
  }, { status });
  const requestHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const route = resolveHostTenantRouteForHost(requestHost);
  if (!route || route.formsMode !== 'live-submit') {
    return failure(404, 'form_unavailable', 'Form submission is unavailable.');
  }

  const config = resolveTenantRuntimeConfig(route.tenantId, process.env, getRegisteredHostTenantIds());

  if (!config) {
    return failure(503, 'tenant_runtime_inactive', 'Tenant form runtime is not active.');
  }

  if (!requestBody) return failure(400, 'invalid_json', 'The request body is not valid JSON.');
  const formData = requestBody;
  const requestedFormKey = params.type.trim().toLowerCase();
  const payloadFormKey = typeof formData.formKey === 'string' ? formData.formKey.trim().toLowerCase() : '';
  if (payloadFormKey && payloadFormKey !== requestedFormKey) {
    return failure(400, 'form_identity_mismatch', 'Form identity mismatch.');
  }

  const upstreamController = new AbortController();
  const upstreamTimeout = setTimeout(() => upstreamController.abort(), 15_000);
  let response: Response;
  try {
    const upstream = fetch(
    `${config.apiUrl}/api/forms/${encodeURIComponent(config.tenantId)}/submit/${encodeURIComponent(params.type)}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': submissionId,
        'X-Pumpkin-Submission-Id': submissionId,
        'X-Correlation-Id': correlationId,
      },
      body: JSON.stringify({
        ...formData,
        submissionId,
        correlationId,
        idempotencyKey: submissionId,
        tenantId: route.tenantId,
        formKey: requestedFormKey,
      }),
      signal: upstreamController.signal,
    },
    );
    response = await Promise.race([
      upstream,
      new Promise<never>((_, reject) => setTimeout(() => reject(new DOMException('Upstream deadline exceeded', 'AbortError')), 15_000)),
    ]);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    console.warn('pumpkin-form-stage', { stage: 'starter_upstream_failed', tenantId: route.tenantId, formKey: requestedFormKey, submissionId, correlationId, elapsedMs: Date.now() - startedAt, errorCode: timedOut ? 'upstream_timeout' : 'upstream_transport_error', persistenceCompleted: false });
    return failure(timedOut ? 504 : 502, timedOut ? 'upstream_timeout' : 'upstream_transport_error', timedOut ? 'The form service did not respond within the upstream time limit.' : 'The form service could not be reached.');
  } finally {
    clearTimeout(upstreamTimeout);
  }

  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? 'application/json';

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
      'X-Pumpkin-Submission-Id': submissionId,
      'X-Correlation-Id': correlationId,
    },
  });
}
