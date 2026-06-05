import assert from 'node:assert/strict';
import {
  CONTACT_COMPATIBILITY_ROUTE,
  getStaticContactFunctionOptions,
  handleAzureFunctionStaticContact,
  STATIC_CONTACT_PUBLIC_PATH,
  STATIC_CONTACT_ROUTE,
} from './azure-function-adapter.mjs';

const defaultEnv = {
  STATIC_FORM_ALLOWED_SITE_KEYS: 'ice-rink-rentals',
  STATIC_FORM_FORWARD_MODE: 'dry-run',
  STATIC_FORM_MAX_BODY_BYTES: '20000',
  STATIC_FORM_MAX_MESSAGE_LENGTH: '4000',
  ICE_RINK_RENTALS_API_KEY: 'test-secret-should-not-appear',
  ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY: 'ice-rink-rentals-default',
};

const defaultHeaders = {
  origin: 'https://iceskatingrinkrentals.com',
  host: 'iceskatingrinkrentals.com',
  'content-type': 'application/json',
  'user-agent': 'static-function-wrapper-local-test',
};

const silentContext = {
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
      fullName: 'Function Wrapper Local Test',
      email: 'function-wrapper-test@example.com',
      phone: '555-0101',
      eventCity: 'Test City',
      eventState: 'NY',
      eventDateOrDateRange: 'Winter 2026',
      eventType: 'Corporate event',
      venueSetting: 'Indoor',
      estimatedAttendance: '250',
      message: 'Local-only no-email Azure Function wrapper test.',
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

function requestFor(payload, { method = 'POST', headers = {} } = {}) {
  const body = JSON.stringify(payload || {});
  return {
    method,
    url: `http://localhost:7071${STATIC_CONTACT_PUBLIC_PATH}`,
    headers: new Headers({
      ...defaultHeaders,
      'content-length': String(Buffer.byteLength(body)),
      ...headers,
    }),
    async text() {
      return body;
    },
  };
}

async function submit(payload, { env = {}, headers = {}, fetchImpl } = {}) {
  const result = await handleAzureFunctionStaticContact(
    requestFor(payload, { headers }),
    silentContext,
    {
      env: {
        ...defaultEnv,
        ...env,
      },
      fetchImpl,
      now: () => new Date('2026-06-05T12:00:00.000Z'),
    },
  );

  return result;
}

function assertValidationError(result, expectedError) {
  assert.equal(result.status, 400);
  assert.equal(result.jsonBody.ok, false);
  assert.ok(
    result.jsonBody.validationErrors.includes(expectedError),
    `Expected validation error "${expectedError}", got ${JSON.stringify(result.jsonBody.validationErrors)}`,
  );
}

const tests = [
  ['registers primary /api/static-contact route without deployed /api/contact compatibility', async () => {
    const options = getStaticContactFunctionOptions();
    assert.equal(STATIC_CONTACT_ROUTE, 'static-contact');
    assert.equal(STATIC_CONTACT_PUBLIC_PATH, '/api/static-contact');
    assert.equal(options.route, 'static-contact');
    assert.deepEqual(options.methods, ['OPTIONS', 'POST']);
    assert.equal(options.authLevel, 'anonymous');
    assert.equal(CONTACT_COMPATIBILITY_ROUTE, null);
  }],
  ['handles OPTIONS preflight for /api/static-contact', async () => {
    const result = await handleAzureFunctionStaticContact(
      requestFor({}, { method: 'OPTIONS' }),
      silentContext,
      { env: defaultEnv },
    );
    assert.equal(result.status, 204);
    assert.equal(result.headers['Access-Control-Allow-Origin'], 'https://iceskatingrinkrentals.com');
    assert.equal(result.headers['Access-Control-Allow-Methods'], 'OPTIONS, POST');
    assert.equal(result.headers['Access-Control-Allow-Headers'], 'Content-Type');
    assert.equal(result.headers.Vary, 'Origin');
  }],
  ['accepts frontend alias payload in no-email dry-run mode', async () => {
    let fetchCalled = false;
    const result = await submit(frontendPayload(), {
      fetchImpl: async () => {
        fetchCalled = true;
        throw new Error('fetch should not be called in dry-run mode');
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.jsonBody.ok, true);
    assert.equal(fetchCalled, false);
    assert.equal(JSON.stringify(result.jsonBody).includes(defaultEnv.ICE_RINK_RENTALS_API_KEY), false);
  }],
  ['accepts legacy payload through primary wrapper route', async () => {
    const result = await submit(legacyPayload());
    assert.equal(result.status, 200);
    assert.equal(result.jsonBody.ok, true);
  }],
  ['rejects invalid email', async () => {
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        email: 'not-an-email',
      },
    }));
    assertValidationError(result, 'Email must be valid.');
  }],
  ['rejects unknown routing ref without echoing it', async () => {
    const result = await submit(frontendPayload({
      staticEndpointRef: 'UNKNOWN_ENDPOINT_REF',
    }));
    assertValidationError(result, 'domainRoutingKey is not allowed for this site.');
    assert.equal(JSON.stringify(result.jsonBody).includes('UNKNOWN_ENDPOINT_REF'), false);
  }],
  ['rejects unknown recipient ref without echoing it', async () => {
    const result = await submit(frontendPayload({
      leadRecipientRef: 'UNKNOWN_RECIPIENT_REF',
    }));
    assertValidationError(result, 'recipientGroup is not allowed for this site.');
    assert.equal(JSON.stringify(result.jsonBody).includes('UNKNOWN_RECIPIENT_REF'), false);
  }],
  ['rejects oversized message', async () => {
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        message: 'This message is longer than twenty characters.',
      },
    }), {
      env: {
        STATIC_FORM_MAX_MESSAGE_LENGTH: '20',
      },
    });
    assertValidationError(result, 'Message must be 20 characters or fewer.');
  }],
  ['rejects filled honeypot field', async () => {
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        honeypot: 'filled',
      },
    }));
    assertValidationError(result, 'Unable to submit this request.');
  }],
  ['does not expose secrets in validation response', async () => {
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        email: 'not-an-email',
      },
    }));
    assert.equal(JSON.stringify(result.jsonBody).includes(defaultEnv.ICE_RINK_RENTALS_API_KEY), false);
  }],
];

for (const [name, run] of tests) {
  await run();
  console.log(`ok - ${name}`);
}
