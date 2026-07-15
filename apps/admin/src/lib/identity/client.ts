import type {
  CurrentIdentityProfile,
  FormNotificationRecipient,
  GlobalIdentityUser,
  IdentityApiError,
  IdentityAuditEvent,
  IdentityFeatureState,
  IdentityInvitation,
  IdentityMembership,
  IdentityMigrationConflict,
  IdentityRecordStatus,
  IdentitySession,
  IdentityTenant,
  SwitchTenantResult,
  TemporaryPasswordResult,
  TenantContactSettings,
  TenantRole,
} from './contracts'

type IdentityFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export class IdentityClientError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string

  constructor(status: number, error: IdentityApiError) {
    super(error.message || 'Identity request failed')
    this.name = 'IdentityClientError'
    this.status = status
    this.code = error.code || 'identity_request_failed'
    this.requestId = error.requestId || ''
  }
}

export function isIdentityNotificationProviderUnavailable(error: unknown): boolean {
  return error instanceof IdentityClientError &&
    error.status === 503 &&
    error.code === 'identity_notification_provider_unavailable'
}

export class IdentityClient {
  private readonly baseUrl: string
  private readonly token: string
  private readonly fetcher: IdentityFetch

  constructor(baseUrl: string, token: string, fetcher: IdentityFetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token
    this.fetcher = fetcher
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })

    if (!response.ok) {
      const fallback: IdentityApiError = {
        code: `http_${response.status}`,
        message: response.statusText || 'Identity request failed',
        requestId: '',
      }
      const error = await response.json().catch(() => fallback) as Partial<IdentityApiError>
      throw new IdentityClientError(response.status, {
        code: error.code || fallback.code,
        message: error.message || fallback.message,
        requestId: error.requestId || '',
      })
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  featureState() {
    return this.request<IdentityFeatureState>('/api/identity/feature-state')
  }

  profile() {
    return this.request<CurrentIdentityProfile>('/api/identity/current/profile')
  }

  memberships() {
    return this.request<IdentityMembership[]>('/api/identity/current/memberships')
  }

  sessions() {
    return this.request<IdentitySession[]>('/api/identity/current/sessions')
  }

  switchTenant(tenantUid: string) {
    return this.request<SwitchTenantResult>('/api/identity/current/switch-tenant', {
      method: 'POST',
      body: JSON.stringify({ tenantUid }),
    })
  }

  changePassword(currentPassword: string, newPassword: string, revokeOtherSessions = true) {
    return this.request<{ changed: boolean; sessionVersion: number; allSessionsRevoked: boolean }>(
      '/api/identity/current/password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
      },
    )
  }

  revokeSessions() {
    return this.request<{ revoked: number; sessionVersion: number }>(
      '/api/identity/current/sessions/revoke',
      { method: 'POST' },
    )
  }

  requestEmailChange(newEmail: string, currentPassword: string) {
    return this.request<{ status: string; providerState?: string }>(
      '/api/identity/current/login-email-change',
      { method: 'POST', body: JSON.stringify({ newEmail: newEmail.trim(), currentPassword }) },
    )
  }

  tenantMemberships(tenantUid: string) {
    return this.request<IdentityMembership[]>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/memberships`,
    )
  }

  inviteUser(tenantUid: string, email: string, role: TenantRole, idempotencyKey: string) {
    return this.request<IdentityInvitation>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/invitations`,
      { method: 'POST', body: JSON.stringify({ email: email.trim(), role, idempotencyKey: idempotencyKey.trim() }) },
    )
  }

  revokeInvitation(tenantUid: string, invitationId: string, reason: string) {
    return this.request<{ invitationId: string; status: 'Revoked' }>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/invitations/${encodeURIComponent(invitationId)}/revoke`,
      { method: 'POST', body: JSON.stringify({ reason: reason.trim() }) },
    )
  }

  addMembership(tenantUid: string, userId: string, role: TenantRole, idempotencyKey: string) {
    return this.request<IdentityMembership>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/memberships`,
      { method: 'POST', body: JSON.stringify({ userId: userId.trim(), role, idempotencyKey: idempotencyKey.trim() }) },
    )
  }

  changeMembershipRole(tenantUid: string, membershipId: string, role: TenantRole, reason: string) {
    return this.request(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/memberships/${encodeURIComponent(membershipId)}/role`,
      { method: 'PUT', body: JSON.stringify({ role, reason: reason.trim() }) },
    )
  }

  changeMembershipStatus(
    tenantUid: string,
    membershipId: string,
    status: IdentityRecordStatus,
    reason: string,
  ) {
    return this.request(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/memberships/${encodeURIComponent(membershipId)}/status`,
      { method: 'PUT', body: JSON.stringify({ status, reason: reason.trim() }) },
    )
  }

  transferTenantAdmin(
    tenantUid: string,
    toMembershipId: string,
    reason: string,
    confirmation: string,
  ) {
    return this.request(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/memberships/transfer-tenant-admin`,
      {
        method: 'POST',
        body: JSON.stringify({
          toMembershipId: toMembershipId.trim(),
          reason: reason.trim(),
          confirmation: confirmation.trim(),
        }),
      },
    )
  }

  contactSettings(tenantUid: string) {
    return this.request<TenantContactSettings>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/contact-settings`,
    )
  }

  updateContactSettings(
    tenantUid: string,
    update: {
      primaryContactEmail: string
      recipients: FormNotificationRecipient[]
      defaultNotificationPolicy: string
      formDefinitionOverrides: Record<string, string[]>
      expectedConcurrencyToken: string
    },
  ) {
    const payload = {
      primaryContactEmail: update.primaryContactEmail.trim(),
      recipients: update.recipients.map((recipient) => ({
        id: recipient.id.trim(),
        email: recipient.email.trim(),
        normalizedEmail: recipient.normalizedEmail,
        order: recipient.order,
        isActive: recipient.isActive,
        ...(recipient.replyTo !== undefined ? { replyTo: recipient.replyTo } : {}),
      })),
      defaultNotificationPolicy: update.defaultNotificationPolicy,
      formDefinitionOverrides: update.formDefinitionOverrides,
    }

    return this.request<TenantContactSettings>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/contact-settings`,
      {
        method: 'PUT',
        headers: { 'If-Match': update.expectedConcurrencyToken },
        body: JSON.stringify(payload),
      },
    )
  }

  tenantAudit(tenantUid: string) {
    return this.request<IdentityAuditEvent[]>(
      `/api/identity/tenants/${encodeURIComponent(tenantUid)}/audit`,
    )
  }

  globalUsers() {
    return this.request<GlobalIdentityUser[]>('/api/identity/superadmin/users')
  }

  globalTenants() {
    return this.request<IdentityTenant[]>('/api/identity/superadmin/tenants')
  }

  globalAudit() {
    return this.request<IdentityAuditEvent[]>('/api/identity/superadmin/audit')
  }

  migrationConflicts() {
    return this.request<IdentityMigrationConflict[]>('/api/identity/superadmin/migration-conflicts')
  }

  globalUserMemberships(userId: string) {
    return this.request<IdentityMembership[]>(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/memberships`,
    )
  }

  changeAdministrativeEmail(
    userId: string,
    newEmail: string,
    reason: string,
    revokeSessions = true,
    forcePasswordChange = false,
  ) {
    return this.request(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/email`,
      {
        method: 'POST',
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          reason: reason.trim(),
          revokeSessions,
          forcePasswordChange,
        }),
      },
    )
  }

  issueTemporaryPassword(userId: string, reason: string, forceChangeAtNextLogin = true) {
    return this.request<TemporaryPasswordResult>(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/temporary-password`,
      { method: 'POST', body: JSON.stringify({ reason: reason.trim(), forceChangeAtNextLogin }) },
    )
  }

  resetPassword(userId: string, newPassword: string, reason: string, forceChangeAtNextLogin = true) {
    return this.request<{ userId: string; passwordReset: boolean; sessionsRevoked: boolean; forceChangeAtNextLogin: boolean }>(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/password-reset`,
      { method: 'POST', body: JSON.stringify({ newPassword, reason: reason.trim(), forceChangeAtNextLogin }) },
    )
  }

  forceSignOut(userId: string, reason: string) {
    return this.request<{ userId: string; sessionVersion: number }>(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/force-sign-out`,
      { method: 'POST', body: JSON.stringify({ reason: reason.trim() }) },
    )
  }

  setGlobalUserStatus(userId: string, status: 'Active' | 'Suspended', reason: string) {
    return this.request(
      `/api/identity/superadmin/users/${encodeURIComponent(userId)}/${status === 'Active' ? 'restore' : 'disable'}`,
      { method: 'POST', body: JSON.stringify({ reason: reason.trim() }) },
    )
  }
}
