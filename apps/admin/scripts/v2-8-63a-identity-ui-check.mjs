import fs from 'node:fs'

const page = fs.readFileSync(new URL('../src/app/dashboard/identity/page.tsx', import.meta.url), 'utf8')
const client = fs.readFileSync(new URL('../src/lib/identity/client.ts', import.meta.url), 'utf8')
const contracts = fs.readFileSync(new URL('../src/lib/identity/contracts.ts', import.meta.url), 'utf8')

const checks = {
  'feature disabled unless exact true': contracts.includes("=== 'true'"),
  'account security controls': page.includes('My account & security') && page.includes('current-password'),
  'tenant rename preflight': page.includes('Run rename preflight') && page.includes('typed confirmation'),
  'contact separated from lead persistence': page.includes('Lead persistence:') && page.includes('Delivery capability:'),
  'users and final admin transfer projection': page.includes('Users & access') && page.includes('transfer controls'),
  'SuperAdmin projection': page.includes("user?.role === 'SuperAdmin'") && page.includes('membership matrix'),
  'accessible state announcements': page.includes('role="status"') && page.includes('role="alert"') && page.includes('aria-live'),
  'membership tenant switch contract': client.includes('/api/identity/current/switch-tenant'),
  'verified email and password contracts': client.includes('/login-email-change') && client.includes('/password'),
}

for (const [name, passed] of Object.entries(checks)) {
  if (!passed) throw new Error(`FAIL: ${name}`)
  console.log(`PASS: ${name}`)
}
console.log(`Identity Admin UI checks passed: ${Object.keys(checks).length}/${Object.keys(checks).length}`)
