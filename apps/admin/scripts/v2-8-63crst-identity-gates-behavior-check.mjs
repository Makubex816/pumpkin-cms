import {
  IDENTITY_REASON_MAX_LENGTH,
  canSetIdentityMembershipStatus,
  deriveIdentityCapabilities,
  identityMembershipLabel,
  identityTenantLabel,
  isFinalActiveTenantAdmin,
  isMembershipInActiveTenantAdminTokenScope,
  isStrongBcryptPassword,
  isWithinExistingPasswordLimit,
  normalizeBoundedIdentityReason,
  normalizeIdentityEmail,
  stableIdentityIdempotencyKey,
} from '../src/lib/identity/contracts.ts'
import {
  IdentityClient,
  IdentityClientError,
  isIdentityNotificationProviderUnavailable,
} from '../src/lib/identity/client.ts'

let passed = 0

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`)
  passed += 1
  console.log(`PASS: ${message}`)
}

const disabled = {
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
}
const readOnly = {
  ...disabled,
  foundationEnabled: true,
  dualReadEnabled: true,
  managementEnabled: true,
  tenantSwitcherEnabled: true,
  passwordAndSessionManagementEnabled: true,
  membershipManagementEnabled: true,
  contactManagementEnabled: true,
  superAdminManagementEnabled: true,
  providerAwareEmailRequestsEnabled: true,
  renameEnabled: true,
}
const full = { ...readOnly, dualWriteEnabled: true }
const passwordAndSessionsStage = {
  ...disabled,
  foundationEnabled: true,
  dualReadEnabled: true,
  dualWriteEnabled: true,
  managementEnabled: true,
  passwordAndSessionManagementEnabled: true,
}
const membershipStage = { ...passwordAndSessionsStage, membershipManagementEnabled: true }

const disabledCapabilities = deriveIdentityCapabilities(disabled, true)
assert(!disabledCapabilities.read && !disabledCapabilities.mutate, 'disabled runtime exposes neither reads nor mutations')

const readOnlyCapabilities = deriveIdentityCapabilities(readOnly, true)
assert(readOnlyCapabilities.read && readOnlyCapabilities.superAdminRead, 'management read stage enables authenticated SuperAdmin readback')
assert(!readOnlyCapabilities.mutate && !readOnlyCapabilities.tenantSwitcher, 'dual-write hold disables all mutation families')
assert(readOnlyCapabilities.rename === false, 'tenant rename remains held despite a stale true runtime flag')

const tenantAdminCapabilities = deriveIdentityCapabilities(full, false)
assert(tenantAdminCapabilities.memberships && tenantAdminCapabilities.contacts, 'tenant mutations require their explicit gates')
assert(!tenantAdminCapabilities.superAdmin, 'role gate prevents TenantAdmin from SuperAdmin mutations')

const credentialCapabilities = deriveIdentityCapabilities(passwordAndSessionsStage, true)
assert(credentialCapabilities.superAdminCredentials && !credentialCapabilities.superAdmin, 'credential stage does not prematurely open full SuperAdmin mutations')
const membershipCapabilities = deriveIdentityCapabilities(membershipStage, true)
assert(membershipCapabilities.memberships && !membershipCapabilities.superAdmin, 'membership stage remains distinct from full SuperAdmin management')
assert(deriveIdentityCapabilities(full, true).superAdmin, 'full stage enables explicitly gated SuperAdmin mutations')

const memberships = [
  { membershipId: 'primary', tenantUid: 'tenant-a', legacyTenantId: 'legacy-a', userId: 'user-a', role: 'TenantAdmin', status: 'Active', isPrimaryTenantAdmin: true },
  { membershipId: 'viewer', tenantUid: 'tenant-a', legacyTenantId: 'legacy-a', userId: 'user-b', role: 'Viewer', status: 'Active', isPrimaryTenantAdmin: false },
]
assert(isFinalActiveTenantAdmin(memberships, 'primary'), 'single active TenantAdmin is protected')
assert(!isFinalActiveTenantAdmin([...memberships, { ...memberships[0], membershipId: 'secondary', userId: 'user-c', isPrimaryTenantAdmin: false }], 'primary'), 'second active TenantAdmin removes final-admin condition')
assert(!isFinalActiveTenantAdmin([{ ...memberships[0], status: 'Suspended' }], 'primary'), 'suspended membership is not an active final admin')

assert(isMembershipInActiveTenantAdminTokenScope(memberships[0], 'legacy-a'), 'active TenantAdmin matching the adopted token tenant is administrable')
assert(!isMembershipInActiveTenantAdminTokenScope(memberships[1], 'legacy-a'), 'an Editor or Viewer cannot gain tenant administration scope')
assert(!isMembershipInActiveTenantAdminTokenScope(memberships[0], 'legacy-b'), 'a UI-selected tenant cannot override the adopted token tenant')
assert(!isMembershipInActiveTenantAdminTokenScope({ ...memberships[0], status: 'Suspended' }, 'legacy-a'), 'suspended TenantAdmin scope fails closed')
const storedTenantAdmin = { ...memberships[0], status: 'Suspended' }
assert(!canSetIdentityMembershipStatus(storedTenantAdmin, 'Active', false), 'non-SuperAdmin cannot reactivate a stored TenantAdmin membership')
assert(canSetIdentityMembershipStatus(storedTenantAdmin, 'Active', true), 'SuperAdmin may use the separately authorized TenantAdmin activation path')
assert(canSetIdentityMembershipStatus(memberships[1], 'Active', false), 'non-TenantAdmin membership activation remains available to authorized tenant administration')

assert(identityMembershipLabel({ ...memberships[0], displayName: 'Validation Tenant' }) === 'Validation Tenant', 'membership label prefers safe display name')
assert(identityTenantLabel({ tenantUid: 'tenant-b', legacyTenantId: 'legacy-b', canonicalSlug: 'canonical-b', displayName: 'Tenant B', status: 'Active' }) === 'Tenant B', 'global tenant label prefers safe display name')
assert(normalizeIdentityEmail('  Proof@Identity.Invalid  ') === 'PROOF@IDENTITY.INVALID', 'contact normalization matches the identity contract')

const password71 = `Aa1${'x'.repeat(68)}`
const password73 = `Aa1${'x'.repeat(70)}`
assert(new TextEncoder().encode(password71).byteLength === 71 && isStrongBcryptPassword(password71), '71-byte complex password is accepted')
assert(new TextEncoder().encode(password73).byteLength === 73 && !isStrongBcryptPassword(password73), '73-byte password is rejected before bcrypt truncation')
assert(!isStrongBcryptPassword('alllowercase1234'), 'password complexity requires uppercase, lowercase, and a number')
assert(isWithinExistingPasswordLimit('current-password') && !isWithinExistingPasswordLimit(''), 'existing password input is nonblank and byte-bounded')

assert(normalizeBoundedIdentityReason('  approved proof  ') === 'approved proof', 'administrative reasons are trimmed')
assert(normalizeBoundedIdentityReason('   ') === null, 'blank-after-trim reasons are rejected')
assert(normalizeBoundedIdentityReason('x'.repeat(IDENTITY_REASON_MAX_LENGTH + 1)) === null, 'overlong reasons are rejected')

let generated = 0
const firstKey = stableIdentityIdempotencyKey('', () => `key-${++generated}`)
const retryKey = stableIdentityIdempotencyKey(firstKey, () => `key-${++generated}`)
assert(firstKey === retryKey && generated === 1, 'indeterminate retry reuses the stable draft idempotency key')

const heldError = new IdentityClientError(503, {
  code: 'identity_notification_provider_unavailable',
  message: 'held',
  requestId: 'request-held',
})
const generic503 = new IdentityClientError(503, {
  code: 'http_503',
  message: 'unavailable',
  requestId: 'request-generic',
})
assert(isIdentityNotificationProviderUnavailable(heldError), 'exact provider-unavailable 503 is classified as held')
assert(!isIdentityNotificationProviderUnavailable(generic503), 'generic 503 remains an error')

const calls = []
const client = new IdentityClient('https://identity.example.invalid', 'test-token', async (input, init) => {
  calls.push({ input: String(input), init })
  const body = String(input).endsWith('/feature-state')
    ? disabled
    : String(input).endsWith('/contact-settings')
      ? { tenantUid: 'tenant-a', concurrencyToken: 'etag-7', recipients: [] }
      : { tenantUid: 'tenant-a', normalizedEmail: 'PROOF@IDENTITY.INVALID', messageSent: false }
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

await client.featureState()
await client.inviteUser('tenant-a', '  proof@identity.invalid  ', 'Viewer', 'stable-key')
await client.updateContactSettings('tenant-a', {
  primaryContactEmail: '  contact@example.invalid  ',
  recipients: [{
    id: 'recipient-a',
    email: 'Proof@Identity.Invalid',
    normalizedEmail: normalizeIdentityEmail('Proof@Identity.Invalid'),
    order: 0,
    isActive: false,
    isVerified: true,
    createdAt: 'server-owned',
    updatedAt: 'server-owned',
    replyTo: null,
  }],
  defaultNotificationPolicy: 'all-active',
  formDefinitionOverrides: {},
  expectedConcurrencyToken: 'etag-7',
})

assert(calls.every((call) => call.init.cache === 'no-store'), 'GET and mutation requests always use no-store')
assert(calls.every((call) => call.init.headers.Authorization === 'Bearer test-token'), 'every identity request is authenticated')
const invitationPayload = JSON.parse(calls[1].init.body)
assert(invitationPayload.email === 'proof@identity.invalid' && invitationPayload.idempotencyKey === 'stable-key', 'invitation input is trimmed without replacing the caller idempotency key')
const contactCall = calls[2]
const contactPayload = JSON.parse(contactCall.init.body)
assert(contactCall.init.headers['If-Match'] === 'etag-7', 'contact update sends the client-observed concurrency token in If-Match')
assert(contactPayload.primaryContactEmail === 'contact@example.invalid', 'contact primary email is trimmed')
assert(contactPayload.recipients[0].normalizedEmail === 'PROOF@IDENTITY.INVALID', 'contact recipient normalized email remains canonical')
assert(!('isVerified' in contactPayload.recipients[0]) && !('createdAt' in contactPayload.recipients[0]) && !('updatedAt' in contactPayload.recipients[0]), 'contact update omits server-owned verification and timestamps')

console.log(`CRST identity gate behavior checks passed: ${passed}/${passed}`)
