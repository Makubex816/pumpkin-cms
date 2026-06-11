import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
export const adminRoot = path.resolve(path.dirname(__filename), '..')
export const repoRoot = path.resolve(adminRoot, '..', '..')

export const defaultWritePatterns = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\baxios\b/,
  /\bmethod\s*:\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i,
  /\.(post|put|patch|delete)\s*\(/i,
]

export const defaultProtectedConfigPatterns = [
  /\.env\.local/i,
  /appsettings\.Development\.json/i,
  /local\.settings\.json/i,
  /AccountKey=/i,
  /SharedAccessSignature/i,
  /Authorization:/i,
  /Bearer\s+[A-Za-z0-9._-]+/i,
  /process\.env/i,
]

const browserToolPatterns = [
  /"@playwright\/test"/,
  /"playwright"/,
  /"puppeteer"/,
]

export function readAdminFile(relativePath) {
  return fs.readFileSync(path.join(adminRoot, relativePath), 'utf8')
}

export function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

export function walkFiles(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name)
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath]
  })
}

export function packageText(relativePath) {
  const filePath = path.join(repoRoot, relativePath)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

export function hasBrowserAutomationMetadata() {
  const packageTexts = [
    packageText('package.json'),
    packageText('package-lock.json'),
    packageText('apps/admin/package.json'),
    packageText('apps/admin/package-lock.json'),
  ].join('\n')
  return browserToolPatterns.some((pattern) => pattern.test(packageTexts))
}

export function hasBrowserAutomationRuntime() {
  return [
    'node_modules/@playwright/test',
    'node_modules/playwright',
    'node_modules/puppeteer',
    'apps/admin/node_modules/@playwright/test',
    'apps/admin/node_modules/playwright',
    'apps/admin/node_modules/puppeteer',
  ].some((relativePath) => fs.existsSync(path.join(repoRoot, relativePath)))
}

export function runRuntimeQaHarness(config) {
  const checks = []
  const failures = []

  const recordCheck = (name, status, details = {}) => {
    checks.push({ name, status, ...details })
  }

  const assert = (condition, code, message, file = null) => {
    if (!condition) {
      throw Object.assign(new Error(message), { code, file })
    }
  }

  const runCheck = (name, callback) => {
    try {
      const details = callback({ assert }) ?? {}
      recordCheck(name, 'passed', details)
    } catch (error) {
      const failure = {
        code: error.code ?? 'RUNTIME_QA_CHECK_FAILED',
        message: error.message,
        file: error.file ?? null,
      }
      failures.push(failure)
      recordCheck(name, 'failed', { failure })
    }
  }

  for (const group of config.markerGroups ?? []) {
    runCheck(group.name, ({ assert: checkAssert }) => {
      const source = group.root === 'repo' ? readRepoFile(group.file) : readAdminFile(group.file)
      const missing = group.markers.filter((marker) => !source.includes(marker))
      checkAssert(missing.length === 0, group.failureCode, `Missing markers: ${missing.join(', ')}`, group.file)
      return {
        file: group.file,
        markerCount: group.markers.length,
        markers: group.markers,
      }
    })
  }

  runCheck('no-uncontrolled-write-calls', ({ assert: checkAssert }) => {
    const roots = (config.sourceRoots ?? []).map((root) => path.join(adminRoot, root))
    const scannedFiles = roots.flatMap(walkFiles).filter((file) => /\.(tsx?|jsx?|mjs)$/.test(file))
    const patterns = config.writePatterns ?? defaultWritePatterns
    const matches = []
    for (const file of scannedFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const pattern of patterns) {
        if (pattern.test(source)) {
          matches.push({ file: path.relative(repoRoot, file).replaceAll('\\', '/'), pattern: String(pattern) })
        }
      }
    }
    checkAssert(matches.length === 0, 'UNCONTROLLED_WRITE_CALL_PATTERN_FOUND', `Write-call patterns found: ${JSON.stringify(matches)}`)
    return { scannedFileCount: scannedFiles.length }
  })

  runCheck('no-protected-config-patterns', ({ assert: checkAssert }) => {
    const roots = (config.sourceRoots ?? []).map((root) => path.join(adminRoot, root))
    const scannedFiles = roots.flatMap(walkFiles).filter((file) => /\.(tsx?|jsx?|mjs)$/.test(file))
    const patterns = config.protectedConfigPatterns ?? defaultProtectedConfigPatterns
    const matches = []
    for (const file of scannedFiles) {
      const source = fs.readFileSync(file, 'utf8')
      for (const pattern of patterns) {
        if (pattern.test(source)) {
          matches.push({ file: path.relative(repoRoot, file).replaceAll('\\', '/'), pattern: String(pattern) })
        }
      }
    }
    checkAssert(matches.length === 0, 'PROTECTED_CONFIG_PATTERN_FOUND', `Protected config patterns found: ${JSON.stringify(matches)}`)
    return { scannedFileCount: scannedFiles.length }
  })

  for (const customCheck of config.customChecks ?? []) {
    runCheck(customCheck.name, (helpers) => customCheck.run({ ...helpers, adminRoot, repoRoot, readAdminFile, readRepoFile, walkFiles }))
  }

  runCheck('browser-tooling-detection', () => ({
    browserAutomationMetadataDetected: hasBrowserAutomationMetadata(),
    browserAutomationRuntimeAvailable: hasBrowserAutomationRuntime(),
    harnessMode: hasBrowserAutomationRuntime() ? 'browser-tooling-installed-not-invoked-by-this-script' : 'node-runtime-safe-source-route-harness',
  }))

  return {
    schemaVersion: '0.1.0',
    resultType: config.resultType,
    status: failures.length === 0 ? 'passed' : 'failed',
    target: config.target,
    harnessPattern: 'pumpkin-platform-runtime-qa-harness',
    harnessMode: hasBrowserAutomationRuntime() ? 'browser-tooling-installed-not-invoked-by-this-script' : 'node-runtime-safe-source-route-harness',
    browserAutomationMetadataDetected: hasBrowserAutomationMetadata(),
    browserAutomationRuntimeAvailable: hasBrowserAutomationRuntime(),
    checks,
    failures,
    evidence: config.evidenceFactory ? config.evidenceFactory({ checks, failures }) : {},
    boundaries: {
      localOnly: true,
      runtimeSafeHarnessOnly: !hasBrowserAutomationRuntime(),
      protectedConfigReads: false,
      liveProviderWrites: false,
      cmsWrites: false,
      externalCrawling: false,
      azureMutations: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false,
      ...(config.boundaries ?? {}),
    },
  }
}

export function writeRuntimeQaEvidence({ evidenceRoot, result, markdownTitle }) {
  fs.mkdirSync(evidenceRoot, { recursive: true })
  fs.writeFileSync(path.join(evidenceRoot, 'ADMIN_RUNTIME_QA_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  fs.writeFileSync(
    path.join(evidenceRoot, 'ADMIN_RUNTIME_QA_RESULT.md'),
    `# ${markdownTitle}

Status: ${result.status}

Target: ${result.target}

Harness pattern: ${result.harnessPattern}

Harness mode: ${result.harnessMode}

Browser automation metadata detected: ${result.browserAutomationMetadataDetected}

Browser automation runtime available: ${result.browserAutomationRuntimeAvailable}

Checks:
${result.checks.map((check) => `- ${check.name}: ${check.status}`).join('\n')}

Failures:
${result.failures.length === 0 ? '- none' : result.failures.map((failure) => `- ${failure.code}: ${failure.message}`).join('\n')}

Boundary: local runtime-safe source/route harness only unless browser tooling is already installed and explicitly invoked; no protected config reads, live provider writes, CMS writes, external crawling, Azure mutation, deployment, indexing, or live-page publication.
`,
    'utf8',
  )
}
