import fs from 'node:fs/promises';
import path from 'node:path';
import { runScan } from '../scan-runs/scan-run-writer.mjs';
import { createEmptyLocalStore } from '../store/local-store-initializer.mjs';
import { writeLocalStore } from '../store/local-store-writer.mjs';
import { mergeScanIntoStore } from '../store/store-merger.mjs';
import { cloneStore, readLocalStore } from '../store/local-store-reader.mjs';
import { normalizePolicy } from '../policies/policy-normalizer.mjs';
import { applyPolicyToStore } from '../policies/policy-applier.mjs';
import { appendAuditLog } from '../audit/audit-log-writer.mjs';
import { validateLocalStore } from '../validators/local-store-validator.mjs';
import { runRenderFixture } from '../rendering/render-output-writer.mjs';
import { runMigrationDryRun } from '../migration/migration-dry-runner.mjs';
import { checkProviderCapabilities } from '../providers/provider-capability-checker.mjs';
import { runApplyPlanDryRun } from '../apply-plan/apply-plan-dry-runner.mjs';
import { runStagingExecution, runStagingReadback } from '../staging-execution/staging-apply-executor.mjs';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { packageRoot, resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';

export async function resolveExecutionPackageEvidence({ source, outputRoot }) {
  const evidenceRoot = path.join(outputRoot, 'evidence');
  await fs.mkdir(evidenceRoot, { recursive: true });
  const generatedAt = source.generatedAt ?? '2026-06-10T15:00:00.000Z';
  const sourceRoot = path.join(evidenceRoot, 'source');
  const sourceRelative = (name) => toPackageRelative(path.join(sourceRoot, name));
  const evidenceRelative = (name) => toPackageRelative(path.join(evidenceRoot, name));

  const scan = await runScan({
    fixturePath: source.fixtures?.tenantBundle ?? 'fixtures/tenant-bundle.fixture.json',
    outputPath: sourceRelative('tenant-bundle-scan'),
    overwrite: true,
    now: new Date(generatedAt)
  });
  await writeLocalStore({
    store: createEmptyLocalStore({
      tenantId: source.tenantKey,
      siteId: source.siteKey,
      now: new Date(generatedAt)
    }),
    outputPath: sourceRelative('local-store'),
    overwrite: true,
    now: new Date(generatedAt)
  });
  await mergeScanIntoStore({
    storePath: sourceRelative('local-store'),
    scanPath: sourceRelative('tenant-bundle-scan'),
    outputPath: sourceRelative('local-store-merged'),
    overwrite: true,
    now: new Date(generatedAt)
  });
  await writePolicyStore({
    storePath: sourceRelative('local-store-merged'),
    policyPath: source.fixtures?.policy ?? 'fixtures/policy-blocked-domain.fixture.json',
    outputPath: sourceRelative('local-store-policy'),
    generatedAt
  });
  await runRenderFixture({
    fixturePath: source.fixtures?.render ?? 'fixtures/render-active-links.fixture.json',
    storePath: sourceRelative('local-store-policy'),
    outputPath: sourceRelative('rendered'),
    overwrite: true,
    now: new Date(generatedAt)
  });

  const migration = await runMigrationDryRun({
    storePath: sourceRelative('local-store-policy'),
    renderedPath: sourceRelative('rendered'),
    profilePath: source.profiles?.migration ?? 'fixtures/migration-production-provider-profile.fixture.json',
    outputPath: evidenceRelative('migration'),
    overwrite: true
  });
  const providerCapability = await checkProviderCapabilities({
    profilePath: source.profiles?.stagingExecution ?? 'fixtures/staging-execution-profile.fixture.json',
    outputPath: evidenceRelative('provider-capability'),
    operation: 'phase-2h22-preflight-package-provider-check'
  });
  const applyPlan = await runApplyPlanDryRun({
    migrationPath: evidenceRelative('migration'),
    profilePath: source.profiles?.applyPlan ?? 'fixtures/provider-profile-staging-simulated.fixture.json',
    outputPath: evidenceRelative('apply-plan'),
    overwrite: true
  });
  const stagingExecution = await runStagingExecution({
    applyPlanPath: evidenceRelative('apply-plan'),
    profilePath: source.profiles?.stagingExecution ?? 'fixtures/staging-execution-profile.fixture.json',
    outputPath: evidenceRelative('staging-execution'),
    overwrite: true
  });
  const readback = await runStagingReadback({
    executionPath: evidenceRelative('staging-execution'),
    outputPath: evidenceRelative('readback')
  });

  if (source.omitBackupPreExecution === true) {
    await fs.rm(path.join(evidenceRoot, 'staging-execution', 'backup-pre-execution-verification.json'), { force: true });
  }

  await writeRuntimeQaEvidence({ source, evidenceRoot });

  return collectEvidenceSummary({
    source,
    evidenceRoot,
    scan,
    migration,
    providerCapability,
    applyPlan,
    stagingExecution,
    readback
  });
}

async function writePolicyStore({ storePath, policyPath, outputPath, generatedAt }) {
  const timestamp = generatedAt;
  const store = cloneStore(await readLocalStore(storePath));
  const rawPolicy = await readJson(resolveFixturePath(policyPath));
  const policy = normalizePolicy(rawPolicy, {
    tenantId: store.tenant_id,
    siteId: store.site_id,
    now: timestamp
  });
  const priorPolicyId = store.policiesEnvelope?.active_policy_id ?? null;
  const policyStore = {
    ...store,
    policies: [
      ...store.policies.filter((item) => item.id !== policy.id),
      policy
    ],
    policiesEnvelope: {
      ...(store.policiesEnvelope ?? {}),
      active_policy_id: policy.id
    }
  };
  const policyResult = applyPolicyToStore(policyStore, { now: timestamp });
  const audited = appendAuditLog(policyResult.store, {
    action: 'policy_set',
    recordType: 'outbound_link_policy',
    recordId: policy.id,
    actor: 'phase-2h22-local-package-builder',
    reason: 'set local outbound link policy for staging execution package preflight',
    before: { active_policy_id: priorPolicyId },
    after: {
      active_policy_id: policy.id,
      changed_links: policyResult.changedLinkCount,
      changed_instances: policyResult.changedInstanceCount
    },
    now: timestamp
  });
  await writeLocalStore({
    store: audited,
    outputPath,
    overwrite: true,
    now: timestamp
  });
  const validation = await validateLocalStore({ storePath: outputPath });
  if (validation.status !== 'passed') {
    throw new Error('local policy store validation failed');
  }
}

async function writeRuntimeQaEvidence({ source, evidenceRoot }) {
  const runtimeRoot = path.join(evidenceRoot, 'runtime-qa');
  await fs.mkdir(runtimeRoot, { recursive: true });
  if (source.runtimeQaPath) {
    const runtimeSourceRoot = resolveTmpOutputPath(source.runtimeQaPath);
    if (await pathExists(runtimeSourceRoot)) {
      await fs.cp(runtimeSourceRoot, runtimeRoot, { recursive: true, force: true });
    }
  }
  if (source.runtimeQaEvidence) {
    await writeJson(path.join(runtimeRoot, 'RUNTIME_QA_EVIDENCE.json'), {
      schemaVersion: '0.1.0',
      evidenceType: 'pumpkin-platform-runtime-qa-evidence-reference',
      ...source.runtimeQaEvidence,
      boundaries: {
        localOnly: true,
        protectedConfigReads: false,
        liveProviderWrites: false,
        cmsWrites: false,
        externalCrawling: false,
        azureMutations: false,
        deployment: false,
        searchConsoleIndexing: false,
        livePagePublication: false,
        ...(source.runtimeQaEvidence.boundaries ?? {})
      }
    });
  }
}

async function collectEvidenceSummary({ source, evidenceRoot, scan, migration, providerCapability, applyPlan, stagingExecution, readback }) {
  const migrationManifest = await readOptionalJson(path.join(evidenceRoot, 'migration', 'migration-manifest.json'));
  const applyPlanManifest = await readOptionalJson(path.join(evidenceRoot, 'apply-plan', 'apply-plan-manifest.json'));
  const stagingManifest = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'staging-execution-manifest.json'));
  const providerProfile = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'provider-profile.json'));
  const providerCapabilities = await readOptionalJson(path.join(evidenceRoot, 'provider-capability', 'provider-capabilities.json'));
  const providerState = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'provider-state-report.json'));
  const resourceRegistry = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'resource-registry-refresh-candidate.json'));
  const backupPreExecution = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'backup-pre-execution-verification.json'));
  const traceAuditRollback = await readOptionalJson(path.join(evidenceRoot, 'staging-execution', 'trace-audit-rollback-persistence.json'));
  const migrationRollback = await readOptionalJson(path.join(evidenceRoot, 'migration', 'ROLLBACK_PACKAGE.json'));
  const runtimeQa = await readOptionalJson(path.join(evidenceRoot, 'runtime-qa', 'RUNTIME_QA_EVIDENCE.json'))
    ?? await readOptionalJson(path.join(evidenceRoot, 'runtime-qa', 'ADMIN_RUNTIME_QA_RESULT.json'));

  return {
    evidenceRoot: toPackageRelative(evidenceRoot),
    tenantKey: source.tenantKey,
    siteKey: source.siteKey,
    migrationRunId: migrationManifest?.migrationRunId ?? migration.summary?.migrationRunId ?? null,
    applyPlanId: applyPlanManifest?.applyPlanId ?? applyPlan.summary?.applyPlanId ?? null,
    stagingExecutionRunId: stagingManifest?.stagingExecutionRunId ?? stagingExecution.summary?.stagingExecutionRunId ?? null,
    readbackRunId: stagingManifest?.readbackRunId ?? stagingExecution.summary?.readbackRunId ?? readback.summary?.readbackRunId ?? null,
    runtimeQaRunId: runtimeQa?.runtimeQaRunId ?? runtimeQa?.evidenceId ?? runtimeQa?.requestId ?? null,
    providerProfileId: providerProfile?.providerProfileId ?? providerCapabilities?.providerProfileId ?? null,
    providerMode: providerProfile?.providerMode ?? providerCapabilities?.providerMode ?? null,
    targetProvider: providerProfile?.targetProvider ?? null,
    expectedCounts: stagingManifest?.summary?.countsByEntity ?? {},
    totalRecords: stagingManifest?.summary?.totalExecutionRecords ?? 0,
    rollbackPlanId: firstRollbackPlanId({ migrationRollback, stagingExecution }),
    statuses: {
      scan: scan.scanResult ? 'passed' : 'unknown',
      migration: migration.validation?.status ?? migrationManifest?.status ?? 'unknown',
      applyPlan: applyPlan.validation?.status ?? applyPlanManifest?.status ?? 'unknown',
      stagingExecution: stagingExecution.validation?.status ?? stagingManifest?.status ?? 'unknown',
      readback: readback.result?.status ?? stagingManifest?.summary?.readbackStatus ?? 'unknown',
      providerCapability: providerCapability.status,
      providerState: providerState?.status ?? 'missing',
      resourceRegistry: resourceRegistry?.status ?? 'missing',
      backupPreExecution: backupPreExecution?.status ?? 'missing',
      traceAuditRollback: traceAuditRollback?.status ?? 'missing',
      runtimeQa: runtimeQa?.status ?? 'missing'
    },
    files: {
      migration: toPackageRelative(path.join(evidenceRoot, 'migration')),
      applyPlan: toPackageRelative(path.join(evidenceRoot, 'apply-plan')),
      stagingExecution: toPackageRelative(path.join(evidenceRoot, 'staging-execution')),
      readback: toPackageRelative(path.join(evidenceRoot, 'readback')),
      runtimeQa: toPackageRelative(path.join(evidenceRoot, 'runtime-qa')),
      providerCapability: toPackageRelative(path.join(evidenceRoot, 'provider-capability'))
    }
  };
}

function firstRollbackPlanId({ migrationRollback, stagingExecution }) {
  const migrationId = migrationRollback?.rollbackPlanId ?? migrationRollback?.id ?? null;
  if (migrationId) return migrationId;
  const counts = stagingExecution.summary?.countsByEntity ?? {};
  return counts.outbound_link_rollback_plans > 0 ? 'see-staging-execution-records' : null;
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

export function packageRelativeFromOutput(outputRoot, ...parts) {
  return toPackageRelative(path.join(outputRoot, ...parts));
}

export function repoRelativeFromPackage(relativePath) {
  return path.relative(path.resolve(packageRoot, '..', '..', '..', '..'), path.join(packageRoot, relativePath)).replaceAll('\\', '/');
}
