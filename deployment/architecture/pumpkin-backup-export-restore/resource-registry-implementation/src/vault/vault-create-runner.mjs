import fs from 'node:fs/promises';
import path from 'node:path';
import { writeChecksums } from '../handoff/checksum-writer.mjs';
import { collectSessionEnvPresence, collectSessionVaultInputs } from '../env/session-env-collector.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { encryptVaultPayload } from './vault-envelope-encryptor.mjs';
import { buildVaultManifest, writeRecipientMetadata, writeVaultApprovalRecord, writeVaultManifest } from './vault-manifest-writer.mjs';
import { validateVaultOutput } from './vault-validator.mjs';

export async function createFakeVault({ requestPath, outputPath, overwrite = false, now = new Date() }) {
  const fixturePath = resolveFixturePath(requestPath);
  const request = await readJson(fixturePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  await prepareOutputRoot(outputRoot, overwrite);
  const passphrase = request.fakePassphraseMaterial;
  const items = (request.items ?? []).map((item) => ({
    credentialRefId: item.credentialRefId,
    envName: item.envName,
    category: item.category,
    value: item.sampleMaterial,
    fakeOnly: true
  }));
  const result = await writeVault({
    outputRoot,
    mode: 'fake-local-test',
    fakeOnly: true,
    passphrase,
    items,
    excludedItems: request.excludedItems ?? [],
    now
  });
  result.validation = await validateVaultOutput({ vaultPath: outputPath, passphrase });
  return result;
}

export async function createSessionVault({ outputPath, env = process.env, overwrite = false, now = new Date() }) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  await prepareOutputRoot(outputRoot, overwrite);
  const inputs = collectSessionVaultInputs(env);
  const envPresence = collectSessionEnvPresence(env);
  if (!inputs.passphrasePresent || inputs.eligibleItems.length === 0) {
    const blocker = {
      schemaVersion: '0.1.0',
      generatedAt: now.toISOString(),
      status: 'blocked',
      valuesIncluded: false,
      blockerCodes: [
        ...(!inputs.passphrasePresent ? ['PUMPKIN_HANDOFF_VAULT_PASSPHRASE_MISSING'] : []),
        ...(inputs.eligibleItems.length === 0 ? ['ROLLER_RINK_RENTALS_API_KEY_MISSING'] : [])
      ],
      envPresence,
      protectedConfigRead: false,
      externalSystemsTouched: false,
      plaintextCredentialFilesWritten: false
    };
    await writeJson(path.join(outputRoot, 'session-vault-blocker.json'), blocker);
    await fs.writeFile(
      path.join(outputRoot, 'SESSION_VAULT_BLOCKED.md'),
      renderSessionVaultBlockedMarkdown(blocker),
      'utf8'
    );
    return {
      outputRoot,
      status: 'blocked',
      blocker
    };
  }
  const result = await writeVault({
    outputRoot,
    mode: 'session-env-bootstrap',
    fakeOnly: false,
    passphrase: inputs.passphrase,
    items: inputs.eligibleItems,
    excludedItems: inputs.excludedItems,
    now
  });
  result.validation = await validateVaultOutput({ vaultPath: outputPath, passphrase: inputs.passphrase });
  return result;
}

async function writeVault({ outputRoot, mode, fakeOnly, passphrase, items, excludedItems, now }) {
  const payload = {
    schemaVersion: '0.1.0',
    payloadType: 'pumpkin-build-handoff-vault-payload',
    generatedAt: now.toISOString(),
    mode,
    fakeOnly,
    valuesIncluded: true,
    items: items.map((item) => ({
      credentialRefId: item.credentialRefId,
      envName: item.envName,
      category: item.category,
      value: item.value,
      valueEncoding: 'utf8',
      durable: item.category === 'durable-api-key',
      cleanupRequiredAfterBuild: true
    })),
    excludedItems: excludedItems.map((item) => ({
      credentialRefId: item.credentialRefId,
      envName: item.envName,
      category: item.category,
      presence: item.presence ?? 'UNKNOWN',
      excludedReason: item.excludedReason ?? 'excluded by policy',
      valueIncluded: false
    })),
    boundaries: {
      protectedConfigRead: false,
      externalSystemsTouched: false,
      plaintextCredentialFilesWritten: false,
      sessionJwtDurableEscrow: false
    }
  };
  const encrypted = encryptVaultPayload({ payload, passphrase });
  await fs.writeFile(path.join(outputRoot, 'encrypted-payload.bin'), encrypted.ciphertext);
  const manifest = buildVaultManifest({
    mode,
    fakeOnly,
    itemCount: items.length,
    excludedItemCount: excludedItems.length,
    encryption: encrypted.metadata,
    now
  });
  await writeVaultManifest({ outputRoot, manifest });
  await writeVaultApprovalRecord({
    outputRoot,
    mode,
    fakeOnly,
    allowedEnvNames: items.map((item) => item.envName),
    excludedEnvNames: excludedItems.map((item) => item.envName),
    now
  });
  await writeRecipientMetadata({ outputRoot, mode, fakeOnly, now });
  await fs.writeFile(path.join(outputRoot, 'VAULT_README.md'), renderVaultReadme({ manifest }), 'utf8');
  await writeChecksums({ root: outputRoot });
  return {
    outputRoot,
    manifest
  };
}

function renderVaultReadme({ manifest }) {
  return `# Encrypted Handoff Vault

Mode: ${manifest.mode}

This folder contains an AES-256-GCM encrypted payload and public metadata only.
No passphrase, decrypted payload, plaintext credential file, protected config, or session JWT durable escrow is included.
`;
}

function renderSessionVaultBlockedMarkdown(blocker) {
  return `# Session Vault Blocked

Status: ${blocker.status}

Blockers:

${blocker.blockerCodes.map((code) => `- ${code}`).join('\n')}

No plaintext credential file was created.
`;
}

async function prepareOutputRoot(outputRoot, overwrite) {
  if (overwrite) {
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });
}
