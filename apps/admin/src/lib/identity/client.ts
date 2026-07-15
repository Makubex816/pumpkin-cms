import type { CurrentIdentityProfile, IdentityApiError, IdentityMembership, TenantContactSettings } from './contracts'

export class IdentityClient {
  constructor(private readonly baseUrl: string, private readonly token: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json', ...init?.headers },
      cache: 'no-store',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ code: 'request_failed', message: 'Request failed', requestId: '' })) as IdentityApiError
      throw new Error(`${error.code}: ${error.message}`)
    }
    return response.json() as Promise<T>
  }

  profile() { return this.request<CurrentIdentityProfile>('/api/identity/current/profile') }
  memberships() { return this.request<IdentityMembership[]>('/api/identity/current/memberships') }
  switchTenant(tenantUid: string) { return this.request('/api/identity/current/switch-tenant', { method: 'POST', body: JSON.stringify({ tenantUid }) }) }
  changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/identity/current/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions: true }) })
  }
  requestEmailChange(newEmail: string, currentPassword: string) {
    return this.request('/api/identity/current/login-email-change', { method: 'POST', body: JSON.stringify({ newEmail, currentPassword }) })
  }
  contactSettings(tenantUid: string) { return this.request<TenantContactSettings>(`/api/identity/tenants/${encodeURIComponent(tenantUid)}/contact-settings`) }
}
