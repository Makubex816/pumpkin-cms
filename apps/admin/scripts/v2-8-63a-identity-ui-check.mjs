import fs from 'node:fs'

const page = fs.readFileSync(new URL('../src/app/dashboard/identity/page.tsx', import.meta.url), 'utf8')
const client = fs.readFileSync(new URL('../src/lib/identity/client.ts', import.meta.url), 'utf8')
const contracts = fs.readFileSync(new URL('../src/lib/identity/contracts.ts', import.meta.url), 'utf8')
const auth = fs.readFileSync(new URL('../src/contexts/AuthContext.tsx', import.meta.url), 'utf8')
const api = fs.readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8')

const checks = {
  'authenticated feature state': client.includes('/api/identity/feature-state') && page.includes('client.featureState()'),
  'separate read and mutation gates': contracts.includes('const read =') && contracts.includes('const mutate ='),
  'account security controls': page.includes('Account & sessions') && page.includes('isStrongBcryptPassword'),
  'tenant management is adopted-token scoped': page.includes('membership, user?.tenantId') && page.includes('tenantScopeAuthorized'),
  'tenant rename held': page.includes('Tenant rename is disabled pending V2.8.63D') && !client.includes('/rename'),
  'contact separated and concurrency protected': page.includes('Lead persistence:') && page.includes('contactSettings.concurrencyToken') && client.includes("'If-Match'"),
  'final admin protection': page.includes('Users & memberships') && page.includes('Final active TenantAdmin protected'),
  'stored TenantAdmin cannot be reactivated by tenant admin': page.includes('canSetIdentityMembershipStatus(membership, status, isSuperAdmin)'),
  'SuperAdmin marker fails closed': page.includes('selectedGlobalUser?.isSyntheticValidation === true') && !page.includes('isSyntheticValidationEmail'),
  'accessible state and tables': page.includes('role="status"') && page.includes('role="alert"') && page.includes('<caption className="sr-only">') && page.includes('<th scope="col"'),
  'one-time secret is not announced live': page.includes('aria-label="One-time temporary password handoff"') && !page.includes('aria-live="polite"'),
  'membership tenant switch contract': client.includes('/api/identity/current/switch-tenant') && page.includes('adoptIdentityTenantSession'),
  'provider hold uses exact error': page.includes('isIdentityNotificationProviderUnavailable(error)'),
  'all requests are no-store': client.includes("cache: 'no-store'") && api.includes("cache: 'no-store'"),
  'read generations are token bound': page.includes('tenantDataToken === token') && page.includes('globalUsersToken === token'),
  'auth tenant loading is race guarded': auth.includes('tenantLoadGeneration.current !== generation'),
}

for (const [name, passed] of Object.entries(checks)) {
  if (!passed) throw new Error(`FAIL: ${name}`)
  console.log(`PASS: ${name}`)
}
console.log(`Identity Admin UI checks passed: ${Object.keys(checks).length}/${Object.keys(checks).length}`)
