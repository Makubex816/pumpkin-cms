import { API_URL } from '@/lib/api'
import {
  AUDIT_JOB_LEDGER_API_PROVIDER_MODE,
  createAuditJobLedgerAdminSnapshotFromEnvelope,
  getAuditJobLedgerAdminFallbackSnapshot,
} from './mock-provider'
import type {
  AuditJobLedgerAdminSnapshot,
  AuditJobLedgerAuditEvent,
  AuditJobLedgerEvidenceBinding,
  AuditJobLedgerHealthMessage,
  AuditJobLedgerJobRun,
  AuditJobLedgerNextGate,
  AuditJobLedgerPanel,
  AuditJobLedgerPromotionGate,
  AuditJobLedgerReadOnlyApiEnvelope,
  AuditJobLedgerSecurityBoundary,
  AuditJobLedgerSharedViewerModel,
  AuditJobLedgerSummary,
  AuditJobLedgerTraceEntry,
  AuditJobLedgerTraceModel,
} from './types'

export const AUDIT_JOB_LEDGER_API_BASE_PATH = '/api/admin/audit-jobs'
export const AUDIT_JOB_LEDGER_API_ENVELOPE_PROVIDER_MODE = 'api-local-fixture-readonly'

const AUTHORIZATION_HEADER = 'Authorization'
const REQUIRED_GET_ENDPOINTS = [
  'viewer-summary',
  'events',
  'job-runs',
  'promotion-gates',
  'evidence-bindings',
  'traces',
  'blockers',
  'next-gates',
] as const

type AuditJobLedgerApiEndpoint = typeof REQUIRED_GET_ENDPOINTS[number]
type RequestLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface AuditJobRouteEnvelope<TData> {
  ok: boolean
  status: number
  code: string
  message: string
  requestId: string
  correlationId: string
  providerMode: string
  readOnly: true
  data: TData | null
  warnings: AuditJobLedgerHealthMessage[]
  errors: Array<{ code: string; message: string; path?: string | null }>
  securityBoundary: AuditJobLedgerSecurityBoundary
  source: {
    fixturePath: string
    runtimeHttpWarning: string | null
  }
  tenantKey: string | null
  siteKey: string | null
  meta: {
    providerMode: string
    sourceProviderMode?: string | null
    contractSchemaVersion?: string
    externalHttpCrawling: boolean
    cmsApiCalls: boolean
    cmsWrites: boolean
    providerWrites: boolean
    protectedConfigReads: boolean
    writeActionsAllowed: boolean
    deployment: boolean
    searchConsoleIndexing: boolean
    googleIndexingState: string
  }
}

interface ViewerSummaryRouteData {
  summary: AuditJobLedgerSummary
  panels: AuditJobLedgerPanel[]
  warnings: AuditJobLedgerHealthMessage[]
  blockers: AuditJobLedgerHealthMessage[]
  nextGates: AuditJobLedgerNextGate[]
}

interface ItemListRouteData<TItem> {
  items: TItem[]
}

export interface AuditJobLedgerApiProviderOptions {
  apiBaseUrl?: string
  tenantKey: string
  siteKey: string
  authToken?: string | null
  request?: RequestLike
}

export async function getAuditJobLedgerAdminApiSnapshot(
  options: AuditJobLedgerApiProviderOptions,
): Promise<AuditJobLedgerAdminSnapshot> {
  if (!options.authToken) {
    throw new Error('AUDIT_JOB_ADMIN_API_AUTH_REQUIRED')
  }

  const responses = await readAllEndpoints(options)
  const envelope = composeSharedEnvelope(responses)

  return createAuditJobLedgerAdminSnapshotFromEnvelope(envelope, {
    adminProviderMode: AUDIT_JOB_LEDGER_API_PROVIDER_MODE,
    sourceFixturePath: envelope.source.fixturePath,
    apiRequestIds: unique(Object.values(responses).map((response) => response.requestId)),
    apiCorrelationIds: unique(Object.values(responses).map((response) => response.correlationId)),
    apiEndpointCount: REQUIRED_GET_ENDPOINTS.length,
    apiBaseUrl: normalizeBaseUrl(options.apiBaseUrl),
  })
}

export async function getAuditJobLedgerAdminApiSnapshotWithFallback(
  options: AuditJobLedgerApiProviderOptions,
): Promise<AuditJobLedgerAdminSnapshot> {
  try {
    return await getAuditJobLedgerAdminApiSnapshot(options)
  } catch (error) {
    return getAuditJobLedgerAdminFallbackSnapshot(summarizeBridgeError(error))
  }
}

async function readAllEndpoints(options: AuditJobLedgerApiProviderOptions) {
  const [
    viewerSummary,
    events,
    jobRuns,
    promotionGates,
    evidenceBindings,
    traces,
    blockers,
    nextGates,
  ] = await Promise.all([
    readEndpoint<ViewerSummaryRouteData>('viewer-summary', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerAuditEvent>>('events', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerJobRun>>('job-runs', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerPromotionGate>>('promotion-gates', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerEvidenceBinding>>('evidence-bindings', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerTraceEntry>>('traces', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerHealthMessage>>('blockers', options),
    readEndpoint<ItemListRouteData<AuditJobLedgerNextGate>>('next-gates', options),
  ])

  return {
    viewerSummary,
    events,
    jobRuns,
    promotionGates,
    evidenceBindings,
    traces,
    blockers,
    nextGates,
  }
}

async function readEndpoint<TData>(
  endpoint: AuditJobLedgerApiEndpoint,
  options: AuditJobLedgerApiProviderOptions,
): Promise<AuditJobRouteEnvelope<TData>> {
  const requester = options.request ?? globalThis.fetch.bind(globalThis)
  const response = await requester(buildEndpointUrl(endpoint, options), {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      [AUTHORIZATION_HEADER]: `Bearer ${options.authToken}`,
    },
  })

  const envelope = await response.json().catch(() => null) as AuditJobRouteEnvelope<TData> | null
  if (!envelope) {
    throw new Error(`AUDIT_JOB_API_INVALID_JSON:${endpoint}`)
  }

  assertReadOnlyEnvelope(endpoint, response.status, envelope)
  return envelope
}

function buildEndpointUrl(endpoint: AuditJobLedgerApiEndpoint, options: AuditJobLedgerApiProviderOptions) {
  const url = new URL(`${normalizeBaseUrl(options.apiBaseUrl)}${AUDIT_JOB_LEDGER_API_BASE_PATH}/${endpoint}`)
  url.searchParams.set('tenantKey', options.tenantKey)
  url.searchParams.set('siteKey', options.siteKey)
  return url
}

function assertReadOnlyEnvelope<TData>(
  endpoint: AuditJobLedgerApiEndpoint,
  httpStatus: number,
  envelope: AuditJobRouteEnvelope<TData>,
) {
  if (!envelope.ok || envelope.status !== 200 || httpStatus !== 200) {
    throw new Error(`AUDIT_JOB_API_ROUTE_NOT_OK:${endpoint}:${httpStatus}:${envelope.code}`)
  }

  if (envelope.readOnly !== true || envelope.providerMode !== AUDIT_JOB_LEDGER_API_ENVELOPE_PROVIDER_MODE) {
    throw new Error(`AUDIT_JOB_API_READONLY_CONTRACT_FAILED:${endpoint}`)
  }

  if (!envelope.securityBoundary?.localOnly || !envelope.securityBoundary?.noWriteBoundarySatisfied) {
    throw new Error(`AUDIT_JOB_API_SECURITY_BOUNDARY_FAILED:${endpoint}`)
  }

  if ((envelope.securityBoundary?.openFlags ?? []).length > 0) {
    throw new Error(`AUDIT_JOB_API_OPEN_WRITE_FLAGS:${endpoint}`)
  }

  const meta = envelope.meta
  if (
    meta.externalHttpCrawling
    || meta.cmsApiCalls
    || meta.cmsWrites
    || meta.providerWrites
    || meta.protectedConfigReads
    || meta.writeActionsAllowed
    || meta.deployment
    || meta.searchConsoleIndexing
  ) {
    throw new Error(`AUDIT_JOB_API_META_WRITE_BOUNDARY_FAILED:${endpoint}`)
  }
}

function composeSharedEnvelope(responses: Awaited<ReturnType<typeof readAllEndpoints>>): AuditJobLedgerReadOnlyApiEnvelope {
  const generatedAt = new Date().toISOString()
  const viewerSummary = responses.viewerSummary
  const auditEvents = responses.events.data?.items ?? []
  const jobRuns = responses.jobRuns.data?.items ?? []
  const promotionGates = responses.promotionGates.data?.items ?? []
  const evidenceBindings = responses.evidenceBindings.data?.items ?? []
  const traceEntries = responses.traces.data?.items ?? []
  const blockers = responses.blockers.data?.items ?? []
  const nextGates = responses.nextGates.data?.items ?? []
  const warnings = viewerSummary.data?.warnings ?? viewerSummary.warnings ?? []

  const data: AuditJobLedgerSharedViewerModel = {
    schemaVersion: 'audit-job-ledger-shared-viewer-model.v1',
    providerMode: AUDIT_JOB_LEDGER_API_ENVELOPE_PROVIDER_MODE,
    readOnly: true,
    ok: true,
    summary: viewerSummary.data!.summary,
    panels: viewerSummary.data!.panels,
    auditEvents,
    jobRuns,
    promotionGates,
    evidenceBindings,
    traceIds: createTraceModel(traceEntries),
    warnings,
    blockers,
    nextGates,
    securityBoundary: viewerSummary.securityBoundary,
    validation: {
      ok: true,
      failureCount: 0,
      failures: [],
    },
    redactionPolicy: {
      rawSecretsAllowed: false,
      protectedConfigAllowed: false,
      tokenLikeValuesAllowed: false,
      disallowedSecretClasses: [
        'deploymentToken',
        'oauthToken',
        'connectionString',
        'accountKey',
        'privateKey',
      ],
    },
    generatedAt,
    legacyViewerModelVersion: 'audit-job-ledger-viewer.v1',
  }

  return {
    schemaVersion: 'audit-job-ledger-readonly-api-envelope.v1',
    ok: true,
    status: 'ok',
    code: 'AUDIT_JOB_OK',
    message: 'Audit Jobs Admin API bridge composed from GET-only Pumpkin API endpoint envelopes.',
    requestId: viewerSummary.requestId,
    correlationId: viewerSummary.correlationId,
    providerMode: AUDIT_JOB_LEDGER_API_ENVELOPE_PROVIDER_MODE,
    readOnly: true,
    data,
    warnings,
    errors: [],
    securityBoundary: viewerSummary.securityBoundary,
    source: {
      fixturePath: viewerSummary.source.fixturePath,
      runtimeHttpWarning: viewerSummary.source.runtimeHttpWarning ?? null,
    },
    tenantKey: viewerSummary.tenantKey,
    siteKey: viewerSummary.siteKey,
    meta: {
      generatedAt,
      runtimeHttpWarning: null,
      sharedViewerModelSchemaVersion: 'audit-job-ledger-shared-viewer-model.v1',
    },
  }
}

function createTraceModel(entries: AuditJobLedgerTraceEntry[]): AuditJobLedgerTraceModel {
  const byField: Record<string, number> = {}
  for (const entry of entries) {
    byField[entry.field] = (byField[entry.field] ?? 0) + 1
  }

  return {
    entries,
    byField,
    correlationIds: unique(entries.map((entry) => entry.correlationId).filter(isString)),
    searchableFields: Object.keys(byField).sort(),
  }
}

function normalizeBaseUrl(value?: string) {
  return (value || API_URL).replace(/\/+$/, '')
}

function summarizeBridgeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 240)
  }

  return 'AUDIT_JOB_ADMIN_API_UNKNOWN_ERROR'
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(isString)))
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
