import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AzureStaticWebAppDeploymentService,
  ContractVersion,
  CredentialProviderType,
  CredentialReferenceState,
  CurrentUserDpapiCredentialProvider,
  FileBackedImmutableRegistry,
  FormMode,
  HostingClass,
  InMemoryDeploymentAdapter,
  JobState,
  ManagedSecretProviderDesign,
  ProductReleaseRegistry,
  PublicationArtifactRegistry,
  PublicationJobStepDefinitions,
  PublicationMode,
  QualificationClass,
  Role,
  StepState,
  adaptPub20Input,
  applyRollbackOutcome,
  applyStepOutcome,
  beginPublicationRollback,
  buildCandidateQualificationArtifacts,
  buildChildEnvironmentContract,
  buildCurrentTenantCandidateSet,
  buildSwaPublicationPlan,
  canonicalDigest,
  createCommittedCandidatePlans,
  createCurrentPowerShellAdapterDescriptor,
  createPublicationJob,
  createPublicationJobPlanForCandidate,
  fileInventory,
  markStepRunning,
  nextRunnableSteps,
  normalizeCredentialReference,
  publishTenantSnapshot,
  readDeterministicTarInventory,
  readRegistryFile,
  resumePublicationJob,
  sha256,
  stableStringify,
  startPublicationJob,
  inventoryCandidateOutput,
  verifyCredentialReference,
  verifyCurrentTenantCandidateSet,
  verifyPublicationJob,
  verifySwaPlan,
  writeCurrentTenantCandidateSet,
  writeRegistryFile,
} from './index.mjs';

const tests = [];
const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolRoot, '..', '..');
const superAdmin = Object.freeze({ role: Role.SuperAdmin, actorId: 'super-admin-pub30' });
const tenantAdmin = Object.freeze({
  role: Role.TenantAdmin,
  actorId: 'tenant-admin-synthetic',
  tenantId: 'synthetic-tenant',
});
const otherTenantAdmin = Object.freeze({
  role: Role.TenantAdmin,
  actorId: 'tenant-admin-other',
  tenantId: 'other-tenant',
});

function test(name, run) {
  tests.push({ name, run });
}

function syntheticRelease() {
  return {
    releaseId: 'release-pub30-synthetic-v1',
    version: '30.0.0-synthetic',
    sourceCommit: '0123456789abcdef0123456789abcdef01234567',
    lockfileSha256: 'a'.repeat(64),
    packageVersions: { node: '22-synthetic' },
    licenseStatus: 'HELD_PENDING_OWNER_LEGAL_REVIEW',
  };
}

function attributionFiles() {
  const license = 'Synthetic validation license. No customer rights or payloads.\n';
  const notice = 'Synthetic validation notice for deterministic qualification only.\n';
  return [
    { path: 'LICENSE.txt', content: license, sha256: sha256(Buffer.from(license, 'utf8')) },
    { path: 'NOTICE.txt', content: notice, sha256: sha256(Buffer.from(notice, 'utf8')) },
  ];
}

function publicationFixture({
  publicationMode = PublicationMode.HELD_NOINDEX,
  formMode = FormMode.PREVIEW_NO_POST,
  ageGate = true,
} = {}) {
  const mediaBytes = Buffer.from('synthetic-image-binary-v1', 'utf8');
  const externalDigest = sha256('synthetic-external-media-content');
  return {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid: 'tenant-synthetic-pub30',
      tenantSlug: 'synthetic-tenant',
      displayName: 'Synthetic Publication Tenant',
    },
    productRelease: {
      ...syntheticRelease(),
      sourceRef: 'tools/tenant-publication-product/validate.mjs',
    },
    publication: {
      publicationId: 'publication-synthetic-pub30',
      artifactId: 'artifact-synthetic-pub30-v1',
      publicationMode,
      formMode,
      ...(formMode === FormMode.PUBLIC_FORMS_LIVE
        ? { apiBaseUrl: 'https://api.synthetic.example.invalid' }
        : {}),
      ageGate: ageGate
        ? {
            enabled: true,
            minimumAge: 21,
            title: 'Synthetic age verification',
            statement: 'Confirm the synthetic age-gate contract to continue.',
          }
        : { enabled: false },
      rollback: {
        predecessorPublicationId: 'publication-synthetic-pub29',
        predecessorArtifactSha256: 'b'.repeat(64),
      },
    },
    snapshot: {
      snapshotId: 'snapshot-synthetic-pub30-v1',
      themes: [
        {
          themeId: 'synthetic-theme',
          css: ':root{--accent:#f97316}body{font-family:system-ui,sans-serif}',
        },
      ],
      pages: [
        {
          pageId: 'page-synthetic-home',
          revisionId: 'revision-synthetic-home-v1',
          route: '/',
          title: 'Synthetic publication home',
          description: 'Synthetic non-customer deterministic publication.',
          themeId: 'synthetic-theme',
          blocks: [
            {
              type: 'hero',
              heading: 'Deterministic tenant publication',
              body: 'This is synthetic compatibility evidence.',
            },
            {
              type: 'image',
              heading: '',
              body: '',
              mediaRef: 'images/synthetic-logo.png',
              alt: 'Synthetic validation mark',
            },
          ],
          formIds: [],
          includeInSitemap: true,
        },
        {
          pageId: 'page-synthetic-contact',
          revisionId: 'revision-synthetic-contact-v1',
          route: '/contact',
          title: 'Synthetic contact',
          description: 'Synthetic form contract.',
          themeId: 'synthetic-theme',
          blocks: [
            {
              type: 'card',
              heading: 'Synthetic form',
              body: 'No customer submission is performed.',
            },
          ],
          formIds: ['synthetic-contact'],
          includeInSitemap: true,
        },
      ],
      navigation: [
        { label: 'Home', href: '/' },
        { label: 'Contact', href: '/contact' },
      ],
      media: [
        {
          mediaId: 'synthetic-logo',
          sha256: sha256(mediaBytes),
          mimeType: 'image/png',
          outputPath: 'assets/media/synthetic-logo.png',
          contentBase64: mediaBytes.toString('base64'),
        },
        {
          mediaId: 'synthetic-external',
          sha256: externalDigest,
          mimeType: 'image/png',
          publicUrl: 'https://cdn.synthetic.example.invalid/external.png',
        },
      ],
      mediaAliases: [
        { alias: 'images/synthetic-logo.png', mediaId: 'synthetic-logo' },
      ],
      redirects: [
        { from: '/home', to: '/', status: 301, preserveQueryString: true },
      ],
      forms: [
        {
          formId: 'synthetic-contact',
          formMappingId: 'synthetic-contact-map',
          formKey: 'synthetic-contact',
          fieldContractVersion: '1.0.0',
          submitLabel: 'Send synthetic request',
          fields: [
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
              autocomplete: 'email',
            },
            {
              name: 'topic',
              label: 'Topic',
              type: 'select',
              required: true,
              options: ['General', 'Qualification'],
            },
            {
              name: 'message',
              label: 'Message',
              type: 'textarea',
              required: true,
            },
          ],
          consent: {
            name: 'privacyConsent',
            label: 'I consent to processing this synthetic validation request.',
          },
          honeypot: {
            name: 'companyWebsite',
            label: 'Leave this field blank',
          },
        },
      ],
    },
    attributionFiles: attributionFiles(),
  };
}

function swaFixture(overrides = {}) {
  const fixture = {
    tenantId: 'synthetic-tenant',
    publicationId: 'publication-synthetic-pub30',
    releaseId: 'release-pub30-synthetic-v1',
    artifact: {
      artifactId: 'artifact-synthetic-pub30-v1',
      packageSha256: 'c'.repeat(64),
      manifestSha256: 'd'.repeat(64),
    },
    resource: {
      subscriptionAlias: 'synthetic-subscription',
      resourceGroup: 'rg-synthetic-pub30',
      staticWebAppName: 'swa-synthetic-pub30',
      region: 'centralus',
      sku: 'Free',
      tags: {
        tenant: 'synthetic-tenant',
        publication: 'publication-synthetic-pub30',
      },
    },
    credentialReferenceId: 'credential-synthetic-swa',
    currentState: {
      resourceExists: false,
      tagsMatch: false,
      defaultHostname: null,
      deployedArtifactSha256: null,
      publicationOriginMatches: false,
    },
    rollback: {
      predecessorPublicationId: 'publication-synthetic-pub29',
      predecessorArtifactSha256: 'e'.repeat(64),
    },
    domain: {
      apex: 'synthetic.example.invalid',
      www: 'www.synthetic.example.invalid',
      dnsProvider: 'synthetic-dns',
    },
    approvals: {
      resourceMutation: false,
      deploymentMutation: false,
      publicationMutation: false,
      deleteResourceMutation: false,
    },
    cleanup: {
      revokePredecessorRequested: false,
      archiveSupersededRequested: false,
      deleteResourceRequested: false,
      deleteConfirmation: '',
    },
  };
  return merge(fixture, overrides);
}

function credentialReference() {
  return normalizeCredentialReference({
    schemaVersion: ContractVersion.credentialReference,
    credentialReferenceId: 'credential-synthetic-swa',
    providerType: CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER,
    state: CredentialReferenceState.ACTIVE,
    purpose: 'azure-swa-deployment',
    environmentVariableName: 'SWA_CLI_DEPLOYMENT_TOKEN',
    envelopeFormat: 'PUMPKIN_DPAPI_ENVELOPE_V1',
    envelopeReference:
      'secure-operator-handoff/platform-publication/pub-20-a03-token-security-reconciliation/dpapi-envelope-target.json',
    envelopeSha256: 'f'.repeat(64),
    protectionScope: 'CurrentUser',
    aclState: 'OWNER_ONLY_INHERITANCE_REMOVED',
    valueIncluded: false,
  });
}

function baseJobPlan(stepActions = {}) {
  return {
    tenantId: 'synthetic-tenant',
    publicationId: 'publication-synthetic-pub30',
    releaseId: 'release-pub30-synthetic-v1',
    artifactId: 'artifact-synthetic-pub30-v1',
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    dryRun: true,
    stepActions,
    approvalGates: { deployment: 'owner-deployment-approval' },
    evidenceRefs: ['tools/tenant-publication-product/README.md'],
  };
}

test('publisher is byte-for-byte deterministic with identical TAR inventories', () => {
  const first = publishTenantSnapshot(publicationFixture());
  const second = publishTenantSnapshot(publicationFixture());
  assert.deepEqual(first.packageBytes, second.packageBytes);
  assert.deepEqual(first.manifestBytes, second.manifestBytes);
  assert.deepEqual(first.manifest, second.manifest);
  assert.deepEqual(
    readDeterministicTarInventory(first.packageBytes),
    readDeterministicTarInventory(second.packageBytes),
  );
  assert.deepEqual(readDeterministicTarInventory(first.packageBytes), fileInventory(first.files));
  assert.equal(first.manifest.legalDistributionState, 'HELD_PENDING_OWNER_LEGAL_REVIEW');
});

test('preview mode has no POST transport and all output remains noindex', () => {
  const artifact = publishTenantSnapshot(publicationFixture());
  const paths = new Set(artifact.files.map((file) => file.path));
  const allText = artifact.files.map((file) => String(file.content)).join('\n');
  assert.equal(paths.has('assets/public-form-client.js'), false);
  assert.equal(allText.includes('/preflight'), false);
  assert.equal(allText.includes('/submit'), false);
  assert.match(allText, /noindex,nofollow,noarchive/);
  assert.match(allText, /User-agent: \*\nDisallow: \//);
  assert.match(allText, /Intentionally empty while indexing is disabled/);
  assert.match(allText, /data-pumpkin-age-gate/);
  assert.match(allText, /assets\/media\/synthetic-logo\.png/);
});

test('public-live mode emits ticketed form transport without reusable credentials', () => {
  const artifact = publishTenantSnapshot(
    publicationFixture({
      publicationMode: PublicationMode.PUBLIC_NOINDEX,
      formMode: FormMode.PUBLIC_FORMS_LIVE,
    }),
  );
  const files = new Map(artifact.files.map((file) => [file.path, String(file.content)]));
  assert.equal(files.has('assets/public-form-client.js'), true);
  assert.match(files.get('assets/public-form-client.js'), /clientIdempotencySeed/);
  assert.match(files.get('assets/public-form-client.js'), /credentials: "omit"/);
  assert.match(files.get('assets/public-form-client.js'), /x-pumpkin-public-form-ticket/);
  const clientBytes = Buffer.from(files.get('assets/public-form-client.js'), 'utf8');
  const clientText = new TextDecoder('utf-8', { fatal: true }).decode(clientBytes);
  assert.match(clientText, /Sending…/u);
  assert.equal(clientText.includes('\uFFFD'), false);
  assert.equal(clientText.includes('Sendingâ'), false);
  assert.equal(files.get('assets/public-form-client.js').includes('SWA_CLI_DEPLOYMENT_TOKEN'), false);
  assert.match(files.get('tenant-manifest.json'), /PUBLIC_FORMS_LIVE/);
});

test('indexing execution is a hard stop', () => {
  const fixture = publicationFixture();
  fixture.publication.publicationMode =
    PublicationMode.PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED;
  assertCode(() => publishTenantSnapshot(fixture), 'indexing_execution_disabled');
});

test('publisher rejects route, redirect, media, form, and block collisions', () => {
  const duplicateRoute = publicationFixture();
  duplicateRoute.snapshot.pages.push({ ...duplicateRoute.snapshot.pages[0] });
  assertCode(() => publishTenantSnapshot(duplicateRoute), 'route_collision');

  const redirectCollision = publicationFixture();
  redirectCollision.snapshot.redirects[0].from = '/contact';
  assertCode(() => publishTenantSnapshot(redirectCollision), 'route_redirect_collision');

  const mediaCollision = publicationFixture();
  mediaCollision.snapshot.media.push({
    ...mediaCollision.snapshot.media[0],
    mediaId: 'synthetic-logo-copy',
    outputPath: 'assets/media/synthetic-logo-copy.png',
  });
  assertCode(() => publishTenantSnapshot(mediaCollision), 'canonical_media_hash_collision');

  const formCollision = publicationFixture();
  formCollision.snapshot.forms.push({
    ...formCollision.snapshot.forms[0],
    formId: 'synthetic-contact-copy',
  });
  assertCode(() => publishTenantSnapshot(formCollision), 'form_mapping_collision');

  const unknownBlock = publicationFixture();
  unknownBlock.snapshot.pages[0].blocks[0].type = 'unsupported-widget';
  assertCode(() => publishTenantSnapshot(unknownBlock), 'unknown_block_type');
});

test('attribution hashes and paths are exact and legal distribution remains held', () => {
  const artifact = publishTenantSnapshot(publicationFixture());
  const files = new Map(artifact.files.map((file) => [file.path, file.content]));
  for (const attribution of attributionFiles()) {
    assert.equal(sha256(Buffer.from(files.get(attribution.path))), attribution.sha256);
  }
  const tenantManifest = JSON.parse(String(files.get('tenant-manifest.json')));
  assert.equal(tenantManifest.legalDistributionState, 'HELD_PENDING_OWNER_LEGAL_REVIEW');
  assert.deepEqual(
    tenantManifest.attributionFiles.map((item) => item.path),
    ['LICENSE.txt', 'NOTICE.txt'],
  );

  const mismatch = publicationFixture();
  mismatch.attributionFiles[0].sha256 = '0'.repeat(64);
  assertCode(() => publishTenantSnapshot(mismatch), 'attribution_hash_mismatch');

  const unsafePath = publicationFixture();
  unsafePath.attributionFiles[0].path = '../LICENSE';
  assertCode(() => publishTenantSnapshot(unsafePath), 'attribution_path_invalid');
});

test('artifact JSON parses and secret/absolute-path hygiene fails closed', () => {
  const artifact = publishTenantSnapshot(publicationFixture());
  for (const file of artifact.files.filter((candidate) => candidate.path.endsWith('.json'))) {
    assert.doesNotThrow(() => JSON.parse(String(file.content)), file.path);
  }
  const secret = publicationFixture();
  secret.publication.clientSecret = 'not-allowed';
  assertCode(() => publishTenantSnapshot(secret), 'forbidden_data');

  const localPath = publicationFixture();
  localPath.snapshot.themes[0].css = 'body{background-image:url("C:\\Users\\operator\\asset.png")}';
  assertCode(() => publishTenantSnapshot(localPath), 'absolute_path_in_artifact');
});

test('release registry is immutable and SuperAdmin-controlled', () => {
  const registry = new ProductReleaseRegistry();
  const release = { ...syntheticRelease(), state: 'ACCEPTED' };
  assert.equal(registry.accept(release, superAdmin).status, 'accepted');
  assert.equal(registry.accept(release, superAdmin).status, 'idempotent_replay');
  assertCode(
    () => registry.accept({ ...release, version: 'changed' }, superAdmin),
    'immutable_record_conflict',
  );
  assertCode(() => registry.accept({ ...release, releaseId: 'tenant-attempt' }, tenantAdmin), 'superadmin_required');
  assert.equal(registry.toDocument().records.length, 1);
});

test('artifact registry enforces tenant isolation, supersession, and revocation', () => {
  const registry = new PublicationArtifactRegistry();
  const first = {
    artifactId: 'artifact-synthetic-one',
    tenantId: 'synthetic-tenant',
    releaseId: 'release-pub30-synthetic-v1',
    packageSha256: '1'.repeat(64),
  };
  const second = {
    ...first,
    artifactId: 'artifact-synthetic-two',
    packageSha256: '2'.repeat(64),
  };
  registry.accept(first, tenantAdmin);
  registry.accept(second, tenantAdmin);
  assertCode(
    () => registry.accept({ ...first, artifactId: 'artifact-cross', tenantId: 'other-tenant' }, tenantAdmin),
    'cross_tenant_forbidden',
  );
  assertCode(() => registry.read(first.artifactId, otherTenantAdmin), 'cross_tenant_forbidden');
  assert.equal(registry.list(tenantAdmin).length, 2);
  assert.equal(registry.supersede(first.artifactId, second.artifactId, tenantAdmin).status, 'superseded');
  assert.equal(registry.read(first.artifactId, tenantAdmin).registryMetadata.state, 'SUPERSEDED');
  assert.equal(registry.revoke(second.artifactId, tenantAdmin, 'owner-revoked').status, 'revoked');
  assert.equal(registry.read(second.artifactId, superAdmin).registryMetadata.state, 'REVOKED');
});

test('file-backed registry round-trips deterministic documents without mutation drift', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pumpkin-pub30-registry-'));
  const filePath = path.join(directory, 'artifact-registry.json');
  try {
    const registry = new PublicationArtifactRegistry();
    registry.accept(
      {
        artifactId: 'artifact-file-backed-one',
        tenantId: 'synthetic-tenant',
        releaseId: 'release-pub30-synthetic-v1',
        packageSha256: '3'.repeat(64),
      },
      tenantAdmin,
    );
    const firstWrite = await writeRegistryFile(filePath, registry);
    const secondWrite = await writeRegistryFile(filePath, registry);
    assert.equal(firstWrite.documentSha256, secondWrite.documentSha256);
    const loaded = await readRegistryFile(filePath);
    assert.equal(loaded.read('artifact-file-backed-one', tenantAdmin).tenantId, 'synthetic-tenant');
    const backed = await FileBackedImmutableRegistry.open(filePath, () => new PublicationArtifactRegistry());
    await backed.accept(
      {
        artifactId: 'artifact-file-backed-two',
        tenantId: 'synthetic-tenant',
        releaseId: 'release-pub30-synthetic-v1',
        packageSha256: '4'.repeat(64),
      },
      tenantAdmin,
    );
    assert.equal((await readRegistryFile(filePath)).list(tenantAdmin).length, 2);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('job IDs are deterministic and tenant authorization is enforced', () => {
  const first = createPublicationJob(baseJobPlan(), tenantAdmin);
  const second = createPublicationJob(baseJobPlan(), tenantAdmin);
  assert.deepEqual(first, second);
  assert.equal(first.state, JobState.PLANNED);
  assertCode(() => createPublicationJob(baseJobPlan(), otherTenantAdmin), 'cross_tenant_forbidden');
  const unsafe = baseJobPlan();
  unsafe.evidenceRefs = ['C:\\Users\\operator\\evidence.md'];
  assertCode(() => createPublicationJob(unsafe, tenantAdmin), 'absolute_path_forbidden');
});

test('job state machine resumes blocked, partial, and failed work idempotently', () => {
  let job = startPublicationJob(createPublicationJob(baseJobPlan(), tenantAdmin), tenantAdmin);
  job = markStepRunning(job, 'tenant-intake', tenantAdmin, 'attempt-intake-one');
  job = applyStepOutcome(job, 'tenant-intake', 'blocked', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-intake-one',
    output: { reasonCode: 'synthetic-dependency' },
  });
  assert.equal(job.state, JobState.BLOCKED);
  job = resumePublicationJob(job, {
    actor: tenantAdmin,
    stepKey: 'tenant-intake',
    idempotencyKey: 'resume-intake-one',
    reasonCode: 'dependency-cleared',
  });
  job = applyStepOutcome(job, 'tenant-intake', 'success', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-intake-two',
    output: { status: 'verified' },
  });
  const replay = applyStepOutcome(job, 'tenant-intake', 'success', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-intake-two',
    output: { status: 'verified' },
  });
  assert.deepEqual(replay, job);
  assertCode(
    () =>
      applyStepOutcome(job, 'tenant-intake', 'success', {
        actor: tenantAdmin,
        idempotencyKey: 'attempt-intake-two',
        output: { status: 'different' },
      }),
    'step_idempotency_conflict',
  );

  job = applyStepOutcome(job, 'identity-provisioning', 'partial', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-identity-one',
    output: { reasonCode: 'synthetic-partial' },
  });
  assert.equal(job.state, JobState.PARTIAL);
  job = resumePublicationJob(job, {
    actor: tenantAdmin,
    stepKey: 'identity-provisioning',
    idempotencyKey: 'resume-identity-one',
    reasonCode: 'partial-reconciled',
  });
  job = applyStepOutcome(job, 'identity-provisioning', 'success', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-identity-two',
  });
  job = applyStepOutcome(job, 'content-import', 'failed', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-content-one',
    output: { reasonCode: 'synthetic-failure' },
  });
  assert.equal(job.state, JobState.FAILED);
  job = resumePublicationJob(job, {
    actor: tenantAdmin,
    stepKey: 'content-import',
    idempotencyKey: 'resume-content-one',
    reasonCode: 'failure-corrected',
  });
  job = applyStepOutcome(job, 'content-import', 'success', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-content-two',
  });
  assert.equal(job.state, JobState.RUNNING);
  assert.equal(verifyPublicationJob(job), true);
});

test('job completion, no-op, approval gate, and reverse rollback are explicit', () => {
  let job = startPublicationJob(createPublicationJob(baseJobPlan(), tenantAdmin), tenantAdmin);
  let sequence = 0;
  while (job.state !== JobState.COMPLETED) {
    const runnable = nextRunnableSteps(job);
    assert.equal(runnable.length, 1);
    const stepRecord = job.steps.find((candidate) => candidate.key === runnable[0].key);
    const key = `complete-${String(++sequence).padStart(2, '0')}-${stepRecord.key}`;
    job = applyStepOutcome(job, stepRecord.key, 'success', {
      actor: tenantAdmin,
      idempotencyKey: key,
      ...(stepRecord.approvalGate ? { approvalRef: stepRecord.approvalGate } : {}),
      output: { status: 'synthetic-success' },
    });
  }
  assert.equal(job.steps.every((step) => step.state === StepState.SUCCEEDED), true);
  job = beginPublicationRollback(job, {
    actor: tenantAdmin,
    idempotencyKey: 'rollback-job-one',
    reasonCode: 'synthetic-rollback-proof',
  });
  const expectedOrder = job.steps
    .filter((step) => step.rollbackAction)
    .map((step) => step.key)
    .reverse();
  assert.deepEqual(job.rollback.order, expectedOrder);
  let rollbackSequence = 0;
  while (job.state === JobState.ROLLING_BACK) {
    const runnable = nextRunnableSteps(job);
    assert.equal(runnable.length, 1);
    job = applyRollbackOutcome(job, runnable[0].key, 'rolled_back', {
      actor: tenantAdmin,
      idempotencyKey: `rollback-step-${++rollbackSequence}`,
      output: { status: 'restored' },
    });
  }
  assert.equal(job.state, JobState.ROLLED_BACK);

  const allNoop = Object.fromEntries(
    PublicationJobStepDefinitions.map((definition) => [definition.key, 'noop']),
  );
  const noopJob = createPublicationJob(baseJobPlan(allNoop), tenantAdmin);
  assert.equal(noopJob.state, JobState.COMPLETED);
  assert.deepEqual(nextRunnableSteps(noopJob), []);
});

test('job output secret hygiene and approval gates fail closed', () => {
  let job = startPublicationJob(createPublicationJob(baseJobPlan(), tenantAdmin), tenantAdmin);
  assertCode(
    () =>
      applyStepOutcome(job, 'tenant-intake', 'success', {
        actor: tenantAdmin,
        idempotencyKey: 'secret-output-attempt',
        output: { clientSecret: 'not-allowed' },
      }),
    'forbidden_data',
  );
  for (const key of PublicationJobStepDefinitions.map((item) => item.key)) {
    if (key === 'deployment') break;
    const step = nextRunnableSteps(job)[0];
    job = applyStepOutcome(job, step.key, 'success', {
      actor: tenantAdmin,
      idempotencyKey: `advance-${step.key}`,
    });
  }
  assert.equal(nextRunnableSteps(job)[0].key, 'deployment');
  assertCode(
    () =>
      applyStepOutcome(job, 'deployment', 'success', {
        actor: tenantAdmin,
        idempotencyKey: 'deployment-no-approval',
      }),
    'step_approval_required',
  );
});

test('SWA plan covers create/reuse/no-op, exact hashes, Free SKU, and typed deletion', () => {
  const create = buildSwaPublicationPlan(swaFixture());
  assert.equal(verifySwaPlan(create), true);
  assert.equal(create.planOnly, true);
  assert.equal(create.executeCapabilityIncluded, false);
  assert.equal(create.context.artifactSha256, 'c'.repeat(64));
  assert.ok(create.unauthorizedMutationCount > 0);
  assert.deepEqual(create, buildSwaPublicationPlan(swaFixture()));

  const noop = buildSwaPublicationPlan(
    swaFixture({
      currentState: {
        resourceExists: true,
        sku: 'Free',
        tagsMatch: true,
        defaultHostname: 'swa-synthetic-pub30.azurestaticapps.net',
        deployedArtifactSha256: 'c'.repeat(64),
        publicationOriginMatches: true,
      },
    }),
  );
  assert.equal(noop.reconciliationStatus, 'no-op');
  assert.equal(noop.mutationRequiredCount, 0);

  assertCode(
    () => buildSwaPublicationPlan(swaFixture({ resource: { sku: 'Standard' } })),
    'swa_paid_sku_forbidden',
  );
  assertCode(
    () =>
      buildSwaPublicationPlan(
        swaFixture({
          cleanup: {
            deleteResourceRequested: true,
            deleteConfirmation: 'DELETE wrong-resource',
          },
        }),
      ),
    'swa_delete_confirmation_required',
  );
});

test('DPAPI reference and child-environment contracts contain metadata only', () => {
  const reference = credentialReference();
  assert.equal(verifyCredentialReference(reference), true);
  const contract = buildChildEnvironmentContract(reference, {
    executable: 'powershell',
    arguments: ['-NoProfile', '-File', 'operator-helper.ps1'],
    workingDirectoryRef: 'tools/tenant-publication-product',
  });
  assert.equal(contract.inheritParentEnvironment, false);
  assert.equal(contract.valueReturnedToCaller, false);
  assert.equal(contract.valueOnCommandLine, false);
  assert.equal(contract.valueWrittenToDisk, false);
  assert.equal(contract.rotationSupported, false);
  assert.equal(JSON.stringify(contract).includes('credentialValue'), false);
});

test('explicit deployment service covers the full bounded lifecycle', async () => {
  const secretMaterial = Buffer.alloc(48, 0x78).toString('base64');
  const reference = credentialReference();
  const provider = new CurrentUserDpapiCredentialProvider({
    reference,
    decryptForChild: async (metadata) => {
      assert.equal(metadata.valueIncluded, false);
      return Buffer.from(secretMaterial, 'utf8');
    },
  });
  const adapter = new InMemoryDeploymentAdapter();
  const service = new AzureStaticWebAppDeploymentService({
    adapter,
    credentialProvider: provider,
  });
  const context = {
    tenantId: 'synthetic-tenant',
    publicationId: 'publication-synthetic-pub30',
    releaseId: 'release-pub30-synthetic-v1',
    artifactId: 'artifact-synthetic-pub30-v1',
    resourceGroup: 'rg-synthetic-pub30',
    staticWebAppName: 'swa-synthetic-pub30',
    region: 'centralus',
    sku: 'Free',
  };
  const approval = { approved: true, approvalRef: 'owner-approved-pub30' };

  await service.readResource(context);
  await service.createOrReuse(context, approval);
  await service.tagResource(context, { tenant: 'synthetic-tenant' }, approval);
  await service.registerPublication(
    context,
    { publicationId: context.publicationId, state: 'READY' },
    approval,
  );
  const deployed = await service.deployExactArtifact(
    context,
    {
      artifactRootRef: 'artifacts/synthetic-pub30',
      environment: 'production',
      packageSha256: 'c'.repeat(64),
      manifestSha256: 'd'.repeat(64),
    },
    approval,
  );
  assert.equal(deployed.statusCode, 'deployed');
  await service.verifyDeployment(context, {
    packageSha256: 'c'.repeat(64),
    manifestSha256: 'd'.repeat(64),
  });
  await service.updatePublication(context, { state: 'ACTIVE', indexingEnabled: false }, approval);
  await service.rollback(
    context,
    {
      predecessorPublicationId: 'publication-synthetic-pub29',
      predecessorArtifactSha256: 'e'.repeat(64),
    },
    approval,
  );
  await service.revokePublication(context, 'publication-synthetic-pub29', approval);
  await service.archiveArtifact(context, 'artifact-synthetic-pub29', approval);
  await service.readCustomDomains(context);
  const handoff = service.prepareDomainHandoff(context, {
    apex: 'synthetic.example.invalid',
    www: 'www.synthetic.example.invalid',
    dnsProvider: 'synthetic-dns',
  });
  assert.equal(handoff.payload.stage, 'HELD');
  assert.equal(handoff.payload.customDomainMutationIncluded, false);
  const deletion = service.deleteResourcePlan(context, 'DELETE swa-synthetic-pub30');
  assert.equal(deletion.payload.planOnly, true);
  assert.equal(deletion.payload.executable, false);

  const observable = stableStringify({
    provider: provider.describe(),
    adapter: adapter.events(),
    journal: service.journal(),
    deployed,
    handoff,
    deletion,
  });
  assert.equal(observable.includes(secretMaterial), false);
  assert.equal(adapter.events().some((event) => event.arguments?.some((arg) => arg.includes(secretMaterial))), false);
  assert.equal(
    adapter.events().find((event) => event.action === 'deploy-child').environmentVariableNames[0],
    'SWA_CLI_DEPLOYMENT_TOKEN',
  );
  assertCode(() => provider.rotate(), 'credential_rotation_unsupported');
  assertCode(
    () => service.deleteResourcePlan(context, 'DELETE another-resource'),
    'deployment_delete_confirmation_required',
  );
  assert.equal(createCurrentPowerShellAdapterDescriptor().executionBuiltIn, false);
});

test('future managed-secret provider stays design-only', async () => {
  const provider = new ManagedSecretProviderDesign();
  assert.equal(provider.describe().status, 'DESIGN_ONLY_NOT_IMPLEMENTED');
  assertCode(() => provider.childEnvironmentContract(), 'credential_provider_design_only');
  await assertRejectsCode(() => provider.runChild(), 'credential_provider_design_only');
});

test('candidate adapters preserve exact qualification and hosting classes', async () => {
  const plans = createCommittedCandidatePlans(syntheticRelease(), attributionFiles());
  const byKey = new Map(plans.map((plan) => [plan.candidateKey, plan]));
  assert.equal(
    byKey.get('ice-rink-rentals').qualificationClass,
    QualificationClass.STATIC_READY_WITH_ADAPTATION,
  );
  for (const key of ['party-pros-philadelphia', 'strip-club-near-me-vegas']) {
    assert.equal(
      byKey.get(key).qualificationClass,
      QualificationClass.SHARED_COMPATIBILITY_REQUIRED,
    );
    assert.equal(byKey.get(key).hostingClass, HostingClass.SHARED_RUNTIME_COMPATIBILITY);
    assert.match(byKey.get(key).buildDisposition, /DOES_NOT_QUALIFY_SHARED_SOURCE/);
  }
  assert.equal(byKey.get('airstrip').canonicalInput, null);
  assert.equal(byKey.get('airstrip').buildDisposition, 'METADATA_ONLY_NO_BUILD');
  for (const plan of plans) {
    for (const sourceRef of plan.sourceRefs) {
      await fs.access(path.resolve(repositoryRoot, sourceRef));
    }
    const jobPlan = createPublicationJobPlanForCandidate(plan);
    assert.equal(jobPlan.dryRun, true);
    assert.equal(jobPlan.stepActions['domain-hold'], 'hold');
    assert.equal(jobPlan.stepActions['indexing-hold'], 'hold');
  }
});

test('candidate compiler probes are deterministic and do not reclassify sources', () => {
  const first = buildCandidateQualificationArtifacts(syntheticRelease(), attributionFiles());
  const second = buildCandidateQualificationArtifacts(syntheticRelease(), attributionFiles());
  assert.deepEqual(first, second);
  assert.equal(first.filter((item) => item.artifact).length, 3);
  assert.equal(first.find((item) => item.candidateKey === 'airstrip').status, 'METADATA_ONLY');
  assert.equal(first.every((item) => item.sourceQualificationChanged === false), true);
});

test('current-tenant candidates and retained PUB-20 artifact are deterministic', async () => {
  const first = await buildCurrentTenantCandidateSet({
    repositoryRoot,
    releaseContext: syntheticRelease(),
  });
  const second = await buildCurrentTenantCandidateSet({
    repositoryRoot,
    releaseContext: syntheticRelease(),
  });
  assert.equal(verifyCurrentTenantCandidateSet(first), true);
  assert.equal(verifyCurrentTenantCandidateSet(second), true);
  assert.equal(first.index.indexSha256, second.index.indexSha256);
  assert.deepEqual(
    first.candidates.map((candidate) => ({
      key: candidate.candidateKey,
      package: candidate.manifest.packageSha256,
      manifest: candidate.manifest.manifestSha256,
      projection: candidate.staticProjection.manifest.packageSha256,
      projectionManifest: sha256(candidate.staticProjection.manifestBytes),
      inventory: candidate.manifest.files,
    })),
    second.candidates.map((candidate) => ({
      key: candidate.candidateKey,
      package: candidate.manifest.packageSha256,
      manifest: candidate.manifest.manifestSha256,
      projection: candidate.staticProjection.manifest.packageSha256,
      projectionManifest: sha256(candidate.staticProjection.manifestBytes),
      inventory: candidate.manifest.files,
    })),
  );

  const byKey = new Map(first.candidates.map((candidate) => [candidate.candidateKey, candidate]));
  assert.equal(byKey.get('ice-rink-rentals').readiness.counts.routes, 3);
  assert.equal(byKey.get('party-pros-philadelphia').readiness.counts.routes, 301);
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.routes, 43);
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.forms, 32);
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.formInstances, 65);
  assert.equal(
    byKey.get('strip-club-near-me-vegas').readiness.counts.mediaReferences,
    302,
  );
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.mediaAliases, 473);
  assert.equal(
    byKey.get('ice-rink-rentals').qualificationClass,
    QualificationClass.STATIC_READY_WITH_ADAPTATION,
  );
  for (const key of ['party-pros-philadelphia', 'strip-club-near-me-vegas']) {
    assert.equal(
      byKey.get(key).qualificationClass,
      QualificationClass.SHARED_COMPATIBILITY_REQUIRED,
    );
    assert.equal(byKey.get(key).hostingClass, HostingClass.SHARED_RUNTIME_COMPATIBILITY);
  }

  const exactAttribution = new Map([
    [
      'third-party/sdi-ai-pumpkin-cms/LICENSE',
      '1eb85fc97224598dad1852b5d6483bbcf0aa8608790dcc657a5a2a761ae9c8c6',
    ],
    [
      'third-party/sdi-ai-pumpkin-cms/NOTICE',
      '65c58dd61ab8360b28cfbe33c859c694bc8502c22d8d8b686dc44aeccc926c9b',
    ],
  ]);
  for (const candidate of first.candidates) {
    const candidateInventory = new Map(
      candidate.manifest.files.map((file) => [file.path, file.sha256]),
    );
    const projectionInventory = new Map(
      candidate.staticProjection.manifest.files.map((file) => [file.path, file.sha256]),
    );
    for (const [filePath, digest] of exactAttribution) {
      assert.equal(candidateInventory.get(filePath), digest);
      assert.equal(projectionInventory.get(filePath), digest);
    }
    assert.equal(candidate.manifest.legalDistributionState, 'HELD_PENDING_OWNER_LEGAL_REVIEW');
    assert.equal(candidate.manifest.deploymentEligible, false);
    assert.equal(candidate.manifest.liveMutation, false);
    assert.equal(candidate.orchestrator.job.steps.length, 16);
    assert.equal(candidate.orchestrator.domainHandoffs.length, 2);
    assert.equal(candidate.orchestrator.domainHandoffs.every((item) => item.stage === 'HELD'), true);
  }
  assert.equal(first.genericFutureTenant.lifecycle.length, 16);
  assert.deepEqual(first.genericFutureTenant.domainHandoffTypes, ['EXTERNAL_DNS', 'AZURE_DNS']);
  assert.equal(first.airstripFreeze.packageCreated, false);
  assert.equal(first.airstripFreeze.publicRequestMade, false);
  assert.equal(first.airstripFreeze.sourceContentRead, false);

  assert.equal(
    first.retainedPub20Synthetic.packageSha256,
    second.retainedPub20Synthetic.packageSha256,
  );
  assert.equal(
    first.retainedPub20Synthetic.manifestSha256,
    second.retainedPub20Synthetic.manifestSha256,
  );
  assert.equal(first.retainedPub20Synthetic.proof.buildCount, 2);
  assert.equal(first.retainedPub20Synthetic.proof.extractedInventoriesIdentical, true);
  assert.equal(first.retainedPub20Synthetic.proof.utf8.exactSendingEllipsisPresent, true);
  assert.equal(first.retainedPub20Synthetic.proof.postExecuted, false);
  assert.equal(
    first.retainedPub20Synthetic.proof.preservedPub20Evidence.packageSha256,
    '227512fe26000e0fa933da51ec41a83e274cbb38b24bf15624de0b142271b4dd',
  );
  assert.equal(
    first.retainedPub20Synthetic.proof.preservedPub20Evidence.manifestSha256,
    '80c9db24ab57d537e11eb86bfadb8d4e58f7cef87bf0c59978617c2224d98e54',
  );

  const temporaryRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'pumpkin-pub30-candidates-'),
  );
  const firstOutput = path.join(temporaryRoot, 'first');
  const secondOutput = path.join(temporaryRoot, 'second');
  try {
    await writeCurrentTenantCandidateSet({
      repositoryRoot,
      outputRoot: firstOutput,
      candidateSet: first,
    });
    await writeCurrentTenantCandidateSet({
      repositoryRoot,
      outputRoot: secondOutput,
      candidateSet: second,
    });
    const firstInventory = await inventoryCandidateOutput(firstOutput);
    const secondInventory = await inventoryCandidateOutput(secondOutput);
    assert.deepEqual(firstInventory, secondInventory);
    assert.equal(firstInventory.some((item) => item.path.startsWith('airstrip/') && item.path.endsWith('.tar')), false);
    for (const file of (await recursiveFiles(firstOutput)).filter((item) => item.endsWith('.json'))) {
      const text = await fs.readFile(file, 'utf8');
      assert.doesNotThrow(() => JSON.parse(text), file);
      assert.equal(
        /(?:[A-Za-z]:[\\/]|file:\/\/|\/(?:Users|home|mnt|tmp)\/)/.test(text),
        false,
        file,
      );
    }
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
});

test('PUB-20 legacy fixture adapts without changing preserved source', async () => {
  const sourcePath = path.resolve(
    repositoryRoot,
    'tools/static-tenant-publication/synthetic-tenant-secondary.json',
  );
  const before = await fs.readFile(sourcePath);
  const legacy = JSON.parse(before.toString('utf8'));
  const adapted = adaptPub20Input(legacy, syntheticRelease(), {
    attributionFiles: attributionFiles(),
  });
  const after = await fs.readFile(sourcePath);
  assert.deepEqual(after, before);
  assert.equal(adapted.publication.publicationMode, PublicationMode.PUBLIC_NOINDEX);
  assert.equal(adapted.publication.formMode, FormMode.PUBLIC_FORMS_LIVE);
  assert.equal(adapted.snapshot.pages.length, legacy.routes.length);
  assert.equal(adapted.attributionFiles.length, 2);
});

test('validation leaves no credential/env/log artifacts in the product tree', async () => {
  const files = await recursiveFiles(toolRoot);
  assert.equal(files.some((file) => /(?:^|[\\/])\.env(?:\.|$)/i.test(file)), false);
  assert.equal(files.some((file) => /\.(?:log|token|secret)$/i.test(file)), false);
  const dynamicMaterial = Buffer.alloc(48, 0x78).toString('base64');
  for (const file of files) {
    const content = await fs.readFile(file);
    assert.equal(content.includes(Buffer.from(dynamicMaterial, 'utf8')), false, file);
  }
});

let passed = 0;
for (const { name, run } of tests) {
  try {
    await run();
    passed += 1;
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error?.stack ?? error);
    process.exitCode = 1;
    break;
  }
}

if (process.exitCode !== 1) {
  console.log(
    stableStringify({
      status: 'passed',
      tests: passed,
      deterministicPublisher: true,
      liveMutation: false,
      networkCalls: 0,
      credentialValuesRecorded: false,
      tokenRotation: false,
      legalDistributionState: 'HELD_PENDING_OWNER_LEGAL_REVIEW',
    }),
  );
}

function assertCode(run, expectedCode) {
  assert.throws(run, (error) => error?.code === expectedCode, expectedCode);
}

async function assertRejectsCode(run, expectedCode) {
  await assert.rejects(run, (error) => error?.code === expectedCode, expectedCode);
}

function merge(base, overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return overrides;
  const output = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === 'object' &&
      !Array.isArray(output[key])
    ) {
      output[key] = merge(output[key], value);
    } else {
      output[key] = structuredClone(value);
    }
  }
  return output;
}

async function recursiveFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await recursiveFiles(entryPath)));
    else files.push(entryPath);
  }
  return files;
}
