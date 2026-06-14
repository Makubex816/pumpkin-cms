import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(root, 'fixtures')

const requiredDataFields = [
  'schemaVersion',
  'providerMode',
  'readOnly',
  'packageId',
  'packageType',
  'tenantKey',
  'siteKey',
  'domain',
  'tenantLifecycleState',
  'importMode',
  'readyForFutureImportExecution',
  'routes',
  'contentRefs',
  'mediaRefs',
  'formConfigRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'backupEvidenceRefs',
  'runtimeQaRefs',
  'outboundLinkRefs',
  'auditJobRefs',
  'noGoConditions',
  'rollbackPlanId',
  'validationRefs',
  'warnings',
  'blockers',
  'nextGates',
  'securityBoundary',
  'redactionPolicy',
  'generatedAt',
]

const arrayFields = [
  'routes',
  'contentRefs',
  'mediaRefs',
  'formConfigRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'backupEvidenceRefs',
  'runtimeQaRefs',
  'outboundLinkRefs',
  'auditJobRefs',
  'noGoConditions',
  'validationRefs',
  'warnings',
  'blockers',
  'nextGates',
]

const blockedMetaFlags = [
  'externalHttpCrawling',
  'cmsApiCalls',
  'cmsWrites',
  'providerWrites',
  'protectedConfigReads',
  'writeActionsAllowed',
  'deployment',
  'searchConsoleIndexing',
]

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtures, name), 'utf8'))
}

function validateEnvelope(envelope) {
  const failures = []

  if (envelope.schemaVersion !== 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1') failures.push('envelope schemaVersion mismatch')
  if (envelope.providerMode !== 'api-local-import-package-fixture-readonly') failures.push('providerMode mismatch')
  if (envelope.readOnly !== true) failures.push('envelope readOnly must be true')
  if (envelope.data?.schemaVersion !== 'pumpkin.importIntakePreview.sharedModel.v1') failures.push('data schemaVersion mismatch')
  if (envelope.data?.readOnly !== true) failures.push('data readOnly must be true')
  if (envelope.securityBoundary?.noWriteBoundarySatisfied !== true || envelope.data?.securityBoundary?.noWriteBoundarySatisfied !== true) failures.push('no-write boundary must be satisfied')
  if ((envelope.securityBoundary?.openFlags ?? []).length > 0 || (envelope.data?.securityBoundary?.openFlags ?? []).length > 0) failures.push('open security flags are not allowed')
  if (envelope.meta?.googleIndexingState !== 'deferred_hard_stop') failures.push('Google indexing must remain deferred')

  for (const field of requiredDataFields) {
    if (!(field in (envelope.data ?? {}))) {
      failures.push(`missing data field: ${field}`)
    }
  }

  for (const field of arrayFields) {
    if (!Array.isArray(envelope.data?.[field])) {
      failures.push(`data.${field} must be an array`)
    }
  }

  for (const flag of blockedMetaFlags) {
    if (envelope.meta?.[flag] !== false) {
      failures.push(`meta flag must be false: ${flag}`)
    }
  }

  const enabledActions = (envelope.data?.futureActions ?? []).filter((action) => action.disabled !== true)
  if (enabledActions.length > 0) {
    failures.push(`future actions must be disabled: ${enabledActions.map((action) => action.id).join(', ')}`)
  }

  if (envelope.data?.tenantKey === 'roller-rink-rentals') {
    if (envelope.data.readyForFutureImportExecution !== false) failures.push('Roller preview must not be future-import-ready')
    if (envelope.data.importMode !== 'paused_no_import') failures.push('Roller preview must remain paused_no_import')
    if ((envelope.data.noGoConditions ?? []).length === 0) failures.push('Roller preview must show a no-go condition')
  }

  return failures
}

const validFixtures = [
  'valid-import-intake-preview-ice.envelope.json',
  'valid-import-intake-preview-roller.envelope.json',
]

for (const fixture of validFixtures) {
  const failures = validateEnvelope(loadFixture(fixture))
  assert.deepEqual(failures, [], `${fixture} should pass`)
}

const invalidFailures = validateEnvelope(loadFixture('invalid-import-intake-preview-enabled-action.envelope.json'))
assert.ok(invalidFailures.some((failure) => failure.includes('future actions must be disabled')))

console.log(JSON.stringify({
  status: 'passed',
  validContractFixtures: validFixtures.length,
  invalidContractFixtures: 1,
  requiredDataFields: requiredDataFields.length,
}, null, 2))
