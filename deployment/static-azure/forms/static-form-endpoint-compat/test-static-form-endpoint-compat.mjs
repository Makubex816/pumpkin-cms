import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { handleStaticContactRequest } from './contact-handler.mjs';

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

const silentLogger = {
  info() {},
  error() {},
};

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

async function submitToHandler(payload, {
  env = {},
  fetchImpl,
  method = 'POST',
  headers = {},
  logger = silentLogger,
} = {}) {
  const rawBody = JSON.stringify(payload || {});

  return handleStaticContactRequest({
    method,
    headers: {
      ...defaultHeaders,
      'content-length': String(Buffer.byteLength(rawBody)),
      ...headers,
    },
    body: rawBody,
    env: {
      ...defaultEnv,
      ...env,
    },
    fetchImpl: fetchImpl || (async () => {
      throw new Error('Unexpected fetch call in local compat test.');
    }),
    now: () => new Date('2026-06-27T12:00:00.000Z'),
    logger,
  });
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
  ['dry-run and no-email modes do not call Pumpkin API persistence', async () => {
    let fetchCallCount = 0;
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'no-email',
      },
      fetchImpl: async () => {
        fetchCallCount += 1;
        throw new Error('No-email mode must not call fetch.');
      },
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.match(result.body.entryId, /^ice-rink-rentals-default-quote-request-/);
    assert.equal(fetchCallCount, 0);
  }],
  ['pumpkin-api mode forwards valid FormEntry payload and returns Pumpkin entry id', async () => {
    let forwardedUrl = '';
    let forwardedOptions = null;
    const savedEntryId = 'ice-rink-rentals-default-quote-request-saved-by-pumpkin';
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE: '/api/forms/ice-rink-rentals/entries',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async (url, options) => {
        forwardedUrl = url;
        forwardedOptions = options;
        return {
          ok: true,
          status: 201,
          async json() {
            return { id: savedEntryId };
          },
        };
      },
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(result.body.entryId, savedEntryId);
    assert.equal(forwardedUrl, 'https://pumpkin-api.local.test/api/forms/ice-rink-rentals/entries');
    assert.equal(forwardedOptions.method, 'POST');
    assert.equal(forwardedOptions.headers.Accept, 'application/json');
    assert.equal(forwardedOptions.headers['Content-Type'], 'application/json');
    assert.match(forwardedOptions.headers.Authorization, /^Bearer /);

    const forwardedEntry = JSON.parse(forwardedOptions.body);
    assert.equal(forwardedEntry.tenantId, 'ice-rink-rentals');
    assert.equal(forwardedEntry.siteKey, 'ice-rink-rentals');
    assert.equal(forwardedEntry.formId, 'default-quote-request');
    assert.equal(forwardedEntry.formKey, 'default-quote-request');
    assert.equal(forwardedEntry.sourcePage, '/contact');
    assert.equal(forwardedEntry.status, 'new');
    assert.equal(forwardedEntry.spamStatus, 'clean');
    assert.equal(forwardedEntry.metadata.source, 'static-form-endpoint');
    assert.equal(forwardedEntry.metadata.staticEndpointRef, 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT');
    assert.equal(forwardedEntry.metadata.leadRecipientRef, 'ICE_RINK_RENTALS_LEAD_RECIPIENT');
    assert.ok(forwardedEntry.metadata.tags.includes('ice-rink-rentals'));
    assert.ok(forwardedEntry.metadata.tags.includes('default-quote-request'));
  }],
  ['pumpkin-api mode falls back to local entry id when upstream success body is empty', async () => {
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE: '/api/forms/ice-rink-rentals/entries',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async () => ({
        ok: true,
        status: 201,
        async json() {
          throw new Error('No JSON body.');
        },
      }),
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.match(result.body.entryId, /^ice-rink-rentals-default-quote-request-/);
  }],
  ['pumpkin-api mode preserves public-safe upstream auth failure status', async () => {
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE: '/api/forms/ice-rink-rentals/entries',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        async json() {
          return {};
        },
      }),
    });

    assert.equal(result.status, 401);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.code, 'pumpkin_api_auth_failed');
    assert.equal(Object.hasOwn(result.body, 'entryId'), false);
  }],
  ['pumpkin-api mode maps upstream server errors to public-safe 502', async () => {
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE: '/api/forms/ice-rink-rentals/entries',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        async json() {
          return {};
        },
      }),
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.code, 'pumpkin_api_delivery_failed');
  }],
  ['pumpkin-api mode fails safely before persistence when base URL is missing', async () => {
    let fetchCallCount = 0;
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async () => {
        fetchCallCount += 1;
        throw new Error('Missing config must not call fetch.');
      },
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.ok, false);
    assert.equal(Object.hasOwn(result.body, 'entryId'), false);
    assert.equal(fetchCallCount, 0);
  }],
  ['pumpkin-api mode fails safely before persistence when protected key is missing', async () => {
    let fetchCallCount = 0;
    const result = await submitToHandler(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
      },
      fetchImpl: async () => {
        fetchCallCount += 1;
        throw new Error('Missing protected binding must not call fetch.');
      },
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.ok, false);
    assert.equal(Object.hasOwn(result.body, 'entryId'), false);
    assert.equal(fetchCallCount, 0);
  }],
  ['rejects mismatched Ice form id before Pumpkin API persistence', async () => {
    let fetchCallCount = 0;
    const result = await submitToHandler(frontendPayload({
      formId: 'unexpected-contact-form',
      formKey: 'unexpected-contact-form',
    }), {
      env: {
        FORM_DELIVERY_MODE: 'pumpkin-api',
        PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
        PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME: 'PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY',
        PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY: 'dummy',
      },
      fetchImpl: async () => {
        fetchCallCount += 1;
        throw new Error('Validation failure must not call fetch.');
      },
    });

    assert.equal(result.status, 400);
    assert.equal(result.body.ok, false);
    assert.ok(result.body.validationErrors.includes('formId is not allowed for this site.'));
    assert.ok(result.body.validationErrors.includes('formKey is not allowed for this site.'));
    assert.equal(fetchCallCount, 0);
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
