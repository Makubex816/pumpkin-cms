#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const lifecycleStates = new Set([
  'candidate',
  'paused',
  'local_package_ready',
  'local_import_validated',
  'backup_verified',
  'resource_registry_bound',
  'runtime_qa_ready',
  'staging_ready',
  'live_readonly_ready',
  'live_write_approved',
  'production_published',
  'archived',
])

export const packageTypes = new Set([
  'tenant_bundle',
  'website_content_bundle',
  'route_content_manifest',
  'media_manifest',
  'form_configuration_reference',
  'resource_registry_binding',
  'provider_profile_binding',
  'backup_center_evidence_bundle',
  'runtime_qa_evidence_bundle',
  'outbound_link_manager_bundle',
  'audit_jobs_evidence_bundle',
])

const requiredFields = [
  'schemaVersion',
  'packageId',
  'packageType',
  'tenantKey',
  'siteKey',
  'domain',
  'sourceSystem',
  'createdAt',
  'createdBy',
  'ownerApproval',
  'tenantLifecycleState',
  'routes',
  'contentRefs',
  'mediaRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'backupEvidenceRefs',
  'runtimeQaRefs',
  'outboundLinkRefs',
  'auditJobRefs',
  'securityBoundary',
  'redactionPolicy',
  'importMode',
  'rollbackPlanId',
  'validationRefs',
]

const arrayFields = [
  'routes',
  'contentRefs',
  'mediaRefs',
  'resourceRegistryRefs',
  'providerProfileRefs',
  'backupEvidenceRefs',
  'runtimeQaRefs',
  'outboundLinkRefs',
  'auditJobRefs',
  'validationRefs',
]

const blockedSecurityFlags = [
  'liveTenantCreation',
  'tenantImportExecution',
  'cmsWrites',
  'providerWrites',
  'mediaAssetWrites',
  'deployment',
  'redeployment',
  'dnsMutation',
  'customDomainMutation',
  'googleIndexingAction',
  'contactPost',
  'azureMutation',
  'rbacAssignment',
  'protectedConfigRead',
  'secretsIncluded',
  'crawlOrOutboundLiveCheck',
  'electronRuntime',
]

const secretPatterns = [
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:password|api[_-]?key|secret|token|connectionstring|sas)\s*[:=]\s*["'][^"']{8,}["']/i,
  /\bSharedAccessSignature\b/i,
]

const protectedConfigPatterns = [
  /\.env\.local/i,
  /appsettings\.Development\.json/i,
  /local\.settings\.json/i,
  /credential/i,
  /browser cookie/i,
  /auth file/i,
]

export function validatePackage(manifest, options = {}) {
  const failures = []
  const warnings = []
  const sourceText = options.sourceText ?? JSON.stringify(manifest)

  for (const field of requiredFields) {
    if (!(field in manifest)) {
      failures.push(`missing required field: ${field}`)
    }
  }

  if (manifest.schemaVersion !== 'pumpkin.multiTenantImportPackage.v1') {
    failures.push('schemaVersion must be pumpkin.multiTenantImportPackage.v1')
  }

  if (typeof manifest.packageId !== 'string' || !/^[a-z0-9][a-z0-9-]{2,100}$/.test(manifest.packageId)) {
    failures.push('packageId must be a lowercase slug')
  }

  if (!packageTypes.has(manifest.packageType)) {
    failures.push(`packageType is not recognized: ${manifest.packageType}`)
  }

  if (typeof manifest.tenantKey !== 'string' || !/^[a-z][a-z0-9-]{2,63}$/.test(manifest.tenantKey)) {
    failures.push('tenantKey missing or invalid')
  }

  if (typeof manifest.siteKey !== 'string' || !/^[a-z][a-z0-9-]{2,63}$/.test(manifest.siteKey)) {
    failures.push('siteKey missing or invalid')
  }

  if (!lifecycleStates.has(manifest.tenantLifecycleState)) {
    failures.push(`tenantLifecycleState is not recognized: ${manifest.tenantLifecycleState}`)
  }

  for (const field of arrayFields) {
    if (!Array.isArray(manifest[field])) {
      failures.push(`${field} must be an array`)
    }
  }

  if (!manifest.ownerApproval || manifest.ownerApproval.approved !== true) {
    failures.push('owner approval missing or not approved')
  }

  if (!Array.isArray(manifest.backupEvidenceRefs) || manifest.backupEvidenceRefs.length === 0) {
    failures.push('Backup Center prerequisite missing')
  }

  if (!Array.isArray(manifest.resourceRegistryRefs) || manifest.resourceRegistryRefs.length === 0) {
    failures.push('Resource Registry binding missing')
  }

  if (!Array.isArray(manifest.providerProfileRefs) || manifest.providerProfileRefs.length === 0) {
    failures.push('Provider Profile binding missing')
  }

  if (!Array.isArray(manifest.runtimeQaRefs) || manifest.runtimeQaRefs.length === 0) {
    failures.push('Runtime QA prerequisite missing')
  }

  if (typeof manifest.rollbackPlanId !== 'string' || manifest.rollbackPlanId.length < 3) {
    failures.push('rollback plan missing')
  }

  const security = manifest.securityBoundary ?? {}
  for (const flag of blockedSecurityFlags) {
    if (security[flag] !== false) {
      failures.push(`blocked security flag must be false: ${flag}`)
    }
  }

  if (manifest.importMode === 'production_mutation_requested') {
    failures.push('package requests production mutation')
  }

  if (manifest.importMode === 'resume_requested' && manifest.pauseResume?.resumeApproved !== true) {
    failures.push('tenant paused and resume not explicitly approved')
  }

  if (manifest.tenantLifecycleState === 'paused' && manifest.importMode !== 'paused_no_import' && manifest.pauseResume?.resumeApproved !== true) {
    failures.push('paused tenant cannot move without explicit resume approval')
  }

  if (manifest.tenantKey === 'roller-rink-rentals' && manifest.pauseResume?.resumeApproved !== true && manifest.importMode !== 'paused_no_import') {
    failures.push('RollerRinkRentals.com remains paused unless explicitly resumed')
  }

  if (manifest.securityBoundary?.googleIndexingAction !== false || manifest.indexingState === 'requested') {
    failures.push('Google/Search Console/indexing requested')
  }

  for (const pattern of secretPatterns) {
    if (pattern.test(sourceText)) {
      failures.push('package contains secret-like value')
      break
    }
  }

  if (typeof manifest.exampleBadValue === 'string' && manifest.exampleBadValue === 'synthetic-secret-like-marker') {
    failures.push('package contains secret-like value')
  }

  for (const pattern of protectedConfigPatterns) {
    if (pattern.test(sourceText)) {
      failures.push('package references protected config')
      break
    }
  }

  if (manifest.redactionPolicy?.secretsPolicy !== 'references_only_no_values') {
    failures.push('redactionPolicy.secretsPolicy must be references_only_no_values')
  }

  if (manifest.redactionPolicy?.protectedConfigPolicy !== 'do_not_reference_protected_paths') {
    failures.push('redactionPolicy.protectedConfigPolicy must be do_not_reference_protected_paths')
  }

  return {
    ok: failures.length === 0,
    failureCount: failures.length,
    warningCount: warnings.length,
    failures,
    warnings,
    packageId: manifest.packageId ?? null,
    tenantKey: manifest.tenantKey ?? null,
    importMode: manifest.importMode ?? null,
    readOnly: true,
    noWrite: true,
  }
}

export function loadAndValidate(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const manifest = JSON.parse(sourceText)
  return validatePackage(manifest, { sourceText })
}

function main() {
  const [, , command, target] = process.argv
  if (command !== 'validate' || !target) {
    console.error('Usage: node src/validate-import-package.mjs validate <fixture.json>')
    process.exit(2)
  }

  const filePath = path.resolve(process.cwd(), target)
  const result = loadAndValidate(filePath)
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.ok ? 0 : 1)
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main()
}
