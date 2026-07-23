import { constants as fsConstants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  canonicalDigest,
  sha256,
  stableStringify,
} from './canonical.mjs';
import { ContractError } from './contracts.mjs';

const CLIENT_REFERENCE_MANIFEST =
  /(?:^|\/)page_client-reference-manifest\.js$/;
const CLIENT_REFERENCE_PREFIX =
  /^(globalThis\.__RSC_MANIFEST=\(globalThis\.__RSC_MANIFEST\|\|\{\}\);globalThis\.__RSC_MANIFEST\[[^\r\n]+?\]=)(\{[\s\S]*\})\s*$/;
const SORTED_NEXT_LOOKUP_MANIFESTS = new Set([
  '.next/app-build-manifest.json',
  '.next/app-path-routes-manifest.json',
  '.next/server/app-paths-manifest.json',
]);
const PRERENDER_MANIFEST = '.next/prerender-manifest.json';
const SERVER_REFERENCE_MANIFEST =
  '.next/server/server-reference-manifest.json';
const SERVER_REFERENCE_MANIFEST_JS =
  '.next/server/server-reference-manifest.js';
const SERVER_REFERENCE_JS_PREFIX =
  /^self\.__RSC_SERVER_MANIFEST=("[\s\S]*")$/u;
const COMPILED_PREVIEW_MARKERS =
  /\b(?:clearPreviewData|draftMode|previewData|setPreviewData)\b|__next_preview_data|__prerender_bypass/u;
const SOURCE_PREVIEW_MARKERS =
  /\b(?:clearPreviewData|draftMode|previewData|setPreviewData)\b|\b(?:context|ctx)\s*\.\s*preview\b/u;
const CLOSED_PAGES_MANIFEST = Object.freeze({
  '/404': 'pages/404.html',
  '/_app': 'pages/_app.js',
  '/_document': 'pages/_document.js',
  '/_error': 'pages/_error.js',
});
const FORBIDDEN_CREDENTIAL_FILENAME =
  /(?:^|\/)(?:\.env(?:\.[^/]+)?|credentials(?:\.json)?|id_ed25519|id_rsa|[^/]+\.(?:key|p12|pem|pfx))$/iu;
const PUBLIC_INERT_PREVIEW_MODE_ID = sha256(
  Buffer.from('pumpkin-public-inert-preview-mode-id-v1', 'utf8'),
).slice(0, 32);
const PUBLIC_INERT_PREVIEW_MODE_ENCRYPTION_KEY = sha256(
  Buffer.from(
    'pumpkin-public-inert-preview-mode-encryption-key-v1',
    'utf8',
  ),
);
const PUBLIC_INERT_PREVIEW_MODE_SIGNING_KEY = sha256(
  Buffer.from(
    'pumpkin-public-inert-preview-mode-signing-key-v1',
    'utf8',
  ),
);
const PUBLIC_INERT_SERVER_ACTIONS_KEY = Buffer.from(
  sha256(
    Buffer.from(
      'pumpkin-public-inert-server-actions-encryption-key-v1',
      'utf8',
    ),
  ),
  'hex',
).toString('base64');
const SECRET_VALUE_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bAccountKey=[A-Za-z0-9+/=]{12,}/i,
  /\bSharedAccessSignature=sv=/i,
  /\b(?:client_secret|clientSecret)\s*[:=]\s*["'][^"']+["']/i,
  /\b(?:password|passwd)\s*[:=]\s*["'][^"'[\]{}();<>\r\n]{8,}["']/i,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{16,}\b/,
];

export async function prepareDeterministicAdminDeploymentTree({
  appRoot,
  outputRoot,
}) {
  const app = path.resolve(appRoot);
  const output = path.resolve(outputRoot);
  const repositoryRoot = path.resolve(app, '..', '..');
  const standalone = path.join(app, '.next', 'standalone');
  const staticRoot = path.join(app, '.next', 'static');
  await assertRegularDirectory(app, 'Admin root');
  await assertRegularDirectory(repositoryRoot, 'Repository root');
  await assertRegularDirectory(
    path.join(app, 'src'),
    'Admin source root',
  );
  await assertRegularDirectory(standalone, 'Admin standalone output');
  await assertRegularDirectory(staticRoot, 'Admin static output');
  await assertNewOutputOutsideRepository(repositoryRoot, output);
  await assertInertAdminSource(path.join(app, 'src'));

  await copyTree(standalone, output);
  await copyTree(staticRoot, path.join(output, '.next', 'static'));

  const sourceForms = await buildSourceForms(app);
  const privateRootForms = buildPrivateRootForms(app);
  let normalizedFileCount = 0;
  let normalizedOccurrenceCount = 0;
  let canonicalJsonFileCount = 0;
  let canonicalClientManifestCount = 0;
  let neutralizedGeneratedSecretCount = 0;
  for (const filePath of await walkFiles(output)) {
    const bytes = await fs.readFile(filePath);
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      continue;
    }
    let normalized = text;
    for (const source of sourceForms) {
      const replacement = replaceCaseInsensitive(
        normalized,
        source,
        '__PUMPKIN_BUILD_ROOT__',
      );
      normalized = replacement.value;
      normalizedOccurrenceCount += replacement.count;
    }
    const relativePath = normalizeRelative(path.relative(output, filePath));
    if (SORTED_NEXT_LOOKUP_MANIFESTS.has(relativePath)) {
      const parsed = parseJsonManifest(normalized, relativePath);
      normalized = `${stableStringify(parsed)}\n`;
      canonicalJsonFileCount += 1;
    } else if (
      relativePath === PRERENDER_MANIFEST ||
      relativePath === SERVER_REFERENCE_MANIFEST
    ) {
      const parsed = parseJsonManifest(normalized, relativePath);
      const neutralized = neutralizeNextGeneratedSecrets(
        relativePath,
        parsed,
      );
      normalized = `${JSON.stringify(neutralized.value)}\n`;
      neutralizedGeneratedSecretCount += neutralized.count;
      canonicalJsonFileCount += 1;
    } else if (CLIENT_REFERENCE_MANIFEST.test(relativePath)) {
      const match = CLIENT_REFERENCE_PREFIX.exec(normalized);
      if (!match) {
        throw new ContractError(
          'admin_client_reference_manifest_invalid',
          `Admin client-reference manifest has an unexpected format: ${relativePath}`,
        );
      }
      let manifest;
      try {
        manifest = JSON.parse(match[2]);
      } catch {
        throw new ContractError(
          'admin_client_reference_manifest_invalid',
          `Admin client-reference manifest JSON is invalid: ${relativePath}`,
        );
      }
      normalized = `${match[1]}${stableStringify(manifest)}\n`;
      canonicalClientManifestCount += 1;
    }
    if (normalized !== text) {
      await fs.writeFile(filePath, normalized, 'utf8');
      normalizedFileCount += 1;
    }
  }

  const deploymentFiles = await Promise.all(
    (await walkFiles(output)).map(async (filePath) => {
      const content = await fs.readFile(filePath);
      return {
        path: normalizeRelative(path.relative(output, filePath)),
        content,
        bytes: content.length,
        sha256: sha256(content),
      };
    }),
  );
  assertAdminDeploymentHygiene(
    deploymentFiles,
    sourceForms,
    privateRootForms,
  );
  assertInertCompiledPreview(deploymentFiles);
  assertClosedPagesManifest(deploymentFiles);
  assertInertServerActionManifests(deploymentFiles);
  const inventory = deploymentFiles
    .map(({ path: filePath, bytes, sha256: digest }) => ({
      path: filePath,
      bytes,
      sha256: digest,
    }))
    .sort((left, right) =>
      Buffer.from(left.path, 'utf8').compare(
        Buffer.from(right.path, 'utf8'),
      ),
    );
  return Object.freeze({
    schemaVersion: 'pumpkin.admin-deployment-tree.v1',
    normalizedFileCount,
    normalizedOccurrenceCount,
    canonicalJsonFileCount,
    canonicalClientManifestCount,
    neutralizedGeneratedSecretCount,
    fileCount: inventory.length,
    inventorySha256: canonicalDigest(inventory),
    privateAbsolutePathsIncluded: false,
    credentialValuesIncluded: false,
    previewCapabilityMarkersIncluded: false,
    pagesRouterBuiltInsOnly: true,
    serverActionsIncluded: false,
    symlinksIncluded: false,
    inventory,
  });
}

function neutralizeNextGeneratedSecrets(relativePath, value) {
  if (relativePath === PRERENDER_MANIFEST) {
    if (
      !isPlainObject(value) ||
      !isPlainObject(value.preview) ||
      !isPlainObject(value.dynamicRoutes) ||
      !isPlainObject(value.routes) ||
      !hasExactKeys(value.preview, [
        'previewModeEncryptionKey',
        'previewModeId',
        'previewModeSigningKey',
      ]) ||
      !/^[a-f0-9]{32}$/u.test(value.preview.previewModeId) ||
      !/^[a-f0-9]{64}$/u.test(
        value.preview.previewModeEncryptionKey,
      ) ||
      !/^[a-f0-9]{64}$/u.test(value.preview.previewModeSigningKey)
    ) {
      throw new ContractError(
        'admin_preview_manifest_contract_invalid',
        'Admin prerender manifest does not match the closed inert-preview contract.',
      );
    }
    return {
      value: {
        ...value,
        dynamicRoutes: sortRecord(value.dynamicRoutes),
        preview: {
          ...value.preview,
          previewModeEncryptionKey:
            PUBLIC_INERT_PREVIEW_MODE_ENCRYPTION_KEY,
          previewModeId: PUBLIC_INERT_PREVIEW_MODE_ID,
          previewModeSigningKey:
            PUBLIC_INERT_PREVIEW_MODE_SIGNING_KEY,
        },
        routes: sortRecord(value.routes),
      },
      count: 3,
    };
  }
  if (relativePath === SERVER_REFERENCE_MANIFEST) {
    if (
      !isPlainObject(value) ||
      !hasExactKeys(value, ['edge', 'encryptionKey', 'node']) ||
      !isPlainObject(value.edge) ||
      !isPlainObject(value.node) ||
      Object.keys(value.edge).length !== 0 ||
      Object.keys(value.node).length !== 0 ||
      typeof value.encryptionKey !== 'string' ||
      !/^[A-Za-z0-9+/]{43}=$/u.test(value.encryptionKey)
    ) {
      throw new ContractError(
        'admin_server_actions_not_inert',
        'Admin deployment preparation requires empty Server Action maps and the expected generated-key shape.',
      );
    }
    return {
      value: {
        ...value,
        encryptionKey: PUBLIC_INERT_SERVER_ACTIONS_KEY,
      },
      count: 1,
    };
  }
  return { value, count: 0 };
}

function parseJsonManifest(value, relativePath) {
  try {
    return JSON.parse(value);
  } catch {
    throw new ContractError(
      'admin_deployment_json_invalid',
      `Admin deployment JSON is invalid: ${relativePath}`,
    );
  }
}

function assertInertCompiledPreview(files) {
  for (const file of files) {
    if (!file.path.startsWith('.next/server/')) continue;
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(
        file.content,
      );
    } catch {
      continue;
    }
    if (COMPILED_PREVIEW_MARKERS.test(text)) {
      throw new ContractError(
        'admin_preview_capability_not_inert',
        `Admin compiled application contains a preview/draft capability marker: ${file.path}`,
      );
    }
  }
}

async function assertInertAdminSource(sourceRoot) {
  for (const filePath of await walkFiles(sourceRoot)) {
    if (
      !/\.(?:cjs|js|jsx|mjs|ts|tsx)$/iu.test(filePath)
    ) {
      continue;
    }
    const relativePath = normalizeRelative(
      path.relative(sourceRoot, filePath),
    );
    const text = decodeUtf8(
      await fs.readFile(filePath),
      relativePath,
    );
    if (SOURCE_PREVIEW_MARKERS.test(text)) {
      throw new ContractError(
        'admin_preview_capability_not_inert',
        `Admin source contains a preview/draft capability marker: ${relativePath}`,
      );
    }
  }
}

function assertClosedPagesManifest(files) {
  const byPath = new Map(files.map((file) => [file.path, file]));
  const manifestPath = '.next/server/pages-manifest.json';
  const manifestFile = byPath.get(manifestPath);
  if (!manifestFile) {
    throw new ContractError(
      'admin_pages_manifest_missing',
      'Admin deployment requires the closed Pages Router manifest.',
    );
  }
  const manifest = parseJsonManifest(
    decodeUtf8(manifestFile.content, manifestPath),
    manifestPath,
  );
  if (
    stableStringify(manifest) !==
    stableStringify(CLOSED_PAGES_MANIFEST) ||
    Object.values(CLOSED_PAGES_MANIFEST).some(
      (target) => !byPath.has(`.next/server/${target}`),
    )
  ) {
    throw new ContractError(
      'admin_pages_router_not_inert',
      'Admin Pages Router output must contain only the closed framework built-ins and 404 page.',
    );
  }
}

function assertInertServerActionManifests(files) {
  const byPath = new Map(files.map((file) => [file.path, file]));
  const jsonFile = byPath.get(SERVER_REFERENCE_MANIFEST);
  const scriptFile = byPath.get(SERVER_REFERENCE_MANIFEST_JS);
  if (!jsonFile || !scriptFile) {
    throw new ContractError(
      'admin_server_action_manifest_missing',
      'Admin deployment requires both server-reference manifest representations.',
    );
  }
  const jsonManifest = parseJsonManifest(
    decodeUtf8(jsonFile.content, SERVER_REFERENCE_MANIFEST),
    SERVER_REFERENCE_MANIFEST,
  );
  let encodedManifest;
  const scriptText = decodeUtf8(
    scriptFile.content,
    SERVER_REFERENCE_MANIFEST_JS,
  );
  const match = SERVER_REFERENCE_JS_PREFIX.exec(scriptText);
  try {
    encodedManifest = match ? JSON.parse(match[1]) : null;
  } catch {
    encodedManifest = null;
  }
  if (typeof encodedManifest !== 'string') {
    throw new ContractError(
      'admin_server_action_manifest_script_invalid',
      'Admin server-reference manifest script has an unexpected closed format.',
    );
  }
  const scriptManifest = parseJsonManifest(
    encodedManifest,
    SERVER_REFERENCE_MANIFEST_JS,
  );
  if (
    !isPlainObject(jsonManifest) ||
    !hasExactKeys(jsonManifest, ['edge', 'encryptionKey', 'node']) ||
    !isPlainObject(scriptManifest) ||
    !hasExactKeys(scriptManifest, ['edge', 'encryptionKey', 'node']) ||
    !isPlainObject(jsonManifest.edge) ||
    !isPlainObject(jsonManifest.node) ||
    !isPlainObject(scriptManifest.edge) ||
    !isPlainObject(scriptManifest.node) ||
    Object.keys(jsonManifest.edge).length !== 0 ||
    Object.keys(jsonManifest.node).length !== 0 ||
    Object.keys(scriptManifest.edge).length !== 0 ||
    Object.keys(scriptManifest.node).length !== 0 ||
    jsonManifest.encryptionKey !== PUBLIC_INERT_SERVER_ACTIONS_KEY ||
    scriptManifest.encryptionKey !==
      'process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY' ||
    stableStringify(jsonManifest.edge) !==
      stableStringify(scriptManifest.edge) ||
    stableStringify(jsonManifest.node) !==
      stableStringify(scriptManifest.node)
  ) {
    throw new ContractError(
      'admin_server_actions_not_inert',
      'Admin server-reference manifests must agree on empty Server Action maps and the closed nonsecret key contract.',
    );
  }
}

function decodeUtf8(content, relativePath) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(content);
  } catch {
    throw new ContractError(
      'admin_deployment_text_invalid',
      `Admin deployment text is not valid UTF-8: ${relativePath}`,
    );
  }
}

function assertAdminDeploymentHygiene(
  files,
  sourceForms,
  privateRootForms,
) {
  const portablePaths = new Map();
  for (const file of files) {
    assertSafeDeploymentPath(file.path);
    if (FORBIDDEN_CREDENTIAL_FILENAME.test(file.path)) {
      throw new ContractError(
        'admin_deployment_credential_file',
        `Admin deployment output contains a forbidden credential filename: ${file.path}`,
      );
    }
    const portable = file.path
      .normalize('NFC')
      .toLocaleLowerCase('en-US');
    const collision = portablePaths.get(portable);
    if (collision) {
      throw new ContractError(
        'admin_deployment_path_collision',
        `Admin deployment paths collide portably: ${collision} and ${file.path}`,
      );
    }
    portablePaths.set(portable, file.path);
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(
        file.content,
      );
    } catch {
      continue;
    }
    if (
      sourceForms.some((source) =>
        text
          .toLocaleLowerCase('en-US')
          .includes(source.toLocaleLowerCase('en-US')),
      ) ||
      privateRootForms.some((source) =>
        text
          .toLocaleLowerCase('en-US')
          .includes(source.toLocaleLowerCase('en-US')),
      )
    ) {
      throw new ContractError(
        'admin_deployment_absolute_path',
        `Admin deployment output contains an absolute private path: ${file.path}`,
      );
    }
    if (SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(text))) {
      throw new ContractError(
        'admin_deployment_secret_value',
        `Admin deployment output contains a secret-like value: ${file.path}`,
      );
    }
  }
}

function assertSafeDeploymentPath(value) {
  if (
    !value ||
    value !== value.normalize('NFC') ||
    value.startsWith('/') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f-\u009f]/u.test(value) ||
    value.split('/').some(
      (segment) =>
        !segment || segment === '.' || segment === '..',
    )
  ) {
    throw new ContractError(
      'admin_deployment_path_invalid',
      `Admin deployment path is not portable: ${JSON.stringify(value)}`,
    );
  }
}

async function buildSourceForms(appRoot) {
  const repositoryRoot = path.resolve(appRoot, '..', '..');
  const roots = new Set([
    path.resolve(appRoot),
    await fs.realpath(appRoot),
    repositoryRoot,
    await fs.realpath(repositoryRoot),
  ]);
  const forms = new Set();
  for (const root of roots) {
    forms.add(root);
    forms.add(root.replaceAll('\\', '/'));
    forms.add(root.replaceAll('\\', '\\\\'));
  }
  return [...forms].sort(
    (left, right) =>
      Buffer.byteLength(right, 'utf8') -
        Buffer.byteLength(left, 'utf8') ||
      Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8')),
  );
}

function buildPrivateRootForms(appRoot) {
  const resolved = path.resolve(appRoot);
  const segments = resolved.split(path.sep);
  const usersIndex = segments.findIndex(
    (segment) =>
      segment.toLocaleLowerCase('en-US') === 'users' ||
      segment.toLocaleLowerCase('en-US') === 'home',
  );
  if (usersIndex === -1 || usersIndex + 1 >= segments.length) {
    return [];
  }
  const privateRoot = segments
    .slice(0, usersIndex + 2)
    .join(path.sep);
  return [
    `${privateRoot}${path.sep}`,
    `${privateRoot.replaceAll('\\', '/')}/`,
    `${privateRoot.replaceAll('\\', '\\\\')}\\\\`,
  ].sort(
    (left, right) =>
      Buffer.byteLength(right, 'utf8') -
      Buffer.byteLength(left, 'utf8'),
  );
}

function replaceCaseInsensitive(value, search, replacement) {
  const foldedValue = value.toLocaleLowerCase('en-US');
  const foldedSearch = search.toLocaleLowerCase('en-US');
  let cursor = 0;
  let count = 0;
  let output = '';
  while (true) {
    const index = foldedValue.indexOf(foldedSearch, cursor);
    if (index === -1) break;
    output += value.slice(cursor, index);
    output += replacement;
    cursor = index + search.length;
    count += 1;
  }
  if (count === 0) return { value, count };
  output += value.slice(cursor);
  return { value: output, count };
}

async function copyTree(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  entries.sort((left, right) =>
    Buffer.from(left.name, 'utf8').compare(
      Buffer.from(right.name, 'utf8'),
    ),
  );
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    const stat = await fs.lstat(from);
    if (stat.isSymbolicLink()) {
      throw new ContractError(
        'admin_deployment_symlink_forbidden',
        `Admin deployment input contains a symbolic link: ${entry.name}`,
      );
    }
    if (stat.isDirectory()) {
      await copyTree(from, to);
    } else if (stat.isFile()) {
      await fs.copyFile(from, to, fsConstants.COPYFILE_EXCL);
    } else {
      throw new ContractError(
        'admin_deployment_entry_invalid',
        `Admin deployment input contains an unsupported entry: ${entry.name}`,
      );
    }
  }
}

async function walkFiles(root) {
  const files = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  entries.sort((left, right) =>
    Buffer.from(left.name, 'utf8').compare(
      Buffer.from(right.name, 'utf8'),
    ),
  );
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    const stat = await fs.lstat(target);
    if (stat.isSymbolicLink()) {
      throw new ContractError(
        'admin_deployment_symlink_forbidden',
        `Admin deployment tree contains a symbolic link: ${entry.name}`,
      );
    }
    if (stat.isDirectory()) {
      files.push(...await walkFiles(target));
    } else if (stat.isFile()) {
      files.push(target);
    } else {
      throw new ContractError(
        'admin_deployment_entry_invalid',
        `Admin deployment tree contains an unsupported entry: ${entry.name}`,
      );
    }
  }
  return files;
}

async function assertRegularDirectory(target, label) {
  let stat;
  try {
    stat = await fs.lstat(target);
  } catch {
    throw new ContractError(
      'admin_deployment_input_missing',
      `${label} is missing.`,
    );
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new ContractError(
      'admin_deployment_input_invalid',
      `${label} must be a regular non-symlink directory.`,
    );
  }
}

async function assertNewOutputOutsideRepository(
  repositoryRoot,
  output,
) {
  try {
    await fs.lstat(output);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    const repositoryReal = await fs.realpath(repositoryRoot);
    let existingParent = path.dirname(output);
    while (true) {
      try {
        const stat = await fs.lstat(existingParent);
        if (!stat.isDirectory() || stat.isSymbolicLink()) {
          throw new ContractError(
            'admin_deployment_output_parent_invalid',
            'Admin deployment output parent must be a regular non-symlink directory.',
          );
        }
        break;
      } catch (parentError) {
        if (parentError?.code !== 'ENOENT') throw parentError;
        const parent = path.dirname(existingParent);
        if (parent === existingParent) {
          throw new ContractError(
            'admin_deployment_output_parent_missing',
            'Admin deployment output has no existing parent directory.',
          );
        }
        existingParent = parent;
      }
    }
    const existingReal = await fs.realpath(existingParent);
    if (!samePath(existingParent, existingReal)) {
      throw new ContractError(
        'admin_deployment_output_parent_symlinked',
        'Admin deployment output cannot traverse a symlinked or junction-backed parent.',
      );
    }
    const effectiveOutput = path.resolve(
      existingReal,
      path.relative(existingParent, output),
    );
    if (
      isWithin(repositoryRoot, output) ||
      isWithin(repositoryReal, effectiveOutput)
    ) {
      throw new ContractError(
        'admin_deployment_output_inside_repository',
        'Admin deployment output must remain outside the repository.',
      );
    }
    return;
  }
  throw new ContractError(
    'admin_deployment_output_exists',
    'Admin deployment output already exists.',
  );
}

function samePath(left, right) {
  const normalizedLeft = path.resolve(left).normalize('NFC');
  const normalizedRight = path.resolve(right).normalize('NFC');
  if (process.platform === 'win32') {
    return (
      normalizedLeft.toLocaleLowerCase('en-US') ===
      normalizedRight.toLocaleLowerCase('en-US')
    );
  }
  return normalizedLeft === normalizedRight;
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
}

function sortRecord(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) =>
      Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8')),
    ),
  );
}

function normalizeRelative(value) {
  return value.replaceAll('\\', '/');
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}
