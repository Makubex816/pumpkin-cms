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

export function normalizeCredentialReference(rawReference) {
  assertNoForbiddenData(rawReference, 'credential reference');
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
    envelopeReference:
      providerType === CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER
        ? assertSafeRelativeReference(rawReference.envelopeReference, 'envelopeReference')
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
  return immutable({
    ...body,
    referenceSha256: canonicalDigest(body),
  });
}

export function verifyCredentialReference(reference) {
  const { referenceSha256, ...raw } = clone(reference ?? {});
  const normalized = normalizeCredentialReference(raw);
  if (normalized.referenceSha256 !== referenceSha256) {
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
  const body = {
    schemaVersion: ContractVersion.childEnvironment,
    credentialReferenceId: reference.credentialReferenceId,
    providerType: reference.providerType,
    environmentVariableName: reference.environmentVariableName,
    executable: command.executable,
    arguments: command.arguments,
    workingDirectoryRef: command.workingDirectoryRef,
    inheritParentEnvironment: false,
    injectAtSpawnOnly: true,
    decryptInProviderOnly: true,
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
  #decryptForChild;

  constructor({ reference, decryptForChild }) {
    verifyCredentialReference(reference);
    if (reference.providerType !== CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER) {
      throw new ContractError('credential_provider_type_invalid', 'Current DPAPI provider requires a DPAPI reference.');
    }
    if (typeof decryptForChild !== 'function') {
      throw new ContractError(
        'credential_decrypt_boundary_missing',
        'A same-user, memory-only DPAPI decrypt boundary must be injected.',
      );
    }
    this.#reference = immutable(reference);
    this.#decryptForChild = decryptForChild;
  }

  describe() {
    return immutable({
      providerType: CredentialProviderType.WINDOWS_DPAPI_CURRENT_USER,
      credentialReferenceId: this.#reference.credentialReferenceId,
      envelopeReference: this.#reference.envelopeReference,
      protectionScope: 'CurrentUser',
      valuesReturned: false,
      childEnvironmentOnly: true,
      rotationSupported: false,
      tokenResetSupported: false,
    });
  }

  childEnvironmentContract(command) {
    return buildChildEnvironmentContract(this.#reference, command);
  }

  async runChild(command, spawnChild) {
    if (typeof spawnChild !== 'function') {
      throw new ContractError('credential_spawn_boundary_missing', 'A child-process spawn boundary must be injected.');
    }
    const contract = this.childEnvironmentContract(command);
    let material = await this.#decryptForChild(immutable({
      credentialReferenceId: this.#reference.credentialReferenceId,
      envelopeReference: this.#reference.envelopeReference,
      envelopeSha256: this.#reference.envelopeSha256,
      envelopeFormat: this.#reference.envelopeFormat,
      protectionScope: this.#reference.protectionScope,
      valueIncluded: false,
    }));
    if (typeof material === 'string') material = Buffer.from(material, 'utf8');
    if (!Buffer.isBuffer(material) || material.length === 0 || material.length > 16_384) {
      throw new ContractError('credential_material_invalid', 'DPAPI decrypt boundary returned invalid material.');
    }

    const value = material.toString('utf8');
    if (!value || contract.arguments.some((argument) => argument.includes(value))) {
      material.fill(0);
      throw new ContractError('credential_command_line_forbidden', 'Credential material cannot appear on the command line.');
    }
    const childEnvironment = { [contract.environmentVariableName]: value };
    try {
      const rawResult = await spawnChild(immutable({
        executable: contract.executable,
        arguments: contract.arguments,
        workingDirectoryRef: contract.workingDirectoryRef,
        inheritParentEnvironment: false,
        environmentVariableNames: [contract.environmentVariableName],
        outputCapture: contract.outputCapture,
      }), childEnvironment);
      return sanitizeChildResult(rawResult);
    } finally {
      childEnvironment[contract.environmentVariableName] = '';
      material.fill(0);
      material = null;
    }
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
      childEnvironmentOnly: true,
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

function normalizeCommand(rawCommand = {}) {
  assertNoForbiddenData(rawCommand, 'child command');
  const executable = assertSafeIdentifier(rawCommand.executable, 'child executable');
  const argumentsList = rawCommand.arguments ?? [];
  if (!Array.isArray(argumentsList) || argumentsList.length > 64) {
    throw new ContractError('child_arguments_invalid', 'Child arguments must be a bounded array.');
  }
  const argumentsNormalized = argumentsList.map((argument, index) => {
    const value = String(argument);
    if (
      value.length === 0 ||
      value.length > 512 ||
      /(?:^|[-_])(token|secret|password)(?:$|[=_-])/i.test(value) ||
      value.includes('\0')
    ) {
      throw new ContractError('child_argument_unsafe', `Child argument ${index} is unsafe.`);
    }
    return value;
  });
  return {
    executable,
    arguments: argumentsNormalized,
    workingDirectoryRef: assertSafeRelativeReference(
      rawCommand.workingDirectoryRef,
      'child workingDirectoryRef',
    ),
  };
}

function sanitizeChildResult(rawResult = {}) {
  const exitCode = Number(rawResult.exitCode);
  if (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255) {
    throw new ContractError('child_result_invalid', 'Child result requires a bounded numeric exit code.');
  }
  const result = {
    exitCode,
    signal: rawResult.signal ? assertSafeIdentifier(rawResult.signal, 'child signal') : null,
    statusCode: rawResult.statusCode
      ? assertSafeIdentifier(rawResult.statusCode, 'child statusCode')
      : exitCode === 0
        ? 'completed'
        : 'failed',
    stdoutCaptured: false,
    stderrCaptured: false,
    valuesIncluded: false,
  };
  assertNoForbiddenData(result, 'sanitized child result');
  return immutable(result);
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
