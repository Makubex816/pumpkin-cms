import {
  ContractError,
  ContractVersion,
} from './contracts.mjs';
import {
  canonicalDigest,
  clone,
  immutable,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
} from './security.mjs';

export const CredentialProviderType = Object.freeze({
  WINDOWS_DPAPI_CURRENT_USER: 'WINDOWS_DPAPI_CURRENT_USER',
  MANAGED_SECRET_PROVIDER_DESIGN_ONLY: 'MANAGED_SECRET_PROVIDER_DESIGN_ONLY',
});

export const CredentialReferenceState = Object.freeze({
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  RESET_REQUIRED: 'RESET_REQUIRED',
  REVOKED: 'REVOKED',
});

const ENVIRONMENT_NAME = /^[A-Z][A-Z0-9_]{1,126}$/;
const AUDITED_HELPER_CONTRACT_VERSION = 'pumpkin.dpapi-swa-audited-helper.v1';
const AUDITED_HELPER_HANDOFF_VERSION = 'pumpkin.dpapi-swa-helper-handoff.v1';
const AUTHORITATIVE_IDENTITY_VERSION = 'pumpkin.azure-swa-deployment-identity.v1';
const AUDITED_HELPER_REFERENCE =
  'tools/tenant-publication-product/helpers/invoke-dpapi-swa-deployment.ps1';
const AUDITED_HELPER_INVOCATION_REFERENCE =
  'helpers/invoke-dpapi-swa-deployment.ps1';
const AUDITED_HELPER_WORKING_DIRECTORY = 'tools/tenant-publication-product';
const AUDITED_HELPER_EXECUTABLE = 'powershell.exe';
const AUDITED_DEPLOYMENT_ENVIRONMENT_VARIABLE = 'SWA_CLI_DEPLOYMENT_TOKEN';
const AUDITED_HELPER_FIXED_ARGUMENTS = Object.freeze([
  '-NoLogo',
  '-NoProfile',
  '-NonInteractive',
  '-ExecutionPolicy',
  'AllSigned',
  '-File',
  AUDITED_HELPER_INVOCATION_REFERENCE,
]);
const RAW_CREDENTIAL_REFERENCE_KEYS = Object.freeze([
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
]);
const SEALED_CREDENTIAL_REFERENCE_KEYS = Object.freeze([
  ...RAW_CREDENTIAL_REFERENCE_KEYS,
  'portability',
  'metadataOnly',
  'rotationSupported',
  'tokenResetSupported',
  'referenceSha256',
]);

export const AuditedDpapiSwaHelperContract = immutable({
  implementationStatus:
    'DESIGN_HELD_TRUST_ANCHOR_UNCONFIGURED',
  executionBuiltIn: false,
  trustAnchorConfigured: false,
  contractVersion: AUDITED_HELPER_CONTRACT_VERSION,
  repositoryRelativePath: AUDITED_HELPER_REFERENCE,
  invocationReference: AUDITED_HELPER_INVOCATION_REFERENCE,
  executable: AUDITED_HELPER_EXECUTABLE,
  workingDirectoryRef: AUDITED_HELPER_WORKING_DIRECTORY,
  fixedArguments: AUDITED_HELPER_FIXED_ARGUMENTS,
  handoffContractVersion: AUDITED_HELPER_HANDOFF_VERSION,
  authoritativeIdentityContractVersion: AUTHORITATIVE_IDENTITY_VERSION,
  handoffTransport: 'CANONICAL_JSON_STDIN',
  credentialMaterialization:
    'FUTURE_AUDITED_HELPER_INTERNAL_ONLY',
  envelopeLocator:
    'FUTURE_PROCESS_BOOT_PINNED_EXTERNAL_BASE_PLUS_LOGICAL_METADATA_ID',
  envelopeLocatorConfigured: false,
  repositoryRelativeEnvelopePathsAllowed: false,
  callerSelectedEnvelopePathsAllowed: false,
  helperOwnsDeployChildSpawn: true,
  callerInjectedSpawnAllowed: false,
  plaintextCrossesProviderBoundary: false,
  rawOutputCapture: false,
});

export function normalizeCredentialReference(rawReference) {
  assertNoForbiddenData(rawReference, 'credential reference');
  assertExactKeys(
    rawReference,
    RAW_CREDENTIAL_REFERENCE_KEYS,
    'credential reference',
  );
  assertRequiredKeys(
    rawReference,
    RAW_CREDENTIAL_REFERENCE_KEYS,
    'credential reference',
  );
  if (rawReference?.schemaVersion !== ContractVersion.credentialReference) {
    throw new ContractError(
      'credential_reference_schema_invalid',
      `Credential reference schema must be ${ContractVersion.credentialReference}.`,
    );
  }
  const providerType = enumMember(
    CredentialProviderType,
    rawReference.providerType,
    'credential reference providerType',
  );
  const state = enumMember(
    CredentialReferenceState,
    rawReference.state,
    'credential reference state',
  );
  const environmentVariableName = String(rawReference.environmentVariableName ?? '');
  if (!ENVIRONMENT_NAME.test(environmentVariableName)) {
    throw new ContractError(
      'credential_environment_name_invalid',
      'Credential environment variable name must be a bounded uppercase identifier.',
    );
  }
  if (rawReference.valueIncluded !== false) {
    throw new ContractError('credential_value_forbidden', 'Credential references must never include values.');
  }
  const body = {
    schemaVersion: ContractVersion.credentialReference,
    credentialReferenceId: assertSafeIdentifier(
      rawReference.credentialReferenceId,
      'credentialReferenceId',
    ),
    providerType,
    state,
    purpose: assertSafeIdentifier(rawReference.purpose, 'credential purpose'),
    environmentVariableName,
    envelopeFormat:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? exact(rawReference.envelopeFormat, 'PUMPKIN_DPAPI_ENVELOPE_V1', 'envelopeFormat')
        : null,
    envelopeMetadataId:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? assertSafeIdentifier(
            rawReference.envelopeMetadataId,
            'envelopeMetadataId',
          )
        : null,
    envelopeSha256:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? assertSha256(rawReference.envelopeSha256, 'envelopeSha256')
        : null,
    protectionScope:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? exact(rawReference.protectionScope, 'CurrentUser', 'protectionScope')
        : null,
    aclState:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? exact(rawReference.aclState, 'OWNER_ONLY_INHERITANCE_REMOVED', 'aclState')
        : null,
    portability:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? 'SAME_WINDOWS_USER_PROFILE_ONLY'
        : 'FUTURE_PROVIDER_UNRESOLVED',
    valueIncluded: false,
    metadataOnly: true,
    rotationSupported: false,
    tokenResetSupported: false,
  };
  if (
    providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER &&
    (body.purpose !== 'azure-swa-deployment' ||
      body.environmentVariableName !==
        AUDITED_DEPLOYMENT_ENVIRONMENT_VARIABLE)
  ) {
    throw new ContractError(
      'credential_metadata_invalid',
      'The audited SWA helper accepts only the azure-swa-deployment purpose and SWA_CLI_DEPLOYMENT_TOKEN child variable.',
    );
  }
  return immutable({
    ...body,
    referenceSha256: canonicalDigest(body),
  });
}

export function verifyCredentialReference(reference) {
  assertNoForbiddenData(reference, 'sealed credential reference');
  assertExactKeys(
    reference,
    SEALED_CREDENTIAL_REFERENCE_KEYS,
    'sealed credential reference',
  );
  assertRequiredKeys(
    reference,
    SEALED_CREDENTIAL_REFERENCE_KEYS,
    'sealed credential reference',
  );
  const raw = Object.fromEntries(
    RAW_CREDENTIAL_REFERENCE_KEYS.map((key) => [key, clone(reference[key])]),
  );
  const normalized = normalizeCredentialReference(raw);
  if (canonicalDigest(normalized) !== canonicalDigest(reference)) {
    throw new ContractError('credential_reference_hash_mismatch', 'Credential reference hash does not match.');
  }
  return true;
}

export function buildChildEnvironmentContract(reference, rawCommand) {
  verifyCredentialReference(reference);
  if (reference.providerType !== CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER) {
    throw new ContractError('credential_provider_unavailable', 'The selected provider cannot materialize a child environment.');
  }
  if (reference.state !== CredentialReferenceState.ACTIVE) {
    throw new ContractError('credential_reference_inactive', 'Only an active credential reference can be used.');
  }
  const command = normalizeCommand(rawCommand);
  if (
    command.handoff.credentialReferenceId !== reference.credentialReferenceId ||
    command.handoff.environmentVariableName !== reference.environmentVariableName
  ) {
    throw new ContractError(
      'credential_handoff_reference_mismatch',
      'Audited helper handoff does not match the active credential reference.',
    );
  }
  const body = {
    schemaVersion: ContractVersion.childEnvironment,
    credentialReferenceId: reference.credentialReferenceId,
    providerType: reference.providerType,
    environmentVariableName: reference.environmentVariableName,
    executable: command.executable,
    arguments: command.arguments,
    workingDirectoryRef: command.workingDirectoryRef,
    auditedHelperContractVersion: command.auditedHelper.contractVersion,
    auditedHelperReference: command.auditedHelper.repositoryRelativePath,
    auditedHelperSha256: command.auditedHelper.expectedSha256,
    auditedHelperContractSha256: command.auditedHelper.contractSha256,
    handoffContractVersion: command.handoff.schemaVersion,
    operationAction: command.handoff.operationAction,
    handoffSha256: command.handoffSha256,
    expectedPackageSha256: command.handoff.packageSha256,
    expectedManifestSha256: command.handoff.manifestSha256,
    expectedStagedInventorySha256: command.handoff.stagedInventorySha256,
    envelopeMetadataId: command.handoff.envelopeMetadataId,
    envelopeSha256: command.handoff.envelopeSha256,
    inheritParentEnvironment: false,
    injectAtSpawnOnly: false,
    decryptInProviderOnly: false,
    decryptInAuditedHelperOnly: true,
    helperOwnsDeployChildSpawn: true,
    callerInjectedSpawnAllowed: false,
    plaintextCrossesProviderBoundary: false,
    valueReturnedToCaller: false,
    valueOnCommandLine: false,
    valueLogged: false,
    valueWrittenToDisk: false,
    clearAfterChildExit: true,
    outputCapture: 'status-only-redacted',
    rotationSupported: false,
  };
  return immutable({
    ...body,
    contractSha256: canonicalDigest(body),
  });
}

export class CurrentUserDpapiCredentialProvider {
  #reference;

  constructor(options = {}) {
    const {
      reference,
      auditedHelper,
      repositoryRoot,
      processRunner,
      decryptForChild,
    } = options;
    verifyCredentialReference(reference);
    if (reference.providerType !== CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER) {
      throw new ContractError('credential_provider_type_invalid', 'Current DPAPI provider requires a DPAPI reference.');
    }
    if (decryptForChild !== undefined) {
      throw new ContractError(
        'credential_plaintext_callback_forbidden',
        'Plaintext-returning decrypt callbacks are forbidden; the audited helper must own decrypt and child spawn.',
      );
    }
    if (
      auditedHelper !== undefined ||
      repositoryRoot !== undefined ||
      processRunner !== undefined
    ) {
      throw new ContractError(
        'credential_audited_helper_trust_anchor_unconfigured',
        'No approved helper trust anchor is configured; caller-selected helper bytes, hashes, roots, and runners are forbidden.',
      );
    }
    this.#reference = immutable(reference);
  }

  describe() {
    return immutable({
      providerType: CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER,
      credentialReferenceId: this.#reference.credentialReferenceId,
      envelopeMetadataId: this.#reference.envelopeMetadataId,
      envelopeSha256: this.#reference.envelopeSha256,
      envelopeLocator:
        'PROCESS_BOOT_PINNED_EXTERNAL_BASE_NOT_CONFIGURED',
      envelopeLocatorConfigured: false,
      environmentVariableName: this.#reference.environmentVariableName,
      protectionScope: 'CurrentUser',
      status: 'DESIGN_HELD_TRUST_ANCHOR_UNCONFIGURED',
      valuesReturned: false,
      executionAvailable: false,
      childEnvironmentOnly: false,
      futureChildEnvironmentContractOnly: true,
      auditedHelperReference:
        AuditedDpapiSwaHelperContract.repositoryRelativePath,
      helperTrustAnchorConfigured: false,
      helperOwnsDeployChildSpawn: false,
      callerInjectedSpawnAllowed: false,
      plaintextCrossesProviderBoundary: false,
      rotationSupported: false,
      tokenResetSupported: false,
    });
  }

  auditedHelperContract() {
    throw new ContractError(
      'credential_audited_helper_trust_anchor_unconfigured',
      'Deployment is held until reviewed helper bytes and a privileged trust anchor are configured.',
    );
  }

  childEnvironmentContract() {
    throw new ContractError(
      'credential_audited_helper_trust_anchor_unconfigured',
      'Deployment is held until reviewed helper bytes and a privileged trust anchor are configured.',
    );
  }

  async runChild(_command, forbiddenPerCallSpawn) {
    if (forbiddenPerCallSpawn !== undefined) {
      throw new ContractError(
        'credential_spawn_injection_forbidden',
        'Per-call child-process callbacks are forbidden; execution is sealed at provider construction.',
      );
    }
    throw new ContractError(
      'credential_audited_helper_trust_anchor_unconfigured',
      'Deployment is held; no helper process can start without a privileged trust anchor.',
    );
  }

  rotate() {
    throw new ContractError('credential_rotation_unsupported', 'Token rotation is not part of this provider contract.');
  }
}

export class ManagedSecretProviderDesign {
  describe() {
    return immutable({
      providerType: CredentialProviderType.MANAGED_SECRET_PROVIDER_DESIGN_ONLY,
      status: 'DESIGN_ONLY_NOT_IMPLEMENTED',
      intendedPortability: 'MULTI_OPERATOR_OR_AUTOMATION',
      valuesReturned: false,
      executionAvailable: false,
      childEnvironmentOnly: false,
      futureChildEnvironmentContractOnly: true,
      rotationSupported: false,
      tokenResetSupported: false,
    });
  }

  childEnvironmentContract() {
    throw new ContractError(
      'credential_provider_design_only',
      'The future managed-secret provider is design-only and cannot supply credentials.',
    );
  }

  runChild() {
    return Promise.reject(
      new ContractError(
        'credential_provider_design_only',
        'The future managed-secret provider is design-only and cannot execute children.',
      ),
    );
  }
}

function normalizeAuditedHelper(rawHelper = {}) {
  assertExactKeys(
    rawHelper,
    [
      'contractVersion',
      'repositoryRelativePath',
      'invocationReference',
      'executable',
      'workingDirectoryRef',
      'expectedSha256',
    ],
    'audited helper',
  );
  const body = {
    contractVersion: exact(
      rawHelper.contractVersion ?? AUDITED_HELPER_CONTRACT_VERSION,
      AUDITED_HELPER_CONTRACT_VERSION,
      'audited helper contractVersion',
    ),
    repositoryRelativePath: exact(
      rawHelper.repositoryRelativePath ?? AUDITED_HELPER_REFERENCE,
      AUDITED_HELPER_REFERENCE,
      'audited helper repositoryRelativePath',
    ),
    invocationReference: exact(
      rawHelper.invocationReference ?? AUDITED_HELPER_INVOCATION_REFERENCE,
      AUDITED_HELPER_INVOCATION_REFERENCE,
      'audited helper invocationReference',
    ),
    executable: exact(
      rawHelper.executable ?? AUDITED_HELPER_EXECUTABLE,
      AUDITED_HELPER_EXECUTABLE,
      'audited helper executable',
    ),
    workingDirectoryRef: exact(
      rawHelper.workingDirectoryRef ?? AUDITED_HELPER_WORKING_DIRECTORY,
      AUDITED_HELPER_WORKING_DIRECTORY,
      'audited helper workingDirectoryRef',
    ),
    expectedSha256: assertSha256(
      rawHelper.expectedSha256,
      'audited helper expectedSha256',
    ),
  };
  return immutable({
    ...body,
    contractSha256: canonicalDigest(body),
  });
}

function normalizeCommand(rawCommand = {}) {
  assertNoForbiddenData(rawCommand, 'child command');
  assertExactKeys(
    rawCommand,
    [
      'executable',
      'arguments',
      'workingDirectoryRef',
      'auditedHelper',
      'handoff',
      'handoffSha256',
    ],
    'child command',
  );
  const auditedHelper = normalizeCommandAuditedHelper(rawCommand.auditedHelper);
  const handoff = normalizeHelperHandoff(rawCommand.handoff);
  if (handoff.expectedHelperSha256 !== auditedHelper.expectedSha256) {
    throw new ContractError(
      'credential_handoff_helper_hash_mismatch',
      'Audited helper handoff is not bound to the configured helper SHA-256.',
    );
  }
  const handoffSha256 = assertSha256(rawCommand.handoffSha256, 'child handoffSha256');
  if (canonicalDigest(handoff) !== handoffSha256) {
    throw new ContractError(
      'credential_handoff_hash_mismatch',
      'Audited helper handoff hash does not match its canonical body.',
    );
  }
  const expectedArguments = [
    ...AUDITED_HELPER_FIXED_ARGUMENTS,
    '-ContractVersion',
    AUDITED_HELPER_CONTRACT_VERSION,
    '-HandoffSha256',
    handoffSha256,
  ];
  if (
    !Array.isArray(rawCommand.arguments) ||
    rawCommand.arguments.length !== expectedArguments.length ||
    rawCommand.arguments.some((value, index) => value !== expectedArguments[index])
  ) {
    throw new ContractError(
      'credential_helper_arguments_invalid',
      'Audited helper arguments must exactly match the fixed, value-free helper contract.',
    );
  }
  return immutable({
    executable: exact(
      rawCommand.executable,
      AUDITED_HELPER_EXECUTABLE,
      'child executable',
    ),
    arguments: expectedArguments,
    workingDirectoryRef: exact(
      rawCommand.workingDirectoryRef,
      AUDITED_HELPER_WORKING_DIRECTORY,
      'child workingDirectoryRef',
    ),
    auditedHelper,
    handoff,
    handoffSha256,
  });
}

function normalizeCommandAuditedHelper(rawHelper = {}) {
  assertExactKeys(
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
    'child audited helper',
  );
  const { contractSha256, ...rawBody } = rawHelper;
  const normalized = normalizeAuditedHelper(rawBody);
  if (normalized.contractSha256 !== contractSha256) {
    throw new ContractError(
      'credential_helper_contract_hash_mismatch',
      'Audited helper contract hash does not match.',
    );
  }
  return normalized;
}

function normalizeHelperHandoff(rawHandoff = {}) {
  assertNoForbiddenData(rawHandoff, 'audited helper handoff');
  assertExactKeys(
    rawHandoff,
    [
      'schemaVersion',
      'operationAction',
      'operationId',
      'tenantId',
      'publicationId',
      'releaseId',
      'predecessorReleaseId',
      'artifactId',
      'resourceGroup',
      'staticWebAppName',
      'environment',
      'artifactRootRef',
      'packageRef',
      'manifestRef',
      'packageSha256',
      'manifestSha256',
      'stagedInventorySha256',
      'credentialReferenceId',
      'environmentVariableName',
      'envelopeMetadataId',
      'envelopeSha256',
      'expectedHelperSha256',
      'expectedDeploymentIdentity',
    ],
    'audited helper handoff',
  );
  const body = {
    schemaVersion: exact(
      rawHandoff.schemaVersion,
      AUDITED_HELPER_HANDOFF_VERSION,
      'helper handoff schemaVersion',
    ),
    operationAction: exactOneOf(
      rawHandoff.operationAction,
      ['deploy', 'rollback'],
      'helper handoff operationAction',
    ),
    operationId: assertSafeIdentifier(rawHandoff.operationId, 'helper handoff operationId'),
    tenantId: assertSafeIdentifier(rawHandoff.tenantId, 'helper handoff tenantId', {
      backend: true,
    }),
    publicationId: assertSafeIdentifier(
      rawHandoff.publicationId,
      'helper handoff publicationId',
      { backend: true },
    ),
    releaseId: assertSafeIdentifier(rawHandoff.releaseId, 'helper handoff releaseId'),
    predecessorReleaseId:
      rawHandoff.predecessorReleaseId === null
        ? null
        : assertSafeIdentifier(
            rawHandoff.predecessorReleaseId,
            'helper handoff predecessorReleaseId',
          ),
    artifactId: assertSafeIdentifier(rawHandoff.artifactId, 'helper handoff artifactId'),
    resourceGroup: assertSafeIdentifier(
      rawHandoff.resourceGroup,
      'helper handoff resourceGroup',
    ),
    staticWebAppName: assertSafeIdentifier(
      rawHandoff.staticWebAppName,
      'helper handoff staticWebAppName',
      { backend: true },
    ),
    environment: exact(rawHandoff.environment, 'production', 'helper handoff environment'),
    artifactRootRef: assertSafeRelativeReference(
      rawHandoff.artifactRootRef,
      'helper handoff artifactRootRef',
    ),
    packageRef: assertSafeRelativeReference(rawHandoff.packageRef, 'helper handoff packageRef'),
    manifestRef: assertSafeRelativeReference(
      rawHandoff.manifestRef,
      'helper handoff manifestRef',
    ),
    packageSha256: assertSha256(rawHandoff.packageSha256, 'helper handoff packageSha256'),
    manifestSha256: assertSha256(
      rawHandoff.manifestSha256,
      'helper handoff manifestSha256',
    ),
    stagedInventorySha256: assertSha256(
      rawHandoff.stagedInventorySha256,
      'helper handoff stagedInventorySha256',
    ),
    credentialReferenceId: assertSafeIdentifier(
      rawHandoff.credentialReferenceId,
      'helper handoff credentialReferenceId',
    ),
    environmentVariableName: normalizeEnvironmentVariableName(
      rawHandoff.environmentVariableName,
    ),
    envelopeMetadataId: assertSafeIdentifier(
      rawHandoff.envelopeMetadataId,
      'helper handoff envelopeMetadataId',
    ),
    envelopeSha256: assertSha256(
      rawHandoff.envelopeSha256,
      'helper handoff envelopeSha256',
    ),
    expectedHelperSha256: assertSha256(
      rawHandoff.expectedHelperSha256,
      'helper handoff expectedHelperSha256',
    ),
  };
  if (
    (body.operationAction === 'deploy' &&
      body.predecessorReleaseId !== null) ||
    (body.operationAction === 'rollback' &&
      body.predecessorReleaseId !== body.releaseId)
  ) {
    throw new ContractError(
      'credential_handoff_predecessor_release_mismatch',
      'Rollback helper handoff must bind the exact predecessor release; deploy handoff cannot carry one.',
    );
  }
  const expectedDeploymentIdentity = normalizeDeploymentIdentity(
    rawHandoff.expectedDeploymentIdentity,
  );
  const derivedIdentity = deploymentIdentityFromHandoff(body);
  if (canonicalDigest(expectedDeploymentIdentity) !== canonicalDigest(derivedIdentity)) {
    throw new ContractError(
      'credential_expected_identity_mismatch',
      'Expected deployment identity is not derived from the exact helper handoff.',
    );
  }
  return immutable({
    ...body,
    expectedDeploymentIdentity,
  });
}

function deploymentIdentityFromHandoff(handoff) {
  return immutable({
    schemaVersion: AUTHORITATIVE_IDENTITY_VERSION,
    provider: 'AZURE_STATIC_WEB_APPS',
    authority: 'AUDITED_HELPER_POST_DEPLOY_READBACK',
    authoritative: true,
    tenantId: handoff.tenantId,
    publicationId: handoff.publicationId,
    releaseId: handoff.releaseId,
    artifactId: handoff.artifactId,
    resourceGroup: handoff.resourceGroup,
    staticWebAppName: handoff.staticWebAppName,
    environment: handoff.environment,
    packageSha256: handoff.packageSha256,
    manifestSha256: handoff.manifestSha256,
    stagedInventorySha256: handoff.stagedInventorySha256,
  });
}

function normalizeDeploymentIdentity(rawIdentity = {}) {
  assertNoForbiddenData(rawIdentity, 'authoritative deployment identity');
  assertExactKeys(
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
      AUTHORITATIVE_IDENTITY_VERSION,
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
    tenantId: assertSafeIdentifier(rawIdentity.tenantId, 'deployment identity tenantId', {
      backend: true,
    }),
    publicationId: assertSafeIdentifier(
      rawIdentity.publicationId,
      'deployment identity publicationId',
      { backend: true },
    ),
    releaseId: assertSafeIdentifier(rawIdentity.releaseId, 'deployment identity releaseId'),
    artifactId: assertSafeIdentifier(rawIdentity.artifactId, 'deployment identity artifactId'),
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

function normalizeEnvironmentVariableName(value) {
  const name = String(value ?? '');
  if (!ENVIRONMENT_NAME.test(name)) {
    throw new ContractError(
      'credential_environment_name_invalid',
      'Credential environment variable name must be a bounded uppercase identifier.',
    );
  }
  return name;
}

function assertExactKeys(value, allowedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Buffer.isBuffer(value)) {
    throw new ContractError('credential_contract_invalid', `${label} must be an object.`);
  }
  const allowed = new Set(allowedKeys);
  const extras = Object.keys(value).filter((key) => !allowed.has(key));
  if (extras.length > 0) {
    throw new ContractError(
      'credential_contract_field_forbidden',
      `${label} contains unsupported fields.`,
      { fields: extras.sort() },
    );
  }
}

function assertRequiredKeys(value, requiredKeys, label) {
  const missing = requiredKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  if (missing.length > 0) {
    throw new ContractError(
      'credential_contract_field_missing',
      `${label} is missing required fields.`,
      { fields: missing.sort() },
    );
  }
}

function enumMember(values, value, label) {
  if (!Object.values(values).includes(value)) {
    throw new ContractError('credential_enum_invalid', `${label} is invalid.`);
  }
  return value;
}

function exact(value, expected, label) {
  if (value !== expected) {
    throw new ContractError('credential_metadata_invalid', `${label} must be ${expected}.`);
  }
  return value;
}

function exactOneOf(value, expectedValues, label) {
  if (!expectedValues.includes(value)) {
    throw new ContractError(
      'credential_metadata_invalid',
      `${label} must be one of the closed supported values.`,
    );
  }
  return value;
}
