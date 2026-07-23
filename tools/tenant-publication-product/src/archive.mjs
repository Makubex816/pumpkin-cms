import { sha256 } from './canonical.mjs';
import {
  assertNoArtifactPathCollisions,
  assertSafeArtifactPath,
} from './security.mjs';

export function createDeterministicTar(inputFiles) {
  const files = inputFiles
    .map((file) => ({
      path: assertSafeArtifactPath(file.path),
      content: Buffer.isBuffer(file.content) ? Buffer.from(file.content) : Buffer.from(String(file.content), 'utf8'),
    }))
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));

  const expected = fileInventory(files);
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
  const output = Buffer.concat(chunks);
  const observed = readDeterministicTarInventory(output);
  if (!inventoriesEqual(expected, observed)) {
    throw new Error('Deterministic TAR inventory does not match its source inventory.');
  }
  return output;
}

export function fileInventory(files) {
  const inventory = files
    .map((file) => {
      const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(String(file.content), 'utf8');
      return {
        path: assertSafeArtifactPath(file.path),
        bytes: content.length,
        sha256: sha256(content),
      };
    });
  assertNoArtifactPathCollisions(
    inventory.map((item) => item.path),
    'inventory paths',
  );
  return inventory.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

export function readDeterministicTarInventory(bytes) {
  const input = Buffer.from(bytes);
  const inventory = [];
  const seen = new Set();
  let offset = 0;
  let terminated = false;
  let previousPath = null;
  while (offset + 512 <= input.length) {
    const header = input.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      if (
        offset + 1024 !== input.length ||
        !input.subarray(offset, offset + 1024).every((byte) => byte === 0)
      ) {
        throw new Error('TAR trailer is malformed.');
      }
      terminated = true;
      break;
    }
    validateHeaderChecksum(header);
    const path = readNullTerminatedText(header.subarray(0, 100), 'TAR path');
    assertSafeArtifactPath(path, 'TAR path');
    if (seen.has(path)) throw new Error(`Duplicate TAR path: ${path}`);
    if (
      previousPath !== null &&
      previousPath.localeCompare(path, 'en') >= 0
    ) {
      throw new Error(`TAR paths are not in canonical order: ${path}`);
    }
    seen.add(path);
    previousPath = path;
    const size = readCanonicalOctal(header.subarray(124, 136), 'TAR size');
    if (header[156] !== '0'.charCodeAt(0)) {
      throw new Error(`Unsupported TAR entry type for ${path}.`);
    }
    if (
      readCanonicalOctal(header.subarray(100, 108), 'TAR mode') !== 0o644 ||
      readCanonicalOctal(header.subarray(108, 116), 'TAR uid') !== 0 ||
      readCanonicalOctal(header.subarray(116, 124), 'TAR gid') !== 0 ||
      readCanonicalOctal(header.subarray(136, 148), 'TAR mtime') !== 0 ||
      header.subarray(257, 263).toString('binary') !== 'ustar\0' ||
      header.subarray(263, 265).toString('ascii') !== '00' ||
      !header.subarray(157, 257).every((byte) => byte === 0) ||
      !header.subarray(265, 512).every((byte) => byte === 0)
    ) {
      throw new Error(`TAR entry metadata is not deterministic: ${path}`);
    }
    const contentStart = offset + 512;
    if (contentStart + size > input.length) {
      throw new Error(`TAR entry exceeds archive bounds: ${path}`);
    }
    const content = input.subarray(contentStart, contentStart + size);
    inventory.push({ path, bytes: size, sha256: sha256(content) });
    const padding = (512 - (size % 512)) % 512;
    const paddingStart = contentStart + size;
    if (!input.subarray(paddingStart, paddingStart + padding).every((byte) => byte === 0)) {
      throw new Error(`TAR entry padding is not zero-filled: ${path}`);
    }
    offset = paddingStart + padding;
  }
  if (!terminated) throw new Error('TAR archive is missing its zero trailer.');
  assertNoArtifactPathCollisions(
    inventory.map((item) => item.path),
    'TAR paths',
  );
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

function validateHeaderChecksum(header) {
  const expected = readCanonicalOctal(
    header.subarray(148, 156),
    'TAR checksum',
    { checksum: true },
  );
  const copy = Buffer.from(header);
  copy.fill(0x20, 148, 156);
  const actual = copy.reduce((sum, byte) => sum + byte, 0);
  if (actual !== expected) throw new Error('TAR header checksum mismatch.');
}

function readNullTerminatedText(field, label) {
  const terminator = field.indexOf(0);
  if (terminator <= 0) throw new Error(`${label} is not canonically NUL-terminated.`);
  if (!field.subarray(terminator).every((byte) => byte === 0)) {
    throw new Error(`${label} contains data after its NUL terminator.`);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(
    field.subarray(0, terminator),
  );
}

function readCanonicalOctal(field, label, { checksum = false } = {}) {
  const digitLength = checksum ? field.length - 2 : field.length - 1;
  const digits = field.subarray(0, digitLength);
  const canonicalTerminator = checksum
    ? field.length === 8 &&
      field[field.length - 2] === 0 &&
      field[field.length - 1] === 0x20
    : field.length >= 2 && field[field.length - 1] === 0;
  if (
    !canonicalTerminator ||
    digits.length === 0 ||
    !digits.every((byte) => byte >= 0x30 && byte <= 0x37)
  ) {
    throw new Error(`${label} is not canonical octal.`);
  }
  const value = Number.parseInt(digits.toString('ascii'), 8);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} is out of bounds.`);
  }
  return value;
}

function inventoriesEqual(left, right) {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.path === right[index].path &&
        item.bytes === right[index].bytes &&
        item.sha256 === right[index].sha256,
    )
  );
}
