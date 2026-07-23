import {
  ContractError,
  ContractVersion,
  DomainStage,
} from './contracts.mjs';
import {
  canonicalDigest,
  clone,
  deterministicId,
  immutable,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
} from './security.mjs';

const MUTATING_ACTIONS = new Set([
  'create-or-reuse',
  'tag',
  'register',
  'deploy',
  'update',
  'rollback',
  'revoke',
  'archive',
]);

export class AzureStaticWebAppDeploymentService {
  #adapter;
  #credentialProvider;
  #journal = [];

  constructor({ adapter, credentialProvider }) {
    assertAdapter(adapter);
    if (!credentialProvider || typeof credentialProvider.runChild !== 'function') {
      throw new ContractError(
        'deployment_credential_provider_invalid',
        'Deployment service requires a child-environment credential provider.',
      );
    }
    this.#adapter = adapter;
    this.#credentialProvider = credentialProvider;
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
    const deployment = {
      artifactRootRef: assertSafeRelativeReference(
        rawDeployment?.artifactRootRef,
        'deployment artifactRootRef',
      ),
      environment: exact(rawDeployment?.environment ?? 'production', 'production', 'deployment environment'),
      packageSha256: assertSha256(rawDeployment?.packageSha256, 'deployment packageSha256'),
      manifestSha256: assertSha256(rawDeployment?.manifestSha256, 'deployment manifestSha256'),
    };
    const operation = buildOperation('deploy', 'azure-swa', context, deployment, approval);
    const command = this.#adapter.buildDeployCommand(operation);
    const childContract = this.#credentialProvider.childEnvironmentContract(command);
    this.#appendJournal(operation, 'started', {
      credentialReferenceId: childContract.credentialReferenceId,
      commandContractSha256: childContract.contractSha256,
      environmentVariableName: childContract.environmentVariableName,
      valueIncluded: false,
    });
    try {
      const childResult = await this.#credentialProvider.runChild(
        command,
        this.#adapter.spawnChild.bind(this.#adapter),
      );
      const result = buildResult(operation, childResult);
      this.#appendJournal(operation, 'completed', {
        resultSha256: result.resultSha256,
        statusCode: result.statusCode,
        valuesIncluded: false,
      });
      return result;
    } catch (error) {
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

  rollback(context, rollback, approval) {
    return this.#invoke(
      'rollback',
      'azure-swa',
      context,
      {
        predecessorPublicationId: assertSafeIdentifier(
          rollback?.predecessorPublicationId,
          'rollback predecessorPublicationId',
          { backend: true },
        ),
        predecessorArtifactSha256: assertSha256(
          rollback?.predecessorArtifactSha256,
          'rollback predecessorArtifactSha256',
        ),
        automatic: false,
      },
      approval,
    );
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
      { mutationRequired: false },
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
      { mutationRequired: false },
    );
    this.#appendJournal(operation, 'held', { stage: DomainStage.HELD, valuesIncluded: false });
    return operation;
  }

  journal() {
    return immutable(this.#journal);
  }

  async #invoke(action, provider, context, payload, approval) {
    const operation = buildOperation(action, provider, context, payload, approval);
    this.#appendJournal(operation, 'started', { valuesIncluded: false });
    try {
      const adapterResult = await this.#adapter.invoke(operation);
      const result = buildResult(operation, adapterResult);
      this.#appendJournal(operation, 'completed', {
        resultSha256: result.resultSha256,
        statusCode: result.statusCode,
        valuesIncluded: false,
      });
      return result;
    } catch (error) {
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
}

export function buildOperation(
  action,
  provider,
  context,
  payload,
  approval,
  { mutationRequired = MUTATING_ACTIONS.has(action) } = {},
) {
  const normalizedContext = normalizeContext(context);
  const normalizedProvider = assertSafeIdentifier(provider, 'deployment operation provider');
  const normalizedAction = assertSafeIdentifier(action, 'deployment operation action');
  const normalizedPayload = normalizePublicMetadata(payload, 'deployment operation payload');
  let approvalRef = null;
  if (mutationRequired) {
    if (approval?.approved !== true) {
      throw new ContractError('deployment_approval_required', `${action} requires explicit approval.`);
    }
    approvalRef = assertSafeIdentifier(approval.approvalRef, 'deployment approvalRef');
  }
  const body = {
    schemaVersion: ContractVersion.deploymentOperation,
    operationId: deterministicId('deployment-operation', {
      action: normalizedAction,
      provider: normalizedProvider,
      context: normalizedContext,
      payload: normalizedPayload,
    }),
    idempotencyKey: canonicalDigest({
      action: normalizedAction,
      provider: normalizedProvider,
      context: normalizedContext,
      payload: normalizedPayload,
    }),
    action: normalizedAction,
    provider: normalizedProvider,
    context: normalizedContext,
    payload: normalizedPayload,
    mutationRequired,
    mutationAuthorized: mutationRequired ? true : false,
    approvalRef,
    credentialValuesIncluded: false,
  };
  return immutable({
    ...body,
    operationSha256: canonicalDigest(body),
  });
}

export function verifyDeploymentOperation(operation) {
  const { operationSha256, ...body } = clone(operation ?? {});
  if (body.schemaVersion !== ContractVersion.deploymentOperation) {
    throw new ContractError('deployment_operation_schema_invalid', 'Deployment operation schema is invalid.');
  }
  if (canonicalDigest(body) !== operationSha256) {
    throw new ContractError('deployment_operation_hash_mismatch', 'Deployment operation hash does not match.');
  }
  assertNoForbiddenData(body, 'deployment operation');
  return true;
}

export function createCurrentPowerShellAdapterDescriptor() {
  const body = {
    adapterType: 'AUDITED_POWERSHELL_HELPER_DELEGATE',
    implementationStatus: 'INJECTION_REQUIRED',
    executionBuiltIn: false,
    evidenceRefs: [
      'deployment/architecture/tenant-publication/pub-20-a03-token-security-reconciliation/dpapi-envelope-contract.md',
      'deployment/architecture/tenant-publication/pub-20-a03-token-security-reconciliation/secure-token-use-proof.md',
    ],
    credentialDelivery: 'CHILD_PROCESS_ENVIRONMENT_ONLY',
    rawOutputCapture: false,
    commandLineCredentialAllowed: false,
    diskCredentialAllowed: false,
    tokenRotationSupported: false,
  };
  return immutable({ ...body, descriptorSha256: canonicalDigest(body) });
}

export class InMemoryDeploymentAdapter {
  #events = [];

  async invoke(operation) {
    verifyDeploymentOperation(operation);
    this.#events.push(immutable({
      action: operation.action,
      operationId: operation.operationId,
      environmentVariableNames: [],
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    }));
    return {
      exitCode: 0,
      statusCode: operation.action === 'read-resource' ? 'read' : 'completed',
      metadata: {
        operationId: operation.operationId,
        action: operation.action,
        resourceName: operation.context.staticWebAppName,
      },
      valuesIncluded: false,
    };
  }

  buildDeployCommand(operation) {
    verifyDeploymentOperation(operation);
    if (operation.action !== 'deploy') {
      throw new ContractError('deployment_action_invalid', 'Only deploy operations produce deployment commands.');
    }
    return immutable({
      executable: 'powershell',
      arguments: [
        '-NoProfile',
        '-NonInteractive',
        '-File',
        'operator-helper.ps1',
        '-ArtifactRootRef',
        operation.payload.artifactRootRef,
        '-AppName',
        operation.context.staticWebAppName,
        '-ResourceGroup',
        operation.context.resourceGroup,
      ],
      workingDirectoryRef: 'tools/tenant-publication-product',
    });
  }

  async spawnChild(descriptor, childEnvironment) {
    const names = Object.keys(childEnvironment).sort();
    if (
      descriptor.inheritParentEnvironment !== false ||
      names.length !== 1 ||
      typeof childEnvironment[names[0]] !== 'string' ||
      childEnvironment[names[0]].length === 0
    ) {
      throw new ContractError('deployment_child_environment_invalid', 'Child environment contract was not honored.');
    }
    this.#events.push(immutable({
      action: 'deploy-child',
      executable: descriptor.executable,
      arguments: descriptor.arguments,
      environmentVariableNames: names,
      rawOutputIncluded: false,
      credentialValuesIncluded: false,
    }));
    return { exitCode: 0, statusCode: 'deployed' };
  }

  events() {
    return immutable(this.#events);
  }
}

function buildResult(operation, rawResult = {}) {
  verifyDeploymentOperation(operation);
  assertNoForbiddenData(rawResult, 'deployment adapter result');
  const exitCode = Number(rawResult.exitCode ?? 0);
  if (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255) {
    throw new ContractError('deployment_result_exit_invalid', 'Deployment result exit code is invalid.');
  }
  const metadata = normalizePublicMetadata(rawResult.metadata ?? {}, 'deployment result metadata');
  const body = {
    schemaVersion: ContractVersion.deploymentResult,
    operationId: operation.operationId,
    action: operation.action,
    statusCode: assertSafeIdentifier(
      rawResult.statusCode ?? (exitCode === 0 ? 'completed' : 'failed'),
      'deployment result statusCode',
    ),
    exitCode,
    metadata,
    rawOutputIncluded: false,
    credentialValuesIncluded: false,
  };
  return immutable({ ...body, resultSha256: canonicalDigest(body) });
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
  for (const method of ['invoke', 'buildDeployCommand', 'spawnChild']) {
    if (typeof adapter?.[method] !== 'function') {
      throw new ContractError('deployment_adapter_invalid', `Deployment adapter must implement ${method}().`);
    }
  }
}

function exact(value, expected, label) {
  if (value !== expected) throw new ContractError('deployment_value_invalid', `${label} must be ${expected}.`);
  return value;
}

function safeErrorCode(error) {
  const value = String(error?.code ?? 'deployment_adapter_failed');
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value) ? value : 'deployment_adapter_failed';
}
