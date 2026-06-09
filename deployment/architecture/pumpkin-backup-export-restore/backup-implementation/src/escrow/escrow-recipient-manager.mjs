import crypto from 'node:crypto';

export function createEphemeralRecipientKey(recipient) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicExponent: 0x10001
  });
  const publicKeyJwk = publicKey.export({ format: 'jwk' });
  const publicKeyFingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify(publicKeyJwk))
    .digest('hex');

  return {
    publicKey,
    privateKey,
    metadata: {
      schemaVersion: '0.1.0',
      recipientId: recipient.recipientId,
      displayName: recipient.displayName,
      fakeOnly: true,
      keyUse: recipient.keyUse,
      publicKeySource: 'generated-at-runtime',
      privateKeyPersistence: 'not-written',
      algorithm: 'RSA-OAEP-256',
      publicKeyFingerprint,
      publicKeyJwk
    }
  };
}
