import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  requiredOperatorHandoffFields,
  validateOperatorHandoffPacketFile,
} from '../src/operator-handoff-parity.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(root, 'fixtures')

const validFixtures = [
  'valid-operator-handoff-ice.operator-handoff.json',
  'valid-operator-handoff-roller-paused.operator-handoff.json',
]

const invalidFixtures = [
  'invalid-handoff-package-hash-mismatch.operator-handoff.json',
  'invalid-handoff-readback-count-mismatch.operator-handoff.json',
  'invalid-handoff-roller-resume-requested.operator-handoff.json',
  'invalid-handoff-secret-like-value.operator-handoff.json',
  'invalid-handoff-protected-config-reference.operator-handoff.json',
  'invalid-handoff-archive-requested.operator-handoff.json',
  'invalid-handoff-indexing-requested.operator-handoff.json',
]

for (const name of validFixtures) {
  const result = validateOperatorHandoffPacketFile(path.join(fixtures, name))
  assert.equal(result.ok, true, `${name} should pass: ${result.failures.join('; ')}`)
  assert.equal(result.parityChecks.requiredFieldCount, requiredOperatorHandoffFields.length)
  assert.equal(result.parityChecks.indexingDeferred, true)
  assert.equal(result.parityChecks.olmSeparateCarryforward, true)
  assert.equal(result.parityChecks.noArchiveRequested, true)
}

for (const name of invalidFixtures) {
  const result = validateOperatorHandoffPacketFile(path.join(fixtures, name))
  assert.equal(result.ok, false, `${name} should fail`)
  assert.ok(result.failureCount > 0, `${name} should report at least one failure`)
}

const handoffFixtureNames = fs.readdirSync(fixtures).filter((name) => name.endsWith('.operator-handoff.json'))
assert.equal(handoffFixtureNames.length, validFixtures.length + invalidFixtures.length)

const ice = validateOperatorHandoffPacketFile(path.join(fixtures, validFixtures[0]))
const roller = validateOperatorHandoffPacketFile(path.join(fixtures, validFixtures[1]))
assert.equal(ice.parityChecks.iceCanonicalHash, true)
assert.equal(roller.parityChecks.rollerPaused, true)

console.log(JSON.stringify({
  status: 'passed',
  validOperatorHandoffFixtures: validFixtures.length,
  invalidOperatorHandoffFixtures: invalidFixtures.length,
  requiredFields: requiredOperatorHandoffFields.length,
  icePacketId: ice.handoffPacketId,
  rollerPacketId: roller.handoffPacketId,
}, null, 2))
