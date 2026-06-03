#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outDir = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion');
const candidatePath = path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CANDIDATE.json');
const packagePath = path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PACKAGE.json');
const manifestPath = path.join(outDir, 'manifest.json');
const rootReportPath = path.join(repoRoot, 'PUMPKIN_ICE_APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CONVERSION_REPORT.md');
const legacyEmail = ['contactus', 'iceskatingrinkrentals.com'].join('@');

const commandResults = [];

main();

function main() {
  mkdirSync(outDir, { recursive: true });
  assertExists(candidatePath, 'candidate');
  assertExists(packagePath, 'package');

  writeJson('json-parse-validation-result.json', runJsonParseValidation());
  runImportPreflight();
  runDotNetContract();
  runContractPersistence();
  runSimpleCommand('design-system-validation-result.json', 'design-system validation', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand('media-validation-result.json', 'media validation', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand('tailwind-navigation-validation-result.json', 'Tailwind/navigation validation', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand('page-intake-normalizer-validation-result.json', 'page intake normalizer validation', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  writeJson('unsafe-scan-result.json', runUnsafeScan());
  writeJson('contactus-scan-result.json', runContactusScan());
  writeJson('targeted-secret-scan-result.json', runTargetedSecretScan());
  runGitDiffCheck();
  writeJson('trailing-whitespace-scan-result.json', runTrailingWhitespaceScan());
  writeJson('protected-generated-raw-artifact-check-result.json', runArtifactPathCheck());
  writeJson('validation-command-results.json', {
    ok: commandResults.every((item) => item.ok || item.allowedNonZero),
    generatedAt: new Date().toISOString(),
    commands: commandResults,
  });

  const summary = {
    ok: true,
    generatedAt: new Date().toISOString(),
    outputDir: rel(outDir),
    validationFiles: listFiles(outDir)
      .filter((file) => /validation-result\.json$|scan-result\.json$|check-result\.json$|validation-command-results\.json$|homepage-import-preflight-result\.json$|dotnet-page-contract-result\.json$/i.test(file))
      .map(rel)
      .sort(),
  };
  console.log(JSON.stringify(summary, null, 2));
}

function runJsonParseValidation() {
  const files = [candidatePath, packagePath, manifestPath].filter(existsSync);
  const results = files.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8'));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: error.message };
    }
  });
  return {
    ok: results.every((item) => item.ok),
    generatedAt: new Date().toISOString(),
    files: results,
  };
}

function runImportPreflight() {
  const output = path.join(outDir, 'homepage-import-preflight-result.json');
  const command = [
    'node',
    'tools/import-preflight/import-preflight.mjs',
    '--input',
    rel(candidatePath),
    '--tenant-id',
    'ice-rink-rentals',
    '--site-key',
    'ice-rink-rentals',
    '--route',
    '/',
    '--mode',
    'preflight-only',
    '--output',
    rel(output),
  ];
  const result = spawn(command, { timeout: 180000, allowedNonZero: true, label: 'safe import preflight' });
  if (!existsSync(output)) {
    writeJson('homepage-import-preflight-result.json', {
      ok: false,
      generatedAt: new Date().toISOString(),
      command: commandResultForFile(result),
      error: 'Import preflight did not write its expected output file.',
    });
    return;
  }

  const parsed = safeParseJson(readFileSync(output, 'utf8')) || {};
  parsed.command = commandResultForFile(result);
  parsed.ok = parsed.classification?.['preflight-valid-for-shape'] === true;
  writeJson('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract() {
  const project = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'Pumpkin.PageContractTool.csproj');
  const scratch = path.join(os.tmpdir(), `pumpkin-approved-homepage-contract-${process.pid}-${Date.now()}`);
  const publishDir = path.join(scratch, 'publish');
  const buildRoot = path.join(scratch, 'bin');
  const objRoot = path.join(scratch, 'obj');
  mkdirSync(publishDir, { recursive: true });
  mkdirSync(buildRoot, { recursive: true });
  mkdirSync(objRoot, { recursive: true });

  const publish = spawn([
    'dotnet',
    'publish',
    project,
    '-c',
    'Debug',
    '-o',
    publishDir,
    '-p:UseSharedCompilation=false',
    '-p:GenerateAssemblyInfo=false',
    '-p:GenerateTargetFrameworkAttribute=false',
    `-p:BaseOutputPath=${buildRoot}${path.sep}`,
    `-p:BaseIntermediateOutputPath=${objRoot}${path.sep}`,
  ], { timeout: 180000, label: '.NET contract publish' });

  if (!publish.ok) {
    writeJson('dotnet-page-contract-result.json', {
      ok: false,
      generatedAt: new Date().toISOString(),
      command: commandResultForFile(publish),
      error: '.NET contract tool publish failed.',
    });
    rmSync(scratch, { recursive: true, force: true });
    return;
  }

  const dll = path.join(publishDir, 'Pumpkin.PageContractTool.dll');
  const validate = spawn(['dotnet', dll, 'validate-page', '--path', candidatePath], {
    timeout: 180000,
    label: '.NET Page/block contract validation',
    allowedNonZero: true,
  });
  const parsed = safeParseJson(validate.stdout) || {
    Ok: false,
    parseOk: false,
    stdoutPreview: validate.stdout.slice(0, 2000),
    stderrPreview: validate.stderr.slice(0, 2000),
  };
  parsed.command = commandResultForFile(validate);
  parsed.ok = parsed.Ok === true;
  writeJson('dotnet-page-contract-result.json', parsed);
  rmSync(scratch, { recursive: true, force: true });
}

function runContractPersistence() {
  runSimpleCommand(
    'contract-persistence-validation-result.json',
    'production-field persistence validation',
    [
      'node',
      'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
      '--candidate',
      rel(candidatePath),
      '--output',
      rel(path.join(outDir, 'contract-persistence-validation-result.json')),
    ],
    { allowedNonZero: true },
  );
}

function runGitDiffCheck() {
  const result = spawn(['git', 'diff', '--check'], { timeout: 60000, label: 'git diff --check', allowedNonZero: true });
  writeJson('git-diff-check-result.json', {
    ok: result.exitCode === 0,
    generatedAt: new Date().toISOString(),
    command: commandResultForFile(result),
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  });
}

function runSimpleCommand(outputFileName, label, command, options = {}) {
  const result = spawn(command, { timeout: options.timeout || 180000, label, allowedNonZero: options.allowedNonZero === true });
  const parsed = safeParseJson(result.stdout);
  const payload = parsed && typeof parsed === 'object'
    ? { ...parsed, command: commandResultForFile(result), ok: inferOk(parsed, result) }
    : {
        ok: result.exitCode === 0,
        generatedAt: new Date().toISOString(),
        command: commandResultForFile(result),
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      };
  writeJson(outputFileName, payload);
}

function runUnsafeScan() {
  const patterns = [
    { code: 'script-tag', pattern: /<script\b/i },
    { code: 'event-handler', pattern: /\son[a-z]+\s*=/i },
    { code: 'javascript-url', pattern: /javascript:/i },
    { code: 'data-image', pattern: /data:image\//i },
    { code: 'encoded-image-marker', pattern: /\bbase64\b/i },
    { code: 'raw-form-tag', pattern: /<form\b/i },
    { code: 'raw-input-tag', pattern: /<input\b/i },
    { code: 'raw-textarea-tag', pattern: /<textarea\b/i },
    { code: 'raw-select-tag', pattern: /<select\b/i },
    { code: 'mail-link', pattern: /mailto:/i },
    { code: 'wordpress-contact-form-shortcode', pattern: /\[contact-form-7\b/i },
    { code: 'random-external-media-url', pattern: /https?:\/\/(?!iceskatingrinkrentals\.com|partyproseastcoast\.com)/i },
  ];
  const files = [candidatePath, packagePath];
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const item of patterns) {
      if (item.pattern.test(text)) hits.push({ path: rel(file), code: item.code });
    }
  }
  return {
    ok: hits.length === 0,
    generatedAt: new Date().toISOString(),
    scope: files.map(rel),
    hits,
  };
}

function runContactusScan() {
  const files = generatedReviewTextFiles();
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (text.includes(legacyEmail)) hits.push({ path: rel(file) });
  }
  return {
    ok: hits.length === 0,
    generatedAt: new Date().toISOString(),
    scope: files.map(rel),
    hits,
  };
}

function runTargetedSecretScan() {
  const patterns = [
    { code: 'private-key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i },
    { code: 'storage-account-key', pattern: /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i },
    { code: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
    { code: 'openai-key', pattern: /\bsk-[A-Za-z0-9]{20,}\b/i },
    { code: 'secret-assignment', pattern: /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i },
  ];
  const files = generatedReviewTextFiles();
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const item of patterns) {
      if (item.pattern.test(text)) hits.push({ path: rel(file), code: item.code });
    }
  }
  return {
    ok: hits.length === 0,
    generatedAt: new Date().toISOString(),
    scope: files.map(rel),
    hits,
  };
}

function runTrailingWhitespaceScan() {
  const files = generatedReviewTextFiles().concat([
    path.join(outDir, 'generate-approved-homepage-conversion.mjs'),
    path.join(outDir, 'run-approved-homepage-conversion-validation.mjs'),
  ]).filter(existsSync);
  const hits = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push({ path: rel(file), line: index + 1 });
    });
  }
  return {
    ok: hits.length === 0,
    generatedAt: new Date().toISOString(),
    scope: files.map(rel),
    hits,
  };
}

function runArtifactPathCheck() {
  const status = spawn(['git', 'status', '--short', '--untracked-files=all'], {
    timeout: 60000,
    label: 'protected/generated/raw artifact path check status',
    allowedNonZero: true,
  });
  const lines = status.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const protectedPattern = /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i;
  const generatedPattern = /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i;
  const rawMediaPattern = /\.(zip|png|jpe?g|gif|webp|mp4|mov|avi|psd|ai)$/i;
  const protectedHits = lines.filter((line) => protectedPattern.test(line));
  const generatedHits = lines.filter((line) => generatedPattern.test(line));
  const outputRawHits = lines.filter((line) => line.includes('content-review/ice-approved-homepage-conversion/') && rawMediaPattern.test(line));
  const rawInputHits = lines.filter((line) => line.includes('content-review/ice-approved-homepage-conversion-input/') && rawMediaPattern.test(line));
  const extractedInputHits = lines.filter((line) => line.includes('content-review/ice-approved-homepage-conversion-input/extracted/'));
  return {
    ok: protectedHits.length === 0 && generatedHits.length === 0 && outputRawHits.length === 0,
    generatedAt: new Date().toISOString(),
    protectedConfigHits: protectedHits,
    generatedArtifactHits: generatedHits,
    outputRawArtifactHits: outputRawHits,
    expectedRawInputArtifactCount: rawInputHits.length,
    expectedExtractedInputArtifactCount: extractedInputHits.length,
    note: 'Raw ZIP/media/extracted input artifacts are present only as supplied intake sources and must not be staged.',
    command: commandResultForFile(status),
  };
}

function generatedReviewTextFiles() {
  const files = listFiles(outDir)
    .filter((file) => /\.(json|md)$/i.test(file))
    .filter((file) => !/validation-command-results\.json$/i.test(file));
  if (existsSync(rootReportPath)) files.push(rootReportPath);
  return files.sort();
}

function spawn(command, { timeout, label, allowedNonZero = false }) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  });
  const item = {
    label,
    command: redactCommand(command),
    exitCode: result.status,
    signal: result.signal || null,
    ok: result.status === 0,
    allowedNonZero,
    stdoutPreview: (result.stdout || '').slice(0, 1200),
    stderrPreview: (result.stderr || '').slice(0, 1200),
  };
  commandResults.push(item);
  return {
    ...item,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function commandResultForFile(result) {
  return {
    label: result.label,
    command: result.command,
    exitCode: result.exitCode,
    signal: result.signal,
    ok: result.ok,
    allowedNonZero: result.allowedNonZero,
    stdoutPreview: result.stdoutPreview,
    stderrPreview: result.stderrPreview,
  };
}

function redactCommand(command) {
  return command.map((part) => {
    const value = String(part);
    if (/jwt|token|secret|password/i.test(value)) return '[redacted-arg]';
    return value.replace(repoRoot, '.');
  });
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function inferOk(parsed, result) {
  if (typeof parsed.ok === 'boolean') return parsed.ok;
  if (typeof parsed.Ok === 'boolean') return parsed.Ok;
  return result.exitCode === 0;
}

function writeJson(name, value) {
  writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assertExists(filePath, label) {
  if (!existsSync(filePath)) throw new Error(`${label} not found: ${rel(filePath)}`);
}

function listFiles(root) {
  if (!existsSync(root)) return [];
  const results = [];
  for (const item of readdirSync(root)) {
    const full = path.join(root, item);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      results.push(...listFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}
