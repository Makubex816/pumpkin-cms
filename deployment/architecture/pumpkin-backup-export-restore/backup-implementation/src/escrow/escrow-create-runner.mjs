import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { assertPayloadRoundTrip, encryptEscrowPayload } from './envelope-encryptor.mjs';
import { writeEscrowApprovalRecord } from './escrow-approval-writer.mjs';
import { writeEscrowManifest } from './escrow-manifest-writer.mjs';
import { validateEscrowPolicyInputs } from './escrow-policy-validator.mjs';
import { writeEscrowNotice, writeEscrowValidationReports } from './escrow-report-writer.mjs';
import { validateEscrowOutput } from './escrow-validator.mjs';
import { createEphemeralRecipientKey } from './escrow-recipient-manager.mjs';
import { buildFakePayload, loadFakeEscrowRequest, selectFakeCatalogItems } from './fake-secret-catalog.mjs';

export async function createFakeEscrow({ requestPath, outputPath, overwrite = false, now = new Date() }) {
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`fake escrow output already exists; pass --overwrite to replace: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const createdAt = now.toISOString();
  const { request, policy, catalog, recipient } = await loadFakeEscrowRequest(requestPath);
  const selectedItems = selectFakeCatalogItems({ request, catalog });
  const policyValidation = validateEscrowPolicyInputs({ request, policy, catalog, recipient, selectedItems });
  if (policyValidation.status !== 'passed') {
    await fs.rm(outputRoot, { recursive: true, force: true });
    throw new Error(`fake escrow policy validation failed: ${policyValidation.failures.map((failure) => failure.code).join(', ')}`);
  }

  const payload = buildFakePayload({ request, selectedItems });
  const recipientKey = createEphemeralRecipientKey(recipient);
  const encrypted = encryptEscrowPayload({ payload, publicKey: recipientKey.publicKey });
  assertPayloadRoundTrip({
    payload,
    ciphertext: encrypted.ciphertext,
    encryptionMetadata: encrypted.metadata,
    privateKey: recipientKey.privateKey
  });

  await fs.writeFile(path.join(outputRoot, 'encrypted-payload.bin'), encrypted.ciphertext);
  await writeJson(path.join(outputRoot, 'recipient-metadata.json'), recipientKey.metadata);
  const approvalRecord = await writeEscrowApprovalRecord({ outputRoot, request, createdAt });
  const manifest = await writeEscrowManifest({
    outputRoot,
    request,
    policy,
    selectedItems,
    recipientMetadata: recipientKey.metadata,
    encryptionMetadata: encrypted.metadata,
    createdAt,
    roundTripVerified: true
  });
  await writeEscrowNotice({ outputRoot, createdAt });

  const validation = await validateEscrowOutput({ escrowPath: outputRoot });
  await writeEscrowValidationReports({ outputRoot, validation });
  if (validation.status !== 'passed') {
    throw new Error(`fake escrow output failed validation: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }

  return {
    outputRoot,
    manifest,
    approvalRecord,
    recipientMetadata: recipientKey.metadata,
    validation
  };
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
