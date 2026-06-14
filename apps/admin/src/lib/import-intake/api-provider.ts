import { API_URL } from '@/lib/api'
import {
  IMPORT_INTAKE_API_PROVIDER_MODE,
  createImportIntakeAdminSnapshotFromEnvelopes,
  getImportIntakeAdminFallbackSnapshot,
} from './mock-provider'
import type {
  ImportIntakeAdminSnapshot,
  ImportIntakeHealthMessage,
  ImportIntakeNoGoCondition,
  ImportIntakePackageSummary,
  ImportIntakePreviewModel,
  ImportIntakeReadOnlyApiEnvelope,
  ImportIntakeSecurityBoundary,
} from './types'

export const IMPORT_INTAKE_API_BASE_PATH = '/api/admin/import-intake'
export const IMPORT_INTAKE_API_ROUTE_PROVIDER_MODE = 'api-local-import-package-fixture-readonly'

const AUTHORIZATION_HEADER = 'Authorization'
const REQUIRED_GET_ENDPOINTS = [
  'packages',
  'packages/{packageId}',
  'packages/{packageId}/preview',
  'packages/{packageId}/validation',
  'packages/{packageId}/no-go',
  'packages/{packageId}/rollback',
  'packages/{packageId}/evidence',
  'packages/{packageId}/refs',
] as const

type RequestLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
type PackageEndpoint = Exclude<typeof REQUIRED_GET_ENDPOINTS[number], 'packages'>

interface ImportIntakeRouteEnvelope<TData> {
  ok: boolean
  status: number
  code: string
  message: string
  requestId: string
  correlationId: string
  providerMode: string
  readOnly: true
  data: TData | null
  warnings: ImportIntakeHealthMessage[]
  errors: Array<{ code: string; message: string; path?: string | null }>
  securityBoundary: ImportIntakeSecurityBoundary
  source: {
    kind: string
    fixturePath: string
    packagePreviewPath?: string | null
  }
  tenantKey: string | null
  siteKey: string | null
  meta: {
    mode: string
    localOnly: boolean
    readOnly: boolean
    providerMode: string
    sourceProviderMode?: string | null
    contractSchemaVersion: string
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

interface PackageListRouteData {
  items: ImportIntakePackageSummary[]
}

interface PackageRouteBundle {
  detail: ImportIntakeRouteEnvelope<ImportIntakePackageSummary>
  preview: ImportIntakeRouteEnvelope<ImportIntakePreviewModel>
  validation: ImportIntakeRouteEnvelope<unknown>
  noGo: ImportIntakeRouteEnvelope<{ items: ImportIntakeNoGoCondition[] }>
  rollback: ImportIntakeRouteEnvelope<unknown>
  evidence: ImportIntakeRouteEnvelope<unknown>
  refs: ImportIntakeRouteEnvelope<unknown>
}

export interface ImportIntakeApiProviderOptions {
  apiBaseUrl?: string
  authToken?: string | null
  request?: RequestLike
}

export async function getImportIntakeAdminApiSnapshot(
  options: ImportIntakeApiProviderOptions,
): Promise<ImportIntakeAdminSnapshot> {
  if (!options.authToken) {
    throw new Error('IMPORT_INTAKE_ADMIN_API_AUTH_REQUIRED')
  }

  const list = await readEndpoint<PackageListRouteData>('packages', options)
  const packageIds = list.data?.items.map((item) => item.packageId) ?? []
  if (packageIds.length === 0) {
    throw new Error('IMPORT_INTAKE_API_PACKAGE_LIST_EMPTY')
  }

  const bundles = await Promise.all(packageIds.map((packageId) => readPackageBundle(packageId, options)))
  const envelopes = bundles.map((bundle) => composeEnvelopeFromPreview(bundle.preview))

  return createImportIntakeAdminSnapshotFromEnvelopes(envelopes, {
    adminProviderMode: IMPORT_INTAKE_API_PROVIDER_MODE,
    sourceFixturePaths: envelopes.map((envelope) => envelope.source.fixturePath),
    apiEndpointCount: 1 + (bundles.length * 7),
    apiBaseUrl: normalizeBaseUrl(options.apiBaseUrl),
  })
}

export async function getImportIntakeAdminApiSnapshotWithFallback(
  options: ImportIntakeApiProviderOptions,
): Promise<ImportIntakeAdminSnapshot> {
  try {
    return await getImportIntakeAdminApiSnapshot(options)
  } catch (error) {
    return getImportIntakeAdminFallbackSnapshot(summarizeBridgeError(error))
  }
}

async function readPackageBundle(
  packageId: string,
  options: ImportIntakeApiProviderOptions,
): Promise<PackageRouteBundle> {
  const [
    detail,
    preview,
    validation,
    noGo,
    rollback,
    evidence,
    refs,
  ] = await Promise.all([
    readEndpoint<ImportIntakePackageSummary>('packages/{packageId}', options, packageId),
    readEndpoint<ImportIntakePreviewModel>('packages/{packageId}/preview', options, packageId),
    readEndpoint<unknown>('packages/{packageId}/validation', options, packageId),
    readEndpoint<{ items: ImportIntakeNoGoCondition[] }>('packages/{packageId}/no-go', options, packageId),
    readEndpoint<unknown>('packages/{packageId}/rollback', options, packageId),
    readEndpoint<unknown>('packages/{packageId}/evidence', options, packageId),
    readEndpoint<unknown>('packages/{packageId}/refs', options, packageId),
  ])

  if (detail.data?.packageId !== packageId || preview.data?.packageId !== packageId) {
    throw new Error(`IMPORT_INTAKE_API_PACKAGE_ID_MISMATCH:${packageId}`)
  }

  if ((noGo.data?.items.length ?? 0) !== (preview.data?.noGoConditions.length ?? -1)) {
    throw new Error(`IMPORT_INTAKE_API_NO_GO_PARITY_FAILED:${packageId}`)
  }

  return {
    detail,
    preview,
    validation,
    noGo,
    rollback,
    evidence,
    refs,
  }
}

async function readEndpoint<TData>(
  endpoint: typeof REQUIRED_GET_ENDPOINTS[number],
  options: ImportIntakeApiProviderOptions,
  packageId?: string,
): Promise<ImportIntakeRouteEnvelope<TData>> {
  const requester = options.request ?? globalThis.fetch.bind(globalThis)
  const response = await requester(buildEndpointUrl(endpoint, options, packageId), {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      [AUTHORIZATION_HEADER]: `Bearer ${options.authToken}`,
    },
  })

  const envelope = await response.json().catch(() => null) as ImportIntakeRouteEnvelope<TData> | null
  if (!envelope) {
    throw new Error(`IMPORT_INTAKE_API_INVALID_JSON:${endpoint}`)
  }

  assertReadOnlyEnvelope(endpoint, response.status, envelope)
  return envelope
}

function buildEndpointUrl(
  endpoint: typeof REQUIRED_GET_ENDPOINTS[number],
  options: ImportIntakeApiProviderOptions,
  packageId?: string,
) {
  const resolvedEndpoint = endpoint.replace('{packageId}', encodeURIComponent(packageId ?? ''))
  return new URL(`${normalizeBaseUrl(options.apiBaseUrl)}${IMPORT_INTAKE_API_BASE_PATH}/${resolvedEndpoint}`)
}

function assertReadOnlyEnvelope<TData>(
  endpoint: typeof REQUIRED_GET_ENDPOINTS[number],
  httpStatus: number,
  envelope: ImportIntakeRouteEnvelope<TData>,
) {
  if (!envelope.ok || envelope.status !== 200 || httpStatus !== 200) {
    throw new Error(`IMPORT_INTAKE_API_ROUTE_NOT_OK:${endpoint}:${httpStatus}:${envelope.code}`)
  }

  if (envelope.readOnly !== true || envelope.providerMode !== IMPORT_INTAKE_API_ROUTE_PROVIDER_MODE) {
    throw new Error(`IMPORT_INTAKE_API_READONLY_CONTRACT_FAILED:${endpoint}`)
  }

  if (!envelope.securityBoundary?.localOnly || !envelope.securityBoundary?.noWriteBoundarySatisfied) {
    throw new Error(`IMPORT_INTAKE_API_SECURITY_BOUNDARY_FAILED:${endpoint}`)
  }

  if ((envelope.securityBoundary?.openFlags ?? []).length > 0) {
    throw new Error(`IMPORT_INTAKE_API_OPEN_WRITE_FLAGS:${endpoint}`)
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
    || meta.googleIndexingState !== 'deferred_hard_stop'
  ) {
    throw new Error(`IMPORT_INTAKE_API_META_WRITE_BOUNDARY_FAILED:${endpoint}`)
  }
}

function composeEnvelopeFromPreview(
  previewResponse: ImportIntakeRouteEnvelope<ImportIntakePreviewModel>,
): ImportIntakeReadOnlyApiEnvelope {
  if (!previewResponse.data) {
    throw new Error('IMPORT_INTAKE_API_PREVIEW_DATA_MISSING')
  }

  return {
    schemaVersion: 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1',
    ok: true,
    status: 'ok',
    code: previewResponse.code,
    message: 'Import intake Admin API bridge composed from GET-only Pumpkin API endpoint envelopes.',
    requestId: previewResponse.requestId,
    correlationId: previewResponse.correlationId,
    providerMode: IMPORT_INTAKE_API_ROUTE_PROVIDER_MODE,
    readOnly: true,
    data: previewResponse.data,
    warnings: previewResponse.warnings,
    errors: [],
    securityBoundary: previewResponse.securityBoundary,
    source: previewResponse.source,
    tenantKey: previewResponse.tenantKey ?? previewResponse.data.tenantKey,
    siteKey: previewResponse.siteKey ?? previewResponse.data.siteKey,
    meta: {
      mode: previewResponse.meta.mode,
      localOnly: true,
      readOnly: true,
      providerMode: IMPORT_INTAKE_API_ROUTE_PROVIDER_MODE,
      sourceProviderMode: previewResponse.meta.sourceProviderMode ?? null,
      contractSchemaVersion: 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1',
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      providerWrites: false,
      protectedConfigReads: false,
      writeActionsAllowed: false,
      deployment: false,
      searchConsoleIndexing: false,
      googleIndexingState: 'deferred_hard_stop',
    },
  }
}

function normalizeBaseUrl(value?: string) {
  return (value || API_URL).replace(/\/+$/, '')
}

function summarizeBridgeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 240)
  }

  return 'IMPORT_INTAKE_ADMIN_API_UNKNOWN_ERROR'
}
