import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildAndValidateSourceFile,
  buildPackageFromSourceFile,
  previewTarget,
  validateInputFile,
} from '../src/import-package-builder.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(root, 'fixtures')
const tmpRoot = path.join(root, '.tmp', 'test-output')

const validBuilderFixtures = [
  'valid-ice-carryforward.fixture.json',
  'valid-roller-paused.fixture.json',
]

const invalidBuilderFixtures = [
  'invalid-builder-missing-tenant-key.fixture.json',
  'invalid-builder-missing-site-key.fixture.json',
  'invalid-builder-missing-owner-approval.fixture.json',
  'invalid-builder-missing-backup-proof.fixture.json',
  'invalid-builder-missing-resource-registry-refs.fixture.json',
  'invalid-builder-missing-provider-profile-refs.fixture.json',
  'invalid-builder-missing-runtime-qa-refs.fixture.json',
  'invalid-builder-protected-config-reference.fixture.json',
  'invalid-builder-secret-like-value.fixture.json',
  'invalid-builder-production-mutation-requested.fixture.json',
  'invalid-builder-indexing-requested.fixture.json',
  'invalid-builder-paused-resume-without-approval.fixture.json',
]

for (const name of validBuilderFixtures) {
  const result = buildAndValidateSourceFile(path.join(fixtures, name))
  assert.equal(result.validation.ok, true, `${name} should validate: ${result.validation.failures.join('; ')}`)
}

for (const name of invalidBuilderFixtures) {
  const validation = validateInputFile(path.join(fixtures, name))
  assert.equal(validation.ok, false, `${name} should fail`)
  assert.ok(validation.failureCount > 0, `${name} should report at least one failure`)
}

const iceOut = path.join(tmpRoot, 'ice-carryforward-package')
const iceBuild = buildPackageFromSourceFile(path.join(fixtures, 'valid-ice-carryforward.fixture.json'), iceOut)
assert.equal(iceBuild.ok, true)
assert.equal(iceBuild.wrotePackage, true)
assert.equal(fs.existsSync(path.join(iceOut, 'manifest.json')), true)
assert.equal(fs.existsSync(path.join(iceOut, 'preview.json')), true)

const icePreview = previewTarget(iceOut)
assert.equal(icePreview.validationOk, true)
assert.equal(icePreview.tenantKey, 'ice-rink-rentals')
assert.equal(icePreview.routeCount, 3)
assert.equal(icePreview.formConfigRefCount, 1)
assert.equal(icePreview.resourceRegistryRefCount, 1)
assert.equal(icePreview.providerProfileRefCount, 1)
assert.equal(icePreview.backupEvidenceRefCount, 1)
assert.equal(icePreview.runtimeQaRefCount, 1)
assert.equal(icePreview.outboundLinkRefCount, 1)
assert.equal(icePreview.auditJobRefCount, 1)
assert.equal(icePreview.readyForFutureImportExecution, true)

const rollerOut = path.join(tmpRoot, 'roller-paused-package')
const rollerBuild = buildPackageFromSourceFile(path.join(fixtures, 'valid-roller-paused.fixture.json'), rollerOut)
assert.equal(rollerBuild.ok, true)
const rollerPreview = previewTarget(rollerOut)
assert.equal(rollerPreview.validationOk, true)
assert.equal(rollerPreview.tenantKey, 'roller-rink-rentals')
assert.equal(rollerPreview.importMode, 'paused_no_import')
assert.equal(rollerPreview.readyForFutureImportExecution, false)
assert.ok(rollerPreview.noGoConditions.includes('tenant_paused_no_import'))

const builderFixtureNames = fs.readdirSync(fixtures).filter((name) => name.endsWith('.fixture.json'))
assert.equal(builderFixtureNames.length, validBuilderFixtures.length + invalidBuilderFixtures.length)

console.log(JSON.stringify({
  status: 'passed',
  validBuilderFixtures: validBuilderFixtures.length,
  invalidBuilderFixtures: invalidBuilderFixtures.length,
  generatedPackagePreviews: 2,
}, null, 2))
