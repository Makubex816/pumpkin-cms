import fs from 'node:fs'
import path from 'node:path'
import { validatePackage } from './validate-import-package.mjs'

const DEFAULT_CREATED_AT = '2026-06-14T04:00:00-04:00'
const BUILDER_ID = 'pumpkin-v2-11-2-local-no-write-builder'

export const defaultSecurityBoundary = Object.freeze({
  liveTenantCreation: false,
  tenantImportExecution: false,
  cmsWrites: false,
  providerWrites: false,
  mediaAssetWrites: false,
  deployment: false,
  redeployment: false,
  dnsMutation: false,
  customDomainMutation: false,
  googleIndexingAction: false,
  contactPost: false,
  azureMutation: false,
  rbacAssignment: false,
  protectedConfigRead: false,
  secretsIncluded: false,
  crawlOrOutboundLiveCheck: false,
  electronRuntime: false,
})

export const defaultRedactionPolicy = Object.freeze({
  secretsPolicy: 'references_only_no_values',
  protectedConfigPolicy: 'do_not_reference_protected_paths',
  piiPolicy: 'synthetic_or_redacted_only',
})

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function asArray(value) {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function compactStrings(values) {
  return asArray(values)
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
}

function uniqueStrings(values) {
  return [...new Set(compactStrings(values))]
}

function routePath(route) {
  if (typeof route === 'string') {
    return route
  }

  return route?.path
}

function routeRefs(routes, field) {
  return routes.flatMap((route) => {
    if (typeof route !== 'object' || route === null) {
      return []
    }

    return compactStrings(route[field])
  })
}

function slugPart(value, fallback) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback
  }

  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || fallback
}

function packageIdFor(source, tenantKey) {
  if (source.packageId) {
    return slugPart(source.packageId, 'package')
  }

  const tenantPart = slugPart(tenantKey, 'missing-tenant')
  const purposePart = slugPart(source.packagePurpose ?? source.packageType ?? 'tenant-bundle', 'tenant-bundle')
  return `${tenantPart}-${purposePart}-v2-11-2`
}

function noGoConditionsForManifest(manifest) {
  const noGoConditions = new Set(compactStrings(manifest.noGoConditions))

  if (manifest.tenantLifecycleState === 'paused' && manifest.importMode === 'paused_no_import') {
    noGoConditions.add('tenant_paused_no_import')
  }

  if (manifest.importMode === 'production_mutation_requested') {
    noGoConditions.add('production_mutation_requested')
  }

  if (manifest.importMode === 'resume_requested' && manifest.pauseResume?.resumeApproved !== true) {
    noGoConditions.add('paused_resume_without_approval')
  }

  if (manifest.indexingState === 'requested' || manifest.securityBoundary?.googleIndexingAction === true) {
    noGoConditions.add('indexing_requested')
  }

  return [...noGoConditions].sort()
}

function isArchivePath(targetPath) {
  return /\.(?:zip|tar|tgz|tar\.gz|7z|rar)$/i.test(targetPath)
}

export function assertSafeGeneratedOutputPath(outDir) {
  const resolved = path.resolve(outDir)
  const parts = resolved.split(path.sep).map((part) => part.toLowerCase())

  if (!parts.includes('.tmp')) {
    throw new Error('generated package output must be under a .tmp path')
  }

  if (isArchivePath(resolved)) {
    throw new Error('compressed package output is not allowed')
  }

  return resolved
}

export function buildNormalizedManifest(source, options = {}) {
  const tenant = source.tenant ?? {}
  const tenantKey = tenant.tenantKey ?? source.tenantKey
  const siteKey = tenant.siteKey ?? source.siteKey
  const routesInput = asArray(source.routes)
  const routes = uniqueStrings(routesInput.map(routePath))
  const lifecycleState = tenant.lifecycleState ?? source.tenantLifecycleState ?? source.lifecycleState ?? 'candidate'
  const pauseResume = source.pauseResume ?? tenant.pauseResume
  const importMode = source.importMode ?? (lifecycleState === 'paused' && pauseResume?.resumeApproved !== true ? 'paused_no_import' : 'local_no_write_validate')
  const securityBoundary = {
    ...defaultSecurityBoundary,
    ...(source.securityBoundary ?? {}),
  }
  const redactionPolicy = {
    ...defaultRedactionPolicy,
    ...(source.redactionPolicy ?? {}),
  }

  const manifest = {
    schemaVersion: 'pumpkin.multiTenantImportPackage.v1',
    packageId: packageIdFor(source, tenantKey),
    packageType: source.packageType ?? 'tenant_bundle',
    tenantKey,
    siteKey,
    domain: tenant.domain ?? source.domain,
    sourceSystem: source.sourceSystem ?? 'v2-11-2-local-builder-fixture',
    createdAt: source.createdAt ?? options.createdAt ?? DEFAULT_CREATED_AT,
    createdBy: source.createdBy ?? BUILDER_ID,
    ownerApproval: source.ownerApproval ?? { approved: false },
    tenantLifecycleState: lifecycleState,
    routes,
    contentRefs: uniqueStrings([...asArray(source.contentRefs), ...routeRefs(routesInput, 'contentRefs'), ...routeRefs(routesInput, 'contentRef')]),
    mediaRefs: uniqueStrings(source.mediaRefs),
    formConfigRefs: uniqueStrings([...asArray(source.formConfigRefs), ...routeRefs(routesInput, 'formConfigRefs'), ...routeRefs(routesInput, 'formConfigRef')]),
    resourceRegistryRefs: uniqueStrings(source.resourceRegistryRefs),
    providerProfileRefs: uniqueStrings(source.providerProfileRefs),
    backupEvidenceRefs: uniqueStrings(source.backupEvidenceRefs),
    runtimeQaRefs: uniqueStrings(source.runtimeQaRefs),
    outboundLinkRefs: uniqueStrings(source.outboundLinkRefs),
    auditJobRefs: uniqueStrings(source.auditJobRefs),
    securityBoundary,
    redactionPolicy,
    importMode,
    rollbackPlanId: source.rollbackPlanId ?? `rollback-${slugPart(tenantKey, 'missing-tenant')}-local-no-write`,
    validationRefs: uniqueStrings([
      ...(source.validationRefs ?? []),
      'v2-11-2-builder-normalized-manifest',
      'v2-11-2-local-no-write-validator',
    ]),
    traceRefs: uniqueStrings(source.traceRefs),
    indexingState: source.indexingState ?? 'deferred_hard_stop',
  }

  if (pauseResume) {
    manifest.pauseResume = pauseResume
  }

  if (source.protectedConfigRef) {
    manifest.protectedConfigRef = source.protectedConfigRef
  }

  if (source.exampleBadValue) {
    manifest.exampleBadValue = source.exampleBadValue
  }

  manifest.noGoConditions = noGoConditionsForManifest(manifest)

  return manifest
}

export function buildAndValidateSource(source, options = {}) {
  const manifest = buildNormalizedManifest(source, options)
  const sourceText = options.sourceText ? `${options.sourceText}\n${JSON.stringify(manifest)}` : JSON.stringify(manifest)
  const validation = validatePackage(manifest, { sourceText })
  const preview = createPreview(manifest, validation)

  return {
    ok: validation.ok,
    manifest,
    validation,
    preview,
  }
}

export function buildAndValidateSourceFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const source = JSON.parse(sourceText)
  return buildAndValidateSource(source, { sourceText })
}

export function createPreview(manifest, validation = validatePackage(manifest)) {
  const validationFailures = validation.failures ?? []
  const noGoConditions = uniqueStrings([...(manifest.noGoConditions ?? []), ...validationFailures])
  const readyForFutureImportExecution = validation.ok
    && noGoConditions.length === 0
    && manifest.importMode !== 'paused_no_import'
    && manifest.tenantLifecycleState !== 'paused'

  return {
    previewSchemaVersion: 'pumpkin.importPackageIntakePreview.v1',
    generatedAt: DEFAULT_CREATED_AT,
    packageId: manifest.packageId ?? null,
    tenantKey: manifest.tenantKey ?? null,
    siteKey: manifest.siteKey ?? null,
    domain: manifest.domain ?? null,
    tenantLifecycleState: manifest.tenantLifecycleState ?? null,
    importMode: manifest.importMode ?? null,
    routeCount: asArray(manifest.routes).length,
    routes: asArray(manifest.routes),
    contentRefCount: asArray(manifest.contentRefs).length,
    contentRefs: asArray(manifest.contentRefs),
    mediaRefCount: asArray(manifest.mediaRefs).length,
    mediaRefs: asArray(manifest.mediaRefs),
    formConfigRefCount: asArray(manifest.formConfigRefs).length,
    formConfigRefs: asArray(manifest.formConfigRefs),
    resourceRegistryRefCount: asArray(manifest.resourceRegistryRefs).length,
    resourceRegistryRefs: asArray(manifest.resourceRegistryRefs),
    providerProfileRefCount: asArray(manifest.providerProfileRefs).length,
    providerProfileRefs: asArray(manifest.providerProfileRefs),
    backupEvidenceRefCount: asArray(manifest.backupEvidenceRefs).length,
    backupEvidenceRefs: asArray(manifest.backupEvidenceRefs),
    runtimeQaRefCount: asArray(manifest.runtimeQaRefs).length,
    runtimeQaRefs: asArray(manifest.runtimeQaRefs),
    outboundLinkRefCount: asArray(manifest.outboundLinkRefs).length,
    outboundLinkRefs: asArray(manifest.outboundLinkRefs),
    auditJobRefCount: asArray(manifest.auditJobRefs).length,
    auditJobRefs: asArray(manifest.auditJobRefs),
    noGoConditions,
    rollbackPlanId: manifest.rollbackPlanId ?? null,
    validationRefs: asArray(manifest.validationRefs),
    securityBoundary: manifest.securityBoundary ?? {},
    redactionPolicy: manifest.redactionPolicy ?? {},
    validationOk: validation.ok === true,
    validationFailures,
    readyForFutureImportExecution,
    futureImportExecutionGateRequired: true,
    importExecutionPerformed: false,
    noWrite: true,
  }
}

export function loadManifestFromTarget(targetPath) {
  const stats = fs.statSync(targetPath)
  const manifestPath = stats.isDirectory() ? path.join(targetPath, 'manifest.json') : targetPath
  return readJson(manifestPath)
}

export function previewTarget(targetPath) {
  const manifest = loadManifestFromTarget(targetPath)
  const validation = validatePackage(manifest)
  return createPreview(manifest, validation)
}

export function validateInputFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const value = JSON.parse(sourceText)

  if (value.schemaVersion === 'pumpkin.multiTenantImportPackage.v1') {
    return validatePackage(value, { sourceText })
  }

  return buildAndValidateSource(value, { sourceText }).validation
}

export function buildPackageFromSourceFile(sourcePath, outDir) {
  const resolvedOutDir = assertSafeGeneratedOutputPath(outDir)
  const result = buildAndValidateSourceFile(sourcePath)

  if (!result.validation.ok) {
    return {
      ok: false,
      outDir: resolvedOutDir,
      manifest: result.manifest,
      validation: result.validation,
      preview: result.preview,
      wrotePackage: false,
    }
  }

  fs.mkdirSync(resolvedOutDir, { recursive: true })
  writeJson(path.join(resolvedOutDir, 'manifest.json'), result.manifest)
  writeJson(path.join(resolvedOutDir, 'validation-result.json'), result.validation)
  writeJson(path.join(resolvedOutDir, 'preview.json'), result.preview)
  fs.writeFileSync(
    path.join(resolvedOutDir, 'README.md'),
    [
      '# Local No-Write Import Package Candidate',
      '',
      `Package: ${result.manifest.packageId}`,
      `Tenant: ${result.manifest.tenantKey}`,
      '',
      'This generated package is local preview evidence only. It does not execute an import.',
      '',
    ].join('\n'),
  )

  return {
    ok: true,
    outDir: resolvedOutDir,
    manifest: result.manifest,
    validation: result.validation,
    preview: result.preview,
    wrotePackage: true,
  }
}

export function writePreview(preview, outFile) {
  const resolvedOutFile = assertSafeGeneratedOutputPath(outFile)
  fs.mkdirSync(path.dirname(resolvedOutFile), { recursive: true })
  writeJson(resolvedOutFile, preview)
  return resolvedOutFile
}
