import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const fixturePath = path.join(scriptDir, 'fixtures', 'email-readiness-cases.json');
const fixtures = readJson(fixturePath);

const SAFE_REF_PATTERN = /^[A-Z0-9][A-Z0-9_:-]{2,180}$/;
const PROVIDER_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,80}$/;
const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const EMAIL_PATTERN = /^[^@\s]+@([^@\s]+)$/;
const PROVIDER_TYPES = new Set(['hosted-mailbox', 'forwarding-only', 'self-hosted-mail', 'smtp-relay', 'legacy-provider']);
const PROVIDER_STATUSES = new Set(['candidate', 'selected', 'selected-not-configured', 'configured', 'blocked', 'retired']);
const PROVIDER_CAPABILITIES = new Set([
  'mailboxHosting',
  'aliases',
  'forwarding',
  'imap',
  'smtpSubmission',
  'graphSendMail',
  'webmail',
  'outboundRelay',
  'inboundRouting',
  'dkim',
  'dmarc',
  'spf',
  'migration',
  'catchAll',
]);
const EMAIL_LOG_STATUSES = new Set(['queued', 'dry-run', 'sent', 'failed', 'suppressed', 'blocked']);
const TEMPLATE_STATUSES = new Set(['draft', 'active']);
const TARGETED_SECRET_ASSIGNMENT = /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD|MIGADU_PASSWORD|MAILCOW_API_KEY|MICROSOFT_365_CLIENT_SECRET|MICROSOFT_365_SMTP_PASSWORD|MICROSOFT_365_REFRESH_TOKEN|MICROSOFT_365_ACCESS_TOKEN|MICROSOFT_GRAPH_ACCESS_TOKEN|MICROSOFT_GRAPH_REFRESH_TOKEN|AZURE_CLIENT_SECRET|OAUTH_CLIENT_SECRET|CERTIFICATE_PRIVATE_KEY)\b\s*[:=]\s*[^<\s]+/i;
const PRIVATE_KEY_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~-]{16,}/i;

const failures = [];
let passed = 0;

validateProviderPresetFile();
runCases('providerConfigCases', validateProviderConfig);
runCases('domainSettingsCases', validateDomainSettings);
runCases('mailboxManifestCases', validateMailboxManifest);
runCases('smtpConfigCases', validateSmtpConfig);
runCases('appSendingConfigCases', validateAppSendingConfig);
runCases('leadNotificationTemplateCases', (value) => validateTemplate(value, 'lead-notification-template'));
runCases('autoresponderTemplateCases', (value) => validateTemplate(value, 'autoresponder-template'));
runCases('outboundLogCases', validateOutboundLog);
runCases('checklistCases', validateChecklistCase);

const summary = {
  ok: failures.length === 0,
  passed,
  failed: failures.length,
  failures,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

function validateProviderPresetFile() {
  const result = resultBag();
  const presetFile = readJson(path.join(scriptDir, 'provider-presets.template.json'));
  if (!Array.isArray(presetFile.presets) || presetFile.presets.length === 0) {
    error(result, 'providerPresets.presets', 'provider-presets.template.json must include presets.', 'provider-presets.presets');
  } else {
    const requiredKeys = new Set([
      'microsoft-365-exchange-online-plan1',
      'purelymail',
      'cloudflare-email-routing',
      'migadu',
      'mxroute',
      'google-workspace',
      'bluehost-legacy',
      'mailcow',
      'mail-in-a-box',
      'mailu',
      'modoboa',
      'stalwart',
      'custom',
    ]);
    for (const preset of presetFile.presets) {
      const providerResult = validateProviderConfig(preset);
      merge(result, providerResult);
      requiredKeys.delete(stringValue(preset.providerKey));
    }
    for (const missingKey of requiredKeys) {
      error(result, 'providerPresets.required', `Missing provider preset "${missingKey}".`, 'provider-presets.presets');
    }
  }

  assertExpectation('provider presets template validation', 'ok', result);
}

function runCases(groupName, validator) {
  for (const testCase of fixtures[groupName] || []) {
    const value = loadCaseValue(testCase);
    const result = validator(value, testCase);
    assertExpectation(testCase.name, testCase.expect, result);
  }
}

function validateProviderConfig(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'provider.shape', 'Provider config must be an object.', 'provider');
    return result;
  }

  requiredString(result, value.providerKey, 'provider.providerKey', 'provider.providerKey');
  if (stringValue(value.providerKey) && !PROVIDER_KEY_PATTERN.test(stringValue(value.providerKey))) {
    error(result, 'provider.providerKey', 'providerKey must be a lowercase slug.', 'provider.providerKey');
  }

  if (!PROVIDER_TYPES.has(stringValue(value.providerType))) {
    error(result, 'provider.providerType', 'providerType is not supported.', 'provider.providerType');
  }

  requiredString(result, value.displayName, 'provider.displayName', 'provider.displayName');

  if (!PROVIDER_STATUSES.has(stringValue(value.status))) {
    error(result, 'provider.status', 'status is not supported.', 'provider.status');
  }

  if (!Array.isArray(value.supportedCapabilities) || value.supportedCapabilities.length === 0) {
    error(result, 'provider.supportedCapabilities', 'supportedCapabilities must be a non-empty array.', 'provider.supportedCapabilities');
  } else {
    value.supportedCapabilities.forEach((capability, index) => {
      if (!PROVIDER_CAPABILITIES.has(stringValue(capability))) {
        error(result, 'provider.capability', `Unsupported capability "${stringValue(capability)}".`, `provider.supportedCapabilities[${index}]`);
      }
    });
  }

  validateRefObject(result, value.configRefs, 'provider.configRefs');
  validateDnsRecords(result, value.requiredDnsRecords, 'provider.requiredDnsRecords');
  validateRefArray(result, value.requiredSecretsRefs, 'provider.requiredSecretsRefs');
  requiredString(result, value.decisionStatus, 'provider.decisionStatus', 'provider.decisionStatus');
  if (!Array.isArray(value.notes)) warning(result, 'provider.notes', 'notes should be an array.', 'provider.notes');
  if (!Array.isArray(value.blockerNotes)) warning(result, 'provider.blockerNotes', 'blockerNotes should be an array.', 'provider.blockerNotes');

  scanSecretLike(result, value, 'provider');
  return result;
}

function validateDomainSettings(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'domain.shape', 'Domain settings must be an object.', 'domain');
    return result;
  }

  requiredString(result, value.tenantId, 'domain.tenantId', 'domain.tenantId');
  requiredString(result, value.siteKey, 'domain.siteKey', 'domain.siteKey');
  validateDomain(result, value.domain, 'domain.domain');
  requiredString(result, value.providerKey, 'domain.providerKey', 'domain.providerKey');
  if (stringValue(value.selectedProviderKey) && !PROVIDER_KEY_PATTERN.test(stringValue(value.selectedProviderKey))) {
    error(result, 'domain.selectedProviderKey', 'selectedProviderKey must be a lowercase slug.', 'domain.selectedProviderKey');
  }
  requiredString(result, value.providerStatus, 'domain.providerStatus', 'domain.providerStatus');

  [
    'mxStatus',
    'spfStatus',
    'dkimStatus',
    'dmarcStatus',
    'smtpStatus',
    'inboundStatus',
    'outboundStatus',
    'migrationStatus',
    'cutoverStatus',
  ].forEach((field) => requiredString(result, value[field], `domain.${field}`, `domain.${field}`));

  validateFileRef(result, value.mailboxManifestRef, 'domain.mailboxManifestRef');
  validateFileRef(result, value.smtpConfigRef, 'domain.smtpConfigRef');
  if (stringValue(value.graphConfigRef)) validateFileRef(result, value.graphConfigRef, 'domain.graphConfigRef');
  validateFileRefArray(result, value.notificationTemplateRefs, 'domain.notificationTemplateRefs');
  validateFileRefArray(result, value.autoresponderTemplateRefs, 'domain.autoresponderTemplateRefs');
  scanSecretLike(result, value, 'domain');
  return result;
}

function validateMailboxManifest(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'mailbox.shape', 'Mailbox manifest must be an object.', 'mailbox');
    return result;
  }

  const domain = stringValue(value.domain).toLowerCase();
  validateDomain(result, domain, 'mailbox.domain');
  requiredString(result, value.tenantId, 'mailbox.tenantId', 'mailbox.tenantId');
  requiredString(result, value.siteKey, 'mailbox.siteKey', 'mailbox.siteKey');
  if (!isRecord(value.catchAll)) error(result, 'mailbox.catchAll', 'catchAll policy is required.', 'mailbox.catchAll');
  if (!Array.isArray(value.mailboxes) || value.mailboxes.length === 0) {
    error(result, 'mailbox.mailboxes', 'mailboxes must be a non-empty array.', 'mailbox.mailboxes');
  } else {
    value.mailboxes.forEach((mailbox, index) => validateMailboxAddressItem(result, mailbox, domain, `mailbox.mailboxes[${index}]`));
  }

  validateAddressCollection(result, value.aliases, domain, 'mailbox.aliases');
  validateAddressCollection(result, value.forwards, domain, 'mailbox.forwards');
  scanSecretLike(result, value, 'mailbox');
  return result;
}

function validateSmtpConfig(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'smtp.shape', 'SMTP config must be an object.', 'smtp');
    return result;
  }

  requiredString(result, value.providerKey, 'smtp.providerKey', 'smtp.providerKey');
  [
    'smtpHostRef',
    'smtpPortRef',
    'smtpUsernameRef',
    'smtpPasswordRef',
    'smtpSecureModeRef',
    'defaultFromAddressRef',
    'defaultReplyToAddressRef',
    'bounceAddressRef',
    'notificationFromAddressRef',
    'autoresponderFromAddressRef',
    'dailySendLimitRef',
  ].forEach((field) => validateSafeRef(result, value[field], `smtp.${field}`));

  if (value.enabled !== false && value.dryRunOnly !== true) {
    error(result, 'smtp.enabled', 'SMTP config must remain disabled or dryRunOnly in readiness templates.', 'smtp.enabled');
  }

  if (value.dryRunOnly !== true) {
    warning(result, 'smtp.dryRunOnly', 'Readiness SMTP config should default to dryRunOnly true.', 'smtp.dryRunOnly');
  }

  scanSecretLike(result, value, 'smtp');
  return result;
}

function validateAppSendingConfig(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'appSending.shape', 'App sending config must be an object.', 'appSending');
    return result;
  }

  requiredString(result, value.providerKey, 'appSending.providerKey', 'appSending.providerKey');
  requiredString(result, value.tenantId, 'appSending.tenantId', 'appSending.tenantId');
  requiredString(result, value.siteKey, 'appSending.siteKey', 'appSending.siteKey');
  validateDomain(result, value.domain, 'appSending.domain');

  if (stringValue(value.preferredStrategy) !== 'graphSendMail') {
    error(result, 'appSending.preferredStrategy', 'Microsoft 365 app sending should prefer graphSendMail.', 'appSending.preferredStrategy');
  }

  if (!isRecord(value.graphSendMail)) {
    error(result, 'appSending.graphSendMail', 'graphSendMail config is required.', 'appSending.graphSendMail');
  } else {
    [
      'enabledRef',
      'tenantIdRef',
      'clientIdRef',
      'clientSecretRef',
      'fromAddressRef',
      'replyToAddressRef',
    ].forEach((field) => validateSafeRef(result, value.graphSendMail[field], `appSending.graphSendMail.${field}`));
    requiredString(result, value.graphSendMail.status, 'appSending.graphSendMail.status', 'appSending.graphSendMail.status');
  }

  if (!isRecord(value.smtpAuthFallback)) {
    error(result, 'appSending.smtpAuthFallback', 'smtpAuthFallback config is required.', 'appSending.smtpAuthFallback');
  } else {
    [
      'enabledRef',
      'hostRef',
      'portRef',
      'usernameRef',
      'passwordRef',
    ].forEach((field) => validateSafeRef(result, value.smtpAuthFallback[field], `appSending.smtpAuthFallback.${field}`));
    requiredString(result, value.smtpAuthFallback.status, 'appSending.smtpAuthFallback.status', 'appSending.smtpAuthFallback.status');
  }

  if (value.dryRunOnly !== true) {
    error(result, 'appSending.dryRunOnly', 'App sending config must remain dryRunOnly in readiness templates.', 'appSending.dryRunOnly');
  }

  if (value.realSendingEnabled !== false) {
    error(result, 'appSending.realSendingEnabled', 'Real sending must remain disabled in readiness templates.', 'appSending.realSendingEnabled');
  }

  scanSecretLike(result, value, 'appSending');
  return result;
}

function validateTemplate(value, kind) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'template.shape', 'Template must be an object.', 'template');
    return result;
  }

  requiredString(result, value.templateKey, 'template.templateKey', 'template.templateKey');
  requiredString(result, value.name, 'template.name', 'template.name');
  if (stringValue(value.channel) !== 'email') error(result, 'template.channel', 'channel must be email.', 'template.channel');
  if (!TEMPLATE_STATUSES.has(stringValue(value.status))) error(result, 'template.status', 'status must be draft or active.', 'template.status');
  requiredString(result, value.subjectTemplate, 'template.subjectTemplate', 'template.subjectTemplate');
  requiredString(result, value.textBodyTemplate, 'template.textBodyTemplate', 'template.textBodyTemplate');
  requiredString(result, value.htmlBodyTemplate, 'template.htmlBodyTemplate', 'template.htmlBodyTemplate');

  const allowedVariables = new Set(Array.isArray(value.allowedVariables) ? value.allowedVariables.map(stringValue).filter(Boolean) : []);
  if (allowedVariables.size === 0) {
    error(result, 'template.allowedVariables', 'allowedVariables must be non-empty.', 'template.allowedVariables');
  }

  const usedVariables = extractVariables([
    value.subjectTemplate,
    value.textBodyTemplate,
    value.htmlBodyTemplate,
  ].map(stringValue).join('\n'));
  for (const variable of usedVariables) {
    if (!allowedVariables.has(variable)) {
      warning(result, 'template.unsupportedVariable', `Unsupported template variable "${variable}".`, 'template');
    }
  }

  if (kind === 'lead-notification-template') {
    validateSafeRef(result, value.recipientRef, 'template.recipientRef');
    validateSafeRef(result, value.fromAddressRef, 'template.fromAddressRef');
    requiredString(result, value.replyToStrategy, 'template.replyToStrategy', 'template.replyToStrategy');
  }

  if (kind === 'autoresponder-template') {
    validateSafeRef(result, value.fromAddressRef, 'template.fromAddressRef');
    validateSafeRef(result, value.replyToAddressRef, 'template.replyToAddressRef');
    if (value.enabled !== false && value.dryRunOnly !== true) {
      error(result, 'template.enabled', 'Autoresponder must remain disabled or dryRunOnly in readiness templates.', 'template.enabled');
    }
    if (value.consentRequired !== true) {
      error(result, 'template.consentRequired', 'Autoresponder must require consent.', 'template.consentRequired');
    }
  }

  scanSecretLike(result, value, 'template');
  return result;
}

function validateOutboundLog(value) {
  const result = resultBag();
  if (!isRecord(value)) {
    error(result, 'outboundLog.shape', 'Outbound log must be an object.', 'outboundLog');
    return result;
  }

  [
    'id',
    'tenantId',
    'siteKey',
    'providerKey',
    'templateKey',
    'messageType',
    'relatedEntityType',
    'relatedEntityId',
    'formEntryId',
    'fromAddressRef',
    'replyToAddressRef',
    'subjectPreview',
    'createdAt',
  ].forEach((field) => requiredString(result, value[field], `outboundLog.${field}`, `outboundLog.${field}`));

  if (!stringValue(value.recipientEmailHash) && !stringValue(value.recipientEmailSummary)) {
    error(result, 'outboundLog.recipient', 'recipientEmailHash or recipientEmailSummary is required.', 'outboundLog.recipientEmailHash');
  }

  if (stringValue(value.recipientEmail)) {
    warning(result, 'outboundLog.recipientEmail', 'Full recipientEmail storage requires an explicit privacy decision.', 'outboundLog.recipientEmail');
  }

  if (!EMAIL_LOG_STATUSES.has(stringValue(value.status))) {
    error(result, 'outboundLog.status', 'Unsupported outbound email status.', 'outboundLog.status');
  }

  validateSafeRef(result, value.fromAddressRef, 'outboundLog.fromAddressRef');
  validateSafeRef(result, value.replyToAddressRef, 'outboundLog.replyToAddressRef');
  scanSecretLike(result, value, 'outboundLog');
  return result;
}

function validateChecklistCase(_value, testCase) {
  const result = resultBag();
  const text = readText(resolveRepoPath(testCase.file));
  for (const required of testCase.requiredText || []) {
    if (!text.includes(required)) {
      error(result, 'checklist.requiredText', `Missing required checklist text "${required}".`, testCase.file);
    }
  }
  return result;
}

function validateDnsRecords(result, records, pathName) {
  if (!Array.isArray(records) || records.length === 0) {
    error(result, 'dns.records', 'requiredDnsRecords must be a non-empty array.', pathName);
    return;
  }

  records.forEach((record, index) => {
    if (!isRecord(record)) {
      error(result, 'dns.record.shape', 'DNS record must be an object.', `${pathName}[${index}]`);
      return;
    }
    validateSafeRef(result, record.recordRef, `${pathName}[${index}].recordRef`);
    requiredString(result, record.type, `${pathName}[${index}].type`, 'dns.record.type');
    requiredString(result, record.status, `${pathName}[${index}].status`, 'dns.record.status');
  });
}

function validateAddressCollection(result, collection, domain, pathName) {
  if (collection === undefined) return;
  if (!Array.isArray(collection)) {
    error(result, 'mailbox.collection', `${pathName} must be an array.`, pathName);
    return;
  }
  collection.forEach((item, index) => validateMailboxAddressItem(result, item, domain, `${pathName}[${index}]`));
}

function validateMailboxAddressItem(result, item, domain, pathName) {
  if (!isRecord(item)) {
    error(result, 'mailbox.item', 'Mailbox/alias/forward item must be an object.', pathName);
    return;
  }
  const address = stringValue(item.address || item.alias || item.from);
  const match = EMAIL_PATTERN.exec(address);
  if (!match) {
    error(result, 'mailbox.address', 'Email address is required.', `${pathName}.address`);
    return;
  }
  if (match[1].toLowerCase() !== domain) {
    error(result, 'mailbox.domain', `Address "${address}" does not match manifest domain "${domain}".`, `${pathName}.address`);
  }
  requiredString(result, item.status, `${pathName}.status`, 'mailbox.status');
  requiredString(result, item.role, `${pathName}.role`, 'mailbox.role');
  requiredString(result, item.purpose, `${pathName}.purpose`, 'mailbox.purpose');
}

function validateRefObject(result, value, pathName) {
  if (!isRecord(value)) {
    error(result, 'ref.object', `${pathName} must be an object of refs.`, pathName);
    return;
  }

  Object.entries(value).forEach(([key, item]) => validateSafeRef(result, item, `${pathName}.${key}`));
}

function validateRefArray(result, value, pathName) {
  if (!Array.isArray(value)) {
    error(result, 'ref.array', `${pathName} must be an array of refs.`, pathName);
    return;
  }

  value.forEach((item, index) => validateSafeRef(result, item, `${pathName}[${index}]`));
}

function validateFileRefArray(result, value, pathName) {
  if (!Array.isArray(value) || value.length === 0) {
    error(result, 'fileRef.array', `${pathName} must be a non-empty array.`, pathName);
    return;
  }

  value.forEach((item, index) => validateFileRef(result, item, `${pathName}[${index}]`));
}

function validateFileRef(result, value, pathName) {
  const fileRef = stringValue(value);
  if (!fileRef) {
    error(result, 'fileRef.missing', `${pathName} is required.`, pathName);
    return;
  }
  if (!fileRef.startsWith('deployment/email/') || fileRef.includes('..')) {
    error(result, 'fileRef.invalid', `${pathName} must reference a deployment/email file.`, pathName);
  }
}

function validateSafeRef(result, value, pathName) {
  const ref = stringValue(value);
  if (!ref) {
    error(result, 'ref.missing', `${pathName} is required.`, pathName);
    return;
  }
  if (!SAFE_REF_PATTERN.test(ref)) {
    error(result, 'ref.invalid', `${pathName} must be a placeholder ref, not a literal value.`, pathName);
  }
}

function validateDomain(result, value, pathName) {
  const domain = stringValue(value).toLowerCase();
  if (!domain) {
    error(result, 'domain.missing', `${pathName} is required.`, pathName);
    return;
  }
  if (!DOMAIN_PATTERN.test(domain)) {
    error(result, 'domain.invalid', `${pathName} must be a valid domain name.`, pathName);
  }
}

function scanSecretLike(result, value, pathName) {
  if (typeof value === 'string') {
    if (TARGETED_SECRET_ASSIGNMENT.test(value) || PRIVATE_KEY_PATTERN.test(value) || BEARER_PATTERN.test(value)) {
      error(result, 'secret.blocked', 'Secret-like values are not allowed in email readiness files.', pathName);
      return;
    }
    const prosePath = /\.(?:notes|blockerNotes|noSecretGuardrails)(?:\[|$)/i.test(pathName);
    if (!prosePath && /(password|secret|token|privateKey|apiKey|recoveryCode)/i.test(pathName) && value && !SAFE_REF_PATTERN.test(value)) {
      error(result, 'secret.literal', `${pathName} must contain a placeholder ref, not a literal value.`, pathName);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSecretLike(result, item, `${pathName}[${index}]`));
    return;
  }

  if (!isRecord(value)) return;
  Object.entries(value).forEach(([key, item]) => scanSecretLike(result, item, `${pathName}.${key}`));
}

function extractVariables(templateText) {
  const variables = new Set();
  const pattern = /{{\s*([A-Za-z0-9_.-]+)\s*}}/g;
  let match;
  while ((match = pattern.exec(templateText)) !== null) {
    variables.add(match[1]);
  }
  return variables;
}

function loadCaseValue(testCase) {
  if (testCase.file) {
    const target = resolveRepoPath(testCase.file);
    return target.endsWith('.json') ? readJson(target) : readText(target);
  }
  return testCase.value;
}

function resolveRepoPath(filePath) {
  return path.resolve(repoRoot, filePath);
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function readText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function assertExpectation(name, expect, result) {
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  const ok =
    (expect === 'ok' && errorCount === 0) ||
    (expect === 'warning' && errorCount === 0 && warningCount > 0) ||
    (expect === 'error' && errorCount > 0);

  if (ok) {
    passed += 1;
    return;
  }

  failures.push({
    name,
    expect,
    errors: result.errors,
    warnings: result.warnings,
  });
}

function resultBag() {
  return { errors: [], warnings: [] };
}

function merge(target, source) {
  target.errors.push(...source.errors);
  target.warnings.push(...source.warnings);
}

function requiredString(result, value, pathName, code) {
  if (!stringValue(value)) error(result, code, `${pathName} is required.`, pathName);
}

function error(result, code, message, pathName) {
  result.errors.push({ severity: 'error', code, message, path: pathName });
}

function warning(result, code, message, pathName) {
  result.warnings.push({ severity: 'warning', code, message, path: pathName });
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}
