import fs from 'node:fs/promises';
import path from 'node:path';
import { validateBackupBundle } from '../validators/backup-validator.mjs';
import { listFilesRecursive, sha256File } from '../utils/file-hash.mjs';
import { bundleRelativePath, packageRoot, resolveTmpBundlePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';

const crcTable = buildCrcTable();

export async function createDownloadPackage({
  bundlePath,
  outputPath,
  overwrite = false,
  mode = 'production-restore-proof',
  now = new Date()
}) {
  const bundleRoot = resolveTmpBundlePath(bundlePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) throw new Error(`download output already exists; pass --overwrite to replace: ${outputPath}`);
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const validation = await validateBackupBundle({ bundlePath: bundleRoot, mode });
  if (validation.status !== 'passed') {
    throw new Error(`download package refused invalid backup bundle: ${validation.failures.map((failure) => failure.code).join(', ')}`);
  }

  const manifest = await readJson(path.join(bundleRoot, 'manifest.json'));
  const safeName = `${manifest.scope?.tenantKey ?? 'platform'}-standard-backup-${formatTimestamp(now)}.zip`;
  const zipPath = path.join(outputRoot, safeName);
  const files = await listFilesRecursive(bundleRoot);
  await writeZipFromFolder({ bundleRoot, files, zipPath });
  const zipSha256 = await sha256File(zipPath);
  const stat = await fs.stat(zipPath);
  const result = {
    schemaVersion: '0.2.0',
    phase: '2F-13',
    status: 'packaged',
    generatedAt: now.toISOString(),
    bundle: path.relative(packageRoot, bundleRoot),
    validation: {
      status: validation.status,
      mode: validation.mode
    },
    zipRelativePath: path.relative(packageRoot, zipPath),
    zipSha256,
    zipBytes: stat.size,
    fileCount: files.length,
    boundaries: {
      generatedUnderTmpOnly: true,
      generatedArtifactStaged: false,
      includesEscrow: manifest.includesEscrow === true,
      protectedConfigRead: false,
      cmsWrites: false,
      cosmosWrites: false,
      storageMutation: false
    }
  };
  await writeJson(path.join(outputRoot, 'DOWNLOAD_PACKAGE_RESULT.json'), result);
  await fs.writeFile(path.join(outputRoot, 'DOWNLOAD_PACKAGE_RESULT.md'), renderDownloadResult(result), 'utf8');
  return {
    outputRoot,
    zipPath,
    ...result
  };
}

async function writeZipFromFolder({ bundleRoot, files, zipPath }) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const filePath of files) {
    const relativePath = bundleRelativePath(bundleRoot, filePath);
    const nameBuffer = Buffer.from(relativePath, 'utf8');
    const data = await fs.readFile(filePath);
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await fs.writeFile(zipPath, Buffer.concat([...localParts, ...centralParts, end]));
}

function renderDownloadResult(result) {
  return [
    '# Download Package Result',
    '',
    `Status: ${result.status}`,
    `Generated: ${result.generatedAt}`,
    `Bundle: ${result.bundle}`,
    `Zip: ${result.zipRelativePath}`,
    `Zip SHA-256: ${result.zipSha256}`,
    `Zip bytes: ${result.zipBytes}`,
    `Files packaged: ${result.fileCount}`,
    '',
    '- Generated under ignored `.tmp` output only.',
    '- Standard backup escrow remains excluded.',
    '- No live system was written or mutated by packaging.',
    ''
  ].join('\n');
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
}

function formatTimestamp(now) {
  return now.toISOString().replace(/[:.]/g, '').replace('T', '-').replace('Z', 'Z');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
