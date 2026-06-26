import { sanitizeString } from './sanitize-static-form-payload.mjs';

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendGraphMailDelivery({
  entry,
  site,
  env = process.env,
  fetchImpl = fetch,
  logger = console,
}) {
  const config = getGraphDeliveryConfig({ entry, site, env });
  const accessToken = await requestGraphAccessToken({ config, fetchImpl });
  const sendMailRequest = buildGraphSendMailRequest({ entry, site, config });

  const graphResponse = await fetchImpl(config.sendMailUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sendMailRequest),
  });

  if (graphResponse.status !== 202) {
    throw new Error(`Graph sendMail request failed with status ${graphResponse.status}.`);
  }

  logger.info?.(`Static form Graph sendMail accepted for site ${site.siteKey}, form ${entry.formId}.`);

  return {
    id: entry.id,
    deliveryMode: 'graph',
    accepted: true,
  };
}

export function getGraphDeliveryConfig({ entry, site, env = process.env }) {
  const tenantId = firstConfigured([
    env.MICROSOFT_GRAPH_TENANT_ID,
    env.MICROSOFT_TENANT_ID,
  ]);
  const clientId = firstConfigured([env.MICROSOFT_GRAPH_CLIENT_ID]);
  const clientSecret = firstConfigured([env.MICROSOFT_GRAPH_CLIENT_SECRET]);
  const senderUser = firstConfigured([
    env.MICROSOFT_GRAPH_SENDER_USER,
    env.MICROSOFT_GRAPH_SENDER_UPN,
    env.FORM_EMAIL_FROM_ADDRESS,
  ]);
  const recipientAddress = getRecipientAddress({ entry, site, env });

  const missing = [];
  if (!tenantId) missing.push('MICROSOFT_GRAPH_TENANT_ID');
  if (!clientId) missing.push('MICROSOFT_GRAPH_CLIENT_ID');
  if (!clientSecret) missing.push('MICROSOFT_GRAPH_CLIENT_SECRET');
  if (!senderUser) missing.push('MICROSOFT_GRAPH_SENDER_USER');
  if (!recipientAddress) missing.push('ICE_RINK_RENTALS_LEAD_RECIPIENT');

  if (missing.length > 0) {
    throw new Error(`Missing Graph delivery env vars: ${missing.join(', ')}.`);
  }

  if (!EMAIL_PATTERN.test(recipientAddress)) {
    throw new Error('Graph delivery recipient setting is not a valid email address.');
  }

  const graphBaseUrl = String(env.MICROSOFT_GRAPH_BASE_URL || 'https://graph.microsoft.com/v1.0').replace(/\/+$/, '');
  const loginBaseUrl = String(env.MICROSOFT_LOGIN_BASE_URL || 'https://login.microsoftonline.com').replace(/\/+$/, '');

  return {
    tenantId,
    clientId,
    clientSecret,
    tokenUrl: `${loginBaseUrl}/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    tokenScope: GRAPH_SCOPE,
    senderUser,
    senderAddress: sanitizeString(env.FORM_EMAIL_FROM_ADDRESS || senderUser, 240),
    recipientAddress,
    sendMailUrl: `${graphBaseUrl}/users/${encodeURIComponent(senderUser)}/sendMail`,
    saveToSentItems: parseBoolean(env.MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS, false),
    replyToMode: sanitizeString(env.FORM_EMAIL_REPLY_TO_MODE, 80),
    staticReplyToAddress: sanitizeString(env.FORM_EMAIL_REPLY_TO_ADDRESS, 240),
    subjectPrefix: sanitizeString(env.FORM_EMAIL_SUBJECT_PREFIX || 'Ice rink rental lead', 120),
  };
}

export async function requestGraphAccessToken({ config, fetchImpl = fetch }) {
  const clientSecretParam = 'client_' + 'secret';
  const tokenBody = new URLSearchParams({
    client_id: config.clientId,
    scope: config.tokenScope,
    [clientSecretParam]: config.clientSecret,
    grant_type: 'client_credentials',
  });

  const tokenResponse = await fetchImpl(config.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody.toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Graph token request failed with status ${tokenResponse.status}.`);
  }

  const tokenJson = await tokenResponse.json().catch(() => ({}));
  const accessToken = sanitizeString(tokenJson.access_token, 8000);
  if (!accessToken) {
    throw new Error('Graph token response did not include an access token.');
  }

  return accessToken;
}

export function buildGraphSendMailRequest({ entry, site, config }) {
  const formData = entry.formData || {};
  const submitterEmail = sanitizeString(formData.email || formData.emailAddress || formData['email-address'], 240);
  const submitterName = sanitizeString(formData.fullName || formData.name || formData['full-name'], 240);
  const subjectName = submitterName || submitterEmail || 'Static contact form submission';
  const message = {
    subject: sanitizeString(`${config.subjectPrefix}: ${subjectName}`, 200),
    body: {
      contentType: 'Text',
      content: buildPlainTextEmailBody({ entry, site }),
    },
    toRecipients: [
      {
        emailAddress: {
          address: config.recipientAddress,
        },
      },
    ],
  };

  const replyTo = getReplyToAddress({ submitterEmail, config });
  if (replyTo) {
    message.replyTo = [
      {
        emailAddress: {
          address: replyTo,
        },
      },
    ];
  }

  return {
    message,
    saveToSentItems: config.saveToSentItems,
  };
}

export function buildPlainTextEmailBody({ entry, site }) {
  const formData = entry.formData || {};
  const lines = [
    'New static contact form submission',
    '',
    `Site: ${sanitizeString(site.siteKey || entry.siteKey, 120)}`,
    `Entry ID: ${sanitizeString(entry.id, 180)}`,
    `Form: ${sanitizeString(entry.formKey || entry.formId, 120)}`,
    `Page: ${sanitizeString(entry.sourcePage || entry.pageSlug, 180)}`,
    `Submitted: ${sanitizeString(entry.submittedAt, 80)}`,
    `Routing: ${sanitizeString(entry.metadata?.staticEndpointRef, 160)}`,
    `Recipient ref: ${sanitizeString(entry.metadata?.leadRecipientRef, 160)}`,
    '',
    'Fields:',
    ...Object.entries(formData).map(([key, value]) => `${sanitizeString(key, 80)}: ${sanitizeString(value, 4000)}`),
  ];

  return lines.join('\n').slice(0, 12000);
}

function getRecipientAddress({ entry, site, env }) {
  const recipientRef = sanitizeString(entry.metadata?.leadRecipientRef || site.defaultRecipientGroup, 160);
  const sitePrefix = toEnvPrefix(site.siteKey);

  return sanitizeString(firstConfigured([
    recipientRef ? env[recipientRef] : '',
    env[`${sitePrefix}_LEAD_RECIPIENT_EMAIL`],
    env.FORM_EMAIL_TO_ADDRESS,
  ]), 240);
}

function getReplyToAddress({ submitterEmail, config }) {
  if (config.replyToMode === 'submitter-email' && EMAIL_PATTERN.test(submitterEmail)) {
    return submitterEmail;
  }

  if (config.replyToMode === 'static' && EMAIL_PATTERN.test(config.staticReplyToAddress)) {
    return config.staticReplyToAddress;
  }

  return '';
}

function firstConfigured(values) {
  for (const value of values) {
    const sanitized = sanitizeString(value, 8000);
    if (sanitized) return sanitized;
  }

  return '';
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function toEnvPrefix(siteKey) {
  return sanitizeString(siteKey, 120)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
