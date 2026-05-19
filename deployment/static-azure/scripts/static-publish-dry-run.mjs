import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const appRoot = path.join(repoRoot, 'apps', 'ice-rink-web');
const releaseRoot = path.join(repoRoot, '.static-release-dry-runs');
const nodeExecutable = process.execPath;
const contentSource = process.env.STATIC_CONTENT_SOURCE || 'seed-sites';

const sites = [
  {
    siteKey: 'ice-rink-rentals',
    displayName: 'Ice Skating Rink Rentals',
    domain: 'iceskatingrinkrentals.com',
    exportScripts: {
      'seed-sites': 'export:static:ice',
      'cms-snapshot': 'export:static:ice:cms',
    },
    expectedRoutes: ['/', '/ice-rink-rentals', '/events-holiday-activations', '/contact', '/sitemap.xml', '/robots.txt'],
    expectedPageFolders: ['ice-rink-rentals', 'events-holiday-activations', 'contact'],
  },
  {
    siteKey: 'roller-rink-rentals',
    displayName: 'Roller Rink Rentals',
    domain: 'rollerrinkrentals.com',
    exportScripts: {
      'seed-sites': 'export:static:roller',
      'cms-snapshot': 'export:static:roller:cms',
    },
    expectedRoutes: ['/', '/roller-rink-rentals', '/contact', '/sitemap.xml', '/robots.txt'],
    expectedPageFolders: ['roller-rink-rentals', 'contact'],
  },
];

const textExtensions = new Set([
  '.css',
  '.html',
  '.htm',
  '.js',
  '.json',
  '.map',
  '.md',
  '.txt',
  '.xml',
]);

const secretPatterns = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { label: 'Azure storage connection string', pattern: /DefaultEndpointsProtocol=|AccountKey=/i },
  { label: 'development storage connection string', pattern: /UseDevelopmentStorage\s*=\s*true/i },
  { label: 'local service URL', pattern: /\bhttps?:\/\/(?:localhost|127\.0\.0\.1):(?:5064|8081|7071|10000|10001|10002)\b/i },
  { label: 'OpenAI-style API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { label: 'Slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { label: 'JWT token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  {
    label: 'assigned secret-like value',
    pattern: /\b(password|api[_-]?key|secret|token|connectionString)\b\s*[:=]\s*["'][^"']{12,}["']/i,
  },
];

const contentWarningPatterns = [
  { label: 'localhost reference', pattern: /\blocalhost\b/i },
  { label: 'local proof copy', pattern: /\blocal proof\b/i },
];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + '-' + [pad(date.getHours()), pad(date.getMinutes())].join('');
}

function createRunDirectory() {
  mkdirSync(releaseRoot, { recursive: true });

  const baseName = formatTimestamp(new Date());
  let candidate = path.join(releaseRoot, baseName);
  let suffix = 2;

  while (existsSync(candidate)) {
    candidate = path.join(releaseRoot, `${baseName}-${String(suffix).padStart(2, '0')}`);
    suffix += 1;
  }

  mkdirSync(candidate, { recursive: true });
  return candidate;
}

function runCommand(command, args, options = {}) {
  const cwd = options.cwd || repoRoot;
  console.log(`[dry-run] ${command} ${args.join(' ')}`);

  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
}

function runNpmScript(scriptName) {
  if (process.platform === 'win32') {
    runCommand('cmd.exe', ['/d', '/s', '/c', 'npm', 'run', scriptName], { cwd: appRoot });
    return;
  }

  runCommand('npm', ['run', scriptName], { cwd: appRoot });
}

function getExportScript(site) {
  const exportScript = site.exportScripts[contentSource];

  if (!exportScript) {
    throw new Error(`Unsupported STATIC_CONTENT_SOURCE: ${contentSource}`);
  }

  return exportScript;
}

function runJsonCommand(command, args, options = {}) {
  const cwd = options.cwd || repoRoot;
  console.log(`[dry-run] ${command} ${args.join(' ')}`);

  const output = execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
  });

  process.stdout.write(output);
  return JSON.parse(output);
}

function walkFiles(rootDir) {
  const files = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath).toLowerCase());
}

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function getRouteFile(route) {
  if (route === '/') return 'index.html';
  if (route === '/sitemap.xml') return 'sitemap.xml';
  if (route === '/robots.txt') return 'robots.txt';
  return `${route.replace(/^\/+/, '')}/index.html`;
}

function getSitemapUrls(outDir) {
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  if (!existsSync(sitemapPath)) return [];

  const sitemapXml = readFileSync(sitemapPath, 'utf8');
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function getFileStats(rootDir) {
  const files = walkFiles(rootDir);
  const totalBytes = files.reduce((sum, filePath) => sum + statSync(filePath).size, 0);

  return { files, fileCount: files.length, totalBytes };
}

function scanOutput(rootDir) {
  const errors = [];
  const warnings = [];
  const { files } = getFileStats(rootDir);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const relativePath = toPosix(path.relative(rootDir, filePath));

    if (fileName === '.env' || fileName.startsWith('.env.')) {
      errors.push(`Forbidden env file found: ${relativePath}`);
    }

    if (/^appsettings\..*\.json$/i.test(fileName) || fileName === 'appsettings.Development.json') {
      errors.push(`Forbidden appsettings file found: ${relativePath}`);
    }

    if (!isTextFile(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');

    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        errors.push(`Possible ${label} found in ${relativePath}`);
      }
    }

    for (const { label, pattern } of contentWarningPatterns) {
      if (pattern.test(content)) {
        warnings.push(`Possible ${label} found in ${relativePath}`);
      }
    }
  }

  return { errors, warnings };
}

function validateRequiredRoutes(outDir, site) {
  return site.expectedRoutes.map((route) => {
    const file = getRouteFile(route);
    const filePath = path.join(outDir, file);

    return {
      route,
      file,
      exists: existsSync(filePath),
    };
  });
}

function validateCanonicalUrls(outDir, domain) {
  const expectedOrigin = `https://${domain}`;
  const urls = getSitemapUrls(outDir);

  return {
    expectedOrigin,
    urls,
    ok: urls.length > 0 && urls.every((url) => url.startsWith(expectedOrigin)),
  };
}

function copyReleaseOutput(sourceOut, releaseSiteDir) {
  rmSync(releaseSiteDir, { recursive: true, force: true });
  mkdirSync(path.dirname(releaseSiteDir), { recursive: true });
  cpSync(sourceOut, releaseSiteDir, { recursive: true });
}

function validateWithExistingValidator(siteKey, outDir) {
  return runJsonCommand(nodeExecutable, [
    path.join(repoRoot, 'deployment', 'static-azure', 'validate-static-output.mjs'),
    '--site',
    siteKey,
    '--out',
    outDir,
  ]);
}

function readStaticPublishManifest(outDir) {
  const manifestPath = path.join(outDir, 'static-publish-manifest.json');
  if (!existsSync(manifestPath)) return null;

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildSiteSummary(site, releaseSiteDir, sourceValidation, releaseValidation) {
  const stats = getFileStats(releaseSiteDir);
  const routeChecks = validateRequiredRoutes(releaseSiteDir, site);
  const canonical = validateCanonicalUrls(releaseSiteDir, site.domain);
  const scan = scanOutput(releaseSiteDir);
  const staticPublishManifest = readStaticPublishManifest(releaseSiteDir);
  const pageQualityWarnings = Array.isArray(staticPublishManifest?.qualityWarnings)
    ? staticPublishManifest.qualityWarnings
    : [];
  const rootFiles = ['index.html', 'sitemap.xml', 'robots.txt'].map((fileName) => {
    const filePath = path.join(releaseSiteDir, fileName);
    return {
      fileName,
      exists: existsSync(filePath),
      sha256: existsSync(filePath) ? hashFile(filePath) : '',
    };
  });

  return {
    siteKey: site.siteKey,
    displayName: site.displayName,
    domain: site.domain,
    uploadRoot: toPosix(path.relative(repoRoot, releaseSiteDir)),
    expectedRoutes: site.expectedRoutes,
    routeChecks,
    canonical,
    rootFiles,
    fileCount: stats.fileCount,
    totalBytes: stats.totalBytes,
    pageQualityWarnings,
    pageQualityWarningCount: pageQualityWarnings.length,
    sourceValidation,
    releaseValidation,
    secretScan: {
      ok: scan.errors.length === 0,
      errors: scan.errors,
      warnings: scan.warnings,
    },
    readyForManualUpload:
      sourceValidation.ok &&
      releaseValidation.ok &&
      canonical.ok &&
      scan.errors.length === 0 &&
      routeChecks.every((check) => check.exists),
  };
}

function writeSummaryMarkdown(runDir, manifest) {
  const lines = [
    '# Static Publish Dry Run Summary',
    '',
    `- Run ID: \`${manifest.runId}\``,
    `- Generated at: \`${manifest.generatedAt}\``,
    `- Release folder: \`${manifest.releaseFolder}\``,
    `- Content source: \`${manifest.contentSource}\``,
    '- Deployment attempted: `false`',
    '- Cloudflare modified: `false`',
    '',
    '## Site Results',
    '',
  ];

  for (const site of manifest.sites) {
    lines.push(`### ${site.displayName}`);
    lines.push('');
    lines.push(`- Site key: \`${site.siteKey}\``);
    lines.push(`- Domain: \`${site.domain}\``);
    lines.push(`- Upload root: \`${site.uploadRoot}\``);
    lines.push(`- Files: \`${site.fileCount}\``);
    lines.push(`- Bytes: \`${site.totalBytes}\``);
    lines.push(`- Source validator: \`${site.sourceValidation.ok ? 'passed' : 'failed'}\``);
    lines.push(`- Release validator: \`${site.releaseValidation.ok ? 'passed' : 'failed'}\``);
    lines.push(`- Canonical sitemap check: \`${site.canonical.ok ? 'passed' : 'failed'}\``);
    lines.push(`- Page quality warnings: \`${site.pageQualityWarningCount}\``);
    lines.push(`- Secret scan: \`${site.secretScan.ok ? 'passed' : 'failed'}\``);
    lines.push(`- Ready for manual upload: \`${site.readyForManualUpload ? 'yes' : 'no'}\``);
    lines.push('');
    lines.push('Expected route files:');
    lines.push('');

    for (const route of site.routeChecks) {
      lines.push(`- \`${route.route}\` -> \`${route.file}\`: ${route.exists ? 'present' : 'missing'}`);
    }

    if (site.secretScan.warnings.length > 0) {
      lines.push('');
      lines.push('Content warnings:');
      lines.push('');
      for (const warning of site.secretScan.warnings) {
        lines.push(`- ${warning}`);
      }
    }

    if (site.pageQualityWarnings.length > 0) {
      lines.push('');
      lines.push('Page quality warnings:');
      lines.push('');
      for (const warning of site.pageQualityWarnings) {
        lines.push(`- ${warning}`);
      }
    }

    lines.push('');
  }

  lines.push('## Upload Mapping');
  lines.push('');
  lines.push('- Azure Static Web Apps: upload each site folder as the prebuilt app artifact/root.');
  lines.push('- Azure Storage static website: upload each site folder contents to the matching `$web` container.');
  lines.push('- Cloudflare: verify DNS/proxy/cache rules and purge only after a successful real upload.');
  lines.push('');
  lines.push('## Not Performed');
  lines.push('');
  lines.push('- No Azure deployment.');
  lines.push('- No Cloudflare API calls or cache purge.');
  lines.push('- No production credentials used.');
  lines.push('');

  writeFileSync(path.join(runDir, 'STATIC_PUBLISH_DRY_RUN_SUMMARY.md'), lines.join('\n'), 'utf8');
}

function main() {
  const generatedAt = new Date().toISOString();
  const runDir = createRunDirectory();
  const manifest = {
    runId: path.basename(runDir),
    generatedAt,
    releaseFolder: toPosix(path.relative(repoRoot, runDir)),
    contentSource,
    deploymentAttempted: false,
    cloudflareModified: false,
    packageFormat: 'folder',
    zipCreated: false,
    sites: [],
  };

  console.log(`[dry-run] Release folder: ${runDir}`);

  for (const site of sites) {
    console.log(`[dry-run] Exporting ${site.siteKey}`);
    runNpmScript(getExportScript(site));

    const sourceOut = path.join(appRoot, '.static-artifacts', site.siteKey, 'out');
    const releaseSiteDir = path.join(runDir, site.siteKey);

    const sourceValidation = validateWithExistingValidator(site.siteKey, sourceOut);

    copyReleaseOutput(sourceOut, releaseSiteDir);

    const releaseValidation = validateWithExistingValidator(site.siteKey, releaseSiteDir);
    const siteSummary = buildSiteSummary(site, releaseSiteDir, sourceValidation, releaseValidation);
    manifest.sites.push(siteSummary);
  }

  manifest.ok = manifest.sites.every((site) => site.readyForManualUpload);

  writeFileSync(path.join(runDir, 'static-publish-dry-run-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  writeSummaryMarkdown(runDir, manifest);

  console.log(JSON.stringify({
    ok: manifest.ok,
    runId: manifest.runId,
    releaseFolder: manifest.releaseFolder,
    contentSource: manifest.contentSource,
    sites: manifest.sites.map((site) => ({
      siteKey: site.siteKey,
      domain: site.domain,
      uploadRoot: site.uploadRoot,
      fileCount: site.fileCount,
      readyForManualUpload: site.readyForManualUpload,
      pageQualityWarningCount: site.pageQualityWarningCount,
      contentWarningCount: site.secretScan.warnings.length,
    })),
    manifest: toPosix(path.relative(repoRoot, path.join(runDir, 'static-publish-dry-run-manifest.json'))),
    summary: toPosix(path.relative(repoRoot, path.join(runDir, 'STATIC_PUBLISH_DRY_RUN_SUMMARY.md'))),
  }, null, 2));

  if (!manifest.ok) {
    process.exit(1);
  }
}

main();
