import assert from 'node:assert/strict';
import { handleStaticContactRequest } from './contact-handler.mjs';
import { buildGraphSendMailRequest, getGraphDeliveryConfig } from './graph-send-mail-delivery.mjs';

const graphSecretEnvKey = 'MICROSOFT_GRAPH_CLIENT_' + 'SECRET';

const defaultEnv = {
  STATIC_FORM_ALLOWED_SITE_KEYS: 'ice-rink-rentals',
  STATIC_FORM_MAX_BODY_BYTES: '20000',
  STATIC_FORM_MAX_MESSAGE_LENGTH: '4000',
  ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY: 'ice-rink-rentals-default',
};

const graphEnv = {
  ...defaultEnv,
  FORM_DELIVERY_MODE: 'graph',
  MICROSOFT_GRAPH_TENANT_ID: 'mock-tenant-id',
  MICROSOFT_GRAPH_CLIENT_ID: 'mock-client-id',
  [graphSecretEnvKey]: 'mock-client-value',
  MICROSOFT_GRAPH_SENDER_USER: 'contact@iceskatingrinkrentals.com',
  ICE_RINK_RENTALS_LEAD_RECIPIENT: 'leads@example.com',
  FORM_EMAIL_REPLY_TO_MODE: 'submitter-email',
  FORM_EMAIL_SUBJECT_PREFIX: 'Ice test lead',
  MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS: 'false',
};

const defaultHeaders = {
  origin: 'https://iceskatingrinkrentals.com',
  host: 'iceskatingrinkrentals.com',
  'content-type': 'application/json',
  'user-agent': 'static-form-graph-local-test',
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
      fullName: 'Graph Local Test',
      email: 'graph-local-test@example.com',
      phone: '555-0102',
      eventCity: 'Test City',
      eventState: 'NY',
      eventDateOrDateRange: 'Winter 2026',
      eventType: 'Corporate event',
      venueSetting: 'Indoor',
      estimatedAttendance: '250',
      message: 'Local-only mocked Graph delivery test.',
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

async function submit(payload, { env = {}, fetchImpl } = {}) {
  const body = JSON.stringify(payload);
  return handleStaticContactRequest({
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'content-length': String(Buffer.byteLength(body)),
    },
    body,
    env: {
      ...defaultEnv,
      ...env,
    },
    fetchImpl,
    now: () => new Date('2026-06-05T12:00:00.000Z'),
    logger: silentLogger,
  });
}

function createGraphFetchRecorder() {
  const calls = [];

  return {
    calls,
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options });
      if (String(url).includes('/oauth2/v2.0/token')) {
        return {
          ok: true,
          status: 200,
          async json() {
            return { access_token: 'mock-access-token' };
          },
        };
      }

      if (String(url).includes('/sendMail')) {
        return {
          ok: true,
          status: 202,
          async json() {
            return {};
          },
        };
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    },
  };
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
  ['dry-run remains the default when no delivery mode is set', async () => {
    let fetchCalled = false;
    const result = await submit(frontendPayload(), {
      fetchImpl: async () => {
        fetchCalled = true;
        throw new Error('fetch should not be called in default dry-run mode');
      },
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(fetchCalled, false);
  }],
  ['graph mode with missing env fails safely', async () => {
    const result = await submit(frontendPayload(), {
      env: {
        FORM_DELIVERY_MODE: 'graph',
        [graphSecretEnvKey]: 'mock-client-value-that-must-not-leak',
      },
      fetchImpl: async () => {
        throw new Error('fetch should not be called when Graph config is incomplete');
      },
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.message, 'Unable to submit this request right now.');
    assert.equal(JSON.stringify(result.body).includes('mock-client-value-that-must-not-leak'), false);
  }],
  ['graph delivery builds token and sendMail requests with mocked fetch', async () => {
    const recorder = createGraphFetchRecorder();
    const result = await submit(frontendPayload(), {
      env: graphEnv,
      fetchImpl: recorder.fetchImpl,
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(recorder.calls.length, 2);

    const [tokenCall, sendCall] = recorder.calls;
    assert.equal(tokenCall.url, 'https://login.microsoftonline.com/mock-tenant-id/oauth2/v2.0/token');
    assert.equal(tokenCall.options.method, 'POST');
    assert.match(tokenCall.options.body, /grant_type=client_credentials/);
    assert.match(tokenCall.options.body, /scope=https%3A%2F%2Fgraph.microsoft.com%2F.default/);

    assert.equal(sendCall.url, 'https://graph.microsoft.com/v1.0/users/contact%40iceskatingrinkrentals.com/sendMail');
    assert.equal(sendCall.options.method, 'POST');
    assert.equal(sendCall.options.headers.Authorization, 'Bearer mock-access-token');

    const sendBody = JSON.parse(sendCall.options.body);
    assert.equal(sendBody.saveToSentItems, false);
    assert.equal(sendBody.message.toRecipients[0].emailAddress.address, 'leads@example.com');
    assert.equal(sendBody.message.replyTo[0].emailAddress.address, 'graph-local-test@example.com');
    assert.match(sendBody.message.subject, /^Ice test lead: Graph Local Test$/);
    assert.equal(sendBody.message.body.contentType, 'Text');
    assert.equal(sendBody.message.body.content.includes('<'), false);
    assert.equal(sendBody.message.body.content.includes('>'), false);
  }],
  ['graph token failure does not expose configured values in response', async () => {
    const result = await submit(frontendPayload(), {
      env: graphEnv,
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        async json() {
          return { error: 'invalid_client' };
        },
      }),
    });

    assert.equal(result.status, 502);
    assert.equal(result.body.ok, false);
    assert.equal(JSON.stringify(result.body).includes(graphEnv[graphSecretEnvKey]), false);
    assert.equal(JSON.stringify(result.body).includes('invalid_client'), false);
  }],
  ['invalid payloads are rejected before graph delivery', async () => {
    let fetchCalled = false;
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        email: 'not-an-email',
      },
    }), {
      env: graphEnv,
      fetchImpl: async () => {
        fetchCalled = true;
      },
    });

    assertValidationError(result, 'Email must be valid.');
    assert.equal(fetchCalled, false);
  }],
  ['unknown routing and recipient refs reject before graph delivery', async () => {
    let fetchCalled = false;
    const routingResult = await submit(frontendPayload({
      staticEndpointRef: 'UNKNOWN_ENDPOINT_REF',
    }), {
      env: graphEnv,
      fetchImpl: async () => {
        fetchCalled = true;
      },
    });
    assertValidationError(routingResult, 'domainRoutingKey is not allowed for this site.');
    assert.equal(JSON.stringify(routingResult.body).includes('UNKNOWN_ENDPOINT_REF'), false);

    const recipientResult = await submit(frontendPayload({
      leadRecipientRef: 'UNKNOWN_RECIPIENT_REF',
    }), {
      env: graphEnv,
      fetchImpl: async () => {
        fetchCalled = true;
      },
    });
    assertValidationError(recipientResult, 'recipientGroup is not allowed for this site.');
    assert.equal(JSON.stringify(recipientResult.body).includes('UNKNOWN_RECIPIENT_REF'), false);
    assert.equal(fetchCalled, false);
  }],
  ['honeypot rejects before graph delivery', async () => {
    let fetchCalled = false;
    const result = await submit(frontendPayload({
      formData: {
        ...frontendPayload().formData,
        honeypot: 'filled',
      },
    }), {
      env: graphEnv,
      fetchImpl: async () => {
        fetchCalled = true;
      },
    });

    assertValidationError(result, 'Unable to submit this request.');
    assert.equal(fetchCalled, false);
  }],
  ['legacy payload still works with mocked graph delivery', async () => {
    const recorder = createGraphFetchRecorder();
    const result = await submit(legacyPayload(), {
      env: {
        ...graphEnv,
        local_admin: 'legacy-leads@example.com',
      },
      fetchImpl: recorder.fetchImpl,
    });

    assert.equal(result.status, 200);
    const sendBody = JSON.parse(recorder.calls[1].options.body);
    assert.equal(sendBody.message.toRecipients[0].emailAddress.address, 'legacy-leads@example.com');
  }],
  ['Graph request builder omits replyTo unless explicitly configured', () => {
    const entry = {
      id: 'entry-1',
      siteKey: 'ice-rink-rentals',
      formId: 'default-quote-request',
      formKey: 'default-quote-request',
      sourcePage: '/contact',
      submittedAt: '2026-06-05T12:00:00.000Z',
      metadata: {
        staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
        leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
      },
      formData: {
        fullName: 'No Reply To',
        email: 'reply-to-test@example.com',
        message: '<b>safe text</b>',
      },
    };
    const site = {
      siteKey: 'ice-rink-rentals',
      defaultRecipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    };
    const config = getGraphDeliveryConfig({
      entry,
      site,
      env: {
        ...graphEnv,
        FORM_EMAIL_REPLY_TO_MODE: '',
      },
    });
    const request = buildGraphSendMailRequest({ entry, site, config });

    assert.equal(Object.hasOwn(request.message, 'replyTo'), false);
    assert.equal(request.message.body.content.includes('<'), false);
    assert.equal(request.message.body.content.includes('>'), false);
  }],
];

for (const [name, run] of tests) {
  await run();
  console.log(`ok - ${name}`);
}
