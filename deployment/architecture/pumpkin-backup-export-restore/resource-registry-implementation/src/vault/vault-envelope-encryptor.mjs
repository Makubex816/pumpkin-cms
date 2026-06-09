import crypto from 'node:crypto';
import { stableStringify } from '../utils/json-writer.mjs';
import { sha256Buffer } from '../utils/file-hash.mjs';

export const vaultCryptoContractVersion = '0.1.0';
export const vaultAlgorithm = 'AES-256-GCM';
export const vaultKdf = Object.freeze({
  algorithm: 'scrypt',
  keyLength: 32,
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
});
const aad = Buffer.from('pumpkin-build-handoff-vault/v0.1.0', 'utf8');

export function encryptVaultPayload({ payload, passphrase }) {
  assertPassphrase(passphrase);
  const plaintext = Buffer.from(stableStringify(payload), 'utf8');
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext,
    metadata: {
      contractVersion: vaultCryptoContractVersion,
      algorithm: vaultAlgorithm,
      aad: aad.toString('base64'),
      kdf: {
        algorithm: vaultKdf.algorithm,
        N: vaultKdf.N,
        r: vaultKdf.r,
        p: vaultKdf.p,
        keyLength: vaultKdf.keyLength,
        salt: salt.toString('base64')
      },
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertextBytes: ciphertext.length,
      ciphertextSha256: sha256Buffer(ciphertext),
      plaintextBytes: plaintext.length,
      plaintextSha256: sha256Buffer(plaintext)
    }
  };
}

export function decryptVaultPayload({ ciphertext, manifest, passphrase }) {
  assertPassphrase(passphrase);
  const encryption = manifest.encryption;
  const salt = Buffer.from(encryption.kdf.salt, 'base64');
  const iv = Buffer.from(encryption.iv, 'base64');
  const authTag = Buffer.from(encryption.authTag, 'base64');
  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(encryption.aad, 'base64'));
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, vaultKdf.keyLength, {
    N: vaultKdf.N,
    r: vaultKdf.r,
    p: vaultKdf.p,
    maxmem: vaultKdf.maxmem
  });
}

function assertPassphrase(passphrase) {
  if (!passphrase || typeof passphrase !== 'string') {
    throw new Error('vault passphrase is required');
  }
}
