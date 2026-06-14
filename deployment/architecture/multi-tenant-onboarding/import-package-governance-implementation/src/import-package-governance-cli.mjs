#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPackageFromSourceFile,
  previewTarget,
  validateInputFile,
  writePreview,
} from './import-package-builder.mjs'

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

function usage() {
  return [
    'Usage:',
    '  node src/import-package-governance-cli.mjs validate <fixture-or-manifest.json>',
    '  node src/import-package-governance-cli.mjs build-package <source.fixture.json> --out .tmp/<package-dir>',
    '  node src/import-package-governance-cli.mjs preview-package <package-dir-or-manifest.json> [--out .tmp/<preview.json>]',
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
