export type IdentityRecordStatus =
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'Revoked'
  | 'Completed'
  | 'Failed'
  | 'DeadLetter'

export type TenantRole = 'TenantAdmin' | 'Editor' | 'Viewer'
export type DeliveryCapability = 'DisabledNoProvider' | 'Suppressed' | 'Configured'

export interface IdentityFeatureState {
  foundationEnabled: boolean
  dualReadEnabled: boolean
  dualWriteEnabled: boolean
  renameEnabled: boolean
  migrationExecutionEnabled: boolean
  notificationProviderEnabled: boolean
  managementEnabled: boolean
  tenantSwitcherEnabled: boolean
  passwordAndSessionManagementEnabled: boolean
  membershipManagementEnabled: boolean
  contactManagementEnabled: boolean
  superAdminManagementEnabled: boolean
  providerAwareEmailRequestsEnabled: boolean
}

export interface IdentityCapabilities {
  read: boolean
  mutate: boolean
  tenantSwitcher: boolean
  passwordAndSessions: boolean
  memberships: boolean
  contacts: boolean
  superAdminRead: boolean
  superAdminCredentials: boolean
  superAdmin: boolean
  providerAwareEmailRequests: boolean
  rename: false
}

export interface IdentityMembership {
  id?: string
  membershipId: string
  tenantUid: string
  userId: string
  canonicalSlug?: string
  displayName?: string
  legacyTenantId?: string
  role: TenantRole
  status: IdentityRecordStatus
  isPrimaryTenantAdmin: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IdentityTenant {
  tenantUid: string
  legacyTenantId: string
  canonicalSlug: string
  displayName: string
  status: IdentityRecordStatus
}

export interface CurrentIdentityProfile {
  userId: string
  loginEmail: string
  emailVerified: boolean
  forcePasswordChange: boolean
  sessionVersion: number
  providerState: 'held_no_delivery_provider' | 'configured' | string
}

export interface IdentitySession {
  sessionId: string
  sessionVersion: number
  issuedAt?: string | null
  lastSeenAt?: string | null
  expiresAt?: string | null
  revokedAt?: string | null
  current: boolean
}

export interface FormNotificationRecipient {
  id: string
  email: string
  normalizedEmail: string
  order: number
  isActive: boolean
  isVerified: boolean
  replyTo?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface TenantContactSettings {
  id?: string
  /** Opaque client-observed concurrency token returned and enforced by the API. */
  concurrencyToken?: string
  tenantUid: string
  primaryContactEmail: string
  primaryContactVerified: boolean
  deliveryCapability: DeliveryCapability
  defaultNotificationPolicy: string
  recipients: FormNotificationRecipient[]
  formDefinitionOverrides: Record<string, string[]>
  updatedAt?: string
}

export interface GlobalIdentityUser {
  userId: string
  loginEmail: string
  normalizedEmail: string
  globalRole: string
  status: IdentityRecordStatus
  forcePasswordChange: boolean
  sessionVersion: number
  /**
   * Immutable, server-derived validation classification. Missing is intentionally treated as false.
   * Never infer this permission from an email address or other mutable user input.
   */
  isSyntheticValidation?: boolean
}

export interface IdentityAuditEvent {
  id: string
  eventType: string
  actorUserId?: string | null
  actorRole?: string | null
  targetUserId?: string | null
  targetTenantUid?: string | null
  requestId?: string | null
  reason?: string | null
  result?: string | null
  createdAt: string
}

export interface IdentityMigrationConflict {
  id: string
  type: string
  category?: string | null
  tenantUid?: string | null
  legacyTenantId?: string | null
  userId?: string | null
  requestId?: string | null
  operation?: string | null
  safeCode?: string | null
  status?: string | null
  createdAt?: string | null
}

export interface SwitchTenantResult {
  activeTenantUid: string
  legacyTenantId: string
  membershipId: string
  role: TenantRole
  token: string
  expiresAt: string
}

export interface IdentityInvitation {
  id: string
  tenantUid: string
  normalizedEmail: string
  role: TenantRole
  status: 'Pending' | 'Revoked'
  deliveryCapability: DeliveryCapability
  messageSent: boolean
}

export interface TemporaryPasswordResult {
  userId: string
  temporaryPassword: string
  shownOnce: boolean
  forceChangeAtNextLogin: boolean
}

export interface IdentityApiError {
  code: string
  message: string
  requestId: string
}

export const EMPTY_IDENTITY_FEATURE_STATE: IdentityFeatureState = Object.freeze({
  foundationEnabled: false,
  dualReadEnabled: false,
  dualWriteEnabled: false,
  renameEnabled: false,
  migrationExecutionEnabled: false,
  notificationProviderEnabled: false,
  managementEnabled: false,
  tenantSwitcherEnabled: false,
  passwordAndSessionManagementEnabled: false,
  membershipManagementEnabled: false,
  contactManagementEnabled: false,
  superAdminManagementEnabled: false,
  providerAwareEmailRequestsEnabled: false,
})

export const IDENTITY_EMAIL_MAX_LENGTH = 320
export const IDENTITY_IDENTIFIER_MAX_LENGTH = 128
export const IDENTITY_REASON_MAX_LENGTH = 500
export const IDENTITY_SEARCH_MAX_LENGTH = 200
export const IDENTITY_CONFIRMATION_MAX_LENGTH = 320
export const IDENTITY_RECIPIENT_MAX_COUNT = 100
export const IDENTITY_BCRYPT_PASSWORD_MAX_BYTES = 72
export const IDENTITY_EXISTING_PASSWORD_MAX_BYTES = 1024

export function deriveIdentityCapabilities(
  state: IdentityFeatureState,
  isSuperAdmin: boolean,
): IdentityCapabilities {
  const read = state.foundationEnabled && state.dualReadEnabled && state.managementEnabled
  const mutate = read && state.dualWriteEnabled

  return {
    read,
    mutate,
    tenantSwitcher: mutate && state.tenantSwitcherEnabled,
    passwordAndSessions: mutate && state.passwordAndSessionManagementEnabled,
    memberships: mutate && state.membershipManagementEnabled,
    contacts: mutate && state.contactManagementEnabled,
    superAdminRead: read && isSuperAdmin,
    superAdminCredentials: mutate && isSuperAdmin && state.passwordAndSessionManagementEnabled,
    superAdmin: mutate && isSuperAdmin && state.superAdminManagementEnabled,
    providerAwareEmailRequests: mutate && state.providerAwareEmailRequestsEnabled,
    // Tenant rename remains a deliberate V2.8.63D hold even if a stale runtime flag is true.
    rename: false,
  }
}

export function identityMembershipLabel(membership: IdentityMembership): string {
  return membership.displayName || membership.canonicalSlug || membership.legacyTenantId || membership.tenantUid
}

export function identityTenantLabel(tenant: IdentityTenant): string {
  return tenant.displayName || tenant.canonicalSlug || tenant.legacyTenantId || tenant.tenantUid
}

export function normalizeIdentityEmail(value: string): string {
  return value.trim().normalize('NFKC').toUpperCase()
}

export function normalizeBoundedIdentityReason(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 && normalized.length <= IDENTITY_REASON_MAX_LENGTH
    ? normalized
    : null
}

export function stableIdentityIdempotencyKey(
  existingKey: string,
  createKey: () => string = () => crypto.randomUUID(),
): string {
  return existingKey || createKey()
}

export function isWithinExistingPasswordLimit(value: string): boolean {
  const byteLength = new TextEncoder().encode(value).byteLength
  return byteLength > 0 && byteLength <= IDENTITY_EXISTING_PASSWORD_MAX_BYTES
}

export function isStrongBcryptPassword(value: string): boolean {
  const byteLength = new TextEncoder().encode(value).byteLength
  return value.length >= 12 &&
    byteLength <= IDENTITY_BCRYPT_PASSWORD_MAX_BYTES &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value)
}

export function isMembershipInActiveTenantAdminTokenScope(
  membership: IdentityMembership,
  currentTenantId?: string | null,
): boolean {
  if (!currentTenantId || membership.status !== 'Active' || membership.role !== 'TenantAdmin') {
    return false
  }

  return membership.tenantUid === currentTenantId ||
    membership.legacyTenantId === currentTenantId ||
    membership.canonicalSlug === currentTenantId
}

export function canSetIdentityMembershipStatus(
  membership: IdentityMembership,
  status: IdentityRecordStatus,
  isSuperAdmin: boolean,
): boolean {
  return isSuperAdmin || status !== 'Active' || membership.role !== 'TenantAdmin'
}

export function isFinalActiveTenantAdmin(
  memberships: IdentityMembership[],
  membershipId: string,
): boolean {
  const target = memberships.find((membership) => membership.membershipId === membershipId)
  if (!target || target.role !== 'TenantAdmin' || target.status !== 'Active') return false

  return memberships.filter(
    (membership) => membership.role === 'TenantAdmin' && membership.status === 'Active',
  ).length <= 1
}
