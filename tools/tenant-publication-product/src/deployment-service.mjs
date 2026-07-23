import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicKey,
  randomUUID,
  verify as verifySignature,
} from 'node:crypto';
import {
  ContractError,
  ContractVersion,
  DomainStage,
  FormMode,
} from './contracts.mjs';
import {
  canonicalDigest,
  clone,
  deterministicId,
  immutable,
  sha256,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeArtifactPath,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
} from './security.mjs';
import { readDeterministicTarInventory } from './archive.mjs';
import { AuditedDpapiSwaHelperContract } from './credentials.mjs';
import { verifyPlatformOriginAuthorityReceipt } from './publisher.mjs';

const DEFAULT_REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);
const MAX_ARTIFACT_FILES = 20_000;
const MAX_ARTIFACT_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;
const MAX_CORRECTED_MUTATION_ATTEMPTS = 3;

const DEPLOYMENT_ACTION_CONTRACTS = Object.freeze({
  'read-resource': Object.freeze({ provider: 'read', mutationRequired: false }),
  'create-or-reuse': Object.freeze({ provider: 'azure', mutationRequired: true }),
  tag: Object.freeze({ provider: 'azure', mutationRequired: true }),
  register: Object.freeze({
    provider: 'publication-registry',
    mutationRequired: true,
  }),
  deploy: Object.freeze({ provider: 'azure-swa', mutationRequired: true }),
  'verify-deployment': Object.freeze({
    provider: 'validation',
    mutationRequired: false,
  }),
  update: Object.freeze({
    provider: 'publication-registry',
    mutationRequired: true,
  }),
  rollback: Object.freeze({ provider: 'azure-swa', mutationRequired: true }),
  revoke: Object.freeze({
    provider: 'publication-registry',
    mutationRequired: true,
  }),
  archive: Object.freeze({
    provider: 'artifact-registry',
    mutationRequired: true,
  }),
  'delete-plan': Object.freeze({ provider: 'azure', mutationRequired: false }),
  'read-custom-domains': Object.freeze({
    provider: 'azure',
    mutationRequired: false,
  }),
  'domain-handoff': Object.freeze({ provider: 'domain', mutationRequired: false }),
});
const DEPLOYMENT_VERIFIERS = new WeakMap();
const DEPLOYMENT_MUTATION_BOOT_PUBLIC_KEY_SHA256 =
  process.env.PUMPKIN_DEPLOYMENT_MUTATION_PUBLIC_KEY_SHA256 ?? null;
const DEPLOYMENT_READBACK_BOOT_PUBLIC_KEY_SHA256 =
  process.env.PUMPKIN_DEPLOYMENT_READBACK_PUBLIC_KEY_SHA256 ?? null;
const DEPLOYMENT_BOOT_VERIFIER_SHA256 =
  process.env.PUMPKIN_DEPLOYMENT_VERIFIER_SHA256 ?? null;
const DEPLOYMENT_OPERATION_LEDGER_BOOT_ROOT =
  process.env.PUMPKIN_DEPLOYMENT_OPERATION_LEDGER_ROOT ?? null;
const MAX_DEPLOYMENT_AUTHORITY_VALIDITY_MS = 24 * 60 * 60 * 1000;
const MIN_DEPLOYMENT_EXECUTION_AUTHORITY_REMAINING_MS =
  5 * 60 * 1000;

export function createPrivilegedDeploymentVerifier(rawConfiguration) {
  assertNoForbiddenData(
    rawConfiguration,
    'privileged deployment verifier configuration',
  );
  assertExactObjectKeys(
    rawConfiguration,
    [
      'schemaVersion',
      'status',
      'algorithm',
      'mutationKeyId',
      'mutationPublicKeyPem',
      'mutationPublicKeySha256',
      'readbackKeyId',
      'readbackPublicKeyPem',
      'readbackPublicKeySha256',
      'revocationListId',
      'revokedAuthorityIds',
    ],
    'privileged deployment verifier configuration',
  );
  assertRequiredObjectKeys(
    rawConfiguration,
    [
      'schemaVersion',
      'status',
      'algorithm',
      'mutationKeyId',
      'mutationPublicKeyPem',
      'mutationPublicKeySha256',
      'readbackKeyId',
      'readbackPublicKeyPem',
      'readbackPublicKeySha256',
      'revocationListId',
      'revokedAuthorityIds',
    ],
    'privileged deployment verifier configuration',
  );
  if (
    rawConfiguration.schemaVersion !==
      'pumpkin.deployment-verifier-config.v1' ||
    rawConfiguration.status !== 'ACTIVE' ||
    rawConfiguration.algorithm !== 'Ed25519' ||
    !Array.isArray(rawConfiguration.revokedAuthorityIds)
  ) {
    throw new ContractError(
      'deployment_verifier_configuration_invalid',
      'Privileged deployment verifier configuration is invalid.',
    );
  }
  const verifierConfigurationSha256 =
    canonicalDigest(rawConfiguration);
  if (
    typeof DEPLOYMENT_BOOT_VERIFIER_SHA256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(DEPLOYMENT_BOOT_VERIFIER_SHA256)
  ) {
    throw new ContractError(
      'deployment_verifier_boot_snapshot_unconfigured',
      'Deployment verification is held until the complete verifier and revocation snapshot is pinned before process startup.',
    );
  }
  if (
    verifierConfigurationSha256 !==
    DEPLOYMENT_BOOT_VERIFIER_SHA256
  ) {
    throw new ContractError(
      'deployment_verifier_boot_snapshot_mismatch',
      'Deployment verifier and revocation snapshot do not match the process-start trust anchor.',
    );
  }
  const mutationKey = normalizeDeploymentPublicKey(
    rawConfiguration.mutationKeyId,
    rawConfiguration.mutationPublicKeyPem,
    rawConfiguration.mutationPublicKeySha256,
    'mutation',
  );
  const readbackKey = normalizeDeploymentPublicKey(
    rawConfiguration.readbackKeyId,
    rawConfiguration.readbackPublicKeyPem,
    rawConfiguration.readbackPublicKeySha256,
    'readback',
  );
  assertDeploymentBootTrustAnchor(
    DEPLOYMENT_MUTATION_BOOT_PUBLIC_KEY_SHA256,
    mutationKey.publicKeySha256,
    'mutation',
  );
  assertDeploymentBootTrustAnchor(
    DEPLOYMENT_READBACK_BOOT_PUBLIC_KEY_SHA256,
    readbackKey.publicKeySha256,
    'readback',
  );
  const revokedAuthorityIds = new Set(
    rawConfiguration.revokedAuthorityIds.map((authorityId) =>
      assertSafeIdentifier(
        authorityId,
        'deployment verifier revokedAuthorityId',
      ),
    ),
  );
  if (revokedAuthorityIds.size !== rawConfiguration.revokedAuthorityIds.length) {
    throw new ContractError(
      'deployment_verifier_configuration_invalid',
      'Deployment verifier contains duplicate revoked authority IDs.',
    );
  }
  const configuration = {
    schemaVersion: rawConfiguration.schemaVersion,
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    mutationKey,
    readbackKey,
    revocationListId: assertSafeIdentifier(
      rawConfiguration.revocationListId,
      'deployment verifier revocationListId',
    ),
    revokedAuthorityIds,
    verifierConfigurationSha256,
  };
  const verifier = Object.freeze({
    describe() {
      return Object.freeze({
        schemaVersion: configuration.schemaVersion,
        status: configuration.status,
        algorithm: configuration.algorithm,
        mutationKeyId: configuration.mutationKey.keyId,
        mutationPublicKeySha256:
          configuration.mutationKey.publicKeySha256,
        readbackKeyId: configuration.readbackKey.keyId,
        readbackPublicKeySha256:
          configuration.readbackKey.publicKeySha256,
        revocationListId: configuration.revocationListId,
        revokedAuthorityCount: configuration.revokedAuthorityIds.size,
        verifierConfigurationSha256:
          configuration.verifierConfigurationSha256,
        bootTrustAnchorsMatched: true,
        privateKeyMaterialIncluded: false,
      });
    },
  });
  DEPLOYMENT_VERIFIERS.set(verifier, configuration);
  return verifier;
}

export function deploymentMutationAuthorityScope(
  action,
  provider,
  context,
  payload,
) {
  const normalizedAction = assertSafeIdentifier(
    action,
    'deployment authority action',
  );
  const normalizedProvider = assertSafeIdentifier(
    provider,
    'deployment authority provider',
  );
  const actionContract = DEPLOYMENT_ACTION_CONTRACTS[normalizedAction];
  if (
    !actionContract ||
    actionContract.provider !== normalizedProvider ||
    actionContract.mutationRequired !== true
  ) {
    throw new ContractError(
      'deployment_action_contract_invalid',
      'Mutation authority scope requires a closed mutating action/provider.',
    );
  }
  return immutable(
    deploymentMutationScopeFromNormalized(
      normalizedAction,
      normalizedProvider,
      normalizeContext(context),
      normalizePublicMetadata(payload, 'deployment authority payload'),
    ),
  );
}

function deploymentMutationScopeFromNormalized(
  action,
  provider,
  context,
  payload,
) {
  const predecessorReleaseId =
    action === 'rollback'
      ? assertSafeIdentifier(
          payload.predecessorReleaseId,
          'deployment rollback predecessorReleaseId',
        )
      : null;
  const payloadSha256 = canonicalDigest(payload);
  const idempotencyKey = canonicalDigest({
    action,
    provider,
    context,
    payload,
  });
  return {
    action,
    provider,
    context,
    predecessorReleaseId,
    payloadSha256,
    idempotencyKey,
    operationId: deterministicId('deployment-operation', {
      action,
      provider,
      context,
      payload,
    }),
  };
}

function verifyDeploymentMutationAuthority(
  authority,
  verifier,
  scope,
  { historicalReconciliation = false } = {},
) {
  const configuration = DEPLOYMENT_VERIFIERS.get(verifier);
  if (!configuration) {
    throw new ContractError(
      'deployment_verifier_unconfigured',
      'Mutating deployment actions are held until a privileged immutable verifier is configured.',
    );
  }
  assertNoForbiddenData(authority, 'deployment mutation authority');
  assertExactObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'status',
      'action',
      'provider',
      'operationId',
      'idempotencyKey',
      'tenantId',
      'publicationId',
      'releaseId',
      'predecessorReleaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'payloadSha256',
      'issuedAt',
      'expiresAt',
      'revocationState',
      'revocationListId',
      'evidenceRef',
      'keyId',
      'integritySha256',
      'signatureBase64',
    ],
    'deployment mutation authority',
  );
  assertRequiredObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'status',
      'action',
      'provider',
      'operationId',
      'idempotencyKey',
      'tenantId',
      'publicationId',
      'releaseId',
      'predecessorReleaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'payloadSha256',
      'issuedAt',
      'expiresAt',
      'revocationState',
      'revocationListId',
      'evidenceRef',
      'keyId',
      'integritySha256',
      'signatureBase64',
    ],
    'deployment mutation authority',
  );
  const { signatureBase64, ...signedBody } = clone(authority);
  const { integritySha256, ...body } = signedBody;
  if (
    assertSha256(
      integritySha256,
      'deployment mutation authority integritySha256',
    ) !== canonicalDigest(body)
  ) {
    throw new ContractError(
      'deployment_authority_integrity_invalid',
      'Deployment mutation authority integrity does not match.',
    );
  }
  const authorityId = assertSafeIdentifier(
    body.authorityId,
    'deployment mutation authority authorityId',
  );
  if (
    body.schemaVersion !== 'pumpkin.deployment-mutation-authority.v1' ||
    body.status !== 'APPROVED' ||
    body.action !== scope.action ||
    body.provider !== scope.provider ||
    body.operationId !== scope.operationId ||
    body.idempotencyKey !== scope.idempotencyKey ||
    body.tenantId !== scope.context.tenantId ||
    body.publicationId !== scope.context.publicationId ||
    body.releaseId !== scope.context.releaseId ||
    body.predecessorReleaseId !== scope.predecessorReleaseId ||
    body.artifactId !== scope.context.artifactId ||
    body.resourceGroup !== scope.context.resourceGroup ||
    body.staticWebAppName !== scope.context.staticWebAppName ||
    body.payloadSha256 !== scope.payloadSha256 ||
    body.revocationState !== 'ACTIVE' ||
    body.revocationListId !== configuration.revocationListId ||
    body.keyId !== configuration.mutationKey.keyId
  ) {
    throw new ContractError(
      'deployment_authority_scope_invalid',
      'Deployment mutation authority is not scoped to the exact operation.',
    );
  }
  if (
    !historicalReconciliation &&
    configuration.revokedAuthorityIds.has(authorityId)
  ) {
    throw new ContractError(
      'deployment_authority_revoked',
      'Deployment mutation authority has been revoked.',
    );
  }
  assertDeploymentAuthorityTime(
    body.issuedAt,
    body.expiresAt,
    { requireCurrent: !historicalReconciliation },
  );
  const signature = decodeDeploymentBase64(
    signatureBase64,
    'deployment mutation authority signatureBase64',
  );
  if (
    !verifySignature(
      null,
      Buffer.from(stableDeploymentJson(signedBody), 'utf8'),
      configuration.mutationKey.publicKey,
      signature,
    )
  ) {
    throw new ContractError(
      'deployment_authority_signature_invalid',
      'Deployment mutation authority signature is invalid.',
    );
  }
  return immutable({
    authorityId,
    status: 'APPROVED',
    action: scope.action,
    predecessorReleaseId: scope.predecessorReleaseId,
    evidenceRef: assertSafeRelativeReference(
      body.evidenceRef,
      'deployment mutation authority evidenceRef',
    ),
    keyId: configuration.mutationKey.keyId,
    trustedPublicKeySha256:
      configuration.mutationKey.publicKeySha256,
    integritySha256,
    signatureSha256: sha256(signature),
    issuedAt: body.issuedAt,
    expiresAt: body.expiresAt,
    revocationState: 'ACTIVE',
    revocationListId: configuration.revocationListId,
    authorityReceipt: clone(authority),
  });
}

function verifyHistoricalSerializedMutationAuthority(
  serializedAuthority,
  scope,
  deploymentVerifier,
) {
  const configuration =
    DEPLOYMENT_VERIFIERS.get(deploymentVerifier);
  if (!configuration) {
    throw new ContractError(
      'deployment_verifier_unconfigured',
      'Historical deployment authority verification requires the process-pinned privileged verifier.',
    );
  }
  assertNoForbiddenData(
    serializedAuthority,
    'historical deployment mutation authority',
  );
  assertExactObjectKeys(
    serializedAuthority,
    [
      'authorityId',
      'status',
      'action',
      'predecessorReleaseId',
      'evidenceRef',
      'keyId',
      'trustedPublicKeySha256',
      'integritySha256',
      'signatureSha256',
      'issuedAt',
      'expiresAt',
      'revocationState',
      'revocationListId',
      'authorityReceipt',
    ],
    'historical deployment mutation authority',
  );
  const receipt = clone(serializedAuthority.authorityReceipt);
  const { signatureBase64, ...signedBody } = receipt ?? {};
  const { integritySha256, ...body } = signedBody ?? {};
  const signature = decodeDeploymentBase64(
    signatureBase64,
    'historical deployment mutation authority signatureBase64',
  );
  if (
    canonicalDigest(body) !==
      assertSha256(
        integritySha256,
        'historical deployment mutation authority integritySha256',
      ) ||
    serializedAuthority.authorityId !== body.authorityId ||
    serializedAuthority.status !== 'APPROVED' ||
    serializedAuthority.action !== scope.action ||
    serializedAuthority.predecessorReleaseId !==
      scope.predecessorReleaseId ||
    serializedAuthority.evidenceRef !== body.evidenceRef ||
    serializedAuthority.keyId !== body.keyId ||
    serializedAuthority.keyId !==
      configuration.mutationKey.keyId ||
    serializedAuthority.trustedPublicKeySha256 !==
      configuration.mutationKey.publicKeySha256 ||
    serializedAuthority.integritySha256 !== integritySha256 ||
    serializedAuthority.signatureSha256 !== sha256(signature) ||
    serializedAuthority.issuedAt !== body.issuedAt ||
    serializedAuthority.expiresAt !== body.expiresAt ||
    serializedAuthority.revocationState !== 'ACTIVE' ||
    serializedAuthority.revocationListId !==
      body.revocationListId ||
    body.schemaVersion !==
      'pumpkin.deployment-mutation-authority.v1' ||
    body.status !== 'APPROVED' ||
    body.action !== scope.action ||
    body.provider !== scope.provider ||
    body.operationId !== scope.operationId ||
    body.idempotencyKey !== scope.idempotencyKey ||
    body.tenantId !== scope.context.tenantId ||
    body.publicationId !== scope.context.publicationId ||
    body.releaseId !== scope.context.releaseId ||
    body.predecessorReleaseId !== scope.predecessorReleaseId ||
    body.artifactId !== scope.context.artifactId ||
    body.resourceGroup !== scope.context.resourceGroup ||
    body.staticWebAppName !==
      scope.context.staticWebAppName ||
    body.payloadSha256 !== scope.payloadSha256 ||
    body.revocationState !== 'ACTIVE'
  ) {
    throw new ContractError(
      'deployment_operation_authority_mismatch',
      'Historical deployment operation authority receipt does not match its immutable operation scope.',
    );
  }
  assertSafeIdentifier(
    body.authorityId,
    'historical deployment mutation authorityId',
  );
  assertSafeIdentifier(
    body.keyId,
    'historical deployment mutation keyId',
  );
  assertSafeIdentifier(
    body.revocationListId,
    'historical deployment mutation revocationListId',
  );
  assertSafeRelativeReference(
    body.evidenceRef,
    'historical deployment mutation evidenceRef',
  );
  assertSha256(
    serializedAuthority.trustedPublicKeySha256,
    'historical deployment mutation trustedPublicKeySha256',
  );
  assertDeploymentAuthorityTime(
    body.issuedAt,
    body.expiresAt,
    { requireCurrent: false },
  );
  if (
    !verifySignature(
      null,
      Buffer.from(
        stableDeploymentJson(signedBody),
        'utf8',
      ),
      configuration.mutationKey.publicKey,
      signature,
    )
  ) {
    throw new ContractError(
      'deployment_authority_signature_invalid',
      'Historical deployment mutation authority signature is invalid under the process-pinned mutation key.',
    );
  }
}

function normalizeDeploymentPublicKey(keyId, publicKeyPem, expectedSha256, label) {
  let publicKey;
  let publicKeyDer;
  try {
    publicKey = createPublicKey(publicKeyPem);
    if (publicKey.asymmetricKeyType !== 'ed25519') {
      throw new Error('wrong key type');
    }
    publicKeyDer = publicKey.export({ format: 'der', type: 'spki' });
  } catch {
    throw new ContractError(
      'deployment_verifier_key_invalid',
      `Deployment ${label} verifier key must be Ed25519.`,
    );
  }
  const publicKeySha256 = assertSha256(
    expectedSha256,
    `deployment verifier ${label}PublicKeySha256`,
  );
  if (sha256(publicKeyDer) !== publicKeySha256) {
    throw new ContractError(
      'deployment_verifier_key_hash_invalid',
      `Deployment ${label} verifier key hash does not match.`,
    );
  }
  return {
    keyId: assertSafeIdentifier(
      keyId,
      `deployment verifier ${label}KeyId`,
    ),
    publicKey,
    publicKeySha256,
  };
}

function assertDeploymentBootTrustAnchor(pinnedSha256, actualSha256, label) {
  if (
    typeof pinnedSha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(pinnedSha256)
  ) {
    throw new ContractError(
      'deployment_verifier_boot_trust_anchor_unconfigured',
      `Deployment ${label} verification is held until a lowercase SHA-256 trust anchor is pinned before process startup.`,
    );
  }
  if (pinnedSha256 !== actualSha256) {
    throw new ContractError(
      'deployment_verifier_boot_trust_anchor_mismatch',
      `Deployment ${label} verifier key does not match the process-start trust anchor.`,
    );
  }
}

function assertDeploymentAuthorityTime(
  issuedAt,
  expiresAt,
  { requireCurrent = true } = {},
) {
  const issued = normalizeDeploymentTimestamp(issuedAt, 'issuedAt');
  const expires = normalizeDeploymentTimestamp(expiresAt, 'expiresAt');
  const now = Date.now();
  if (
    expires <= issued ||
    expires - issued > MAX_DEPLOYMENT_AUTHORITY_VALIDITY_MS ||
    (requireCurrent && (issued > now || expires <= now))
  ) {
    throw new ContractError(
      'deployment_authority_time_invalid',
      'Deployment authority is expired, not yet valid, or exceeds its bounded validity.',
    );
  }
}

function assertDeploymentExecutionAuthorityWindow(operation) {
  const expiresAt = Date.parse(
    operation?.mutationAuthority?.expiresAt ?? '',
  );
  if (
    !Number.isFinite(expiresAt) ||
    expiresAt - Date.now() <
      MIN_DEPLOYMENT_EXECUTION_AUTHORITY_REMAINING_MS
  ) {
    throw new ContractError(
      'deployment_authority_execution_window_insufficient',
      'Deployment mutation authority must retain at least five minutes before external execution begins.',
    );
  }
}

function normalizeDeploymentTimestamp(value, label) {
  if (typeof value !== 'string') {
    throw new ContractError(
      'deployment_authority_time_invalid',
      `Deployment authority ${label} must be a canonical UTC timestamp.`,
    );
  }
  const milliseconds = Date.parse(value);
  if (
    !Number.isFinite(milliseconds) ||
    new Date(milliseconds).toISOString() !== value
  ) {
    throw new ContractError(
      'deployment_authority_time_invalid',
      `Deployment authority ${label} must be a canonical UTC timestamp.`,
    );
  }
  return milliseconds;
}

function decodeDeploymentBase64(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(value)
  ) {
    throw new ContractError(
      'deployment_authority_signature_invalid',
      `${label} must be canonical base64.`,
    );
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) {
    throw new ContractError(
      'deployment_authority_signature_invalid',
      `${label} must be canonical base64.`,
    );
  }
  return bytes;
}

function stableDeploymentJson(value) {
  return JSON.stringify(sortDeploymentValue(value));
}

function sortDeploymentValue(value) {
  if (Array.isArray(value)) return value.map(sortDeploymentValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDeploymentValue(value[key])]),
    );
  }
  return value;
}

export class AzureStaticWebAppDeploymentService {
  #adapter;
  #credentialProvider;
  #deploymentVerifier;
  #platformOriginVerifier;
  #operationLedger;
  #repositoryRoot;
  #journal = [];

  constructor({
    adapter,
    credentialProvider,
    deploymentVerifier = null,
    platformOriginVerifier = null,
    operationLedgerRoot = null,
    repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  }) {
    assertAdapter(adapter);
    if (
      !credentialProvider ||
      typeof credentialProvider.describe !== 'function' ||
      typeof credentialProvider.auditedHelperContract !== 'function' ||
      typeof credentialProvider.childEnvironmentContract !== 'function' ||
      typeof credentialProvider.runChild !== 'function'
    ) {
      throw new ContractError(
        'deployment_credential_provider_invalid',
        'Deployment service requires a sealed audited-helper credential provider.',
      );
    }
    this.#adapter = adapter;
    this.#credentialProvider = credentialProvider;
    this.#deploymentVerifier = deploymentVerifier;
    this.#platformOriginVerifier = platformOriginVerifier;
    this.#repositoryRoot = normalizeRepositoryRoot(repositoryRoot);
    this.#operationLedger =
      operationLedgerRoot === null
        ? null
        : new FileBackedDeploymentOperationLedger({
            ledgerRoot: operationLedgerRoot,
            repositoryRoot: this.#repositoryRoot,
          });
  }

  readResource(context) {
    return this.#invoke('read-resource', 'read', context, {}, null);
  }

  createOrReuse(context, approval) {
    return this.#invoke('create-or-reuse', 'azure', context, { sku: 'Free' }, approval);
  }

  tagResource(context, tags, approval) {
    return this.#invoke('tag', 'azure', context, { tags: normalizeTags(tags) }, approval);
  }

  registerPublication(context, record, approval) {
    return this.#invoke(
      'register',
      'publication-registry',
      context,
      { record: normalizePublicMetadata(record, 'publication record') },
      approval,
    );
  }

  async deployExactArtifact(context, rawDeployment, approval) {
    const deployment = normalizeExactDeployment(rawDeployment);
    const operation = buildOperation(
      'deploy',
      'azure-swa',
      context,
      deployment,
      approval,
      { deploymentVerifier: this.#deploymentVerifier },
    );
    const claim = await this.#claimMutation(operation);
    if (claim.replay !== null) return claim.replay;
    const attemptOrdinal = claim.attemptOrdinal;
    let mutationMayHaveStarted = false;
    this.#appendJournal(operation, 'started', {
      artifactInspection: 'pending',
      packageSha256: deployment.packageSha256,
      manifestSha256: deployment.manifestSha256,
      stagedInventorySha256: deployment.stagedInventorySha256,
      valueIncluded: false,
    });
    try {
      const initialInspection = await inspectExactArtifact(
        this.#repositoryRoot,
        operation.context,
        deployment,
        this.#platformOriginVerifier,
      );
      this.#appendJournal(operation, 'validated', {
        packageSha256: initialInspection.packageSha256,
        manifestSha256: initialInspection.manifestSha256,
        stagedInventorySha256: initialInspection.stagedInventorySha256,
        fileCount: initialInspection.fileCount,
        artifactInspection: 'exact',
        valuesIncluded: false,
      });

      const providerMetadata = normalizeProviderMetadata(
        this.#credentialProvider.describe(),
      );
      const auditedHelper = normalizeAuditedHelperContract(
        this.#credentialProvider.auditedHelperContract(),
      );
      const command = buildSealedArtifactMutationCommand(
        operation,
        providerMetadata,
        auditedHelper,
        this.#deploymentVerifier,
      );
      const childContract = this.#credentialProvider.childEnvironmentContract(command);
      assertChildContractBoundToDeployment(
        childContract,
        operation,
        auditedHelper,
        providerMetadata,
      );
      this.#appendJournal(operation, 'executing', {
        credentialReferenceId: childContract.credentialReferenceId,
        commandContractSha256: childContract.contractSha256,
        auditedHelperSha256: childContract.auditedHelperSha256,
        handoffSha256: childContract.handoffSha256,
        environmentVariableName: childContract.environmentVariableName,
        valueIncluded: false,
      });

      verifyDeploymentOperation(operation, {
        deploymentVerifier: this.#deploymentVerifier,
      });
      assertDeploymentExecutionAuthorityWindow(operation);
      mutationMayHaveStarted = true;
      const childResult = await this.#credentialProvider.runChild(command);
      const deploymentIdentity = assertSuccessfulDeploymentChildResult(
        childResult,
        operation,
      );
      const finalInspection = await inspectExactArtifact(
        this.#repositoryRoot,
        operation.context,
        deployment,
        this.#platformOriginVerifier,
      );
      if (
        canonicalDigest(initialInspection) !== canonicalDigest(finalInspection)
      ) {
        throw new ContractError(
          'deployment_artifact_changed_during_execution',
          'The staged artifact changed between pre-deploy validation and post-deploy acceptance.',
        );
      }
      const result = buildTrustedArtifactMutationResult(operation, {
        exitCode: 0,
        signal: null,
        statusCode: 'deployed',
        metadata: {
          deploymentIdentity,
          packageSha256: finalInspection.packageSha256,
          manifestSha256: finalInspection.manifestSha256,
          stagedInventorySha256: finalInspection.stagedInventorySha256,
          fileCount: finalInspection.fileCount,
          postDeployArtifactInspection: 'exact',
        },
        valuesIncluded: false,
      }, this.#deploymentVerifier);
      await this.#completeMutation(
        operation,
        attemptOrdinal,
        result,
      );
      this.#appendJournal(operation, 'completed', {
        resultSha256: result.resultSha256,
        statusCode: result.statusCode,
        deploymentIdentitySha256: canonicalDigest(deploymentIdentity),
        stagedInventorySha256: finalInspection.stagedInventorySha256,
        valuesIncluded: false,
      });
      return result;
    } catch (error) {
      await this.#failMutation(
        operation,
        attemptOrdinal,
        mutationMayHaveStarted,
        error,
      );
      this.#appendJournal(operation, 'failed', {
        errorCode: safeErrorCode(error),
        valuesIncluded: false,
      });
      throw error;
    }
  }

  verifyDeployment(context, expected) {
    return this.#invoke(
      'verify-deployment',
      'validation',
      context,
      {
        packageSha256: assertSha256(expected?.packageSha256, 'verification packageSha256'),
        manifestSha256: assertSha256(expected?.manifestSha256, 'verification manifestSha256'),
        verifyRoutes: expected?.verifyRoutes !== false,
        verifyNoindex: expected?.verifyNoindex !== false,
      },
      null,
    );
  }

  updatePublication(context, update, approval) {
    return this.#invoke(
      'update',
      'publication-registry',
      context,
      { update: normalizePublicMetadata(update, 'publication update') },
      approval,
    );
  }

  async rollback(context, rawRollback, authority) {
    const rollback = normalizeExactRollback(rawRollback);
    const operation = buildOperation(
      'rollback',
      'azure-swa',
      context,
      rollback,
      authority,
      { deploymentVerifier: this.#deploymentVerifier },
    );
    const claim = await this.#claimMutation(operation);
    if (claim.replay !== null) return claim.replay;
    const attemptOrdinal = claim.attemptOrdinal;
    let mutationMayHaveStarted = false;
    this.#appendJournal(operation, 'started', {
      predecessorInspection: 'pending',
      predecessorReleaseId: rollback.predecessorReleaseId,
      packageSha256: rollback.packageSha256,
      manifestSha256: rollback.manifestSha256,
      stagedInventorySha256: rollback.stagedInventorySha256,
      valuesIncluded: false,
    });
    const predecessorContext = {
      ...operation.context,
      publicationId: rollback.predecessorPublicationId,
      releaseId: rollback.predecessorReleaseId,
      artifactId: rollback.predecessorArtifactId,
    };
    try {
      const before = await inspectExactArtifact(
        this.#repositoryRoot,
        predecessorContext,
        rollback,
        this.#platformOriginVerifier,
      );
      this.#appendJournal(operation, 'validated', {
        predecessorInspection: 'exact',
        packageSha256: before.packageSha256,
        manifestSha256: before.manifestSha256,
        stagedInventorySha256: before.stagedInventorySha256,
        valuesIncluded: false,
      });
      const providerMetadata = normalizeProviderMetadata(
        this.#credentialProvider.describe(),
      );
      const auditedHelper = normalizeAuditedHelperContract(
        this.#credentialProvider.auditedHelperContract(),
      );
      const command = buildSealedArtifactMutationCommand(
        operation,
        providerMetadata,
        auditedHelper,
        this.#deploymentVerifier,
      );
      const childContract =
        this.#credentialProvider.childEnvironmentContract(command);
      assertChildContractBoundToDeployment(
        childContract,
        operation,
        auditedHelper,
        providerMetadata,
      );
      this.#appendJournal(operation, 'executing', {
        credentialReferenceId: childContract.credentialReferenceId,
        commandContractSha256: childContract.contractSha256,
        auditedHelperSha256: childContract.auditedHelperSha256,
        handoffSha256: childContract.handoffSha256,
        environmentVariableName: childContract.environmentVariableName,
        operationAction: 'rollback',
        valuesIncluded: false,
      });
      verifyDeploymentOperation(operation, {
        deploymentVerifier: this.#deploymentVerifier,
      });
      assertDeploymentExecutionAuthorityWindow(operation);
      mutationMayHaveStarted = true;
      const childResult =
        await this.#credentialProvider.runChild(command);
      const deploymentIdentity =
        assertSuccessfulDeploymentChildResult(
          childResult,
          operation,
        );
      const after = await inspectExactArtifact(
        this.#repositoryRoot,
        predecessorContext,
        rollback,
        this.#platformOriginVerifier,
      );
      if (canonicalDigest(before) !== canonicalDigest(after)) {
        throw new ContractError(
          'deployment_rollback_artifact_changed',
          'Rollback predecessor artifact changed during execution.',
        );
      }
      const result = buildTrustedArtifactMutationResult(
        operation,
        {
          exitCode: 0,
          signal: null,
          statusCode: 'rolled-back',
          metadata: {
            deploymentIdentity,
            packageSha256: after.packageSha256,
            manifestSha256: after.manifestSha256,
            stagedInventorySha256: after.stagedInventorySha256,
            postDeployArtifactInspection: 'exact',
          },
          valuesIncluded: false,
        },
        this.#deploymentVerifier,
      );
      await this.#completeMutation(
        operation,
        attemptOrdinal,
        result,
      );
      this.#appendJournal(operation, 'completed', {
        resultSha256: result.resultSha256,
        statusCode: result.statusCode,
        predecessorInspection: 'exact',
        valuesIncluded: false,
      });
      return result;
    } catch (error) {
      await this.#failMutation(
        operation,
        attemptOrdinal,
        mutationMayHaveStarted,
        error,
      );
      this.#appendJournal(operation, 'failed', {
        errorCode: safeErrorCode(error),
        valuesIncluded: false,
      });
      throw error;
    }
  }

  revokePublication(context, recordId, approval) {
    return this.#invoke(
      'revoke',
      'publication-registry',
      context,
      { recordId: assertSafeIdentifier(recordId, 'revoke recordId') },
      approval,
    );
  }

  archiveArtifact(context, artifactId, approval) {
    return this.#invoke(
      'archive',
      'artifact-registry',
      context,
      { artifactId: assertSafeIdentifier(artifactId, 'archive artifactId') },
      approval,
    );
  }

  deleteResourcePlan(context, typedConfirmation) {
    const normalized = normalizeContext(context);
    const requiredConfirmation = `DELETE ${normalized.staticWebAppName}`;
    if (typedConfirmation !== requiredConfirmation) {
      throw new ContractError(
        'deployment_delete_confirmation_required',
        'Delete planning requires the exact typed resource-name confirmation.',
      );
    }
    const operation = buildOperation(
      'delete-plan',
      'azure',
      normalized,
      {
        requiredConfirmation,
        confirmationSatisfied: true,
        planOnly: true,
        executable: false,
      },
      null,
      { deploymentVerifier: this.#deploymentVerifier },
    );
    this.#appendJournal(operation, 'planned', { executionIncluded: false, valuesIncluded: false });
    return operation;
  }

  readCustomDomains(context) {
    return this.#invoke(
      'read-custom-domains',
      'azure',
      context,
      { fields: ['hostname', 'status', 'validationState'] },
      null,
    );
  }

  prepareDomainHandoff(context, domain) {
    const normalized = normalizeContext(context);
    const payload = {
      stage: DomainStage.HELD,
      apex: normalizeHostname(domain?.apex),
      www: normalizeHostname(domain?.www),
      dnsProvider: assertSafeIdentifier(domain?.dnsProvider, 'domain dnsProvider'),
      customDomainMutationIncluded: false,
      dnsMutationIncluded: false,
      indexingMutationIncluded: false,
      ownerApprovalRequired: true,
    };
    const operation = buildOperation(
      'domain-handoff',
      'domain',
      normalized,
      payload,
      null,
      { deploymentVerifier: this.#deploymentVerifier },
    );
    this.#appendJournal(operation, 'held', { stage: DomainStage.HELD, valuesIncluded: false });
    return operation;
  }

  journal() {
    return immutable(this.#journal);
  }

  async readClaimedOperation(operationId) {
    if (this.#operationLedger === null) {
      throw new ContractError(
        'deployment_operation_ledger_unconfigured',
        'Claim recovery requires the process-pinned durable operation ledger.',
      );
    }
    const operation =
      await this.#operationLedger.readOperation(operationId);
    verifyHistoricalDeploymentOperation(
      operation,
      this.#deploymentVerifier,
    );
    return operation;
  }

  async reconcileClaimedMutation(
    operationReference,
    authority,
  ) {
    const operation =
      typeof operationReference === 'string'
        ? await this.readClaimedOperation(operationReference)
        : operationReference;
    verifyHistoricalDeploymentOperation(
      operation,
      this.#deploymentVerifier,
    );
    if (!operation.mutationRequired) {
      throw new ContractError(
        'deployment_operation_not_reconcilable',
        'Read-only and planning operations do not enter mutation reconciliation.',
      );
    }
    if (this.#operationLedger === null) {
      throw new ContractError(
        'deployment_operation_ledger_unconfigured',
        'Mutation reconciliation requires the process-pinned durable operation ledger.',
      );
    }
    const reconciliation =
      verifyDeploymentReconciliationAuthority(
        authority,
        this.#deploymentVerifier,
        operation,
      );
    const result =
      reconciliation.resolution === 'APPLIED_EXACT'
        ? buildReconciledMutationResult(
            operation,
            reconciliation,
            this.#deploymentVerifier,
          )
        : null;
    const reconciled = await this.#operationLedger.reconcile(
      operation,
      reconciliation,
      result,
    );
    this.#appendJournal(operation, 'reconciled', {
      resolution: reconciliation.resolution,
      reconciliationAuthoritySha256:
        reconciliation.authoritySha256,
      retryAuthorized: reconciled.retryAuthorized,
      completed: reconciled.completed,
      valuesIncluded: false,
    });
    return reconciled;
  }

  async #invoke(action, provider, context, payload, approval) {
    const operation = buildOperation(action, provider, context, payload, approval, {
      deploymentVerifier: this.#deploymentVerifier,
    });
    const claim = await this.#claimMutation(operation);
    if (claim.replay !== null) return claim.replay;
    const attemptOrdinal = claim.attemptOrdinal;
    this.#appendJournal(operation, 'started', { valuesIncluded: false });
    let mutationMayHaveStarted = false;
    try {
      if (operation.mutationRequired) {
        verifyDeploymentOperation(operation, {
          deploymentVerifier: this.#deploymentVerifier,
        });
        assertDeploymentExecutionAuthorityWindow(operation);
      }
      mutationMayHaveStarted = operation.mutationRequired;
      const adapterResult = await this.#adapter.invoke(operation, {
        deploymentVerifier: this.#deploymentVerifier,
      });
      const result = buildResult(
        operation,
        adapterResult,
        this.#deploymentVerifier,
      );
      await this.#completeMutation(
        operation,
        attemptOrdinal,
        result,
      );
      this.#appendJournal(operation, 'completed', {
        resultSha256: result.resultSha256,
        statusCode: result.statusCode,
        valuesIncluded: false,
      });
      return result;
    } catch (error) {
      await this.#failMutation(
        operation,
        attemptOrdinal,
        mutationMayHaveStarted,
        error,
      );
      this.#appendJournal(operation, 'failed', {
        errorCode: safeErrorCode(error),
        valuesIncluded: false,
      });
      throw error;
    }
  }

  #appendJournal(operation, state, detail) {
    assertNoForbiddenData(detail, 'deployment journal detail');
    const sequence = this.#journal.length + 1;
    this.#journal.push(immutable({
      eventId: deterministicId('deployment-event', {
        sequence,
        operationId: operation.operationId,
        state,
        detail,
      }),
      sequence,
      operationId: operation.operationId,
      action: operation.action,
      tenantId: operation.context.tenantId,
      state,
      detail: clone(detail),
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    }));
  }

  async #claimMutation(operation) {
    if (!operation.mutationRequired) {
      return immutable({
        replay: null,
        attemptOrdinal: null,
      });
    }
    if (this.#operationLedger === null) {
      throw new ContractError(
        'deployment_operation_ledger_unconfigured',
        'Mutating deployment actions are held until an outside-repository durable operation ledger is configured.',
      );
    }
    return this.#operationLedger.claim(operation);
  }

  async #completeMutation(operation, attemptOrdinal, result) {
    if (!operation.mutationRequired) return;
    await this.#operationLedger.complete(
      operation,
      attemptOrdinal,
      result,
    );
  }

  async #failMutation(
    operation,
    attemptOrdinal,
    mutationMayHaveStarted,
    error,
  ) {
    if (!operation.mutationRequired) return;
    await this.#operationLedger.fail(
      operation,
      attemptOrdinal,
      {
        mutationMayHaveStarted,
        errorCode: safeErrorCode(error),
      },
    );
  }
}

class FileBackedDeploymentOperationLedger {
  #ledgerRoot;
  #repositoryRoot;

  constructor({ ledgerRoot, repositoryRoot }) {
    if (
      typeof ledgerRoot !== 'string' ||
      !path.isAbsolute(ledgerRoot)
    ) {
      throw new ContractError(
        'deployment_operation_ledger_invalid',
        'Deployment operation ledger root must be an absolute outside-repository path.',
      );
    }
    this.#ledgerRoot = path.resolve(ledgerRoot);
    this.#repositoryRoot = path.resolve(repositoryRoot);
    if (
      typeof DEPLOYMENT_OPERATION_LEDGER_BOOT_ROOT !== 'string' ||
      !path.isAbsolute(DEPLOYMENT_OPERATION_LEDGER_BOOT_ROOT)
    ) {
      throw new ContractError(
        'deployment_operation_ledger_boot_root_unconfigured',
        'Mutating deployment operations are held until one privileged ledger root is fixed before process startup.',
      );
    }
    const bootLedgerRoot = path.resolve(
      DEPLOYMENT_OPERATION_LEDGER_BOOT_ROOT,
    );
    if (!samePath(this.#ledgerRoot, bootLedgerRoot)) {
      throw new ContractError(
        'deployment_operation_ledger_boot_root_mismatch',
        'Deployment operation ledger root does not match the process-start privileged root.',
      );
    }
    if (!isOutsidePath(this.#repositoryRoot, this.#ledgerRoot)) {
      throw new ContractError(
        'deployment_operation_ledger_invalid',
        'Deployment operation ledger must be outside the repository.',
      );
    }
  }

  async claim(operation) {
    const ledgerRoot = await this.#ensureRoot();
    const paths = ledgerPaths(ledgerRoot, operation.operationId);
    const completed = await readLedgerRecordIfPresent(paths.result);
    if (completed !== null) {
      return immutable({
        replay: verifiedCompletedLedgerResult(completed, operation),
        attemptOrdinal: null,
      });
    }

    for (
      let attemptOrdinal = 1;
      attemptOrdinal <= MAX_CORRECTED_MUTATION_ATTEMPTS;
      attemptOrdinal += 1
    ) {
      const attemptPaths = ledgerAttemptPaths(
        ledgerRoot,
        operation.operationId,
        attemptOrdinal,
      );
      const claim = await readLedgerRecordIfPresent(
        attemptPaths.claim,
      );
      if (claim === null) {
        if (attemptOrdinal > 1) {
          const previousPaths = ledgerAttemptPaths(
            ledgerRoot,
            operation.operationId,
            attemptOrdinal - 1,
          );
          const previousDisposition =
            await readEffectiveAttemptDisposition(
              previousPaths,
              operation,
              attemptOrdinal - 1,
            );
          if (previousDisposition !== 'RETRYABLE') {
            throw new ContractError(
              'deployment_operation_reconciliation_required',
              'A corrected retry requires a durable no-mutation or authoritative reconciliation disposition.',
            );
          }
        }
        const claimRecord = sealLedgerRecord({
          schemaVersion:
            'pumpkin.deployment-operation-attempt.v1',
          state: 'CLAIMED',
          operationId: operation.operationId,
          operationScopeSha256:
            deploymentOperationScopeSha256(operation),
          operation: clone(operation),
          attemptOrdinal,
          valuesIncluded: false,
        });
        const claimCreated =
          await writeIdempotentLedgerRecord(
            attemptPaths.claim,
            claimRecord,
            ledgerRoot,
          );
        if (claimCreated) {
          return immutable({
            replay: null,
            attemptOrdinal,
          });
        }
      } else {
        verifyAttemptClaim(
          claim,
          operation,
          attemptOrdinal,
        );
      }

      const replay = await readLedgerRecordIfPresent(paths.result);
      if (replay !== null) {
        return immutable({
          replay: verifiedCompletedLedgerResult(
            replay,
            operation,
          ),
          attemptOrdinal: null,
        });
      }
      const disposition = await readEffectiveAttemptDisposition(
        attemptPaths,
        operation,
        attemptOrdinal,
      );
      if (disposition === 'RETRYABLE') continue;
      if (disposition === 'COMPLETED') {
        const completedAfterDisposition =
          await readLedgerRecord(paths.result);
        return immutable({
          replay: verifiedCompletedLedgerResult(
            completedAfterDisposition,
            operation,
          ),
          attemptOrdinal: null,
        });
      }
      throw new ContractError(
        'deployment_operation_reconciliation_required',
        'The exact mutation has an unresolved or ambiguous attempt; automatic re-execution is forbidden.',
      );
    }

    throw new ContractError(
      'deployment_corrected_attempt_budget_exhausted',
      'The exact mutation exhausted its bounded three-attempt corrected retry budget.',
    );
  }

  async readOperation(operationId) {
    const ledgerRoot = await this.#ensureRoot();
    const safeOperationId = assertSafeIdentifier(
      operationId,
      'deployment ledger operationId',
    );
    for (
      let attemptOrdinal = 1;
      attemptOrdinal <= MAX_CORRECTED_MUTATION_ATTEMPTS;
      attemptOrdinal += 1
    ) {
      const claim = await readLedgerRecordIfPresent(
        ledgerAttemptPaths(
          ledgerRoot,
          safeOperationId,
          attemptOrdinal,
        ).claim,
      );
      if (claim === null) break;
      if (
        claim?.operationId !== safeOperationId ||
        !claim.operation
      ) {
        throw new ContractError(
          'deployment_operation_ledger_invalid',
          'Stored deployment claim does not contain its recoverable exact operation.',
        );
      }
      verifyAttemptClaim(
        claim,
        claim.operation,
        attemptOrdinal,
      );
      return immutable(clone(claim.operation));
    }
    throw new ContractError(
      'deployment_operation_claim_missing',
      'No durable deployment claim exists for the requested operation ID.',
    );
  }

  async fail(
    operation,
    attemptOrdinal,
    { mutationMayHaveStarted, errorCode },
  ) {
    const ledgerRoot = await this.#ensureRoot();
    const completed = await readLedgerRecordIfPresent(
      ledgerPaths(ledgerRoot, operation.operationId).result,
    );
    if (completed !== null) {
      verifiedCompletedLedgerResult(completed, operation);
      return;
    }
    const attemptPaths = ledgerAttemptPaths(
      ledgerRoot,
      operation.operationId,
      attemptOrdinal,
    );
    const claim = await readLedgerRecord(attemptPaths.claim);
    verifyAttemptClaim(claim, operation, attemptOrdinal);
    const outcome = sealLedgerRecord({
      schemaVersion: 'pumpkin.deployment-operation-attempt.v1',
      state: mutationMayHaveStarted
        ? 'RECONCILIATION_REQUIRED'
        : 'RETRYABLE_NO_MUTATION',
      operationId: operation.operationId,
      operationScopeSha256:
        deploymentOperationScopeSha256(operation),
      attemptOrdinal,
      mutationMayHaveStarted,
      errorCode: assertSafeIdentifier(
        errorCode,
        'deployment attempt errorCode',
      ),
      valuesIncluded: false,
    });
    await writeIdempotentLedgerRecord(
      attemptPaths.outcome,
      outcome,
      ledgerRoot,
    );
  }

  async complete(operation, attemptOrdinal, result) {
    const ledgerRoot = await this.#ensureRoot();
    const paths = ledgerPaths(ledgerRoot, operation.operationId);
    const attemptPaths = ledgerAttemptPaths(
      ledgerRoot,
      operation.operationId,
      attemptOrdinal,
    );
    const claim = await readLedgerRecord(attemptPaths.claim);
    verifyAttemptClaim(claim, operation, attemptOrdinal);
    verifyStoredDeploymentResult(result, operation);
    const completedRecord = sealLedgerRecord({
      schemaVersion: 'pumpkin.deployment-operation-ledger.v1',
      state: 'COMPLETED',
      operationId: operation.operationId,
      operationScopeSha256:
        deploymentOperationScopeSha256(operation),
      result: clone(result),
      valuesIncluded: false,
    });
    await writeCompletedLedgerResult(
      paths.result,
      completedRecord,
      operation,
      result,
      ledgerRoot,
    );
    const outcome = sealLedgerRecord({
      schemaVersion: 'pumpkin.deployment-operation-attempt.v1',
      state: 'COMPLETED',
      operationId: operation.operationId,
      operationScopeSha256:
        deploymentOperationScopeSha256(operation),
      attemptOrdinal,
      resultSha256: result.resultSha256,
      valuesIncluded: false,
    });
    await writeIdempotentLedgerRecord(
      attemptPaths.outcome,
      outcome,
      ledgerRoot,
    );
  }

  async reconcile(operation, reconciliation, result = null) {
    const ledgerRoot = await this.#ensureRoot();
    const paths = ledgerPaths(ledgerRoot, operation.operationId);
    if (await readLedgerRecordIfPresent(paths.result)) {
      throw new ContractError(
        'deployment_operation_already_completed',
        'Completed deployment operations do not require reconciliation.',
      );
    }
    let selected = null;
    for (
      let attemptOrdinal = 1;
      attemptOrdinal <= MAX_CORRECTED_MUTATION_ATTEMPTS;
      attemptOrdinal += 1
    ) {
      const attemptPaths = ledgerAttemptPaths(
        ledgerRoot,
        operation.operationId,
        attemptOrdinal,
      );
      const claim = await readLedgerRecordIfPresent(
        attemptPaths.claim,
      );
      if (claim === null) break;
      verifyAttemptClaim(claim, operation, attemptOrdinal);
      const disposition = await readEffectiveAttemptDisposition(
        attemptPaths,
        operation,
        attemptOrdinal,
      );
      if (
        disposition === null ||
        disposition === 'RECONCILIATION_REQUIRED'
      ) {
        selected = { attemptOrdinal, attemptPaths };
      }
    }
    if (selected === null) {
      throw new ContractError(
        'deployment_operation_not_reconcilable',
        'No unresolved or ambiguous deployment attempt is available for reconciliation.',
      );
    }
    const reconciliationRecordBody = {
      schemaVersion:
        'pumpkin.deployment-operation-reconciliation-record.v1',
      state:
        reconciliation.resolution === 'NOT_APPLIED'
          ? 'RETRY_AUTHORIZED'
          : 'COMPLETED',
      operationId: operation.operationId,
      operationScopeSha256:
        deploymentOperationScopeSha256(operation),
      attemptOrdinal: selected.attemptOrdinal,
      resolution: reconciliation.resolution,
      reconciliationAuthority:
        clone(reconciliation.authority),
      reconciliationAuthoritySha256:
        reconciliation.authoritySha256,
      resultSha256:
        reconciliation.resolution === 'APPLIED_EXACT'
          ? result?.resultSha256
          : null,
      valuesIncluded: false,
    };
    if (reconciliation.resolution === 'APPLIED_EXACT') {
      if (result === null) {
        throw new ContractError(
          'deployment_reconciliation_result_required',
          'Applied reconciliation requires an exact durable deployment result.',
        );
      }
      verifyStoredDeploymentResult(result, operation);
      const completedRecord = sealLedgerRecord({
        schemaVersion:
          'pumpkin.deployment-operation-ledger.v1',
        state: 'COMPLETED',
        operationId: operation.operationId,
        operationScopeSha256:
          deploymentOperationScopeSha256(operation),
        result: clone(result),
        valuesIncluded: false,
      });
      await writeCompletedLedgerResult(
        paths.result,
        completedRecord,
        operation,
        result,
        ledgerRoot,
      );
    } else if (result !== null) {
      throw new ContractError(
        'deployment_reconciliation_result_forbidden',
        'No-mutation reconciliation cannot carry a success result.',
      );
    }
    await writeIdempotentLedgerRecord(
      selected.attemptPaths.reconciliation,
      sealLedgerRecord(reconciliationRecordBody),
      ledgerRoot,
    );
    return immutable({
      resolution: reconciliation.resolution,
      attemptOrdinal: selected.attemptOrdinal,
      retryAuthorized:
        reconciliation.resolution === 'NOT_APPLIED',
      completed:
        reconciliation.resolution === 'APPLIED_EXACT',
      result: result === null ? null : clone(result),
    });
  }

  async #ensureRoot() {
    await fs.mkdir(this.#ledgerRoot, {
      recursive: true,
      mode: 0o700,
    });
    const stat = await fs.lstat(this.#ledgerRoot);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new ContractError(
        'deployment_operation_ledger_invalid',
        'Deployment operation ledger root must be a regular directory.',
      );
    }
    const realRoot = await fs.realpath(this.#ledgerRoot);
    if (
      !samePath(realRoot, this.#ledgerRoot) ||
      !isOutsidePath(this.#repositoryRoot, realRoot)
    ) {
      throw new ContractError(
        'deployment_operation_ledger_invalid',
        'Deployment operation ledger cannot traverse a symlink or repository boundary.',
      );
    }
    return realRoot;
  }
}

function ledgerPaths(ledgerRoot, operationId) {
  const safeOperationId = assertSafeIdentifier(
    operationId,
    'deployment ledger operationId',
  );
  return {
    result: path.join(ledgerRoot, `${safeOperationId}.result.json`),
  };
}

function deploymentOperationScopeSha256(operation) {
  return canonicalDigest({
    schemaVersion: operation?.schemaVersion,
    operationId: operation?.operationId,
    idempotencyKey: operation?.idempotencyKey,
    action: operation?.action,
    provider: operation?.provider,
    context: operation?.context,
    payload: operation?.payload,
    mutationRequired: operation?.mutationRequired,
    credentialValuesIncluded:
      operation?.credentialValuesIncluded,
  });
}

function ledgerAttemptPaths(
  ledgerRoot,
  operationId,
  attemptOrdinal,
) {
  const safeOperationId = assertSafeIdentifier(
    operationId,
    'deployment ledger operationId',
  );
  if (
    !Number.isInteger(attemptOrdinal) ||
    attemptOrdinal < 1 ||
    attemptOrdinal > MAX_CORRECTED_MUTATION_ATTEMPTS
  ) {
    throw new ContractError(
      'deployment_attempt_ordinal_invalid',
      'Deployment attempt ordinal is outside the bounded corrected-attempt budget.',
    );
  }
  const stem = `${safeOperationId}.attempt-${attemptOrdinal}`;
  return {
    claim: path.join(ledgerRoot, `${stem}.claim.json`),
    outcome: path.join(ledgerRoot, `${stem}.outcome.json`),
    reconciliation: path.join(
      ledgerRoot,
      `${stem}.reconciliation.json`,
    ),
  };
}

function verifyAttemptClaim(
  record,
  operation,
  attemptOrdinal,
) {
  assertNoForbiddenData(
    record,
    'deployment operation attempt claim',
  );
  assertNoAbsoluteLocalPaths(
    record,
    'deployment operation attempt claim',
  );
  assertExactObjectKeys(
    record,
    [
      'schemaVersion',
      'state',
      'operationId',
      'operationScopeSha256',
      'operation',
      'attemptOrdinal',
      'valuesIncluded',
      'integritySha256',
    ],
    'deployment operation attempt claim',
  );
  const { integritySha256, ...body } = record;
  const {
    operationSha256: storedOperationSha256,
    ...storedOperationBody
  } = clone(record.operation ?? {});
  if (
    record.schemaVersion !==
      'pumpkin.deployment-operation-attempt.v1' ||
    record.state !== 'CLAIMED' ||
    record.operationId !== operation.operationId ||
    record.operationScopeSha256 !==
      deploymentOperationScopeSha256(operation) ||
    record.operationScopeSha256 !==
      deploymentOperationScopeSha256(record.operation) ||
    canonicalDigest(storedOperationBody) !==
      storedOperationSha256 ||
    record.attemptOrdinal !== attemptOrdinal ||
    record.valuesIncluded !== false ||
    canonicalDigest(body) !== integritySha256
  ) {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation attempt claim is invalid or belongs to a different operation.',
    );
  }
}

function verifyAttemptOutcome(
  record,
  operation,
  attemptOrdinal,
) {
  assertNoForbiddenData(
    record,
    'deployment operation attempt outcome',
  );
  assertNoAbsoluteLocalPaths(
    record,
    'deployment operation attempt outcome',
  );
  const commonKeys = [
    'schemaVersion',
    'state',
    'operationId',
    'operationScopeSha256',
    'attemptOrdinal',
    'valuesIncluded',
    'integritySha256',
  ];
  if (record?.state === 'COMPLETED') {
    assertExactObjectKeys(
      record,
      [...commonKeys, 'resultSha256'],
      'deployment operation attempt outcome',
    );
    assertSha256(
      record.resultSha256,
      'deployment attempt resultSha256',
    );
  } else {
    assertExactObjectKeys(
      record,
      [
        ...commonKeys,
        'mutationMayHaveStarted',
        'errorCode',
      ],
      'deployment operation attempt outcome',
    );
    assertSafeIdentifier(
      record.errorCode,
      'deployment attempt errorCode',
    );
  }
  const { integritySha256, ...body } = record;
  const validState = [
    'RETRYABLE_NO_MUTATION',
    'RECONCILIATION_REQUIRED',
    'COMPLETED',
  ].includes(record?.state);
  const mutationFlagValid =
    record?.state === 'RETRYABLE_NO_MUTATION'
      ? record.mutationMayHaveStarted === false
      : record?.state === 'RECONCILIATION_REQUIRED'
        ? record.mutationMayHaveStarted === true
        : record.mutationMayHaveStarted === undefined;
  if (
    record.schemaVersion !==
      'pumpkin.deployment-operation-attempt.v1' ||
    !validState ||
    !mutationFlagValid ||
    record.operationId !== operation.operationId ||
    record.operationScopeSha256 !==
      deploymentOperationScopeSha256(operation) ||
    record.attemptOrdinal !== attemptOrdinal ||
    record.valuesIncluded !== false ||
    canonicalDigest(body) !== integritySha256
  ) {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation attempt outcome is invalid or belongs to a different operation.',
    );
  }
}

function verifyAttemptReconciliation(
  record,
  operation,
  attemptOrdinal,
) {
  assertNoForbiddenData(
    record,
    'deployment operation reconciliation record',
  );
  assertNoAbsoluteLocalPaths(
    record,
    'deployment operation reconciliation record',
  );
  assertExactObjectKeys(
    record,
    [
      'schemaVersion',
      'state',
      'operationId',
      'operationScopeSha256',
      'attemptOrdinal',
      'resolution',
      'reconciliationAuthority',
      'reconciliationAuthoritySha256',
      'resultSha256',
      'valuesIncluded',
      'integritySha256',
    ],
    'deployment operation reconciliation record',
  );
  const { integritySha256, ...body } = record;
  const retry = record.resolution === 'NOT_APPLIED';
  if (
    record.schemaVersion !==
      'pumpkin.deployment-operation-reconciliation-record.v1' ||
    record.state !==
      (retry ? 'RETRY_AUTHORIZED' : 'COMPLETED') ||
    (!retry && record.resolution !== 'APPLIED_EXACT') ||
    record.operationId !== operation.operationId ||
    record.operationScopeSha256 !==
      deploymentOperationScopeSha256(operation) ||
    record.attemptOrdinal !== attemptOrdinal ||
    assertSha256(
      record.reconciliationAuthoritySha256,
      'deployment reconciliation authority SHA-256',
    ) !== canonicalDigest(record.reconciliationAuthority) ||
    (retry
      ? record.resultSha256 !== null
      : assertSha256(
          record.resultSha256,
          'deployment reconciliation resultSha256',
        ) !== record.resultSha256) ||
    record.valuesIncluded !== false ||
    canonicalDigest(body) !== integritySha256
  ) {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation reconciliation record is invalid or belongs to a different operation.',
    );
  }
}

async function readEffectiveAttemptDisposition(
  paths,
  operation,
  attemptOrdinal,
) {
  const [outcome, reconciliation] = await Promise.all([
    readLedgerRecordIfPresent(paths.outcome),
    readLedgerRecordIfPresent(paths.reconciliation),
  ]);
  if (reconciliation !== null) {
    verifyAttemptReconciliation(
      reconciliation,
      operation,
      attemptOrdinal,
    );
    if (outcome !== null) {
      verifyAttemptOutcome(outcome, operation, attemptOrdinal);
      if (outcome.state !== 'RECONCILIATION_REQUIRED') {
        throw new ContractError(
          'deployment_operation_ledger_conflict',
          'Reconciliation conflicts with a non-ambiguous attempt outcome.',
        );
      }
    }
    return reconciliation.state === 'RETRY_AUTHORIZED'
      ? 'RETRYABLE'
      : 'COMPLETED';
  }
  if (outcome === null) return null;
  verifyAttemptOutcome(outcome, operation, attemptOrdinal);
  if (outcome.state === 'RETRYABLE_NO_MUTATION') {
    return 'RETRYABLE';
  }
  if (outcome.state === 'COMPLETED') return 'COMPLETED';
  return 'RECONCILIATION_REQUIRED';
}

async function writeIdempotentLedgerRecord(
  filePath,
  record,
  ledgerRoot,
) {
  const existing = await readLedgerRecordIfPresent(filePath);
  if (existing !== null) {
    if (canonicalDigest(existing) !== canonicalDigest(record)) {
      throw new ContractError(
        'deployment_operation_ledger_conflict',
        'Durable deployment ledger record conflicts with the supplied transition.',
      );
    }
    return false;
  }
  const temporaryPath = path.join(
    ledgerRoot,
    `.${path.basename(filePath)}.${randomUUID()}.tmp`,
  );
  try {
    await writeExclusiveDurableFile(
      temporaryPath,
      Buffer.from(
        `${stableDeploymentJson(record)}\n`,
        'utf8',
      ),
    );
    await fs.link(temporaryPath, filePath);
    await syncDirectory(ledgerRoot);
    return true;
  } catch (error) {
    if (error?.code === 'EEXIST') {
      const raced = await readLedgerRecord(filePath);
      if (canonicalDigest(raced) === canonicalDigest(record)) {
        return false;
      }
      throw new ContractError(
        'deployment_operation_ledger_conflict',
        'Concurrent deployment ledger transition conflicts with the supplied record.',
      );
    }
    throw error;
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function writeCompletedLedgerResult(
  resultPath,
  completedRecord,
  operation,
  result,
  ledgerRoot,
) {
  const existing = await readLedgerRecordIfPresent(resultPath);
  if (existing !== null) {
    const replay = verifiedCompletedLedgerResult(
      existing,
      operation,
    );
    if (canonicalDigest(replay) !== canonicalDigest(result)) {
      throw new ContractError(
        'deployment_operation_ledger_conflict',
        'Durable deployment result conflicts with the supplied completion.',
      );
    }
    return;
  }
  await writeIdempotentLedgerRecord(
    resultPath,
    completedRecord,
    ledgerRoot,
  );
}

function sealLedgerRecord(body) {
  return {
    ...body,
    integritySha256: canonicalDigest(body),
  };
}

function verifyLedgerRecord(record, operation, expectedState) {
  assertNoForbiddenData(record, 'deployment operation ledger record');
  assertNoAbsoluteLocalPaths(
    record,
    'deployment operation ledger record',
  );
  assertExactObjectKeys(
    record,
    [
      'schemaVersion',
      'state',
      'operationId',
      'operationScopeSha256',
      'result',
      'valuesIncluded',
      'integritySha256',
    ],
    'deployment operation ledger record',
  );
  const { integritySha256, ...body } = record;
  if (
    record.schemaVersion !==
      'pumpkin.deployment-operation-ledger.v1' ||
    record.state !== expectedState ||
    record.operationId !== operation.operationId ||
    record.operationScopeSha256 !==
      deploymentOperationScopeSha256(operation) ||
    record.valuesIncluded !== false ||
    canonicalDigest(body) !== integritySha256 ||
    (expectedState === 'CLAIMED'
      ? record.result !== null
      : record.result === null)
  ) {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation ledger record is invalid or belongs to a different operation.',
    );
  }
}

function verifiedCompletedLedgerResult(record, operation) {
  verifyLedgerRecord(record, operation, 'COMPLETED');
  verifyStoredDeploymentResult(record.result, operation);
  return immutable(record.result);
}

function verifyStoredDeploymentResult(result, operation) {
  assertNoForbiddenData(result, 'stored deployment result');
  assertNoAbsoluteLocalPaths(result, 'stored deployment result');
  assertExactObjectKeys(
    result,
    [
      'schemaVersion',
      'operationId',
      'action',
      'statusCode',
      'exitCode',
      'metadata',
      'rawOutputIncluded',
      'credentialValuesIncluded',
      'resultSha256',
    ],
    'stored deployment result',
  );
  const { resultSha256, ...body } = clone(result);
  if (
    body.schemaVersion !== ContractVersion.deploymentResult ||
    body.operationId !== operation.operationId ||
    body.action !== operation.action ||
    body.rawOutputIncluded !== false ||
    body.credentialValuesIncluded !== false ||
    canonicalDigest(body) !== resultSha256
  ) {
    throw new ContractError(
      'deployment_operation_ledger_result_invalid',
      'Stored deployment result cannot be rederived for the exact operation.',
    );
  }
}

async function readLedgerRecordIfPresent(filePath) {
  try {
    return await readLedgerRecord(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readLedgerRecord(filePath) {
  const stat = await fs.lstat(filePath);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.size <= 0 ||
    stat.size > MAX_MANIFEST_BYTES
  ) {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation ledger record must be a bounded regular file.',
    );
  }
  try {
    return JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(
        await fs.readFile(filePath),
      ),
    );
  } catch {
    throw new ContractError(
      'deployment_operation_ledger_invalid',
      'Deployment operation ledger record must be canonical UTF-8 JSON.',
    );
  }
}

async function writeExclusiveDurableFile(filePath, bytes) {
  const handle = await fs.open(filePath, 'wx', 0o600);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directoryPath) {
  let handle;
  try {
    handle = await fs.open(directoryPath, 'r');
    await handle.sync();
  } catch (error) {
    if (
      !['EINVAL', 'ENOTSUP', 'EPERM', 'EISDIR'].includes(
        error?.code,
      )
    ) {
      throw error;
    }
  } finally {
    await handle?.close().catch(() => {});
  }
}

function isOutsidePath(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  );
}

export function buildOperation(
  action,
  provider,
  context,
  payload,
  authority,
  rawOptions = {},
) {
  assertExactObjectKeys(
    rawOptions,
    ['deploymentVerifier'],
    'deployment operation options',
  );
  const deploymentVerifier = rawOptions.deploymentVerifier ?? null;
  const normalizedContext = normalizeContext(context);
  const normalizedProvider = assertSafeIdentifier(provider, 'deployment operation provider');
  const normalizedAction = assertSafeIdentifier(action, 'deployment operation action');
  const actionContract = DEPLOYMENT_ACTION_CONTRACTS[normalizedAction];
  if (!actionContract || actionContract.provider !== normalizedProvider) {
    throw new ContractError(
      'deployment_action_contract_invalid',
      'Deployment action/provider is outside the closed action contract.',
    );
  }
  const normalizedPayload = normalizePublicMetadata(payload, 'deployment operation payload');
  const scope = deploymentMutationScopeFromNormalized(
    normalizedAction,
    normalizedProvider,
    normalizedContext,
    normalizedPayload,
  );
  let mutationAuthority = null;
  if (actionContract.mutationRequired) {
    mutationAuthority = verifyDeploymentMutationAuthority(
      authority,
      deploymentVerifier,
      scope,
    );
  } else if (authority !== null && authority !== undefined) {
    throw new ContractError(
      'deployment_authority_forbidden',
      'Read-only and planning actions cannot carry mutation authority.',
    );
  }
  const body = {
    schemaVersion: ContractVersion.deploymentOperation,
    operationId: scope.operationId,
    idempotencyKey: scope.idempotencyKey,
    action: normalizedAction,
    provider: normalizedProvider,
    context: normalizedContext,
    payload: normalizedPayload,
    mutationRequired: actionContract.mutationRequired,
    mutationAuthorized: actionContract.mutationRequired,
    mutationAuthority,
    credentialValuesIncluded: false,
  };
  return immutable({
    ...body,
    operationSha256: canonicalDigest(body),
  });
}

export function verifyDeploymentOperation(operation, rawOptions = {}) {
  assertExactObjectKeys(
    rawOptions,
    ['deploymentVerifier'],
    'deployment operation verification options',
  );
  const deploymentVerifier = rawOptions.deploymentVerifier ?? null;
  return verifyDeploymentOperationBody(
    operation,
    deploymentVerifier,
    false,
  );
}

function verifyHistoricalDeploymentOperation(
  operation,
  deploymentVerifier,
) {
  return verifyDeploymentOperationBody(
    operation,
    deploymentVerifier,
    true,
  );
}

function verifyDeploymentOperationBody(
  operation,
  deploymentVerifier,
  historicalReconciliation,
) {
  assertExactObjectKeys(
    operation,
    [
      'schemaVersion',
      'operationId',
      'idempotencyKey',
      'action',
      'provider',
      'context',
      'payload',
      'mutationRequired',
      'mutationAuthorized',
      'mutationAuthority',
      'credentialValuesIncluded',
      'operationSha256',
    ],
    'deployment operation',
  );
  const { operationSha256, ...body } = clone(operation ?? {});
  if (body.schemaVersion !== ContractVersion.deploymentOperation) {
    throw new ContractError('deployment_operation_schema_invalid', 'Deployment operation schema is invalid.');
  }
  if (canonicalDigest(body) !== operationSha256) {
    throw new ContractError('deployment_operation_hash_mismatch', 'Deployment operation hash does not match.');
  }
  const contract = DEPLOYMENT_ACTION_CONTRACTS[body.action];
  if (
    !contract ||
    contract.provider !== body.provider ||
    body.mutationRequired !== contract.mutationRequired ||
    body.mutationAuthorized !== contract.mutationRequired ||
    (contract.mutationRequired
      ? !body.mutationAuthority
      : body.mutationAuthority !== null) ||
    body.credentialValuesIncluded !== false
  ) {
    throw new ContractError(
      'deployment_operation_contract_invalid',
      'Deployment operation violates the closed action/mutation contract.',
    );
  }
  const expectedScope = deploymentMutationScopeFromNormalized(
    body.action,
    body.provider,
    normalizeContext(body.context),
    normalizePublicMetadata(body.payload, 'deployment operation payload'),
  );
  if (
    body.operationId !== expectedScope.operationId ||
    body.idempotencyKey !== expectedScope.idempotencyKey
  ) {
    throw new ContractError(
      'deployment_operation_scope_invalid',
      'Deployment operation identity does not match its exact scope.',
    );
  }
  if (contract.mutationRequired) {
    if (historicalReconciliation) {
      verifyHistoricalSerializedMutationAuthority(
        body.mutationAuthority,
        expectedScope,
        deploymentVerifier,
      );
    } else {
      const reverifiedAuthority = verifyDeploymentMutationAuthority(
        body.mutationAuthority.authorityReceipt,
        deploymentVerifier,
        expectedScope,
      );
      if (
        canonicalDigest(reverifiedAuthority) !==
        canonicalDigest(body.mutationAuthority)
      ) {
        throw new ContractError(
          'deployment_operation_authority_mismatch',
          'Serialized deployment operation authority cannot be rederived under the privileged verifier.',
        );
      }
    }
  }
  assertNoForbiddenData(body, 'deployment operation');
  return true;
}

export function createCurrentPowerShellAdapterDescriptor() {
  const body = {
    adapterType: 'DESIGN_HELD_AUDITED_POWERSHELL_HELPER',
    implementationStatus: 'TRUST_ANCHOR_UNCONFIGURED',
    executionBuiltIn: false,
    helperReference: AuditedDpapiSwaHelperContract.repositoryRelativePath,
    helperContractVersion: AuditedDpapiSwaHelperContract.contractVersion,
    helperHashRequired: true,
    helperTrustAnchorConfigured: false,
    helperHashVerificationRequiredBeforeAndAfterExecution: true,
    helperHashVerifiedBeforeAndAfterExecution: false,
    fixedExecutable: AuditedDpapiSwaHelperContract.executable,
    fixedArguments: AuditedDpapiSwaHelperContract.fixedArguments,
    arbitraryExecutableAllowed: false,
    perCallSpawnInjectionAllowed: false,
    evidenceRefs: [
      'deployment/architecture/tenant-publication/pub-20-a03-token-security-reconciliation/dpapi-envelope-contract.md',
      'deployment/architecture/tenant-publication/pub-20-a03-token-security-reconciliation/secure-token-use-proof.md',
    ],
    credentialDelivery:
      'DESIGN_CONTRACT_AUDITED_HELPER_INTERNAL_CHILD_ENVIRONMENT_ONLY',
    rawOutputCapture: false,
    commandLineCredentialAllowed: false,
    diskCredentialAllowed: false,
    tokenRotationSupported: false,
  };
  return immutable({ ...body, descriptorSha256: canonicalDigest(body) });
}

export class InMemoryDeploymentAdapter {
  #events = [];
  #readbackAuthorityFactory;

  constructor({ readbackAuthorityFactory = null } = {}) {
    if (
      readbackAuthorityFactory !== null &&
      typeof readbackAuthorityFactory !== 'function'
    ) {
      throw new ContractError(
        'deployment_readback_factory_invalid',
        'In-memory adapter readback authority factory must be a function.',
      );
    }
    this.#readbackAuthorityFactory = readbackAuthorityFactory;
  }

  async invoke(operation, rawOptions = {}) {
    verifyDeploymentOperation(operation, rawOptions);
    const actionResult = buildInMemoryActionResult(operation);
    const readbackAuthority =
      this.#readbackAuthorityFactory === null
        ? null
        : await this.#readbackAuthorityFactory(operation, actionResult);
    this.#events.push(immutable({
      action: operation.action,
      operationId: operation.operationId,
      environmentVariableNames: [],
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    }));
    return {
      exitCode: 0,
      signal: null,
      statusCode: operation.action === 'read-resource' ? 'read' : 'completed',
      readbackAuthority,
      valuesIncluded: false,
    };
  }

  buildDeployCommand(operation) {
    throw new ContractError(
      'deployment_adapter_command_boundary_forbidden',
      'Adapters cannot construct deployment commands; the service owns the sealed helper command.',
    );
  }

  async runAuditedHelper(descriptor, forbiddenChildEnvironment) {
    if (forbiddenChildEnvironment !== undefined) {
      throw new ContractError(
        'deployment_plaintext_environment_forbidden',
        'The in-memory audited-helper boundary accepts no caller-provided child environment.',
      );
    }
    assertNoForbiddenData(descriptor, 'in-memory audited helper descriptor');
    if (
      descriptor.inheritParentEnvironment !== false ||
      descriptor.parentCredentialEnvironmentIncluded !== false ||
      descriptor.plaintextIncluded !== false ||
      descriptor.helperOwnsDeployChildSpawn !== true ||
      descriptor.auditedHelperReference !==
        AuditedDpapiSwaHelperContract.repositoryRelativePath
    ) {
      throw new ContractError(
        'deployment_audited_helper_descriptor_invalid',
        'Audited helper descriptor did not preserve the sealed credential boundary.',
      );
    }
    const handoff = descriptor.handoff;
    this.#events.push(immutable({
      action: 'audited-helper-deploy-child',
      executable: descriptor.executable,
      arguments: descriptor.arguments,
      auditedHelperReference: descriptor.auditedHelperReference,
      auditedHelperSha256: descriptor.auditedHelperSha256,
      handoffSha256: descriptor.handoffSha256,
      expectedPackageSha256: handoff.packageSha256,
      expectedManifestSha256: handoff.manifestSha256,
      expectedStagedInventorySha256: handoff.stagedInventorySha256,
      environmentVariableNames: [handoff.environmentVariableName],
      plaintextIncluded: false,
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    }));
    return {
      exitCode: 0,
      signal: null,
      statusCode: 'deployed',
      deploymentIdentity: handoff.expectedDeploymentIdentity,
    };
  }

  async spawnChild(descriptor, forbiddenChildEnvironment) {
    return this.runAuditedHelper(descriptor, forbiddenChildEnvironment);
  }

  events() {
    return immutable(this.#events);
  }
}

function normalizeExactDeployment(rawDeployment = {}) {
  assertNoForbiddenData(rawDeployment, 'exact deployment claim');
  assertExactObjectKeys(
    rawDeployment,
    [
      'artifactRootRef',
      'packageRef',
      'manifestRef',
      'environment',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'exact deployment claim',
  );
  return immutable({
    artifactRootRef: assertSafeRelativeReference(
      rawDeployment.artifactRootRef,
      'deployment artifactRootRef',
    ),
    packageRef: assertSafeRelativeReference(
      rawDeployment.packageRef,
      'deployment packageRef',
    ),
    manifestRef: assertSafeRelativeReference(
      rawDeployment.manifestRef,
      'deployment manifestRef',
    ),
    environment: exact(
      rawDeployment.environment ?? 'production',
      'production',
      'deployment environment',
    ),
    packageSha256: assertSha256(
      rawDeployment.packageSha256,
      'deployment packageSha256',
    ),
    manifestSha256: assertSha256(
      rawDeployment.manifestSha256,
      'deployment manifestSha256',
    ),
    stagedInventorySha256: assertSha256(
      rawDeployment.stagedInventorySha256,
      'deployment stagedInventorySha256',
    ),
  });
}

function normalizeExactRollback(rawRollback = {}) {
  assertNoForbiddenData(rawRollback, 'exact rollback claim');
  assertExactObjectKeys(
    rawRollback,
    [
      'predecessorPublicationId',
      'predecessorReleaseId',
      'predecessorArtifactId',
      'artifactRootRef',
      'packageRef',
      'manifestRef',
      'environment',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'exact rollback claim',
  );
  assertRequiredObjectKeys(
    rawRollback,
    [
      'predecessorPublicationId',
      'predecessorReleaseId',
      'predecessorArtifactId',
      'artifactRootRef',
      'packageRef',
      'manifestRef',
      'environment',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'exact rollback claim',
  );
  return immutable({
    predecessorPublicationId: assertSafeIdentifier(
      rawRollback.predecessorPublicationId,
      'rollback predecessorPublicationId',
      { backend: true },
    ),
    predecessorReleaseId: assertSafeIdentifier(
      rawRollback.predecessorReleaseId,
      'rollback predecessorReleaseId',
    ),
    predecessorArtifactId: assertSafeIdentifier(
      rawRollback.predecessorArtifactId,
      'rollback predecessorArtifactId',
    ),
    artifactRootRef: assertSafeRelativeReference(
      rawRollback.artifactRootRef,
      'rollback artifactRootRef',
    ),
    packageRef: assertSafeRelativeReference(
      rawRollback.packageRef,
      'rollback packageRef',
    ),
    manifestRef: assertSafeRelativeReference(
      rawRollback.manifestRef,
      'rollback manifestRef',
    ),
    environment: exact(
      rawRollback.environment,
      'production',
      'rollback environment',
    ),
    packageSha256: assertSha256(
      rawRollback.packageSha256,
      'rollback packageSha256',
    ),
    manifestSha256: assertSha256(
      rawRollback.manifestSha256,
      'rollback manifestSha256',
    ),
    stagedInventorySha256: assertSha256(
      rawRollback.stagedInventorySha256,
      'rollback stagedInventorySha256',
    ),
    automatic: false,
  });
}

function normalizeProviderMetadata(rawMetadata = {}) {
  assertNoForbiddenData(rawMetadata, 'credential provider metadata');
  const environmentVariableName = normalizeEnvironmentVariableName(
    rawMetadata.environmentVariableName,
  );
  if (environmentVariableName !== 'SWA_CLI_DEPLOYMENT_TOKEN') {
    throw new ContractError(
      'deployment_environment_name_invalid',
      'The audited SWA helper accepts only SWA_CLI_DEPLOYMENT_TOKEN.',
    );
  }
  return immutable({
    credentialReferenceId: assertSafeIdentifier(
      rawMetadata.credentialReferenceId,
      'credential provider credentialReferenceId',
    ),
    environmentVariableName,
    envelopeMetadataId: assertSafeIdentifier(
      rawMetadata.envelopeMetadataId,
      'credential provider envelopeMetadataId',
    ),
    envelopeSha256: assertSha256(
      rawMetadata.envelopeSha256,
      'credential provider envelopeSha256',
    ),
  });
}

function normalizeAuditedHelperContract(rawHelper = {}) {
  assertNoForbiddenData(rawHelper, 'audited helper contract');
  assertExactObjectKeys(
    rawHelper,
    [
      'contractVersion',
      'repositoryRelativePath',
      'invocationReference',
      'executable',
      'workingDirectoryRef',
      'expectedSha256',
      'contractSha256',
    ],
    'audited helper contract',
  );
  const body = {
    contractVersion: exact(
      rawHelper.contractVersion,
      AuditedDpapiSwaHelperContract.contractVersion,
      'audited helper contractVersion',
    ),
    repositoryRelativePath: exact(
      rawHelper.repositoryRelativePath,
      AuditedDpapiSwaHelperContract.repositoryRelativePath,
      'audited helper repositoryRelativePath',
    ),
    invocationReference: exact(
      rawHelper.invocationReference,
      AuditedDpapiSwaHelperContract.invocationReference,
      'audited helper invocationReference',
    ),
    executable: exact(
      rawHelper.executable,
      AuditedDpapiSwaHelperContract.executable,
      'audited helper executable',
    ),
    workingDirectoryRef: exact(
      rawHelper.workingDirectoryRef,
      AuditedDpapiSwaHelperContract.workingDirectoryRef,
      'audited helper workingDirectoryRef',
    ),
    expectedSha256: assertSha256(
      rawHelper.expectedSha256,
      'audited helper expectedSha256',
    ),
  };
  if (canonicalDigest(body) !== rawHelper.contractSha256) {
    throw new ContractError(
      'deployment_helper_contract_hash_mismatch',
      'Audited helper contract hash does not match.',
    );
  }
  return immutable({
    ...body,
    contractSha256: rawHelper.contractSha256,
  });
}

function buildSealedArtifactMutationCommand(
  operation,
  providerMetadata,
  auditedHelper,
  deploymentVerifier,
) {
  verifyDeploymentOperation(operation, { deploymentVerifier });
  if (
    operation.action !== 'deploy' &&
    operation.action !== 'rollback'
  ) {
    throw new ContractError(
      'deployment_action_invalid',
      'Only exact deploy and rollback operations produce audited helper commands.',
    );
  }
  const expectedDeploymentIdentity = expectedDeploymentIdentityFor(operation);
  const effectiveContext = deploymentIdentityContextFor(operation);
  const handoff = immutable({
    schemaVersion: AuditedDpapiSwaHelperContract.handoffContractVersion,
    operationAction: operation.action,
    operationId: operation.operationId,
    tenantId: effectiveContext.tenantId,
    publicationId: effectiveContext.publicationId,
    releaseId: effectiveContext.releaseId,
    predecessorReleaseId:
      operation.action === 'rollback'
        ? operation.payload.predecessorReleaseId
        : null,
    artifactId: effectiveContext.artifactId,
    resourceGroup: effectiveContext.resourceGroup,
    staticWebAppName: effectiveContext.staticWebAppName,
    environment: operation.payload.environment,
    artifactRootRef: operation.payload.artifactRootRef,
    packageRef: operation.payload.packageRef,
    manifestRef: operation.payload.manifestRef,
    packageSha256: operation.payload.packageSha256,
    manifestSha256: operation.payload.manifestSha256,
    stagedInventorySha256: operation.payload.stagedInventorySha256,
    credentialReferenceId: providerMetadata.credentialReferenceId,
    environmentVariableName: providerMetadata.environmentVariableName,
    envelopeMetadataId: providerMetadata.envelopeMetadataId,
    envelopeSha256: providerMetadata.envelopeSha256,
    expectedHelperSha256: auditedHelper.expectedSha256,
    expectedDeploymentIdentity,
  });
  const handoffSha256 = canonicalDigest(handoff);
  return immutable({
    executable: auditedHelper.executable,
    arguments: [
      ...AuditedDpapiSwaHelperContract.fixedArguments,
      '-ContractVersion',
      auditedHelper.contractVersion,
      '-HandoffSha256',
      handoffSha256,
    ],
    workingDirectoryRef: auditedHelper.workingDirectoryRef,
    auditedHelper,
    handoff,
    handoffSha256,
  });
}

function assertChildContractBoundToDeployment(
  childContract,
  operation,
  auditedHelper,
  providerMetadata,
) {
  const expected = operation.payload;
  if (
    childContract.auditedHelperReference !== auditedHelper.repositoryRelativePath ||
    childContract.auditedHelperSha256 !== auditedHelper.expectedSha256 ||
    childContract.auditedHelperContractSha256 !== auditedHelper.contractSha256 ||
    childContract.expectedPackageSha256 !== expected.packageSha256 ||
    childContract.expectedManifestSha256 !== expected.manifestSha256 ||
    childContract.expectedStagedInventorySha256 !==
      expected.stagedInventorySha256 ||
    childContract.operationAction !== operation.action ||
    childContract.envelopeMetadataId !==
      providerMetadata.envelopeMetadataId ||
    childContract.envelopeSha256 !== providerMetadata.envelopeSha256 ||
    childContract.plaintextCrossesProviderBoundary !== false ||
    childContract.callerInjectedSpawnAllowed !== false ||
    childContract.valueReturnedToCaller !== false ||
    childContract.valueOnCommandLine !== false ||
    childContract.valueWrittenToDisk !== false
  ) {
    throw new ContractError(
      'deployment_child_contract_unbound',
      'Credential child contract is not bound to the exact artifact and audited helper.',
    );
  }
}

function assertSuccessfulDeploymentChildResult(rawResult, operation) {
  assertNoForbiddenData(rawResult, 'deployment child result');
  assertExactObjectKeys(
    rawResult,
    [
      'exitCode',
      'signal',
      'statusCode',
      'deploymentIdentity',
      'stdoutCaptured',
      'stderrCaptured',
      'valuesIncluded',
    ],
    'deployment child result',
  );
  assertRequiredObjectKeys(
    rawResult,
    [
      'exitCode',
      'signal',
      'statusCode',
      'deploymentIdentity',
      'stdoutCaptured',
      'stderrCaptured',
      'valuesIncluded',
    ],
    'deployment child result',
  );
  const exitCode = rawResult.exitCode;
  if (
    typeof exitCode !== 'number' ||
    !Number.isInteger(exitCode) ||
    exitCode < 0 ||
    exitCode > 255
  ) {
    throw new ContractError(
      'deployment_child_exit_invalid',
      'Deployment child returned an invalid exit code.',
    );
  }
  if (rawResult.signal !== null) {
    throw new ContractError(
      'deployment_child_signaled',
      'Deployment child terminated by signal.',
    );
  }
  if (exitCode !== 0) {
    throw new ContractError(
      'deployment_child_nonzero_exit',
      'Deployment child returned a nonzero exit code.',
    );
  }
  const expectedStatusCode =
    operation.action === 'rollback' ? 'rolled-back' : 'deployed';
  if (rawResult.statusCode !== expectedStatusCode) {
    throw new ContractError(
      'deployment_child_status_failed',
      'Deployment child did not return the required deployed status.',
    );
  }
  if (
    rawResult.stdoutCaptured !== false ||
    rawResult.stderrCaptured !== false ||
    rawResult.valuesIncluded !== false
  ) {
    throw new ContractError(
      'deployment_child_output_boundary_invalid',
      'Deployment child result violated the status-only output boundary.',
    );
  }
  const identity = normalizeAuthoritativeDeploymentIdentity(
    rawResult.deploymentIdentity,
  );
  const expectedIdentity = expectedDeploymentIdentityFor(operation);
  if (canonicalDigest(identity) !== canonicalDigest(expectedIdentity)) {
    throw new ContractError(
      'deployment_post_deploy_identity_mismatch',
      'Authoritative post-deploy identity does not match the requested artifact and target.',
    );
  }
  return identity;
}

function expectedDeploymentIdentityFor(operation) {
  const effectiveContext = deploymentIdentityContextFor(operation);
  return immutable({
    schemaVersion:
      AuditedDpapiSwaHelperContract.authoritativeIdentityContractVersion,
    provider: 'AZURE_STATIC_WEB_APPS',
    authority: 'AUDITED_HELPER_POST_DEPLOY_READBACK',
    authoritative: true,
    tenantId: effectiveContext.tenantId,
    publicationId: effectiveContext.publicationId,
    releaseId: effectiveContext.releaseId,
    artifactId: effectiveContext.artifactId,
    resourceGroup: effectiveContext.resourceGroup,
    staticWebAppName: effectiveContext.staticWebAppName,
    environment: operation.payload.environment,
    packageSha256: operation.payload.packageSha256,
    manifestSha256: operation.payload.manifestSha256,
    stagedInventorySha256: operation.payload.stagedInventorySha256,
  });
}

function deploymentIdentityContextFor(operation) {
  if (operation.action === 'rollback') {
    return {
      ...operation.context,
      publicationId: operation.payload.predecessorPublicationId,
      releaseId: operation.payload.predecessorReleaseId,
      artifactId: operation.payload.predecessorArtifactId,
    };
  }
  return operation.context;
}

function normalizeAuthoritativeDeploymentIdentity(rawIdentity = {}) {
  assertNoForbiddenData(rawIdentity, 'authoritative deployment identity');
  assertExactObjectKeys(
    rawIdentity,
    [
      'schemaVersion',
      'provider',
      'authority',
      'authoritative',
      'tenantId',
      'publicationId',
      'releaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'environment',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'authoritative deployment identity',
  );
  return immutable({
    schemaVersion: exact(
      rawIdentity.schemaVersion,
      AuditedDpapiSwaHelperContract.authoritativeIdentityContractVersion,
      'deployment identity schemaVersion',
    ),
    provider: exact(
      rawIdentity.provider,
      'AZURE_STATIC_WEB_APPS',
      'deployment identity provider',
    ),
    authority: exact(
      rawIdentity.authority,
      'AUDITED_HELPER_POST_DEPLOY_READBACK',
      'deployment identity authority',
    ),
    authoritative: exact(
      rawIdentity.authoritative,
      true,
      'deployment identity authoritative',
    ),
    tenantId: assertSafeIdentifier(
      rawIdentity.tenantId,
      'deployment identity tenantId',
      { backend: true },
    ),
    publicationId: assertSafeIdentifier(
      rawIdentity.publicationId,
      'deployment identity publicationId',
      { backend: true },
    ),
    releaseId: assertSafeIdentifier(
      rawIdentity.releaseId,
      'deployment identity releaseId',
    ),
    artifactId: assertSafeIdentifier(
      rawIdentity.artifactId,
      'deployment identity artifactId',
    ),
    resourceGroup: assertSafeIdentifier(
      rawIdentity.resourceGroup,
      'deployment identity resourceGroup',
    ),
    staticWebAppName: assertSafeIdentifier(
      rawIdentity.staticWebAppName,
      'deployment identity staticWebAppName',
      { backend: true },
    ),
    environment: exact(
      rawIdentity.environment,
      'production',
      'deployment identity environment',
    ),
    packageSha256: assertSha256(
      rawIdentity.packageSha256,
      'deployment identity packageSha256',
    ),
    manifestSha256: assertSha256(
      rawIdentity.manifestSha256,
      'deployment identity manifestSha256',
    ),
    stagedInventorySha256: assertSha256(
      rawIdentity.stagedInventorySha256,
      'deployment identity stagedInventorySha256',
    ),
  });
}

async function inspectExactArtifact(
  repositoryRoot,
  context,
  deployment,
  platformOriginVerifier,
) {
  const resolvedRepositoryRoot = await verifyRepositoryRoot(repositoryRoot);
  const artifactRoot = resolveRepositoryReference(
    resolvedRepositoryRoot,
    deployment.artifactRootRef,
    'deployment artifactRootRef',
  );
  const packagePath = resolveRepositoryReference(
    resolvedRepositoryRoot,
    deployment.packageRef,
    'deployment packageRef',
  );
  const manifestPath = resolveRepositoryReference(
    resolvedRepositoryRoot,
    deployment.manifestRef,
    'deployment manifestRef',
  );
  await verifyRegularDirectory(artifactRoot, resolvedRepositoryRoot, 'artifact root');
  await verifyRegularFile(packagePath, resolvedRepositoryRoot, 'artifact package');
  await verifyRegularFile(manifestPath, resolvedRepositoryRoot, 'artifact manifest');
  if (
    samePath(packagePath, manifestPath) ||
    isSameOrDescendant(artifactRoot, packagePath) ||
    isSameOrDescendant(artifactRoot, manifestPath)
  ) {
    throw new ContractError(
      'deployment_artifact_layout_invalid',
      'Package and manifest must be distinct files outside the staged artifact root.',
    );
  }
  const [packageBytes, manifestBytes] = await Promise.all([
    fs.readFile(packagePath),
    fs.readFile(manifestPath),
  ]);
  if (
    packageBytes.length <= 0 ||
    packageBytes.length > MAX_ARTIFACT_BYTES ||
    manifestBytes.length <= 0 ||
    manifestBytes.length > MAX_MANIFEST_BYTES
  ) {
    throw new ContractError(
      'deployment_artifact_size_invalid',
      'Artifact package or manifest exceeds the bounded deployment contract.',
    );
  }
  const observedPackageSha256 = sha256(packageBytes);
  const observedManifestSha256 = sha256(manifestBytes);
  if (
    observedPackageSha256 !== deployment.packageSha256 ||
    observedManifestSha256 !== deployment.manifestSha256
  ) {
    throw new ContractError(
      'deployment_artifact_hash_mismatch',
      'Staged package or manifest bytes do not match the approved hashes.',
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(manifestBytes),
    );
  } catch {
    throw new ContractError(
      'deployment_manifest_invalid',
      'Artifact manifest must be valid UTF-8 JSON.',
    );
  }
  assertNoForbiddenData(manifest, 'artifact manifest');
  assertNoAbsoluteLocalPaths(manifest, 'artifact manifest');
  if (
    manifest.schemaVersion !== ContractVersion.artifactManifest ||
    manifest.tenantUid !== context.tenantId ||
    manifest.artifactId !== context.artifactId ||
    manifest.publicationId !== context.publicationId ||
    manifest.releaseId !== context.releaseId ||
    manifest.packageSha256 !== deployment.packageSha256 ||
    manifest.packageBytes !== packageBytes.length
  ) {
    throw new ContractError(
      'deployment_manifest_identity_mismatch',
      'Artifact manifest does not bind the exact tenant, release, publication, artifact, and package.',
    );
  }
  let platformOriginAuthorityReceiptSha256 = null;
  if (manifest.formMode === FormMode.PUBLIC_FORMS_LIVE) {
    if (
      !manifest.platformOriginAuthorityReceipt ||
      manifest.platformOriginAuthorityReceiptSha256 !==
        canonicalDigest(manifest.platformOriginAuthorityReceipt)
    ) {
      throw new ContractError(
        'deployment_platform_origin_receipt_invalid',
        'PUBLIC_FORMS_LIVE deployment requires an exact signed platform-origin receipt.',
      );
    }
    verifyPlatformOriginAuthorityReceipt(
      manifest.platformOriginAuthorityReceipt,
      platformOriginVerifier,
      {
        apiBaseUrl: manifest.publicFormApiOrigin,
        tenantUid: manifest.tenantUid,
        publicationId: manifest.publicationId,
        releaseId: manifest.releaseId,
        artifactId: manifest.artifactId,
        snapshotId: manifest.snapshotId,
        formsSha256: manifest.formsSha256,
      },
    );
    platformOriginAuthorityReceiptSha256 =
      manifest.platformOriginAuthorityReceiptSha256;
  } else if (
    manifest.formMode !== FormMode.PREVIEW_NO_POST ||
    manifest.publicFormApiOrigin !== null ||
    manifest.platformOriginAuthorityReceipt !== null ||
    manifest.platformOriginAuthorityReceiptSha256 !== null
  ) {
    throw new ContractError(
      'deployment_platform_origin_receipt_forbidden',
      'Preview artifacts cannot carry platform-origin activation authority.',
    );
  }

  const manifestInventory = normalizeArtifactInventory(manifest.files);
  if (
    manifest.fileCount !== manifestInventory.length ||
    manifestInventory.length === 0
  ) {
    throw new ContractError(
      'deployment_manifest_inventory_invalid',
      'Artifact manifest file count does not match its exact inventory.',
    );
  }
  let packageInventory;
  try {
    packageInventory = normalizeArtifactInventory(
      readDeterministicTarInventory(packageBytes),
    );
  } catch (error) {
    throw new ContractError(
      'deployment_package_inventory_invalid',
      'Artifact package is not a valid deterministic archive.',
      { reasonCode: safeErrorCode(error) },
    );
  }
  const stagedInventory = await inventoryArtifactDirectory(artifactRoot);
  assertInventoriesEqual(
    manifestInventory,
    packageInventory,
    'deployment_package_manifest_inventory_mismatch',
  );
  assertInventoriesEqual(
    manifestInventory,
    stagedInventory,
    'deployment_staged_inventory_mismatch',
  );
  const stagedInventorySha256 = canonicalDigest(stagedInventory);
  if (stagedInventorySha256 !== deployment.stagedInventorySha256) {
    throw new ContractError(
      'deployment_staged_inventory_hash_mismatch',
      'Staged artifact inventory does not match the approved inventory SHA-256.',
    );
  }
  return immutable({
    packageSha256: observedPackageSha256,
    packageBytes: packageBytes.length,
    manifestSha256: observedManifestSha256,
    manifestBytes: manifestBytes.length,
    stagedInventorySha256,
    fileCount: stagedInventory.length,
    platformOriginAuthorityReceiptSha256,
  });
}

function normalizeArtifactInventory(rawInventory) {
  if (
    !Array.isArray(rawInventory) ||
    rawInventory.length === 0 ||
    rawInventory.length > MAX_ARTIFACT_FILES
  ) {
    throw new ContractError(
      'deployment_inventory_invalid',
      'Artifact inventory must be a nonempty bounded array.',
    );
  }
  const seen = new Set();
  return rawInventory
    .map((rawFile) => {
      assertExactObjectKeys(
        rawFile,
        ['path', 'bytes', 'sha256'],
        'artifact inventory entry',
      );
      const filePath = assertSafeArtifactPath(
        rawFile.path,
        'artifact inventory path',
      );
      if (seen.has(filePath)) {
        throw new ContractError(
          'deployment_inventory_collision',
          'Artifact inventory contains duplicate paths.',
        );
      }
      seen.add(filePath);
      const bytes = Number(rawFile.bytes);
      if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > MAX_ARTIFACT_BYTES) {
        throw new ContractError(
          'deployment_inventory_size_invalid',
          'Artifact inventory entry has an invalid byte length.',
        );
      }
      return {
        path: filePath,
        bytes,
        sha256: assertSha256(rawFile.sha256, 'artifact inventory file sha256'),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

async function inventoryArtifactDirectory(root) {
  const inventory = [];
  let totalBytes = 0;

  async function walk(directory, prefix) {
    const entries = (await fs.readdir(directory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name, 'en'),
    );
    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = path.join(directory, entry.name);
      const stat = await fs.lstat(absolutePath);
      if (stat.isSymbolicLink()) {
        throw new ContractError(
          'deployment_artifact_symlink_forbidden',
          'Staged artifacts cannot contain symbolic links or junctions.',
        );
      }
      if (stat.isDirectory()) {
        await walk(absolutePath, relativePath);
        continue;
      }
      if (!stat.isFile()) {
        throw new ContractError(
          'deployment_artifact_entry_invalid',
          'Staged artifacts can contain only regular files and directories.',
        );
      }
      if (inventory.length >= MAX_ARTIFACT_FILES) {
        throw new ContractError(
          'deployment_inventory_too_large',
          'Staged artifact contains too many files.',
        );
      }
      const safePath = assertSafeArtifactPath(
        relativePath.replaceAll('\\', '/'),
        'staged artifact path',
      );
      const bytes = await fs.readFile(absolutePath);
      totalBytes += bytes.length;
      if (totalBytes > MAX_ARTIFACT_BYTES) {
        throw new ContractError(
          'deployment_artifact_too_large',
          'Staged artifact exceeds the bounded total byte size.',
        );
      }
      inventory.push({
        path: safePath,
        bytes: bytes.length,
        sha256: sha256(bytes),
      });
    }
  }

  await walk(root, '');
  return normalizeArtifactInventory(inventory);
}

function assertInventoriesEqual(expected, observed, errorCode) {
  if (
    expected.length !== observed.length ||
    expected.some(
      (file, index) =>
        file.path !== observed[index].path ||
        file.bytes !== observed[index].bytes ||
        file.sha256 !== observed[index].sha256,
    )
  ) {
    throw new ContractError(
      errorCode,
      'Artifact inventories do not match exactly.',
    );
  }
}

async function verifyRepositoryRoot(repositoryRoot) {
  let stat;
  try {
    stat = await fs.lstat(repositoryRoot);
  } catch {
    throw new ContractError(
      'deployment_repository_root_missing',
      'Deployment repository root is missing.',
    );
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new ContractError(
      'deployment_repository_root_invalid',
      'Deployment repository root must be a regular directory.',
    );
  }
  return fs.realpath(repositoryRoot);
}

async function verifyRegularDirectory(value, repositoryRoot, label) {
  let stat;
  try {
    stat = await fs.lstat(value);
  } catch {
    throw new ContractError(
      'deployment_artifact_missing',
      `${label} is missing.`,
    );
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new ContractError(
      'deployment_artifact_type_invalid',
      `${label} must be a regular directory.`,
    );
  }
  const real = await fs.realpath(value);
  assertPathInside(repositoryRoot, real, label);
  if (!samePath(value, real)) {
    throw new ContractError(
      'deployment_artifact_symlink_forbidden',
      `${label} resolves through a symbolic-link boundary.`,
    );
  }
}

async function verifyRegularFile(value, repositoryRoot, label) {
  let stat;
  try {
    stat = await fs.lstat(value);
  } catch {
    throw new ContractError(
      'deployment_artifact_missing',
      `${label} is missing.`,
    );
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new ContractError(
      'deployment_artifact_type_invalid',
      `${label} must be a regular file.`,
    );
  }
  const real = await fs.realpath(value);
  assertPathInside(repositoryRoot, real, label);
  if (!samePath(value, real)) {
    throw new ContractError(
      'deployment_artifact_symlink_forbidden',
      `${label} resolves through a symbolic-link boundary.`,
    );
  }
}

function normalizeRepositoryRoot(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    throw new ContractError(
      'deployment_repository_root_invalid',
      'Deployment repository root must be an absolute local directory.',
    );
  }
  return path.resolve(value);
}

function resolveRepositoryReference(repositoryRoot, reference, label) {
  const normalized = assertSafeRelativeReference(reference, label);
  const resolved = path.resolve(repositoryRoot, ...normalized.split('/'));
  assertPathInside(repositoryRoot, resolved, label);
  return resolved;
}

function assertPathInside(repositoryRoot, value, label) {
  const relative = path.relative(repositoryRoot, value);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ContractError(
      'deployment_repository_boundary_invalid',
      `${label} must resolve below the repository root.`,
    );
  }
}

function isSameOrDescendant(root, candidate) {
  if (samePath(root, candidate)) return true;
  const relative = path.relative(root, candidate);
  return Boolean(
    relative &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative),
  );
}

function samePath(left, right) {
  const normalize = (value) => {
    const resolved = path.resolve(value);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  };
  return normalize(left) === normalize(right);
}

function normalizeEnvironmentVariableName(value) {
  const name = String(value ?? '');
  if (!/^[A-Z][A-Z0-9_]{1,126}$/.test(name)) {
    throw new ContractError(
      'deployment_environment_name_invalid',
      'Credential environment variable name is invalid.',
    );
  }
  return name;
}

function assertExactObjectKeys(value, allowedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Buffer.isBuffer(value)) {
    throw new ContractError(
      'deployment_contract_invalid',
      `${label} must be an object.`,
    );
  }
  const allowed = new Set(allowedKeys);
  const extras = Object.keys(value).filter((key) => !allowed.has(key));
  if (extras.length > 0) {
    throw new ContractError(
      'deployment_contract_field_forbidden',
      `${label} contains unsupported fields.`,
      { fields: extras.sort() },
    );
  }
}

function buildResult(operation, rawResult = {}, deploymentVerifier = null) {
  verifyDeploymentOperation(operation, { deploymentVerifier });
  if (operation.action === 'deploy') {
    throw new ContractError(
      'deployment_result_action_invalid',
      'Deploy results must come from the audited-helper identity boundary.',
    );
  }
  assertNoForbiddenData(rawResult, 'deployment adapter result');
  assertExactObjectKeys(
    rawResult,
    [
      'exitCode',
      'signal',
      'statusCode',
      'readbackAuthority',
      'valuesIncluded',
    ],
    'deployment adapter result',
  );
  assertRequiredObjectKeys(
    rawResult,
    [
      'exitCode',
      'signal',
      'statusCode',
      'readbackAuthority',
      'valuesIncluded',
    ],
    'deployment adapter result',
  );
  const exitCode = rawResult.exitCode;
  if (
    typeof exitCode !== 'number' ||
    !Number.isInteger(exitCode) ||
    exitCode < 0 ||
    exitCode > 255
  ) {
    throw new ContractError('deployment_result_exit_invalid', 'Deployment result exit code is invalid.');
  }
  if (rawResult.signal !== null) {
    throw new ContractError(
      'deployment_result_signaled',
      'Deployment operation terminated by signal.',
    );
  }
  if (exitCode !== 0) {
    throw new ContractError(
      'deployment_result_nonzero_exit',
      'Deployment operation returned a nonzero exit code.',
    );
  }
  if (rawResult.valuesIncluded !== false) {
    throw new ContractError(
      'deployment_result_value_boundary_invalid',
      'Deployment operation result must explicitly exclude credential values.',
    );
  }
  const statusCode = assertSafeIdentifier(
    rawResult.statusCode,
    'deployment result statusCode',
  );
  if (!successfulStatusCodes(operation.action).has(statusCode)) {
    throw new ContractError(
      'deployment_result_status_failed',
      'Deployment operation did not return an accepted success status.',
    );
  }
  const readback = verifyDeploymentReadbackAuthority(
    rawResult.readbackAuthority,
    deploymentVerifier,
    operation,
  );
  const metadata = immutable({
    actionResult: readback.actionResult,
    readbackAuthority: readback.authority,
  });
  const body = {
    schemaVersion: ContractVersion.deploymentResult,
    operationId: operation.operationId,
    action: operation.action,
    statusCode,
    exitCode,
    metadata,
    rawOutputIncluded: false,
    credentialValuesIncluded: false,
  };
  return immutable({ ...body, resultSha256: canonicalDigest(body) });
}

function buildTrustedArtifactMutationResult(
  operation,
  rawResult = {},
  deploymentVerifier = null,
) {
  verifyDeploymentOperation(operation, { deploymentVerifier });
  if (
    operation.action !== 'deploy' &&
    operation.action !== 'rollback'
  ) {
    throw new ContractError(
      'deployment_result_action_invalid',
      'Trusted artifact-mutation results are valid only for exact deploy or rollback operations.',
    );
  }
  assertNoForbiddenData(rawResult, 'trusted deployment result');
  assertExactObjectKeys(
    rawResult,
    ['exitCode', 'signal', 'statusCode', 'metadata', 'valuesIncluded'],
    'trusted deployment result',
  );
  assertRequiredObjectKeys(
    rawResult,
    ['exitCode', 'signal', 'statusCode', 'metadata', 'valuesIncluded'],
    'trusted deployment result',
  );
  if (
    rawResult.exitCode !== 0 ||
    rawResult.signal !== null ||
    rawResult.statusCode !==
      (operation.action === 'rollback' ? 'rolled-back' : 'deployed') ||
    rawResult.valuesIncluded !== false
  ) {
    throw new ContractError(
      'deployment_result_status_failed',
      'Trusted deploy result is not a successful status-only result.',
    );
  }
  const metadata = normalizePublicMetadata(
    rawResult.metadata,
    'trusted deployment result metadata',
  );
  const expectedIdentity = expectedDeploymentIdentityFor(operation);
  if (
    canonicalDigest(metadata.deploymentIdentity) !==
      canonicalDigest(expectedIdentity) ||
    metadata.packageSha256 !== operation.payload.packageSha256 ||
    metadata.manifestSha256 !== operation.payload.manifestSha256 ||
    metadata.stagedInventorySha256 !==
      operation.payload.stagedInventorySha256 ||
    metadata.postDeployArtifactInspection !== 'exact'
  ) {
    throw new ContractError(
      'deployment_post_deploy_identity_mismatch',
      'Trusted deploy result is not bound to the exact artifact readback.',
    );
  }
  const body = {
    schemaVersion: ContractVersion.deploymentResult,
    operationId: operation.operationId,
    action: operation.action,
    statusCode:
      operation.action === 'rollback' ? 'rolled-back' : 'deployed',
    exitCode: 0,
    metadata,
    rawOutputIncluded: false,
    credentialValuesIncluded: false,
  };
  return immutable({ ...body, resultSha256: canonicalDigest(body) });
}

function buildReconciledMutationResult(
  operation,
  reconciliation,
  deploymentVerifier,
) {
  verifyHistoricalDeploymentOperation(
    operation,
    deploymentVerifier,
  );
  if (reconciliation.resolution !== 'APPLIED_EXACT') {
    throw new ContractError(
      'deployment_reconciliation_result_forbidden',
      'Only an exact applied reconciliation can create a durable success result.',
    );
  }
  if (
    operation.action === 'deploy' ||
    operation.action === 'rollback'
  ) {
    const metadata = immutable({
      deploymentIdentity:
        reconciliation.evidence.deploymentIdentity,
      packageSha256:
        reconciliation.evidence.packageSha256,
      manifestSha256:
        reconciliation.evidence.manifestSha256,
      stagedInventorySha256:
        reconciliation.evidence.stagedInventorySha256,
      postDeployArtifactInspection: 'exact',
      reconciliationAuthoritySha256:
        reconciliation.authoritySha256,
    });
    const body = {
      schemaVersion: ContractVersion.deploymentResult,
      operationId: operation.operationId,
      action: operation.action,
      statusCode:
        operation.action === 'rollback'
          ? 'rolled-back'
          : 'deployed',
      exitCode: 0,
      metadata,
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    };
    return immutable({
      ...body,
      resultSha256: canonicalDigest(body),
    });
  }
  const statusCodes = successfulStatusCodes(operation.action);
  const statusCode = statusCodes.has('completed')
    ? 'completed'
    : [...statusCodes][0];
  const metadata = immutable({
    actionResult: reconciliation.evidence,
    reconciliationAuthority: {
      authorityId: reconciliation.authorityId,
      authoritySha256: reconciliation.authoritySha256,
      trustedPublicKeySha256:
        reconciliation.trustedPublicKeySha256,
      resolution: 'APPLIED_EXACT',
    },
  });
  const body = {
    schemaVersion: ContractVersion.deploymentResult,
    operationId: operation.operationId,
    action: operation.action,
    statusCode,
    exitCode: 0,
    metadata,
    rawOutputIncluded: false,
    credentialValuesIncluded: false,
  };
  return immutable({
    ...body,
    resultSha256: canonicalDigest(body),
  });
}

export function deploymentReadbackAuthorityScope(
  operation,
  rawActionResult,
  rawOptions = {},
) {
  verifyDeploymentOperation(operation, rawOptions);
  if (
    operation.action === 'deploy' ||
    operation.mutationRequired !==
      DEPLOYMENT_ACTION_CONTRACTS[operation.action]?.mutationRequired
  ) {
    throw new ContractError(
      'deployment_readback_action_invalid',
      'This operation does not use the generic action-readback contract.',
    );
  }
  const actionResult = normalizeActionResult(operation, rawActionResult);
  return immutable({
    action: operation.action,
    provider: operation.provider,
    operationId: operation.operationId,
    idempotencyKey: operation.idempotencyKey,
    tenantId: operation.context.tenantId,
    publicationId: operation.context.publicationId,
    releaseId: operation.context.releaseId,
    predecessorReleaseId:
      operation.action === 'rollback'
        ? operation.payload.predecessorReleaseId
        : null,
    artifactId: operation.context.artifactId,
    resourceGroup: operation.context.resourceGroup,
    staticWebAppName: operation.context.staticWebAppName,
    payloadSha256: canonicalDigest(operation.payload),
    actionResult,
  });
}

export function deploymentReconciliationAuthorityScope(
  operation,
  resolution,
  rawEvidence,
  rawOptions = {},
) {
  assertExactObjectKeys(
    rawOptions,
    ['deploymentVerifier'],
    'deployment reconciliation scope options',
  );
  verifyHistoricalDeploymentOperation(
    operation,
    rawOptions.deploymentVerifier ?? null,
  );
  return deploymentReconciliationScopeFromVerifiedOperation(
    operation,
    resolution,
    rawEvidence,
  );
}

function deploymentReconciliationScopeFromVerifiedOperation(
  operation,
  resolution,
  rawEvidence,
) {
  if (!operation.mutationRequired) {
    throw new ContractError(
      'deployment_operation_not_reconcilable',
      'Only mutating deployment operations have a reconciliation authority scope.',
    );
  }
  if (
    resolution !== 'NOT_APPLIED' &&
    resolution !== 'APPLIED_EXACT'
  ) {
    throw new ContractError(
      'deployment_reconciliation_resolution_invalid',
      'Deployment reconciliation resolution must be NOT_APPLIED or APPLIED_EXACT.',
    );
  }
  const evidence =
    resolution === 'NOT_APPLIED'
      ? normalizeNoMutationReconciliationEvidence(
          operation,
          rawEvidence,
        )
      : normalizeAppliedReconciliationEvidence(
          operation,
          rawEvidence,
        );
  return immutable({
    resolution,
    action: operation.action,
    provider: operation.provider,
    operationId: operation.operationId,
    idempotencyKey: operation.idempotencyKey,
    tenantId: operation.context.tenantId,
    publicationId: operation.context.publicationId,
    releaseId: operation.context.releaseId,
    predecessorReleaseId:
      operation.action === 'rollback'
        ? operation.payload.predecessorReleaseId
        : null,
    artifactId: operation.context.artifactId,
    resourceGroup: operation.context.resourceGroup,
    staticWebAppName: operation.context.staticWebAppName,
    payloadSha256: canonicalDigest(operation.payload),
    evidence,
  });
}

function normalizeNoMutationReconciliationEvidence(
  operation,
  rawEvidence,
) {
  assertExactObjectKeys(
    rawEvidence,
    [
      'readbackType',
      'mutationState',
      'operationId',
      'observedStateSha256',
      'evidenceRef',
    ],
    'deployment no-mutation reconciliation evidence',
  );
  assertRequiredObjectKeys(
    rawEvidence,
    [
      'readbackType',
      'mutationState',
      'operationId',
      'observedStateSha256',
      'evidenceRef',
    ],
    'deployment no-mutation reconciliation evidence',
  );
  if (
    rawEvidence.readbackType !==
      'AUTHORITATIVE_MUTATION_RECONCILIATION' ||
    rawEvidence.mutationState !== 'NOT_APPLIED' ||
    rawEvidence.operationId !== operation.operationId
  ) {
    throw new ContractError(
      'deployment_reconciliation_evidence_invalid',
      'No-mutation reconciliation evidence is not bound to the exact operation.',
    );
  }
  return immutable({
    readbackType:
      'AUTHORITATIVE_MUTATION_RECONCILIATION',
    mutationState: 'NOT_APPLIED',
    operationId: operation.operationId,
    observedStateSha256: assertSha256(
      rawEvidence.observedStateSha256,
      'deployment reconciliation observedStateSha256',
    ),
    evidenceRef: assertSafeRelativeReference(
      rawEvidence.evidenceRef,
      'deployment reconciliation evidenceRef',
    ),
  });
}

function normalizeAppliedReconciliationEvidence(
  operation,
  rawEvidence,
) {
  if (
    operation.action !== 'deploy' &&
    operation.action !== 'rollback'
  ) {
    return normalizeActionResult(operation, rawEvidence);
  }
  assertExactObjectKeys(
    rawEvidence,
    [
      'readbackType',
      'mutationState',
      'deploymentIdentity',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'deployment exact applied reconciliation evidence',
  );
  assertRequiredObjectKeys(
    rawEvidence,
    [
      'readbackType',
      'mutationState',
      'deploymentIdentity',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
    ],
    'deployment exact applied reconciliation evidence',
  );
  const deploymentIdentity =
    normalizeAuthoritativeDeploymentIdentity(
      rawEvidence.deploymentIdentity,
    );
  if (
    rawEvidence.readbackType !==
      'AUTHORITATIVE_EXACT_DEPLOYMENT_RECONCILIATION' ||
    rawEvidence.mutationState !== 'APPLIED' ||
    canonicalDigest(deploymentIdentity) !==
      canonicalDigest(expectedDeploymentIdentityFor(operation)) ||
    rawEvidence.packageSha256 !==
      operation.payload.packageSha256 ||
    rawEvidence.manifestSha256 !==
      operation.payload.manifestSha256 ||
    rawEvidence.stagedInventorySha256 !==
      operation.payload.stagedInventorySha256
  ) {
    throw new ContractError(
      'deployment_reconciliation_evidence_invalid',
      'Applied reconciliation evidence is not bound to the exact artifact mutation.',
    );
  }
  return immutable({
    readbackType:
      'AUTHORITATIVE_EXACT_DEPLOYMENT_RECONCILIATION',
    mutationState: 'APPLIED',
    deploymentIdentity,
    packageSha256: operation.payload.packageSha256,
    manifestSha256: operation.payload.manifestSha256,
    stagedInventorySha256:
      operation.payload.stagedInventorySha256,
  });
}

function verifyDeploymentReconciliationAuthority(
  authority,
  verifier,
  operation,
) {
  const configuration = DEPLOYMENT_VERIFIERS.get(verifier);
  if (!configuration) {
    throw new ContractError(
      'deployment_verifier_unconfigured',
      'Deployment reconciliation is held until a privileged immutable verifier is configured.',
    );
  }
  verifyHistoricalDeploymentOperation(operation, verifier);
  assertNoForbiddenData(
    authority,
    'deployment reconciliation authority',
  );
  const fields = [
    'schemaVersion',
    'authorityId',
    'status',
    'resolution',
    'action',
    'provider',
    'operationId',
    'idempotencyKey',
    'tenantId',
    'publicationId',
    'releaseId',
    'predecessorReleaseId',
    'artifactId',
    'resourceGroup',
    'staticWebAppName',
    'payloadSha256',
    'evidence',
    'issuedAt',
    'expiresAt',
    'revocationState',
    'revocationListId',
    'keyId',
    'integritySha256',
    'signatureBase64',
  ];
  assertExactObjectKeys(
    authority,
    fields,
    'deployment reconciliation authority',
  );
  assertRequiredObjectKeys(
    authority,
    fields,
    'deployment reconciliation authority',
  );
  const { signatureBase64, ...signedBody } = clone(authority);
  const { integritySha256, ...body } = signedBody;
  if (
    assertSha256(
      integritySha256,
      'deployment reconciliation integritySha256',
    ) !== canonicalDigest(body)
  ) {
    throw new ContractError(
      'deployment_reconciliation_integrity_invalid',
      'Deployment reconciliation integrity does not match.',
    );
  }
  const scope = deploymentReconciliationScopeFromVerifiedOperation(
    operation,
    body.resolution,
    body.evidence,
  );
  const authorityId = assertSafeIdentifier(
    body.authorityId,
    'deployment reconciliation authorityId',
  );
  if (
    body.schemaVersion !==
      'pumpkin.deployment-operation-reconciliation.v1' ||
    body.status !== 'AUTHORITATIVE' ||
    body.resolution !== scope.resolution ||
    body.action !== scope.action ||
    body.provider !== scope.provider ||
    body.operationId !== scope.operationId ||
    body.idempotencyKey !== scope.idempotencyKey ||
    body.tenantId !== scope.tenantId ||
    body.publicationId !== scope.publicationId ||
    body.releaseId !== scope.releaseId ||
    body.predecessorReleaseId !==
      scope.predecessorReleaseId ||
    body.artifactId !== scope.artifactId ||
    body.resourceGroup !== scope.resourceGroup ||
    body.staticWebAppName !== scope.staticWebAppName ||
    body.payloadSha256 !== scope.payloadSha256 ||
    canonicalDigest(body.evidence) !==
      canonicalDigest(scope.evidence) ||
    body.revocationState !== 'ACTIVE' ||
    body.revocationListId !== configuration.revocationListId ||
    body.keyId !== configuration.readbackKey.keyId
  ) {
    throw new ContractError(
      'deployment_reconciliation_scope_invalid',
      'Deployment reconciliation authority is not scoped to the exact operation and readback.',
    );
  }
  if (configuration.revokedAuthorityIds.has(authorityId)) {
    throw new ContractError(
      'deployment_reconciliation_revoked',
      'Deployment reconciliation authority has been revoked.',
    );
  }
  assertDeploymentAuthorityTime(body.issuedAt, body.expiresAt);
  const signature = decodeDeploymentBase64(
    signatureBase64,
    'deployment reconciliation signatureBase64',
  );
  if (
    !verifySignature(
      null,
      Buffer.from(
        stableDeploymentJson(signedBody),
        'utf8',
      ),
      configuration.readbackKey.publicKey,
      signature,
    )
  ) {
    throw new ContractError(
      'deployment_reconciliation_signature_invalid',
      'Deployment reconciliation signature is invalid.',
    );
  }
  return immutable({
    resolution: scope.resolution,
    evidence: scope.evidence,
    authority: clone(authority),
    authoritySha256: canonicalDigest(authority),
    authorityId,
    trustedPublicKeySha256:
      configuration.readbackKey.publicKeySha256,
  });
}

function verifyDeploymentReadbackAuthority(authority, verifier, operation) {
  const configuration = DEPLOYMENT_VERIFIERS.get(verifier);
  if (!configuration) {
    throw new ContractError(
      'deployment_verifier_unconfigured',
      'Deployment action readback is held until a privileged immutable verifier is configured.',
    );
  }
  if (!authority) {
    throw new ContractError(
      'deployment_readback_authority_required',
      'Deployment action success requires a signed action-specific readback authority.',
    );
  }
  assertNoForbiddenData(authority, 'deployment action readback authority');
  assertExactObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'status',
      'action',
      'provider',
      'operationId',
      'idempotencyKey',
      'tenantId',
      'publicationId',
      'releaseId',
      'predecessorReleaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'payloadSha256',
      'actionResult',
      'issuedAt',
      'expiresAt',
      'revocationState',
      'revocationListId',
      'keyId',
      'integritySha256',
      'signatureBase64',
    ],
    'deployment action readback authority',
  );
  assertRequiredObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'status',
      'action',
      'provider',
      'operationId',
      'idempotencyKey',
      'tenantId',
      'publicationId',
      'releaseId',
      'predecessorReleaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'payloadSha256',
      'actionResult',
      'issuedAt',
      'expiresAt',
      'revocationState',
      'revocationListId',
      'keyId',
      'integritySha256',
      'signatureBase64',
    ],
    'deployment action readback authority',
  );
  const { signatureBase64, ...signedBody } = clone(authority);
  const { integritySha256, ...body } = signedBody;
  if (
    assertSha256(
      integritySha256,
      'deployment action readback integritySha256',
    ) !== canonicalDigest(body)
  ) {
    throw new ContractError(
      'deployment_readback_integrity_invalid',
      'Deployment action readback integrity does not match.',
    );
  }
  const scope = deploymentReadbackAuthorityScope(
    operation,
    body.actionResult,
    { deploymentVerifier: verifier },
  );
  const authorityId = assertSafeIdentifier(
    body.authorityId,
    'deployment action readback authorityId',
  );
  if (
    body.schemaVersion !== 'pumpkin.deployment-action-readback.v1' ||
    body.status !== 'SUCCEEDED' ||
    body.action !== scope.action ||
    body.provider !== scope.provider ||
    body.operationId !== scope.operationId ||
    body.idempotencyKey !== scope.idempotencyKey ||
    body.tenantId !== scope.tenantId ||
    body.publicationId !== scope.publicationId ||
    body.releaseId !== scope.releaseId ||
    body.predecessorReleaseId !== scope.predecessorReleaseId ||
    body.artifactId !== scope.artifactId ||
    body.resourceGroup !== scope.resourceGroup ||
    body.staticWebAppName !== scope.staticWebAppName ||
    body.payloadSha256 !== scope.payloadSha256 ||
    canonicalDigest(body.actionResult) !==
      canonicalDigest(scope.actionResult) ||
    body.revocationState !== 'ACTIVE' ||
    body.revocationListId !== configuration.revocationListId ||
    body.keyId !== configuration.readbackKey.keyId
  ) {
    throw new ContractError(
      'deployment_readback_scope_invalid',
      'Deployment action readback is not scoped to the exact operation.',
    );
  }
  if (configuration.revokedAuthorityIds.has(authorityId)) {
    throw new ContractError(
      'deployment_readback_revoked',
      'Deployment action readback authority has been revoked.',
    );
  }
  assertDeploymentAuthorityTime(body.issuedAt, body.expiresAt);
  const signature = decodeDeploymentBase64(
    signatureBase64,
    'deployment action readback signatureBase64',
  );
  if (
    !verifySignature(
      null,
      Buffer.from(stableDeploymentJson(signedBody), 'utf8'),
      configuration.readbackKey.publicKey,
      signature,
    )
  ) {
    throw new ContractError(
      'deployment_readback_signature_invalid',
      'Deployment action readback signature is invalid.',
    );
  }
  return immutable({
    actionResult: scope.actionResult,
    authority: {
      authorityId,
      status: 'SUCCEEDED',
      predecessorReleaseId: scope.predecessorReleaseId,
      keyId: configuration.readbackKey.keyId,
      trustedPublicKeySha256:
        configuration.readbackKey.publicKeySha256,
      integritySha256,
      signatureSha256: sha256(signature),
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      revocationState: 'ACTIVE',
      revocationListId: configuration.revocationListId,
    },
  });
}

function buildInMemoryActionResult(operation) {
  const { action, context, payload } = operation;
  switch (action) {
    case 'read-resource':
      return {
        readbackType: 'RESOURCE_STATE',
        resourceState: 'READY',
        resourceName: context.staticWebAppName,
      };
    case 'create-or-reuse':
      return {
        readbackType: 'RESOURCE_MUTATION',
        mutationState: 'APPLIED',
        resourceState: 'READY',
        resourceName: context.staticWebAppName,
      };
    case 'tag':
      return {
        readbackType: 'TAG_MUTATION',
        mutationState: 'APPLIED',
        resourceName: context.staticWebAppName,
        tagsSha256: canonicalDigest(payload.tags),
      };
    case 'register':
      return {
        readbackType: 'PUBLICATION_REGISTRY_MUTATION',
        mutationState: 'APPLIED',
        publicationId: context.publicationId,
        recordSha256: canonicalDigest(payload.record),
      };
    case 'verify-deployment':
      return {
        readbackType: 'DEPLOYMENT_VERIFICATION',
        verificationState: 'VERIFIED',
        packageSha256: payload.packageSha256,
        manifestSha256: payload.manifestSha256,
        routesVerified: payload.verifyRoutes,
        noindexVerified: payload.verifyNoindex,
      };
    case 'update':
      return {
        readbackType: 'PUBLICATION_REGISTRY_MUTATION',
        mutationState: 'APPLIED',
        publicationId: context.publicationId,
        updateSha256: canonicalDigest(payload.update),
      };
    case 'rollback':
      return {
        readbackType: 'ROLLBACK_MUTATION',
        mutationState: 'APPLIED',
        predecessorPublicationId: payload.predecessorPublicationId,
        predecessorReleaseId: payload.predecessorReleaseId,
        predecessorArtifactId: payload.predecessorArtifactId,
        packageSha256: payload.packageSha256,
        manifestSha256: payload.manifestSha256,
        stagedInventorySha256: payload.stagedInventorySha256,
      };
    case 'revoke':
      return {
        readbackType: 'PUBLICATION_REGISTRY_MUTATION',
        mutationState: 'APPLIED',
        recordId: payload.recordId,
        recordState: 'REVOKED',
      };
    case 'archive':
      return {
        readbackType: 'ARTIFACT_REGISTRY_MUTATION',
        mutationState: 'APPLIED',
        artifactId: payload.artifactId,
        artifactState: 'ARCHIVED',
      };
    case 'read-custom-domains':
      return {
        readbackType: 'CUSTOM_DOMAIN_STATE',
        domains: [],
      };
    default:
      throw new ContractError(
        'deployment_readback_action_invalid',
        'In-memory adapter action has no readback contract.',
      );
  }
}

function normalizeActionResult(operation, rawResult) {
  assertNoForbiddenData(rawResult, 'deployment action result');
  const expected = buildInMemoryActionResult(operation);
  if (operation.action === 'read-resource') {
    assertExactObjectKeys(
      rawResult,
      ['readbackType', 'resourceState', 'resourceName'],
      'resource readback',
    );
    if (
      rawResult.readbackType !== expected.readbackType ||
      rawResult.resourceName !== expected.resourceName ||
      !['MISSING', 'PROVISIONING', 'READY', 'FAILED'].includes(
        rawResult.resourceState,
      )
    ) {
      throw new ContractError(
        'deployment_readback_result_invalid',
        'Resource readback is invalid.',
      );
    }
    return immutable(rawResult);
  }
  if (operation.action === 'read-custom-domains') {
    assertExactObjectKeys(
      rawResult,
      ['readbackType', 'domains'],
      'custom-domain readback',
    );
    if (
      rawResult.readbackType !== 'CUSTOM_DOMAIN_STATE' ||
      !Array.isArray(rawResult.domains)
    ) {
      throw new ContractError(
        'deployment_readback_result_invalid',
        'Custom-domain readback is invalid.',
      );
    }
    const domains = rawResult.domains
      .map((domain) => {
        assertExactObjectKeys(
          domain,
          ['hostname', 'status', 'validationState'],
          'custom-domain readback entry',
        );
        return {
          hostname: normalizeHostname(domain.hostname),
          status: assertSafeIdentifier(
            domain.status,
            'custom-domain readback status',
          ),
          validationState: assertSafeIdentifier(
            domain.validationState,
            'custom-domain readback validationState',
          ),
        };
      })
      .sort((left, right) =>
        left.hostname.localeCompare(right.hostname, 'en'),
      );
    if (
      new Set(domains.map((domain) => domain.hostname)).size !==
      domains.length
    ) {
      throw new ContractError(
        'deployment_readback_result_invalid',
        'Custom-domain readback contains duplicate hostnames.',
      );
    }
    return immutable({
      readbackType: 'CUSTOM_DOMAIN_STATE',
      domains,
    });
  }
  assertExactObjectKeys(
    rawResult,
    Object.keys(expected),
    `${operation.action} action readback`,
  );
  assertRequiredObjectKeys(
    rawResult,
    Object.keys(expected),
    `${operation.action} action readback`,
  );
  const normalized = normalizePublicMetadata(
    rawResult,
    `${operation.action} action readback`,
  );
  if (canonicalDigest(normalized) !== canonicalDigest(expected)) {
    throw new ContractError(
      'deployment_readback_result_invalid',
      'Action-specific deployment readback does not match the operation.',
    );
  }
  return immutable(expected);
}

function normalizeContext(context = {}) {
  const sku = context.sku ?? 'Free';
  if (sku !== 'Free') {
    throw new ContractError('deployment_paid_sku_forbidden', 'Only Azure Static Web Apps Free is supported.');
  }
  return immutable({
    tenantId: assertSafeIdentifier(context.tenantId, 'deployment tenantId', { backend: true }).toLowerCase(),
    publicationId: assertSafeIdentifier(
      context.publicationId,
      'deployment publicationId',
      { backend: true },
    ),
    releaseId: assertSafeIdentifier(context.releaseId, 'deployment releaseId'),
    artifactId: assertSafeIdentifier(context.artifactId, 'deployment artifactId'),
    resourceGroup: assertSafeIdentifier(context.resourceGroup, 'deployment resourceGroup'),
    staticWebAppName: assertSafeIdentifier(
      context.staticWebAppName,
      'deployment staticWebAppName',
      { backend: true },
    ),
    region: assertSafeIdentifier(context.region, 'deployment region', { backend: true }),
    sku: 'Free',
  });
}

function normalizeTags(tags) {
  if (!tags || typeof tags !== 'object' || Array.isArray(tags)) {
    throw new ContractError('deployment_tags_invalid', 'Tags must be an object.');
  }
  return Object.fromEntries(
    Object.entries(tags)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, value]) => [
        assertSafeIdentifier(key, 'deployment tag key'),
        assertSafeIdentifier(String(value), 'deployment tag value'),
      ]),
  );
}

function normalizePublicMetadata(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError('deployment_metadata_invalid', `${label} must be an object.`);
  }
  assertNoForbiddenData(value, label);
  assertNoAbsoluteLocalPaths(value, label);
  return immutable(value);
}

function assertNoAbsoluteLocalPaths(value, label) {
  const serialized = JSON.stringify(value);
  if (
    /[A-Za-z]:[\\/]/.test(serialized) ||
    /(?:^|["'\s])\/(?:Users|home|mnt|tmp)\//.test(serialized) ||
    /file:\/\//i.test(serialized)
  ) {
    throw new ContractError('deployment_absolute_path_forbidden', `${label} contains an absolute local path.`);
  }
}

function normalizeHostname(value) {
  const hostname = String(value ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (
    !hostname ||
    hostname.length > 253 ||
    hostname.includes('/') ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
  ) {
    throw new ContractError('deployment_hostname_invalid', 'Domain hostname is invalid.');
  }
  return hostname;
}

function assertAdapter(adapter) {
  for (const method of ['invoke']) {
    if (typeof adapter?.[method] !== 'function') {
      throw new ContractError('deployment_adapter_invalid', `Deployment adapter must implement ${method}().`);
    }
  }
}

function assertRequiredObjectKeys(value, requiredKeys, label) {
  const missing = requiredKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  if (missing.length > 0) {
    throw new ContractError(
      'deployment_contract_field_missing',
      `${label} is missing required fields.`,
      { fields: missing.sort() },
    );
  }
}

function successfulStatusCodes(action) {
  const byAction = {
    'read-resource': ['read'],
    'create-or-reuse': ['completed'],
    tag: ['completed'],
    register: ['completed'],
    deploy: ['deployed'],
    'verify-deployment': ['completed', 'verified'],
    update: ['completed'],
    rollback: ['completed'],
    revoke: ['completed'],
    archive: ['completed'],
    'read-custom-domains': ['completed', 'read'],
  };
  const values = byAction[action];
  if (!values) {
    throw new ContractError(
      'deployment_result_action_invalid',
      'Deployment result action has no accepted success status contract.',
    );
  }
  return new Set(values);
}

function exact(value, expected, label) {
  if (value !== expected) throw new ContractError('deployment_value_invalid', `${label} must be ${expected}.`);
  return value;
}

function safeErrorCode(error) {
  const value = String(error?.code ?? 'deployment_adapter_failed');
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value) ? value : 'deployment_adapter_failed';
}
