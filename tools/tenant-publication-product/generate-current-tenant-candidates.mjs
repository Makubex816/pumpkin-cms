import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  buildCurrentTenantCandidateSet,
  canonicalDigest,
  createPrivilegedPlatformOriginVerifier,
  inventoryCandidateOutput,
  sha256,
  stableStringify,
  verifyCurrentTenantCandidateSet,
  writeCurrentTenantCandidateSet,
} from './index.mjs';

const execFileAsync = promisify(execFile);
const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolRoot, '..', '..');
const args = parseArgs(process.argv.slice(2));
const provenance = await assertExactCleanHead(
  repositoryRoot,
  args.sourceCommit,
);
const lockfileBytes = await readCommittedBlob(
  provenance.repositoryRoot,
  provenance.head,
  'package-lock.json',
);
const toolPackage = JSON.parse(
  (
    await readCommittedBlob(
      provenance.repositoryRoot,
      provenance.head,
      'tools/tenant-publication-product/package.json',
    )
  ).toString('utf8'),
);
const platformOriginAuthorization =
  await readPlatformOriginAuthorizationBundle(
    provenance.repositoryRoot,
    args.platformOriginAuthorization,
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
  repositoryRoot: provenance.repositoryRoot,
  releaseContext,
  platformOriginAuthorization,
});
verifyCurrentTenantCandidateSet(candidateSet);
await writeCurrentTenantCandidateSet({
  repositoryRoot: provenance.repositoryRoot,
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
  const supported = new Set([
    '--out',
    '--source-commit',
    '--platform-origin-authorization',
    '--release-id',
    '--version',
  ]);
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!supported.has(key)) throw new Error(`Unknown argument: ${key}`);
    const value = values[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${key}.`);
    }
    if (key === '--out') output.out = value;
    if (key === '--source-commit') output.sourceCommit = value;
    if (key === '--platform-origin-authorization') {
      output.platformOriginAuthorization = value;
    }
    if (key === '--release-id') output.releaseId = value;
    if (key === '--version') output.version = value;
    index += 1;
  }
  if (!output.out) throw new Error('--out is required.');
  if (!output.platformOriginAuthorization) {
    throw new Error('--platform-origin-authorization is required.');
  }
  if (!path.isAbsolute(output.platformOriginAuthorization)) {
    throw new Error(
      '--platform-origin-authorization must be an absolute outside-repository file path.',
    );
  }
  if (!/^[a-f0-9]{40}$/.test(output.sourceCommit ?? '')) {
    throw new Error('--source-commit must be an exact lowercase 40-character commit SHA.');
  }
  return output;
}

async function assertExactCleanHead(root, requestedCommit) {
  const repositoryRoot = await fs.realpath(path.resolve(root));
  const [
    topLevel,
    headOutput,
    statusOutput,
    gitDirectoryOutput,
  ] = await Promise.all([
    git(repositoryRoot, ['rev-parse', '--show-toplevel']),
    git(repositoryRoot, ['rev-parse', '--verify', 'HEAD^{commit}']),
    git(repositoryRoot, [
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
    ]),
    git(repositoryRoot, ['rev-parse', '--absolute-git-dir']),
  ]);
  const topLevelPath = path.resolve(topLevel.stdout.toString('utf8').trim());
  if (!samePath(repositoryRoot, topLevelPath)) {
    throw new Error(
      'Candidate generation must run against the exact repository worktree root.',
    );
  }
  const head = headOutput.stdout.toString('ascii').trim();
  if (head !== requestedCommit) {
    throw new Error(
      '--source-commit must equal the exact current HEAD commit.',
    );
  }
  if (statusOutput.stdout.length !== 0) {
    throw new Error(
      'Candidate generation requires a completely clean tracked and untracked worktree.',
    );
  }
  const gitDirectory = path.resolve(
    gitDirectoryOutput.stdout.toString('utf8').trim(),
  );
  for (const marker of [
    'MERGE_HEAD',
    'CHERRY_PICK_HEAD',
    'REVERT_HEAD',
    'BISECT_LOG',
    'rebase-apply',
    'rebase-merge',
    'sequencer',
  ]) {
    if (await pathExists(path.join(gitDirectory, marker))) {
      throw new Error(
        `Candidate generation is held while Git operation marker ${marker} exists.`,
      );
    }
  }
  return { repositoryRoot, head };
}

async function readPlatformOriginAuthorizationBundle(
  repositoryRoot,
  bundlePath,
) {
  const requestedPath = path.resolve(bundlePath);
  const stat = await fs.lstat(requestedPath);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(
      'Platform-origin authorization bundle must be a regular non-symlink file.',
    );
  }
  if (stat.size <= 0 || stat.size > 1024 * 1024) {
    throw new Error(
      'Platform-origin authorization bundle must be nonempty and at most 1 MiB.',
    );
  }
  const [realRepositoryRoot, realBundlePath] = await Promise.all([
    fs.realpath(repositoryRoot),
    fs.realpath(requestedPath),
  ]);
  if (!isOutside(realRepositoryRoot, realBundlePath)) {
    throw new Error(
      'Platform-origin authorization bundle must remain outside the repository.',
    );
  }
  let bundle;
  try {
    bundle = JSON.parse(await fs.readFile(realBundlePath, 'utf8'));
  } catch {
    throw new Error('Platform-origin authorization bundle is not valid JSON.');
  }
  assertExactObjectKeys(
    bundle,
    ['schemaVersion', 'authority', 'verifierConfiguration'],
    'platform-origin authorization bundle',
  );
  if (
    bundle.schemaVersion !==
    'pumpkin.platform-origin-authorization-bundle.v1'
  ) {
    throw new Error(
      'Platform-origin authorization bundle schemaVersion is invalid.',
    );
  }
  const verifierConfigurationSha256 = canonicalDigest(
    bundle.verifierConfiguration,
  );
  if (
    process.env.PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256 !==
    verifierConfigurationSha256
  ) {
    throw new Error(
      'PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256 must be pinned before Node starts to the exact authorization-bundle verifier/revocation configuration.',
    );
  }
  return Object.freeze({
    authority: structuredClone(bundle.authority),
    verifier: createPrivilegedPlatformOriginVerifier(
      bundle.verifierConfiguration,
    ),
  });
}

async function readCommittedBlob(repositoryRoot, commit, sourceRef) {
  if (!/^[a-f0-9]{40}$/.test(commit)) {
    throw new Error('Committed source SHA is invalid.');
  }
  if (
    typeof sourceRef !== 'string' ||
    sourceRef.length === 0 ||
    sourceRef.startsWith('/') ||
    sourceRef.includes('\\') ||
    sourceRef.split('/').some((segment) => segment === '..')
  ) {
    throw new Error('Committed source reference is unsafe.');
  }
  const tree = await git(repositoryRoot, [
    'ls-tree',
    '-z',
    '--full-tree',
    commit,
    '--',
    sourceRef,
  ]);
  const records = splitNulRecords(tree.stdout);
  if (records.length !== 1) {
    throw new Error(`Committed source is missing: ${sourceRef}`);
  }
  const match =
    /^([0-9]{6}) (blob|tree|commit) ([a-f0-9]{40,64})\t([\s\S]+)$/.exec(
      records[0],
    );
  if (
    !match ||
    match[2] !== 'blob' ||
    (match[1] !== '100644' && match[1] !== '100755') ||
    match[4] !== sourceRef
  ) {
    throw new Error(
      `Committed source must be an exact regular Git blob: ${sourceRef}`,
    );
  }
  const blob = await git(
    repositoryRoot,
    ['cat-file', 'blob', match[3]],
    128 * 1024 * 1024,
  );
  return Buffer.from(blob.stdout);
}

async function git(repositoryRoot, args, maxBuffer = 4 * 1024 * 1024) {
  return execFileAsync(
    'git',
    ['--literal-pathspecs', '-C', repositoryRoot, ...args],
    {
      encoding: 'buffer',
      windowsHide: true,
      maxBuffer,
      env: sanitizedGitEnvironment(),
    },
  );
}

function sanitizedGitEnvironment() {
  const environment = { ...process.env };
  for (const key of Object.keys(environment)) {
    if (
      /^(?:GIT_DIR|GIT_WORK_TREE|GIT_INDEX_FILE|GIT_OBJECT_DIRECTORY|GIT_ALTERNATE_OBJECT_DIRECTORIES|GIT_COMMON_DIR|GIT_CONFIG_COUNT|GIT_CONFIG_KEY_\d+|GIT_CONFIG_VALUE_\d+|GIT_CEILING_DIRECTORIES)$/.test(
        key,
      )
    ) {
      delete environment[key];
    }
  }
  environment.GIT_CONFIG_NOSYSTEM = '1';
  environment.GIT_CONFIG_GLOBAL =
    process.platform === 'win32' ? 'NUL' : '/dev/null';
  environment.GIT_OPTIONAL_LOCKS = '0';
  return environment;
}

function assertExactObjectKeys(value, expectedKeys, label) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== expectedKeys.length ||
    expectedKeys.some(
      (key) => !Object.prototype.hasOwnProperty.call(value, key),
    )
  ) {
    throw new Error(`${label} has an invalid shape.`);
  }
}

function splitNulRecords(bytes) {
  const text = Buffer.from(bytes).toString('utf8');
  if (text.length === 0) return [];
  if (!text.endsWith('\0')) {
    throw new Error('Git returned a noncanonical NUL-delimited tree record.');
  }
  return text.slice(0, -1).split('\0');
}

function isOutside(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  );
}

function samePath(left, right) {
  const resolvedLeft = path.resolve(left);
  const resolvedRight = path.resolve(right);
  return process.platform === 'win32'
    ? resolvedLeft.toLowerCase() === resolvedRight.toLowerCase()
    : resolvedLeft === resolvedRight;
}

async function pathExists(target) {
  try {
    await fs.lstat(target);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}
