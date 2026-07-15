import fs from 'node:fs'

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8')
const page = read('../src/app/dashboard/identity/page.tsx')
const users = read('../src/app/dashboard/users/page.tsx')
const client = read('../src/lib/identity/client.ts')
const contracts = read('../src/lib/identity/contracts.ts')
const layout = read('../src/app/dashboard/layout.tsx')
const auth = read('../src/contexts/AuthContext.tsx')
const api = read('../src/lib/api.ts')

const oneTimeStart = page.indexOf('aria-label="One-time temporary password handoff"')
const oneTimeBlock = page.slice(Math.max(0, oneTimeStart - 180), oneTimeStart + 620)
const managedFilterStart = page.indexOf(
  'isMembershipInActiveTenantAdminTokenScope',
  page.indexOf('const managedTenants'),
)
const managedFilterBlock = page.slice(managedFilterStart, managedFilterStart + 300)
const tableHeaders = [...page.matchAll(/<th(?!ead)\b[^>]*>/g)].map((match) => match[0])

const checks = {
  'authenticated feature-state readback':
    client.includes("'/api/identity/feature-state'") &&
    client.includes('Authorization: `Bearer ${this.token}`') &&
    page.includes('client.featureState()'),

  'read and mutation gates remain distinct':
    contracts.includes('const read = state.foundationEnabled && state.dualReadEnabled && state.managementEnabled') &&
    contracts.includes('const mutate = read && state.dualWriteEnabled') &&
    contracts.includes('rename: false'),

  'all identity and generic auth requests are no-store':
    client.includes("cache: 'no-store'") &&
    api.includes("cache: 'no-store'") &&
    !api.includes("toUpperCase() === 'GET' && !config.cache"),

  'tenant administration binds to adopted token authority':
    managedFilterBlock.includes('membership, user?.tenantId') &&
    !managedFilterBlock.includes('currentTenant?.tenantId') &&
    contracts.includes("membership.role !== 'TenantAdmin'") &&
    contracts.includes("membership.status !== 'Active'") &&
    page.includes('tenantScopeAuthorized') &&
    page.includes('tenantDataReady'),

  'tenant selector cannot replace the token':
    page.includes('const [selectedSwitchTenantUid') &&
    page.includes('const [selectedManagedTenantUid') &&
    page.includes('it never issues or replaces a tenant-switch token') &&
    page.includes('adoptIdentityTenantSession(result.token'),

  'generation guards and fail-closed clearing cover every identity read family':
    ['featureGeneration', 'currentDataGeneration', 'sessionDataGeneration', 'tenantDataGeneration',
      'globalUsersGeneration', 'globalTenantsGeneration', 'globalSecurityGeneration']
      .every((name) => page.includes(`const ${name} = useRef(0)`)) &&
    page.includes('setTenantMemberships([])') &&
    page.includes('setContactSettings(null)') &&
    page.includes('setGlobalUsers([])') &&
    page.includes('setGlobalAuditEvents([])') &&
    page.includes('tenantDataGeneration.current !== generation'),

  'token-scoped readiness suppresses stale Token-A data':
    page.includes('currentDataToken === token') &&
    page.includes('currentDataRefreshKey === refreshKey') &&
    page.includes('tenantDataToken === token') &&
    page.includes('tenantDataRefreshKey === refreshKey') &&
    page.includes('globalUsersToken === token') &&
    page.includes('globalUsersRefreshKey === refreshKey') &&
    page.includes('globalSecurityToken === token') &&
    page.includes('const displayedTenantMemberships = tenantScopeReady ? tenantMemberships : []'),

  'empty readback messages require successful current generation':
    page.includes('tenantScopeReady && displayedTenantMemberships.length === 0') &&
    page.includes('globalSecurityScopeReady && displayedGlobalAuditEvents.length === 0') &&
    page.includes('globalSecurityScopeReady && displayedMigrationConflicts.length === 0') &&
    page.includes('globalSecurityLoading'),

  'global selection clears only after a successful row-removal readback':
    page.includes('if (!globalUsersReady || globalUsersToken !== token ||') &&
    page.includes('globalUsersRefreshKey !== refreshKey || !selectedGlobalUserId) return') &&
    page.includes("setSelectedGlobalUserId('')"),

  'provider hold requires the exact safe 503 code':
    client.includes('error.status === 503') &&
    client.includes("error.code === 'identity_notification_provider_unavailable'") &&
    page.includes('isIdentityNotificationProviderUnavailable(error)') &&
    page.includes('Held / not sent:'),

  'stable draft idempotency keys survive indeterminate retry':
    contracts.includes('stableIdentityIdempotencyKey') &&
    page.includes('stableIdentityIdempotencyKey(inviteIdempotencyKey)') &&
    page.includes('stableIdentityIdempotencyKey(membershipIdempotencyKey)') &&
    page.includes('setInviteIdempotencyKey(idempotencyKey)') &&
    page.includes('setMembershipIdempotencyKey(idempotencyKey)'),

  'contact save is client-observed concurrency protected':
    contracts.includes('concurrencyToken?: string') &&
    client.includes("headers: { 'If-Match': update.expectedConcurrencyToken }") &&
    page.includes('!contactSettings.concurrencyToken') &&
    page.includes('expectedConcurrencyToken: contactSettings.concurrencyToken!.trim()') &&
    page.includes("error.code === 'contact_settings_concurrency_conflict'") &&
    page.includes('setRefreshKey((value) => value + 1)'),

  'contact update cannot assert server-owned verification':
    client.includes('recipients: update.recipients.map((recipient) => ({') &&
    !client.includes('isVerified: recipient.isVerified') &&
    !client.includes('createdAt: recipient.createdAt') &&
    !client.includes('updatedAt: recipient.updatedAt') &&
    page.includes('this form cannot grant verification'),

  'legacy contact policy is represented without coercion':
    page.includes('<option value="legacy-compatible">Legacy compatible (preserve existing behavior)</option>'),

  'synthetic status proof consumes only authoritative marker':
    contracts.includes('isSyntheticValidation?: boolean') &&
    page.includes('selectedGlobalUser?.isSyntheticValidation === true') &&
    page.includes('immutable server-derived synthetic-validation marker') &&
    !page.includes('isSyntheticValidationEmail') &&
    !contracts.includes('isSyntheticValidationEmail'),

  'one-time secret lifecycle is target-bound and non-live':
    page.includes('setOneTimePassword(null)') &&
    page.includes('result?.userId === targetUserId') &&
    page.includes('oneTimePassword.userId === selectedGlobalUser.userId') &&
    oneTimeStart >= 0 &&
    !oneTimeBlock.includes('role="alert"') &&
    !oneTimeBlock.includes('aria-live') &&
    !page.includes('localStorage.setItem') &&
    !page.includes('console.log'),

  'bounded trimmed reasons and bcrypt-safe passwords':
    contracts.includes('normalizeBoundedIdentityReason') &&
    contracts.includes('IDENTITY_REASON_MAX_LENGTH = 500') &&
    contracts.includes('IDENTITY_BCRYPT_PASSWORD_MAX_BYTES = 72') &&
    contracts.includes('new TextEncoder().encode(value).byteLength') &&
    page.includes('isStrongBcryptPassword(newPassword)') &&
    page.includes('isStrongBcryptPassword(administrativePassword)'),

  'all identity-controlled free text has explicit bounds':
    page.includes('maxLength={IDENTITY_EMAIL_MAX_LENGTH}') &&
    page.includes('maxLength={IDENTITY_IDENTIFIER_MAX_LENGTH}') &&
    page.includes('maxLength={IDENTITY_REASON_MAX_LENGTH}') &&
    page.includes('maxLength={IDENTITY_SEARCH_MAX_LENGTH}') &&
    page.includes('recipientDrafts.length >= IDENTITY_RECIPIENT_MAX_COUNT'),

  'invitation delivery display is server authoritative':
    page.includes("createdInvitation.messageSent ? 'yes' : 'no'") &&
    !page.includes('message sent: no.'),

  'stored TenantAdmin activation is SuperAdmin-only in the UI':
    contracts.includes('canSetIdentityMembershipStatus') &&
    contracts.includes("status !== 'Active' || membership.role !== 'TenantAdmin'") &&
    page.includes('disabled={!canSetIdentityMembershipStatus(membership, status, isSuperAdmin)}'),

  'own-password response matches the API contract':
    client.includes('allSessionsRevoked: boolean') &&
    !client.includes('otherSessionsRevoked: boolean'),

  'status and tabular readback are accessible':
    page.includes('aria-label={`${label}: ${enabled ?') &&
    page.includes('data-state={enabled ?') &&
    (page.match(/<caption /g) || []).length >= 4 &&
    tableHeaders.length > 0 && tableHeaders.every((header) => header.includes('scope="col"')),

  'audit projection includes the complete safe field set':
    ['event.actorUserId', 'event.targetUserId', 'event.targetTenantUid', 'event.requestId',
      'event.result', 'event.reason'].every((field) => page.includes(field)) &&
    ['item.userId', 'item.operation', 'item.requestId', 'item.status', 'item.safeCode']
      .every((field) => page.includes(field)),

  'authoritative token rejection signs out':
    auth.includes('status === 401 || status === 403') &&
    auth.includes("window.location.replace('/login')") &&
    auth.includes('localStorage.removeItem(TOKEN_KEY)') &&
    auth.includes('Token verification was inconclusive; retaining the local session'),

  'tenant inventory loads are generation guarded':
    auth.includes('const tenantLoadGeneration = useRef(0)') &&
    auth.includes('tenantLoadGeneration.current !== generation') &&
    auth.includes('setAvailableTenants([])'),

  'legacy email editor cannot diverge identity':
    users.includes('email: editState.user.email') &&
    users.includes('readOnly') &&
    users.includes('Login email editing is disabled here') &&
    !users.includes('email: event.target.value'),

  'legacy user inventory is generation guarded and accessible':
    users.includes('const usersLoadGeneration = useRef(0)') &&
    users.includes('usersLoadGeneration.current === generation') &&
    users.includes('<caption className="sr-only">Legacy profile users grouped by tenant</caption>') &&
    users.includes('<th scope="col"'),

  'identity navigation remains first-class':
    layout.includes("href: '/dashboard/identity'") &&
    layout.indexOf("href: '/dashboard/identity'") < layout.indexOf("href: '/dashboard/users'"),

  'rename execution remains absent and held':
    page.includes('Tenant rename is disabled pending V2.8.63D') &&
    !page.includes('Run rename preflight') &&
    !client.includes('/rename'),
}

for (const [name, passed] of Object.entries(checks)) {
  if (!passed) throw new Error(`FAIL: ${name}`)
  console.log(`PASS: ${name}`)
}

console.log(`CRST identity-management static checks passed: ${Object.keys(checks).length}/${Object.keys(checks).length}`)
