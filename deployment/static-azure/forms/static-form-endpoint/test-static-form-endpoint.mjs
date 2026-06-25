import assert from 'node:assert/strict';
import { handleStaticContactRequest } from './contact-handler.mjs';

const defaultEnv = {
  STATIC_FORM_ALLOWED_SITE_KEYS: 'ice-rink-rentals',
  STATIC_FORM_FORWARD_MODE: 'pumpkin-api',
  STATIC_FORM_MAX_BODY_BYTES: '20000',
  STATIC_FORM_MAX_MESSAGE_LENGTH: '4000',
  ICE_RINK_RENTALS_API_KEY: 'test',
  ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY: 'ice-rink-rentals-default',
};

const defaultHeaders = {
  origin: 'https://iceskatingrinkrentals.com',
  host: 'iceskatingrinkrentals.com',
  'content-type': 'application/json',
  'user-agent': 'static-form-local-test',
};

const silentLogger = {
  info() {},
  error() {},
};

function frontendPayload(overrides = {}) {
  return {
    siteKey: 'ice-rink-rentals',
    tenantId: 'ice-rink-rentals',
    formId: 'default-quote-request',
    formKey: 'default-quote-request',
    pageSlug: 'contact',
    sourcePage: '/contact',
    formType: 'quote-request',
    staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    formData: {
      fullName: 'Local Smoke Test',
      email: 'local-smoke-test@example.com',
      phone: '555-0100',
      eventCity: 'Local Test City',
      eventState: 'NY',
      eventDateOrDateRange: 'Winter 2026',
      eventType: 'Corporate event',
      venueSetting: 'Indoor',
      estimatedAttendance: '250',
      message: 'Local-only static endpoint smoke test.',
      consent: 'true',
      honeypot: '',
      sourcePage: '/contact',
      tenantId: 'ice-rink-rentals',
      siteKey: 'ice-rink-rentals',
      formKey: 'default-quote-request',
    },
    ...overrides,
  };
}

function legacyPayload(overrides = {}) {
  const payload = frontendPayload({
    domainRoutingKey: 'ice-rink-rentals-default',
    recipientGroup: 'local_admin',
    ...overrides,
  });
  delete payload.staticEndpointRef;
  delete payload.leadRecipientRef;
  return payload;
}

async function submit(payload, { env = {}, headers = {} } = {}) {
  let forwardedEntry = null;
  const body = JSON.stringify(payload);
  const result = await handleStaticContactRequest({
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'content-length': String(Buffer.byteLength(body)),
      ...headers,
    },
    body,
    env: {
      ...defaultEnv,
      ...env,
    },
    fetchImpl: async (_url, options) => {
      forwardedEntry = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        async json() {
          return { id: 'saved-entry-id' };
        },
      };
    },
    now: () => new Date('2026-06-05T12:00:00.000Z'),
    logger: silentLogger,
  });

  return { result, forwardedEntry };
}

function assertValidationError(result, expectedError) {
  assert.equal(result.status, 400);
  assert.equal(result.body.ok, false);
  assert.ok(
    result.body.validationErrors.includes(expectedError),
    `Expected validation error "${expectedError}", got ${JSON.stringify(result.body.validationErrors)}`,
  );
}

const tests = [
  ['accepts frontend staticEndpointRef and leadRecipientRef aliases', async () => {
    const { result, forwardedEntry } = await submit(frontendPayload());
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(forwardedEntry.metadata.staticEndpointRef, 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT');
    assert.equal(forwardedEntry.metadata.leadRecipientRef, 'ICE_RINK_RENTALS_LEAD_RECIPIENT');
  }],
  ['accepts isolated staging default host origin for same-origin SWA API posts', async () => {
    const { result } = await submit(frontendPayload(), {
      headers: {
        origin: 'https://kind-island-0a85a740f.7.azurestaticapps.net',
        host: 'kind-island-0a85a740f.7.azurestaticapps.net',
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(
      result.headers['Access-Control-Allow-Origin'],
      'https://kind-island-0a85a740f.7.azurestaticapps.net',
    );
  }],
  ['preserves legacy domainRoutingKey and recipientGroup payloads', async () => {
    const { result, forwardedEntry } = await submit(legacyPayload());
    assert.equal(result.status, 200);
    assert.equal(forwardedEntry.metadata.staticEndpointRef, 'ice-rink-rentals-default');
    assert.equal(forwardedEntry.metadata.leadRecipientRef, 'local_admin');
  }],
  ['defaults missing routing field to the configured Ice endpoint key', async () => {
    const payload = frontendPayload();
    delete payload.staticEndpointRef;
    const { result, forwardedEntry } = await submit(payload);
    assert.equal(result.status, 200);
    assert.equal(forwardedEntry.metadata.staticEndpointRef, 'ice-rink-rentals-default');
  }],
  ['defaults missing recipient field to the Ice lead recipient ref', async () => {
    const payload = frontendPayload();
    delete payload.leadRecipientRef;
    const { result, forwardedEntry } = await submit(payload);
    assert.equal(result.status, 200);
    assert.equal(forwardedEntry.metadata.leadRecipientRef, 'ICE_RINK_RENTALS_LEAD_RECIPIENT');
  }],
  ['rejects invalid email', async () => {
    const payload = frontendPayload({
      formData: {
        ...frontendPayload().formData,
        email: 'not-an-email',
      },
    });
    const { result } = await submit(payload);
    assertValidationError(result, 'Email must be valid.');
  }],
  ['rejects oversized message before sanitization truncates it', async () => {
    const payload = frontendPayload({
      formData: {
        ...frontendPayload().formData,
        message: 'This message is longer than twenty characters.',
      },
    });
    const { result } = await submit(payload, {
      env: {
        STATIC_FORM_MAX_MESSAGE_LENGTH: '20',
      },
    });
    assertValidationError(result, 'Message must be 20 characters or fewer.');
  }],
  ['rejects filled honeypot field', async () => {
    const payload = frontendPayload({
      formData: {
        ...frontendPayload().formData,
        honeypot: 'filled',
      },
    });
    const { result } = await submit(payload);
    assertValidationError(result, 'Unable to submit this request.');
  }],
  ['rejects unknown routing ref without echoing it', async () => {
    const { result } = await submit(frontendPayload({
      staticEndpointRef: 'UNKNOWN_ENDPOINT_REF',
    }));
    assertValidationError(result, 'domainRoutingKey is not allowed for this site.');
    assert.equal(JSON.stringify(result.body).includes('UNKNOWN_ENDPOINT_REF'), false);
  }],
  ['rejects unknown recipient ref without echoing it', async () => {
    const { result } = await submit(frontendPayload({
      leadRecipientRef: 'UNKNOWN_RECIPIENT_REF',
    }));
    assertValidationError(result, 'recipientGroup is not allowed for this site.');
    assert.equal(JSON.stringify(result.body).includes('UNKNOWN_RECIPIENT_REF'), false);
  }],
  ['sanitizes script-like message values before mocked backend forward', async () => {
    const payload = frontendPayload({
      formData: {
        ...frontendPayload().formData,
        message: '<script>alert(1)</script>',
      },
    });
    const { result, forwardedEntry } = await submit(payload);
    assert.equal(result.status, 200);
    assert.equal(forwardedEntry.formData.message.includes('<'), false);
    assert.equal(forwardedEntry.formData.message.includes('>'), false);
  }],
];

for (const [name, run] of tests) {
  await run();
  console.log(`ok - ${name}`);
}
