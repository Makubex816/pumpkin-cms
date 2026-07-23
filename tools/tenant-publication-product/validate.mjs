import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  createHash,
  generateKeyPairSync,
  sign as signData,
} from 'node:crypto';
import nodeFs from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';

const platformOriginKeyPair = generateKeyPairSync('ed25519');
const holdAuthorityKeyPair = generateKeyPairSync('ed25519');
const deploymentMutationKeyPair = generateKeyPairSync('ed25519');
const deploymentReadbackKeyPair = generateKeyPairSync('ed25519');
const validationJobStoreRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), 'pumpkin-pub30-job-store-'),
);
const validationDeploymentOperationLedgerRoot =
  await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      'pumpkin-pub30-deployment-ledger-',
    ),
  );

function bootPublicKeySha256(keyPair) {
  return createHash('sha256')
    .update(
      keyPair.publicKey.export({
        format: 'der',
        type: 'spki',
      }),
    )
    .digest('hex');
}

function bootPublicKeyPem(keyPair) {
  return keyPair.publicKey.export({
    format: 'pem',
    type: 'spki',
  });
}

function bootCanonicalDigest(value) {
  const stableValue = (candidate) => {
    if (Array.isArray(candidate)) {
      return candidate.map(stableValue);
    }
    if (candidate && typeof candidate === 'object') {
      return Object.fromEntries(
        Object.keys(candidate)
          .sort()
          .map((key) => [
            key,
            stableValue(candidate[key]),
          ]),
      );
    }
    return candidate;
  };
  return createHash('sha256')
    .update(JSON.stringify(stableValue(value)))
    .digest('hex');
}

const platformOriginVerifierBootstrapConfiguration =
  Object.freeze({
    schemaVersion:
      'pumpkin.platform-origin-verifier-config.v1',
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    keyId: 'synthetic-platform-origin-key',
    publicKeyPem: bootPublicKeyPem(platformOriginKeyPair),
    publicKeySha256:
      bootPublicKeySha256(platformOriginKeyPair),
    revocationListId: 'synthetic-origin-revocations',
    revokedAuthorityIds: [
      'synthetic-revoked-platform-authority',
    ],
  });
const holdAuthorityVerifierBootstrapConfiguration =
  Object.freeze({
    schemaVersion:
      'pumpkin.publication-hold-authority-verifier.v1',
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    keyId: 'synthetic-publication-hold-key',
    publicKeyPem: bootPublicKeyPem(holdAuthorityKeyPair),
    publicKeySha256:
      bootPublicKeySha256(holdAuthorityKeyPair),
    revocationSnapshotId: 'synthetic-hold-revocations',
    revokedAuthorityIds: [
      'authority-revoked-resource-plan',
    ],
  });
const deploymentVerifierBootstrapConfiguration =
  Object.freeze({
    schemaVersion: 'pumpkin.deployment-verifier-config.v1',
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    mutationKeyId:
      'synthetic-deployment-mutation-key',
    mutationPublicKeyPem:
      bootPublicKeyPem(deploymentMutationKeyPair),
    mutationPublicKeySha256:
      bootPublicKeySha256(deploymentMutationKeyPair),
    readbackKeyId:
      'synthetic-deployment-readback-key',
    readbackPublicKeyPem:
      bootPublicKeyPem(deploymentReadbackKeyPair),
    readbackPublicKeySha256:
      bootPublicKeySha256(deploymentReadbackKeyPair),
    revocationListId: 'synthetic-deployment-revocations',
    revokedAuthorityIds: [
      'synthetic-revoked-deployment-authority',
    ],
  });

process.env.PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256 =
  bootPublicKeySha256(platformOriginKeyPair);
process.env.PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256 =
  bootCanonicalDigest(
    platformOriginVerifierBootstrapConfiguration,
  );
process.env.PUMPKIN_HOLD_AUTHORITY_PUBLIC_KEY_SHA256 =
  bootPublicKeySha256(holdAuthorityKeyPair);
process.env.PUMPKIN_HOLD_AUTHORITY_VERIFIER_SHA256 =
  bootCanonicalDigest(
    holdAuthorityVerifierBootstrapConfiguration,
  );
process.env.PUMPKIN_DEPLOYMENT_MUTATION_PUBLIC_KEY_SHA256 =
  bootPublicKeySha256(deploymentMutationKeyPair);
process.env.PUMPKIN_DEPLOYMENT_READBACK_PUBLIC_KEY_SHA256 =
  bootPublicKeySha256(deploymentReadbackKeyPair);
process.env.PUMPKIN_DEPLOYMENT_VERIFIER_SHA256 =
  bootCanonicalDigest(
    deploymentVerifierBootstrapConfiguration,
  );
process.env.PUMPKIN_PUBLICATION_JOB_STORE_ROOT =
  validationJobStoreRoot;
process.env.PUMPKIN_DEPLOYMENT_OPERATION_LEDGER_ROOT =
  validationDeploymentOperationLedgerRoot;

const {
  AzureStaticWebAppDeploymentService,
  AuditedDpapiSwaHelperContract,
  ContractVersion,
  CredentialProviderType,
  CredentialReferenceState,
  CurrentUserDpapiCredentialProvider,
  FileBackedPublicationJobStore,
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
  buildOperation,
  buildPub20CanonicalInput,
  buildCandidateQualificationArtifacts,
  buildCurrentTenantCandidateSet,
  buildSwaPublicationPlan,
  canonicalDigest,
  createDeterministicTar,
  createCommittedCandidatePlans,
  createCurrentPowerShellAdapterDescriptor,
  createPrivilegedDeploymentVerifier,
  createPrivilegedPlatformOriginVerifier,
  createPublicationHoldAuthorityVerifier,
  createPublicationJob,
  createPublicationJobPlanForCandidate,
  deterministicId,
  derivePlatformOriginAuthorityScope,
  deploymentMutationAuthorityScope,
  deploymentReadbackAuthorityScope,
  deploymentReconciliationAuthorityScope,
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
} = await import('./index.mjs');

const tests = [];
const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolRoot, '..', '..');
const execFileAsync = promisify(execFile);
const { stdout: validationHeadOutput } = await execFileAsync(
  'git',
  ['-C', repositoryRoot, 'rev-parse', '--verify', 'HEAD^{commit}'],
  {
    encoding: 'utf8',
    windowsHide: true,
  },
);
const validationSourceCommit = validationHeadOutput.trim();
assert.match(validationSourceCommit, /^[a-f0-9]{40}$/);
const validationJobStore =
  new FileBackedPublicationJobStore({
    storeRoot: validationJobStoreRoot,
    repositoryRoot,
  });
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
const deploymentProviderByAction = Object.freeze({
  'create-or-reuse': 'azure',
  tag: 'azure',
  register: 'publication-registry',
  deploy: 'azure-swa',
  update: 'publication-registry',
  rollback: 'azure-swa',
  revoke: 'publication-registry',
  archive: 'artifact-registry',
});
const holdAuthorityVerifierConfiguration =
  holdAuthorityVerifierBootstrapConfiguration;
const holdAuthorityVerifier =
  createPublicationHoldAuthorityVerifier(
    holdAuthorityVerifierConfiguration,
  );
let historicalHeldJobId = null;
let historicalHeldAuthorityId = null;

function test(name, run) {
  tests.push({ name, run });
}

function syntheticRelease() {
  return {
    releaseId: 'release-pub30-synthetic-v1',
    version: '30.0.0-synthetic',
    sourceCommit: validationSourceCommit,
    lockfileSha256: 'a'.repeat(64),
    packageVersions: { node: '22-synthetic' },
    testEvidence: [
      'tenant-publication-product-validation',
      'root-workspace-acceptance',
      'api-publication-provider-parity',
      'admin-publication-ui-acceptance',
      'current-tenant-candidate-determinism',
    ].map((suiteId, index) => ({
      suiteId,
      status: 'PASSED',
      evidenceSha256: String(index + 1).repeat(64),
    })),
    licenseStatus: 'HELD_PENDING_OWNER_LEGAL_REVIEW',
    starterArtifactSha256: 'c'.repeat(64),
    starterImageDigest: `sha256:${'d'.repeat(64)}`,
  };
}

function acceptedSyntheticProductReleaseRegistry() {
  const registry = new ProductReleaseRegistry();
  registry.accept(
    {
      ...syntheticRelease(),
      state: 'ACCEPTED',
    },
    superAdmin,
  );
  return registry;
}

function publicationArtifactRegistry(
  document = null,
  productReleaseRegistry =
    acceptedSyntheticProductReleaseRegistry(),
) {
  return new PublicationArtifactRegistry({
    document,
    productReleaseRegistry,
  });
}

function artifactRegistryRecord({
  artifactId,
  tenantId,
  tenantUid = tenantId,
  publicationId = `publication-${tenantId}`,
  snapshotId = `snapshot-${artifactId}`,
  releaseId = 'release-pub30-synthetic-v1',
  sourceSnapshotSha256 = '7'.repeat(64),
  packageSha256,
  manifestSha256 = 'a'.repeat(64),
  hostingClass = HostingClass.STATIC_PUBLISHED_SITE,
  publicationMode = PublicationMode.HELD_NOINDEX,
  formMode = FormMode.PREVIEW_NO_POST,
  routeInventorySha256 = '8'.repeat(64),
  mediaInventorySha256 = '9'.repeat(64),
  formInventorySha256 = 'a'.repeat(64),
  fileInventorySha256 = 'b'.repeat(64),
  predecessorArtifactId = null,
  predecessorPublicationId =
    predecessorArtifactId === null ? null : publicationId,
  predecessorArtifactSha256 = null,
  rollbackArtifactId =
    predecessorArtifactId === null ? null : predecessorArtifactId,
}) {
  return {
    artifactId,
    tenantId,
    tenantUid,
    publicationId,
    snapshotId,
    releaseId,
    sourceSnapshotSha256,
    packageSha256,
    manifestSha256,
    hostingClass,
    publicationMode,
    formMode,
    routeInventorySha256,
    mediaInventorySha256,
    formInventorySha256,
    fileInventorySha256,
    predecessorArtifactId,
    predecessorPublicationId,
    predecessorArtifactSha256,
    rollbackArtifactId,
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
  const mediaBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );
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
          mimeType: 'image/png',
          publicUrl: 'https://cdn.synthetic.example.invalid/external.png',
          referenceClassification: 'MUTABLE_UNVERIFIED_REFERENCE',
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

function platformOriginAuthorizationFor(input, overrides = {}, keyPair = null) {
  const signingKeyPair = keyPair ?? platformOriginKeyPair;
  const scope = derivePlatformOriginAuthorityScope(input);
  const now = Date.now();
  const body = {
    schemaVersion: 'pumpkin.platform-origin-authority.v1',
    authorityId: 'synthetic-platform-origin-authority',
    approvalState: 'APPROVED',
    action: 'USE_PUBLIC_FORM_PLATFORM_ORIGIN',
    origin: new URL(scope.apiBaseUrl).origin,
    tenantUid: scope.tenantUid,
    publicationId: scope.publicationId,
    releaseId: scope.releaseId,
    artifactId: scope.artifactId,
    snapshotId: scope.snapshotId,
    formsSha256: scope.formsSha256,
    issuedAt: new Date(now - 60_000).toISOString(),
    expiresAt: new Date(now + 60 * 60_000).toISOString(),
    revocationState: 'ACTIVE',
    revocationListId: 'synthetic-origin-revocations',
    evidenceRef: 'tools/tenant-publication-product/validate.mjs',
    keyId: 'synthetic-platform-origin-key',
    ...overrides,
  };
  const signedBody = {
    ...body,
    integritySha256: canonicalDigest(body),
  };
  const verifierConfiguration = structuredClone(
    platformOriginVerifierBootstrapConfiguration,
  );
  return {
    authority: {
      ...signedBody,
      signatureBase64: signData(
        null,
        Buffer.from(stableStringify(signedBody), 'utf8'),
        signingKeyPair.privateKey,
      ).toString('base64'),
    },
    verifier: createPrivilegedPlatformOriginVerifier(
      verifierConfiguration,
    ),
    verifierConfiguration,
  };
}

async function retainedPub20OriginAuthorization(
  release = syntheticRelease(),
  keyPair = null,
) {
  const legacy = JSON.parse(
    await fs.readFile(
      path.resolve(
        repositoryRoot,
        'tools/static-tenant-publication/synthetic-tenant-secondary.json',
      ),
      'utf8',
    ),
  );
  const canonical = buildPub20CanonicalInput(legacy, release, {
    attributionFiles: attributionFiles(),
  });
  return platformOriginAuthorizationFor(
    canonical,
    {
      authorityId: 'pub20-a02-retained-platform-origin',
      evidenceRef:
        'deployment/architecture/tenant-publication/pub-20-a02-successor-artifact-public-form-contract/result-manifest.json',
    },
    keyPair,
  );
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
    envelopeMetadataId: 'pub20-a03-synthetic-dpapi-envelope',
    envelopeSha256: 'f'.repeat(64),
    protectionScope: 'CurrentUser',
    aclState: 'OWNER_ONLY_INHERITANCE_REMOVED',
    valueIncluded: false,
  });
}

function baseJobPlan(stepActions = {}, identitySuffix = '') {
  const explicitVerifyActions = Object.fromEntries(
    PublicationJobStepDefinitions.map((definition) => [
      definition.key,
      'verify',
    ]),
  );
  return {
    tenantId: 'synthetic-tenant',
    publicationId:
      `publication-synthetic-pub30${identitySuffix
        ? `-${identitySuffix}`
        : ''}`,
    releaseId: 'release-pub30-synthetic-v1',
    artifactId:
      `artifact-synthetic-pub30-v1${identitySuffix
        ? `-${identitySuffix}`
        : ''}`,
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    dryRun: true,
    stepActions: { ...explicitVerifyActions, ...stepActions },
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
  assert.equal(
    first.manifest.formsSha256,
    canonicalDigest(first.input.snapshot.forms),
  );
  assert.equal(first.manifest.publicFormApiOrigin, null);
  assert.equal(first.manifest.platformOriginAuthorityReceipt, null);
  assert.equal(
    first.manifest.platformOriginAuthorityReceiptSha256,
    null,
  );
  const packagedManifest = JSON.parse(
    String(
      first.files.find(
        (file) => file.path === 'publication-manifest.json',
      ).content,
    ),
  );
  assert.equal(
    packagedManifest.formsSha256,
    first.manifest.formsSha256,
  );
  assert.equal(packagedManifest.publicFormApiOrigin, null);
  assert.equal(packagedManifest.platformOriginAuthorityReceipt, null);
  assert.equal(
    packagedManifest.platformOriginAuthorityReceiptSha256,
    null,
  );
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
  const fixture = publicationFixture({
    publicationMode: PublicationMode.PUBLIC_NOINDEX,
    formMode: FormMode.PUBLIC_FORMS_LIVE,
  });
  const authorization = platformOriginAuthorizationFor(fixture);
  const artifact = publishTenantSnapshot(fixture, {
    platformOriginAuthority: authorization.authority,
    platformOriginVerifier: authorization.verifier,
  });
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

test('public form client reuses one logical seed after an ambiguous lost response', async () => {
  const fixture = publicationFixture({
    publicationMode: PublicationMode.PUBLIC_NOINDEX,
    formMode: FormMode.PUBLIC_FORMS_LIVE,
  });
  const authorization = platformOriginAuthorizationFor(fixture);
  const artifact = publishTenantSnapshot(fixture, {
    platformOriginAuthority: authorization.authority,
    platformOriginVerifier: authorization.verifier,
  });
  const client = String(
    artifact.files.find(
      (file) =>
        file.path === 'assets/public-form-client.js',
    ).content,
  );
  const clickHandlers = [];
  const formHandlers = new Map();
  const button = {
    disabled: true,
    setAttribute() {},
    addEventListener(name, handler) {
      if (name === 'click') clickHandlers.push(handler);
    },
  };
  const status = { textContent: '', dataset: {} };
  const controls = [
    {
      dataset: { fieldName: 'email' },
      type: 'email',
      value: 'synthetic@example.invalid',
    },
    {
      dataset: { fieldName: 'privacyConsent' },
      type: 'checkbox',
      checked: true,
    },
    {
      dataset: { fieldName: 'companyWebsite' },
      type: 'text',
      value: '',
    },
  ];
  const form = {
    dataset: { formId: 'synthetic-contact' },
    reportValidity: () => true,
    querySelector(selector) {
      if (selector === '[data-pumpkin-submit]') return button;
      if (selector === '[data-pumpkin-form-status]') {
        return status;
      }
      return null;
    },
    querySelectorAll(selector) {
      return selector === '[data-field-name]'
        ? controls
        : [];
    },
    addEventListener(name, handler) {
      formHandlers.set(name, handler);
    },
  };
  const metadata = {
    formMode: 'PUBLIC_FORMS_LIVE',
    apiBaseUrl: 'https://api.synthetic.example.invalid',
    platformOriginAuthority: {
      expiresAt: new Date(
        Date.now() + 60 * 60_000,
      ).toISOString(),
    },
    publicFormMappings: {
      'synthetic-contact': {
        preflightPath: '/public/preflight',
        submitPath: '/public/submit',
        consentField: 'privacyConsent',
        honeypotField: 'companyWebsite',
      },
    },
  };
  const observedSeeds = [];
  let submitAttempts = 0;
  let generatedSeeds = 0;
  const context = {
    Date,
    JSON,
    crypto: {
      randomUUID() {
        generatedSeeds += 1;
        return `synthetic-seed-${generatedSeeds}`;
      },
    },
    document: {
      querySelector(selector) {
        if (selector === '[data-pumpkin-public-metadata]') {
          return { textContent: JSON.stringify(metadata) };
        }
        return null;
      },
      querySelectorAll(selector) {
        return selector === '[data-pumpkin-public-form]'
          ? [form]
          : [];
      },
    },
    async fetch(url, options) {
      if (url.endsWith('/public/preflight')) {
        const request = JSON.parse(options.body);
        observedSeeds.push(request.clientIdempotencySeed);
        return {
          ok: true,
          async json() {
            return {
              submissionId: `submission-${request.clientIdempotencySeed}`,
              correlationId: `correlation-${request.clientIdempotencySeed}`,
              ticket: 'ephemeral-ticket-not-recorded',
            };
          },
        };
      }
      submitAttempts += 1;
      if (submitAttempts === 1) {
        throw new Error('synthetic-lost-response');
      }
      return { ok: true };
    },
  };
  runInNewContext(client, context, {
    timeout: 2_000,
  });
  assert.equal(clickHandlers.length, 1);
  await clickHandlers[0]();
  assert.equal(button.disabled, false);
  await clickHandlers[0]();
  assert.deepEqual(observedSeeds, [
    'synthetic-seed-1',
    'synthetic-seed-1',
  ]);
  assert.equal(generatedSeeds, 1);
  assert.equal(status.dataset.code, 'created_or_replayed');
  formHandlers.get('reset')();
  await clickHandlers[0]();
  assert.equal(observedSeeds.at(-1), 'synthetic-seed-2');
  assert.equal(generatedSeeds, 2);
});

test('public-live form origins require exact separately bound platform authority', () => {
  const fixture = publicationFixture({
    publicationMode: PublicationMode.PUBLIC_NOINDEX,
    formMode: FormMode.PUBLIC_FORMS_LIVE,
  });
  assertCode(
    () => publishTenantSnapshot(fixture),
    'platform_origin_authority_required',
  );
  const valid = platformOriginAuthorizationFor(fixture);
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: valid.authority,
      }),
    'platform_origin_verifier_unconfigured',
  );
  const wrongSigner = generateKeyPairSync('ed25519');
  const wrongSignatureAuthority = structuredClone(valid.authority);
  delete wrongSignatureAuthority.signatureBase64;
  wrongSignatureAuthority.signatureBase64 = signData(
    null,
    Buffer.from(stableStringify(wrongSignatureAuthority), 'utf8'),
    wrongSigner.privateKey,
  ).toString('base64');
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: wrongSignatureAuthority,
        platformOriginVerifier: valid.verifier,
      }),
    'platform_origin_authority_signature_invalid',
  );
  const wrongOrigin = platformOriginAuthorizationFor(fixture, {
    origin: 'https://unapproved.example.invalid',
  });
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: wrongOrigin.authority,
        platformOriginVerifier: wrongOrigin.verifier,
      }),
    'platform_origin_authority_origin_invalid',
  );
  const wrongTenant = platformOriginAuthorizationFor(fixture, {
    tenantUid: 'another-tenant',
  });
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: wrongTenant.authority,
        platformOriginVerifier: wrongTenant.verifier,
      }),
    'platform_origin_authority_scope_invalid',
  );
  for (const override of [
    { artifactId: 'another-artifact' },
    { snapshotId: 'another-snapshot' },
    { formsSha256: '0'.repeat(64) },
  ]) {
    const wrongScope = platformOriginAuthorizationFor(fixture, override);
    assertCode(
      () =>
        publishTenantSnapshot(fixture, {
          platformOriginAuthority: wrongScope.authority,
          platformOriginVerifier: wrongScope.verifier,
        }),
      'platform_origin_authority_scope_invalid',
    );
  }
  const expired = platformOriginAuthorizationFor(fixture, {
    issuedAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    expiresAt: new Date(Date.now() - 60 * 60_000).toISOString(),
  });
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: expired.authority,
        platformOriginVerifier: expired.verifier,
      }),
    'platform_origin_authority_time_invalid',
  );
  const revoked = platformOriginAuthorizationFor(fixture, {
    authorityId: 'synthetic-revoked-platform-authority',
  });
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: revoked.authority,
        platformOriginVerifier: revoked.verifier,
      }),
    'platform_origin_authority_revoked',
  );
  assertCode(
    () =>
      createPrivilegedPlatformOriginVerifier({
        ...valid.verifierConfiguration,
        revokedAuthorityIds: [],
      }),
    'platform_origin_boot_verifier_mismatch',
  );
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: valid.authority,
        platformOriginVerifier: Object.freeze({
          describe: () => valid.verifier.describe(),
        }),
      }),
    'platform_origin_verifier_unconfigured',
  );
  const tampered = structuredClone(valid.authority);
  tampered.origin = 'https://tampered.example.invalid';
  assertCode(
    () =>
      publishTenantSnapshot(fixture, {
        platformOriginAuthority: tampered,
        platformOriginVerifier: valid.verifier,
      }),
    'platform_origin_authority_integrity_invalid',
  );

  const preview = publicationFixture();
  preview.publication.apiBaseUrl = 'https://unapproved.example.invalid';
  assertCode(
    () =>
      publishTenantSnapshot(preview, {
        platformOriginVerifier: valid.verifier,
      }),
    'preview_origin_forbidden',
  );
});

test('privileged verifier factories reject caller-selected keys outside boot anchors', async () => {
  const indexHref = pathToFileURL(
    path.join(toolRoot, 'index.mjs'),
  ).href;
  const probe = `
    import { createHash, generateKeyPairSync } from 'node:crypto';
    const configured = generateKeyPairSync('ed25519');
    const pinned = generateKeyPairSync('ed25519');
    const digest = (key) => createHash('sha256')
      .update(key.export({ format: 'der', type: 'spki' }))
      .digest('hex');
    const pinnedSha256 = digest(pinned.publicKey);
    process.env.PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256 = pinnedSha256;
    process.env.PUMPKIN_HOLD_AUTHORITY_PUBLIC_KEY_SHA256 = pinnedSha256;
    process.env.PUMPKIN_DEPLOYMENT_MUTATION_PUBLIC_KEY_SHA256 = pinnedSha256;
    process.env.PUMPKIN_DEPLOYMENT_READBACK_PUBLIC_KEY_SHA256 = pinnedSha256;
    const product = await import(${JSON.stringify(indexHref)});
    const publicKeyPem = configured.publicKey.export({
      format: 'pem',
      type: 'spki',
    });
    const publicKeySha256 = digest(configured.publicKey);
    const capture = (run) => {
      try {
        run();
        return null;
      } catch (error) {
        return error && error.code ? error.code : 'missing_error_code';
      }
    };
    const platform = capture(() =>
      product.createPrivilegedPlatformOriginVerifier({
        schemaVersion: 'pumpkin.platform-origin-verifier-config.v1',
        status: 'ACTIVE',
        algorithm: 'Ed25519',
        keyId: 'subprocess-platform-key',
        publicKeyPem,
        publicKeySha256,
        revocationListId: 'subprocess-platform-revocations',
        revokedAuthorityIds: [],
      }),
    );
    const hold = capture(() =>
      product.createPublicationHoldAuthorityVerifier({
        schemaVersion: 'pumpkin.publication-hold-authority-verifier.v1',
        status: 'ACTIVE',
        algorithm: 'Ed25519',
        keyId: 'subprocess-hold-key',
        publicKeyPem,
        publicKeySha256,
        revocationSnapshotId: 'subprocess-hold-revocations',
        revokedAuthorityIds: [],
      }),
    );
    const deployment = capture(() =>
      product.createPrivilegedDeploymentVerifier({
        schemaVersion: 'pumpkin.deployment-verifier-config.v1',
        status: 'ACTIVE',
        algorithm: 'Ed25519',
        mutationKeyId: 'subprocess-deployment-mutation-key',
        mutationPublicKeyPem: publicKeyPem,
        mutationPublicKeySha256: publicKeySha256,
        readbackKeyId: 'subprocess-deployment-readback-key',
        readbackPublicKeyPem: publicKeyPem,
        readbackPublicKeySha256: publicKeySha256,
        revocationListId: 'subprocess-deployment-revocations',
        revokedAuthorityIds: [],
      }),
    );
    process.stdout.write(JSON.stringify({ platform, hold, deployment }));
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ['--input-type=module', '--eval', probe],
    {
      cwd: toolRoot,
      encoding: 'utf8',
      windowsHide: true,
    },
  );
  assert.deepEqual(JSON.parse(stdout), {
    platform: 'platform_origin_boot_verifier_mismatch',
    hold: 'hold_verifier_boot_snapshot_mismatch',
    deployment: 'deployment_verifier_boot_snapshot_mismatch',
  });
});

test('themes reject mutable external CSS imports and URL dependencies', () => {
  for (const css of [
    '@import "https://attacker.example.invalid/theme.css";',
    '@\\69mport url(theme.css);',
    '@tailwind utilities;',
    'body{@apply text-red-500}',
    'body{background:url(assets/local.png)}',
    'body{background:u/**/rl(assets/local.png)}',
    'body{background:u\\72l(assets/local.png)}',
    'body{background:image-set(url(asset.png) 1x)}',
    'body{background:-webkit-image-set("asset.png" 1x)}',
    'body{background:url(//cdn.example.invalid/image.png)}',
    'body{background:url(https://cdn.example.invalid/image.png)}',
    '@font-face{font-family:test;src:local("test")}',
  ]) {
    const fixture = publicationFixture();
    fixture.snapshot.themes[0].css = css;
    assertCode(
      () => publishTenantSnapshot(fixture),
      'theme_external_dependency_forbidden',
    );
  }
});

test('themes allow closed-resource browser CSS constructs', () => {
  const fixture = publicationFixture();
  fixture.snapshot.themes[0].css = `
    /* local deterministic theme */
    :root { --label: "Pumpkin"; }
    .hover\\:accent:hover { color: #0369a1; }
    @media (min-width: 40rem) { main { max-width: 64rem; } }
    @supports (display: grid) { main { display: grid; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  `;
  assert.doesNotThrow(() => publishTenantSnapshot(fixture));
});

test('external media is explicitly mutable and never fidelity-complete or hash-bound', () => {
  const artifact = publishTenantSnapshot(publicationFixture());
  assert.equal(
    artifact.compatibility.status,
    'compatible_with_mutable_unverified_references',
  );
  assert.equal(
    artifact.compatibility.fidelityStatus,
    'INCOMPLETE_EXTERNAL_MEDIA_UNVERIFIED',
  );
  const warning = artifact.compatibility.warnings.find(
    (item) => item.code === 'mutable_unverified_external_media',
  );
  assert.equal(warning.classification, 'MUTABLE_UNVERIFIED_REFERENCE');
  assert.equal(/hash-bound/i.test(stableStringify(artifact.compatibility)), false);
  assert.equal(artifact.manifest.externalMutableMediaCount, 1);
  assert.equal(
    artifact.manifest.fidelityStatus,
    'INCOMPLETE_EXTERNAL_MEDIA_UNVERIFIED',
  );

  const impliedDigest = publicationFixture();
  impliedDigest.snapshot.media[1].sha256 = '1'.repeat(64);
  assertCode(
    () => publishTenantSnapshot(impliedDigest),
    'external_media_digest_forbidden',
  );
  const unclassified = publicationFixture();
  delete unclassified.snapshot.media[1].referenceClassification;
  assertCode(
    () => publishTenantSnapshot(unclassified),
    'external_media_classification_required',
  );
});

test('embedded media enforces MIME extension and signature contracts', () => {
  const wrongExtension = publicationFixture();
  wrongExtension.snapshot.media[0].outputPath =
    'assets/media/synthetic-logo.jpg';
  assertCode(
    () => publishTenantSnapshot(wrongExtension),
    'media_extension_mismatch',
  );

  const wrongSignature = publicationFixture();
  const nonPngBytes = Buffer.from(
    'synthetic-bytes-without-png-signature',
    'utf8',
  );
  wrongSignature.snapshot.media[0].contentBase64 =
    nonPngBytes.toString('base64');
  wrongSignature.snapshot.media[0].sha256 = sha256(nonPngBytes);
  assertCode(
    () => publishTenantSnapshot(wrongSignature),
    'media_signature_mismatch',
  );
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

  const aliasCanonicalIdCollision = publicationFixture();
  aliasCanonicalIdCollision.snapshot.mediaAliases[0].alias =
    aliasCanonicalIdCollision.snapshot.media[0].mediaId;
  assertCode(
    () => publishTenantSnapshot(aliasCanonicalIdCollision),
    'media_alias_canonical_id_collision',
  );

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

test('routes and TAR artifact paths reject patterns, controls, and encoded ambiguity', () => {
  for (const route of [
    '/*',
    '/route/{*path}',
    '/%2e%2e/admin',
    '/safe%2fescape',
    '/safe%5cescape',
    `/bad${String.fromCodePoint(0)}tail`,
    `/bad${String.fromCodePoint(0x85)}tail`,
  ]) {
    const fixture = publicationFixture();
    fixture.snapshot.pages[1].route = route;
    assertCode(() => publishTenantSnapshot(fixture), 'route_invalid');
  }
  for (const route of ['/NUL', '/folder.', '/assets/CON.txt']) {
    const fixture = publicationFixture();
    fixture.snapshot.pages[1].route = route;
    assertCode(() => publishTenantSnapshot(fixture), 'route_traversal');
  }
  for (const route of [
    '/index.html',
    '/404.html',
    '/README.txt',
    '/INDEX.HTML',
    '/readme.txt/child',
  ]) {
    const fixture = publicationFixture();
    fixture.snapshot.pages[1].route = route;
    assertCode(() => publishTenantSnapshot(fixture), 'route_reserved');
  }
  for (const artifactPath of [
    'routes/*.html',
    'routes/{name}.html',
    'routes/%2e%2e.html',
    'routes/%2f.html',
    `bad${String.fromCodePoint(0)}tail/index.html`,
    `bad${String.fromCodePoint(0x85)}tail/index.html`,
  ]) {
    assertCode(
      () =>
        createDeterministicTar([
          { path: artifactPath, content: 'adversarial' },
        ]),
      'artifact_path_invalid',
    );
  }
  for (const artifactPath of [
    'NUL',
    'assets/CON.txt',
    'index.html.',
  ]) {
    assertCode(
      () =>
        createDeterministicTar([
          { path: artifactPath, content: 'adversarial' },
        ]),
      'artifact_path_traversal',
    );
  }

  const artifact = publishTenantSnapshot(publicationFixture());
  assert.deepEqual(
    readDeterministicTarInventory(artifact.packageBytes),
    artifact.manifest.files,
  );
  const tampered = Buffer.from(artifact.packageBytes);
  tampered[0] = 0;
  assert.throws(
    () => readDeterministicTarInventory(tampered),
    /checksum|NUL-terminated|data after/i,
  );
  assert.throws(
    () =>
      readDeterministicTarInventory(
        Buffer.concat([artifact.packageBytes, Buffer.alloc(512)]),
      ),
    /trailer/i,
  );
  for (const files of [
    [
      { path: 'A.txt', content: 'one' },
      { path: 'a.txt', content: 'two' },
    ],
    [
      { path: 'Foo', content: 'one' },
      { path: 'foo/child.txt', content: 'two' },
    ],
  ]) {
    assertCode(
      () => createDeterministicTar(files),
      files[0].path.toLowerCase() === files[1].path.toLowerCase()
        ? 'artifact_path_case_collision'
        : 'artifact_path_prefix_collision',
    );
  }
  const noncanonicalType = Buffer.from(artifact.packageBytes);
  noncanonicalType[156] = 0;
  repairTarHeaderChecksum(noncanonicalType);
  assert.throws(
    () => readDeterministicTarInventory(noncanonicalType),
    /entry type/i,
  );
  const noncanonicalMode = Buffer.from(artifact.packageBytes);
  Buffer.from('   0644\0', 'ascii').copy(noncanonicalMode, 100);
  repairTarHeaderChecksum(noncanonicalMode);
  assert.throws(
    () => readDeterministicTarInventory(noncanonicalMode),
    /canonical octal/i,
  );
  const noncanonicalChecksum = Buffer.from(
    artifact.packageBytes,
  );
  noncanonicalChecksum.fill(0x20, 148, 156);
  const checksumValue = noncanonicalChecksum
    .subarray(0, 512)
    .reduce((sum, byte) => sum + byte, 0);
  Buffer.from(
    `${checksumValue.toString(8).padStart(6, ' ')}\0 `,
    'ascii',
  ).copy(noncanonicalChecksum, 148);
  assert.throws(
    () => readDeterministicTarInventory(noncanonicalChecksum),
    /canonical octal/i,
  );

  for (const {
    files,
    replacement,
    expectedCode,
  } of [
    {
      files: [
        { path: 'a.txt', content: 'one' },
        { path: 'b.txt', content: 'two' },
      ],
      replacement: 'A.txt',
      expectedCode: 'artifact_path_case_collision',
    },
    {
      files: [
        { path: 'foo', content: 'one' },
        { path: 'goo/bar', content: 'two' },
      ],
      replacement: 'foo/bar',
      expectedCode: 'artifact_path_prefix_collision',
    },
  ]) {
    const collisionTar = createDeterministicTar(files);
    Buffer.from(replacement, 'ascii').copy(collisionTar, 1024);
    repairTarHeaderChecksum(collisionTar, 1024);
    assertCode(
      () => readDeterministicTarInventory(collisionTar),
      expectedCode,
    );
  }
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
  localPath.snapshot.pages[0].blocks[0].body =
    'Synthetic source path C:\\Users\\operator\\asset.png';
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
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          testEvidence: release.testEvidence.map((item) => ({
            ...item,
            evidenceSha256: 'f'.repeat(64),
          })),
        },
        superAdmin,
    ),
    'immutable_record_conflict',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-failed-qualification',
          testEvidence: release.testEvidence.map(
            (item, index) => ({
              ...item,
              status: index === 0 ? 'FAILED' : item.status,
            }),
          ),
        },
        superAdmin,
      ),
    'registry_release_not_qualified',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-missing-mandatory-suite',
          testEvidence: release.testEvidence.slice(1),
        },
        superAdmin,
      ),
    'registry_release_not_qualified',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-open-license-status',
          licenseStatus: 'PENDING',
        },
        superAdmin,
      ),
    'registry_record_payload_invalid',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-duplicate-test-evidence',
          testEvidence: [
            ...release.testEvidence,
            ...release.testEvidence,
          ],
        },
        superAdmin,
      ),
    'registry_test_evidence_duplicate',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-invalid-starter-image',
          starterImageDigest: 'd'.repeat(64),
        },
        superAdmin,
    ),
    'sha256_digest_invalid',
  );
  const missingStarterArtifact = { ...release };
  delete missingStarterArtifact.starterArtifactSha256;
  assertCode(
    () => registry.accept(missingStarterArtifact, superAdmin),
    'registry_document_shape_invalid',
  );
  assertCode(
    () =>
      registry.accept(
        {
          ...release,
          releaseId: 'release-open-test-evidence-shape',
          testEvidence: [
            {
              ...release.testEvidence[0],
              unboundEvidence: true,
            },
          ],
        },
        superAdmin,
      ),
    'registry_document_shape_invalid',
  );
  assertCode(() => registry.accept({ ...release, releaseId: 'tenant-attempt' }, tenantAdmin), 'superadmin_required');
  assert.equal(registry.toDocument().records.length, 1);
});

test('artifact registry enforces tenant isolation, supersession, and revocation', () => {
  const registry = publicationArtifactRegistry();
  const releaseGatedRecord = artifactRegistryRecord({
    artifactId: 'artifact-release-gate',
    tenantId: 'synthetic-tenant',
    packageSha256: '0'.repeat(64),
  });
  assertCode(
    () =>
      publicationArtifactRegistry(
        null,
        new ProductReleaseRegistry(),
      ).accept(releaseGatedRecord, tenantAdmin),
    'product_release_missing',
  );
  const revokedReleaseRegistry =
    acceptedSyntheticProductReleaseRegistry();
  revokedReleaseRegistry.revoke(
    releaseGatedRecord.releaseId,
    superAdmin,
    'release-revoked-validation',
  );
  assertCode(
    () =>
      publicationArtifactRegistry(
        null,
        revokedReleaseRegistry,
      ).accept(releaseGatedRecord, tenantAdmin),
    'product_release_not_accepted',
  );
  const supersededReleaseRegistry =
    acceptedSyntheticProductReleaseRegistry();
  supersededReleaseRegistry.accept(
    {
      ...syntheticRelease(),
      releaseId: 'release-pub30-synthetic-v2',
      version: '30.0.1-synthetic',
      state: 'ACCEPTED',
    },
    superAdmin,
  );
  supersededReleaseRegistry.supersede(
    releaseGatedRecord.releaseId,
    'release-pub30-synthetic-v2',
    superAdmin,
  );
  assertCode(
    () =>
      publicationArtifactRegistry(
        null,
        supersededReleaseRegistry,
      ).accept(releaseGatedRecord, tenantAdmin),
    'product_release_not_accepted',
  );
  const first = artifactRegistryRecord({
    artifactId: 'artifact-synthetic-one',
    tenantId: 'synthetic-tenant',
    packageSha256: '1'.repeat(64),
  });
  const second = artifactRegistryRecord({
    artifactId: 'artifact-synthetic-two',
    tenantId: 'synthetic-tenant',
    packageSha256: '2'.repeat(64),
    predecessorArtifactId: first.artifactId,
    predecessorArtifactSha256: first.packageSha256,
  });
  registry.accept(first, tenantAdmin);
  registry.accept(second, tenantAdmin);
  for (const field of [
    'sourceSnapshotSha256',
    'routeInventorySha256',
    'mediaInventorySha256',
    'formInventorySha256',
  ]) {
    assertCode(
      () =>
        registry.accept(
          { ...first, [field]: 'f'.repeat(64) },
          tenantAdmin,
        ),
      'immutable_record_conflict',
    );
  }
  assertCode(
    () =>
      registry.accept(
        {
          ...first,
          hostingClass:
            HostingClass.DYNAMIC_SCALE_TO_ZERO_FRONTEND,
        },
        tenantAdmin,
      ),
    'immutable_record_conflict',
  );
  assertCode(
    () =>
      registry.accept(
        artifactRegistryRecord({
          artifactId: 'artifact-partial-rollback-identity',
          tenantId: 'synthetic-tenant',
          packageSha256: 'e'.repeat(64),
          predecessorArtifactId: first.artifactId,
          predecessorPublicationId: null,
          predecessorArtifactSha256: first.packageSha256,
        }),
        tenantAdmin,
      ),
    'registry_rollback_identity_invalid',
  );
  assertCode(
    () => registry.accept({ ...first, unscoped: true }, tenantAdmin),
    'registry_document_shape_invalid',
  );
  assertCode(
    () =>
      registry.accept(
        artifactRegistryRecord({
          artifactId: 'artifact-cross',
          tenantId: 'other-tenant',
          packageSha256: '3'.repeat(64),
        }),
        tenantAdmin,
      ),
    'cross_tenant_forbidden',
  );
  assertCode(() => registry.read(first.artifactId, otherTenantAdmin), 'cross_tenant_forbidden');
  assert.equal(registry.list(tenantAdmin).length, 2);
  assert.equal(registry.supersede(first.artifactId, second.artifactId, tenantAdmin).status, 'superseded');
  assert.equal(registry.read(first.artifactId, tenantAdmin).registryMetadata.state, 'SUPERSEDED');
  assert.equal(registry.revoke(second.artifactId, tenantAdmin, 'owner-revoked').status, 'revoked');
  assert.equal(registry.read(second.artifactId, superAdmin).registryMetadata.state, 'REVOKED');

  const lineage = publicationArtifactRegistry();
  const lineageFirst = artifactRegistryRecord({
    artifactId: 'artifact-lineage-one',
    tenantId: 'synthetic-tenant',
    packageSha256: 'a'.repeat(64),
  });
  const wrongLineage = artifactRegistryRecord({
    artifactId: 'artifact-lineage-two',
    tenantId: 'synthetic-tenant',
    publicationId: 'publication-other-lineage',
    packageSha256: 'b'.repeat(64),
    predecessorArtifactId: lineageFirst.artifactId,
    predecessorArtifactSha256: lineageFirst.packageSha256,
  });
  lineage.accept(lineageFirst, tenantAdmin);
  assertCode(
    () => lineage.accept(wrongLineage, tenantAdmin),
    'registry_predecessor_lineage_mismatch',
  );
  assertCode(
    () =>
      lineage.accept(
        artifactRegistryRecord({
          artifactId: 'artifact-lineage-wrong-digest',
          tenantId: 'synthetic-tenant',
          packageSha256: 'c'.repeat(64),
          predecessorArtifactId: lineageFirst.artifactId,
          predecessorArtifactSha256: 'd'.repeat(64),
        }),
        tenantAdmin,
    ),
    'registry_predecessor_lineage_mismatch',
  );
  const otherPublicationRollback = artifactRegistryRecord({
    artifactId: 'artifact-other-publication-rollback',
    tenantId: 'synthetic-tenant',
    publicationId: 'publication-other-rollback-lineage',
    packageSha256: 'e'.repeat(64),
  });
  lineage.accept(otherPublicationRollback, tenantAdmin);
  assertCode(
    () =>
      lineage.accept(
        artifactRegistryRecord({
          artifactId: 'artifact-lineage-wrong-rollback',
          tenantId: 'synthetic-tenant',
          packageSha256: 'f'.repeat(64),
          predecessorArtifactId: lineageFirst.artifactId,
          predecessorArtifactSha256:
            lineageFirst.packageSha256,
          rollbackArtifactId:
            otherPublicationRollback.artifactId,
        }),
        tenantAdmin,
      ),
    'registry_rollback_lineage_mismatch',
  );
});

test('file-backed registry commits isolated snapshots through exclusive CAS persistence', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pumpkin-pub30-registry-'));
  const filePath = path.join(directory, 'artifact-registry.json');
  try {
    const releaseRegistry =
      acceptedSyntheticProductReleaseRegistry();
    const seed = publicationArtifactRegistry(
      null,
      releaseRegistry,
    );
    const factory = (document) =>
      publicationArtifactRegistry(
        document,
        releaseRegistry,
      );
    const backed = await FileBackedImmutableRegistry.open(
      filePath,
      factory,
    );
    const initialView = backed.registry;
    assert.equal(initialView.accept, undefined);
    assert.throws(
      () => new FileBackedImmutableRegistry(filePath, seed),
      (error) => error?.code === 'registry_constructor_private',
    );
    assert.equal(
      'writeRegistryFile' in await import('./index.mjs'),
      false,
    );

    seed.accept(
      artifactRegistryRecord({
        artifactId: 'artifact-factory-retained-only',
        tenantId: 'synthetic-tenant',
        packageSha256: '2'.repeat(64),
      }),
      tenantAdmin,
    );
    assert.equal(backed.list(tenantAdmin).length, 0);
    assert.equal(initialView.list(tenantAdmin).length, 0);

    await backed.accept(
      artifactRegistryRecord({
        artifactId: 'artifact-file-backed-one',
        tenantId: 'synthetic-tenant',
        packageSha256: '3'.repeat(64),
      }),
      tenantAdmin,
    );
    assert.equal(initialView.list(tenantAdmin).length, 0);
    assert.equal(backed.registry.list(tenantAdmin).length, 1);
    const firstPersist = await backed.persist();
    const secondPersist = await backed.persist();
    assert.equal(
      firstPersist.documentSha256,
      secondPersist.documentSha256,
    );
    const loaded = await readRegistryFile(filePath);
    assert.equal(loaded.read('artifact-file-backed-one', tenantAdmin).tenantId, 'synthetic-tenant');
    const stale = await FileBackedImmutableRegistry.open(
      filePath,
      factory,
    );
    await backed.accept(
      artifactRegistryRecord({
        artifactId: 'artifact-file-backed-two',
        tenantId: 'synthetic-tenant',
        packageSha256: '4'.repeat(64),
      }),
      tenantAdmin,
    );
    assert.equal((await readRegistryFile(filePath)).list(tenantAdmin).length, 2);
    await assertRejectsCode(
      () =>
        stale.accept(
          artifactRegistryRecord({
            artifactId: 'artifact-file-backed-stale',
            tenantId: 'synthetic-tenant',
            packageSha256: '5'.repeat(64),
          }),
          tenantAdmin,
        ),
      'registry_revision_conflict',
    );
    assert.equal(stale.registry.list(tenantAdmin).length, 1);
    assert.equal((await readRegistryFile(filePath)).list(tenantAdmin).length, 2);

    const documentBeforeLockConflict = backed.toDocument();
    await fs.writeFile(`${filePath}.lock`, 'occupied\n', {
      encoding: 'utf8',
      flag: 'wx',
    });
    await assertRejectsCode(
      () =>
        backed.accept(
          artifactRegistryRecord({
            artifactId: 'artifact-file-backed-lock-conflict',
            tenantId: 'synthetic-tenant',
            packageSha256: '6'.repeat(64),
          }),
          tenantAdmin,
        ),
      'registry_revision_conflict',
    );
    assert.deepEqual(backed.toDocument(), documentBeforeLockConflict);
    await fs.unlink(`${filePath}.lock`);
    assert.deepEqual(
      (await fs.readdir(directory)).sort(),
      ['artifact-registry.json'],
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('registry deserialization rejects forged identities, duplicate records, and cross-scope links', () => {
  const productReleaseRegistry =
    acceptedSyntheticProductReleaseRegistry();
  const registry = publicationArtifactRegistry(
    null,
    productReleaseRegistry,
  );
  registry.accept(
    artifactRegistryRecord({
      artifactId: 'artifact-tenant-a-one',
      tenantId: 'tenant-a',
      packageSha256: '5'.repeat(64),
    }),
    superAdmin,
  );
  registry.accept(
    artifactRegistryRecord({
      artifactId: 'artifact-tenant-b-one',
      tenantId: 'tenant-b',
      packageSha256: '6'.repeat(64),
    }),
    superAdmin,
  );

  const tenantForgery = structuredClone(registry.toDocument());
  tenantForgery.records[0].tenantId = 'tenant-b';
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(tenantForgery),
        productReleaseRegistry,
      ),
    'registry_record_tenant_mismatch',
  );

  const identityForgery = structuredClone(registry.toDocument());
  identityForgery.records[0].recordId = 'artifact-envelope-forgery';
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(identityForgery),
        productReleaseRegistry,
      ),
    'registry_record_identity_mismatch',
  );

  const duplicate = structuredClone(registry.toDocument());
  duplicate.records.push(structuredClone(duplicate.records[0]));
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(duplicate),
        productReleaseRegistry,
      ),
    'registry_record_duplicate',
  );

  const crossTenantLink = structuredClone(registry.toDocument());
  crossTenantLink.supersessions.push({
    predecessorId: 'artifact-tenant-a-one',
    successorId: 'artifact-tenant-b-one',
    linkId: deterministicId('supersession', {
      kind: 'publication-artifact',
      predecessorId: 'artifact-tenant-a-one',
      successorId: 'artifact-tenant-b-one',
    }),
  });
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(crossTenantLink),
        productReleaseRegistry,
      ),
    'registry_supersession_scope_mismatch',
  );

  const missingRevocationTarget = structuredClone(registry.toDocument());
  missingRevocationTarget.revocations.push({
    recordId: 'artifact-missing',
    reasonCode: 'forged-revocation',
    revocationId: deterministicId('revocation', {
      kind: 'publication-artifact',
      id: 'artifact-missing',
      reason: 'forged-revocation',
    }),
  });
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(missingRevocationTarget),
        productReleaseRegistry,
      ),
    'registry_revocation_target_missing',
  );

  const sameTenant = publicationArtifactRegistry(
    null,
    productReleaseRegistry,
  );
  for (const [
    artifactId,
    digest,
    predecessorArtifactId,
    predecessorArtifactSha256,
  ] of [
    ['artifact-tenant-a-two', '7'.repeat(64), null, null],
    [
      'artifact-tenant-a-three',
      '8'.repeat(64),
      'artifact-tenant-a-two',
      '7'.repeat(64),
    ],
  ]) {
    sameTenant.accept(
      artifactRegistryRecord({
        artifactId,
        tenantId: 'tenant-a',
        packageSha256: digest,
        predecessorArtifactId,
        predecessorArtifactSha256,
      }),
      superAdmin,
    );
  }
  const successorAcceptedBeforePredecessor =
    structuredClone(sameTenant.toDocument());
  [
    successorAcceptedBeforePredecessor.events[0],
    successorAcceptedBeforePredecessor.events[1],
  ] = [
    successorAcceptedBeforePredecessor.events[1],
    successorAcceptedBeforePredecessor.events[0],
  ];
  resequenceRegistryEvents(successorAcceptedBeforePredecessor);
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(
          successorAcceptedBeforePredecessor,
        ),
        productReleaseRegistry,
      ),
    'registry_acceptance_event_invalid',
  );
  const stateWithoutEvent = structuredClone(sameTenant.toDocument());
  stateWithoutEvent.supersessions.push({
    predecessorId: 'artifact-tenant-a-two',
    successorId: 'artifact-tenant-a-three',
    linkId: deterministicId('supersession', {
      kind: 'publication-artifact',
      predecessorId: 'artifact-tenant-a-two',
      successorId: 'artifact-tenant-a-three',
    }),
  });
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(stateWithoutEvent),
        productReleaseRegistry,
      ),
    'registry_state_event_missing',
  );

  sameTenant.supersede(
    'artifact-tenant-a-two',
    'artifact-tenant-a-three',
    superAdmin,
  );
  const reorderedEvents = structuredClone(sameTenant.toDocument());
  reorderedEvents.events = [
    reorderedEvents.events.find(
      (event) => event.action === 'record_superseded',
    ),
    ...reorderedEvents.events.filter(
      (event) => event.action !== 'record_superseded',
    ),
  ];
  resequenceRegistryEvents(reorderedEvents);
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(reorderedEvents),
        productReleaseRegistry,
      ),
    'registry_supersession_event_invalid',
  );

  const tenantActorRegistry = publicationArtifactRegistry(
    null,
    productReleaseRegistry,
  );
  tenantActorRegistry.accept(
    artifactRegistryRecord({
      artifactId: 'artifact-tenant-actor-scope',
      tenantId: 'synthetic-tenant',
      packageSha256: '9'.repeat(64),
    }),
    tenantAdmin,
  );
  const forgedActorScope = structuredClone(tenantActorRegistry.toDocument());
  forgedActorScope.events[0].actorTenantId = 'other-tenant';
  resequenceRegistryEvents(forgedActorScope);
  assertCode(
    () =>
      publicationArtifactRegistry(
        resealRegistryDocument(forgedActorScope),
        productReleaseRegistry,
      ),
    'registry_event_actor_scope_invalid',
  );

  const tenantBActor = {
    role: Role.TenantAdmin,
    actorId: 'tenant-b-operator',
    tenantId: 'tenant-b',
  };
  assertCode(
    () =>
      registry.supersede(
        'artifact-tenant-a-one',
        'artifact-tenant-b-one',
        superAdmin,
      ),
    'supersession_scope_mismatch',
  );
  assertCode(
    () =>
      registry.revoke(
        'artifact-tenant-a-one',
        tenantBActor,
        'cross-scope-attempt',
      ),
    'cross_tenant_forbidden',
  );
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
  for (const reference of ['stage/NUL', 'stage/file.']) {
    const unsafePortableReference = baseJobPlan();
    unsafePortableReference.evidenceRefs = [reference];
    assertCode(
      () => createPublicationJob(unsafePortableReference, tenantAdmin),
      'absolute_path_forbidden',
    );
  }
});

test('job state machine resumes blocked, partial, and failed work idempotently', () => {
  let job = startPublicationJob(
    createPublicationJob(
      baseJobPlan({}, 'state-machine'),
      tenantAdmin,
    ),
    tenantAdmin,
  );
  const staleStartedJob = job;
  job = markStepRunning(job, 'tenant-intake', tenantAdmin, 'attempt-intake-one');
  assertCode(
    () =>
      applyStepOutcome(
        staleStartedJob,
        'tenant-intake',
        'blocked',
        {
          actor: tenantAdmin,
          idempotencyKey: 'stale-intake-fork',
          output: {
            reasonCode: 'stale-snapshot-must-fail',
          },
        },
      ),
    'job_store_stale_snapshot',
  );
  job = applyStepOutcome(job, 'tenant-intake', 'blocked', {
    actor: tenantAdmin,
    idempotencyKey: 'attempt-intake-one',
    output: { reasonCode: 'synthetic-dependency' },
  });
  assert.equal(job.state, JobState.BLOCKED);
  const reopenedJobStore =
    new FileBackedPublicationJobStore({
      storeRoot: validationJobStoreRoot,
      repositoryRoot,
    });
  const reopenedHead = reopenedJobStore.open(job.jobId);
  assert.deepEqual(reopenedHead.job, job);
  assert.ok(reopenedHead.revision >= 3);
  job = resumePublicationJob(reopenedHead.job, {
    actor: tenantAdmin,
    jobStore: reopenedJobStore,
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

test('job deserialization rederives exact plans, graphs, attempts, and events', () => {
  const created = createPublicationJob(
    baseJobPlan({}, 'deserialization'),
    tenantAdmin,
  );
  const extraTopLevel = structuredClone(created);
  extraTopLevel.unbounded = true;
  assertCode(
    () => verifyPublicationJob(resealJob(extraTopLevel)),
    'job_shape_invalid',
  );

  const planForgery = structuredClone(created);
  planForgery.plan.artifactId = 'artifact-plan-forgery';
  assertCode(
    () => verifyPublicationJob(resealJob(planForgery)),
    'job_plan_binding_invalid',
  );

  const graphForgery = structuredClone(created);
  graphForgery.steps[0].provider = 'caller-selected-provider';
  assertCode(
    () => verifyPublicationJob(resealJob(graphForgery)),
    'job_step_graph_invalid',
  );

  const actorForgery = structuredClone(created);
  actorForgery.events[0].actorTenantId = 'other-tenant';
  assertCode(
    () => verifyPublicationJob(resealJob(actorForgery)),
    'job_actor_scope_invalid',
  );

  let attempted = startPublicationJob(created, tenantAdmin);
  attempted = applyStepOutcome(
    attempted,
    'tenant-intake',
    'success',
    {
      actor: tenantAdmin,
      idempotencyKey: 'job-tamper-attempt',
      output: { status: 'verified' },
    },
  );
  const attemptForgery = structuredClone(attempted);
  attemptForgery.steps[0].attempts[0].output.status = 'forged';
  assertCode(
    () => verifyPublicationJob(resealJob(attemptForgery)),
    'job_attempt_integrity_invalid',
  );
});

test('job completion, no-op, approval gate, and reverse rollback are explicit', () => {
  let job = startPublicationJob(
    createPublicationJob(
      baseJobPlan({}, 'completion'),
      tenantAdmin,
    ),
    tenantAdmin,
  );
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
  let lastRollbackRequest = null;
  while (job.state === JobState.ROLLING_BACK) {
    const runnable = nextRunnableSteps(job);
    assert.equal(runnable.length, 1);
    lastRollbackRequest = {
      stepKey: runnable[0].key,
      idempotencyKey: `rollback-step-${rollbackSequence + 1}`,
      output: { status: 'restored' },
    };
    job = applyRollbackOutcome(job, runnable[0].key, 'rolled_back', {
      actor: tenantAdmin,
      idempotencyKey: `rollback-step-${++rollbackSequence}`,
      output: lastRollbackRequest.output,
    });
  }
  assert.equal(job.state, JobState.ROLLED_BACK);
  assert.deepEqual(
    beginPublicationRollback(job, {
      actor: tenantAdmin,
      idempotencyKey: 'rollback-job-one',
      reasonCode: 'synthetic-rollback-proof',
    }),
    job,
  );
  assert.deepEqual(
    applyRollbackOutcome(
      job,
      lastRollbackRequest.stepKey,
      'rolled_back',
      {
        actor: tenantAdmin,
        idempotencyKey: lastRollbackRequest.idempotencyKey,
        output: lastRollbackRequest.output,
      },
    ),
    job,
  );

  const allNoop = Object.fromEntries(
    PublicationJobStepDefinitions.map((definition) => [definition.key, 'noop']),
  );
  const noopJob = createPublicationJob(baseJobPlan(allNoop), tenantAdmin);
  assert.equal(noopJob.state, JobState.COMPLETED);
  assert.deepEqual(nextRunnableSteps(noopJob), []);
});

test('rollback failures are bounded, retryable, and strictly replayed', () => {
  let job = startPublicationJob(
    createPublicationJob(
      baseJobPlan({}, 'rollback-retry'),
      tenantAdmin,
    ),
    tenantAdmin,
  );
  let forwardSequence = 0;
  while (job.state !== JobState.COMPLETED) {
    const runnable = nextRunnableSteps(job)[0];
    const stepRecord = job.steps.find(
      (step) => step.key === runnable.key,
    );
    job = applyStepOutcome(job, runnable.key, 'success', {
      actor: tenantAdmin,
      idempotencyKey: `retry-forward-${++forwardSequence}`,
      ...(stepRecord.approvalGate
        ? { approvalRef: stepRecord.approvalGate }
        : {}),
    });
  }
  job = beginPublicationRollback(job, {
    actor: tenantAdmin,
    idempotencyKey: 'retry-rollback-job',
    reasonCode: 'transient-rollback-proof',
  });
  const retryKey = nextRunnableSteps(job)[0].key;
  const staleRollbackHead = job;
  job = applyRollbackOutcome(job, retryKey, 'failed', {
    actor: tenantAdmin,
    idempotencyKey: 'retry-attempt-one',
    output: { status: 'transient-one' },
  });
  assert.equal(job.state, JobState.ROLLING_BACK);
  assert.equal(nextRunnableSteps(job)[0].key, retryKey);
  assertCode(
    () =>
      applyRollbackOutcome(
        staleRollbackHead,
        retryKey,
        'failed',
        {
          actor: tenantAdmin,
          idempotencyKey: 'stale-rollback-fork',
          output: { status: 'stale-fork' },
        },
      ),
    'job_store_stale_snapshot',
  );
  const reopenedRollbackStore =
    new FileBackedPublicationJobStore({
      storeRoot: validationJobStoreRoot,
      repositoryRoot,
    });
  job = applyRollbackOutcome(
    reopenedRollbackStore.read(job.jobId).job,
    retryKey,
    'failed',
    {
      jobStore: reopenedRollbackStore,
    actor: tenantAdmin,
    idempotencyKey: 'retry-attempt-two',
    output: { status: 'transient-two' },
    },
  );
  assert.equal(job.state, JobState.ROLLING_BACK);
  const afterTwoFailures = job;
  job = applyRollbackOutcome(afterTwoFailures, retryKey, 'rolled_back', {
    actor: tenantAdmin,
    idempotencyKey: 'retry-attempt-three',
    output: { status: 'restored' },
  });
  const retriedStep = job.steps.find(
    (step) => step.key === retryKey,
  );
  assert.equal(retriedStep.rollbackAttempts.length, 3);
  assert.deepEqual(
    retriedStep.rollbackAttempts.map(
      (attempt) => attempt.retryDisposition,
    ),
    ['RETRY_READY', 'RETRY_READY', 'COMPLETED'],
  );
  assert.equal(verifyPublicationJob(job), true);
  assert.deepEqual(
    applyRollbackOutcome(job, retryKey, 'failed', {
      actor: tenantAdmin,
      idempotencyKey: 'retry-attempt-one',
      output: { status: 'transient-one' },
    }),
    job,
  );

  let terminalJob = startPublicationJob(
    createPublicationJob(
      baseJobPlan({}, 'rollback-terminal'),
      tenantAdmin,
    ),
    tenantAdmin,
  );
  let terminalForwardSequence = 0;
  while (terminalJob.state !== JobState.COMPLETED) {
    const runnable = nextRunnableSteps(terminalJob)[0];
    const stepRecord = terminalJob.steps.find(
      (step) => step.key === runnable.key,
    );
    terminalJob = applyStepOutcome(
      terminalJob,
      runnable.key,
      'success',
      {
        actor: tenantAdmin,
        idempotencyKey:
          `terminal-forward-${++terminalForwardSequence}`,
        ...(stepRecord.approvalGate
          ? { approvalRef: stepRecord.approvalGate }
          : {}),
      },
    );
  }
  terminalJob = beginPublicationRollback(terminalJob, {
    actor: tenantAdmin,
    idempotencyKey: 'terminal-rollback-job',
    reasonCode: 'terminal-rollback-proof',
  });
  const terminalKey = nextRunnableSteps(terminalJob)[0].key;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    terminalJob = applyRollbackOutcome(
      terminalJob,
      terminalKey,
      'failed',
      {
        actor: tenantAdmin,
        idempotencyKey: `terminal-attempt-${attempt}`,
        output: { status: `failure-${attempt}` },
      },
    );
  }
  assert.equal(terminalJob.state, JobState.ROLLBACK_FAILED);
  assertCode(
    () =>
      applyRollbackOutcome(
        terminalJob,
        terminalKey,
        'failed',
        {
          actor: tenantAdmin,
          idempotencyKey: 'terminal-attempt-four',
          output: { status: 'forbidden-fourth' },
        },
      ),
    'rollback_retry_limit_exceeded',
  );
});

test('job output secret hygiene and approval gates fail closed', () => {
  let job = startPublicationJob(
    createPublicationJob(
      baseJobPlan({}, 'output-hygiene'),
      tenantAdmin,
    ),
    tenantAdmin,
  );
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

test('dry-run and sensitive job actions cannot bypass signed holds', () => {
  const dryRunExecute = baseJobPlan();
  dryRunExecute.stepActions['tenant-intake'] = 'execute';
  assertCode(
    () => createPublicationJob(dryRunExecute, tenantAdmin),
    'job_dry_run_execute_forbidden',
  );

  const liveSensitiveExecute = baseJobPlan();
  liveSensitiveExecute.dryRun = false;
  liveSensitiveExecute.stepActions['resource-plan'] = 'execute';
  assertCode(
    () => createPublicationJob(liveSensitiveExecute, tenantAdmin),
    'job_sensitive_execute_requires_hold',
  );
});

test('held candidate steps remain non-runnable without scoped expiry-bound authority', async () => {
  const jobStore = validationJobStore;
  assertCode(
    () =>
      createPublicationHoldAuthorityVerifier({
        ...holdAuthorityVerifierConfiguration,
        revokedAuthorityIds: [],
      }),
    'hold_verifier_boot_snapshot_mismatch',
  );
  const alternateJobStoreRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'pumpkin-pub30-job-store-'),
  );
  try {
    assertCode(
      () =>
        new FileBackedPublicationJobStore({
          storeRoot: alternateJobStoreRoot,
          repositoryRoot,
        }),
      'job_store_boot_root_mismatch',
    );
  } finally {
    await safeRemovePublicationJobStoreRoot(
      alternateJobStoreRoot,
    );
  }
  const candidatePlans = createCommittedCandidatePlans(
    syntheticRelease(),
    attributionFiles(),
  );
  for (const candidatePlan of candidatePlans) {
    const plan = createPublicationJobPlanForCandidate(candidatePlan);
    const heldKeys = Object.entries(plan.stepActions)
      .filter(([, action]) => action === 'hold')
      .map(([key]) => key);
    assert.ok(heldKeys.length > 0);
    assert.deepEqual(
      Object.keys(plan.holdRequirements).sort(),
      heldKeys.sort(),
    );
    const job = createPublicationJob(plan, superAdmin);
    assert.equal(
      job.steps
        .filter((step) => step.plannedAction === 'hold')
        .some((step) => step.state === StepState.READY),
      false,
    );
    assert.equal(
      nextRunnableSteps(job).some((step) => heldKeys.includes(step.key)),
      false,
    );
  }

  const icePlan = createPublicationJobPlanForCandidate(
    candidatePlans.find(
      (candidate) => candidate.candidateKey === 'ice-rink-rentals',
    ),
  );
  let job = startPublicationJob(
    createPublicationJob(icePlan, superAdmin),
    superAdmin,
  );
  let attempt = 0;
  while (job.state === JobState.RUNNING) {
    const runnable = nextRunnableSteps(job);
    if (runnable.length === 0) break;
    const stepRecord = job.steps.find(
      (step) => step.key === runnable[0].key,
    );
    assert.notEqual(stepRecord.plannedAction, 'hold');
    job = applyStepOutcome(job, stepRecord.key, 'success', {
      actor: superAdmin,
      idempotencyKey: `candidate-advance-${++attempt}`,
      ...(stepRecord.approvalGate
        ? { approvalRef: stepRecord.approvalGate }
        : {}),
    });
  }
  assert.equal(job.state, JobState.BLOCKED);
  const held = job.steps.find((step) => step.state === StepState.BLOCKED);
  assert.equal(held.key, 'resource-plan');
  assert.deepEqual(nextRunnableSteps(job), []);
  job = jobStore.initialize(job);
  assert.equal(jobStore.describe().currentHeadCas, true);
  assert.equal(
    jobStore.describe().authorityHashConsumptionLedger,
    true,
  );
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-no-authority',
        reasonCode: 'owner-review-complete',
      }),
    'hold_authority_required',
  );
  const unsignedTrustAuthority = holdAuthorityFor(job, held);
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-no-verifier',
        reasonCode: 'owner-review-complete',
        approvalAuthority: unsignedTrustAuthority,
      }),
    'hold_authority_verifier_required',
  );
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-fake-verifier',
        reasonCode: 'owner-review-complete',
        approvalAuthority: unsignedTrustAuthority,
        holdAuthorityVerifier: Object.freeze({
          describe: () => holdAuthorityVerifier.describe(),
        }),
      }),
    'hold_authority_verifier_required',
  );
  const wrongHoldKey = generateKeyPairSync('ed25519');
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-wrong-signature',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(
          job,
          held,
          {},
          {
            keyPair: wrongHoldKey,
            keyId: holdAuthorityVerifierConfiguration.keyId,
          },
        ),
        holdAuthorityVerifier,
      }),
    'hold_authority_signature_invalid',
  );
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-revoked-authority',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(job, held, {
          authorityId: 'authority-revoked-resource-plan',
        }),
        holdAuthorityVerifier,
      }),
    'hold_authority_revoked',
  );
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-wrong-scope',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(job, held, {
          scope: {
            ...held.holdRequirement.scope,
            artifactId: job.artifactId,
            jobId: job.jobId,
            planHash: job.planHash,
            tenantId: 'wrong-tenant',
          },
        }),
        holdAuthorityVerifier,
      }),
    'hold_authority_scope_invalid',
  );
  for (const scopeOverride of [
    { artifactId: 'artifact-wrong-scope' },
    { jobId: 'publication-job-wrong-scope' },
    { planHash: '0'.repeat(64) },
  ]) {
    assertCode(
      () =>
        resumePublicationJob(job, {
          actor: superAdmin,
          stepKey: held.key,
          idempotencyKey: `hold-scope-${Object.keys(
            scopeOverride,
          )[0]}`,
          reasonCode: 'owner-review-complete',
          approvalAuthority: holdAuthorityFor(job, held, {
            scope: {
              ...held.holdRequirement.scope,
              artifactId: job.artifactId,
              jobId: job.jobId,
              planHash: job.planHash,
              ...scopeOverride,
            },
          }),
          holdAuthorityVerifier,
        }),
      'hold_authority_scope_invalid',
    );
  }
  const expiredTime = new Date(Date.now() - 120_000);
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-expired',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(job, held, {
          issuedAt: new Date(expiredTime.getTime() - 60_000).toISOString(),
          expiresAt: expiredTime.toISOString(),
        }),
        holdAuthorityVerifier,
      }),
    'hold_authority_expiry_invalid',
  );
  assertCode(
    () => {
      const scopedTenantAdmin = {
        role: Role.TenantAdmin,
        actorId: 'tenant-admin-hold-forgery',
        tenantId: job.tenantId,
      };
      return (
      resumePublicationJob(job, {
        actor: scopedTenantAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-tenant-admin-forgery',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(job, held, {
          approvedBy: scopedTenantAdmin.actorId,
        }),
        holdAuthorityVerifier,
      })
      );
    },
    'hold_authority_action_invalid',
  );
  const authorityWithExtraField = holdAuthorityFor(job, held);
  authorityWithExtraField.unboundedDelegation = true;
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: held.key,
        idempotencyKey: 'hold-extra-authority-field',
        reasonCode: 'owner-review-complete',
        approvalAuthority: authorityWithExtraField,
        holdAuthorityVerifier,
      }),
    'hold_authority_shape_invalid',
  );

  const firstHoldAuthority = holdAuthorityFor(job, held);
  historicalHeldAuthorityId =
    firstHoldAuthority.authorityId;
  const stalePreResumeJob = job;
  job = resumePublicationJob(job, {
    actor: superAdmin,
    jobStore,
    stepKey: held.key,
    idempotencyKey: 'hold-valid-authority',
    reasonCode: 'owner-review-complete',
    approvalAuthority: firstHoldAuthority,
    holdAuthorityVerifier,
  });
  assert.equal(nextRunnableSteps(job)[0].key, 'resource-plan');
  assert.equal(nextRunnableSteps(job)[0].operation, 'verify');
  assertCode(
    () =>
      resumePublicationJob(stalePreResumeJob, {
        actor: superAdmin,
        jobStore,
        stepKey: held.key,
        idempotencyKey: 'hold-stale-snapshot-replay',
        reasonCode: 'owner-review-complete',
        approvalAuthority: firstHoldAuthority,
        holdAuthorityVerifier,
      }),
    'job_store_stale_snapshot',
  );
  const forgedStoredReceipt = structuredClone(job);
  const forgedStep = forgedStoredReceipt.steps.find(
    (step) => step.key === held.key,
  );
  const forgedResume = forgedStep.resumes[0];
  const signature = forgedResume.holdAuthority.signatureBase64;
  forgedResume.holdAuthority.signatureBase64 =
    `${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
  forgedResume.holdAuthoritySha256 = canonicalDigest(
    forgedResume.holdAuthority,
  );
  forgedResume.requestDigest = canonicalDigest({
    jobId: forgedStoredReceipt.jobId,
    stepKey: forgedStep.key,
    idempotencyKey: forgedResume.idempotencyKey,
    reasonCode: forgedResume.reasonCode,
    actorId: forgedResume.actorId,
    actorRole: forgedResume.actorRole,
    actorTenantId: forgedResume.actorTenantId,
    holdAuthorityId: forgedResume.holdAuthorityId,
    holdAuthoritySha256: forgedResume.holdAuthoritySha256,
    releasedAction: forgedResume.releasedAction,
  });
  const forgedResumeEvent = forgedStoredReceipt.events.find(
    (event) =>
      event.action === 'step_resumed' &&
      event.stepKey === forgedStep.key,
  );
  forgedResumeEvent.detail = structuredClone(forgedResume);
  forgedResumeEvent.eventId = deterministicId('job-event', {
    jobId: forgedStoredReceipt.jobId,
    sequence: forgedResumeEvent.sequence,
    action: forgedResumeEvent.action,
    stepKey: forgedResumeEvent.stepKey,
    actorId: forgedResumeEvent.actorId,
    actorRole: forgedResumeEvent.actorRole,
    actorTenantId: forgedResumeEvent.actorTenantId,
    detail: forgedResumeEvent.detail,
  });
  assertCode(
    () => verifyPublicationJob(resealJob(forgedStoredReceipt)),
    'job_resume_authority_signature_invalid',
  );
  assertCode(
    () =>
      applyStepOutcome(job, 'resource-plan', 'success', {
        actor: superAdmin,
        jobStore,
        operation: 'verify',
        idempotencyKey: 'resource-plan-approved-outcome',
        approvalRef: held.approvalGate,
      }),
    'hold_release_step_not_started',
  );
  job = markStepRunning(
    job,
    'resource-plan',
    superAdmin,
    'resource-plan-approved-outcome',
    {
      jobStore,
      operation: 'verify',
    },
  );
  job = applyStepOutcome(job, 'resource-plan', 'success', {
    actor: superAdmin,
    jobStore,
    operation: 'verify',
    idempotencyKey: 'resource-plan-approved-outcome',
    approvalRef: held.approvalGate,
  });
  const resumeReplay = resumePublicationJob(job, {
    actor: superAdmin,
    jobStore,
    stepKey: held.key,
    idempotencyKey: 'hold-valid-authority',
    reasonCode: 'owner-review-complete',
    approvalAuthority: firstHoldAuthority,
    holdAuthorityVerifier,
  });
  assert.deepEqual(resumeReplay, job);
  assert.equal(job.state, JobState.BLOCKED);
  historicalHeldJobId = job.jobId;
  const nextHeld = job.steps.find(
    (step) => step.key === 'publication-register',
  );
  assert.equal(nextHeld.state, StepState.BLOCKED);
  assertCode(
    () =>
      resumePublicationJob(job, {
        actor: superAdmin,
        stepKey: nextHeld.key,
        idempotencyKey: 'hold-reused-authority-id',
        reasonCode: 'owner-review-complete',
        approvalAuthority: holdAuthorityFor(job, nextHeld, {
          authorityId: firstHoldAuthority.authorityId,
        }),
        holdAuthorityVerifier,
      }),
    'hold_authority_replay_forbidden',
  );

  const advanceCandidateToFirstHold = (
    candidateKey,
    idempotencyPrefix,
  ) => {
    const candidatePlan = createPublicationJobPlanForCandidate(
      candidatePlans.find(
        (candidate) =>
          candidate.candidateKey === candidateKey,
      ),
    );
    let candidateJob = startPublicationJob(
      createPublicationJob(candidatePlan, superAdmin),
      superAdmin,
    );
    let sequence = 0;
    while (candidateJob.state === JobState.RUNNING) {
      const runnable = nextRunnableSteps(candidateJob);
      if (runnable.length === 0) break;
      const stepRecord = candidateJob.steps.find(
        (step) => step.key === runnable[0].key,
      );
      candidateJob = applyStepOutcome(
        candidateJob,
        stepRecord.key,
        'success',
        {
          actor: superAdmin,
          idempotencyKey:
            `${idempotencyPrefix}-${++sequence}`,
          ...(stepRecord.approvalGate
            ? { approvalRef: stepRecord.approvalGate }
            : {}),
        },
      );
    }
    assert.equal(candidateJob.state, JobState.BLOCKED);
    return candidateJob;
  };

  const realDateNow = Date.now;
  let syntheticNow = realDateNow();
  Date.now = () => syntheticNow;
  try {
    let expiresBeforeStart = advanceCandidateToFirstHold(
      'party-pros-philadelphia',
      'expiry-before-start',
    );
    expiresBeforeStart = jobStore.initialize(
      expiresBeforeStart,
    );
    const startHeld = expiresBeforeStart.steps.find(
      (step) => step.state === StepState.BLOCKED,
    );
    expiresBeforeStart = resumePublicationJob(
      expiresBeforeStart,
      {
        actor: superAdmin,
        jobStore,
        stepKey: startHeld.key,
        idempotencyKey: 'expiry-resume-before-start',
        reasonCode: 'expiry-transition-proof',
        approvalAuthority: holdAuthorityFor(
          expiresBeforeStart,
          startHeld,
          {
            authorityId:
              'authority-expiry-before-start',
          },
        ),
        holdAuthorityVerifier,
      },
    );
    syntheticNow += 3_600_001;
    assertCode(
      () => nextRunnableSteps(expiresBeforeStart),
      'hold_release_authority_inactive',
    );
    assertCode(
      () =>
        markStepRunning(
          expiresBeforeStart,
          startHeld.key,
          superAdmin,
          'expiry-start-attempt',
          { jobStore, operation: 'verify' },
        ),
      'hold_release_authority_inactive',
    );
    assert.deepEqual(
      jobStore.assertCurrent(expiresBeforeStart),
      expiresBeforeStart,
    );

    let expiresBeforeOutcome = advanceCandidateToFirstHold(
      'strip-club-near-me-vegas',
      'expiry-before-outcome',
    );
    expiresBeforeOutcome = jobStore.initialize(
      expiresBeforeOutcome,
    );
    const outcomeHeld = expiresBeforeOutcome.steps.find(
      (step) => step.state === StepState.BLOCKED,
    );
    expiresBeforeOutcome = resumePublicationJob(
      expiresBeforeOutcome,
      {
        actor: superAdmin,
        jobStore,
        stepKey: outcomeHeld.key,
        idempotencyKey: 'expiry-resume-before-outcome',
        reasonCode: 'expiry-transition-proof',
        approvalAuthority: holdAuthorityFor(
          expiresBeforeOutcome,
          outcomeHeld,
          {
            authorityId:
              'authority-expiry-before-outcome',
          },
        ),
        holdAuthorityVerifier,
      },
    );
    expiresBeforeOutcome = markStepRunning(
      expiresBeforeOutcome,
      outcomeHeld.key,
      superAdmin,
      'expiry-outcome-attempt',
      { jobStore, operation: 'verify' },
    );
    const attemptsBeforeExpiry =
      expiresBeforeOutcome.steps.find(
        (step) => step.key === outcomeHeld.key,
      ).attempts.length;
    syntheticNow += 3_600_001;
    assertCode(
      () =>
        applyStepOutcome(
          expiresBeforeOutcome,
          outcomeHeld.key,
          'success',
          {
            actor: superAdmin,
            jobStore,
            operation: 'verify',
            idempotencyKey: 'expiry-outcome-attempt',
            approvalRef: outcomeHeld.approvalGate,
          },
        ),
      'hold_release_authority_inactive',
    );
    assert.equal(
      jobStore.assertCurrent(
        expiresBeforeOutcome,
      ).steps.find(
        (step) => step.key === outcomeHeld.key,
      ).attempts.length,
      attemptsBeforeExpiry,
    );
    expiresBeforeOutcome = applyStepOutcome(
      expiresBeforeOutcome,
      outcomeHeld.key,
      'failed',
      {
        actor: superAdmin,
        jobStore,
        idempotencyKey: 'expiry-outcome-attempt',
        output: {
          reasonCode: 'authority-expired-before-outcome',
        },
      },
    );
    assert.equal(expiresBeforeOutcome.state, JobState.FAILED);
  } finally {
    Date.now = realDateNow;
  }

  assertCode(
    () =>
      createPublicationJob(
        baseJobPlan({ 'resource-plan': 'hold' }),
        tenantAdmin,
      ),
    'hold_requirement_missing',
  );
  const omittedSensitiveActions = baseJobPlan();
  omittedSensitiveActions.stepActions = {};
  assertCode(
    () =>
      createPublicationJob(omittedSensitiveActions, tenantAdmin),
    'hold_requirement_missing',
  );
});

test('durable jobs preserve signed hold-receipt history across a newer revocation snapshot', async () => {
  assert.ok(historicalHeldJobId);
  assert.ok(historicalHeldAuthorityId);
  const nextVerifierConfiguration = {
    ...holdAuthorityVerifierConfiguration,
    revocationSnapshotId:
      'synthetic-hold-revocations-next',
    revokedAuthorityIds: [
      ...holdAuthorityVerifierConfiguration
        .revokedAuthorityIds,
      historicalHeldAuthorityId,
    ].sort((left, right) =>
      left.localeCompare(right, 'en'),
    ),
  };
  const jobsModuleUrl = pathToFileURL(
    path.join(toolRoot, 'src', 'jobs.mjs'),
  ).href;
  const script = `
    const module = await import(${JSON.stringify(
      jobsModuleUrl,
    )});
    const verifierConfiguration = JSON.parse(
      process.env.PUMPKIN_HISTORICAL_HOLD_VERIFIER,
    );
    module.createPublicationHoldAuthorityVerifier(
      verifierConfiguration,
    );
    const store = new module.FileBackedPublicationJobStore({
      storeRoot:
        process.env.PUMPKIN_PUBLICATION_JOB_STORE_ROOT,
      repositoryRoot:
        process.env.PUMPKIN_HISTORICAL_REPOSITORY_ROOT,
    });
    const opened = store.open(
      process.env.PUMPKIN_HISTORICAL_JOB_ID,
    );
    if (!module.verifyPublicationJob(opened.job)) {
      throw new Error('historical job verification failed');
    }
    process.stdout.write('historical-open-ok');
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ['--input-type=module', '--eval', script],
    {
      encoding: 'utf8',
      windowsHide: true,
      env: {
        ...process.env,
        PUMPKIN_HOLD_AUTHORITY_VERIFIER_SHA256:
          bootCanonicalDigest(
            nextVerifierConfiguration,
          ),
        PUMPKIN_HISTORICAL_HOLD_VERIFIER:
          JSON.stringify(nextVerifierConfiguration),
        PUMPKIN_HISTORICAL_REPOSITORY_ROOT:
          repositoryRoot,
        PUMPKIN_HISTORICAL_JOB_ID:
          historicalHeldJobId,
      },
    },
  );
  assert.equal(stdout, 'historical-open-ok');
});

test('publication-job store explicitly recovers exact orphan heads and paired authority claims', async () => {
  const stoppedPid = 2_147_483_647;
  assert.throws(
    () => process.kill(stoppedPid, 0),
    (error) => error?.code === 'ESRCH',
  );
  const buildHeldJob = (identitySuffix) => {
    const plan = baseJobPlan(
      { 'resource-plan': 'hold' },
      identitySuffix,
    );
    plan.holdRequirements = {
      'resource-plan': {
        approvalRef:
          `owner-resource-plan-${identitySuffix}`,
        scope: {
          tenantId: plan.tenantId,
          publicationId: plan.publicationId,
          releaseId: plan.releaseId,
          stepKey: 'resource-plan',
        },
        action: 'release-hold',
        onReleaseAction: 'verify',
        maxValiditySeconds: 3600,
      },
    };
    let job = startPublicationJob(
      createPublicationJob(plan, superAdmin),
      superAdmin,
      { jobStore: validationJobStore },
    );
    let sequence = 0;
    while (job.state === JobState.RUNNING) {
      const runnable = nextRunnableSteps(job);
      if (runnable.length === 0) break;
      job = applyStepOutcome(
        job,
        runnable[0].key,
        'success',
        {
          actor: superAdmin,
          jobStore: validationJobStore,
          idempotencyKey:
            `${identitySuffix}-advance-${++sequence}`,
        },
      );
    }
    assert.equal(job.state, JobState.BLOCKED);
    assert.equal(
      job.steps.find(
        (step) => step.state === StepState.BLOCKED,
      ).key,
      'resource-plan',
    );
    return job;
  };
  const consumptionFor = (job, stepKey) => {
    const resume = job.steps
      .find((step) => step.key === stepKey)
      .resumes.at(-1);
    return {
      authorityId: resume.holdAuthorityId,
      authoritySha256: resume.holdAuthoritySha256,
      stepKey,
      resumeId: resume.resumeId,
      requestDigest: resume.requestDigest,
      verifierKeyId: resume.holdVerifierKeyId,
      revocationSnapshotId:
        resume.holdRevocationSnapshotId,
    };
  };
  const simulateInterruptedHead = async (
    previous,
    successor,
  ) => {
    const head =
      validationJobStore.read(successor.jobId);
    const fileName =
      `${String(head.revision).padStart(8, '0')}-` +
      `${successor.integritySha256}.json`;
    const jobDirectory = path.join(
      validationJobStoreRoot,
      'jobs',
      successor.jobId,
    );
    const temporaryPath = path.join(
      jobDirectory,
      `.${fileName}.${stoppedPid}.` +
        `${'a'.repeat(24)}.tmp`,
    );
    await fs.rename(
      path.join(jobDirectory, fileName),
      temporaryPath,
    );
    const lockPath = path.join(
      validationJobStoreRoot,
      'locks',
      `${successor.jobId}.lock`,
    );
    await fs.writeFile(
      lockPath,
      `${stoppedPid}\n`,
      { encoding: 'utf8', flag: 'wx', mode: 0o600 },
    );
    return { lockPath, temporaryPath };
  };

  const zeroWritePrevious = createPublicationJob(
    baseJobPlan({}, 'reconcile-zero-write'),
    tenantAdmin,
  );
  const zeroWriteSuccessor = startPublicationJob(
    zeroWritePrevious,
    tenantAdmin,
    { jobStore: validationJobStore },
  );
  const zeroWriteHead = validationJobStore.read(
    zeroWriteSuccessor.jobId,
  );
  const zeroWriteHeadPath = path.join(
    validationJobStoreRoot,
    'jobs',
    zeroWriteSuccessor.jobId,
    `${String(zeroWriteHead.revision).padStart(8, '0')}-` +
      `${zeroWriteSuccessor.integritySha256}.json`,
  );
  await fs.unlink(zeroWriteHeadPath);
  const zeroWriteLockPath = path.join(
    validationJobStoreRoot,
    'locks',
    `${zeroWriteSuccessor.jobId}.lock`,
  );
  await fs.writeFile(
    zeroWriteLockPath,
    `${stoppedPid}\n`,
    { encoding: 'utf8', flag: 'wx', mode: 0o600 },
  );
  const zeroWriteRecovered =
    validationJobStore.reconcileInterruptedTransition(
      zeroWritePrevious,
      zeroWriteSuccessor,
    );
  assert.deepEqual(
    zeroWriteRecovered,
    zeroWritePrevious,
  );
  assert.deepEqual(
    validationJobStore.read(
      zeroWritePrevious.jobId,
    ).job,
    zeroWritePrevious,
  );
  await assert.rejects(
    fs.lstat(zeroWriteLockPath),
    (error) => error?.code === 'ENOENT',
  );
  assert.deepEqual(
    startPublicationJob(
      zeroWritePrevious,
      tenantAdmin,
      { jobStore: validationJobStore },
    ),
    zeroWriteSuccessor,
  );

  const previous = buildHeldJob(
    'reconcile-exact-orphan',
  );
  const heldStep = previous.steps.find(
    (step) => step.state === StepState.BLOCKED,
  );
  const successor = resumePublicationJob(previous, {
    actor: superAdmin,
    jobStore: validationJobStore,
    stepKey: heldStep.key,
    idempotencyKey: 'reconcile-exact-resume',
    reasonCode: 'verified-interruption-witness',
    approvalAuthority: holdAuthorityFor(
      previous,
      heldStep,
      {
        authorityId:
          'authority-reconcile-exact-orphan',
      },
    ),
    holdAuthorityVerifier,
  });
  const recoveryEvidence =
    await simulateInterruptedHead(
      previous,
      successor,
    );
  assertCode(
    () => validationJobStore.read(successor.jobId),
    'job_store_corrupt',
  );
  const recovered =
    validationJobStore.reconcileInterruptedTransition(
      previous,
      successor,
      {
        authorityConsumption: consumptionFor(
          successor,
          heldStep.key,
        ),
      },
    );
  assert.deepEqual(recovered, successor);
  assert.deepEqual(
    validationJobStore.read(successor.jobId).job,
    successor,
  );
  await assert.rejects(
    fs.lstat(recoveryEvidence.lockPath),
    (error) => error?.code === 'ENOENT',
  );
  await assert.rejects(
    fs.lstat(recoveryEvidence.temporaryPath),
    (error) => error?.code === 'ENOENT',
  );

  const runningSuccessor = markStepRunning(
    successor,
    heldStep.key,
    superAdmin,
    'reconcile-post-link-start',
    {
      jobStore: validationJobStore,
      operation: 'verify',
    },
  );
  const runningHead = validationJobStore.read(
    runningSuccessor.jobId,
  );
  const runningFileName =
    `${String(runningHead.revision).padStart(8, '0')}-` +
    `${runningSuccessor.integritySha256}.json`;
  const runningDirectory = path.join(
    validationJobStoreRoot,
    'jobs',
    runningSuccessor.jobId,
  );
  const runningFinalPath = path.join(
    runningDirectory,
    runningFileName,
  );
  const postLinkTemporaryPath = path.join(
    runningDirectory,
    `.${runningFileName}.${stoppedPid}.` +
      `${'b'.repeat(24)}.tmp`,
  );
  await fs.link(
    runningFinalPath,
    postLinkTemporaryPath,
  );
  const postLinkLockPath = path.join(
    validationJobStoreRoot,
    'locks',
    `${runningSuccessor.jobId}.lock`,
  );
  await fs.writeFile(
    postLinkLockPath,
    `${stoppedPid}\n`,
    { encoding: 'utf8', flag: 'wx', mode: 0o600 },
  );
  const postLinkRecovered =
    validationJobStore.reconcileInterruptedTransition(
      successor,
      runningSuccessor,
    );
  assert.deepEqual(postLinkRecovered, runningSuccessor);
  assert.equal(
    (await fs.lstat(runningFinalPath)).nlink,
    1,
  );
  await assert.rejects(
    fs.lstat(postLinkTemporaryPath),
    (error) => error?.code === 'ENOENT',
  );
  await assert.rejects(
    fs.lstat(postLinkLockPath),
    (error) => error?.code === 'ENOENT',
  );

  const unpairedPrevious = buildHeldJob(
    'reconcile-unpaired-claim',
  );
  const unpairedStep = unpairedPrevious.steps.find(
    (step) => step.state === StepState.BLOCKED,
  );
  const unpairedSuccessor = resumePublicationJob(
    unpairedPrevious,
    {
      actor: superAdmin,
      jobStore: validationJobStore,
      stepKey: unpairedStep.key,
      idempotencyKey: 'reconcile-unpaired-resume',
      reasonCode: 'unpaired-claim-proof',
      approvalAuthority: holdAuthorityFor(
        unpairedPrevious,
        unpairedStep,
        {
          authorityId:
            'authority-reconcile-unpaired',
        },
      ),
      holdAuthorityVerifier,
    },
  );
  const unpairedConsumption = consumptionFor(
    unpairedSuccessor,
    unpairedStep.key,
  );
  const unpairedEvidence =
    await simulateInterruptedHead(
      unpairedPrevious,
      unpairedSuccessor,
    );
  await fs.unlink(
    path.join(
      validationJobStoreRoot,
      'authority-hashes',
      `${unpairedConsumption.authoritySha256}.json`,
    ),
  );
  assertCode(
    () =>
      validationJobStore.reconcileInterruptedTransition(
        unpairedPrevious,
        unpairedSuccessor,
        {
          authorityConsumption:
            unpairedConsumption,
        },
      ),
    'job_store_reconciliation_required',
  );
  assert.equal(
    (await fs.readFile(
      unpairedEvidence.lockPath,
      'utf8',
    )),
    `${stoppedPid}\n`,
  );
  assert.equal(
    (await fs.lstat(
      unpairedEvidence.temporaryPath,
    )).isFile(),
    true,
  );

  const partialPrevious = buildHeldJob(
    'reconcile-partial-claim-lock',
  );
  const partialStep = partialPrevious.steps.find(
    (step) => step.state === StepState.BLOCKED,
  );
  const partialAuthority = holdAuthorityFor(
    partialPrevious,
    partialStep,
    {
      authorityId:
        'authority-reconcile-partial-claim',
    },
  );
  const partialAuthoritySha256 =
    canonicalDigest(partialAuthority);
  const originalLinkSync = nodeFs.linkSync;
  nodeFs.linkSync = (sourcePath, targetPath) => {
    if (
      path.dirname(targetPath) ===
        path.join(
          validationJobStoreRoot,
          'authority-hashes',
        ) &&
      path.basename(targetPath) ===
        `${partialAuthoritySha256}.json`
    ) {
      const interruption = new Error(
        'synthetic authority hash-ledger interruption',
      );
      interruption.code =
        'SYNTHETIC_AUTHORITY_HASH_INTERRUPTION';
      throw interruption;
    }
    return originalLinkSync(sourcePath, targetPath);
  };
  try {
    assertCode(
      () =>
        resumePublicationJob(partialPrevious, {
          actor: superAdmin,
          jobStore: validationJobStore,
          stepKey: partialStep.key,
          idempotencyKey:
            'reconcile-partial-claim-resume',
          reasonCode:
            'partial-claim-lock-retention-proof',
          approvalAuthority: partialAuthority,
          holdAuthorityVerifier,
        }),
      'job_store_reconciliation_required',
    );
  } finally {
    nodeFs.linkSync = originalLinkSync;
  }
  const partialLockPath = path.join(
    validationJobStoreRoot,
    'locks',
    `${partialPrevious.jobId}.lock`,
  );
  assert.equal(
    await fs.readFile(partialLockPath, 'utf8'),
    `${process.pid}\n`,
  );
  const partialAuthorityIdPath = path.join(
    validationJobStoreRoot,
    'authority-ids',
    `${sha256(
      Buffer.from(
        partialAuthority.authorityId,
        'utf8',
      ),
    )}.json`,
  );
  assert.equal(
    (await fs.lstat(partialAuthorityIdPath)).isFile(),
    true,
  );
  await assert.rejects(
    fs.lstat(
      path.join(
        validationJobStoreRoot,
        'authority-hashes',
        `${partialAuthoritySha256}.json`,
      ),
    ),
    (error) => error?.code === 'ENOENT',
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

test('DPAPI deployment is held without privileged helper trust and rejects plaintext or runner injection', async () => {
  const reference = credentialReference();
  assert.equal(verifyCredentialReference(reference), true);
  const unsafeEnvironmentReference = rawCredentialReferenceFrom(reference);
  unsafeEnvironmentReference.environmentVariableName = 'PATH';
  assertCode(
    () => normalizeCredentialReference(unsafeEnvironmentReference),
    'credential_metadata_invalid',
  );
  for (const material of ['opaque-material', { nested: 'opaque-material' }, () => 'opaque-material']) {
    assertCode(
      () =>
        normalizeCredentialReference({
          ...rawCredentialReferenceFrom(reference),
          material,
        }),
      'credential_contract_field_forbidden',
    );
    assertCode(
      () => verifyCredentialReference({ ...reference, material }),
      'credential_contract_field_forbidden',
    );
  }
  let legacyDecryptCalled = false;
  assertCode(
    () =>
      new CurrentUserDpapiCredentialProvider({
        reference,
        decryptForChild: () => {
          legacyDecryptCalled = true;
          return 'synthetic-secret-material';
        },
      }),
    'credential_plaintext_callback_forbidden',
  );
  assert.equal(legacyDecryptCalled, false);
  let injectedRunnerCalled = false;
  assertCode(
    () =>
      new CurrentUserDpapiCredentialProvider({
        reference,
        auditedHelper: auditedHelperConfig('a'.repeat(64)),
        repositoryRoot,
        processRunner: () => {
          injectedRunnerCalled = true;
        },
      }),
    'credential_audited_helper_trust_anchor_unconfigured',
  );
  assert.equal(injectedRunnerCalled, false);

  const provider = new CurrentUserDpapiCredentialProvider({ reference });
  assert.equal(provider.describe().status, 'DESIGN_HELD_TRUST_ANCHOR_UNCONFIGURED');
  assert.equal(provider.describe().helperTrustAnchorConfigured, false);
  assert.equal(provider.describe().executionAvailable, false);
  assert.equal(provider.describe().childEnvironmentOnly, false);
  assert.equal(
    provider.describe().envelopeMetadataId,
    reference.envelopeMetadataId,
  );
  assert.equal(
    provider.describe().envelopeSha256,
    reference.envelopeSha256,
  );
  assert.equal(
    AuditedDpapiSwaHelperContract.executionBuiltIn,
    false,
  );
  assert.equal(
    AuditedDpapiSwaHelperContract.trustAnchorConfigured,
    false,
  );
  assertCode(
    () => provider.auditedHelperContract(),
    'credential_audited_helper_trust_anchor_unconfigured',
  );
  assertCode(
    () => provider.childEnvironmentContract({ executable: 'cmd.exe' }),
    'credential_audited_helper_trust_anchor_unconfigured',
  );
  await assertRejectsCode(
    () => provider.runChild({}),
    'credential_audited_helper_trust_anchor_unconfigured',
  );
  let injectedSpawnCalled = false;
  await assertRejectsCode(
    () =>
      provider.runChild({}, () => {
        injectedSpawnCalled = true;
      }),
    'credential_spawn_injection_forbidden',
  );
  assert.equal(injectedSpawnCalled, false);
  assertCode(() => provider.rotate(), 'credential_rotation_unsupported');
  const descriptor = createCurrentPowerShellAdapterDescriptor();
  assert.equal(descriptor.executionBuiltIn, false);
  assert.equal(descriptor.helperTrustAnchorConfigured, false);
});

test('explicit deployment service covers the full bounded lifecycle', async () => {
  const workspace = await createExactDeploymentWorkspace();
  const adapter = workspace.createAdapter();
  try {
    const provider = createSyntheticSealedDeploymentProvider(workspace);
    const service = new AzureStaticWebAppDeploymentService({
      adapter,
      credentialProvider: provider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot: workspace.operationLedgerRoot,
      repositoryRoot: workspace.root,
    });
    const { context } = workspace;

    await service.readResource(context);
    const createAuthority = workspace.authorityFor(
      'create-or-reuse',
      { sku: 'Free' },
    );
    const created = await service.createOrReuse(
      context,
      createAuthority,
    );
    const replayAdapter = workspace.createAdapter();
    const replayService = new AzureStaticWebAppDeploymentService({
      adapter: replayAdapter,
      credentialProvider:
        createSyntheticSealedDeploymentProvider(workspace),
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot: workspace.operationLedgerRoot,
      repositoryRoot: workspace.root,
    });
    const replayed = await replayService.createOrReuse(
      context,
      createAuthority,
    );
    assert.deepEqual(replayed, created);
    assert.equal(replayAdapter.events().length, 0);
    assert.equal(replayService.journal().length, 0);
    const tags = { tenant: 'synthetic-tenant' };
    await service.tagResource(
      context,
      tags,
      workspace.authorityFor('tag', { tags }),
    );
    const publicationRecord = {
      publicationId: context.publicationId,
      state: 'READY',
    };
    await service.registerPublication(
      context,
      publicationRecord,
      workspace.authorityFor('register', {
        record: publicationRecord,
      }),
    );
    const deployed = await service.deployExactArtifact(
      context,
      workspace.deployment,
      workspace.authorityFor('deploy', workspace.deployment),
    );
    assert.equal(deployed.statusCode, 'deployed');
    assert.equal(
      deployed.metadata.stagedInventorySha256,
      workspace.deployment.stagedInventorySha256,
    );
    await service.verifyDeployment(context, {
      packageSha256: workspace.deployment.packageSha256,
      manifestSha256: workspace.deployment.manifestSha256,
    });
    const publicationUpdate = {
      state: 'ACTIVE',
      indexingEnabled: false,
    };
    await service.updatePublication(
      context,
      publicationUpdate,
      workspace.authorityFor('update', {
        update: publicationUpdate,
      }),
    );
    assert.notEqual(
      workspace.rollback.predecessorReleaseId,
      context.releaseId,
    );
    const rollbackAuthority = workspace.authorityFor('rollback', {
      ...workspace.rollback,
      automatic: false,
    });
    assert.equal(
      rollbackAuthority.predecessorReleaseId,
      workspace.rollback.predecessorReleaseId,
    );
    const rolledBack = await service.rollback(
      context,
      workspace.rollback,
      rollbackAuthority,
    );
    assert.equal(rolledBack.statusCode, 'rolled-back');
    assert.equal(
      rolledBack.metadata.deploymentIdentity.releaseId,
      workspace.rollback.predecessorReleaseId,
    );
    await service.revokePublication(
      context,
      'publication-synthetic-pub29',
      workspace.authorityFor('revoke', {
        recordId: 'publication-synthetic-pub29',
      }),
    );
    await service.archiveArtifact(
      context,
      'artifact-synthetic-pub29',
      workspace.authorityFor('archive', {
        artifactId: 'artifact-synthetic-pub29',
      }),
    );
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
    assert.equal(observable.includes('synthetic-secret-material'), false);
    const deployCommand = provider.commands()[0];
    assert.equal(
      deployCommand.handoff.packageSha256,
      workspace.deployment.packageSha256,
    );
    assert.equal(
      deployCommand.handoff.manifestSha256,
      workspace.deployment.manifestSha256,
    );
    const rollbackCommand = provider.commands()[1];
    assert.equal(rollbackCommand.handoff.operationAction, 'rollback');
    assert.equal(
      rollbackCommand.handoff.predecessorReleaseId,
      workspace.rollback.predecessorReleaseId,
    );
    assert.equal(
      rollbackCommand.handoff.releaseId,
      workspace.rollback.predecessorReleaseId,
    );
    assert.equal(
      rollbackCommand.handoff.expectedDeploymentIdentity.releaseId,
      workspace.rollback.predecessorReleaseId,
    );
    assertCode(
      () => service.deleteResourcePlan(context, 'DELETE another-resource'),
      'deployment_delete_confirmation_required',
    );
    const descriptor = createCurrentPowerShellAdapterDescriptor();
    assert.equal(descriptor.executionBuiltIn, false);
    assert.equal(descriptor.arbitraryExecutableAllowed, false);
    assert.equal(descriptor.helperHashRequired, true);
    assert.equal(descriptor.helperTrustAnchorConfigured, false);
    assert.equal(
      descriptor.helperHashVerifiedBeforeAndAfterExecution,
      false,
    );
  } finally {
    await workspace.cleanup();
  }
});

test('deployment ledger bounds pre-mutation retries and replays completed scope under fresh authority', async () => {
  const workspace = await createExactDeploymentWorkspace();
  try {
    const provider =
      createSyntheticSealedDeploymentProvider(workspace);
    const service =
      new AzureStaticWebAppDeploymentService({
        adapter: workspace.createAdapter(),
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    const authority = workspace.authorityFor(
      'deploy',
      workspace.deployment,
    );
    await fs.writeFile(
      workspace.packagePath,
      Buffer.concat([
        workspace.packageBytes,
        Buffer.from('pre-mutation-drift', 'utf8'),
      ]),
    );
    await assertRejectsCode(
      () =>
        service.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          authority,
        ),
      'deployment_artifact_hash_mismatch',
    );
    const operationId =
      service.journal()[0].operationId;
    const firstOutcome = JSON.parse(
      await fs.readFile(
        path.join(
          workspace.operationLedgerRoot,
          `${operationId}.attempt-1.outcome.json`,
        ),
        'utf8',
      ),
    );
    assert.equal(
      firstOutcome.state,
      'RETRYABLE_NO_MUTATION',
    );
    assert.equal(
      firstOutcome.mutationMayHaveStarted,
      false,
    );
    await fs.writeFile(
      workspace.packagePath,
      workspace.packageBytes,
    );
    const completed =
      await service.deployExactArtifact(
        workspace.context,
        workspace.deployment,
        authority,
      );
    assert.equal(completed.statusCode, 'deployed');
    const secondOutcome = JSON.parse(
      await fs.readFile(
        path.join(
          workspace.operationLedgerRoot,
          `${operationId}.attempt-2.outcome.json`,
        ),
        'utf8',
      ),
    );
    assert.equal(secondOutcome.state, 'COMPLETED');
    assert.equal(provider.commands().length, 1);

    const realDateNow = Date.now;
    Date.now = () => realDateNow() + 2 * 60 * 60_000;
    try {
      const freshAuthority = workspace.authorityFor(
        'deploy',
        workspace.deployment,
      );
      const replay =
        await service.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          freshAuthority,
        );
      assert.deepEqual(replay, completed);
      assert.equal(provider.commands().length, 1);
    } finally {
      Date.now = realDateNow;
    }

    await workspace.createOperationLedgerRoot();
    await fs.writeFile(
      workspace.packagePath,
      Buffer.concat([
        workspace.packageBytes,
        Buffer.from('bounded-retry-drift', 'utf8'),
      ]),
    );
    const boundedService =
      new AzureStaticWebAppDeploymentService({
        adapter: workspace.createAdapter(),
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await assertRejectsCode(
        () =>
          boundedService.deployExactArtifact(
            workspace.context,
            workspace.deployment,
            authority,
          ),
        'deployment_artifact_hash_mismatch',
      );
    }
    await assertRejectsCode(
      () =>
        boundedService.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          authority,
        ),
      'deployment_corrected_attempt_budget_exhausted',
    );
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const outcome = JSON.parse(
        await fs.readFile(
          path.join(
            workspace.operationLedgerRoot,
            `${operationId}.attempt-${attempt}.outcome.json`,
          ),
          'utf8',
        ),
      );
      assert.equal(outcome.state, 'RETRYABLE_NO_MUTATION');
    }
  } finally {
    await fs.writeFile(
      workspace.packagePath,
      workspace.packageBytes,
    ).catch(() => {});
    await workspace.cleanup();
  }
});

test('deployment ledger restart and signed reconciliation resolve ambiguous mutations without blind retry', async () => {
  const workspace = await createExactDeploymentWorkspace();
  try {
    const successfulAdapter = workspace.createAdapter();
    let mode = 'fail-started';
    let invokes = 0;
    const adapter = {
      async invoke(operation, options) {
        invokes += 1;
        if (mode === 'fail-started') {
          const error = new Error(
            'synthetic mutation-started interruption',
          );
          error.code =
            'synthetic_mutation_started_interruption';
          throw error;
        }
        return successfulAdapter.invoke(
          operation,
          options,
        );
      },
    };
    const authority = workspace.authorityFor(
      'create-or-reuse',
      { sku: 'Free' },
    );
    const service =
      new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          authority,
        ),
      'synthetic_mutation_started_interruption',
    );
    const operationId =
      service.journal()[0].operationId;
    const ambiguousOutcome = JSON.parse(
      await fs.readFile(
        path.join(
          workspace.operationLedgerRoot,
          `${operationId}.attempt-1.outcome.json`,
        ),
        'utf8',
      ),
    );
    assert.equal(
      ambiguousOutcome.state,
      'RECONCILIATION_REQUIRED',
    );
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          authority,
        ),
      'deployment_operation_reconciliation_required',
    );
    assert.equal(invokes, 1);

    const restarted =
      new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    const recovered =
      await restarted.readClaimedOperation(operationId);
    assert.equal(recovered.operationId, operationId);
    assert.equal(recovered.action, 'create-or-reuse');
    const claimPath = path.join(
      workspace.operationLedgerRoot,
      `${operationId}.attempt-1.claim.json`,
    );
    const authenticClaimBytes =
      await fs.readFile(claimPath);
    const forgedClaim = JSON.parse(
      authenticClaimBytes.toString('utf8'),
    );
    const receipt =
      forgedClaim.operation.mutationAuthority
        .authorityReceipt;
    receipt.signatureBase64 =
      `${receipt.signatureBase64[0] === 'A' ? 'B' : 'A'}` +
      receipt.signatureBase64.slice(1);
    forgedClaim.operation.mutationAuthority
      .signatureSha256 = sha256(
        Buffer.from(
          receipt.signatureBase64,
          'base64',
        ),
      );
    const {
      operationSha256: ignoredOperationSha256,
      ...forgedOperationBody
    } = forgedClaim.operation;
    forgedClaim.operation.operationSha256 =
      canonicalDigest(forgedOperationBody);
    const {
      integritySha256: ignoredClaimIntegrity,
      ...forgedClaimBody
    } = forgedClaim;
    forgedClaim.integritySha256 =
      canonicalDigest(forgedClaimBody);
    await fs.writeFile(
      claimPath,
      `${stableStringify(forgedClaim)}\n`,
      'utf8',
    );
    await assertRejectsCode(
      () =>
        restarted.readClaimedOperation(operationId),
      'deployment_authority_signature_invalid',
    );
    await fs.writeFile(
      claimPath,
      authenticClaimBytes,
    );
    assert.deepEqual(
      await restarted.readClaimedOperation(operationId),
      recovered,
    );
    const notAppliedEvidence = {
      readbackType:
        'AUTHORITATIVE_MUTATION_RECONCILIATION',
      mutationState: 'NOT_APPLIED',
      operationId,
      observedStateSha256: 'e'.repeat(64),
      evidenceRef:
        'deployment/evidence/synthetic-no-mutation.json',
    };
    const retryReconciliation =
      await restarted.reconcileClaimedMutation(
        operationId,
        workspace.reconciliationAuthorityFor(
          recovered,
          'NOT_APPLIED',
          notAppliedEvidence,
        ),
      );
    assert.equal(
      retryReconciliation.retryAuthorized,
      true,
    );
    assert.equal(retryReconciliation.completed, false);
    mode = 'succeed';
    const corrected = await restarted.createOrReuse(
      workspace.context,
      workspace.authorityFor(
        'create-or-reuse',
        { sku: 'Free' },
      ),
    );
    assert.equal(corrected.statusCode, 'completed');
    assert.equal(invokes, 2);

    await workspace.createOperationLedgerRoot();
    mode = 'fail-started';
    invokes = 0;
    const appliedService =
      new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    const tags = { tenant: 'synthetic-tenant' };
    const tagAuthority = workspace.authorityFor(
      'tag',
      { tags },
    );
    await assertRejectsCode(
      () =>
        appliedService.tagResource(
          workspace.context,
          tags,
          tagAuthority,
        ),
      'synthetic_mutation_started_interruption',
    );
    const tagOperationId =
      appliedService.journal()[0].operationId;
    const tagOperation =
      await appliedService.readClaimedOperation(
        tagOperationId,
      );
    const appliedEvidence = {
      readbackType: 'TAG_MUTATION',
      mutationState: 'APPLIED',
      resourceName:
        workspace.context.staticWebAppName,
      tagsSha256: canonicalDigest(tags),
    };
    const appliedReconciliation =
      await appliedService.reconcileClaimedMutation(
        tagOperation,
        workspace.reconciliationAuthorityFor(
          tagOperation,
          'APPLIED_EXACT',
          appliedEvidence,
        ),
      );
    assert.equal(appliedReconciliation.completed, true);
    const reconciledResult =
      appliedReconciliation.result;
    assert.equal(reconciledResult.statusCode, 'completed');
    const replayService =
      new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    const replay = await replayService.tagResource(
      workspace.context,
      tags,
      workspace.authorityFor('tag', { tags }),
    );
    assert.deepEqual(replay, reconciledResult);
    assert.equal(invokes, 1);
  } finally {
    await workspace.cleanup();
  }
});

test('deployment authority expiry after durable claim stops before provider mutation', async () => {
  const workspace = await createExactDeploymentWorkspace();
  const realDateNow = Date.now;
  try {
    let invokes = 0;
    const authority = workspace.authorityFor(
      'create-or-reuse',
      { sku: 'Free' },
    );
    const baselineNow = realDateNow();
    let timeChecks = 0;
    Date.now = () => {
      timeChecks += 1;
      return timeChecks === 1
        ? baselineNow
        : baselineNow + 2 * 60 * 60_000;
    };
    const service =
      new AzureStaticWebAppDeploymentService({
        adapter: {
          async invoke() {
            invokes += 1;
            throw new Error(
              'provider must not be invoked',
            );
          },
        },
        credentialProvider:
          createSyntheticSealedDeploymentProvider(workspace),
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          workspace.operationLedgerRoot,
        repositoryRoot: workspace.root,
      });
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          authority,
        ),
      'deployment_authority_time_invalid',
    );
    assert.equal(invokes, 0);
    const operationId =
      service.journal()[0].operationId;
    const outcome = JSON.parse(
      await fs.readFile(
        path.join(
          workspace.operationLedgerRoot,
          `${operationId}.attempt-1.outcome.json`,
        ),
        'utf8',
      ),
    );
    assert.equal(outcome.state, 'RETRYABLE_NO_MUTATION');
    assert.equal(outcome.mutationMayHaveStarted, false);
  } finally {
    Date.now = realDateNow;
    await workspace.cleanup();
  }
});

test('deployment mutations and readbacks require exact privileged authorities', async () => {
  const workspace = await createExactDeploymentWorkspace();
  const alternateLedgerRoot = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      'pumpkin-pub30-deployment-ledger-',
    ),
  );
  try {
    const provider = createSyntheticSealedDeploymentProvider(workspace);
    assertCode(
      () =>
        createPrivilegedDeploymentVerifier({
          ...deploymentVerifierBootstrapConfiguration,
          revokedAuthorityIds: [],
        }),
      'deployment_verifier_boot_snapshot_mismatch',
    );
    assertCode(
      () =>
        new AzureStaticWebAppDeploymentService({
          adapter: workspace.createAdapter(),
          credentialProvider: provider,
          deploymentVerifier: workspace.deploymentVerifier,
          operationLedgerRoot: alternateLedgerRoot,
          repositoryRoot: workspace.root,
        }),
      'deployment_operation_ledger_boot_root_mismatch',
    );
    assertCode(
      () =>
        buildOperation(
          'caller-defined-action',
          'azure',
          workspace.context,
          {},
          null,
        ),
      'deployment_action_contract_invalid',
    );
    assertCode(
      () =>
        buildOperation(
          'create-or-reuse',
          'azure',
          workspace.context,
          { sku: 'Free' },
          null,
          { mutationRequired: false },
        ),
      'deployment_contract_field_forbidden',
    );

    const heldAdapter = workspace.createAdapter();
    const heldService = new AzureStaticWebAppDeploymentService({
      adapter: heldAdapter,
      credentialProvider: provider,
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        heldService.createOrReuse(workspace.context, {
          approved: true,
          approvalRef: 'self-minted',
        }),
      'deployment_verifier_unconfigured',
    );
    assert.equal(heldAdapter.events().length, 0);

    const ledgerHeldAdapter = workspace.createAdapter();
    const ledgerHeldService =
      new AzureStaticWebAppDeploymentService({
        adapter: ledgerHeldAdapter,
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        repositoryRoot: workspace.root,
      });
    await assertRejectsCode(
      () =>
        ledgerHeldService.createOrReuse(
          workspace.context,
          workspace.authorityFor(
            'create-or-reuse',
            { sku: 'Free' },
          ),
        ),
      'deployment_operation_ledger_unconfigured',
    );
    assert.equal(ledgerHeldAdapter.events().length, 0);

    const service = new AzureStaticWebAppDeploymentService({
      adapter: workspace.createAdapter(),
      credentialProvider: provider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot: workspace.operationLedgerRoot,
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        service.createOrReuse(workspace.context, {
          approved: true,
          approvalRef: 'self-minted',
        }),
      'deployment_contract_field_forbidden',
    );
    const wrongActionAuthority = workspace.authorityFor('tag', {
      tags: { tenant: 'synthetic-tenant' },
    });
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          wrongActionAuthority,
        ),
      'deployment_authority_scope_invalid',
    );
    const expiredAuthority = workspace.authorityFor(
      'create-or-reuse',
      { sku: 'Free' },
      workspace.context,
      {
        issuedAt: new Date(
          Date.now() - 2 * 60 * 60_000,
        ).toISOString(),
        expiresAt: new Date(
          Date.now() - 60 * 60_000,
        ).toISOString(),
      },
    );
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          expiredAuthority,
        ),
      'deployment_authority_time_invalid',
    );
    const revokedAuthority = workspace.authorityFor(
      'create-or-reuse',
      { sku: 'Free' },
      workspace.context,
      {
        authorityId:
          'synthetic-revoked-deployment-authority',
      },
    );
    await assertRejectsCode(
      () =>
        service.createOrReuse(
          workspace.context,
          revokedAuthority,
        ),
      'deployment_authority_revoked',
    );
    await assertRejectsCode(
      () =>
        service.rollback(
          workspace.context,
          {
            predecessorPublicationId:
              workspace.rollback.predecessorPublicationId,
            predecessorArtifactSha256: 'e'.repeat(64),
          },
          null,
      ),
      'deployment_contract_field_forbidden',
    );
    const wrongPredecessorAuthority = workspace.authorityFor(
      'rollback',
      {
        ...workspace.rollback,
        predecessorReleaseId: 'release-wrong-predecessor',
        automatic: false,
      },
    );
    await assertRejectsCode(
      () =>
        service.rollback(
          workspace.context,
          workspace.rollback,
          wrongPredecessorAuthority,
        ),
      'deployment_authority_scope_invalid',
    );
    const wrongRollback = {
      ...workspace.rollback,
      packageSha256: '0'.repeat(64),
    };
    await assertRejectsCode(
      () =>
        service.rollback(
          workspace.context,
          wrongRollback,
          workspace.authorityFor('rollback', {
            ...wrongRollback,
            automatic: false,
          }),
        ),
      'deployment_artifact_hash_mismatch',
    );

    const unsignedReadbackService =
      new AzureStaticWebAppDeploymentService({
        adapter: new InMemoryDeploymentAdapter(),
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        repositoryRoot: workspace.root,
      });
    await assertRejectsCode(
      () => unsignedReadbackService.readResource(workspace.context),
      'deployment_readback_authority_required',
    );

    const crossActionReadbackService =
      new AzureStaticWebAppDeploymentService({
        adapter: workspace.createAdapter({ action: 'tag' }),
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        repositoryRoot: workspace.root,
      });
    await assertRejectsCode(
      () => crossActionReadbackService.readResource(workspace.context),
      'deployment_readback_scope_invalid',
    );
    const forgedResultService = new AzureStaticWebAppDeploymentService({
      adapter: workspace.createAdapter({
        actionResult: {
          readbackType: 'RESOURCE_STATE',
          resourceState: 'READY',
          resourceName: 'another-resource',
        },
      }),
      credentialProvider: provider,
      deploymentVerifier: workspace.deploymentVerifier,
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () => forgedResultService.readResource(workspace.context),
      'deployment_readback_result_invalid',
    );
  } finally {
    await workspace.cleanup();
    await safeRemoveExactDeploymentLedgerRoot(
      alternateLedgerRoot,
    );
  }
});

test('deployment adapters fail closed and journal nonzero, signaled, and failed statuses', async () => {
  const workspace = await createExactDeploymentWorkspace();
  const cases = [
    {
      expectedCode: 'deployment_result_nonzero_exit',
      result: {
        exitCode: 7,
        signal: null,
        statusCode: 'read',
        readbackAuthority: null,
        valuesIncluded: false,
      },
    },
    {
      expectedCode: 'deployment_result_signaled',
      result: {
        exitCode: 0,
        signal: 'SIGTERM',
        statusCode: 'read',
        readbackAuthority: null,
        valuesIncluded: false,
      },
    },
    {
      expectedCode: 'deployment_result_status_failed',
      result: {
        exitCode: 0,
        signal: null,
        statusCode: 'failed',
        readbackAuthority: null,
        valuesIncluded: false,
      },
    },
    ...[null, false, '0'].map((exitCode) => ({
      expectedCode: 'deployment_result_exit_invalid',
      result: {
        exitCode,
        signal: null,
        statusCode: 'read',
        readbackAuthority: null,
        valuesIncluded: false,
      },
    })),
    ...[undefined, false, ''].map((signal) => ({
      expectedCode:
        signal === undefined
          ? 'deployment_contract_field_missing'
          : 'deployment_result_signaled',
      result: {
        exitCode: 0,
        ...(signal === undefined ? {} : { signal }),
        statusCode: 'read',
        readbackAuthority: null,
        valuesIncluded: false,
      },
    })),
  ];
  try {
    for (const { expectedCode, result } of cases) {
      const adapter = {
        invoke: async () => structuredClone(result),
      };
      const provider = createSyntheticSealedDeploymentProvider(workspace, {
        onCommand: () => {
          throw new Error('generic adapter tests must not invoke the synthetic helper');
        },
      });
      const service = new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          await workspace.createOperationLedgerRoot(),
        repositoryRoot: workspace.root,
      });
      await assertRejectsCode(
        () => service.readResource(workspace.context),
        expectedCode,
      );
      assert.equal(service.journal().at(-1).state, 'failed');
      assert.equal(service.journal().at(-1).detail.errorCode, expectedCode);
    }
  } finally {
    await workspace.cleanup();
  }
});

test('sealed deployment helper failures and identity mismatches journal failed', async () => {
  const workspace = await createExactDeploymentWorkspace();
  const cases = [
    {
      expectedCode: 'deployment_child_nonzero_exit',
      result: (command) => ({
        exitCode: 9,
        signal: null,
        statusCode: 'deployed',
        deploymentIdentity: command.handoff.expectedDeploymentIdentity,
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    },
    {
      expectedCode: 'deployment_child_signaled',
      result: (command) => ({
        exitCode: 0,
        signal: 'SIGTERM',
        statusCode: 'deployed',
        deploymentIdentity: command.handoff.expectedDeploymentIdentity,
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    },
    {
      expectedCode: 'deployment_child_status_failed',
      result: (command) => ({
        exitCode: 0,
        signal: null,
        statusCode: 'failed',
        deploymentIdentity: command.handoff.expectedDeploymentIdentity,
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    },
    {
      expectedCode: 'deployment_post_deploy_identity_mismatch',
      result: (command) => ({
        exitCode: 0,
        signal: null,
        statusCode: 'deployed',
        deploymentIdentity: {
          ...command.handoff.expectedDeploymentIdentity,
          packageSha256: '0'.repeat(64),
        },
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    },
    ...[null, false, '0'].map((exitCode) => ({
      expectedCode: 'deployment_child_exit_invalid',
      result: (command) => ({
        exitCode,
        signal: null,
        statusCode: 'deployed',
        deploymentIdentity: command.handoff.expectedDeploymentIdentity,
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    })),
    ...[undefined, false, ''].map((signal) => ({
      expectedCode:
        signal === undefined
          ? 'deployment_contract_field_missing'
          : 'deployment_child_signaled',
      result: (command) => ({
        exitCode: 0,
        ...(signal === undefined ? {} : { signal }),
        statusCode: 'deployed',
        deploymentIdentity: command.handoff.expectedDeploymentIdentity,
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      }),
    })),
  ];
  try {
    for (const { expectedCode, result } of cases) {
      const adapter = workspace.createAdapter();
      const provider = createSyntheticSealedDeploymentProvider(workspace, {
        resultFactory: result,
      });
      const service = new AzureStaticWebAppDeploymentService({
        adapter,
        credentialProvider: provider,
        deploymentVerifier: workspace.deploymentVerifier,
        operationLedgerRoot:
          await workspace.createOperationLedgerRoot(),
        repositoryRoot: workspace.root,
      });
      await assertRejectsCode(
        () =>
          service.deployExactArtifact(
            workspace.context,
            workspace.deployment,
            workspace.authorityFor('deploy', workspace.deployment),
          ),
        expectedCode,
      );
      assert.equal(service.journal().at(-1).state, 'failed');
      assert.equal(service.journal().at(-1).detail.errorCode, expectedCode);
    }
  } finally {
    await workspace.cleanup();
  }
});

test('exact deployment rejects preflight drift, helper drift, and in-flight staged-file changes', async () => {
  const workspace = await createExactDeploymentWorkspace();
  try {
    const stagedFile = workspace.stagedFiles[0];
    const approvedBytes = await fs.readFile(stagedFile);
    const replayContext = {
      ...workspace.context,
      tenantId: 'another-tenant',
    };
    const tenantReplayService = new AzureStaticWebAppDeploymentService({
      adapter: workspace.createAdapter(),
      credentialProvider: createSyntheticSealedDeploymentProvider(workspace),
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot:
        await workspace.createOperationLedgerRoot(),
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        tenantReplayService.deployExactArtifact(
          replayContext,
          workspace.deployment,
          workspace.authorityFor(
            'deploy',
            workspace.deployment,
            replayContext,
          ),
        ),
      'deployment_manifest_identity_mismatch',
    );
    assert.equal(tenantReplayService.journal().at(-1).state, 'failed');

    await fs.writeFile(
      workspace.packagePath,
      Buffer.concat([workspace.packageBytes, Buffer.from('tampered', 'utf8')]),
    );
    const packageAdapter = workspace.createAdapter();
    const packageProvider = createSyntheticSealedDeploymentProvider(workspace);
    const packageService = new AzureStaticWebAppDeploymentService({
      adapter: packageAdapter,
      credentialProvider: packageProvider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot:
        await workspace.createOperationLedgerRoot(),
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        packageService.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          workspace.authorityFor('deploy', workspace.deployment),
        ),
      'deployment_artifact_hash_mismatch',
    );
    assert.equal(packageService.journal().at(-1).state, 'failed');
    await fs.writeFile(workspace.packagePath, workspace.packageBytes);

    await fs.writeFile(stagedFile, Buffer.from('changed-under-the-same-claim', 'utf8'));
    const preflightAdapter = workspace.createAdapter();
    const preflightProvider = createSyntheticSealedDeploymentProvider(workspace);
    const preflightService = new AzureStaticWebAppDeploymentService({
      adapter: preflightAdapter,
      credentialProvider: preflightProvider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot:
        await workspace.createOperationLedgerRoot(),
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        preflightService.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          workspace.authorityFor('deploy', workspace.deployment),
        ),
      'deployment_staged_inventory_mismatch',
    );
    assert.equal(preflightService.journal().at(-1).state, 'failed');
    await fs.writeFile(stagedFile, approvedBytes);

    const heldAdapter = workspace.createAdapter();
    const heldProvider = new CurrentUserDpapiCredentialProvider({
      reference: credentialReference(),
    });
    const heldService = new AzureStaticWebAppDeploymentService({
      adapter: heldAdapter,
      credentialProvider: heldProvider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot:
        await workspace.createOperationLedgerRoot(),
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        heldService.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          workspace.authorityFor('deploy', workspace.deployment),
        ),
      'credential_audited_helper_trust_anchor_unconfigured',
    );
    assert.equal(heldService.journal().at(-1).state, 'failed');

    const inFlightAdapter = workspace.createAdapter();
    const inFlightProvider = createSyntheticSealedDeploymentProvider(
      workspace,
      {
        onCommand: async () => {
        await fs.writeFile(stagedFile, Buffer.from('changed-during-deploy', 'utf8'));
        },
      },
    );
    const inFlightService = new AzureStaticWebAppDeploymentService({
      adapter: inFlightAdapter,
      credentialProvider: inFlightProvider,
      deploymentVerifier: workspace.deploymentVerifier,
      operationLedgerRoot:
        await workspace.createOperationLedgerRoot(),
      repositoryRoot: workspace.root,
    });
    await assertRejectsCode(
      () =>
        inFlightService.deployExactArtifact(
          workspace.context,
          workspace.deployment,
          workspace.authorityFor('deploy', workspace.deployment),
        ),
      'deployment_staged_inventory_mismatch',
    );
    assert.equal(inFlightService.journal().at(-1).state, 'failed');
  } finally {
    await workspace.cleanup();
  }
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
  const retainedAuthorization = await retainedPub20OriginAuthorization();
  const first = await buildCurrentTenantCandidateSet({
    repositoryRoot,
    releaseContext: syntheticRelease(),
    platformOriginAuthorization: retainedAuthorization,
  });
  const second = await buildCurrentTenantCandidateSet({
    repositoryRoot,
    releaseContext: syntheticRelease(),
    platformOriginAuthorization: retainedAuthorization,
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
  const indexByKey = new Map(
    first.index.candidates.map((entry) => [
      entry.candidateKey,
      entry,
    ]),
  );
  for (const candidate of first.candidates) {
    const indexEntry = indexByKey.get(candidate.candidateKey);
    assert.equal(
      indexEntry.manifestFileSha256,
      sha256(
        Buffer.from(
          `${stableStringify(candidate.manifest)}\n`,
          'utf8',
        ),
      ),
    );
    for (const field of [
      'tenantUid',
      'publicationId',
      'artifactId',
      'snapshotId',
    ]) {
      assert.equal(indexEntry[field], candidate[field]);
      assert.equal(candidate.manifest[field], candidate[field]);
      assert.equal(candidate.readiness[field], candidate[field]);
      assert.equal(candidate.orchestrator[field], candidate[field]);
    }
  }
  assert.equal(byKey.get('ice-rink-rentals').readiness.counts.routes, 3);
  assert.equal(byKey.get('party-pros-philadelphia').readiness.counts.routes, 301);
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.routes, 43);
  assert.equal(
    byKey.get('strip-club-near-me-vegas').readiness.counts
      .projectedRoutes,
    42,
  );
  const vegas404 = byKey
    .get('strip-club-near-me-vegas')
    .inventories.routes.find((route) => route.route === '/404.html');
  assert.equal(vegas404.projectionIncluded, false);
  assert.equal(
    vegas404.projectionDisposition,
    'INVENTORY_ONLY_RESERVED_CANONICAL_ARTIFACT_SYSTEM_ROUTE',
  );
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.forms, 32);
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.formInstances, 65);
  assert.equal(
    byKey.get('strip-club-near-me-vegas').readiness.counts.mediaReferences,
    302,
  );
  assert.equal(byKey.get('strip-club-near-me-vegas').readiness.counts.mediaAliases, 473);
  for (const key of [
    'ice-rink-rentals',
    'party-pros-philadelphia',
    'strip-club-near-me-vegas',
  ]) {
    assert.equal(byKey.get(key).readiness.fidelity.fidelityComplete, false);
  }
  assert.equal(
    byKey
      .get('strip-club-near-me-vegas')
      .inventories.media.canonical.every(
        (item) =>
          item.referenceClassification ===
            'MUTABLE_UNVERIFIED_REFERENCE' &&
          item.fetchedOrVerified === false &&
          !Object.hasOwn(item, 'sha256'),
      ),
    true,
  );
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

  for (const [field, expectedCode] of [
    ['manifest', 'candidate_manifest_shape_invalid'],
    ['readiness', 'candidate_readiness_shape_invalid'],
    ['orchestrator', 'candidate_orchestrator_shape_invalid'],
  ]) {
    const extra = structuredClone(first);
    extra.candidates[0][field].unexpected = true;
    assertCode(
      () => verifyCurrentTenantCandidateSet(extra),
      expectedCode,
    );
  }
  const crossBound = structuredClone(first);
  crossBound.candidates[0].readiness.publicationId =
    'publication-cross-bound';
  assertCode(
    () => verifyCurrentTenantCandidateSet(crossBound),
    'candidate_lineage_binding_invalid',
  );

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
  const outputLink = path.join(temporaryRoot, 'output-link');
  try {
    const realOutputParent = path.join(
      temporaryRoot,
      'real-output-parent',
    );
    await fs.mkdir(realOutputParent);
    await fs.symlink(
      realOutputParent,
      outputLink,
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await assertRejectsCode(
      () =>
        writeCurrentTenantCandidateSet({
          repositoryRoot,
          outputRoot: path.join(outputLink, 'candidate-output'),
          candidateSet: first,
        }),
      'candidate_output_symlink_forbidden',
    );

    await assertRejectsCode(
      () =>
        buildCurrentTenantCandidateSet({
          repositoryRoot,
          releaseContext: {
            ...syntheticRelease(),
            sourceCommit: '0'.repeat(40),
          },
          platformOriginAuthorization: retainedAuthorization,
        }),
      'source_commit_unavailable',
    );

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
    for (const candidate of first.candidates) {
      const manifestPath = path.join(
        firstOutput,
        candidate.candidateKey,
        'candidate-manifest.json',
      );
      assert.equal(
        sha256(await fs.readFile(manifestPath)),
        indexByKey.get(candidate.candidateKey).manifestFileSha256,
      );
    }
    assert.equal(firstInventory.some((item) => item.path.startsWith('airstrip/') && item.path.endsWith('.tar')), false);
    for (const file of (await recursiveFiles(firstOutput)).filter((item) => item.endsWith('.json'))) {
      const text = await fs.readFile(file, 'utf8');
      assert.doesNotThrow(() => JSON.parse(text), file);
      assert.equal(
        /(?:^|["'\s=])(?:[A-Za-z]:[\\/]|file:\/\/|\/(?:Users|home|mnt|tmp)\/)/m.test(
          text,
        ),
        false,
        file,
      );
    }
  } finally {
    await fs.unlink(outputLink).catch((error) => {
      if (error?.code !== 'ENOENT') throw error;
    });
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
  const release = syntheticRelease();
  const canonicalPreview = {
    tenant: { tenantUid: legacy.tenantUid },
    publication: {
      publicationId: legacy.publicationId,
      apiBaseUrl: legacy.apiBaseUrl,
    },
    productRelease: { releaseId: release.releaseId },
  };
  const authorization = await retainedPub20OriginAuthorization(release);
  const adapted = adaptPub20Input(legacy, release, {
    attributionFiles: attributionFiles(),
    platformOriginAuthority: authorization.authority,
    platformOriginVerifier: authorization.verifier,
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
await safeRemovePublicationJobStoreRoot(
  validationJobStoreRoot,
);
await safeRemoveExactDeploymentLedgerRoot(
  validationDeploymentOperationLedgerRoot,
);

function assertCode(run, expectedCode) {
  let observedError;
  try {
    run();
  } catch (error) {
    observedError = error;
  }
  assert.ok(observedError, `${expectedCode}: expected the operation to throw`);
  assert.equal(
    observedError.code,
    expectedCode,
    `${expectedCode}: received ${observedError.code ?? observedError.name}: ${observedError.message}`,
  );
}

async function assertRejectsCode(run, expectedCode) {
  let observedError;
  try {
    await run();
  } catch (error) {
    observedError = error;
  }
  assert.ok(observedError, `${expectedCode}: expected the operation to reject`);
  assert.equal(
    observedError.code,
    expectedCode,
    `${expectedCode}: received ${observedError.code ?? observedError.name}: ${observedError.message}`,
  );
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

function resealRegistryDocument(document) {
  const body = structuredClone(document);
  delete body.documentSha256;
  return { ...body, documentSha256: canonicalDigest(body) };
}

function resealJob(job) {
  const body = structuredClone(job);
  delete body.integritySha256;
  return {
    ...body,
    integritySha256: canonicalDigest(body),
  };
}

function resequenceRegistryEvents(document) {
  document.events.forEach((event, index) => {
    event.sequence = index + 1;
    event.eventId = deterministicId('registry-event', {
      kind: event.kind,
      sequence: event.sequence,
      action: event.action,
      recordId: event.recordId,
      tenantId: event.tenantId,
      actorId: event.actorId,
      actorRole: event.actorRole,
      actorTenantId: event.actorTenantId,
      detail: event.detail,
    });
  });
}

function holdAuthorityFor(
  job,
  stepRecord,
  overrides = {},
  {
    keyPair = holdAuthorityKeyPair,
    keyId = holdAuthorityVerifierConfiguration.keyId,
    revocationSnapshotId =
      holdAuthorityVerifierConfiguration.revocationSnapshotId,
  } = {},
) {
  const now = Date.now();
  const body = {
    schemaVersion: 'pumpkin.publication-hold-authority.v1',
    authorityId: `authority-${stepRecord.key}`,
    keyId,
    approvalRef: stepRecord.holdRequirement.approvalRef,
    scope: {
      ...structuredClone(stepRecord.holdRequirement.scope),
      artifactId: job.artifactId,
      jobId: job.jobId,
      planHash: job.planHash,
    },
    action: stepRecord.holdRequirement.action,
    releasedAction: stepRecord.holdRequirement.onReleaseAction,
    approvedBy: 'super-admin-pub30',
    approvedRole: Role.SuperAdmin,
    issuedAt: new Date(now - 1_000).toISOString(),
    expiresAt: new Date(now + 60_000).toISOString(),
    revocation: {
      status: 'ACTIVE',
      snapshotId: revocationSnapshotId,
    },
    ...overrides,
  };
  return {
    ...body,
    signatureBase64: signData(
      null,
      Buffer.from(stableStringify(body), 'utf8'),
      keyPair.privateKey,
    ).toString('base64'),
  };
}

function auditedHelperConfig(expectedSha256) {
  return {
    contractVersion: AuditedDpapiSwaHelperContract.contractVersion,
    repositoryRelativePath:
      AuditedDpapiSwaHelperContract.repositoryRelativePath,
    invocationReference: AuditedDpapiSwaHelperContract.invocationReference,
    executable: AuditedDpapiSwaHelperContract.executable,
    workingDirectoryRef: AuditedDpapiSwaHelperContract.workingDirectoryRef,
    expectedSha256,
  };
}

function rawCredentialReferenceFrom(reference) {
  return Object.fromEntries(
    [
      'schemaVersion',
      'credentialReferenceId',
      'providerType',
      'state',
      'purpose',
      'environmentVariableName',
      'envelopeFormat',
      'envelopeMetadataId',
      'envelopeSha256',
      'protectionScope',
      'aclState',
      'valueIncluded',
    ].map((key) => [key, structuredClone(reference[key])]),
  );
}

function createSyntheticDeploymentSecurity() {
  const configuration = structuredClone(
    deploymentVerifierBootstrapConfiguration,
  );
  const verifier = createPrivilegedDeploymentVerifier(configuration);
  const validity = () => {
    const now = Date.now();
    return {
      issuedAt: new Date(now - 60_000).toISOString(),
      expiresAt: new Date(now + 60 * 60_000).toISOString(),
    };
  };
  return {
    verifier,
    configuration,
    mutationAuthority(action, provider, context, payload, overrides = {}) {
      const scope = deploymentMutationAuthorityScope(
        action,
        provider,
        context,
        payload,
      );
      const body = {
        schemaVersion: 'pumpkin.deployment-mutation-authority.v1',
        authorityId: deterministicId('deployment-authority', scope),
        status: 'APPROVED',
        action: scope.action,
        provider: scope.provider,
        operationId: scope.operationId,
        idempotencyKey: scope.idempotencyKey,
        tenantId: scope.context.tenantId,
        publicationId: scope.context.publicationId,
        releaseId: scope.context.releaseId,
        predecessorReleaseId: scope.predecessorReleaseId,
        artifactId: scope.context.artifactId,
        resourceGroup: scope.context.resourceGroup,
        staticWebAppName: scope.context.staticWebAppName,
        payloadSha256: scope.payloadSha256,
        ...validity(),
        revocationState: 'ACTIVE',
        revocationListId: configuration.revocationListId,
        evidenceRef: 'tools/tenant-publication-product/validate.mjs',
        keyId: configuration.mutationKeyId,
        ...overrides,
      };
      const signedBody = {
        ...body,
        integritySha256: canonicalDigest(body),
      };
      return {
        ...signedBody,
        signatureBase64: signData(
          null,
          Buffer.from(stableStringify(signedBody), 'utf8'),
          deploymentMutationKeyPair.privateKey,
        ).toString('base64'),
      };
    },
    readbackAuthorityFactory(operation, actionResult, overrides = {}) {
      const scope = deploymentReadbackAuthorityScope(
        operation,
        actionResult,
        { deploymentVerifier: verifier },
      );
      const body = {
        schemaVersion: 'pumpkin.deployment-action-readback.v1',
        authorityId: deterministicId('deployment-readback', scope),
        status: 'SUCCEEDED',
        ...scope,
        ...validity(),
        revocationState: 'ACTIVE',
        revocationListId: configuration.revocationListId,
        keyId: configuration.readbackKeyId,
        ...overrides,
      };
      const signedBody = {
        ...body,
        integritySha256: canonicalDigest(body),
      };
      return {
        ...signedBody,
        signatureBase64: signData(
          null,
          Buffer.from(stableStringify(signedBody), 'utf8'),
          deploymentReadbackKeyPair.privateKey,
        ).toString('base64'),
      };
    },
    reconciliationAuthority(
      operation,
      resolution,
      evidence,
      overrides = {},
    ) {
      const scope = deploymentReconciliationAuthorityScope(
        operation,
        resolution,
        evidence,
        { deploymentVerifier: verifier },
      );
      const body = {
        schemaVersion:
          'pumpkin.deployment-operation-reconciliation.v1',
        authorityId: deterministicId(
          'deployment-reconciliation-authority',
          scope,
        ),
        status: 'AUTHORITATIVE',
        ...scope,
        ...validity(),
        revocationState: 'ACTIVE',
        revocationListId: configuration.revocationListId,
        keyId: configuration.readbackKeyId,
        ...overrides,
      };
      const signedBody = {
        ...body,
        integritySha256: canonicalDigest(body),
      };
      return {
        ...signedBody,
        signatureBase64: signData(
          null,
          Buffer.from(
            stableStringify(signedBody),
            'utf8',
          ),
          deploymentReadbackKeyPair.privateKey,
        ).toString('base64'),
      };
    },
  };
}

function createSyntheticSealedDeploymentProvider(
  workspace,
  { resultFactory = null, onCommand = null } = {},
) {
  const helperBody = auditedHelperConfig(
    workspace.auditedHelper.expectedSha256,
  );
  const helper = {
    ...helperBody,
    contractSha256: canonicalDigest(helperBody),
  };
  const commands = [];
  return {
    describe() {
      return {
        credentialReferenceId: 'credential-synthetic-validation-only',
        environmentVariableName: 'SWA_CLI_DEPLOYMENT_TOKEN',
        providerType: 'SYNTHETIC_VALIDATION_ONLY',
        envelopeMetadataId: 'synthetic-validation-envelope',
        envelopeSha256: 'f'.repeat(64),
        valuesReturned: false,
      };
    },
    auditedHelperContract() {
      return structuredClone(helper);
    },
    childEnvironmentContract(command) {
      commands.push(structuredClone(command));
      const body = {
        credentialReferenceId: 'credential-synthetic-validation-only',
        environmentVariableName: 'SWA_CLI_DEPLOYMENT_TOKEN',
        operationAction: command.handoff.operationAction,
        auditedHelperReference: helper.repositoryRelativePath,
        auditedHelperSha256: helper.expectedSha256,
        auditedHelperContractSha256: helper.contractSha256,
        handoffSha256: command.handoffSha256,
        expectedPackageSha256: command.handoff.packageSha256,
        expectedManifestSha256: command.handoff.manifestSha256,
        expectedStagedInventorySha256:
          command.handoff.stagedInventorySha256,
        envelopeMetadataId: command.handoff.envelopeMetadataId,
        envelopeSha256: command.handoff.envelopeSha256,
        plaintextCrossesProviderBoundary: false,
        callerInjectedSpawnAllowed: false,
        valueReturnedToCaller: false,
        valueOnCommandLine: false,
        valueWrittenToDisk: false,
      };
      return {
        ...body,
        contractSha256: canonicalDigest(body),
      };
    },
    async runChild(command) {
      if (onCommand) await onCommand(structuredClone(command));
      if (resultFactory) return resultFactory(structuredClone(command));
      return {
        exitCode: 0,
        signal: null,
        statusCode:
          command.handoff.operationAction === 'rollback'
            ? 'rolled-back'
            : 'deployed',
        deploymentIdentity: structuredClone(
          command.handoff.expectedDeploymentIdentity,
        ),
        stdoutCaptured: false,
        stderrCaptured: false,
        valuesIncluded: false,
      };
    },
    commands() {
      return structuredClone(commands);
    },
  };
}

async function createExactDeploymentWorkspace() {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'pumpkin-pub30-exact-deploy-'),
  );
  const createOperationLedgerRoot = async () => {
    await resetValidationDeploymentOperationLedgerRoot(
      validationDeploymentOperationLedgerRoot,
    );
    return validationDeploymentOperationLedgerRoot;
  };
  let operationLedgerRoot;
  try {
    operationLedgerRoot = await createOperationLedgerRoot();
  } catch (error) {
    await safeRemoveExactDeploymentWorkspace(root);
    throw error;
  }
  const deploymentSecurity = createSyntheticDeploymentSecurity();
  const helperBytes = Buffer.from(
    '# synthetic hash-pinned validation helper; never executed\n',
    'utf8',
  );
  const helperPath = path.join(
    root,
    ...AuditedDpapiSwaHelperContract.repositoryRelativePath.split('/'),
  );
  const artifactRootRef = 'stage/site';
  const packageRef = 'stage/publication.tar';
  const manifestRef = 'stage/publication-manifest.json';
  const artifactRoot = path.join(root, ...artifactRootRef.split('/'));
  const packagePath = path.join(root, ...packageRef.split('/'));
  const manifestPath = path.join(root, ...manifestRef.split('/'));
  const artifact = publishTenantSnapshot(publicationFixture());
  const predecessorFixture = publicationFixture();
  predecessorFixture.publication.publicationId =
    'publication-synthetic-pub29';
  predecessorFixture.publication.artifactId =
    'artifact-synthetic-pub29';
  predecessorFixture.productRelease.releaseId =
    'release-pub29-synthetic-v1';
  predecessorFixture.snapshot.snapshotId =
    'snapshot-synthetic-pub29';
  const predecessorArtifact = publishTenantSnapshot(
    predecessorFixture,
  );
  const predecessorArtifactRootRef = 'rollback/site';
  const predecessorPackageRef = 'rollback/publication.tar';
  const predecessorManifestRef =
    'rollback/publication-manifest.json';
  const predecessorArtifactRoot = path.join(
    root,
    ...predecessorArtifactRootRef.split('/'),
  );
  const predecessorPackagePath = path.join(
    root,
    ...predecessorPackageRef.split('/'),
  );
  const predecessorManifestPath = path.join(
    root,
    ...predecessorManifestRef.split('/'),
  );
  const stagedFiles = [];
  try {
    await fs.mkdir(path.dirname(helperPath), { recursive: true });
    await fs.writeFile(helperPath, helperBytes);
    await fs.mkdir(artifactRoot, { recursive: true });
    for (const file of artifact.files) {
      const filePath = path.join(artifactRoot, ...file.path.split('/'));
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const content = Buffer.isBuffer(file.content)
        ? file.content
        : Buffer.from(String(file.content), 'utf8');
      await fs.writeFile(filePath, content);
      stagedFiles.push(filePath);
    }
    await fs.mkdir(path.dirname(packagePath), { recursive: true });
    await fs.writeFile(packagePath, artifact.packageBytes);
    await fs.writeFile(manifestPath, artifact.manifestBytes);
    await fs.mkdir(predecessorArtifactRoot, { recursive: true });
    for (const file of predecessorArtifact.files) {
      const filePath = path.join(
        predecessorArtifactRoot,
        ...file.path.split('/'),
      );
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(
        filePath,
        Buffer.isBuffer(file.content)
          ? file.content
          : Buffer.from(String(file.content), 'utf8'),
      );
    }
    await fs.mkdir(path.dirname(predecessorPackagePath), {
      recursive: true,
    });
    await fs.writeFile(
      predecessorPackagePath,
      predecessorArtifact.packageBytes,
    );
    await fs.writeFile(
      predecessorManifestPath,
      predecessorArtifact.manifestBytes,
    );
  } catch (error) {
    await safeRemoveExactDeploymentWorkspace(root);
    throw error;
  }
  const stagedInventory = fileInventory(artifact.files);
  const predecessorInventory = fileInventory(
    predecessorArtifact.files,
  );
  const context = {
    tenantId: 'tenant-synthetic-pub30',
    publicationId: artifact.manifest.publicationId,
    releaseId: artifact.manifest.releaseId,
    artifactId: artifact.manifest.artifactId,
    resourceGroup: 'rg-synthetic-pub30',
    staticWebAppName: 'swa-synthetic-pub30',
    region: 'centralus',
    sku: 'Free',
  };
  const deployment = {
    artifactRootRef,
    packageRef,
    manifestRef,
    environment: 'production',
    packageSha256: artifact.manifest.packageSha256,
    manifestSha256: sha256(artifact.manifestBytes),
    stagedInventorySha256: canonicalDigest(stagedInventory),
  };
  const rollback = {
    predecessorPublicationId:
      predecessorArtifact.manifest.publicationId,
    predecessorReleaseId:
      predecessorArtifact.manifest.releaseId,
    predecessorArtifactId:
      predecessorArtifact.manifest.artifactId,
    artifactRootRef: predecessorArtifactRootRef,
    packageRef: predecessorPackageRef,
    manifestRef: predecessorManifestRef,
    environment: 'production',
    packageSha256: predecessorArtifact.manifest.packageSha256,
    manifestSha256: sha256(predecessorArtifact.manifestBytes),
    stagedInventorySha256: canonicalDigest(predecessorInventory),
  };
  return {
    root,
    packageBytes: artifact.packageBytes,
    packagePath,
    helperBytes,
    helperPath,
    stagedFiles,
    auditedHelper: auditedHelperConfig(sha256(helperBytes)),
    context,
    deployment,
    rollback,
    operationLedgerRoot,
    createOperationLedgerRoot,
    deploymentVerifier: deploymentSecurity.verifier,
    deploymentVerifierConfiguration:
      deploymentSecurity.configuration,
    createAdapter: (readbackOverrides = {}) =>
      new InMemoryDeploymentAdapter({
        deploymentVerifier: deploymentSecurity.verifier,
        readbackAuthorityFactory: (operation, actionResult) =>
          deploymentSecurity.readbackAuthorityFactory(
            operation,
            actionResult,
            readbackOverrides,
          ),
      }),
    authorityFor: (
      action,
      payload,
      contextOverride = context,
      authorityOverrides = {},
    ) =>
      deploymentSecurity.mutationAuthority(
        action,
        deploymentProviderByAction[action],
        contextOverride,
        payload,
        authorityOverrides,
      ),
    reconciliationAuthorityFor: (
      operation,
      resolution,
      evidence,
      authorityOverrides = {},
    ) =>
      deploymentSecurity.reconciliationAuthority(
        operation,
        resolution,
        evidence,
        authorityOverrides,
      ),
    cleanup: async () => {
      await safeRemoveExactDeploymentWorkspace(root);
    },
  };
}

async function safeRemoveExactDeploymentWorkspace(root) {
  const expectedParent = path.resolve(os.tmpdir());
  const resolved = path.resolve(root);
  const relative = path.relative(expectedParent, resolved);
  if (
    !relative.startsWith('pumpkin-pub30-exact-deploy-') ||
    relative.includes(path.sep)
  ) {
    throw new Error('refusing to remove an unexpected validation workspace');
  }
  await fs.rm(resolved, { recursive: true, force: true });
}

async function safeRemoveExactDeploymentLedgerRoot(root) {
  const expectedParent = path.resolve(os.tmpdir());
  const resolved = path.resolve(root);
  const relative = path.relative(expectedParent, resolved);
  if (
    !relative.startsWith('pumpkin-pub30-deployment-ledger-') ||
    relative.includes(path.sep)
  ) {
    throw new Error(
      'refusing to remove an unexpected validation ledger',
    );
  }
  await fs.rm(resolved, { recursive: true, force: true });
}

async function resetValidationDeploymentOperationLedgerRoot(
  root,
) {
  const expectedParent = path.resolve(os.tmpdir());
  const resolved = path.resolve(root);
  const relative = path.relative(expectedParent, resolved);
  if (
    !relative.startsWith('pumpkin-pub30-deployment-ledger-') ||
    relative.includes(path.sep)
  ) {
    throw new Error(
      'refusing to reset an unexpected validation ledger',
    );
  }
  await fs.rm(resolved, { recursive: true, force: true });
  await fs.mkdir(resolved, { recursive: false });
}

async function safeRemovePublicationJobStoreRoot(root) {
  const expectedParent = path.resolve(os.tmpdir());
  const resolved = path.resolve(root);
  const relative = path.relative(expectedParent, resolved);
  if (
    !relative.startsWith('pumpkin-pub30-job-store-') ||
    relative.includes(path.sep)
  ) {
    throw new Error(
      'refusing to remove an unexpected job-store validation root',
    );
  }
  await fs.rm(resolved, { recursive: true, force: true });
}

function repairTarHeaderChecksum(bytes, offset = 0) {
  bytes.fill(0x20, offset + 148, offset + 156);
  const checksum = bytes
    .subarray(offset, offset + 512)
    .reduce((sum, byte) => sum + byte, 0);
  const encoded = checksum.toString(8).padStart(6, '0');
  Buffer.from(`${encoded}\0 `, 'ascii').copy(bytes, offset + 148);
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
