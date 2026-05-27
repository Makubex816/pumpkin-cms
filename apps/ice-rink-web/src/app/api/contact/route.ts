import { NextRequest, NextResponse } from 'next/server';
import { resolveSiteDefinition } from '@/config/sites';

const API_URL = (process.env.PUMPKIN_API_URL || 'http://localhost:5064').replace(/\/+$/, '');

interface ContactRequestBody {
  formId?: unknown;
  formKey?: unknown;
  pageSlug?: unknown;
  sourcePage?: unknown;
  siteKey?: unknown;
  tenantId?: unknown;
  formType?: unknown;
  staticEndpointRef?: unknown;
  leadRecipientRef?: unknown;
  formData?: unknown;
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getRequestHost(request: NextRequest): string {
  return request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? '';
  }

  return request.ip ?? '';
}

function getFormData(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item ?? '')])
  );
}

export async function POST(request: NextRequest) {
  const site = resolveSiteDefinition(getRequestHost(request));

  if (!site.tenantId || !site.apiKey) {
    return NextResponse.json(
      { error: `Missing Pumpkin API configuration for ${site.key}.` },
      { status: 503 }
    );
  }

  let body: ContactRequestBody;

  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid contact form request.' }, { status: 400 });
  }

  const formData = getFormData(body.formData);

  if (Object.keys(formData).length === 0) {
    return NextResponse.json({ error: 'Contact form data is required.' }, { status: 400 });
  }

  const rawFormKey = getString(body.formKey, getString(body.formId, 'default-contact'));
  const formKey = rawFormKey === 'contact'
    ? 'default-contact'
    : rawFormKey === 'ice-contact-quote-request'
      ? 'default-quote-request'
      : rawFormKey;
  const formId = getString(body.formId, formKey);
  const pageSlug = getString(body.pageSlug, getString(body.sourcePage, 'contact'));
  const tenantId = site.tenantId;
  const siteKey = site.key;
  const spamStatus = formData.honeypot?.trim() ? 'suspected-spam' : 'clean';
  const consentAccepted = ['true', 'on', 'yes', '1'].includes((formData.consent || '').toLowerCase());
  const formEntry = {
    id: `${tenantId}-${formId}-${crypto.randomUUID()}`,
    tenantId,
    siteKey,
    formId,
    formKey,
    pageSlug,
    sourcePage: getString(body.sourcePage, pageSlug),
    leadType: formKey === 'default-quote-request' ? 'quote-request' : 'contact',
    status: spamStatus === 'suspected-spam' ? 'suspected-spam' : 'new',
    spamStatus,
    consentAccepted,
    honeypotFilled: spamStatus === 'suspected-spam',
    formData,
    submittedAt: new Date().toISOString(),
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') ?? '',
    metadata: {
      source: 'ice-rink-web',
      referrer: request.headers.get('referer') ?? '',
      status: spamStatus === 'suspected-spam' ? 'suspected-spam' : 'new',
      tags: [site.key, pageSlug, formId, formKey, spamStatus],
      spamStatus,
      consentAccepted,
      leadRecipientRef: getString(body.leadRecipientRef),
      staticEndpointRef: getString(body.staticEndpointRef),
    },
  };

  const response = await fetch(`${API_URL}/api/forms/${encodeURIComponent(tenantId)}/entries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${site.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formEntry),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        error:
          errorText ||
          `Pumpkin API returned ${response.status} while saving the contact form.`,
      },
      { status: response.status === 401 ? 502 : response.status }
    );
  }

  const savedEntry = await response.json();

  return NextResponse.json({
    ok: true,
    entryId: savedEntry.id,
  });
}
