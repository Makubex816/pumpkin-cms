import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeEscrowManifest({
  outputRoot,
  request,
  policy,
  selectedItems,
  recipientMetadata,
  encryptionMetadata,
  createdAt,
  roundTripVerified
}) {
  const manifest = {
    schemaVersion: '0.1.0',
    escrowManifestVersion: '0.1.0',
    requestId: request.requestId,
    fakeOnly: true,
    mode: request.mode,
    createdAt,
    createdBy: 'local-prototype',
    policyId: policy.policyId,
    itemCount: selectedItems.length,
    categories: [...new Set(selectedItems.map((item) => item.category))].sort(),
    approvalRecordPath: 'escrow-approval-record.json',
    recipientMetadataPath: 'recipient-metadata.json',
    encryptedPayloadPath: 'encrypted-payload.bin',
    fakeOnlyNoticePath: 'ESCROW_FAKE_ONLY_NOTICE.md',
    encryption: encryptionMetadata,
    recipients: [
      {
        recipientId: recipientMetadata.recipientId,
        algorithm: recipientMetadata.algorithm,
        publicKeyFingerprint: recipientMetadata.publicKeyFingerprint,
        privateKeyPersistence: recipientMetadata.privateKeyPersistence
      }
    ],
    roundTripVerified,
    boundaries: {
      realSecretExport: false,
      protectedConfigRead: false,
      productionEscrowPayload: false,
      privateKeyWritten: false,
      externalSystemsChanged: false
    }
  };
  await writeJson(path.join(outputRoot, 'escrow-manifest.json'), manifest);
  return manifest;
}
