import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import process from 'process';

const expected = {
  siteKey: 'ice-rink-rentals',
  appName: 'swa-ice-static-isolated-staging',
  resourceGroup: 'rg-ice-static-staging',
  defaultHostname: 'kind-island-0a85a740f.7.azurestaticapps.net',
  tokenEnvVar: 'SWA_CLI_DEPLOYMENT_TOKEN',
  swaCliPackage: '@azure/static-web-apps-cli@2.0.9',
  apiRuntime: 'node:20',
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
    'staticwebapp.config.json',
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

  const staticWebAppConfigPath = path.join(resolvedRoot, 'staticwebapp.config.json');
  if (existsSync(staticWebAppConfigPath)) {
    try {
      const staticWebAppConfig = JSON.parse(readFileSync(staticWebAppConfigPath, 'utf8'));
      if (staticWebAppConfig?.platform?.apiRuntime !== expected.apiRuntime) {
        errors.push(`staticwebapp.config.json platform.apiRuntime must be ${expected.apiRuntime}.`);
      }
    } catch (error) {
      errors.push(`staticwebapp.config.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    fileCount: walkFiles(resolvedRoot).length,
    resolvedRoot,
    apiRuntime: expected.apiRuntime,
  };
}

function validateV4ApiRoot(resolvedRoot) {
  const errors = [];
  const requiredFiles = [
    'host.json',
    'package.json',
    'package-lock.json',
    path.join('src', 'functions', 'static-contact.js'),
    'azure-function-static-contact.mjs',
    'azure-function-adapter.mjs',
    'contact-handler.mjs',
    'validate-static-form-payload.mjs',
    'sanitize-static-form-payload.mjs',
    'graph-send-mail-delivery.mjs',
  ];

  for (const requiredFile of requiredFiles) {
    const requiredPath = path.join(resolvedRoot, requiredFile);
    if (!existsSync(requiredPath) || !statSync(requiredPath).isFile()) {
      errors.push(`Missing required API file: ${requiredFile}`);
    }
  }

  const packagePath = path.join(resolvedRoot, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      if (packageJson?.main !== 'src/functions/static-contact.js') {
        errors.push('API package.json main must be src/functions/static-contact.js.');
      }
      if (!packageJson?.dependencies?.['@azure/functions']) {
        errors.push('API package.json must include @azure/functions in dependencies.');
      }
    } catch (error) {
      errors.push(`API package.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const packageLockPath = path.join(resolvedRoot, 'package-lock.json');
  if (existsSync(packageLockPath)) {
    try {
      const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
      if (!packageLock?.packages?.['node_modules/@azure/functions']) {
        errors.push('API package-lock.json does not include node_modules/@azure/functions.');
      }
    } catch (error) {
      errors.push(`API package-lock.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const adapterPath = path.join(resolvedRoot, 'azure-function-adapter.mjs');
  if (existsSync(adapterPath)) {
    const adapterText = readFileSync(adapterPath, 'utf8');
    if (!adapterText.includes("STATIC_CONTACT_PUBLIC_PATH = '/api/static-contact'")) {
      errors.push('API adapter does not declare STATIC_CONTACT_PUBLIC_PATH as /api/static-contact.');
    }
    if (!adapterText.includes("STATIC_CONTACT_ROUTE = 'static-contact'")) {
      errors.push('API adapter does not declare STATIC_CONTACT_ROUTE as static-contact.');
    }
  }

  const hostPath = path.join(resolvedRoot, 'host.json');
  if (existsSync(hostPath)) {
    try {
      const host = JSON.parse(readFileSync(hostPath, 'utf8'));
      if (host?.extensions?.http?.routePrefix !== 'api') {
        errors.push('API host.json routePrefix is not api.');
      }
    } catch (error) {
      errors.push(`API host.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    resolvedRoot,
    publicPath: '/api/static-contact',
    healthPath: null,
    programmingModel: 'azure-functions-v4-app-http',
  };
}

function validateV3CompatApiRoot(resolvedRoot) {
  const errors = [];
  const requiredFiles = [
    'host.json',
    'package.json',
    'package-lock.json',
    path.join('static-contact', 'function.json'),
    path.join('static-contact', 'index.js'),
    path.join('static-contact-health', 'function.json'),
    path.join('static-contact-health', 'index.js'),
    'contact-handler.mjs',
    'validate-static-form-payload.mjs',
    'sanitize-static-form-payload.mjs',
    'graph-send-mail-delivery.mjs',
  ];

  for (const requiredFile of requiredFiles) {
    const requiredPath = path.join(resolvedRoot, requiredFile);
    if (!existsSync(requiredPath) || !statSync(requiredPath).isFile()) {
      errors.push(`Missing required API file: ${requiredFile}`);
    }
  }

  const forbiddenV4Files = [
    path.join('src', 'functions', 'static-contact.js'),
    'azure-function-static-contact.mjs',
    'azure-function-adapter.mjs',
  ];

  for (const forbiddenFile of forbiddenV4Files) {
    const forbiddenPath = path.join(resolvedRoot, forbiddenFile);
    if (existsSync(forbiddenPath)) {
      errors.push(`V3-compatible API package must not include v4 registration file: ${forbiddenFile}`);
    }
  }

  const packagePath = path.join(resolvedRoot, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      if (packageJson?.dependencies?.['@azure/functions'] || packageJson?.devDependencies?.['@azure/functions']) {
        errors.push('V3-compatible API package must not include @azure/functions.');
      }
      if (packageJson?.main) {
        errors.push('V3-compatible API package should rely on function.json discovery and must not set package.json main.');
      }
    } catch (error) {
      errors.push(`API package.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const packageLockPath = path.join(resolvedRoot, 'package-lock.json');
  if (existsSync(packageLockPath)) {
    try {
      const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
      if (packageLock?.packages?.['node_modules/@azure/functions']) {
        errors.push('V3-compatible API package-lock.json must not include node_modules/@azure/functions.');
      }
    } catch (error) {
      errors.push(`API package-lock.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const hostPath = path.join(resolvedRoot, 'host.json');
  if (existsSync(hostPath)) {
    try {
      const host = JSON.parse(readFileSync(hostPath, 'utf8'));
      if (host?.extensions?.http?.routePrefix !== 'api') {
        errors.push('API host.json routePrefix is not api.');
      }
    } catch (error) {
      errors.push(`API host.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const contactFunctionPath = path.join(resolvedRoot, 'static-contact', 'function.json');
  if (existsSync(contactFunctionPath)) {
    try {
      const functionJson = JSON.parse(readFileSync(contactFunctionPath, 'utf8'));
      const trigger = functionJson?.bindings?.find((binding) => binding?.type === 'httpTrigger');
      const methods = new Set((trigger?.methods || []).map((method) => String(method).toLowerCase()));
      if (trigger?.route !== 'static-contact') {
        errors.push('static-contact function.json route must be static-contact.');
      }
      if (!methods.has('post') || !methods.has('options')) {
        errors.push('static-contact function.json must include POST and OPTIONS methods.');
      }
    } catch (error) {
      errors.push(`static-contact/function.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const healthFunctionPath = path.join(resolvedRoot, 'static-contact-health', 'function.json');
  if (existsSync(healthFunctionPath)) {
    try {
      const functionJson = JSON.parse(readFileSync(healthFunctionPath, 'utf8'));
      const trigger = functionJson?.bindings?.find((binding) => binding?.type === 'httpTrigger');
      const methods = new Set((trigger?.methods || []).map((method) => String(method).toLowerCase()));
      if (trigger?.route !== 'static-contact-health') {
        errors.push('static-contact-health function.json route must be static-contact-health.');
      }
      if (!methods.has('get')) {
        errors.push('static-contact-health function.json must include GET method.');
      }
    } catch (error) {
      errors.push(`static-contact-health/function.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}`);
    }
  }

  const apiFiles = walkFiles(resolvedRoot);
  for (const apiFile of apiFiles) {
    const relativePath = path.relative(resolvedRoot, apiFile).split(path.sep).join('/');
    if (relativePath.includes('node_modules/')) continue;
    const text = readFileSync(apiFile, 'utf8');
    if (text.includes("from '@azure/functions'") || text.includes("require('@azure/functions')") || text.includes('app.http(')) {
      errors.push(`V3-compatible API file contains v4 registration marker: ${relativePath}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    resolvedRoot,
    publicPath: '/api/static-contact',
    healthPath: '/api/static-contact-health',
    programmingModel: 'azure-functions-v3-function-json',
  };
}

function validateApiRoot(apiRoot, apiModel = 'v4') {
  const errors = [];

  if (!apiRoot) {
    errors.push('Missing --api-root.');
    return { ok: false, errors, fileCount: 0 };
  }

  const resolvedRoot = path.resolve(apiRoot);
  if (!existsSync(resolvedRoot)) {
    errors.push(`API root does not exist: ${resolvedRoot}`);
    return { ok: false, errors, fileCount: 0, resolvedRoot };
  }

  if (!statSync(resolvedRoot).isDirectory()) {
    errors.push(`API root is not a directory: ${resolvedRoot}`);
    return { ok: false, errors, fileCount: 0, resolvedRoot };
  }

  const modelResult = apiModel === 'v3-compat'
    ? validateV3CompatApiRoot(resolvedRoot)
    : validateV4ApiRoot(resolvedRoot);

  return {
    ...modelResult,
    fileCount: walkFiles(resolvedRoot).length,
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
  const apiModel = String(args['api-model'] || 'v4');
  const artifact = validateArtifactRoot(args['artifact-root'] ? String(args['artifact-root']) : '');
  const api = validateApiRoot(args['api-root'] ? String(args['api-root']) : '', apiModel);
  const tokenPresent = Boolean(process.env[expected.tokenEnvVar]);
  const targetMatchesExpected =
    target.appName === expected.appName &&
    target.resourceGroup === expected.resourceGroup &&
    target.defaultHostname === expected.defaultHostname;
  const errors = [
    ...artifact.errors,
    ...api.errors,
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
    apiRoot: api.resolvedRoot || null,
    fileCount: artifact.fileCount,
    apiFileCount: api.fileCount,
    apiDeploymentShape: {
      included: api.ok,
      publicPath: api.publicPath || '/api/static-contact',
      healthPath: api.healthPath || null,
      programmingModel: api.programmingModel || apiModel,
      swaCliFlag: '--api-location',
      apiRuntime: artifact.apiRuntime || expected.apiRuntime,
    },
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
        `cd "<package-root>"; npx --yes ${expected.swaCliPackage} deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "${expected.appName}" --resource-group "${expected.resourceGroup}" --env production --no-use-keychain`,
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
