import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  assertSafeGeneratedOutputPath,
  createPreview,
  loadManifestFromTarget,
} from './import-package-builder.mjs'
import { validatePackage } from './validate-import-package.mjs'

const DEFAULT_CREATED_AT = '2026-06-14T04:00:00-04:00'
const PREFLIGHT_BUILDER_ID = 'pumpkin-v2-11-6-no-write-import-execution-preflight'

const forbiddenFutureActions = Object.freeze([
  'tenant_import_execution',
  'live_tenant_creation',
  'roller_resume',
  'cms_write',
  'provider_write',
  'media_asset_write',
  'deployment',
  'dns_or_custom_domain_mutation',
  'google_search_console_indexing',
  'contact_form_post',
  'azure_mutation',
  'rbac_assignment',
  'protected_config_read',
  'token_key_connection_string_sas_access',
])

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

function firstRef(value) {
  return asArray(value).find((item) => typeof item === 'string' && item.trim().length > 0) ?? null
}

function slugPart(value, fallback) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback
  }

  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || fallback
}

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    )
  }

  return value
}

function stableJson(value) {
  return JSON.stringify(stableValue(value))
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function securityNoGoConditions(manifest) {
  const boundary = manifest.securityBoundary ?? {}
  const noGo = []

  const flaggedFields = [
    ['liveTenantCreation', 'live_tenant_creation_requested'],
    ['tenantImportExecution', 'tenant_import_execution_requested'],
    ['cmsWrites', 'cms_write_requested'],
    ['providerWrites', 'provider_write_requested'],
    ['mediaAssetWrites', 'media_asset_write_requested'],
    ['deployment', 'deployment_requested'],
    ['redeployment', 'redeployment_requested'],
    ['dnsMutation', 'dns_mutation_requested'],
    ['customDomainMutation', 'custom_domain_mutation_requested'],
    ['googleIndexingAction', 'google_indexing_requested'],
    ['contactPost', 'contact_post_requested'],
    ['azureMutation', 'azure_mutation_requested'],
    ['rbacAssignment', 'rbac_assignment_requested'],
    ['protectedConfigRead', 'protected_config_read_requested'],
    ['secretsIncluded', 'secret_value_present'],
    ['crawlOrOutboundLiveCheck', 'crawl_or_outbound_live_check_requested'],
    ['electronRuntime', 'electron_runtime_requested'],
  ]

  for (const [field, condition] of flaggedFields) {
    if (boundary[field] === true) {
      noGo.push(condition)
    }
  }

  return noGo
}

export function computePackageIdentity(targetPath) {
  const resolvedTarget = path.resolve(targetPath)
  const manifest = loadManifestFromTarget(resolvedTarget)
  const validation = validatePackage(manifest)
  const preview = createPreview(manifest, validation)
  const packageHash = `sha256:${sha256(stableJson(manifest))}`

  return {
    schemaVersion: 'pumpkin.importExecutionPreflight.packageIdentity.v1',
    packageId: manifest.packageId,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    domain: manifest.domain ?? null,
    importMode: manifest.importMode,
    tenantLifecycleState: manifest.tenantLifecycleState,
    sourcePackagePath: resolvedTarget,
    packageHash,
    validationOk: validation.ok === true,
    validationFailures: validation.failures ?? [],
    noGoConditions: preview.noGoConditions ?? [],
    readyForFutureImportExecution: preview.readyForFutureImportExecution === true,
  }
}

export function evaluatePrerequisites(manifest, preview = createPreview(manifest, validatePackage(manifest))) {
  const prerequisiteChecks = [
    ['backupCenter', 'backup_center_prerequisite_missing', firstRef(manifest.backupEvidenceRefs)],
    ['resourceRegistry', 'resource_registry_prerequisite_missing', firstRef(manifest.resourceRegistryRefs)],
    ['providerProfile', 'provider_profile_prerequisite_missing', firstRef(manifest.providerProfileRefs)],
    ['runtimeQa', 'runtime_qa_prerequisite_missing', firstRef(manifest.runtimeQaRefs)],
    ['olm', 'olm_carryforward_prerequisite_missing', firstRef(manifest.outboundLinkRefs)],
    ['auditJobs', 'audit_jobs_carryforward_prerequisite_missing', firstRef(manifest.auditJobRefs)],
    ['rollback', 'rollback_plan_missing', manifest.rollbackPlanId ?? null],
  ]

  const results = Object.fromEntries(
    prerequisiteChecks.map(([name, , ref]) => [
      name,
      {
        ok: typeof ref === 'string' && ref.length > 0,
        ref,
      },
    ]),
  )

  const missing = prerequisiteChecks
    .filter(([, , ref]) => !(typeof ref === 'string' && ref.length > 0))
    .map(([, condition]) => condition)

  const noGoConditions = [
    ...new Set([
      ...asArray(preview.noGoConditions),
      ...missing,
      ...securityNoGoConditions(manifest),
    ]),
  ].sort()

  return {
    schemaVersion: 'pumpkin.importExecutionPreflight.prerequisites.v1',
    ok: missing.length === 0,
    missing,
    results,
    noGoConditions,
  }
}

export function buildApprovalManifest(targetPath, options = {}) {
  const resolvedTarget = path.resolve(targetPath)
  const manifest = loadManifestFromTarget(resolvedTarget)
  const validation = validatePackage(manifest)
  const preview = createPreview(manifest, validation)
  const identity = computePackageIdentity(resolvedTarget)
  const prerequisites = evaluatePrerequisites(manifest, preview)
  const packageSlug = slugPart(manifest.packageId, 'package')
  const approvalManifestId = options.approvalManifestId ?? `approval-${packageSlug}-v2-11-6`
  const readbackPlanId = options.readbackPlanId ?? `readback-${packageSlug}-future-import`
  const auditJobTraceId = options.auditJobTraceId ?? `audit-trace-${packageSlug}-v2-11-6`
  const noGoConditionResultId = options.noGoConditionResultId ?? `no-go-${packageSlug}-v2-11-6`

  return {
    schemaVersion: 'pumpkin.importExecutionApprovalManifest.v1',
    approvalManifestId,
    approvalType: 'future_import_execution_no_write_preflight',
    executionApprovalGranted: false,
    dryRunApproved: true,
    approvedPackageId: manifest.packageId,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    packageHash: identity.packageHash,
    importMode: manifest.importMode,
    ownerApproval: manifest.ownerApproval ?? { approved: false },
    operatorApproval: {
      approved: false,
      approvalRef: 'operator_execution_approval_required_future_phase',
      approvedBy: null,
      scope: 'future_import_execution_not_approved_in_v2_11_6',
    },
    backupCenterEvidenceRef: prerequisites.results.backupCenter.ref,
    resourceRegistryBindingRef: prerequisites.results.resourceRegistry.ref,
    providerProfileBindingRef: prerequisites.results.providerProfile.ref,
    runtimeQaEvidenceRef: prerequisites.results.runtimeQa.ref,
    rollbackPlanId: manifest.rollbackPlanId ?? null,
    readbackPlanId,
    auditJobTraceId,
    noGoConditionResultId,
    futureExecutionBoundary: {
      allowedInThisPhase: ['local_no_write_dry_run_preflight'],
      executionRequiresSeparateApproval: true,
      executionAllowedNow: false,
      forbiddenActions: forbiddenFutureActions,
    },
    prerequisiteSummary: prerequisites,
    sourcePackageIdentity: identity,
    createdAt: options.createdAt ?? DEFAULT_CREATED_AT,
    createdBy: options.createdBy ?? PREFLIGHT_BUILDER_ID,
  }
}

export function buildDryRunApplyPlan(targetPath, approvalManifest, options = {}) {
  const resolvedTarget = path.resolve(targetPath)
  const manifest = loadManifestFromTarget(resolvedTarget)
  const validation = validatePackage(manifest)
  const preview = createPreview(manifest, validation)
  const identity = computePackageIdentity(resolvedTarget)
  const prerequisites = evaluatePrerequisites(manifest, preview)
  const noGoConditions = [...new Set(prerequisites.noGoConditions)].sort()
  const dryRunAllowed = validation.ok === true
    && noGoConditions.length === 0
    && manifest.tenantLifecycleState !== 'paused'
    && manifest.importMode !== 'paused_no_import'
  const targetMode = dryRunAllowed ? 'future_import_candidate' : 'blocked_no_import_no_resume'

  return {
    schemaVersion: 'pumpkin.importExecutionDryRunApplyPlan.v1',
    dryRunId: options.dryRunId ?? `dry-run-${slugPart(manifest.packageId, 'package')}-v2-11-6`,
    packageId: manifest.packageId,
    tenantKey: manifest.tenantKey,
    siteKey: manifest.siteKey,
    packageHash: identity.packageHash,
    approvalManifestId: approvalManifest.approvalManifestId,
    targetMode,
    executionMode: 'no_write_dry_run',
    dryRunAllowed,
    futureExecutionAllowed: false,
    futureExecutionBlockers: ['execution_approval_not_granted'],
    wouldCreate: dryRunAllowed
      ? {
          tenant: false,
          routeMappings: asArray(manifest.routes),
          contentMappings: asArray(manifest.contentRefs),
          mediaReferenceMappings: asArray(manifest.mediaRefs),
          formConfigMappings: asArray(manifest.formConfigRefs),
        }
      : {},
    wouldUpdate: {},
    wouldDelete: [],
    wouldWriteCms: false,
    wouldWriteProvider: false,
    wouldMutateAzure: false,
    wouldDeploy: false,
    wouldIndex: false,
    routeImpact: {
      count: asArray(manifest.routes).length,
      routes: asArray(manifest.routes),
      action: dryRunAllowed ? 'candidate_mapping_only_no_write' : 'blocked_no_import',
    },
    contentImpact: {
      count: asArray(manifest.contentRefs).length,
      refs: asArray(manifest.contentRefs),
      action: dryRunAllowed ? 'candidate_mapping_only_no_write' : 'blocked_no_import',
    },
    mediaImpact: {
      count: asArray(manifest.mediaRefs).length,
      refs: asArray(manifest.mediaRefs),
      action: 'references_only_no_media_write',
    },
    formConfigImpact: {
      count: asArray(manifest.formConfigRefs).length,
      refs: asArray(manifest.formConfigRefs),
      action: 'references_only_no_contact_post',
    },
    resourceRegistryImpact: {
      refs: asArray(manifest.resourceRegistryRefs),
      action: 'references_only_no_registry_write',
    },
    providerProfileImpact: {
      refs: asArray(manifest.providerProfileRefs),
      action: 'references_only_no_provider_write',
    },
    backupImpact: {
      refs: asArray(manifest.backupEvidenceRefs),
      action: 'pre_execution_evidence_reference_only',
    },
    runtimeQaImpact: {
      refs: asArray(manifest.runtimeQaRefs),
      action: 'pre_execution_evidence_reference_only',
    },
    olmImpact: {
      refs: asArray(manifest.outboundLinkRefs),
      action: 'carryforward_reference_only_no_crawl',
    },
    auditJobsImpact: {
      refs: asArray(manifest.auditJobRefs),
      action: 'trace_plan_reference_only_no_job_write',
    },
    noGoConditions,
    rollbackPlanId: manifest.rollbackPlanId ?? null,
    readbackPlanId: approvalManifest.readbackPlanId,
    traceId: approvalManifest.auditJobTraceId,
    prerequisiteSummary: prerequisites,
    createdAt: options.createdAt ?? DEFAULT_CREATED_AT,
    createdBy: options.createdBy ?? PREFLIGHT_BUILDER_ID,
  }
}

export function writeApprovalManifest(targetPath, outFile, options = {}) {
  const manifest = buildApprovalManifest(targetPath, options)
  const resolvedOutFile = assertSafeGeneratedOutputPath(outFile)
  fs.mkdirSync(path.dirname(resolvedOutFile), { recursive: true })
  writeJson(resolvedOutFile, manifest)
  return {
    ok: true,
    writtenTo: resolvedOutFile,
    manifest,
  }
}

export function writeDryRunApplyPlan(targetPath, approvalManifestPath, outFile, options = {}) {
  const approvalManifest = readJson(path.resolve(approvalManifestPath))
  const plan = buildDryRunApplyPlan(targetPath, approvalManifest, options)
  const resolvedOutFile = assertSafeGeneratedOutputPath(outFile)
  fs.mkdirSync(path.dirname(resolvedOutFile), { recursive: true })
  writeJson(resolvedOutFile, plan)
  return {
    ok: true,
    writtenTo: resolvedOutFile,
    dryRunAllowed: plan.dryRunAllowed,
    targetMode: plan.targetMode,
    noGoConditions: plan.noGoConditions,
    plan,
  }
}

