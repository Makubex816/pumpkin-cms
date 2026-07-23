import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPublicPublicationRestoreEnvelope,
  publicPublicationHeldState,
  validatePublicPublicationRestoreEnvelope,
  validatePublicPublicationRestoreRecords
} from '../lib/public-publication-restore-contract.mjs';
import {
  buildCosmosCollectionEnvelope,
  buildCosmosExportManifest,
  fileNameForLogicalCollection,
  restoreContractForLogicalCollection
} from '../src/connectors/cosmos/cosmos-export-manifest.mjs';

const publication = {
  id: 'pub-synthetic-swa-v2',
  publicationId: 'pub-synthetic-swa-v2',
  tenantId: 'synthetic-validation-tenant',
  tenantUid: '4f932b7a-f1bb-4bf3-a787-f31db43c2c77',
  schemaVersion: '1.0.0',
  releaseId: 'release-synthetic-swa-v2',
  artifactSha256: 'a'.repeat(64),
  status: 'active',
  indexingState: 'disabled',
  activeFromUtc: '2026-07-22T00:00:00.000Z',
  activeUntilUtc: '2026-08-22T00:00:00.000Z',
  allowedOrigins: ['https://calm-river-01234567.azurestaticapps.net'],
  allowedHostnames: ['calm-river-01234567.azurestaticapps.net'],
  formMappings: [{
    formMappingId: 'contact-form',
    formDefinitionId: 'contact-definition',
    active: true,
    submitMode: 'public-ticket',
    fieldContractVersion: 'contact-v1',
    formKey: 'contact',
    siteKey: 'synthetic-site',
    pageSlug: 'contact'
  }],
  ticketKeyId: 'current-key-reference-only',
  ticketTtlSeconds: 120,
  revision: 1,
  createdAtUtc: '2026-07-22T00:00:00.000Z',
  createdBy: 'synthetic-pilot',
  updatedAtUtc: '2026-07-22T00:05:00.000Z',
  updatedBy: 'synthetic-pilot',
  activatedAtUtc: '2026-07-22T00:05:00.000Z',
  activatedBy: 'synthetic-pilot',
  revokedAtUtc: null,
  revokedBy: '',
  _etag: 'cosmos-system-value'
};

test('restore preserves both tenant identities while forcing publication held, noindex, and key-cleared', () => {
  const envelope = createPublicPublicationRestoreEnvelope([publication], {
    exportedAt: '2026-07-22T01:00:00.000Z'
  });
  const restored = envelope.publications[0];
  assert.equal(restored.tenantId, publication.tenantId);
  assert.equal(restored.tenantUid, publication.tenantUid);
  assert.equal(Object.hasOwn(restored, 'tenantKey'), false);
  assert.equal(restored.id, restored.publicationId);
  assert.equal(restored.status, publicPublicationHeldState);
  assert.equal(restored.active, false);
  assert.equal(restored.indexingState, 'disabled');
  assert.deepEqual(restored.allowedHostnames, ['calm-river-01234567.azurestaticapps.net']);
  assert.equal(restored.ticketKeyId, '');
  assert.equal(restored.activatedAtUtc, null);
  assert.equal(restored.activatedBy, '');
  assert.equal(restored.restoreState, publicPublicationHeldState);
  assert.equal(restored.revalidationRequired, true);
  assert.equal(restored.restoreMetadata.sourceStatus, 'active');
  assert.equal(restored.restoreMetadata.sourceActive, true);
  assert.equal(restored.restoreMetadata.sourceTicketKeyIdPresent, true);
  assert.equal(restored.restoreMetadata.activationAllowed, false);
  assert.equal(restored.restoreMetadata.revalidatedAt, null);
  assert.equal(Object.hasOwn(restored, '_etag'), false);
  assert.equal(publication.status, 'active');
  assert.equal(validatePublicPublicationRestoreEnvelope(envelope).ok, true);
});

test('restore validator enforces /id partition identity and global publicationId uniqueness', () => {
  const held = heldPublication();
  const duplicateAcrossTenant = {
    ...structuredClone(held),
    tenantId: 'another-tenant',
    tenantUid: '780b85a1-f6b1-440a-b9d4-86455859d5ce'
  };
  const result = validatePublicPublicationRestoreRecords([held, duplicateAcrossTenant]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('duplicates global publicationId')));

  const wrongPartitionId = { ...heldPublication(), id: 'different-storage-id' };
  const wrongIdResult = validatePublicPublicationRestoreRecords([wrongPartitionId]);
  assert.equal(wrongIdResult.ok, false);
  assert(wrongIdResult.errors.some((error) => error.includes('id must equal publicationId')));
});

test('restore validator requires HTTPS origins, exactly derived hosts, and active public-ticket mappings', () => {
  const invalid = {
    ...heldPublication(),
    allowedOrigins: ['http://example.test'],
    allowedHostnames: ['unrelated.example.test'],
    formMappings: [{
      formMappingId: 'contact-form',
      formDefinitionId: 'contact-definition',
      active: false,
      submitMode: 'credential',
      fieldContractVersion: '',
      formKey: 'contact',
      siteKey: 'synthetic-site',
      pageSlug: 'contact'
    }],
    activeFromUtc: '2026-09-01T00:00:00.000Z',
    activeUntilUtc: '2026-08-01T00:00:00.000Z'
  };
  const result = validatePublicPublicationRestoreRecords([invalid]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('allowedOrigins[0] is not canonical')));
  assert(result.errors.some((error) => error.includes('exactly match hostnames derived')));
  assert(result.errors.some((error) => error.includes('fieldContractVersion is required')));
  assert(result.errors.some((error) => error.includes('.active must be true')));
  assert(result.errors.some((error) => error.includes('submitMode must be public-ticket')));
  assert(result.errors.some((error) => error.includes('activeFromUtc must not be after activeUntilUtc')));
});

test('restore remains held/noindex and rejects stale key, ticket, or signing material', () => {
  const held = heldPublication();
  held.status = 'active';
  held.active = true;
  held.indexingState = 'enabled';
  held.ticketKeyId = 'stale-key-reference';
  let result = validatePublicPublicationRestoreRecords([held]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes(`status must be ${publicPublicationHeldState}`)));
  assert(result.errors.some((error) => error.includes('active must be false')));
  assert(result.errors.some((error) => error.includes('indexingState must remain disabled')));
  assert(result.errors.some((error) => error.includes('ticketKeyId must be empty')));

  const unsafe = {
    ...publication,
    auditMetadata: {
      submissionTicket: 'must-not-be-backed-up',
      signingKey: 'must-not-be-backed-up'
    }
  };
  assert.throws(
    () => createPublicPublicationRestoreEnvelope([unsafe]),
    /ticket, signing, or credential material/
  );

  const unsafeRestore = heldPublication();
  unsafeRestore.auditMetadata = { submissionTicket: 'must-not-be-backed-up' };
  result = validatePublicPublicationRestoreRecords([unsafeRestore]);
  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('auditMetadata.submissionTicket is forbidden')));
});

test('Cosmos manifest records source-supported /id and deterministic restore invariants', () => {
  assert.equal(fileNameForLogicalCollection('formEntries'), 'form-entries.json');
  assert.equal(fileNameForLogicalCollection('publicPublications'), 'public-publications.json');
  assert.equal(restoreContractForLogicalCollection('pages'), null);
  const publicationContract = restoreContractForLogicalCollection('publicPublications');
  assert.equal(publicationContract.sourcePartitionPath, '/id');
  assert.equal(publicationContract.idMatchesPublicationId, true);
  assert.equal(publicationContract.globalPublicationIdUnique, true);
  assert.equal(publicationContract.httpsOriginsOnly, true);

  const formEntryContract = restoreContractForLogicalCollection('formEntries');
  assert.equal(formEntryContract.storageIdDerivation, "sha256(tenantUid+'\\n'+submissionId)");
  assert(formEntryContract.publicContextFields.includes('tenantUid'));
  assert(formEntryContract.publicContextFields.includes('fieldContractVersion'));

  const scope = { scopeType: 'tenant', tenantKey: publication.tenantUid, siteKey: 'synthetic-site' };
  const collection = buildCosmosCollectionEnvelope({
    name: 'publicPublications',
    records: [publication],
    scope,
    createdAt: '2026-07-22T01:00:00.000Z'
  });
  assert.equal(collection.restoreContract.restoreState, publicPublicationHeldState);
  assert.equal(collection.restoreContract.ticketKeyRebindingRequired, true);

  const manifest = buildCosmosExportManifest({
    scope,
    account: { accountName: 'fake-account', source: 'fixture' },
    database: { databaseName: 'fake-database', source: 'fixture' },
    containers: { containers: [] },
    recordSets: [
      { logicalCollection: 'pages', path: 'pages.json', recordCount: 1 },
      { logicalCollection: 'formEntries', path: 'form-entries.json', recordCount: 1 },
      { logicalCollection: 'publicPublications', path: 'public-publications.json', recordCount: 1 }
    ],
    createdAt: '2026-07-22T01:00:00.000Z'
  });
  assert.deepEqual(manifest.restoreContracts.map((item) => item.logicalCollection), [
    'formEntries',
    'publicPublications'
  ]);
  assert.equal(manifest.restoreContracts[0].contract.sourceContainer, 'FormEntry');
  assert.equal(manifest.restoreContracts[1].contract.sourceContainer, 'PublicPublication');
});

function heldPublication() {
  return createPublicPublicationRestoreEnvelope([publication], {
    exportedAt: '2026-07-22T01:00:00.000Z'
  }).publications[0];
}
