import {
  ContractError,
  ContractVersion,
  DomainStage,
} from './contracts.mjs';
import {
  canonicalDigest,
  deterministicId,
  immutable,
} from './canonical.mjs';
import {
  assertHttpsUrl,
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSha256,
} from './security.mjs';

const MUTATION_ACTIONS = new Set(['create', 'update', 'deploy', 'revoke', 'archive', 'delete']);

export function buildSwaPublicationPlan(rawInput) {
  assertNoForbiddenData(rawInput, 'Azure Static Web Apps plan input');
  const input = normalizeInput(rawInput);
  const context = {
    tenantId: input.tenantId,
    publicationId: input.publicationId,
    releaseId: input.releaseId,
    artifactId: input.artifact.artifactId,
    artifactSha256: input.artifact.packageSha256,
    manifestSha256: input.artifact.manifestSha256,
    resourceGroup: input.resource.resourceGroup,
    staticWebAppName: input.resource.staticWebAppName,
    region: input.resource.region,
    sku: 'Free',
  };
  const defaultOrigin = input.currentState.defaultHostname
    ? `https://${input.currentState.defaultHostname}`
    : null;
  const tagsMatch = input.currentState.tagsMatch === true;
  const artifactMatches =
    input.currentState.deployedArtifactSha256 === input.artifact.packageSha256;
  const operations = [
    operation('swa.read-resource', 'read', 'azure', [], context, {
      fields: ['name', 'resourceGroup', 'location', 'sku', 'defaultHostname', 'tags'],
      valuesIncluded: false,
    }),
    operation(
      'swa.ensure-free-resource',
      input.currentState.resourceExists ? 'verify' : 'create',
      'azure',
      ['swa.read-resource'],
      context,
      {
        sku: 'Free',
        createOrReuse: true,
      },
      input.approvals.resourceMutation,
    ),
    operation(
      'swa.reconcile-tags',
      tagsMatch ? 'noop' : 'update',
      'azure',
      ['swa.ensure-free-resource'],
      context,
      { requiredTags: input.resource.tags },
      input.approvals.resourceMutation,
    ),
    operation('swa.read-default-origin', 'read', 'azure', ['swa.ensure-free-resource'], context, {
      defaultOrigin,
      readbackRequired: defaultOrigin === null,
    }),
    operation('credential.prepare-child-environment', 'verify', 'local-credential-provider', [], context, {
      credentialReferenceId: input.credentialReferenceId,
      delivery: 'child-process-environment',
      valueIncluded: false,
      clearAfterChildExit: true,
    }),
    operation(
      'swa.deploy-exact-artifact',
      artifactMatches ? 'noop' : 'deploy',
      'azure',
      [
        'swa.ensure-free-resource',
        'swa.reconcile-tags',
        'credential.prepare-child-environment',
      ],
      context,
      {
        artifactId: input.artifact.artifactId,
        packageSha256: input.artifact.packageSha256,
        manifestSha256: input.artifact.manifestSha256,
        prebuiltArtifact: true,
      },
      input.approvals.deploymentMutation,
    ),
    operation(
      'swa.verify-exact-deployment',
      'read',
      'validation',
      ['swa.deploy-exact-artifact'],
      context,
      {
        expectedPackageSha256: input.artifact.packageSha256,
        expectedManifestSha256: input.artifact.manifestSha256,
        routeVerification: true,
        noindexVerification: true,
      },
    ),
    operation(
      'publication.update-default-origin',
      input.currentState.publicationOriginMatches && defaultOrigin ? 'noop' : 'update',
      'publication-registry',
      ['swa.read-default-origin', 'swa.verify-exact-deployment'],
      context,
      {
        exactOrigin: defaultOrigin,
        readbackRequired: defaultOrigin === null,
      },
      input.approvals.publicationMutation,
    ),
    operation('publication.prepare-rollback', 'verify', 'publication-registry', ['swa.verify-exact-deployment'], context, {
      predecessorPublicationId: input.rollback.predecessorPublicationId,
      predecessorArtifactSha256: input.rollback.predecessorArtifactSha256,
      automaticExecution: false,
    }),
    operation('domain.prepare-held-handoff', 'hold', 'domain', ['publication.update-default-origin'], context, {
      stage: DomainStage.HELD,
      apex: input.domain.apex,
      www: input.domain.www,
      dnsProvider: input.domain.dnsProvider,
      mutationAuthorized: false,
      indexingAuthorized: false,
    }),
    operation(
      'publication.revoke-predecessor-plan',
      input.cleanup.revokePredecessorRequested ? 'revoke' : 'hold',
      'publication-registry',
      ['publication.prepare-rollback'],
      context,
      {
        predecessorPublicationId: input.rollback.predecessorPublicationId,
        planOnly: true,
      },
      input.approvals.publicationMutation,
    ),
    operation(
      'artifact.archive-superseded-plan',
      input.cleanup.archiveSupersededRequested ? 'archive' : 'hold',
      'artifact-registry',
      ['publication.prepare-rollback'],
      context,
      {
        predecessorArtifactSha256: input.rollback.predecessorArtifactSha256,
        planOnly: true,
      },
      input.approvals.publicationMutation,
    ),
    operation(
      'swa.delete-resource-plan',
      input.cleanup.deleteResourceRequested ? 'delete' : 'hold',
      'azure',
      ['publication.prepare-rollback'],
      context,
      {
        requiredConfirmation: `DELETE ${input.resource.staticWebAppName}`,
        confirmationSatisfied:
          input.cleanup.deleteConfirmation === `DELETE ${input.resource.staticWebAppName}`,
        planOnly: true,
      },
      input.approvals.deleteResourceMutation &&
        input.cleanup.deleteConfirmation === `DELETE ${input.resource.staticWebAppName}`,
    ),
  ];

  const mutationOperations = operations.filter((item) => item.mutationRequired);
  const body = {
    schemaVersion: ContractVersion.swaPlan,
    planId: deterministicId('swa-plan', { context, operations }),
    planOnly: true,
    executeCapabilityIncluded: false,
    liveMutation: false,
    credentialValuesIncluded: false,
    context,
    operations,
    operationCount: operations.length,
    mutationRequiredCount: mutationOperations.length,
    unauthorizedMutationCount: mutationOperations.filter((item) => !item.mutationAuthorized).length,
    reconciliationStatus:
      mutationOperations.length === 0 ? 'no-op' : 'changes-planned',
    domainHandoffState: DomainStage.HELD,
  };
  return immutable({
    ...body,
    planSha256: canonicalDigest(body),
  });
}

export function verifySwaPlan(plan) {
  if (plan?.schemaVersion !== ContractVersion.swaPlan || plan?.planOnly !== true) {
    throw new ContractError('swa_plan_invalid', 'SWA plan contract is invalid.');
  }
  const { planSha256, ...body } = plan;
  if (canonicalDigest(body) !== planSha256) {
    throw new ContractError('swa_plan_hash_mismatch', 'SWA plan hash does not match its content.');
  }
  if (plan.executeCapabilityIncluded !== false || plan.liveMutation !== false) {
    throw new ContractError('swa_plan_execution_open', 'SWA plan unexpectedly includes execution authority.');
  }
  return true;
}

function normalizeInput(input = {}) {
  const sku = input.resource?.sku ?? 'Free';
  if (sku !== 'Free') {
    throw new ContractError('swa_paid_sku_forbidden', 'This product slice plans only Azure Static Web Apps Free resources.');
  }
  if (
    input.currentState?.resourceExists === true &&
    input.currentState?.sku !== undefined &&
    input.currentState.sku !== 'Free'
  ) {
    throw new ContractError('swa_existing_paid_sku_forbidden', 'An existing non-Free Static Web App cannot be reused.');
  }
  const currentHostname = input.currentState?.defaultHostname
    ? normalizeHostname(input.currentState.defaultHostname)
    : null;
  if (currentHostname) assertHttpsUrl(`https://${currentHostname}`, 'currentState.defaultHostname');
  const cleanup = {
    revokePredecessorRequested: input.cleanup?.revokePredecessorRequested === true,
    archiveSupersededRequested: input.cleanup?.archiveSupersededRequested === true,
    deleteResourceRequested: input.cleanup?.deleteResourceRequested === true,
    deleteConfirmation: String(input.cleanup?.deleteConfirmation ?? ''),
  };
  if (
    cleanup.deleteResourceRequested &&
    cleanup.deleteConfirmation !== `DELETE ${input.resource?.staticWebAppName}`
  ) {
    throw new ContractError('swa_delete_confirmation_required', 'Resource deletion planning requires the exact typed confirmation.');
  }
  return {
    tenantId: assertSafeIdentifier(input.tenantId, 'tenantId', { backend: true }).toLowerCase(),
    publicationId: assertSafeIdentifier(input.publicationId, 'publicationId', { backend: true }),
    releaseId: assertSafeIdentifier(input.releaseId, 'releaseId'),
    artifact: {
      artifactId: assertSafeIdentifier(input.artifact?.artifactId, 'artifact.artifactId'),
      packageSha256: assertSha256(input.artifact?.packageSha256, 'artifact.packageSha256'),
      manifestSha256: assertSha256(input.artifact?.manifestSha256, 'artifact.manifestSha256'),
    },
    resource: {
      subscriptionAlias: assertSafeIdentifier(input.resource?.subscriptionAlias, 'resource.subscriptionAlias'),
      resourceGroup: assertSafeIdentifier(input.resource?.resourceGroup, 'resource.resourceGroup'),
      staticWebAppName: assertSafeIdentifier(input.resource?.staticWebAppName, 'resource.staticWebAppName', { backend: true }),
      region: assertSafeIdentifier(input.resource?.region, 'resource.region', { backend: true }),
      sku: 'Free',
      tags: normalizeTags(input.resource?.tags ?? {}),
    },
    credentialReferenceId: assertSafeIdentifier(input.credentialReferenceId, 'credentialReferenceId'),
    currentState: {
      resourceExists: input.currentState?.resourceExists === true,
      sku: input.currentState?.resourceExists === true ? (input.currentState?.sku ?? 'Free') : null,
      tagsMatch: input.currentState?.tagsMatch === true,
      defaultHostname: currentHostname,
      deployedArtifactSha256: input.currentState?.deployedArtifactSha256
        ? assertSha256(input.currentState.deployedArtifactSha256, 'currentState.deployedArtifactSha256')
        : null,
      publicationOriginMatches: input.currentState?.publicationOriginMatches === true,
    },
    rollback: {
      predecessorPublicationId: assertSafeIdentifier(
        input.rollback?.predecessorPublicationId,
        'rollback.predecessorPublicationId',
        { backend: true },
      ),
      predecessorArtifactSha256: assertSha256(
        input.rollback?.predecessorArtifactSha256,
        'rollback.predecessorArtifactSha256',
      ),
    },
    domain: {
      apex: normalizeHostname(input.domain?.apex),
      www: normalizeHostname(input.domain?.www),
      dnsProvider: assertSafeIdentifier(input.domain?.dnsProvider, 'domain.dnsProvider'),
    },
    approvals: {
      resourceMutation: approved(input.approvals?.resourceMutation),
      deploymentMutation: approved(input.approvals?.deploymentMutation),
      publicationMutation: approved(input.approvals?.publicationMutation),
      deleteResourceMutation: approved(input.approvals?.deleteResourceMutation),
    },
    cleanup,
  };
}

function operation(key, action, provider, dependsOn, context, detail, approvedMutation = false) {
  const mutationRequired = MUTATION_ACTIONS.has(action);
  return immutable({
    operationId: deterministicId('swa-operation', { key, context }),
    idempotencyKey: canonicalDigest({ key, context }),
    key,
    action,
    provider,
    dependsOn,
    detail,
    mutationRequired,
    mutationAuthorized: mutationRequired && approvedMutation === true,
    executionIncluded: false,
  });
}

function normalizeTags(tags) {
  if (!tags || typeof tags !== 'object' || Array.isArray(tags)) {
    throw new ContractError('swa_tags_invalid', 'resource.tags must be an object.');
  }
  return Object.fromEntries(
    Object.entries(tags)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, value]) => [
        assertSafeIdentifier(key, 'resource tag key'),
        String(value).slice(0, 256),
      ]),
  );
}

function normalizeHostname(value) {
  const hostname = String(value ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (
    !hostname ||
    hostname.length > 253 ||
    hostname.includes('/') ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(hostname)
  ) {
    throw new ContractError('hostname_invalid', `Invalid hostname: ${String(value)}`);
  }
  return hostname;
}

function approved(value) {
  return value === true || value === 'approved';
}
