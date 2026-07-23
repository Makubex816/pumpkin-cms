import { sha256 } from './canonical.mjs';
import { assertSafeArtifactPath } from './security.mjs';

export function createDeterministicTar(inputFiles) {
  const files = inputFiles
    .map((file) => ({
      path: assertSafeArtifactPath(file.path),
      content: Buffer.isBuffer(file.content) ? Buffer.from(file.content) : Buffer.from(String(file.content), 'utf8'),
    }))
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));

  const chunks = [];
  for (const file of files) {
    const header = Buffer.alloc(512, 0);
    writeText(header, file.path, 0, 100);
    writeOctal(header, 0o644, 100, 8);
    writeOctal(header, 0, 108, 8);
    writeOctal(header, 0, 116, 8);
    writeOctal(header, file.content.length, 124, 12);
    writeOctal(header, 0, 136, 12);
    header.fill(0x20, 148, 156);
    header[156] = '0'.charCodeAt(0);
    writeText(header, 'ustar', 257, 6);
    writeText(header, '00', 263, 2);
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    writeChecksum(header, checksum);
    chunks.push(header, file.content);
    const padding = (512 - (file.content.length % 512)) % 512;
    if (padding > 0) chunks.push(Buffer.alloc(padding, 0));
  }
  chunks.push(Buffer.alloc(1024, 0));
  return Buffer.concat(chunks);
}

export function fileInventory(files) {
  return files
    .map((file) => {
      const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(String(file.content), 'utf8');
      return {
        path: assertSafeArtifactPath(file.path),
        bytes: content.length,
        sha256: sha256(content),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

export function readDeterministicTarInventory(bytes) {
  const input = Buffer.from(bytes);
  const inventory = [];
  let offset = 0;
  while (offset + 512 <= input.length) {
    const header = input.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const path = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const sizeText = header.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim();
    const size = Number.parseInt(sizeText || '0', 8);
    const contentStart = offset + 512;
    const content = input.subarray(contentStart, contentStart + size);
    inventory.push({ path, bytes: size, sha256: sha256(content) });
    offset = contentStart + size + ((512 - (size % 512)) % 512);
  }
  return inventory;
}

function writeText(buffer, value, offset, length) {
  const encoded = Buffer.from(value, 'utf8');
  if (encoded.length > length) throw new Error(`TAR field is too long: ${value}`);
  encoded.copy(buffer, offset);
}

function writeOctal(buffer, value, offset, length) {
  const text = Math.max(0, value).toString(8).padStart(length - 1, '0').slice(-(length - 1));
  buffer.write(text, offset, length - 1, 'ascii');
  buffer[offset + length - 1] = 0;
}

function writeChecksum(buffer, checksum) {
  const text = checksum.toString(8).padStart(6, '0').slice(-6);
  buffer.write(text, 148, 6, 'ascii');
  buffer[154] = 0;
  buffer[155] = 0x20;
}
