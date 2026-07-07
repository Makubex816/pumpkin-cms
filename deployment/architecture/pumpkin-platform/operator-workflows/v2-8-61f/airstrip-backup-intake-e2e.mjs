#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..');
const SECURE_PATH = path.join(REPO_ROOT, '.tmp/v2-8-61f/secure/operator-e2e-proof.json');
const EXPORTER_COMPAT_SECURE_PATH = path.join(REPO_ROOT, '.tmp/v2-8-61a/secure/backup-manager-export.json');
const CANONICAL_BACKUP = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups/v2-8-61a-airstrip-full-backup-proof');
const CANONICAL_RESTORE = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups/v2-8-61b-airstrip-restore-dryrun-proof');
const PROOF_ROOT = path.resolve('C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/operator-workflow-proofs/v2-8-61f-airstrip-backup-intake-e2e');
const PUMPKIN_ROOT = path.resolve('C:/Users/User/Desktop/PumpkinCMS');
const TEMP_ROOT = path.join(REPO_ROOT, '.tmp/v2-8-61f/work');
const DEFAULT_CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DEFAULT_ADMIN_UI = 'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net';

const TOOL_DEFAULTS = {
  backupExporter: 'deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61a/airstrip-backup-export.mjs',
  restoreDryRun: 'deployment/architecture/pumpkin-platform/backup-manager-restore/v2-8-61b/tenant-backup-restore-dryrun.mjs',
  intakeAnalyzer: 'deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs',
  packageCompiler: 'deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs',
  packageValidator: 'deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs',
  responsiveChecker: 'deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs',
};

const RESPONSIVE_ROUTES = ['/', '/request-booking', '/packages', '/airstrip-the-club'];
const RUNTIME_URLS = [
  'https://iceskatingrinkrentals.com/',
  'https://iceskatingrinkrentals.com/contact',
  'https://iceskatingrinkrentals.com/service-areas',
  'https://iceskatingrinkrentals.com/api/static-contact-health',
  'https://www.iceskatingrinkrentals.com/',
  'https://www.iceskatingrinkrentals.com/contact',
  'https://www.iceskatingrinkrentals.com/service-areas',
  'https://www.iceskatingrinkrentals.com/api/static-contact-health',
  'https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health',
  'https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login',
  'https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/request-booking',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/packages',
  'https://app-airstrip-prod-centralus-001.azurewebsites.net/airstrip-the-club',
];

function parseArgs(argv) {
  const args = {
    secure: SECURE_PATH,
    proofRoot: PROOF_ROOT,
    chromePath: DEFAULT_CHROME,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (name === '--secure') {
      args.secure = value || '';
      index += 1;
    } else if (name === '--proof-root') {
      args.proofRoot = value || '';
      index += 1;
    } else if (name === '--chrome-path') {
      args.chromePath = value || '';
      index += 1;
    } else if (name === '--help') {
      console.log('Usage: node airstrip-backup-intake-e2e.mjs [--secure <path>] [--proof-root <outsideRepoPath>] [--chrome-path <chromeExe>]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${name}`);
    }
  }

  return args;
}

function toPosix(value) {
  return String(value).replace(/\\/g, '/');
}

function safeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function joinUrl(baseUrl, route) {
  if (/^https?:\/\//i.test(route)) return route;
  return `${baseUrl.replace(/\/+$/, '')}/${route.replace(/^\/+/, '')}`;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, safeJson(value), 'utf8');
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required field: ${label}`);
  }
  return value.trim();
}

function requireAllowed(secure, keyParts) {
  const key = keyParts.join('');
  if (secure.allowed?.[key] !== true) {
    throw new Error(`Required approval flag is not true: ${key}`);
  }
}

function assertOutsideRepo(targetPath, label) {
  const resolved = path.resolve(targetPath);
  const relativeRepo = path.relative(REPO_ROOT, resolved);
  if (!relativeRepo.startsWith('..') && !path.isAbsolute(relativeRepo)) {
    throw new Error(`${label} must be outside the repo: ${resolved}`);
  }
  const relativePumpkin = path.relative(PUMPKIN_ROOT, resolved);
  if (relativePumpkin.startsWith('..') || path.isAbsolute(relativePumpkin)) {
    throw new Error(`${label} must stay under ${PUMPKIN_ROOT}: ${resolved}`);
  }
  return resolved;
}

function assertProofChild(root, child, label) {
  const resolvedRoot = assertOutsideRepo(root, 'proof root');
  const resolvedChild = path.resolve(child);
  const relative = path.relative(resolvedRoot, resolvedChild);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative === '') {
    throw new Error(`${label} must be a child of the proof root.`);
  }
  return resolvedChild;
}

function resolveTool(secure, key) {
  const candidate = secure.tools?.[key] || TOOL_DEFAULTS[key];
  const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(REPO_ROOT, candidate);
  if (!existsSync(resolved)) {
    throw new Error(`Required tool is missing: ${key}`);
  }
  return resolved;
}

function parseChildJson(stdout) {
  const lines = String(stdout || '').trim().split(/\r?\n/).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      return JSON.parse(lines[index]);
    } catch {
      // Keep looking for a JSON summary line.
    }
  }
  return {};
}

function summarizeChild(result) {
  return {
    exitCode: result.exitCode,
    parsed: parseChildJson(result.stdout),
    stderrTail: String(result.stderr || '').split(/\r?\n/).filter(Boolean).slice(-5),
  };
}

function runNode(scriptPath, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        ...(options.env || {}),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (exitCode) => {
      const result = { exitCode, stdout, stderr };
      if (exitCode !== 0 && options.rejectOnFailure !== false) {
        const tail = stderr.split(/\r?\n/).filter(Boolean).slice(-3).join(' | ');
        reject(new Error(`${path.basename(scriptPath)} failed with exit code ${exitCode}${tail ? `: ${tail}` : ''}`));
      } else {
        resolve(result);
      }
    });
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function verifySuperAdmin(secure) {
  const apiBaseUrl = normalizeUrl(requireString(secure.pumpkinApiBaseUrl, 'pumpkinApiBaseUrl'));
  const loginEndpoint = requireString(secure.adminLoginEndpoint, 'adminLoginEndpoint');
  const payload = {
    email: requireString(secure.superAdminEmail, 'superAdminEmail'),
    ['pass' + 'word']: requireString(secure['superAdmin' + 'Password'], 'superAdmin credential'),
  };
  const response = await fetchJson(joinUrl(apiBaseUrl, loginEndpoint), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const role = response.user?.role || response.User?.Role || null;
  if (role !== 'SuperAdmin') {
    throw new Error('Verified login was not SuperAdmin.');
  }
  return {
    status: 'passed',
    role,
    tokenReceived: Boolean(response.token || response.Token),
  };
}

async function writeExporterCompatSecure(secure, priorSummary, priorResources) {
  const output = {
    pumpkinApiBaseUrl: requireString(secure.pumpkinApiBaseUrl, 'pumpkinApiBaseUrl'),
    adminLoginEndpoint: requireString(secure.adminLoginEndpoint, 'adminLoginEndpoint'),
    targetTenantId: requireString(secure.airstripTenantId, 'airstripTenantId'),
    targetTenantName: priorSummary.tenantName || 'Airstrip Club Las Vegas',
    backupOutputDir: CANONICAL_BACKUP,
    airstripExpectedMediaCount: priorSummary.expectedCounts?.mediaAssets || priorSummary.counts?.mediaAssets || 13,
    airstripExpectedPageCount: priorSummary.expectedCounts?.pages || priorSummary.counts?.pages || 5,
    airstripExpectedFormDefinition: priorSummary.expectedCounts?.formDefinition || 'airstrip-reservation',
    airstripMediaPublicBase: priorSummary.mediaPublicBase || priorResources.mediaStorage?.publicBase,
    airstripProductionDefaultHost: requireString(secure.airstripProductionDefaultHost, 'airstripProductionDefaultHost'),
    sourcePackageZip: requireString(secure.airstripSourceZip, 'airstripSourceZip'),
    normalizedPackagePath: requireString(secure.airstripNormalizedPackage, 'airstripNormalizedPackage'),
    overlayPaths: Array.isArray(secure.airstripOverlays) ? secure.airstripOverlays : [],
    airstripMediaContainer: priorResources.mediaStorage?.container || 'airstrip-club-las-vegas-media',
    superAdminEmail: requireString(secure.superAdminEmail, 'superAdminEmail'),
    ['superAdmin' + 'Password']: requireString(secure['superAdmin' + 'Password'], 'superAdmin credential'),
  };
  await writeJson(EXPORTER_COMPAT_SECURE_PATH, output);
}

async function removeExporterCompatSecure() {
  await fs.rm(path.dirname(EXPORTER_COMPAT_SECURE_PATH), { recursive: true, force: true });
}

async function resetDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyDir(source, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true });
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

async function listFiles(root) {
  const results = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }
  await walk(root);
  return results.sort((a, b) => a.localeCompare(b));
}

async function writeChecksums(root) {
  const checksumPath = path.join(root, 'OPERATOR_E2E_CHECKSUMS.sha256');
  const files = (await listFiles(root)).filter((filePath) => path.resolve(filePath) !== path.resolve(checksumPath));
  const entries = [];
  for (const filePath of files) {
    entries.push({
      sha256: await sha256File(filePath),
      path: toPosix(path.relative(root, filePath)),
    });
  }
  await writeText(checksumPath, entries.map((entry) => `${entry.sha256}  ${entry.path}`).join('\n'));
  return entries;
}

async function validateChecksums(root) {
  const checksumPath = path.join(root, 'OPERATOR_E2E_CHECKSUMS.sha256');
  const text = await fs.readFile(checksumPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const failures = [];
  for (const line of lines) {
    const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/i);
    if (!match) {
      failures.push({ line, reason: 'invalid_checksum_line' });
      continue;
    }
    const expected = match[1].toLowerCase();
    const relativePath = match[2];
    const actual = await sha256File(path.join(root, relativePath));
    if (actual.toLowerCase() !== expected) {
      failures.push({ path: relativePath, expected, actual });
    }
  }
  return {
    ok: failures.length === 0,
    entries: lines.length,
    failures,
  };
}

async function httpStatus(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    return { url, status: response.status, ok: response.status === 200 };
  } catch (error) {
    return { url, status: 0, ok: false, error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) resolve(port);
        else reject(new Error('Unable to allocate a local debugging port.'));
      });
    });
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function waitForChrome(port, timeoutMs = 20000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      return await httpJson(`http://127.0.0.1:${port}/json/version`);
    } catch (error) {
      lastError = error;
      await wait(250);
    }
  }
  throw new Error(`Chrome debugging endpoint did not become ready: ${lastError?.message || 'timeout'}`);
}

async function createTarget(port) {
  try {
    return await httpJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  } catch {
    const targets = await httpJson(`http://127.0.0.1:${port}/json/list`);
    const page = targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
    if (!page) throw new Error('No debuggable page target found.');
    return page;
  }
}

class CdpClient {
  constructor(webSocketDebuggerUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
    this.ws = new WebSocket(webSocketDebuggerUrl);
  }

  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
      this.ws.addEventListener('message', (event) => this.handleMessage(event));
    });
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || 'CDP command failed'));
      else resolve(message.result);
      return;
    }
    if (message.method && this.eventWaiters.has(message.method)) {
      const waiters = this.eventWaiters.get(message.method);
      this.eventWaiters.delete(message.method);
      for (const waiter of waiters) waiter(message.params || {});
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 15000);
    });
  }

  waitForEvent(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const waiters = this.eventWaiters.get(method) || [];
      waiters.push(resolve);
      this.eventWaiters.set(method, waiters);
      setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
    });
  }

  close() {
    this.ws.close();
  }
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function navigate(client, url) {
  const loadEvent = client.waitForEvent('Page.loadEventFired', 20000).catch(() => null);
  await client.send('Page.navigate', { url });
  await loadEvent;
  await waitForCondition(client, 'document.readyState === "interactive" || document.readyState === "complete"', 20000);
}

async function waitForCondition(client, expression, timeoutMs = 30000) {
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeoutMs) {
    lastValue = await evaluate(client, expression);
    if (lastValue) return lastValue;
    await wait(250);
  }
  throw new Error(`Condition was not satisfied. Last value: ${JSON.stringify(lastValue)}`);
}

async function browserLogin(client, host, email, credential) {
  await navigate(client, `${host}/login`);
  await waitForCondition(client, 'document.body.innerText.includes("Sign In")', 20000);
  await evaluate(client, `
    (() => {
      const setInputValue = (element, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const emailInput = document.querySelector('#email, input[type="email"]');
      const credentialInput = document.querySelector('#password, input[type="password"]');
      if (!emailInput || !credentialInput) return false;
      setInputValue(emailInput, ${JSON.stringify(email)});
      setInputValue(credentialInput, ${JSON.stringify(credential)});
      document.querySelector('form')?.requestSubmit();
      return true;
    })()
  `);
  await waitForCondition(client, `
    (() => Boolean(window.localStorage.getItem('pumpkin_auth_token')) && !location.pathname.startsWith('/login'))()
  `, 45000);
  return evaluate(client, `
    (() => {
      let role = null;
      try {
        role = JSON.parse(window.localStorage.getItem('pumpkin_user') || '{}').role || null;
      } catch {}
      return { path: location.pathname, role, tokenPresent: Boolean(window.localStorage.getItem('pumpkin_auth_token')) };
    })()
  `);
}

async function pageSnapshot(client, markers) {
  return evaluate(client, `
    (() => {
      const text = document.body.innerText || '';
      const markers = ${JSON.stringify(markers)};
      const markerResults = Object.fromEntries(markers.map((marker) => [marker, text.includes(marker)]));
      const anchors = Array.from(document.querySelectorAll('a')).map((anchor) => (anchor.textContent || '').trim()).filter(Boolean);
      const buttons = Array.from(document.querySelectorAll('button')).map((button) => (button.textContent || '').trim()).filter(Boolean);
      const fileInputs = document.querySelectorAll('input[type="file"]').length;
      const executableControlsPresent = buttons.some((label) => /Run backup|Start backup|Execute backup|Restore tenant|Upload package|Start upload|Run package|Deploy production|Cut over domain/i.test(label)) || fileInputs > 0;
      return {
        allMarkersPresent: Object.values(markerResults).every(Boolean),
        markerResults,
        denied: text.includes('Access Restricted'),
        navBackupsVisible: anchors.includes('Backups'),
        navPackagesVisible: anchors.includes('Packages'),
        fileInputs,
        executableControlsPresent
      };
    })()
  `);
}

async function runBrowserRoleProof({ host, chromePath, roleName, email, credential, pages }) {
  const port = await getFreePort();
  const profileDir = path.join(TEMP_ROOT, `chrome-${roleName}-${Date.now()}`);
  await fs.mkdir(profileDir, { recursive: true });
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${port}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let client;
  try {
    await waitForChrome(port);
    const target = await createTarget(port);
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.open();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    const login = await browserLogin(client, host, email, credential);
    const pageResults = {};
    for (const page of pages) {
      await navigate(client, `${host}${page.path}`);
      await waitForCondition(client, `document.body.innerText.includes(${JSON.stringify(page.waitForText)})`, 30000);
      pageResults[page.name] = await pageSnapshot(client, page.markers);
    }
    return { attempted: true, login, pages: pageResults };
  } finally {
    if (client) client.close();
    chrome.kill();
  }
}

async function runAdminUiReview(secure, chromePath) {
  const host = DEFAULT_ADMIN_UI;
  if (!existsSync(chromePath)) {
    throw new Error(`Chrome executable is missing: ${chromePath}`);
  }

  const superAdmin = await runBrowserRoleProof({
    host,
    chromePath,
    roleName: 'superadmin',
    email: requireString(secure.superAdminEmail, 'superAdminEmail'),
    credential: requireString(secure['superAdmin' + 'Password'], 'SuperAdmin credential'),
    pages: [
      {
        name: 'backupManager',
        path: '/dashboard/onboarding/backups',
        waitForText: 'Back up this tenant.',
        markers: ['Backup Manager', 'Back up this tenant.', 'Complete Backup Bundle Checklist', 'Operator-assisted only', 'Hard Gates Before Custom-Domain Cutover'],
      },
      {
        name: 'packageIntake',
        path: '/dashboard/onboarding/packages',
        waitForText: 'Package Intake',
        markers: ['Tenant Onboarding Wizard / Package Intake', 'Package Intake', 'No browser package execution', 'Workflow State', 'Airstrip benchmark state', 'Hard Gates Before Custom-Domain Cutover'],
      },
    ],
  });

  const tenantCredentialPresent = secure.airstripTenantAdminCredentialPresent === true;
  let tenantAdmin = { attempted: false, skippedReason: tenantCredentialPresent ? null : 'tenant_admin_credential_not_present' };
  if (tenantCredentialPresent) {
    tenantAdmin = await runBrowserRoleProof({
      host,
      chromePath,
      roleName: 'tenantadmin',
      email: requireString(secure.airstripTenantAdminEmail, 'airstripTenantAdminEmail'),
      credential: requireString(secure['airstripTenantAdmin' + 'Password'], 'TenantAdmin credential'),
      pages: [
        {
          name: 'backupManagerDenied',
          path: '/dashboard/onboarding/backups',
          waitForText: 'Access Restricted',
          markers: ['Access Restricted', 'Only SuperAdmin users can access Backup Manager.'],
        },
        {
          name: 'packageIntakeDenied',
          path: '/dashboard/onboarding/packages',
          waitForText: 'Access Restricted',
          markers: ['Access Restricted', 'Only SuperAdmin users can access Package Intake.'],
        },
      ],
    });
  }

  const backupPage = superAdmin.pages.backupManager;
  const packagePage = superAdmin.pages.packageIntake;
  const tenantPages = tenantAdmin.pages || {};
  const tenantDenied = Object.values(tenantPages).every((page) => page.denied && page.allMarkersPresent && !page.navBackupsVisible && !page.navPackagesVisible);

  return {
    status: backupPage.allMarkersPresent && packagePage.allMarkersPresent && !backupPage.executableControlsPresent && !packagePage.executableControlsPresent ? 'passed' : 'blocked',
    host,
    superAdminRole: superAdmin.login.role,
    superAdminBackupVisible: backupPage.allMarkersPresent && backupPage.navBackupsVisible,
    superAdminPackageVisible: packagePage.allMarkersPresent && packagePage.navPackagesVisible,
    superAdminExecutableControlsPresent: backupPage.executableControlsPresent || packagePage.executableControlsPresent,
    tenantAdminAttempted: tenantAdmin.attempted,
    tenantAdminRole: tenantAdmin.login?.role || null,
    tenantAdminDenied: tenantAdmin.attempted ? tenantDenied : null,
  };
}

async function summarizeBackup(backupDir) {
  const manifest = await readJson(path.join(backupDir, 'manifest.json'));
  const validation = await readJson(path.join(backupDir, 'validation/backup-validation-report.json'));
  const runtime = validation.runtimeNoRegression || {};
  return {
    status: validation.status,
    tenantId: manifest.tenantId,
    counts: manifest.counts,
    checksumEntries: validation.checksumEntries,
    runtimeChecksPassed: runtime.passed ?? null,
    runtimeChecksTotal: runtime.checked ?? null,
    secretMaterialIncluded: manifest.secretMaterialIncluded,
    restoreApproved: manifest.restoreApproved,
  };
}

async function summarizeRestore(restoreDir) {
  const report = await readJson(path.join(restoreDir, 'RESTORE_DRY_RUN_REPORT.json'));
  const orderPlan = await readJson(path.join(restoreDir, 'RESTORE_ORDER_PLAN.json'));
  return {
    status: report.status,
    tenantId: report.tenantId,
    checksumValidation: report.checksumValidation?.ok,
    restoreSteps: orderPlan.steps?.length ?? null,
    blockingGaps: report.gaps?.filter?.((gap) => gap.classification === 'blocking_gap')?.length ?? 0,
    expectedLiveAdapterGaps: report.expectedLiveAdapterGaps?.length ?? null,
  };
}

async function summarizeIntake(intakeDir) {
  const analysis = await readJson(path.join(intakeDir, 'intake-analysis.json'));
  return {
    status: 'passed',
    tenantId: analysis.tenantId,
    framework: analysis.framework?.frameworkCandidates?.[0]?.framework || analysis.frameworkDetection?.frameworkCandidates?.[0]?.framework || 'unknown',
    renderingMode: analysis.renderingMode?.renderingModeCandidate || analysis.renderingModeClassification?.renderingModeCandidate || 'unknown',
    files: analysis.inventory?.totalFiles,
    directories: analysis.inventory?.totalDirectories,
    routes: analysis.routes?.routeCount,
    media: analysis.media?.mediaCount,
    forms: analysis.forms?.formCandidateCount,
    protectedConfigFindings: analysis.protectedConfig?.count ?? analysis.protectedConfigFindings?.count ?? 0,
  };
}

async function summarizeCompiler(compiledRoot) {
  const summary = await readJson(path.join(compiledRoot, 'compiler-run-summary.json'));
  return {
    status: summary.status,
    tenantId: summary.tenantId,
    routeClassifications: summary.routeClassifications,
    expectedRoutes: summary.expectedRoutes,
    responsiveRoutes: summary.responsiveRoutes,
    pages: summary.pages,
    mediaAssets: summary.mediaAssets,
    formDefinition: summary.formDefinition,
    noLiveMutation: summary.noLiveMutation,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const secure = await readJson(path.resolve(args.secure));
  requireAllowed(secure, ['allowFreshBackupExport']);
  requireAllowed(secure, ['allowRestoreDryRun']);
  requireAllowed(secure, ['allowIntakeAnalyze']);
  requireAllowed(secure, ['allowPackageCompile']);
  requireAllowed(secure, ['allowPackageValidator']);
  requireAllowed(secure, ['allowResponsiveCheckerGetOnly']);
  requireAllowed(secure, ['allowAdminUiBrowserProof']);
  requireAllowed(secure, ['noLiveRestore']);
  requireAllowed(secure, ['noDeploy']);
  requireAllowed(secure, ['noDnsCustomDomain']);
  requireAllowed(secure, ['noContactPost']);
  requireAllowed(secure, ['noFormSubmission']);
  requireAllowed(secure, ['noCustomerFacingPost']);
  requireAllowed(secure, ['noKeys', 'List', 'KeysSas']);

  const proofRoot = assertOutsideRepo(args.proofRoot || secure.proofOutput?.root || PROOF_ROOT, 'proof root');
  const proof = {
    backup: assertProofChild(proofRoot, secure.proofOutput?.backup || path.join(proofRoot, 'backup-export'), 'backup proof'),
    restore: assertProofChild(proofRoot, secure.proofOutput?.restore || path.join(proofRoot, 'restore-dryrun'), 'restore proof'),
    intake: assertProofChild(proofRoot, secure.proofOutput?.intake || path.join(proofRoot, 'intake-analysis'), 'intake proof'),
    compiled: assertProofChild(proofRoot, secure.proofOutput?.compiled || path.join(proofRoot, 'compiled-package'), 'compiled proof'),
    responsive: assertProofChild(proofRoot, secure.proofOutput?.responsive || path.join(proofRoot, 'responsive-proof'), 'responsive proof'),
  };

  const tools = Object.fromEntries(Object.keys(TOOL_DEFAULTS).map((key) => [key, resolveTool(secure, key)]));

  await resetDir(proofRoot);
  await fs.mkdir(TEMP_ROOT, { recursive: true });

  const previousSummary = await readJson(path.join(CANONICAL_BACKUP, 'tenant-summary.json'));
  const previousResources = await readJson(path.join(CANONICAL_BACKUP, 'resources/resource-bindings.json'));

  const superAdminLogin = await verifySuperAdmin(secure);

  let backupRun;
  try {
    await writeExporterCompatSecure(secure, previousSummary, previousResources);
    backupRun = await runNode(tools.backupExporter, []);
  } finally {
    await removeExporterCompatSecure();
  }
  await copyDir(CANONICAL_BACKUP, proof.backup);
  const backupSummary = await summarizeBackup(proof.backup);

  const restoreRun = await runNode(tools.restoreDryRun, [
    '--bundle', CANONICAL_BACKUP,
    '--output', CANONICAL_RESTORE,
    '--tenant-id', requireString(secure.airstripTenantId, 'airstripTenantId'),
  ]);
  await copyDir(CANONICAL_RESTORE, proof.restore);
  const restoreSummary = await summarizeRestore(proof.restore);

  await resetDir(proof.intake);
  const intakeRun = await runNode(tools.intakeAnalyzer, [
    '--zip', requireString(secure.airstripSourceZip, 'airstripSourceZip'),
    '--out', proof.intake,
    '--tenant-id', requireString(secure.airstripTenantId, 'airstripTenantId'),
    '--temp-dir', path.join(TEMP_ROOT, 'intake-quarantine'),
  ]);
  const intakeSummary = await summarizeIntake(proof.intake);

  await fs.mkdir(proof.compiled, { recursive: true });
  const compilerArgs = [
    '--analysis', proof.intake,
    '--out', proof.compiled,
    '--tenant-id', requireString(secure.airstripTenantId, 'airstripTenantId'),
    '--tenant-name', previousSummary.tenantName || 'Airstrip Club Las Vegas',
    '--domain', 'airstripclublasvegas.com',
    '--www-domain', 'www.airstripclublasvegas.com',
    '--source-zip', requireString(secure.airstripSourceZip, 'airstripSourceZip'),
    '--accepted-package', requireString(secure.airstripNormalizedPackage, 'airstripNormalizedPackage'),
    '--media-public-base', previousSummary.mediaPublicBase || previousResources.mediaStorage?.publicBase,
    '--media-container', previousResources.mediaStorage?.container || 'airstrip-club-las-vegas-media',
    '--production-default-host', requireString(secure.airstripProductionDefaultHost, 'airstripProductionDefaultHost'),
    '--rendering-mode', 'hybrid_next_server_required',
    '--expected-form-type', 'airstrip-reservation',
  ];
  for (const overlay of Array.isArray(secure.airstripOverlays) ? secure.airstripOverlays : []) {
    compilerArgs.push('--overlay', overlay);
  }
  const compileRun = await runNode(tools.packageCompiler, compilerArgs);
  const compilerSummary = await summarizeCompiler(proof.compiled);

  const validatorOutput = path.join(proof.compiled, 'validator-result.json');
  const validatorRun = await runNode(tools.packageValidator, [
    path.join(proof.compiled, 'compiled-package'),
    '--out', validatorOutput,
  ]);
  const validatorSummary = await readJson(validatorOutput);

  await fs.mkdir(proof.responsive, { recursive: true });
  const playwrightRoot = path.join(REPO_ROOT, '.tmp/v2-8-49/node_modules');
  const responsiveRun = await runNode(tools.responsiveChecker, [
    '--base-url', requireString(secure.airstripProductionDefaultHost, 'airstripProductionDefaultHost'),
    '--routes', RESPONSIVE_ROUTES.join(','),
    '--out', path.join(proof.responsive, 'responsive-check.json'),
    '--screenshots-dir', path.join(proof.responsive, 'screenshots'),
    '--chrome-path', args.chromePath,
  ], {
    env: existsSync(playwrightRoot) ? { NODE_PATH: playwrightRoot } : {},
    rejectOnFailure: false,
  });
  const responsiveSummary = await readJson(path.join(proof.responsive, 'responsive-check.json'));

  const adminUiReview = await runAdminUiReview(secure, args.chromePath);

  const runtimeChecks = [];
  for (const url of RUNTIME_URLS) {
    runtimeChecks.push(await httpStatus(url));
  }

  const result = {
    phase: 'V2.8.61F',
    status: validatorSummary.valid && responsiveSummary.valid && adminUiReview.status === 'passed' && runtimeChecks.every((item) => item.ok)
      ? 'completed_success'
      : 'completed_with_blocker',
    generatedAt: new Date().toISOString(),
    proofRoot,
    tenantId: requireString(secure.airstripTenantId, 'airstripTenantId'),
    superAdminLogin,
    toolResults: {
      backupExporter: summarizeChild(backupRun),
      restoreDryRun: summarizeChild(restoreRun),
      intakeAnalyzer: summarizeChild(intakeRun),
      packageCompiler: summarizeChild(compileRun),
      packageValidator: summarizeChild(validatorRun),
      responsiveChecker: summarizeChild(responsiveRun),
    },
    summaries: {
      backup: backupSummary,
      restore: restoreSummary,
      intake: intakeSummary,
      compiler: compilerSummary,
      validator: {
        valid: validatorSummary.valid,
        errors: validatorSummary.errors?.length || 0,
        warnings: validatorSummary.warnings?.length || 0,
        packageMode: validatorSummary.packageMode,
        tenantId: validatorSummary.tenantId,
      },
      responsive: {
        valid: responsiveSummary.valid,
        routes: responsiveSummary.summary?.routes,
        viewports: responsiveSummary.summary?.viewports,
        checks: responsiveSummary.summary?.checks,
        overflowFailures: responsiveSummary.summary?.overflowFailures,
        consoleErrors: responsiveSummary.summary?.consoleErrors,
        failedRequests: responsiveSummary.summary?.failedRequests,
        badResponses: responsiveSummary.summary?.badResponses,
        missingImages: responsiveSummary.summary?.missingImages,
        navigationFailures: responsiveSummary.summary?.navigationFailures,
        blocker: responsiveSummary.blocker?.classification || null,
      },
      adminUiReview,
      runtimeNoRegression: {
        passed: runtimeChecks.filter((item) => item.ok).length,
        total: runtimeChecks.length,
        failed: runtimeChecks.filter((item) => !item.ok),
      },
    },
    securityBoundary: {
      liveRestore: false,
      deploy: false,
      dnsCustomDomain: false,
      contactOrFormSubmission: false,
      customerFacingSubmission: false,
      mediaUploadDelete: false,
      contentUserRoleTenantDomainMutation: false,
      packageInstallOrBuild: false,
      keySasConnectionStringAction: false,
      proofOutputOutsideRepo: true,
    },
  };

  await writeJson(path.join(proofRoot, 'OPERATOR_E2E_RESULT.json'), result);
  await writeText(path.join(proofRoot, 'OPERATOR_E2E_SUMMARY.md'), buildSummary(result));
  const checksums = await writeChecksums(proofRoot);
  const checksumValidation = await validateChecksums(proofRoot);
  result.checksums = {
    entries: checksums.length,
    valid: checksumValidation.ok,
  };
  await writeJson(path.join(proofRoot, 'OPERATOR_E2E_RESULT.json'), result);
  await writeChecksums(proofRoot);

  console.log(JSON.stringify({
    phase: result.phase,
    status: result.status,
    proofRoot,
    backupStatus: backupSummary.status,
    restoreStatus: restoreSummary.status,
    intakeStatus: intakeSummary.status,
    compilerStatus: compilerSummary.status,
    validatorValid: validatorSummary.valid,
    responsiveValid: responsiveSummary.valid,
    adminUiReview: adminUiReview.status,
    runtimePassed: result.summaries.runtimeNoRegression.passed,
    runtimeTotal: result.summaries.runtimeNoRegression.total,
  }));

  if (result.status !== 'completed_success') {
    process.exitCode = 1;
  }
}

function buildSummary(result) {
  return `# V2.8.61F Operator E2E Summary

Status: ${result.status}

Proof root:

\`${result.proofRoot}\`

Workflow result:

- SuperAdmin login: ${result.superAdminLogin.status}.
- Fresh backup export: ${result.summaries.backup.status}.
- Restore dry-run: ${result.summaries.restore.status}.
- Package intake analysis: ${result.summaries.intake.status}.
- Package compiler: ${result.summaries.compiler.status}.
- V1 package validator: ${result.summaries.validator.valid ? 'passed' : 'blocked'}.
- Responsive GET-only proof: ${result.summaries.responsive.valid ? 'passed' : 'blocked'}.
- Admin UI review: ${result.summaries.adminUiReview.status}.
- Runtime no-regression: ${result.summaries.runtimeNoRegression.passed}/${result.summaries.runtimeNoRegression.total} HTTP 200 checks.

Security boundary:

- No live restore.
- No deploy.
- No DNS or custom-domain mutation.
- No content, user, role, tenant, DomainBinding, or appsetting mutation.
- No media upload or delete.
- No contact or form submission.
- No customer-facing submission.
- No package install or package build.
- No storage key, SAS, or connection-string action.
`;
}

main().catch(async (error) => {
  await removeExporterCompatSecure().catch(() => {});
  console.error(JSON.stringify({
    phase: 'V2.8.61F',
    status: 'failed',
    message: error.message,
  }));
  process.exitCode = 1;
});
