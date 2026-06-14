import iceEnvelopeFixture from '../../../../../deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-ice.envelope.json'
import rollerEnvelopeFixture from '../../../../../deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-roller.envelope.json'
import {
  assertImportIntakeFutureActionsReadOnly,
  createImportIntakeAdminModelFromEnvelopes,
} from './contract-adapter'
import type {
  ImportIntakeAdminApiFallback,
  ImportIntakeAdminPackage,
  ImportIntakeAdminProviderMode,
  ImportIntakeAdminSnapshot,
  ImportIntakeFutureAction,
  ImportIntakeQueryState,
  ImportIntakeReadOnlyApiEnvelope,
} from './types'

export const IMPORT_INTAKE_ADMIN_ROUTE = '/dashboard/import-intake'
export const IMPORT_INTAKE_ACTIVE_GOVERNANCE_LANE = 'V2.11 - Multi-Tenant Onboarding / Import Package Governance'
export const IMPORT_INTAKE_LOCAL_PROVIDER_MODE = 'admin-local-import-package-fixture-readonly'
export const IMPORT_INTAKE_API_PROVIDER_MODE = 'admin-api-import-intake-readonly'
export const IMPORT_INTAKE_API_ENVELOPE_PROVIDER_MODE = 'api-local-import-package-fixture-readonly'

export const IMPORT_INTAKE_ICE_FIXTURE_PATH = 'deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-ice.envelope.json'
export const IMPORT_INTAKE_ROLLER_FIXTURE_PATH = 'deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-roller.envelope.json'

export const IMPORT_INTAKE_REQUIRED_PANEL_TITLES = [
  'Import Package Summary',
  'Tenant Lifecycle',
  'Routes and Content',
  'Media References',
  'Forms and Contact Configuration',
  'Resource Registry / Provider Profile',
  'Backup Center',
  'Runtime QA',
  'Outbound Link Manager',
  'Audit Jobs / Promotion Governance',
  'No-Go Conditions',
  'Rollback / Abort',
  'Security and Redaction',
  'Paused Tenant / Resume Governance',
  'Next Gates',
] as const

export const defaultImportIntakeQuery: ImportIntakeQueryState = {
  search: '',
  tenantKey: 'all',
  lifecycleState: 'all',
  importMode: 'all',
  noGoState: 'all',
  packageType: 'all',
  sortField: 'tenantKey',
  sortDirection: 'asc',
}

let cachedSnapshot: ImportIntakeAdminSnapshot | null = null

export function getImportIntakeAdminSnapshot(): ImportIntakeAdminSnapshot {
  if (cachedSnapshot) return cachedSnapshot

  cachedSnapshot = createImportIntakeAdminSnapshotFromEnvelopes(
    [
      iceEnvelopeFixture as ImportIntakeReadOnlyApiEnvelope,
      rollerEnvelopeFixture as ImportIntakeReadOnlyApiEnvelope,
    ],
    {
      adminProviderMode: IMPORT_INTAKE_LOCAL_PROVIDER_MODE,
      sourceFixturePaths: [
        IMPORT_INTAKE_ICE_FIXTURE_PATH,
        IMPORT_INTAKE_ROLLER_FIXTURE_PATH,
      ],
    },
  )

  return cachedSnapshot
}

export function getImportIntakeAdminFallbackSnapshot(reason: string): ImportIntakeAdminSnapshot {
  return {
    ...getImportIntakeAdminSnapshot(),
    fallback: {
      attemptedProviderMode: IMPORT_INTAKE_API_PROVIDER_MODE,
      reason,
    },
  }
}

export function createImportIntakeAdminSnapshotFromEnvelopes(
  envelopes: ImportIntakeReadOnlyApiEnvelope[],
  options: {
    adminProviderMode: ImportIntakeAdminProviderMode
    sourceFixturePaths: string[]
    fallback?: ImportIntakeAdminApiFallback | null
    apiEndpointCount?: number
    apiBaseUrl?: string | null
  },
): ImportIntakeAdminSnapshot {
  const contractModel = createImportIntakeAdminModelFromEnvelopes(envelopes, {
    adminProviderMode: options.adminProviderMode,
    sourceFixturePaths: options.sourceFixturePaths,
    apiEndpointCount: options.apiEndpointCount,
    apiBaseUrl: options.apiBaseUrl,
  })
  const futureActions = createFutureActions(contractModel.packages)
  assertImportIntakeFutureActionsReadOnly(futureActions)

  return {
    activeGovernanceLane: IMPORT_INTAKE_ACTIVE_GOVERNANCE_LANE,
    route: IMPORT_INTAKE_ADMIN_ROUTE,
    providerMode: options.adminProviderMode,
    fixturePaths: options.sourceFixturePaths,
    contract: contractModel.contract,
    packages: contractModel.packages,
    futureActions,
    fallback: options.fallback ?? null,
  }
}

export function queryImportIntakePackages(
  snapshot: ImportIntakeAdminSnapshot,
  query: ImportIntakeQueryState,
): ImportIntakeAdminPackage[] {
  const search = normalizeSearch(query.search)

  return snapshot.packages
    .filter((pack) => query.tenantKey === 'all' || pack.summary.tenantKey === query.tenantKey)
    .filter((pack) => query.lifecycleState === 'all' || pack.summary.tenantLifecycleState === query.lifecycleState)
    .filter((pack) => query.importMode === 'all' || pack.summary.importMode === query.importMode)
    .filter((pack) => query.packageType === 'all' || pack.summary.packageType === query.packageType)
    .filter((pack) => matchesNoGoState(pack, query.noGoState))
    .filter((pack) => search.length === 0 || pack.searchText.includes(search))
    .sort((first, second) => comparePackages(first, second, query))
}

export function getImportIntakePackageById(snapshot: ImportIntakeAdminSnapshot, packageId: string | null) {
  if (!packageId) return null
  return snapshot.packages.find((pack) => pack.summary.packageId === packageId) ?? null
}

export function getImportIntakePackageOptions(snapshot: ImportIntakeAdminSnapshot) {
  return snapshot.packages.map((pack) => ({
    packageId: pack.summary.packageId,
    tenantKey: pack.summary.tenantKey,
    label: `${pack.summary.tenantKey} / ${pack.summary.importMode}`,
  }))
}

export function summarizePackageReadiness(pack: ImportIntakeAdminPackage) {
  if (pack.summary.readyForFutureImportExecution) return 'future gate ready'
  if (pack.summary.importMode === 'paused_no_import') return 'paused no-import'
  if (pack.summary.counts.noGoConditions > 0) return 'blocked by no-go'
  return 'display only'
}

function createFutureActions(packages: ImportIntakeAdminPackage[]): ImportIntakeFutureAction[] {
  const fixtureActions = packages.flatMap((pack) => pack.preview.futureActions)

  return uniqueById([
    ...fixtureActions,
    {
      id: 'create-live-tenant',
      label: 'Create tenant',
      disabled: true,
      reason: 'Future-gated. Live tenant creation is outside V2.11.4.',
    },
    {
      id: 'publish-package',
      label: 'Publish package',
      disabled: true,
      reason: 'Future-gated. CMS/provider writes and deployment are closed.',
    },
    {
      id: 'resume-roller',
      label: 'Resume Roller',
      disabled: true,
      reason: 'Future-gated. Roller resume is not approved.',
    },
  ])
}

function matchesNoGoState(pack: ImportIntakeAdminPackage, state: ImportIntakeQueryState['noGoState']) {
  if (state === 'all') return true
  const hasNoGo = pack.summary.counts.noGoConditions > 0
  return state === 'blocked' ? hasNoGo : !hasNoGo
}

function comparePackages(
  first: ImportIntakeAdminPackage,
  second: ImportIntakeAdminPackage,
  query: ImportIntakeQueryState,
) {
  const multiplier = query.sortDirection === 'asc' ? 1 : -1
  const firstValue = valueForSort(first, query.sortField)
  const secondValue = valueForSort(second, query.sortField)
  return multiplier * firstValue.localeCompare(secondValue, undefined, { numeric: true })
}

function valueForSort(pack: ImportIntakeAdminPackage, field: ImportIntakeQueryState['sortField']) {
  if (field === 'noGoCount') return String(pack.summary.counts.noGoConditions).padStart(3, '0')
  return String(pack.summary[field])
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function uniqueById(actions: ImportIntakeFutureAction[]) {
  const seen = new Set<string>()
  return actions.filter((action) => {
    if (seen.has(action.id)) return false
    seen.add(action.id)
    return true
  })
}
