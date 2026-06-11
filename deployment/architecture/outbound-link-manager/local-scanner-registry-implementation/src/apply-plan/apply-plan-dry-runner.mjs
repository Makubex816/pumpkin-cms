import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath, toPackageRelative } from '../utils/safe-paths.mjs';
import { productionEntities, productionRecordFiles } from '../migration/target-entity-router.mjs';
import { validateProviderProfile } from '../providers/provider-profile-validator.mjs';
import { redactedProviderProfile } from '../providers/provider-capability-checker.mjs';
import { StagingSimulatedProvider } from '../providers/staging-simulated-provider.mjs';
import { writeProviderBoundaryReport } from '../providers/provider-boundary-report-writer.mjs';
import { createApplyPlanId } from './apply-plan-record-mapper.mjs';
import { validateTraceContinuity } from './trace-continuity-validator.mjs';
import { writeApplyPlanResourceRegistryIntegration } from './resource-registry-integration-writer.mjs';
import { writeBackupCheckIntegration } from './backup-check-integration-writer.mjs';
import { validateRollbackIntegration } from './rollback-integration-validator.mjs';
import { validateApplyPlan } from './apply-plan-validator.mjs';

export async function runApplyPlanDryRun({
  migrationPath,
  profilePath,
  outputPath,
  overwrite = false
}) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`apply-plan output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
  const migration = await readMigrationDryRun(migrationPath);
  const rawProfile = await readJson(resolveFixturePath(profilePath));
  const profileValidation = validateProviderProfile(rawProfile);
  const profile = profileValidation.profile;
  const applyPlanId = createApplyPlanId({
    migrationRunId: migration.manifest.migrationRunId,
    profile,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey
  });
  const provider = new StagingSimulatedProvider({ profile });
  const planned = provider.planApply({ migration });
  const capabilityReport = {
    schemaVersion: '0.1.0',
    reportType: 'pumpkin-outbound-link-provider-capability-check',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    operation: 'apply-plan-dry-run',
    status: profileValidation.status === 'passed' && planned.capabilityReport.gate.allowed ? 'passed' : 'blocked',
    validation: profileValidation,
    gate: planned.capabilityReport.gate,
    capabilities: profile.capabilities,
    boundaries: profile.boundaries,
    summary: {
      canPlanWrites: profile.capabilities.canPlanWrites,
      canSimulateWrites: profile.capabilities.canSimulateWrites,
      canPerformLiveWrites: false,
      canReadLive: profile.capabilities.canReadLive,
      liveWriteAllowed: false,
      productionWriteAllowed: false
    }
  };
  await writeJson(path.join(outputRoot, 'provider-profile.json'), redactedProviderProfile(profile));
  await writeJson(path.join(outputRoot, 'provider-capabilities.json'), capabilityReport);
  await writeProviderBoundaryReport({ outputRoot, profile, capabilityReport });

  if (profileValidation.status !== 'passed' || !planned.capabilityReport.gate.allowed) {
    const validation = await writeBlockedApplyPlan({
      outputRoot,
      applyPlanId,
      migration,
      profile,
      capabilityReport,
      blockReason: profileValidation.status !== 'passed' ? 'provider profile validation failed' : planned.capabilityReport.gate.message
    });
    return summaryResult({ outputRoot, applyPlanId, migration, profile, records: [], validation, status: 'blocked' });
  }

  const records = planned.records;
  await writeJson(path.join(outputRoot, 'apply-plan-records.json'), {
    schemaVersion: '0.1.0',
    collectionType: 'pumpkin-outbound-link-apply-plan-records',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    records,
    boundaries: {
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  });
  const traceContinuity = validateTraceContinuity({ migration, applyPlanRecords: records });
  await writeJson(path.join(outputRoot, 'trace-continuity-result.json'), traceContinuity);
  const resourceRegistry = await writeApplyPlanResourceRegistryIntegration({ outputRoot, migration, profile, applyPlanId });
  const backupCheck = await writeBackupCheckIntegration({ outputRoot, migration, profile, applyPlanId });
  const rollbackIntegration = await validateRollbackIntegration({ outputRoot, migration, applyPlanRecords: records, applyPlanId, profile });
  const manifest = await writeApplyPlanManifest({
    outputRoot,
    applyPlanId,
    migration,
    profile,
    records,
    integrations: { traceContinuity, resourceRegistry, backupCheck, rollbackIntegration }
  });
  const validation = await validateApplyPlan({ applyPlanPath: outputPath });
  return {
    outputRoot,
    applyPlanId,
    manifest,
    records,
    validation,
    providerProfile: profile,
    capabilityReport,
    traceContinuity,
    resourceRegistry,
    backupCheck,
    rollbackIntegration,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      applyPlanId,
      status: validation.status,
      providerProfileId: profile.providerProfileId,
      providerMode: profile.providerMode,
      recordCount: records.length
    }
  };
}

export async function inspectApplyPlan({ applyPlanPath }) {
  const root = resolveTmpOutputPath(applyPlanPath);
  const manifest = await readJson(path.join(root, 'apply-plan-manifest.json'));
  const validation = await readJson(path.join(root, 'VALIDATION_RESULT.json'));
  return {
    applyPlanPath: toPackageRelative(root),
    applyPlanId: manifest.applyPlanId,
    migrationRunId: manifest.migrationRunId,
    providerProfileId: manifest.providerProfileId,
    providerMode: manifest.providerMode,
    status: validation.status,
    recordCount: manifest.summary.totalApplyPlanRecords,
    failureCount: validation.summary.failureCount
  };
}

async function readMigrationDryRun(migrationPath) {
  const root = resolveTmpOutputPath(migrationPath);
  const recordsByEntity = {};
  for (const entity of productionEntities) {
    const envelope = await readJson(path.join(root, productionRecordFiles[entity]));
    recordsByEntity[entity] = envelope.records ?? [];
  }
  return {
    root,
    manifest: await readJson(path.join(root, 'migration-manifest.json')),
    validation: await readJson(path.join(root, 'VALIDATION_RESULT.json')),
    resourceRegistryCandidate: await readOptionalJson(path.join(root, 'RESOURCE_REGISTRY_UPDATE_CANDIDATE.json')),
    backupRequirements: await readOptionalJson(path.join(root, 'BACKUP_BEFORE_MIGRATION_REQUIREMENTS.json')),
    rollbackPackage: await readOptionalJson(path.join(root, 'ROLLBACK_PACKAGE.json')),
    recordsByEntity
  };
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function writeApplyPlanManifest({ outputRoot, applyPlanId, migration, profile, records, integrations }) {
  const countsByEntity = Object.fromEntries(productionEntities.map((entity) => [
    entity,
    records.filter((record) => record.targetEntity === entity).length
  ]));
  const manifest = {
    schemaVersion: '0.1.0',
    manifestType: 'pumpkin-outbound-link-apply-plan-dry-run-manifest',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    generatedAt: profile.generatedAt ?? migration.manifest.generatedAt ?? '2026-06-10T00:00:00.000Z',
    summary: {
      totalApplyPlanRecords: records.length,
      countsByEntity,
      traceContinuityStatus: integrations.traceContinuity.status,
      backupCheckStatus: integrations.backupCheck.status,
      rollbackIntegrationStatus: integrations.rollbackIntegration.status
    },
    files: [
      'apply-plan-records.json',
      'provider-profile.json',
      'provider-capabilities.json',
      'provider-boundary-report.json',
      'trace-continuity-result.json',
      'resource-registry-update-candidate.json',
      'backup-center-pre-migration-check.json',
      'rollback-integration-result.json'
    ],
    boundaries: {
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false
    }
  };
  await writeJson(path.join(outputRoot, 'apply-plan-manifest.json'), manifest);
  return manifest;
}

async function writeBlockedApplyPlan({ outputRoot, applyPlanId, migration, profile, capabilityReport, blockReason }) {
  await writeJson(path.join(outputRoot, 'apply-plan-records.json'), {
    schemaVersion: '0.1.0',
    collectionType: 'pumpkin-outbound-link-apply-plan-records',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    records: [],
    blocked: true,
    blockReason
  });
  const blockedResult = {
    schemaVersion: '0.1.0',
    status: 'blocked',
    failures: [{ code: capabilityReport.gate.code, message: blockReason, path: 'providerMode' }],
    summary: { failureCount: 1 }
  };
  await writeJson(path.join(outputRoot, 'trace-continuity-result.json'), blockedResult);
  await writeJson(path.join(outputRoot, 'resource-registry-update-candidate.json'), {
    schemaVersion: '0.1.0',
    status: 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    boundaries: { registryWritePerformed: false, liveProviderWrites: false, secretValuesIncluded: false }
  });
  await writeJson(path.join(outputRoot, 'backup-center-pre-migration-check.json'), {
    schemaVersion: '0.1.0',
    status: 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    boundaries: { backupCreated: false, liveProviderWrites: false }
  });
  await writeJson(path.join(outputRoot, 'rollback-integration-result.json'), {
    schemaVersion: '0.1.0',
    status: 'blocked',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    boundaries: { rollbackExecuted: false, liveProviderWrites: false }
  });
  await writeJson(path.join(outputRoot, 'apply-plan-manifest.json'), {
    schemaVersion: '0.1.0',
    manifestType: 'pumpkin-outbound-link-apply-plan-dry-run-manifest',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    tenantKey: migration.manifest.tenantKey,
    siteKey: migration.manifest.siteKey,
    status: 'blocked',
    blockReason,
    summary: {
      totalApplyPlanRecords: 0,
      countsByEntity: Object.fromEntries(productionEntities.map((entity) => [entity, 0]))
    },
    boundaries: {
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  });
  const validation = {
    schemaVersion: '0.1.0',
    validationType: 'pumpkin-outbound-link-apply-plan-validation',
    status: 'blocked',
    applyPlanId,
    migrationRunId: migration.manifest.migrationRunId,
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    summary: {
      applyPlanRecordCount: 0,
      failureCount: 1
    },
    failures: [{ code: capabilityReport.gate.code, message: blockReason, path: 'providerMode' }],
    boundaries: {
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false
    }
  };
  await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), validation);
  await fs.writeFile(path.join(outputRoot, 'VALIDATION_RESULT.md'), `# Apply-Plan Validation

Status: blocked

Apply plan: ${applyPlanId}

Provider mode: ${profile.providerMode}

Block reason: ${blockReason}

Boundary: no live writes were attempted.
`, 'utf8');
  return validation;
}

function summaryResult({ outputRoot, applyPlanId, migration, profile, records, validation, status }) {
  return {
    outputRoot,
    applyPlanId,
    records,
    validation,
    providerProfile: profile,
    summary: {
      outputPath: toPackageRelative(outputRoot),
      applyPlanId,
      status,
      providerProfileId: profile.providerProfileId,
      providerMode: profile.providerMode,
      recordCount: records.length,
      migrationRunId: migration.manifest.migrationRunId
    }
  };
}
