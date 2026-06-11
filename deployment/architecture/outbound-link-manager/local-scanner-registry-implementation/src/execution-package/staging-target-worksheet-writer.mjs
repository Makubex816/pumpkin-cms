import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeStagingTargetWorksheet({ outputRoot, source, evidence }) {
  const target = source.stagingTarget ?? {};
  const worksheet = `# Staging Target Worksheet

Status: future approval required before any real staging-provider write.

Tenant/site:

- tenantKey: \`${evidence.tenantKey}\`
- siteKey: \`${evidence.siteKey}\`

Target provider placeholders:

- provider profile ID: \`${evidence.providerProfileId}\`
- provider mode: \`${evidence.providerMode}\`
- provider type: \`${target.providerType ?? evidence.targetProvider?.providerType ?? 'future-staging-provider'}\`
- environment: \`${target.environment ?? 'staging'}\`
- account reference: \`${target.accountReference ?? 'TBD-non-secret-staging-account-reference'}\`
- database name: \`${target.databaseName ?? evidence.targetProvider?.databaseName ?? 'TBD-non-secret-database-name'}\`
- partition key: \`${target.partitionKey ?? evidence.targetProvider?.partitionKey ?? '/tenantKey'}\`
- credential reference ID: \`${target.credentialReferenceId ?? 'TBD-credential-reference-id-no-values'}\`
- credential values included: \`false\`

Pre-write note: this worksheet contains non-secret identifiers and placeholders only. It is not approval to write.
`;
  await writeText(path.join(outputRoot, 'STAGING_TARGET_WORKSHEET.md'), worksheet);
  return {
    status: 'passed',
    providerProfileId: evidence.providerProfileId,
    providerMode: evidence.providerMode,
    targetProvider: {
      providerType: target.providerType ?? evidence.targetProvider?.providerType ?? 'future-staging-provider',
      environment: target.environment ?? 'staging',
      partitionKey: target.partitionKey ?? evidence.targetProvider?.partitionKey ?? '/tenantKey',
      credentialValueIncluded: false
    }
  };
}

export async function writeProviderCapabilityReview({ outputRoot, evidence }) {
  const text = `# Provider Capability Review

Status: ${evidence.statuses.providerCapability}

- provider profile ID: \`${evidence.providerProfileId}\`
- provider mode: \`${evidence.providerMode}\`
- can perform live writes in this package: \`false\`
- production database migration ready: \`false\`
- protected config reads: \`false\`
- Azure/CMS/API mutation: \`false\`

This package reviews capability evidence for a future first scoped staging-provider write. It does not perform that write.
`;
  await writeText(path.join(outputRoot, 'PROVIDER_CAPABILITY_REVIEW.md'), text);
}

export async function writeResourceRegistryReview({ outputRoot, evidence }) {
  const text = `# Resource Registry Review

Status: ${evidence.statuses.resourceRegistry}

The Resource Registry refresh candidate was generated from local/staging-simulated evidence.

- provider profile ID: \`${evidence.providerProfileId}\`
- provider mode: \`${evidence.providerMode}\`
- tenantKey: \`${evidence.tenantKey}\`
- siteKey: \`${evidence.siteKey}\`
- record count: ${evidence.totalRecords}
- secret values included: \`false\`
- registry write performed: \`false\`
`;
  await writeText(path.join(outputRoot, 'RESOURCE_REGISTRY_REVIEW.md'), text);
}

export async function writeBackupCenterPreExecutionReview({ outputRoot, evidence }) {
  const text = `# Backup Center Pre-Execution Review

Status: ${evidence.statuses.backupPreExecution}

Backup Center remains the safety foundation before any real provider write.

- applyPlanId: \`${evidence.applyPlanId}\`
- stagingExecutionRunId: \`${evidence.stagingExecutionRunId}\`
- live backup export performed: \`false\`
- backup created by this package: \`false\`
- future first write requires explicit Backup Center approval evidence.
`;
  await writeText(path.join(outputRoot, 'BACKUP_CENTER_PRE_EXECUTION_REVIEW.md'), text);
}

async function writeText(filePath, text) {
  await writeJson(`${filePath}.json`, {
    schemaVersion: '0.1.0',
    sourceMarkdownFile: path.basename(filePath),
    status: 'passed'
  });
  const fs = await import('node:fs/promises');
  await fs.writeFile(filePath, text, 'utf8');
}
