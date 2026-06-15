import fs from 'node:fs'
import path from 'node:path'

const EXPECTED_SCHEMA_VERSION = 'pumpkin.operatorHandoffPacket.v1'
const EXPECTED_PACKET_TYPE = 'multi_tenant_onboarding_operator_handoff'
const ICE_PACKAGE_HASH = 'sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073'
const ROLLER_PACKAGE_HASH = 'sha256:e5567ddc0f9b3c4e655f958d9f25cd3bef8ec72ce2f553fa37d36bab38a05b29'
const EXPECTED_APPROVAL_MANIFEST_ID = 'approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution'
const EXPECTED_EXECUTION_RUN_ID = 'execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local'
const EXPECTED_TARGET_MODE = 'local_scoped_import_execution'

export const requiredOperatorHandoffFields = Object.freeze([
  'handoffPacketId',
  'schemaVersion',
  'packetType',
  'tenantKey',
  'siteKey',
  'domain',
  'tenantState',
  'packageHash',
  'approvalManifestId',
  'executionRunId',
  'targetMode',
  'readbackSummary',
  'entityMappingSummary',
  'operatorProjectionRef',
  'backupCenterRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'runtimeQaRefs',
  'auditJobRefs',
  'olmCarryforwardRefs',
  'hardStops',
  'deferredGates',
  'securityBoundary',
  'redactionPolicy',
  'nextGates',
  'createdAt',
])

const blockedSecurityFlags = Object.freeze([
  'liveTenantCreation',
  'tenantImportExecution',
  'rollerImport',
  'rollerResume',
  'cmsWrites',
  'providerWrites',
  'mediaAssetWrites',
  'liveProviderIntegration',
  'olmStagingWrite',
  'deployment',
  'redeployment',
  'dnsMutation',
  'customDomainMutation',
  'googleIndexingAction',
  'contactPost',
  'azureMutation',
  'rbacAssignment',
  'protectedConfigRead',
  'secretsIncluded',
  'compressedArchiveCreated',
  'crawlOrOutboundLiveCheck',
  'electronRuntime',
])

const secretPatterns = Object.freeze([
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:password|api[_-]?key|secret|token|connectionstring|sas)\s*[:=]\s*["'][^"']{8,}["']/i,
  /\bSharedAccessSignature\b/i,
])

const protectedConfigPatterns = Object.freeze([
  /\.env\.local/i,
  /appsettings\.Development\.json/i,
  /local\.settings\.json/i,
  /credential/i,
  /browser cookie/i,
  /auth file/i,
  /PROTECTED_CONFIG_REFERENCE/,
])

function asArray(value) {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function compactStrings(value) {
  return asArray(value)
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function hasCount(value, expected, actual = expected) {
  if (typeof value === 'string') {
    return value === `${actual}/${expected}`
  }

  return value?.expected === expected && value?.actual === actual && value?.ok === true
}

function countFailure(label, value, expected, actual = expected) {
  return hasCount(value, expected, actual) ? null : `${label} must equal ${actual}/${expected}`
}

function hasString(values, expected) {
  return compactStrings(values).includes(expected)
}

function isArchiveRequested(packet, sourceText) {
  return packet.archiveRequested === true
    || packet.compressedArchiveRequested === true
    || packet.securityBoundary?.compressedArchiveCreated === true
    || /\.(?:zip|tar|tgz|tar\.gz|7z|rar)\b/i.test(sourceText)
}

function readJson(filePath) {
  const resolved = path.resolve(filePath)
  const normalized = resolved.replace(/\\/g, '/')
  if (/(^|\/)(?:\.env\.local|appsettings\.Development\.json|local\.settings\.json)$/i.test(normalized)) {
    throw new Error(`refusing to read protected handoff fixture path: ${normalized}`)
  }

  const sourceText = fs.readFileSync(resolved, 'utf8')
  return {
    sourceText,
    packet: JSON.parse(sourceText),
  }
}

function validateCommon(packet, failures, sourceText) {
  for (const field of requiredOperatorHandoffFields) {
    if (!Object.hasOwn(packet, field)) {
      failures.push(`missing required field: ${field}`)
    }
  }

  if (packet.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    failures.push(`schemaVersion must be ${EXPECTED_SCHEMA_VERSION}`)
  }

  if (packet.packetType !== EXPECTED_PACKET_TYPE) {
    failures.push(`packetType must be ${EXPECTED_PACKET_TYPE}`)
  }

  if (packet.redactionPolicy?.secretsPolicy !== 'references_only_no_values') {
    failures.push('redactionPolicy.secretsPolicy must be references_only_no_values')
  }

  if (packet.redactionPolicy?.protectedConfigPolicy !== 'do_not_reference_protected_paths') {
    failures.push('redactionPolicy.protectedConfigPolicy must be do_not_reference_protected_paths')
  }

  if (packet.redactionPolicy?.archivePolicy !== 'no_compressed_handoff_archives_in_repo') {
    failures.push('redactionPolicy.archivePolicy must be no_compressed_handoff_archives_in_repo')
  }

  const security = packet.securityBoundary ?? {}
  for (const flag of blockedSecurityFlags) {
    if (security[flag] !== false) {
      failures.push(`blocked security flag must be false: ${flag}`)
    }
  }

  if (isArchiveRequested(packet, sourceText)) {
    failures.push('compressed handoff archive requested')
  }

  if (packet.indexingState === 'requested' || security.googleIndexingAction === true) {
    failures.push('Google/Search Console/indexing requested')
  }

  if (!hasString(packet.deferredGates, 'google_search_console_indexing_deferred_hard_stop')) {
    failures.push('Google indexing deferred gate missing')
  }

  if (!hasString(packet.olmCarryforwardRefs, 'olm-2h23a-separate-future-safety-boundary')) {
    failures.push('OLM 2H-23A separate carryforward ref missing')
  }

  for (const pattern of secretPatterns) {
    if (pattern.test(sourceText)) {
      failures.push('handoff packet contains secret-like value')
      break
    }
  }

  if (packet.exampleBadValue === 'synthetic-secret-like-marker') {
    failures.push('handoff packet contains secret-like value')
  }

  for (const pattern of protectedConfigPatterns) {
    if (pattern.test(sourceText)) {
      failures.push('handoff packet references protected config')
      break
    }
  }
}

function validateIce(packet, failures) {
  if (packet.tenantState !== 'scoped_local_import_executed_readback_passed') {
    failures.push('Ice tenantState must be scoped_local_import_executed_readback_passed')
  }

  if (packet.packageHash !== ICE_PACKAGE_HASH) {
    failures.push('package hash does not match V2.11.7A/V2.11.8 canonical Ice hash')
  }

  if (packet.approvalManifestId !== EXPECTED_APPROVAL_MANIFEST_ID) {
    failures.push('approval manifest ID does not match V2.11.7A canonical ID')
  }

  if (packet.executionRunId !== EXPECTED_EXECUTION_RUN_ID) {
    failures.push('execution run ID does not match V2.11.7A canonical ID')
  }

  if (packet.targetMode !== EXPECTED_TARGET_MODE) {
    failures.push('targetMode must be local_scoped_import_execution')
  }

  const countFailures = [
    countFailure('readback routes', packet.readbackSummary?.routes, 3),
    countFailure('readback content refs', packet.readbackSummary?.contentRefs, 4),
    countFailure('readback media refs', packet.readbackSummary?.mediaRefs, 1),
    countFailure('readback form configs', packet.readbackSummary?.formConfigs, 1),
  ].filter(Boolean)
  failures.push(...countFailures)

  if (packet.entityMappingSummary?.total !== 10) {
    failures.push('entity mappings must equal 10')
  }

  if (packet.operatorProjectionRef?.readOnly !== true) {
    failures.push('operator projection ref must be read-only')
  }

  if (packet.operatorProjectionRef?.panelCount !== 15) {
    failures.push('operator projection panel count must equal 15')
  }

  if (packet.operatorProjectionRef?.futureApiRouteCount !== 7) {
    failures.push('operator projection future API route count must equal 7')
  }
}

function validateRoller(packet, failures) {
  if (packet.tenantState !== 'paused_no_import_no_resume') {
    failures.push('Roller tenantState must be paused_no_import_no_resume')
  }

  if (packet.packageHash !== ROLLER_PACKAGE_HASH) {
    failures.push('Roller package hash does not match paused package hash')
  }

  if (packet.targetMode !== 'blocked_no_import_no_resume') {
    failures.push('Roller targetMode must be blocked_no_import_no_resume')
  }

  if (packet.approvalManifestId !== null || packet.executionRunId !== null) {
    failures.push('Roller must not have approval manifest or execution run IDs')
  }

  if (packet.pauseResume?.resumeApproved !== false) {
    failures.push('Roller resume must remain unapproved')
  }

  if (packet.importApproved !== false) {
    failures.push('Roller import must remain unapproved')
  }

  if (!hasString(packet.hardStops, 'tenant_paused_no_import')) {
    failures.push('Roller paused no-import hard stop missing')
  }
}

export function validateOperatorHandoffPacket(packet, options = {}) {
  const failures = []
  const sourceText = options.sourceText ?? JSON.stringify(packet)

  validateCommon(packet, failures, sourceText)

  if (packet.tenantKey === 'ice-rink-rentals') {
    validateIce(packet, failures)
  } else if (packet.tenantKey === 'roller-rink-rentals') {
    validateRoller(packet, failures)
  } else {
    failures.push(`unsupported tenantKey for V2.12.1 handoff parity: ${packet.tenantKey}`)
  }

  return {
    ok: failures.length === 0,
    failureCount: failures.length,
    failures,
    handoffPacketId: packet.handoffPacketId ?? null,
    tenantKey: packet.tenantKey ?? null,
    packetType: packet.packetType ?? null,
    readOnly: packet.securityBoundary?.tenantImportExecution === false,
    parityChecks: {
      requiredFieldCount: requiredOperatorHandoffFields.length,
      iceCanonicalHash: packet.tenantKey === 'ice-rink-rentals' ? packet.packageHash === ICE_PACKAGE_HASH : null,
      rollerPaused: packet.tenantKey === 'roller-rink-rentals' ? packet.tenantState === 'paused_no_import_no_resume' : null,
      indexingDeferred: hasString(packet.deferredGates, 'google_search_console_indexing_deferred_hard_stop'),
      olmSeparateCarryforward: hasString(packet.olmCarryforwardRefs, 'olm-2h23a-separate-future-safety-boundary'),
      noArchiveRequested: !isArchiveRequested(packet, sourceText),
    },
  }
}

export function validateOperatorHandoffPacketFile(filePath) {
  const { sourceText, packet } = readJson(filePath)
  return validateOperatorHandoffPacket(packet, { sourceText })
}
