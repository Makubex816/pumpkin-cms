import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import process from 'process';

const expected = {
  siteKey: 'ice-rink-rentals',
  appName: 'swa-ice-static-isolated-staging',
  resourceGroup: 'rg-ice-static-staging',
  defaultHostname: 'kind-island-0a85a740f.7.azurestaticapps.net',
  tokenEnvVar: 'SWA_CLI_DEPLOYMENT_TOKEN',
  swaCliPackage: '@azure/static-web-apps-cli@2.0.9',
};

const forbiddenArgs = new Set([
  '--deployment-token',
  '-d',
  '--print-token',
  '-pt',
  '--client-secret',
  '-CS',
]);

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }

  return args;
}

function walkFiles(rootDir) {
  const entries = readdirSync(rootDir, { withFileTypes: true });
  const files = [];

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

function validateArtifactRoot(artifactRoot) {
  const errors = [];
  const requiredFiles = [
    'index.html',
    'sitemap.xml',
    'robots.txt',
    path.join('contact', 'index.html'),
    path.join('service-areas', 'index.html'),
  ];

  if (!artifactRoot) {
    errors.push('Missing --artifact-root.');
    return { ok: false, errors, fileCount: 0 };
  }

  const resolvedRoot = path.resolve(artifactRoot);
  if (!existsSync(resolvedRoot)) {
    errors.push(`Artifact root does not exist: ${resolvedRoot}`);
    return { ok: false, errors, fileCount: 0, resolvedRoot };
  }

  if (!statSync(resolvedRoot).isDirectory()) {
    errors.push(`Artifact root is not a directory: ${resolvedRoot}`);
    return { ok: false, errors, fileCount: 0, resolvedRoot };
  }

  for (const requiredFile of requiredFiles) {
    const requiredPath = path.join(resolvedRoot, requiredFile);
    if (!existsSync(requiredPath) || !statSync(requiredPath).isFile()) {
      errors.push(`Missing required artifact file: ${requiredFile.split(path.sep).join('/')}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    fileCount: walkFiles(resolvedRoot).length,
    resolvedRoot,
  };
}

function checkForbiddenArgs(argv) {
  return argv.slice(2).filter((arg) => forbiddenArgs.has(arg));
}

function main() {
  const args = parseArgs(process.argv);
  const forbidden = checkForbiddenArgs(process.argv);
  const target = {
    appName: String(args['app-name'] || expected.appName),
    resourceGroup: String(args['resource-group'] || expected.resourceGroup),
    defaultHostname: String(args['default-hostname'] || expected.defaultHostname),
  };
  const artifact = validateArtifactRoot(args['artifact-root'] ? String(args['artifact-root']) : '');
  const tokenPresent = Boolean(process.env[expected.tokenEnvVar]);
  const targetMatchesExpected =
    target.appName === expected.appName &&
    target.resourceGroup === expected.resourceGroup &&
    target.defaultHostname === expected.defaultHostname;
  const errors = [
    ...artifact.errors,
    ...forbidden.map((arg) => `Forbidden deployment-secret argument supplied to readiness wrapper: ${arg}`),
  ];

  if (!targetMatchesExpected) {
    errors.push('Target values do not match the approved isolated Ice staging target.');
  }

  if (!tokenPresent) {
    errors.push(`Required deployment-token environment variable is not present: ${expected.tokenEnvVar}`);
  }

  const result = {
    ok: errors.length === 0,
    mode: 'readiness_check_only',
    siteKey: expected.siteKey,
    target,
    expectedTarget: {
      appName: expected.appName,
      resourceGroup: expected.resourceGroup,
      defaultHostname: expected.defaultHostname,
      customDomainsRequired: [],
    },
    artifactRoot: artifact.resolvedRoot || null,
    fileCount: artifact.fileCount,
    deploymentAuth: {
      requiredEnvVar: expected.tokenEnvVar,
      presentInCurrentProcess: tokenPresent,
      valuePrinted: false,
      tokenListingCommandUsed: false,
    },
    tooling: {
      supportedCommand: 'npx',
      package: expected.swaCliPackage,
      usesDeploymentTokenArgument: false,
      forbiddenPrintTokenFlag: true,
      futureCommandShape:
        `npx --yes ${expected.swaCliPackage} deploy "<artifact-root>" --env production`,
      tokenSource: `${expected.tokenEnvVar} process environment variable`,
    },
    deploymentAttempted: false,
    deploymentAuthorizedInThisPhase: false,
    errors,
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

main();
