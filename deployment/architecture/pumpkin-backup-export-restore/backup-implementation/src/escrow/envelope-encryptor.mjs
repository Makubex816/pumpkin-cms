import crypto from 'node:crypto';

export function encryptEscrowPayload({ payload, publicKey }) {
  const contentKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const cipher = crypto.createCipheriv('aes-256-gcm', contentKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const wrappedContentKey = crypto.publicEncrypt(
    {
      key: publicKey,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    contentKey
  );
  const encryptedPayloadSha256 = crypto.createHash('sha256').update(ciphertext).digest('hex');

  contentKey.fill(0);

  return {
    ciphertext,
    metadata: {
      schemaVersion: '0.1.0',
      fakeOnly: true,
      payloadFormat: 'binary',
      contentEncryption: {
        algorithm: 'AES-256-GCM',
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
      },
      keyWraps: [
        {
          algorithm: 'RSA-OAEP-256',
          wrappedContentKey: wrappedContentKey.toString('base64')
        }
      ],
      encryptedPayloadSha256,
      plaintextBytes: plaintext.byteLength,
      ciphertextBytes: ciphertext.byteLength
    }
  };
}

export function assertPayloadRoundTrip({ payload, ciphertext, encryptionMetadata, privateKey }) {
  const wrap = encryptionMetadata.keyWraps[0];
  const contentKey = crypto.privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from(wrap.wrappedContentKey, 'base64')
  );
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    contentKey,
    Buffer.from(encryptionMetadata.contentEncryption.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(encryptionMetadata.contentEncryption.authTag, 'base64'));
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  contentKey.fill(0);
  const parsed = JSON.parse(decrypted.toString('utf8'));
  if (JSON.stringify(parsed) !== JSON.stringify(payload)) {
    throw new Error('fake escrow round-trip validation failed');
  }
}
