import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAndValidate } from '../src/validate-import-package.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(root, 'fixtures')

const expectedValid = [
  'valid-ice-carryforward.import-package.json',
  'valid-roller-paused.import-package.json',
]

const expectedInvalid = [
  'invalid-missing-tenant-key.import-package.json',
  'invalid-missing-owner-approval.import-package.json',
  'invalid-missing-backup-proof.import-package.json',
  'invalid-production-mutation-requested.import-package.json',
  'invalid-protected-config-reference.import-package.json',
  'invalid-secret-like-value.import-package.json',
  'invalid-paused-tenant-resume-without-approval.import-package.json',
]

for (const name of expectedValid) {
  const result = loadAndValidate(path.join(fixtures, name))
  assert.equal(result.ok, true, `${name} should pass: ${result.failures.join('; ')}`)
}

for (const name of expectedInvalid) {
  const result = loadAndValidate(path.join(fixtures, name))
  assert.equal(result.ok, false, `${name} should fail`)
  assert.ok(result.failureCount > 0, `${name} should report at least one failure`)
}

const fixtureNames = fs.readdirSync(fixtures).filter((name) => name.endsWith('.json'))
assert.equal(fixtureNames.length, expectedValid.length + expectedInvalid.length)

console.log(JSON.stringify({
  status: 'passed',
  validFixtures: expectedValid.length,
  invalidFixtures: expectedInvalid.length,
  totalFixtures: fixtureNames.length,
}, null, 2))
