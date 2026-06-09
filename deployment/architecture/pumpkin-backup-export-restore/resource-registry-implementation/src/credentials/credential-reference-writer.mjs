import { findSecretLikeData } from '../utils/secret-scan.mjs';
import { collectSessionEnvPresence } from '../env/session-env-collector.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

export const credentialReferenceContractVersion = '0.1.0';

export async function writeCredentialReferences({ fixturePath, outputPath, env = process.env, overwrite = false, now = new Date() }) {
  const resolvedFixturePath = resolveFixturePath(fixturePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  await prepareOutputRoot(outputRoot, overwrite);
  const fixture = await readJson(resolvedFixturePath);
  const document = buildCredentialReferenceDocument({
    credentialReferences: Array.isArray(fixture) ? fixture : fixture.credentialReferences,
    env,
    now
  });
  const outputFile = path.join(outputRoot, 'REQUIRED_SECRET_REFERENCES.json');
  await writeJson(outputFile, document);
  const summaryFile = path.join(outputRoot, 'CREDENTIAL_REFERENCE_SUMMARY.md');
  await fs.writeFile(summaryFile, renderCredentialReferenceSummaryMarkdown(document), 'utf8');
  return {
    outputRoot,
    outputFile,
    summaryFile,
    document,
    validation: validateCredentialReferenceDocument(document)
  };
}

export function buildCredentialReferenceDocument({ credentialReferences = [], env = process.env, now = new Date() } = {}) {
  const envPresence = collectSessionEnvPresence(env);
  const merged = [...credentialReferences.map(normalizeCredentialReference)];
  upsertSessionCredentialPresence(merged, envPresence);
  const document = {
    schemaVersion: credentialReferenceContractVersion,
    generatedAt: now.toISOString(),
    valuesIncluded: false,
    envPresence,
    credentialReferences: merged
  };
  const validation = validateCredentialReferenceDocument(document);
  if (validation.status !== 'passed') {
    throw new Error(`credential reference document failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }
  return document;
}

export function validateCredentialReferenceDocument(document) {
  const failures = [];
  if (document?.schemaVersion !== credentialReferenceContractVersion) {
    failures.push(failure('SCHEMA_VERSION_INVALID', 'schemaVersion', 'credential reference schema version is invalid'));
  }
  if (document?.valuesIncluded !== false) {
    failures.push(failure('VALUES_INCLUDED', 'valuesIncluded', 'credential reference document must not include values'));
  }
  for (const hit of findSecretLikeData(document)) {
    failures.push(failure(hit.kind === 'field' ? 'FORBIDDEN_FIELD' : 'SECRET_LIKE_VALUE', hit.path, 'credential reference document contains forbidden secret-like data'));
  }
  for (const hit of findCredentialValueFields(document)) {
    failures.push(failure('CREDENTIAL_VALUE_FIELD_PRESENT', hit.path, 'credential reference documents must not contain plaintext value fields'));
  }
  for (const [index, credential] of (document?.credentialReferences ?? []).entries()) {
    if (credential.valueIncluded !== false) {
      failures.push(failure('CREDENTIAL_VALUE_INCLUDED', `credentialReferences[${index}].valueIncluded`, 'credential reference must not include values'));
    }
    if (credential.envName === 'PUMPKIN_ADMIN_JWT') {
      if (credential.escrowEligible !== false || credential.escrowStatus !== 'excluded-session-token') {
        failures.push(failure('SESSION_TOKEN_NOT_EXCLUDED', `credentialReferences[${index}]`, 'PUMPKIN_ADMIN_JWT must be excluded from durable escrow'));
      }
    }
  }
  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures
  };
}

export function renderCredentialReferenceSummaryMarkdown(document) {
  const lines = [
    '# Required Secret References',
    '',
    `Generated: ${document.generatedAt}`,
    `Values included: ${document.valuesIncluded}`,
    '',
    '| Reference | Env name | Presence | Escrow | Storage | Rotation |',
    '| --- | --- | --- | --- | --- | --- |'
  ];
  for (const credential of document.credentialReferences) {
    lines.push([
      credential.credentialRefId,
      credential.envName ?? 'none',
      credential.presence,
      `${credential.escrowEligible ? 'eligible' : 'excluded'} / ${credential.escrowStatus}`,
      credential.storageLocationCategory,
      credential.rotationRequired ? 'required' : 'not-required'
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('', 'No plaintext credential values are included in this document.', '');
  return `${lines.join('\n')}`;
}

function upsertSessionCredentialPresence(references, envPresence) {
  const presenceByName = new Map(envPresence.variables.map((item) => [item.name, item.presence]));
  upsert(references, {
    credentialRefId: 'credential-pumpkin-admin-jwt-session',
    displayName: 'Pumpkin Admin JWT Session Token',
    envName: 'PUMPKIN_ADMIN_JWT',
    purpose: 'temporary admin API session',
    requiredFor: ['manual operator API session'],
    resourceIds: [],
    tenantKeys: [],
    environment: 'production',
    owner: 'operator',
    storageLocationCategory: 'not-collected',
    escrowEligible: false,
    escrowStatus: 'excluded-session-token',
    rotationRequired: false,
    rotationCadence: null,
    lastVerifiedAt: null,
    cleanupRequiredAfterBuild: false,
    nonEscrowReason: 'session token excluded from durable escrow by default',
    presence: presenceByName.get('PUMPKIN_ADMIN_JWT') ?? 'MISSING',
    valueIncluded: false
  });
  upsert(references, {
    credentialRefId: 'credential-roller-rink-rentals-api-key',
    displayName: 'Roller Rink Rentals API Key',
    envName: 'ROLLER_RINK_RENTALS_API_KEY',
    purpose: 'Roller tenant API access for approved local encrypted handoff',
    requiredFor: ['Roller tenant integration handoff'],
    resourceIds: ['resource-roller-api'],
    tenantKeys: ['roller-rink-rentals'],
    environment: 'production',
    owner: 'operator',
    storageLocationCategory: 'encrypted-handoff-vault',
    escrowEligible: true,
    escrowStatus: presenceByName.get('ROLLER_RINK_RENTALS_API_KEY') === 'PRESENT' ? 'eligible-if-vault-created' : 'not-collected',
    rotationRequired: true,
    rotationCadence: 'after build handoff or owner request',
    lastVerifiedAt: null,
    cleanupRequiredAfterBuild: true,
    nonEscrowReason: null,
    presence: presenceByName.get('ROLLER_RINK_RENTALS_API_KEY') ?? 'MISSING',
    valueIncluded: false
  });
}

function upsert(references, candidate) {
  const index = references.findIndex((item) => item.credentialRefId === candidate.credentialRefId);
  if (index >= 0) {
    references[index] = { ...references[index], ...candidate, valueIncluded: false };
    return;
  }
  references.push(candidate);
}

function normalizeCredentialReference(credential = {}) {
  return {
    credentialRefId: stringOrDefault(credential.credentialRefId, null),
    displayName: stringOrDefault(credential.displayName, credential.credentialRefId ?? 'unnamed-credential-reference'),
    envName: stringOrDefault(credential.envName, null),
    purpose: stringOrDefault(credential.purpose, 'unspecified'),
    requiredFor: arrayOfStrings(credential.requiredFor),
    resourceIds: arrayOfStrings(credential.resourceIds),
    tenantKeys: arrayOfStrings(credential.tenantKeys),
    environment: stringOrDefault(credential.environment, 'local'),
    owner: stringOrDefault(credential.owner, 'unknown'),
    storageLocationCategory: stringOrDefault(credential.storageLocationCategory, 'not-collected'),
    escrowEligible: credential.escrowEligible === true,
    escrowStatus: stringOrDefault(credential.escrowStatus, 'not-collected'),
    rotationRequired: credential.rotationRequired === true,
    rotationCadence: credential.rotationCadence ?? null,
    lastVerifiedAt: credential.lastVerifiedAt ?? null,
    cleanupRequiredAfterBuild: credential.cleanupRequiredAfterBuild === true,
    nonEscrowReason: credential.nonEscrowReason ?? null,
    presence: stringOrDefault(credential.presence, 'UNKNOWN'),
    valueIncluded: false
  };
}

function findCredentialValueFields(value, currentPath = '$') {
  const hits = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findCredentialValueFields(item, `${currentPath}[${index}]`)));
    return hits;
  }
  if (!value || typeof value !== 'object') {
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (['value', 'plaintextvalue', 'credentialvalue', 'secretvalue', 'rawvalue'].includes(normalized)) {
      hits.push({ path: `${currentPath}.${key}` });
    }
    hits.push(...findCredentialValueFields(child, `${currentPath}.${key}`));
  }
  return hits;
}

async function prepareOutputRoot(outputRoot, overwrite) {
  if (overwrite) {
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
}

function failure(code, path, message) {
  return { code, path, message };
}

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function stringOrDefault(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}
