import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPackageFromSourceFile } from '../src/import-package-builder.mjs'
import {
  buildApprovalManifest,
  buildDryRunApplyPlan,
  computePackageIdentity,
  writeApprovalManifest,
  writeDryRunApplyPlan,
} from '../src/import-execution-preflight.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(root, 'fixtures')
const tmpRoot = path.join(root, '.tmp', 'test-output', 'v2-11-6')

const iceOut = path.join(tmpRoot, 'ice-carryforward-package')
const rollerOut = path.join(tmpRoot, 'roller-paused-package')

const iceBuild = buildPackageFromSourceFile(path.join(fixtures, 'valid-ice-carryforward.fixture.json'), iceOut)
assert.equal(iceBuild.ok, true)

const rollerBuild = buildPackageFromSourceFile(path.join(fixtures, 'valid-roller-paused.fixture.json'), rollerOut)
assert.equal(rollerBuild.ok, true)

const iceIdentity = computePackageIdentity(iceOut)
assert.equal(iceIdentity.packageId, 'ice-rink-rentals-carryforward-v2-11-2')
assert.equal(iceIdentity.readyForFutureImportExecution, true)
assert.match(iceIdentity.packageHash, /^sha256:[a-f0-9]{64}$/)

const iceApproval = buildApprovalManifest(iceOut)
assert.equal(iceApproval.executionApprovalGranted, false)
assert.equal(iceApproval.dryRunApproved, true)
assert.equal(iceApproval.approvedPackageId, iceIdentity.packageId)
assert.equal(iceApproval.packageHash, iceIdentity.packageHash)
assert.equal(iceApproval.backupCenterEvidenceRef, 'backup:v2-8-17d-artifact-sha256-506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899')
assert.deepEqual(iceApproval.prerequisiteSummary.noGoConditions, [])

const icePlan = buildDryRunApplyPlan(iceOut, iceApproval)
assert.equal(icePlan.dryRunAllowed, true)
assert.equal(icePlan.futureExecutionAllowed, false)
assert.equal(icePlan.targetMode, 'future_import_candidate')
assert.equal(icePlan.wouldWriteCms, false)
assert.equal(icePlan.wouldWriteProvider, false)
assert.equal(icePlan.wouldMutateAzure, false)
assert.equal(icePlan.wouldDeploy, false)
assert.equal(icePlan.wouldIndex, false)
assert.equal(icePlan.routeImpact.count, 3)
assert.deepEqual(icePlan.noGoConditions, [])

const rollerApproval = buildApprovalManifest(rollerOut)
assert.equal(rollerApproval.executionApprovalGranted, false)
assert.equal(rollerApproval.dryRunApproved, true)
assert.ok(rollerApproval.prerequisiteSummary.noGoConditions.includes('tenant_paused_no_import'))

const rollerPlan = buildDryRunApplyPlan(rollerOut, rollerApproval)
assert.equal(rollerPlan.dryRunAllowed, false)
assert.equal(rollerPlan.targetMode, 'blocked_no_import_no_resume')
assert.ok(rollerPlan.noGoConditions.includes('tenant_paused_no_import'))
assert.equal(rollerPlan.wouldWriteCms, false)
assert.equal(rollerPlan.wouldWriteProvider, false)
assert.equal(rollerPlan.wouldDeploy, false)
assert.equal(rollerPlan.wouldIndex, false)

const iceApprovalOut = path.join(tmpRoot, 'ice-approval-manifest.json')
const iceApprovalWrite = writeApprovalManifest(iceOut, iceApprovalOut)
assert.equal(iceApprovalWrite.ok, true)
assert.equal(fs.existsSync(iceApprovalOut), true)

const iceDryRunOut = path.join(tmpRoot, 'ice-dry-run.json')
const iceDryRunWrite = writeDryRunApplyPlan(iceOut, iceApprovalOut, iceDryRunOut)
assert.equal(iceDryRunWrite.ok, true)
assert.equal(fs.existsSync(iceDryRunOut), true)

assert.throws(
  () => writeApprovalManifest(iceOut, path.join(root, 'approval-manifest.json')),
  /must be under a \.tmp path/,
)

console.log(JSON.stringify({
  status: 'passed',
  approvalManifest: 'executionApprovalGranted_false',
  iceDryRunAllowed: icePlan.dryRunAllowed,
  rollerDryRunAllowed: rollerPlan.dryRunAllowed,
  packageHashVerified: true,
}, null, 2))

