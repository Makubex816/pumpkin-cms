import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const staticContact = require('./static-contact/index.js');
const staticContactHealth = require('./static-contact-health/index.js');

const defaultEnv = {
  FORM_DELIVERY_MODE: 'dry-run',
  STATIC_FORM_ALLOWED_SITE_KEYS: 'ice-rink-rentals',
  STATIC_FORM_MAX_BODY_BYTES: '20000',
  STATIC_FORM_MAX_MESSAGE_LENGTH: '4000',
  ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY: 'ice-rink-rentals-default',
};

const defaultHeaders = {
  origin: 'https://kind-island-0a85a740f.7.azurestaticapps.net',
  host: 'kind-island-0a85a740f.7.azurestaticapps.net',
  'content-type': 'application/json',
  'user-agent': 'static-form-compat-local-test',
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
      fullName: 'Compat Function Local Test',
      email: 'compat-function-test@example.com',
      phone: '555-0102',
      eventCity: 'Test City',
      eventState: 'NY',
      eventDateOrDateRange: 'Winter 2026',
      eventType: 'Corporate event',
      venueSetting: 'Indoor',
      estimatedAttendance: '250',
      message: 'Local-only no-email Azure Functions v3 compatibility wrapper test.',
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

function makeContext() {
  return {
    res: null,
    info() {},
    error() {},
  };
}

function withEnv(env, run) {
  const previous = {};
  for (const key of Object.keys(env)) {
    previous[key] = process.env[key];
    process.env[key] = env[key];
  }

  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });
}

async function invokeContact(payload, { method = 'POST', headers = {} } = {}) {
  const context = makeContext();
  const rawBody = JSON.stringify(payload || {});

  await withEnv(defaultEnv, () => staticContact(context, {
    method,
    headers: {
      ...defaultHeaders,
      'content-length': String(Buffer.byteLength(rawBody)),
      ...headers,
    },
    rawBody,
  }));

  return context.res;
}

const tests = [
  ['returns health sentinel success', async () => {
    const context = makeContext();
    await staticContactHealth(context, { method: 'GET', headers: defaultHeaders });
    assert.equal(context.res.status, 200);
    assert.equal(context.res.body.ok, true);
    assert.equal(context.res.body.route, '/api/static-contact-health');
    assert.equal(context.res.body.contactRoute, '/api/static-contact');
    assert.equal(context.res.body.programmingModel, 'azure-functions-v3-function-json');
  }],
  ['handles OPTIONS preflight for /api/static-contact', async () => {
    const result = await invokeContact({}, { method: 'OPTIONS' });
    assert.equal(result.status, 204);
    assert.equal(result.headers['Access-Control-Allow-Origin'], 'https://kind-island-0a85a740f.7.azurestaticapps.net');
    assert.equal(result.headers['Access-Control-Allow-Methods'], 'OPTIONS, POST');
    assert.equal(Object.hasOwn(result, 'body'), false);
  }],
  ['accepts frontend alias payload in dry-run mode', async () => {
    const result = await invokeContact(frontendPayload());
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.match(result.body.entryId, /^ice-rink-rentals-default-quote-request-/);
  }],
  ['rejects invalid email without echoing unknown secrets', async () => {
    const result = await invokeContact(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        email: 'not-an-email',
      },
    }));
    assert.equal(result.status, 400);
    assert.equal(result.body.ok, false);
    assert.ok(result.body.validationErrors.includes('Email must be valid.'));
  }],
];

for (const [name, run] of tests) {
  await run();
  console.log(`ok - ${name}`);
}
