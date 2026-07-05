#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

const REQUIRED_MODULES = [
  'tenant',
  'users',
  'pages',
  'media',
  'theme',
  'forms',
  'contact',
  'importExport',
  'publish',
  'monitoring',
  'validation',
];

const FULL_PACKAGE_FILES = [
  'tenant-package.json',
  'tenant-profile.json',
  'domains.json',
  'brand.json',
  'theme.json',
  'pages/home.json',
  'pages/contact.json',
  'pages/service-areas.json',
  'forms/default-quote-request.json',
  'media/manifest.json',
  'users/admin-users.json',
  'publish/static-site.json',
  'validation/expected-routes.json',
];

const BASELINE_PAGES = ['home', 'contact', 'service-areas'];
const REQUIRED_RESPONSIVE_VIEWPORTS = [
  { label: 'small-mobile', width: 360, height: 800 },
  { label: 'iphone-standard', width: 375, height: 812 },
  { label: 'modern-mobile', width: 390, height: 844 },
  { label: 'large-mobile', width: 414, height: 896 },
  { label: 'large-modern-mobile', width: 430, height: 932 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 1200 },
];
const RESPONSIVE_ROUTE_HINTS = [
  '/contact',
  '/request-booking',
  '/reserve',
  '/packages',
  '/service-areas',
  '/airstrip-the-club',
];
const RESPONSIVE_RESULT_VALUES = new Set(['zero', 'documented']);
const SECRET_KEY_RE = /(password|apiKey|secret|token|cookie|connectionString|sas|bearer)/i;
const SECRET_VALUE_RE = /(AccountEndpoint=|SharedAccessSignature=|BEGIN PRIVATE KEY|Bearer\s+[A-Za-z0-9._-]{20,}|sig=[A-Za-z0-9%_-]{20,})/i;
const SECRET_KEY_ALLOWLIST = new Set([
  'passwordSource',
  'secureHandoffRequired',
  'secretSources',
]);

async function main() {
  const packageDir = path.resolve(process.argv[2] || '.');
  const explicitOut = getArgValue('--out');
  const result = {
    packageDir,
    valid: true,
    errors: [],
    warnings: [],
    checks: {},
    outputPath: '',
  };

  const files = await listFiles(packageDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));
  const parsed = new Map();

  for (const file of jsonFiles) {
    const rel = toPosix(path.relative(packageDir, file));
    try {
      parsed.set(rel, JSON.parse(await fs.readFile(file, 'utf8')));
    } catch (error) {
      result.errors.push(`Invalid JSON: ${rel}: ${error.message}`);
    }
  }

  const manifest = parsed.get('tenant-package.json');
  if (!manifest) {
    result.errors.push('Missing tenant-package.json');
  }

  const tenantId = manifest?.tenantId || parsed.get('tenant-profile.json')?.tenantId || 'unknown-tenant';
  const packageMode = manifest?.packageMode || 'unknown';
  result.tenantId = tenantId;
  result.packageMode = packageMode;

  checkModules(manifest, result);
  checkSecretLikeValues(parsed, result);

  if (packageMode === 'full-template') {
    checkRequiredFiles(packageDir, FULL_PACKAGE_FILES, result);
    checkTenantConsistency(parsed, tenantId, result);
    checkBaselinePages(parsed, result);
    checkMediaManifest(parsed.get('media/manifest.json'), result);
    checkUsers(parsed.get('users/admin-users.json'), result);
    checkForms(parsed, result);
    checkValidationRoutes(parsed.get('validation/expected-routes.json'), result);
    checkResponsiveRoutes(
      parsed.get('validation/responsive-routes.json'),
      parsed.get('validation/expected-routes.json'),
      manifest,
      tenantId,
      result,
    );
  } else if (packageMode === 'retrofit-summary') {
    checkRetrofitSummary(manifest, result);
  } else if (manifest) {
    result.errors.push(`Unsupported packageMode: ${packageMode}`);
  }

  result.valid = result.errors.length === 0;
  const outPath = explicitOut
    ? path.resolve(explicitOut)
    : path.resolve('.tmp', 'tenant-onboarding', sanitizePathSegment(tenantId), 'validation-summary.json');
  result.outputPath = outPath;
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    valid: result.valid,
    tenantId,
    packageMode,
    errors: result.errors.length,
    warnings: result.warnings.length,
    outputPath: toPosix(path.relative(process.cwd(), outPath)),
  }));

  if (!result.valid) {
    process.exitCode = 1;
  }
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return process.argv[index + 1] || '';
}

async function listFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function checkModules(manifest, result) {
  const modules = Array.isArray(manifest?.modules) ? manifest.modules : [];
  const missing = REQUIRED_MODULES.filter((moduleName) => !modules.includes(moduleName));
  result.checks.modules = { declared: modules.length, missing };
  for (const moduleName of missing) {
    result.errors.push(`Missing required module: ${moduleName}`);
  }
}

function checkRequiredFiles(packageDir, requiredFiles, result) {
  const missing = [];
  for (const rel of requiredFiles) {
    if (!existsSync(path.join(packageDir, rel))) {
      missing.push(rel);
      result.errors.push(`Missing required file: ${rel}`);
    }
  }
  result.checks.requiredFiles = { required: requiredFiles.length, missing };
}

function checkTenantConsistency(parsed, tenantId, result) {
  const mismatches = [];
  for (const [rel, json] of parsed.entries()) {
    for (const found of findTenantIds(json)) {
      if (found !== tenantId) {
        mismatches.push({ file: rel, tenantId: found });
        result.errors.push(`TenantId mismatch in ${rel}: ${found}`);
      }
    }
  }
  result.checks.tenantConsistency = { tenantId, mismatches };
}

function findTenantIds(value) {
  const ids = [];
  walk(value, (key, child) => {
    if (key === 'tenantId' && typeof child === 'string') ids.push(child);
  });
  return ids;
}

function checkBaselinePages(parsed, result) {
  const present = [];
  for (const slug of BASELINE_PAGES) {
    const page = parsed.get(`pages/${slug}.json`);
    if (page?.pageSlug === slug) {
      present.push(slug);
    } else {
      result.errors.push(`Missing or invalid baseline page: ${slug}`);
    }
  }
  result.checks.baselinePages = { required: BASELINE_PAGES, present };
}

function checkMediaManifest(manifest, result) {
  if (!manifest) return;
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  const missingRefs = assets
    .filter((asset) => !asset.fileRef && !asset.sourceRef)
    .map((asset) => asset.id || '(unnamed)');
  for (const id of missingRefs) {
    result.errors.push(`Media asset missing fileRef/sourceRef: ${id}`);
  }
  if (assets.length === 0) {
    result.warnings.push('Media manifest has no assets. This is acceptable for the blank template only.');
  }
  result.checks.media = { assetCount: assets.length, missingRefs };
}

function checkUsers(usersFile, result) {
  const users = Array.isArray(usersFile?.users) ? usersFile.users : [];
  if (users.length === 0) {
    result.errors.push('users/admin-users.json has no users');
  }
  for (const user of users) {
    if (!user.passwordSource) {
      result.errors.push(`User missing passwordSource: ${user.email || '(unknown)'}`);
    }
    if (Object.prototype.hasOwnProperty.call(user, 'password')) {
      result.errors.push(`User contains forbidden password field: ${user.email || '(unknown)'}`);
    }
  }
  result.checks.users = { userCount: users.length };
}

function checkForms(parsed, result) {
  const formEntries = [...parsed.entries()].filter(([rel]) => rel.startsWith('forms/') && rel.endsWith('.json'));
  if (formEntries.length === 0) {
    result.errors.push('No forms/*.json files found');
  }
  for (const [rel, form] of formEntries) {
    const fields = Array.isArray(form.fields) ? form.fields : [];
    if (fields.length === 0) {
      result.errors.push(`Form has no fields: ${rel}`);
    }
  }
  result.checks.forms = { formCount: formEntries.length };
}

function checkValidationRoutes(routesFile, result) {
  const routes = Array.isArray(routesFile?.expectedRoutes) ? routesFile.expectedRoutes : [];
  const requiredPaths = ['/', '/contact', '/service-areas'];
  for (const route of requiredPaths) {
    if (!routes.some((item) => item.path === route)) {
      result.errors.push(`validation/expected-routes.json missing route: ${route}`);
    }
  }
  result.checks.validationRoutes = { routeCount: routes.length };
}

function checkResponsiveRoutes(responsiveFile, expectedRoutesFile, manifest, tenantId, result) {
  const requiredByManifest = manifest?.responsiveReadinessRequired === true
    || manifest?.readiness?.responsiveReadinessRequired === true;
  const expectedPublicPaths = getExpectedPublicPaths(expectedRoutesFile);

  if (!responsiveFile) {
    result.checks.responsiveRoutes = {
      present: false,
      required: requiredByManifest,
      requiredViewports: REQUIRED_RESPONSIVE_VIEWPORTS.length,
      expectedPublicRoutes: expectedPublicPaths.length,
    };
    const message = 'Missing validation/responsive-routes.json. This file is required for packages converted or updated after V2.8.60V.';
    if (requiredByManifest) {
      result.errors.push(message);
    } else {
      result.warnings.push(message);
    }
    return;
  }

  const viewports = Array.isArray(responsiveFile.viewports) ? responsiveFile.viewports : [];
  const routes = Array.isArray(responsiveFile.routes) ? responsiveFile.routes : [];
  const routePaths = routes.map((route) => route.path).filter(Boolean);
  const checks = responsiveFile.checks || {};

  if (responsiveFile.tenantId !== tenantId) {
    result.errors.push(`Responsive tenantId mismatch: ${responsiveFile.tenantId || '(missing)'}`);
  }

  const missingViewports = REQUIRED_RESPONSIVE_VIEWPORTS.filter((required) => (
    !viewports.some((actual) => (
      actual.label === required.label
      && Number(actual.width) === required.width
      && Number(actual.height) === required.height
    ))
  ));
  for (const viewport of missingViewports) {
    result.errors.push(`validation/responsive-routes.json missing viewport: ${viewport.label} ${viewport.width}x${viewport.height}`);
  }

  const requiredRoutePaths = getRequiredResponsivePaths(expectedPublicPaths);
  const missingRoutes = requiredRoutePaths.filter((routePath) => !routePaths.includes(routePath));
  for (const routePath of missingRoutes) {
    result.errors.push(`validation/responsive-routes.json missing responsive route: ${routePath}`);
  }

  const minimumRouteCount = Math.min(3, Math.max(1, expectedPublicPaths.length));
  if (routePaths.length < minimumRouteCount) {
    result.errors.push(`validation/responsive-routes.json must include at least ${minimumRouteCount} responsive route(s)`);
  }

  for (const routePath of routePaths) {
    if (!routePath.startsWith('/')) {
      result.errors.push(`Responsive route must start with /: ${routePath}`);
    }
  }

  if (checks.horizontalOverflow !== true) {
    result.errors.push('Responsive checks must require horizontalOverflow detection');
  }
  if (checks.formsNoSubmit !== true) {
    result.errors.push('Responsive checks must require formsNoSubmit');
  }
  if (checks.missingImages !== 'zero') {
    result.errors.push('Responsive checks must require missingImages: zero');
  }
  if (!RESPONSIVE_RESULT_VALUES.has(checks.consoleErrors)) {
    result.errors.push('Responsive checks must set consoleErrors to zero or documented');
  }
  if (!RESPONSIVE_RESULT_VALUES.has(checks.failedRequests)) {
    result.errors.push('Responsive checks must set failedRequests to zero or documented');
  }

  const routesOutsideExpected = routePaths.filter((routePath) => (
    expectedPublicPaths.length > 0
    && !expectedPublicPaths.includes(routePath)
  ));
  if (routesOutsideExpected.length > 0) {
    result.warnings.push(`Responsive routes not present in validation/expected-routes.json: ${routesOutsideExpected.join(', ')}`);
  }

  result.checks.responsiveRoutes = {
    present: true,
    required: requiredByManifest,
    viewportCount: viewports.length,
    routeCount: routes.length,
    expectedPublicRoutes: expectedPublicPaths.length,
    missingViewports: missingViewports.map((viewport) => viewport.label),
    missingRoutes,
  };
}

function getExpectedPublicPaths(routesFile) {
  const routes = Array.isArray(routesFile?.expectedRoutes) ? routesFile.expectedRoutes : [];
  return routes
    .filter((route) => !route.method || route.method === 'GET')
    .map((route) => route.path)
    .filter((routePath) => (
      typeof routePath === 'string'
      && routePath.startsWith('/')
      && !routePath.startsWith('/api/')
      && !routePath.startsWith('/dashboard')
    ));
}

function getRequiredResponsivePaths(expectedPublicPaths) {
  const required = new Set();
  if (expectedPublicPaths.includes('/')) required.add('/');
  for (const routePath of RESPONSIVE_ROUTE_HINTS) {
    if (expectedPublicPaths.includes(routePath)) required.add(routePath);
  }
  return [...required];
}

function checkRetrofitSummary(manifest, result) {
  const summary = manifest?.retrofitSummary || {};
  const counts = summary.liveCounts || {};
  if (counts.themes === 0) {
    result.warnings.push('Retrofit summary has no permanent Theme baseline record.');
  }
  if (counts.formDefinitions === 0) {
    result.warnings.push('Retrofit summary has no permanent FormDefinition baseline record.');
  }
  if (!Array.isArray(summary.pages) || summary.pages.length < 3) {
    result.errors.push('Retrofit summary must include baseline pages.');
  }
  const assets = summary.mediaManifest?.assets || [];
  const missingRefs = assets.filter((asset) => !asset.fileRef && !asset.sourceRef).map((asset) => asset.id || '(unnamed)');
  for (const id of missingRefs) {
    result.errors.push(`Retrofit media asset missing fileRef/sourceRef: ${id}`);
  }
  result.checks.retrofit = {
    pages: Array.isArray(summary.pages) ? summary.pages.length : 0,
    mediaAssets: assets.length,
    knownGaps: Array.isArray(manifest.knownGaps) ? manifest.knownGaps.length : 0,
  };
}

function checkSecretLikeValues(parsed, result) {
  const hits = [];
  for (const [rel, json] of parsed.entries()) {
    walk(json, (key, value, pointer) => {
      if (typeof value !== 'string') return;
      if (SECRET_KEY_RE.test(key) && !SECRET_KEY_ALLOWLIST.has(key) && value.trim()) {
        hits.push(`${rel}${pointer}`);
      }
      if (SECRET_VALUE_RE.test(value)) {
        hits.push(`${rel}${pointer}`);
      }
    });
  }
  for (const hit of hits) {
    result.errors.push(`Secret-like value found in public package: ${hit}`);
  }
  result.checks.secretScan = { hits: hits.length };
}

function walk(value, visit, pointer = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${pointer}/${index}`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPointer = `${pointer}/${key}`;
    visit(key, child, childPointer);
    walk(child, visit, childPointer);
  }
}

function sanitizePathSegment(value) {
  return String(value || 'unknown-tenant').replace(/[^a-zA-Z0-9_.-]+/g, '-');
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

await main().catch((error) => {
  console.error(JSON.stringify({ valid: false, error: error.message }));
  process.exitCode = 1;
});
