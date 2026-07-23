import type {
  PublicationActionRequest,
  PublicationActionResult,
  SuperAdminPublicationCenterSnapshot,
  TenantPublicationCenterSnapshot,
} from './types'

interface PublicationProductClientOptions {
  apiBaseUrl: string
  token: string
}

const PROHIBITED_RESPONSE_KEYS =
  /(^|_)(token|password|secret|credentialvalue|ciphertext|entropy|privatekey|connectionstring)($|_)/i

export class PublicationProductClient {
  private readonly apiBaseUrl: string
  private readonly token: string

  constructor({ apiBaseUrl, token }: PublicationProductClientOptions) {
    this.apiBaseUrl = apiBaseUrl
    this.token = token
  }

  getTenantSnapshot(tenantUid: string): Promise<TenantPublicationCenterSnapshot> {
    return this.request<TenantPublicationCenterSnapshot>(
      `/api/admin/publication-products/tenants/${encodeURIComponent(tenantUid)}/center`,
    )
  }

  getSuperAdminSnapshot(): Promise<SuperAdminPublicationCenterSnapshot> {
    return this.request<SuperAdminPublicationCenterSnapshot>(
      '/api/admin/publication-products/center',
    )
  }

  async runAction(request: PublicationActionRequest): Promise<PublicationActionResult> {
    const tenant = encodeURIComponent(request.tenantUid)
    const publication = encodeURIComponent(request.publicationId)
    const job = request.jobId ? encodeURIComponent(request.jobId) : ''
    const actionBody = {
      idempotencyKey: request.idempotencyKey,
      expectedRevision: request.expectedRevision,
      reason: request.reason,
    }

    let path: string
    let body: object
    switch (request.action) {
      case 'BUILD_CANDIDATE':
        if (!request.releaseId || !request.artifactId) {
          throw new Error('Select an accepted release with an immutable tenant artifact before creating a job.')
        }
        path = `/api/admin/publication-products/tenants/${tenant}/publications/${publication}/jobs`
        body = {
          jobId: `ui-job-${request.expectedRevision}`,
          releaseId: request.releaseId,
          artifactId: request.artifactId,
          rollbackReleaseId: request.rollbackReleaseId || '',
          rollbackArtifactId: request.rollbackArtifactId || '',
          kind: 'tenant-publication',
          steps: ONBOARDING_JOB_STEPS,
          idempotencyKey: request.idempotencyKey,
          expectedRevision: request.expectedRevision,
        }
        break
      case 'PROMOTE':
      case 'RESUME':
      case 'ROLLBACK':
        if (!job) {
          throw new Error(`A resumable publication job is required for ${request.action.toLowerCase()}.`)
        }
        path =
          `/api/admin/publication-products/tenants/${tenant}/publications/${publication}` +
          `/jobs/${job}/${request.action.toLowerCase()}`
        body =
          request.action === 'ROLLBACK' &&
          request.rollbackReleaseId &&
          request.rollbackArtifactId
            ? {
                ...actionBody,
                rollbackReleaseId: request.rollbackReleaseId,
                rollbackArtifactId: request.rollbackArtifactId,
              }
            : actionBody
        break
      case 'REVOKE':
        path = `/api/admin/publication-products/tenants/${tenant}/publications/${publication}/revoke`
        body = actionBody
        break
      case 'PREVIEW_PLAN':
        throw new Error('Plan preview is computed locally from the current read-only center snapshot.')
    }

    const response = await this.request<PublicationMutationResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const state =
      response.job?.status ??
      response.job?.state ??
      response.publication?.status ??
      'accepted'

    return {
      accepted: true,
      action: request.action,
      jobId: response.job?.jobId,
      state,
      idempotentReplay: response.idempotentReplay === true,
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.apiBaseUrl || !this.token) {
      throw new Error('Publication product API is unavailable without an authenticated API configuration.')
    }

    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${this.token}`,
        ...init.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Publication product API returned HTTP ${response.status}.`)
    }

    const body: unknown = await response.json()
    assertResponseContainsNoSecretValues(body)
    return body as T
  }
}

interface PublicationMutationResponse {
  job?: {
    jobId?: string
    status?: string
    state?: string
  }
  publication?: {
    status?: string
  }
  idempotentReplay?: boolean
}

const ONBOARDING_JOB_STEPS = [
  'validate-intake',
  'reconcile-tenant',
  'import-content',
  'classify-hosting',
  'assign-release',
  'build-artifact',
  'plan-frontend',
  'register-publication',
  'deploy-artifact',
  'preflight-public-form',
  'prove-form-entry',
  'hold-domain',
  'accept-preview',
  'hold-indexing',
  'verify-backup',
  'close-registers',
] as const

function assertResponseContainsNoSecretValues(value: unknown, path = '$'): void {
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertResponseContainsNoSecretValues(item, `${path}[${index}]`))
    return
  }

  for (const [key, child] of Object.entries(value)) {
    if (PROHIBITED_RESPONSE_KEYS.test(key.replace(/[-\s]/g, '_'))) {
      throw new Error(`Publication response was rejected because ${path}.${key} is a protected field.`)
    }
    assertResponseContainsNoSecretValues(child, `${path}.${key}`)
  }
}
