#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPackageFromSourceFile,
  previewTarget,
  validateInputFile,
  writePreview,
} from './import-package-builder.mjs'
import {
  writeApprovalManifest,
  writeDryRunApplyPlan,
} from './import-execution-preflight.mjs'
import {
  validateOperatorProjectionFile,
  writeOperatorProjection,
} from './operator-projection.mjs'
import {
  validateOperatorHandoffPacketFile,
} from './operator-handoff-parity.mjs'
import {
  executeScopedImport,
  readbackScopedImport,
  writeExecutionApprovalManifest,
} from './scoped-import-execution.mjs'

function printJson(value) {
  console.log(JSON.stringify(value, null, 2))
}

function takeOption(args, name) {
  const index = args.indexOf(name)
  if (index === -1) {
    return null
  }

  const value = args[index + 1]
  if (!value) {
    throw new Error(`${name} requires a value`)
  }

  args.splice(index, 2)
  return value
}

function takeFlag(args, name) {
  const index = args.indexOf(name)
  if (index === -1) {
    return false
  }

  args.splice(index, 1)
  return true
}

function usage() {
  return [
    'Usage:',
    '  node src/import-package-governance-cli.mjs validate <fixture-or-manifest.json>',
    '  node src/import-package-governance-cli.mjs build-package <source.fixture.json> --out .tmp/<package-dir>',
    '  node src/import-package-governance-cli.mjs preview-package <package-dir-or-manifest.json> [--out .tmp/<preview.json>]',
    '  node src/import-package-governance-cli.mjs build-approval-manifest <package-dir-or-manifest.json> --out .tmp/<approval-manifest.json>',
    '  node src/import-package-governance-cli.mjs dry-run-import <package-dir-or-manifest.json> --manifest .tmp/<approval-manifest.json> --out .tmp/<dry-run.json>',
    '  node src/import-package-governance-cli.mjs finalize-execution-manifest <package-dir-or-manifest.json> --target .tmp/<target-dir> --expected-hash sha256:<hash> --out .tmp/<execution-approval-manifest.json>',
    '  node src/import-package-governance-cli.mjs execute-scoped-import <package-dir-or-manifest.json> --manifest .tmp/<execution-approval-manifest.json> --target .tmp/<target-dir> --out .tmp/<execution-result.json>',
    '  node src/import-package-governance-cli.mjs readback-scoped-import <package-dir-or-manifest.json> --manifest .tmp/<execution-approval-manifest.json> --target .tmp/<target-dir> --out .tmp/<readback.json> [--allow-missing]',
    '  node src/import-package-governance-cli.mjs build-operator-projection --manifest .tmp/<execution-approval-manifest.json> --execution .tmp/<execution-result.json> --readback .tmp/<readback.json> --out .tmp/<projection.json> [--roller-dry-run .tmp/<roller-dry-run.json>]',
    '  node src/import-package-governance-cli.mjs validate-operator-projection .tmp/<projection.json>',
    '  node src/import-package-governance-cli.mjs validate-operator-handoff <handoff-packet.fixture.json>',
  ].join('\n')
}

function main() {
  const [, , command, ...rawArgs] = process.argv
  const args = [...rawArgs]

  if (!command) {
    console.error(usage())
    process.exit(2)
  }

  if (command === 'validate') {
    const [target] = args
    if (!target) {
      console.error(usage())
      process.exit(2)
    }

    const result = validateInputFile(path.resolve(process.cwd(), target))
    printJson(result)
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'build-package') {
    const outDir = takeOption(args, '--out')
    const [source] = args
    if (!source || !outDir) {
      console.error(usage())
      process.exit(2)
    }

    const result = buildPackageFromSourceFile(
      path.resolve(process.cwd(), source),
      path.resolve(process.cwd(), outDir),
    )
    printJson({
      ok: result.ok,
      wrotePackage: result.wrotePackage,
      outDir: result.outDir,
      packageId: result.manifest.packageId,
      tenantKey: result.manifest.tenantKey,
      validation: result.validation,
      preview: result.preview,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'preview-package') {
    const outFile = takeOption(args, '--out')
    const [target] = args
    if (!target) {
      console.error(usage())
      process.exit(2)
    }

    const preview = previewTarget(path.resolve(process.cwd(), target))
    if (outFile) {
      const writtenTo = writePreview(preview, path.resolve(process.cwd(), outFile))
      printJson({ ok: true, writtenTo, preview })
      process.exit(0)
    }

    printJson(preview)
    process.exit(preview.validationOk ? 0 : 1)
  }

  if (command === 'build-approval-manifest') {
    const outFile = takeOption(args, '--out')
    const [target] = args
    if (!target || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = writeApprovalManifest(
      path.resolve(process.cwd(), target),
      path.resolve(process.cwd(), outFile),
    )
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      approvalManifestId: result.manifest.approvalManifestId,
      executionApprovalGranted: result.manifest.executionApprovalGranted,
      dryRunApproved: result.manifest.dryRunApproved,
      approvedPackageId: result.manifest.approvedPackageId,
      packageHash: result.manifest.packageHash,
      noGoConditions: result.manifest.prerequisiteSummary.noGoConditions,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'dry-run-import') {
    const manifestPath = takeOption(args, '--manifest')
    const outFile = takeOption(args, '--out')
    const [target] = args
    if (!target || !manifestPath || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = writeDryRunApplyPlan(
      path.resolve(process.cwd(), target),
      path.resolve(process.cwd(), manifestPath),
      path.resolve(process.cwd(), outFile),
    )
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      dryRunAllowed: result.dryRunAllowed,
      targetMode: result.targetMode,
      noGoConditions: result.noGoConditions,
      plan: result.plan,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'finalize-execution-manifest') {
    const outFile = takeOption(args, '--out')
    const targetDir = takeOption(args, '--target')
    const expectedHash = takeOption(args, '--expected-hash')
    const approvedBy = takeOption(args, '--approved-by')
    const approvalRef = takeOption(args, '--approval-ref')
    const [target] = args
    if (!target || !targetDir || !expectedHash || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = writeExecutionApprovalManifest(
      path.resolve(process.cwd(), target),
      path.resolve(process.cwd(), outFile),
      {
        targetDir: path.resolve(process.cwd(), targetDir),
        expectedHash,
        approvedBy: approvedBy ?? undefined,
        approvalRef: approvalRef ?? undefined,
        packageCommandArg: target,
        manifestCommandArg: outFile,
        targetCommandArg: targetDir,
        outCommandArg: '<out.json>',
      },
    )
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      approvalManifestId: result.manifest.approvalManifestId,
      executionApprovalGranted: result.manifest.executionApprovalGranted,
      approvedPackageId: result.manifest.approvedPackageId,
      packageHash: result.manifest.packageHash,
      targetMode: result.manifest.targetMode,
      targetCommandId: result.manifest.executionBoundary.targetBinding.targetCommandId,
      writeCommandId: result.manifest.executionBoundary.targetBinding.writeCommandId,
      readbackCommandId: result.manifest.executionBoundary.targetBinding.readbackCommandId,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'execute-scoped-import') {
    const manifestPath = takeOption(args, '--manifest')
    const targetDir = takeOption(args, '--target')
    const outFile = takeOption(args, '--out')
    const [target] = args
    if (!target || !manifestPath || !targetDir || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = executeScopedImport(
      path.resolve(process.cwd(), target),
      path.resolve(process.cwd(), manifestPath),
      path.resolve(process.cwd(), targetDir),
      path.resolve(process.cwd(), outFile),
    )
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      targetStatePath: result.targetStatePath,
      executionRunId: result.execution.executionRunId,
      packageHash: result.execution.packageHash,
      targetMode: result.execution.targetMode,
      createdOrUpdatedEntityIds: result.execution.createdOrUpdatedEntityIds,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'readback-scoped-import') {
    const manifestPath = takeOption(args, '--manifest')
    const targetDir = takeOption(args, '--target')
    const outFile = takeOption(args, '--out')
    const allowMissing = takeFlag(args, '--allow-missing')
    const [target] = args
    if (!target || !manifestPath || !targetDir || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = readbackScopedImport(
      path.resolve(process.cwd(), target),
      path.resolve(process.cwd(), manifestPath),
      path.resolve(process.cwd(), targetDir),
      path.resolve(process.cwd(), outFile),
      { allowMissing },
    )
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      status: result.result.status,
      targetStateExists: result.result.targetStateExists,
      executionRunId: result.result.executionRunId ?? null,
      countComparisons: result.result.countComparisons ?? null,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'build-operator-projection') {
    const approvalManifestPath = takeOption(args, '--manifest')
    const executionResultPath = takeOption(args, '--execution')
    const readbackResultPath = takeOption(args, '--readback')
    const rollerDryRunPath = takeOption(args, '--roller-dry-run')
    const outFile = takeOption(args, '--out')
    if (!approvalManifestPath || !executionResultPath || !readbackResultPath || !outFile) {
      console.error(usage())
      process.exit(2)
    }

    const result = writeOperatorProjection({
      approvalManifestPath: path.resolve(process.cwd(), approvalManifestPath),
      executionResultPath: path.resolve(process.cwd(), executionResultPath),
      readbackResultPath: path.resolve(process.cwd(), readbackResultPath),
      rollerDryRunPath: rollerDryRunPath ? path.resolve(process.cwd(), rollerDryRunPath) : null,
      outFile: path.resolve(process.cwd(), outFile),
    })
    printJson({
      ok: result.ok,
      writtenTo: result.writtenTo,
      projectionId: result.projection.projectionId,
      executionRunId: result.projection.executionRunId,
      packageHash: result.projection.packageHash,
      readOnly: result.projection.readOnly,
      panelCount: result.validation.panelCount,
      futureApiRouteCount: result.validation.futureApiRouteCount,
      validation: result.validation,
    })
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'validate-operator-projection') {
    const [target] = args
    if (!target) {
      console.error(usage())
      process.exit(2)
    }

    const result = validateOperatorProjectionFile(path.resolve(process.cwd(), target))
    printJson(result)
    process.exit(result.ok ? 0 : 1)
  }

  if (command === 'validate-operator-handoff') {
    const [target] = args
    if (!target) {
      console.error(usage())
      process.exit(2)
    }

    const result = validateOperatorHandoffPacketFile(path.resolve(process.cwd(), target))
    printJson(result)
    process.exit(result.ok ? 0 : 1)
  }

  console.error(usage())
  process.exit(2)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
