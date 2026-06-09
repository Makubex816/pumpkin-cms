import { writeJson } from '../utils/json-writer.mjs';
import path from 'node:path';

export const vaultManifestContractVersion = '0.1.0';

export function buildVaultManifest({ mode, itemCount, excludedItemCount, encryption, now = new Date(), fakeOnly = false }) {
  return {
    schemaVersion: vaultManifestContractVersion,
    manifestType: 'pumpkin-build-handoff-vault',
    generatedAt: now.toISOString(),
    mode,
    fakeOnly,
    valuesIncluded: false,
    plaintextCredentialFilesWritten: false,
    protectedConfigRead: false,
    externalSystemsTouched: false,
    sessionJwtDurableEscrow: false,
    itemCount,
    excludedItemCount,
    encryption,
    boundaries: {
      outputLocation: 'ignored-.tmp-only',
      passphraseStored: false,
      decryptedPayloadPrinted: false,
      sessionJwtExcluded: true,
      protectedConfigRead: false,
      externalCalls: false
    }
  };
}

export async function writeVaultManifest({ outputRoot, manifest }) {
  const manifestPath = path.join(outputRoot, 'vault-manifest.json');
  await writeJson(manifestPath, manifest);
  return manifestPath;
}

export async function writeVaultApprovalRecord({ outputRoot, mode, allowedEnvNames, excludedEnvNames, now = new Date(), fakeOnly = false }) {
  const approvalPath = path.join(outputRoot, 'approval-record.json');
  await writeJson(approvalPath, {
    schemaVersion: '0.1.0',
    approvalId: mode === 'session-env-bootstrap' ? 'phase-2f-12m-approved-local-env-bootstrap' : 'phase-2f-12m-fake-local-test',
    generatedAt: now.toISOString(),
    mode,
    fakeOnly,
    approvedUse: 'local encrypted handoff vault under ignored .tmp output only',
    approvedCredentialSources: allowedEnvNames,
    excludedCredentialSources: excludedEnvNames,
    plaintextCredentialFilesApproved: false,
    protectedConfigReadApproved: false,
    externalCallsApproved: false,
    durableSessionJwtEscrowApproved: false
  });
  return approvalPath;
}

export async function writeRecipientMetadata({ outputRoot, mode, now = new Date(), fakeOnly = false }) {
  const recipientPath = path.join(outputRoot, 'recipient-metadata.json');
  await writeJson(recipientPath, {
    schemaVersion: '0.1.0',
    generatedAt: now.toISOString(),
    mode,
    fakeOnly,
    recipientModel: 'local-operator-passphrase',
    passphraseSource: mode === 'session-env-bootstrap'
      ? 'process-env:PUMPKIN_HANDOFF_VAULT_PASSPHRASE'
      : 'fake-request-test-material',
    passphraseStored: false,
    privateKeyWritten: false,
    decryptedPayloadPrinted: false
  });
  return recipientPath;
}
