#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TOOL_DIR, '../../../../../..');
const DEFAULT_TEMP_ROOT = path.join(REPO_ROOT, '.tmp', 'v2-8-61c', 'quarantine');
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.css', '.scss', '.sass',
  '.html', '.htm', '.md', '.txt', '.yml', '.yaml', '.toml', '.xml', '.svg'
]);
const MEDIA_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.mp4', '.webm']);
const PROTECTED_CONFIG_PATTERNS = [
  { re: /^\.env(\..*)?$/i, risk: 'environment_file' },
  { re: /^local\.settings\.json$/i, risk: 'local_settings' },
  { re: /^appsettings(\..*)?\.json$/i, risk: 'appsettings' },
  { re: /^.*secret.*$/i, risk: 'secret_named_file' },
  { re: /^.*credential.*$/i, risk: 'credential_named_file' },
  { re: /^.*private.*key.*$/i, risk: 'private_key_named_file' },
  { re: /^\.deployment$/i, risk: 'deployment_config' }
];
const PACKAGE_MANAGER_FILES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'npm-shrinkwrap.json'
]);
const SOURCE_SCAN_MAX_BYTES = 256 * 1024;

function parseArgs(argv) {
  const args = {
    zip: '',
    out: '',
    tenantId: 'unknown-tenant',
    tempDir: '',
    keepTemp: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (name === '--zip') {
      args.zip = value || '';
      index += 1;
    } else if (name === '--out') {
      args.out = value || '';
      index += 1;
    } else if (name === '--tenant-id') {
      args.tenantId = value || '';
      index += 1;
    } else if (name === '--temp-dir') {
      args.tempDir = value || '';
      index += 1;
    } else if (name === '--keep-temp') {
      args.keepTemp = true;
    } else if (name === '--help') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${name}`);
    }
  }

  if (!args.zip) throw new Error('Missing --zip <zipPath>');
  if (!args.out) throw new Error('Missing --out <outputDir>');
  if (!args.tenantId) throw new Error('Missing --tenant-id <tenantId>');
  return args;
}

function printUsage() {
  console.log('Usage: node intake-analyze-package.mjs --zip <zipPath> --out <outputDir> --tenant-id <tenantId> [--temp-dir <dir>] [--keep-temp]');
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function sanitizeSegment(value) {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

async function listEntries(root) {
  const entries = [];
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const rel = toPosix(path.relative(root, fullPath));
      if (entry.isDirectory()) {
        entries.push({ type: 'directory', path: rel, bytes: 0, extension: '' });
        await walk(fullPath);
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        entries.push({
          type: 'file',
          path: rel,
          bytes: stat.size,
          extension: path.extname(entry.name).toLowerCase()
        });
      }
    }
  }
  await walk(root);
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

async function detectAnalysisRoot(extractDir) {
  const entries = await fs.readdir(extractDir, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  const files = entries.filter((entry) => entry.isFile());
  if (directories.length === 1 && files.length === 0) {
    return path.join(extractDir, directories[0].name);
  }
  return extractDir;
}

function protectedConfigFinding(relativePath) {
  const name = path.basename(relativePath);
  for (const pattern of PROTECTED_CONFIG_PATTERNS) {
    if (pattern.re.test(name)) {
      const severity = pattern.risk === 'environment_file' || pattern.risk.includes('secret') || pattern.risk.includes('credential')
        ? 'high'
        : 'medium';
      return {
        path: relativePath,
        fileName: name,
        riskCategory: pattern.risk,
        severity,
        contentsRead: false
      };
    }
  }
  return null;
}

async function safeReadSourceText(root, relativePath, bytes) {
  if (protectedConfigFinding(relativePath)) return '';
  if (bytes > SOURCE_SCAN_MAX_BYTES) return '';
  const ext = path.extname(relativePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) return '';
  try {
    return await fs.readFile(path.join(root, relativePath), 'utf8');
  } catch {
    return '';
  }
}

async function extractZip(zipPath, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  const zipBuffer = await fs.readFile(zipPath);
  const entries = readZipCentralDirectory(zipBuffer);
  for (const entry of entries) {
    const safeRelativePath = normalizeZipEntryPath(entry.name);
    if (!safeRelativePath) continue;
    const targetPath = path.join(destination, safeRelativePath);
    const relativeToDestination = path.relative(destination, targetPath);
    if (relativeToDestination.startsWith('..') || path.isAbsolute(relativeToDestination)) {
      throw new Error(`Unsafe ZIP entry path: ${entry.name}`);
    }
    if (entry.directory) {
      await fs.mkdir(targetPath, { recursive: true });
      continue;
    }
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    const fileBytes = extractZipEntry(zipBuffer, entry);
    await fs.writeFile(targetPath, fileBytes);
  }
}

function readZipCentralDirectory(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) throw new Error('ZIP end of central directory was not found.');
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let offset = centralDirectoryOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory signature at ${offset}.`);
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.slice(offset + 46, offset + 46 + nameLength).toString('utf8');
    entries.push({
      name,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      directory: /[\\/]$/.test(name)
    });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function findEndOfCentralDirectory(buffer) {
  const minOffset = Math.max(0, buffer.length - 0xFFFF - 22);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

function normalizeZipEntryPath(name) {
  const normalized = name
    .replace(/\\/g, '/')
    .replace(/^[A-Za-z]:\//, '')
    .replace(/^\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.some((part) => part === '..')) {
    throw new Error(`Unsafe ZIP entry path: ${name}`);
  }
  return parts.join(path.sep);
}

function extractZipEntry(buffer, entry) {
  const localOffset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
    throw new Error(`Invalid local file header for ZIP entry: ${entry.name}`);
  }
  const nameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const compressed = buffer.slice(dataStart, dataStart + entry.compressedSize);
  const output = entry.method === 0
    ? compressed
    : (entry.method === 8 ? inflateRawSync(compressed) : null);
  if (!output) {
    throw new Error(`Unsupported ZIP compression method ${entry.method} for ${entry.name}`);
  }
  if (entry.uncompressedSize !== output.length) {
    throw new Error(`ZIP entry size mismatch for ${entry.name}`);
  }
  return output;
}

async function readPackageJsons(root, fileEntries) {
  const packages = [];
  for (const entry of fileEntries.filter((item) => path.basename(item.path) === 'package.json')) {
    try {
      const parsed = await readJson(path.join(root, entry.path));
      const deps = {
        dependencies: Object.keys(parsed.dependencies || {}),
        devDependencies: Object.keys(parsed.devDependencies || {}),
        peerDependencies: Object.keys(parsed.peerDependencies || {}),
        workspaces: parsed.workspaces || null,
        scripts: Object.keys(parsed.scripts || {})
      };
      packages.push({
        path: entry.path,
        name: parsed.name || '',
        private: Boolean(parsed.private),
        version: parsed.version || '',
        dependencies: deps.dependencies,
        devDependencies: deps.devDependencies,
        peerDependencies: deps.peerDependencies,
        workspaces: deps.workspaces,
        scripts: deps.scripts
      });
    } catch (error) {
      packages.push({ path: entry.path, parseError: error.message });
    }
  }
  return packages;
}

function detectFramework(entries, packages) {
  const paths = entries.map((entry) => entry.path);
  const pathSet = new Set(paths);
  const packageDeps = new Set(packages.flatMap((pkg) => [
    ...(pkg.dependencies || []),
    ...(pkg.devDependencies || []),
    ...(pkg.peerDependencies || [])
  ]));
  const nextConfig = paths.filter((item) => /(^|\/)next\.config\.(js|mjs|cjs|ts)$/.test(item));
  const viteConfig = paths.filter((item) => /(^|\/)vite\.config\.(js|mjs|cjs|ts)$/.test(item));
  const appRouterPages = paths.filter((item) => /(^|\/)app\/.*page\.(js|jsx|ts|tsx|mdx)$/.test(item));
  const pagesRouterFiles = paths.filter((item) => /(^|\/)pages\/.*\.(js|jsx|ts|tsx|mdx)$/.test(item));
  const htmlFiles = paths.filter((item) => item.toLowerCase().endsWith('.html'));
  const hasTailwind = paths.some((item) => /(^|\/)tailwind\.config\.(js|mjs|cjs|ts)$/.test(item)) || packageDeps.has('tailwindcss');
  const hasTypescript = paths.some((item) => /(^|\/)tsconfig\.json$/.test(item)) || paths.some((item) => /\.(ts|tsx)$/.test(item));
  const localWorkspacePackages = packages.filter((pkg) => /^packages\//.test(pkg.path) || /\/packages\//.test(pkg.path));
  const packageManagerFiles = paths.filter((item) => PACKAGE_MANAGER_FILES.has(path.basename(item)));

  const frameworkCandidates = [];
  if (nextConfig.length || appRouterPages.length || packageDeps.has('next')) {
    frameworkCandidates.push({
      framework: 'nextjs',
      router: appRouterPages.length ? 'app-router' : (pagesRouterFiles.length ? 'pages-router' : 'unknown'),
      confidence: nextConfig.length && appRouterPages.length ? 'high' : 'medium',
      evidence: {
        nextConfig,
        appRouterPageCount: appRouterPages.length,
        pagesRouterFileCount: pagesRouterFiles.length,
        nextDependency: packageDeps.has('next')
      }
    });
  }
  if (viteConfig.length || packageDeps.has('vite')) {
    frameworkCandidates.push({
      framework: 'vite-react',
      confidence: viteConfig.length && packageDeps.has('react') ? 'high' : 'medium',
      evidence: { viteConfig, viteDependency: packageDeps.has('vite'), reactDependency: packageDeps.has('react') }
    });
  }
  if (htmlFiles.length && packages.length === 0) {
    frameworkCandidates.push({
      framework: 'static-html',
      confidence: 'medium',
      evidence: { htmlFileCount: htmlFiles.length }
    });
  }
  if (frameworkCandidates.length === 0) {
    frameworkCandidates.push({
      framework: 'unknown',
      confidence: 'low',
      evidence: { packageCount: packages.length, htmlFileCount: htmlFiles.length }
    });
  }

  return {
    frameworkCandidates,
    packageManagerFiles,
    packages,
    tooling: {
      tailwind: hasTailwind,
      typescript: hasTypescript,
      localWorkspacePackageCount: localWorkspacePackages.length,
      localWorkspacePackages: localWorkspacePackages.map((pkg) => ({ path: pkg.path, name: pkg.name }))
    },
    hasNextConfig: nextConfig.length > 0,
    hasViteConfig: viteConfig.length > 0,
    hasStaticHtml: htmlFiles.length > 0,
    hasAppRouterPages: appRouterPages.length > 0,
    routeSourceCounts: {
      appRouterPages: appRouterPages.length,
      pagesRouterFiles: pagesRouterFiles.length,
      htmlFiles: htmlFiles.length
    },
    pathSetSize: pathSet.size
  };
}

function appRouteFromPath(filePath) {
  const normalized = toPosix(filePath);
  const marker = '/app/';
  const index = normalized.indexOf(marker);
  const afterApp = index >= 0 ? normalized.slice(index + marker.length) : normalized.replace(/^app\//, '');
  const routeDir = afterApp.replace(/\/page\.(js|jsx|ts|tsx|mdx)$/i, '');
  if (routeDir === 'page.tsx' || routeDir === 'page.jsx' || routeDir === 'page.js' || routeDir === '') return '/';
  const segments = routeDir
    .split('/')
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('(') || !segment.endsWith(')'));
  if (segments.length === 0) return '/';
  return `/${segments.join('/')}`;
}

function htmlRouteFromPath(filePath) {
  let route = filePath.replace(/\\/g, '/').replace(/\.html?$/i, '');
  route = route.replace(/(^|\/)index$/i, '$1');
  route = route.replace(/^public\//, '/').replace(/^src\//, '/');
  if (!route.startsWith('/')) route = `/${route}`;
  return route.replace(/\/+$/, '') || '/';
}

function routePriority(route) {
  const lowered = route.toLowerCase();
  if (route === '/') return 'critical_home';
  if (/contact|booking|request|reserve|quote|lead/.test(lowered)) return 'critical_form_or_booking';
  if (/package|service|area|club|faq/.test(lowered)) return 'critical_commercial';
  if (/privacy|terms|sms/.test(lowered)) return 'legal';
  return 'secondary';
}

function discoverRoutes(entries) {
  const routes = [];
  for (const entry of entries.filter((item) => item.type === 'file')) {
    if (/(^|\/)app\/.*page\.(js|jsx|ts|tsx|mdx)$/i.test(entry.path)) {
      const route = appRouteFromPath(entry.path);
      routes.push({
        route,
        sourcePath: entry.path,
        sourceType: 'next_app_router_page',
        dynamic: /\[.*\]/.test(entry.path),
        priority: routePriority(route)
      });
    } else if (/\.html?$/i.test(entry.path)) {
      const route = htmlRouteFromPath(entry.path);
      routes.push({
        route,
        sourcePath: entry.path,
        sourceType: 'static_html',
        dynamic: false,
        priority: routePriority(route)
      });
    }
  }

  const unique = new Map();
  for (const candidate of routes) {
    const key = `${candidate.route}|${candidate.sourcePath}`;
    unique.set(key, candidate);
  }
  const candidates = [...unique.values()].sort((a, b) => a.route.localeCompare(b.route));
  const criticalRoutes = candidates.filter((candidate) => candidate.priority !== 'secondary');
  return {
    routeCount: candidates.length,
    dynamicRouteCount: candidates.filter((candidate) => candidate.dynamic).length,
    candidates,
    criticalRoutes,
    compilerHints: {
      expectedRoutesJson: candidates.map((candidate) => candidate.route),
      responsiveRoutesJson: criticalRoutes.map((candidate) => candidate.route)
    }
  };
}

function discoverMedia(entries) {
  const candidates = entries
    .filter((entry) => entry.type === 'file' && MEDIA_EXTENSIONS.has(entry.extension))
    .map((entry) => ({
      path: entry.path,
      extension: entry.extension.replace(/^\./, ''),
      bytes: entry.bytes,
      candidatePublicUse: /(^|\/)(public|assets|static|images|img)\//i.test(entry.path) || /\/public\//i.test(entry.path),
      likelyLogo: /logo|wordmark|brand/i.test(entry.path),
      likelyHero: /hero|banner|cover/i.test(entry.path)
    }));
  const byExtension = {};
  for (const item of candidates) {
    byExtension[item.extension] = (byExtension[item.extension] || 0) + 1;
  }
  return {
    mediaCount: candidates.length,
    totalBytes: candidates.reduce((sum, item) => sum + item.bytes, 0),
    byExtension,
    candidates
  };
}

async function discoverForms(root, entries) {
  const findings = [];
  const formScanExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.md']);
  const sourceFiles = entries
    .filter((entry) => entry.type === 'file')
    .filter((entry) => formScanExtensions.has(entry.extension))
    .filter((entry) => !protectedConfigFinding(entry.path));

  for (const entry of sourceFiles) {
    const loweredPath = entry.path.toLowerCase();
    if (
      loweredPath.includes('/dist/') ||
      loweredPath.endsWith('.map') ||
      /(^|\/)(package-lock\.json|package\.json|tsconfig\.json|next-env\.d\.ts)$/i.test(entry.path)
    ) {
      continue;
    }
    const pathSignal = /form|contact|booking|reserve|request|quote|lead/.test(loweredPath);
    const text = await safeReadSourceText(root, entry.path, entry.bytes);
    if (!text && !pathSignal) continue;
    const lowered = text.toLowerCase();
    const signals = [];
    if (pathSignal) signals.push('path_name_signal');
    if (/<form\b/i.test(text)) signals.push('html_form_tag');
    if (/onSubmit|handleSubmit|submit/i.test(text)) signals.push('submit_handler');
    if (/\/api\/(forms|contact|static-contact)|fetch\(|axios|action=/i.test(text)) signals.push('api_or_submit_path');
    if (/booking|reservation|reserve|request booking|book now/i.test(lowered)) signals.push('booking_reservation_language');
    if (/contact|quote|lead|inquiry/i.test(lowered)) signals.push('contact_lead_language');
    if (/name|email|phone|date|time|guests|package|message/i.test(lowered)) signals.push('field_name_language');
    if (signals.length < 2 && !/<form\b/i.test(text)) continue;
    const likelyType = /reservation|booking|reserve|request booking/i.test(text)
      ? 'reservation_or_booking'
      : (/contact|quote|lead|inquiry/i.test(text) ? 'contact_or_lead' : 'unknown_form_flow');
    const score = signals.length
      + (/<form\b/i.test(text) ? 5 : 0)
      + (/request-booking|reserve|custom-request|formrenderer/i.test(entry.path) ? 4 : 0)
      + (/onSubmit|handleSubmit|submit/i.test(text) ? 3 : 0);
    findings.push({
      path: entry.path,
      likelyType,
      score,
      signals: [...new Set(signals)],
      candidateFormDefinitionId: likelyType === 'reservation_or_booking' ? 'airstrip-reservation' : ''
    });
  }

  findings.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  return {
    formCandidateCount: findings.length,
    primaryCandidates: findings
      .filter((finding) => finding.likelyType !== 'unknown_form_flow')
      .slice(0, 20),
    candidates: findings.slice(0, 100)
  };
}

async function discoverThemeBrand(root, entries) {
  const candidates = {
    logoAssets: [],
    brandStrings: [],
    colorHints: [],
    configFiles: [],
    metadataFiles: []
  };

  for (const entry of entries.filter((item) => item.type === 'file')) {
    const lowered = entry.path.toLowerCase();
    if (/logo|wordmark|brand/.test(lowered) && MEDIA_EXTENSIONS.has(entry.extension)) {
      candidates.logoAssets.push({ path: entry.path, bytes: entry.bytes });
    }
    if (/tailwind\.config|globals\.css|site\.css|theme|brand|metadata|layout\.(ts|tsx|js|jsx)$/.test(lowered)) {
      candidates.configFiles.push(entry.path);
    }
  }

  const scanFiles = entries
    .filter((entry) => entry.type === 'file')
    .filter((entry) => TEXT_EXTENSIONS.has(entry.extension))
    .filter((entry) => !protectedConfigFinding(entry.path))
    .filter((entry) => /tailwind\.config|globals\.css|site\.css|theme|brand|metadata|layout|page|seed/i.test(entry.path));

  const brandHits = new Set();
  const colorHits = new Set();
  for (const entry of scanFiles) {
    const text = await safeReadSourceText(root, entry.path, entry.bytes);
    if (!text) continue;
    const brandMatches = text.match(/Airstrip(?:\s+Club|\s+Las Vegas)?|Pumpkin CMS|Las Vegas/gi) || [];
    brandMatches.slice(0, 10).forEach((match) => brandHits.add(match));
    const colorMatches = text.match(/#[0-9a-fA-F]{3,8}|\b(?:gold|black|white|zinc|neutral|amber|emerald|slate|stone)-[0-9]{2,3}\b/g) || [];
    colorMatches.slice(0, 20).forEach((match) => colorHits.add(match));
    if (/metadata|title|description/i.test(text)) candidates.metadataFiles.push(entry.path);
  }

  candidates.brandStrings = [...brandHits].slice(0, 25);
  candidates.colorHints = [...colorHits].slice(0, 80);
  candidates.metadataFiles = [...new Set(candidates.metadataFiles)].slice(0, 25);

  return {
    logoAssetCount: candidates.logoAssets.length,
    brandStringCount: candidates.brandStrings.length,
    colorHintCount: candidates.colorHints.length,
    candidates
  };
}

function classifyRendering(framework, routes, forms) {
  const primary = framework.frameworkCandidates[0] || { framework: 'unknown', confidence: 'low' };
  let mode = 'unsupported_needs_owner_input';
  const reasons = [];
  const nextCandidate = framework.frameworkCandidates.find((candidate) => candidate.framework === 'nextjs');
  if (nextCandidate) {
    if (routes.dynamicRouteCount > 0) {
      mode = 'hybrid_next_server_required';
      reasons.push('Next.js App Router detected with dynamic/catch-all route candidates.');
    } else {
      mode = 'source_build_candidate';
      reasons.push('Next.js source detected; build proof required before static or runtime decision.');
    }
  } else if (primary.framework === 'static-html') {
    mode = 'static_passthrough';
    reasons.push('Static HTML files detected without package manifest.');
  } else if (primary.framework === 'vite-react') {
    mode = 'source_build_candidate';
    reasons.push('Vite/React source detected; build proof required.');
  } else if (routes.routeCount > 0 || forms.formCandidateCount > 0) {
    mode = 'pumpkin_conversion_candidate';
    reasons.push('Routes or form flows were discoverable, but framework confidence is limited.');
  } else {
    reasons.push('Package shape could not be confidently classified.');
  }

  const readyForCompiler = ['hybrid_next_server_required', 'source_build_candidate', 'pumpkin_conversion_candidate'].includes(mode);
  const requiredGates = [
    'mobile_responsive_qa_required',
    'protected_config_owner_review_required',
    'form_mapping_review_required'
  ];
  if (mode !== 'static_passthrough') requiredGates.push('build_or_runtime_proof_required');

  return {
    renderingModeCandidate: mode,
    primaryFramework: primary.framework,
    confidence: primary.confidence,
    reasons,
    readyForCompiler,
    requiredGates,
    liveDeploymentReady: false
  };
}

function buildSourceMap(zipPath, tenantId, rootName, framework, routes, media, forms, theme, protectedFindings, rendering) {
  return {
    schema: 'pumpkin-package-intake-source-map',
    schemaVersion: 'v2-8-61c',
    tenantId,
    sourceZipName: path.basename(zipPath),
    uploadedRoot: rootName,
    framework: framework.frameworkCandidates,
    tooling: framework.tooling,
    routesForValidation: routes.compilerHints.expectedRoutesJson,
    responsiveRoutes: routes.compilerHints.responsiveRoutesJson,
    mediaManifestCandidates: media.candidates.map((item) => ({
      path: item.path,
      extension: item.extension,
      bytes: item.bytes,
      candidatePublicUse: item.candidatePublicUse
    })),
    formDefinitionCandidates: forms.primaryCandidates.map((item) => ({
      sourcePath: item.path,
      likelyType: item.likelyType,
      candidateFormDefinitionId: item.candidateFormDefinitionId,
      signals: item.signals
    })),
    themeExtractionCandidates: {
      logoAssets: theme.candidates.logoAssets,
      brandStrings: theme.candidates.brandStrings,
      colorHints: theme.candidates.colorHints.slice(0, 30),
      configFiles: theme.candidates.configFiles
    },
    protectedConfigFindings: protectedFindings.map((finding) => ({
      path: finding.path,
      fileName: finding.fileName,
      riskCategory: finding.riskCategory,
      severity: finding.severity
    })),
    renderingModeCandidate: rendering.renderingModeCandidate,
    compilerReadiness: rendering.readyForCompiler ? 'ready_for_v2_8_61d_compiler_analysis' : 'blocked_pending_owner_input'
  };
}

function buildOwnerPacket(analysis) {
  const status = analysis.renderingMode.readyForCompiler ? 'Ready for compiler phase' : 'Blocked: unsupported package shape';
  const websiteType = analysis.framework.frameworkCandidates[0]?.framework || 'unknown';
  const needsServer = analysis.renderingMode.renderingModeCandidate === 'hybrid_next_server_required';
  const actionItems = [];
  if (analysis.protectedConfigFindings.count > 0) {
    actionItems.push('Review protected configuration file names. Do not send secret values through normal chat or repo files.');
  }
  actionItems.push('Run mobile responsive QA before isolated preview, production deploy, custom-domain cutover, contact POST, or customer-facing POST proof.');
  if (analysis.forms.formCandidateCount > 0) {
    actionItems.push('Review detected form or booking flow and confirm where submissions should go.');
  }
  if (needsServer) {
    actionItems.push('Approve a later build/runtime proof phase before any deploy decision.');
  }

  return [
    '# Owner Action Packet',
    '',
    `Status: ${status}.`,
    '',
    `Upload analyzed: ${analysis.source.zipName}.`,
    '',
    `Likely website type: ${websiteType}.`,
    '',
    `Likely rendering mode: ${analysis.renderingMode.renderingModeCandidate}.`,
    '',
    needsServer
      ? 'This upload likely needs a server/runtime or a controlled build proof before it can be previewed.'
      : 'This upload may not need a server/runtime, but it still needs validation before preview.',
    '',
    'What was found:',
    '',
    `- Routes/pages: ${analysis.routes.routeCount}.`,
    `- Media files: ${analysis.media.mediaCount}.`,
    `- Form or booking candidates: ${analysis.forms.formCandidateCount}.`,
    `- Logo/theme hints: ${analysis.themeBrand.logoAssetCount} logo asset(s), ${analysis.themeBrand.colorHintCount} color hint(s).`,
    `- Protected config filename findings: ${analysis.protectedConfigFindings.count}.`,
    '',
    'Owner actions:',
    '',
    ...actionItems.map((item) => `- ${item}`),
    '',
    'No website code was executed, no package install ran, no form was submitted, and no live system was changed.'
  ].join('\n');
}

function buildTechnicalAnalysis(analysis) {
  return [
    '# Technical Analysis',
    '',
    `Framework: ${analysis.framework.frameworkCandidates.map((item) => `${item.framework}:${item.confidence}`).join(', ')}.`,
    '',
    `Rendering mode: ${analysis.renderingMode.renderingModeCandidate}.`,
    '',
    `Package manager files: ${analysis.framework.packageManagerFiles.length}.`,
    '',
    `Routes: ${analysis.routes.routeCount}; dynamic routes: ${analysis.routes.dynamicRouteCount}.`,
    '',
    `Media: ${analysis.media.mediaCount}; forms: ${analysis.forms.formCandidateCount}; protected config filenames: ${analysis.protectedConfigFindings.count}.`,
    '',
    'Compiler readiness:',
    '',
    analysis.renderingMode.readyForCompiler
      ? '- Ready for V2.8.61D compiler analysis with build/runtime proof still gated.'
      : '- Blocked pending owner input or unsupported package shape.',
    '',
    'Security:',
    '',
    '- Protected config contents were not read or printed.',
    '- Package scripts were not executed.',
    '- No install/build/deploy/live mutation occurred.'
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const zipPath = path.resolve(args.zip);
  const outputDir = path.resolve(args.out);
  if (!(await exists(zipPath))) {
    throw new Error(`ZIP is missing: ${zipPath}`);
  }
  const zipStat = await fs.stat(zipPath);
  if (!zipStat.isFile()) throw new Error(`ZIP path is not a file: ${zipPath}`);

  const zipHash = await sha256File(zipPath);
  const tempRoot = args.tempDir ? path.resolve(args.tempDir) : DEFAULT_TEMP_ROOT;
  const tempDir = path.join(tempRoot, `${sanitizeSegment(args.tenantId)}-${zipHash.slice(0, 12)}`);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await extractZip(zipPath, tempDir);
    const analysisRoot = await detectAnalysisRoot(tempDir);
    const rootName = path.basename(analysisRoot);
    const entries = await listEntries(analysisRoot);
    const fileEntries = entries.filter((entry) => entry.type === 'file');
    const directoryEntries = entries.filter((entry) => entry.type === 'directory');
    const protectedFindings = fileEntries
      .map((entry) => protectedConfigFinding(entry.path))
      .filter(Boolean);
    const packages = await readPackageJsons(analysisRoot, fileEntries);
    const framework = detectFramework(entries, packages);
    const routes = discoverRoutes(entries);
    const media = discoverMedia(entries);
    const forms = await discoverForms(analysisRoot, entries);
    const themeBrand = await discoverThemeBrand(analysisRoot, entries);
    const renderingMode = classifyRendering(framework, routes, forms);

    const byExtension = {};
    for (const entry of fileEntries) {
      const ext = entry.extension || '(none)';
      byExtension[ext] = (byExtension[ext] || 0) + 1;
    }

    const fileInventory = {
      schemaVersion: 'v2-8-61c',
      zipName: path.basename(zipPath),
      zipBytes: zipStat.size,
      zipSha256: zipHash,
      uploadedRoot: rootName,
      totalFiles: fileEntries.length,
      totalDirectories: directoryEntries.length,
      totalBytes: fileEntries.reduce((sum, entry) => sum + entry.bytes, 0),
      byExtension,
      packageManagerFiles: framework.packageManagerFiles,
      files: fileEntries.map((entry) => ({
        path: entry.path,
        bytes: entry.bytes,
        extension: entry.extension
      }))
    };

    const protectedConfigFindings = {
      schemaVersion: 'v2-8-61c',
      count: protectedFindings.length,
      findings: protectedFindings,
      contentsRead: false
    };

    const sourceMap = buildSourceMap(zipPath, args.tenantId, rootName, framework, routes, media, forms, themeBrand, protectedFindings, renderingMode);
    const analysis = {
      schema: 'pumpkin-universal-package-intake-analysis',
      schemaVersion: 'v2-8-61c',
      generatedAt: new Date().toISOString(),
      tenantId: args.tenantId,
      source: {
        zipName: path.basename(zipPath),
        zipBytes: zipStat.size,
        zipSha256: zipHash,
        originalZipModified: false,
        uploadedRoot: rootName
      },
      quarantine: {
        tempDir: toPosix(path.relative(REPO_ROOT, tempDir)),
        cleaned: !args.keepTemp,
        keepTemp: args.keepTemp
      },
      inventory: {
        totalFiles: fileInventory.totalFiles,
        totalDirectories: fileInventory.totalDirectories,
        totalBytes: fileInventory.totalBytes,
        byExtension
      },
      framework,
      routes,
      media: {
        mediaCount: media.mediaCount,
        totalBytes: media.totalBytes,
        byExtension: media.byExtension,
        sampleCandidates: media.candidates.slice(0, 25)
      },
      forms,
      themeBrand,
      protectedConfigFindings,
      renderingMode,
      benchmarkNotes: {
        airstripRawZip: args.tenantId.includes('airstrip'),
        rawBenchmarkState: 'raw_upload_requires_build_and_mobile_responsive_qa',
        overlayPassingState: 'V2.8.60R/V2.8.60X overlays repaired mobile responsive issues in later controlled phases.'
      },
      prohibitedActions: {
        packageInstall: false,
        packageBuild: false,
        arbitraryScriptExecution: false,
        liveMutation: false,
        deploy: false,
        contactPost: false,
        formSubmission: false,
        mediaUploadDelete: false
      }
    };

    await writeJson(path.join(outputDir, 'intake-analysis.json'), analysis);
    await writeJson(path.join(outputDir, 'file-inventory.json'), fileInventory);
    await writeJson(path.join(outputDir, 'framework-detection.json'), framework);
    await writeJson(path.join(outputDir, 'route-candidates.json'), routes);
    await writeJson(path.join(outputDir, 'media-candidates.json'), media);
    await writeJson(path.join(outputDir, 'form-candidates.json'), forms);
    await writeJson(path.join(outputDir, 'theme-brand-candidates.json'), themeBrand);
    await writeJson(path.join(outputDir, 'protected-config-findings.json'), protectedConfigFindings);
    await writeJson(path.join(outputDir, 'rendering-mode-classification.json'), renderingMode);
    await writeJson(path.join(outputDir, 'source-map.json'), sourceMap);
    await writeText(path.join(outputDir, 'OWNER_ACTION_PACKET.md'), buildOwnerPacket(analysis));
    await writeText(path.join(outputDir, 'TECHNICAL_ANALYSIS.md'), buildTechnicalAnalysis(analysis));

    console.log(JSON.stringify({
      status: 'passed',
      tenantId: args.tenantId,
      outputDir,
      framework: framework.frameworkCandidates[0]?.framework || 'unknown',
      renderingMode: renderingMode.renderingModeCandidate,
      routes: routes.routeCount,
      media: media.mediaCount,
      forms: forms.formCandidateCount,
      protectedConfigFindings: protectedFindings.length,
      tempCleaned: !args.keepTemp
    }, null, 2));
  } finally {
    if (!args.keepTemp) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(`V2.8.61C intake analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
