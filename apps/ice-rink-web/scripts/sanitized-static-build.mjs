import { spawnSync } from 'child_process';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import process from 'process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourceAppRoot = path.resolve(scriptDir, '..');
const sourceRepoRoot = path.resolve(sourceAppRoot, '../..');

const defaultSiteKey = 'ice-rink-rentals';
const supportedSiteKeys = new Set(['ice-rink-rentals']);
const protectedConfigNames = new Set([
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'local.settings.json',
]);
const protectedOutputPattern = /(^|[\s"'`])\.env(?:\.local|\.development\.local|\.test\.local|\.production\.local)?\b/i;

function parseArgs(argv) {
  const options = {
    siteKey: defaultSiteKey,
    contentSource: 'seed-sites',
    outputRoot: path.join(sourceAppRoot, '.tmp', 'sanitized-static-build'),
    keep: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = argv[index + 1];
    if (value === '--site' && next) {
      options.siteKey = next;
      index += 1;
    } else if (value === '--source' && next) {
      options.contentSource = next;
      index += 1;
    } else if (value === '--out' && next) {
      options.outputRoot = path.resolve(sourceAppRoot, next);
      index += 1;
    } else if (value === '--no-keep') {
      options.keep = false;
    } else if (value === '--help') {
      console.log([
        'Usage: node scripts/sanitized-static-build.mjs [--site ice-rink-rentals] [--source seed-sites] [--out .tmp/sanitized-static-build]',
        '',
        'Runs the Ice static validation/build/generate flow from an allowlisted temporary workspace that excludes dotenv and protected config files by path/name.',
      ].join('\n'));
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${value}`);
    }
  }

  return options;
}

function isProtectedConfigName(name) {
  const lower = name.toLowerCase();
  return protectedConfigNames.has(lower) || /^appsettings\..*\.json$/i.test(lower);
}

function isGeneratedOrLocalName(name) {
  return [
    '.git',
    '.next',
    '.static-artifacts',
    '.static-content',
    '.static-content-snapshots',
    '.tmp',
    'coverage',
    'node_modules',
    'out',
    'tsconfig.tsbuildinfo',
  ].includes(name);
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function copySafeEntry(sourcePath, targetPath, stats) {
  if (!existsSync(sourcePath)) return;

  const name = path.basename(sourcePath);
  if (isProtectedConfigName(name)) {
    stats.protectedNameSkips += 1;
    return;
  }

  if (isGeneratedOrLocalName(name)) {
    stats.generatedNameSkips += 1;
    return;
  }

  const sourceStats = lstatSync(sourcePath);
  if (sourceStats.isSymbolicLink()) {
    stats.symbolicLinkSkips += 1;
    return;
  }

  if (sourceStats.isDirectory()) {
    ensureDir(targetPath);
    for (const childName of readdirSync(sourcePath)) {
      copySafeEntry(path.join(sourcePath, childName), path.join(targetPath, childName), stats);
    }
    return;
  }

  ensureDir(path.dirname(targetPath));
  copyFileSync(sourcePath, targetPath);
  stats.fileCopies += 1;
}

function copyAllowlistedSource(tmpRepoRoot, siteKey) {
  const stats = {
    fileCopies: 0,
    protectedNameSkips: 0,
    generatedNameSkips: 0,
    symbolicLinkSkips: 0,
  };

  const appEntries = [
    '.eslintrc.json',
    'next.config.js',
    'package.json',
    'postcss.config.js',
    'README.md',
    'scripts',
    'src',
    'tailwind.config.js',
    'tsconfig.json',
  ];

  for (const entry of appEntries) {
    copySafeEntry(
      path.join(sourceAppRoot, entry),
      path.join(tmpRepoRoot, 'apps', 'ice-rink-web', entry),
      stats,
    );
  }

  const packageEntries = [
    ['pumpkin-ts-models', ['dist', 'package.json', 'README.md', 'src', 'tsconfig.json']],
    ['pumpkin-block-views', ['dist', 'package.json', 'README.md', 'src', 'tsconfig.json']],
  ];

  for (const [packageName, entries] of packageEntries) {
    for (const entry of entries) {
      copySafeEntry(
        path.join(sourceRepoRoot, 'packages', packageName, entry),
        path.join(tmpRepoRoot, 'packages', packageName, entry),
        stats,
      );
    }
  }

  copySafeEntry(
    path.join(sourceRepoRoot, 'tools', 'ice-rink-local-seed', 'seed-sites', siteKey),
    path.join(tmpRepoRoot, 'tools', 'ice-rink-local-seed', 'seed-sites', siteKey),
    stats,
  );

  return stats;
}

function linkDirectory(targetPath, linkPath) {
  if (!existsSync(targetPath)) return false;
  if (existsSync(linkPath)) return true;

  ensureDir(path.dirname(linkPath));
  symlinkSync(targetPath, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  return true;
}

function createSanitizedEnv(options) {
  const env = {};
  const passThroughKeys = [
    'APPDATA',
    'ComSpec',
    'COMSPEC',
    'LOCALAPPDATA',
    'NUMBER_OF_PROCESSORS',
    'OS',
    'Path',
    'PATH',
    'PATHEXT',
    'PROCESSOR_ARCHITECTURE',
    'SystemDrive',
    'SystemRoot',
    'TEMP',
    'TMP',
    'USERPROFILE',
    'windir',
  ];
  const allowedBuildKeys = [
    'NEXT_PUBLIC_STATIC_FORM_ACTION',
    'NEXT_PUBLIC_STATIC_FORM_ENDPOINT',
    'STATIC_FORM_ACTION',
    'STATIC_FORM_ENDPOINT',
    'STATIC_FORM_ENDPOINT_VERIFIED',
  ];

  for (const key of passThroughKeys) {
    if (process.env[key]) env[key] = process.env[key];
  }

  for (const key of allowedBuildKeys) {
    if (process.env[key]) env[key] = process.env[key];
  }

  env.NEXT_TELEMETRY_DISABLED = '1';
  env.NODE_ENV = 'production';
  env.PUMPKIN_RENDER_MODE = 'static';
  env.SITE_KEY = options.siteKey;
  env.STATIC_SITE_KEY = options.siteKey;
  env.STATIC_CONTENT_SOURCE = options.contentSource;

  return env;
}

function redactOutput(value) {
  return String(value || '')
    .replace(/(authorization:\s*bearer\s+)[^\s]+/gi, '$1[redacted]')
    .replace(/(cookie:\s*)[^\r\n]+/gi, '$1[redacted]')
    .replace(/(set-cookie:\s*)[^\r\n]+/gi, '$1[redacted]')
    .replace(/([?&]sig=)[^&\s]+/gi, '$1[redacted]')
    .replace(/((?:secret|token|password|connectionstring|accountkey|clientsecret)=)[^&\s]+/gi, '$1[redacted]');
}

function runCommand(label, command, args, cwd, env, logDir) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  const combinedOutput = `${result.stdout || ''}${result.stderr || ''}`;
  const redactedOutput = redactOutput(combinedOutput);
  const logPath = path.join(logDir, `${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.log`);
  writeFileSync(logPath, redactedOutput, 'utf8');

  return {
    label,
    status: result.status,
    signal: result.signal,
    ok: result.status === 0,
    logPath,
    protectedConfigReferenceInOutput: protectedOutputPattern.test(combinedOutput),
  };
}

function findProtectedWorkspaceEntries(rootDir) {
  const matches = [];

  function walk(currentDir) {
    for (const childName of readdirSync(currentDir)) {
      const childPath = path.join(currentDir, childName);
      const relativePath = path.relative(rootDir, childPath).split(path.sep).join('/');

      if (isProtectedConfigName(childName)) {
        matches.push(relativePath);
        continue;
      }

      const childStats = lstatSync(childPath);
      if (childStats.isDirectory() && !childStats.isSymbolicLink()) {
        walk(childPath);
      }
    }
  }

  if (existsSync(rootDir)) walk(rootDir);
  return matches;
}

function writeResult(runDir, result) {
  writeFileSync(
    path.join(runDir, 'SANITIZED_STATIC_BUILD_RESULT.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!supportedSiteKeys.has(options.siteKey)) {
    throw new Error(`Unsupported sanitized static build site: ${options.siteKey}`);
  }
  if (options.contentSource !== 'seed-sites') {
    throw new Error('The sanitized static build wrapper currently supports seed-sites only.');
  }

  const runId = `sanitized_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
  const runDir = path.join(options.outputRoot, options.siteKey, runId);
  const tmpRepoRoot = path.join(runDir, 'repo');
  const tmpAppRoot = path.join(tmpRepoRoot, 'apps', 'ice-rink-web');
  const logDir = path.join(runDir, 'logs');

  rmSync(runDir, { recursive: true, force: true });
  ensureDir(logDir);

  const copyStats = copyAllowlistedSource(tmpRepoRoot, options.siteKey);
  const appNodeModulesLinked = linkDirectory(
    path.join(sourceAppRoot, 'node_modules'),
    path.join(tmpAppRoot, 'node_modules'),
  );
  const workspaceProtectedEntries = findProtectedWorkspaceEntries(tmpRepoRoot);

  const nextCli = path.join(
    tmpAppRoot,
    'node_modules',
    'next',
    'dist',
    'bin',
    'next',
  );

  const baseResult = {
    ok: false,
    siteKey: options.siteKey,
    contentSource: options.contentSource,
    runId,
    runDir,
    workspaceRoot: tmpRepoRoot,
    workspaceAppRoot: tmpAppRoot,
    staticOutDir: path.join(tmpAppRoot, 'out'),
    protectedConfigCopied: workspaceProtectedEntries.length > 0,
    protectedConfigEntriesInWorkspace: workspaceProtectedEntries,
    protectedConfigContentsRead: false,
    dotenvAutoLoadAvoidedByWorkspace: true,
    childEnvironmentAllowlistOnly: true,
    dependencyMode: appNodeModulesLinked ? 'app-node-modules-junction' : 'unavailable',
    copyStats,
    commandResults: [],
  };

  if (!appNodeModulesLinked || !existsSync(nextCli)) {
    writeResult(runDir, {
      ...baseResult,
      failure: 'Local app node_modules/Next CLI was not available for sanitized build.',
    });
    console.log(JSON.stringify({
      ok: false,
      siteKey: options.siteKey,
      runDir,
      failure: 'missing-local-next-cli',
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (workspaceProtectedEntries.length > 0) {
    writeResult(runDir, {
      ...baseResult,
      failure: 'Protected config path/name appeared inside sanitized workspace.',
    });
    console.log(JSON.stringify({
      ok: false,
      siteKey: options.siteKey,
      runDir,
      failure: 'protected-config-in-workspace',
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  const env = createSanitizedEnv(options);
  const commands = [
    ['static-validate', process.execPath, ['scripts/static-publish.mjs', 'validate']],
    ['next-build', process.execPath, [nextCli, 'build']],
    ['static-generate', process.execPath, ['scripts/static-publish.mjs', 'generate']],
  ];

  const commandResults = [];
  for (const [label, command, args] of commands) {
    const commandResult = runCommand(label, command, args, tmpAppRoot, env, logDir);
    commandResults.push(commandResult);
    if (!commandResult.ok || commandResult.protectedConfigReferenceInOutput) break;
  }

  const ok = commandResults.every((result) => result.ok && !result.protectedConfigReferenceInOutput) &&
    existsSync(path.join(tmpAppRoot, 'out'));

  const result = {
    ...baseResult,
    ok,
    commandResults,
    nextOutputExists: existsSync(path.join(tmpAppRoot, 'out')),
    staticArtifactSnapshotExists: existsSync(path.join(tmpAppRoot, '.static-artifacts', options.siteKey, 'out')),
    generatedAt: new Date().toISOString(),
  };
  writeResult(runDir, result);

  console.log(JSON.stringify({
    ok,
    siteKey: options.siteKey,
    contentSource: options.contentSource,
    runId,
    runDir,
    staticOutDir: result.staticOutDir,
    protectedConfigCopied: result.protectedConfigCopied,
    dependencyMode: result.dependencyMode,
    commandResults: commandResults.map((commandResult) => ({
      label: commandResult.label,
      ok: commandResult.ok,
      protectedConfigReferenceInOutput: commandResult.protectedConfigReferenceInOutput,
      logPath: commandResult.logPath,
    })),
  }, null, 2));

  if (!ok) {
    process.exitCode = 1;
  }

  if (!options.keep && ok) {
    rmSync(tmpRepoRoot, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`[sanitized-static-build] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
