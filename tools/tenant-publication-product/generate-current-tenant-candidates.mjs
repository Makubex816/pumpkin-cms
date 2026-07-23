import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  buildCurrentTenantCandidateSet,
  inventoryCandidateOutput,
  sha256,
  stableStringify,
  verifyCurrentTenantCandidateSet,
  writeCurrentTenantCandidateSet,
} from './index.mjs';

const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolRoot, '..', '..');
const args = parseArgs(process.argv.slice(2));
const lockfileBytes = await fs.readFile(path.join(repositoryRoot, 'package-lock.json'));
const toolPackage = JSON.parse(
  await fs.readFile(path.join(toolRoot, 'package.json'), 'utf8'),
);
const releaseContext = {
  releaseId: args.releaseId ?? 'pub30-a01-current-tenant-local-candidates',
  version: args.version ?? toolPackage.version,
  sourceCommit: args.sourceCommit,
  lockfileSha256: sha256(lockfileBytes),
  packageVersions: {
    node: process.versions.node,
    'tenant-publication-product': toolPackage.version,
  },
  licenseStatus: 'HELD_PENDING_OWNER_LEGAL_REVIEW',
};

const candidateSet = await buildCurrentTenantCandidateSet({
  repositoryRoot,
  releaseContext,
});
verifyCurrentTenantCandidateSet(candidateSet);
await writeCurrentTenantCandidateSet({
  repositoryRoot,
  outputRoot: args.out,
  candidateSet,
});
const outputInventory = await inventoryCandidateOutput(args.out);

process.stdout.write(
  `${stableStringify({
    status: 'passed',
    outputRef: String(args.out).replaceAll('\\', '/'),
    indexSha256: candidateSet.index.indexSha256,
    outputInventorySha256: sha256(
      Buffer.from(stableStringify(outputInventory), 'utf8'),
    ),
    candidates: candidateSet.candidates.map((candidate) => ({
      candidateKey: candidate.candidateKey,
      qualificationClass: candidate.qualificationClass,
      hostingClass: candidate.hostingClass,
      packageSha256: candidate.manifest.packageSha256,
      manifestSha256: candidate.manifest.manifestSha256,
      staticProjectionSha256: candidate.staticProjection.manifest.packageSha256,
    })),
    retainedPub20Synthetic: {
      packageSha256: candidateSet.retainedPub20Synthetic.packageSha256,
      manifestSha256: candidateSet.retainedPub20Synthetic.manifestSha256,
      buildCount: candidateSet.retainedPub20Synthetic.proof.buildCount,
      exactUtf8Ellipsis: true,
      postExecuted: false,
    },
    airstripPackageCreated: false,
    liveMutation: false,
    networkCalls: 0,
  })}\n`,
);

function parseArgs(values) {
  const output = {};
  const supported = new Set(['--out', '--source-commit', '--release-id', '--version']);
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!supported.has(key)) throw new Error(`Unknown argument: ${key}`);
    const value = values[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${key}.`);
    }
    if (key === '--out') output.out = value;
    if (key === '--source-commit') output.sourceCommit = value;
    if (key === '--release-id') output.releaseId = value;
    if (key === '--version') output.version = value;
    index += 1;
  }
  if (!output.out) throw new Error('--out is required.');
  if (!/^[a-f0-9]{40}$/.test(output.sourceCommit ?? '')) {
    throw new Error('--source-commit must be an exact lowercase 40-character commit SHA.');
  }
  return output;
}
