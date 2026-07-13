import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = parseArgs(process.argv.slice(2));
const baseUrl = String(args['base-url'] || '').replace(/\/+$/, '');
const fixturePath = path.resolve(args.fixture || 'preview-fixtures/strip-club-near-me-vegas/preview.json');
const outputPath = path.resolve(args.output || '../../.tmp/v2-8-62f/browser-proof.json');
const screenshotRoot = path.resolve(args.screenshots || '../../.tmp/v2-8-62f/screenshots');
const executablePath = args.browser || findBrowser();
assert(baseUrl, '--base-url is required.');
assert(executablePath, 'Chrome or Edge executable was not found.');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const previewBasePath = `/preview/${fixture.tenantId}`;
const viewports = [
  { width: 375, height: 812, label: 'mobile-small' },
  { width: 390, height: 844, label: 'mobile-standard' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1366, height: 900, label: 'desktop' },
];
const routes = Object.values(fixture.routes).sort((left, right) => left.route.localeCompare(right.route));
const redirects = new Map(fixture.redirects.map((redirect) => [redirect.sourcePath, redirect]));
const storageKey = `pumpkin_preview_age_${fixture.tenantId}`;
const allowedPlatformCookieNames = new Set(['ARRAffinity', 'ARRAffinitySameSite']);
const browser = await chromium.launch({ executablePath, headless: true });
const globalNetwork = { posts: [], airstrip: [], failures: [], httpErrors: [] };
const routeResults = [];
const redirectResults = [];
const interactionResults = [];
const observedPlatformCookieNames = new Set();
let ageGateResult;

try {
  await proveAgeGate();
  await proveRedirects();
  await proveCanonicalMedia();
  await proveResponsiveRoutes();
  await proveInteractionClasses();

  process.stdout.write(`${JSON.stringify({
    stage: 'network-summary',
    posts: globalNetwork.posts,
    airstrip: globalNetwork.airstrip,
    failures: globalNetwork.failures,
    httpErrors: globalNetwork.httpErrors,
  })}\n`);
  const routeRenderCount = routeResults.length;
  const redirectProofCount = redirectResults.length;
  const overflowFailures = routeResults.filter((item) => item.horizontalOverflow).length;
  const brokenImages = routeResults.reduce((sum, item) => sum + item.brokenImages, 0);
  const pendingImages = routeResults.reduce((sum, item) => sum + item.pendingImages, 0);
  const formInstances = routeResults.reduce((sum, item) => sum + item.forms, 0);
  const controls = routeResults.reduce((sum, item) => sum + item.controls, 0);
  const links = routeResults.reduce((sum, item) => sum + item.links, 0);
  const airstripLinks = routeResults.reduce((sum, item) => sum + item.airstripLinks, 0);
  const passed = globalNetwork.posts.length === 0
    && globalNetwork.airstrip.length === 0
    && globalNetwork.failures.length === 0
    && globalNetwork.httpErrors.length === 0
    && routeRenderCount === routes.length * viewports.length
    && redirectProofCount === fixture.redirects.length * viewports.length
    && overflowFailures === 0
    && brokenImages === 0
    && pendingImages === 0
    && formInstances === fixture.counts.effectiveFormInstances * viewports.length
    && controls === fixture.counts.effectiveControls * viewports.length
    && links === fixture.counts.effectiveLinks * viewports.length
    && airstripLinks === fixture.counts.effectiveAirstripLinks * viewports.length;

  const report = {
    schemaVersion: 'pumpkin-preview-browser-proof/v1',
    status: passed ? 'passed' : 'failed',
    tenantId: fixture.tenantId,
    fixtureSha256: fixture.integrity.fixtureSha256,
    baseUrl,
    counts: {
      routeRenders: routeRenderCount,
      redirectProofs: redirectProofCount,
      screenshots: routeRenderCount,
      canonicalMediaGets: fixture.media.canonical.length,
      aliasesValidated: fixture.media.aliases.length,
      effectiveFormsPerViewport: fixture.counts.effectiveFormInstances,
      effectiveControlsPerViewport: fixture.counts.effectiveControls,
      effectiveLinksPerViewport: fixture.counts.effectiveLinks,
      effectiveAirstripLinksPerViewport: fixture.counts.effectiveAirstripLinks,
      postRequests: globalNetwork.posts.length,
      airstripRequests: globalNetwork.airstrip.length,
      failedRequests: globalNetwork.failures.length,
      httpErrors: globalNetwork.httpErrors.length,
      overflowFailures,
      brokenImages,
      pendingImages,
    },
    network: globalNetwork,
    ageGate: ageGateResult,
    interactions: interactionResults,
    redirects: redirectResults,
    routes: routeResults,
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ status: report.status, counts: report.counts, outputPath })}\n`);
  assert.equal(globalNetwork.posts.length, 0, `POST requests occurred: ${globalNetwork.posts.join(', ')}`);
  assert.equal(globalNetwork.airstrip.length, 0, `Airstrip requests occurred: ${globalNetwork.airstrip.join(', ')}`);
  assert.equal(globalNetwork.failures.length, 0, `Required network failures occurred: ${globalNetwork.failures.join(', ')}`);
  assert.equal(globalNetwork.httpErrors.length, 0, `Required HTTP errors occurred: ${globalNetwork.httpErrors.join(', ')}`);
  assert.equal(routeRenderCount, routes.length * viewports.length);
  assert.equal(redirectProofCount, fixture.redirects.length * viewports.length);
  assert.equal(overflowFailures, 0);
  assert.equal(brokenImages, 0);
  assert.equal(pendingImages, 0);
  assert.equal(formInstances, fixture.counts.effectiveFormInstances * viewports.length);
  assert.equal(controls, fixture.counts.effectiveControls * viewports.length);
  assert.equal(links, fixture.counts.effectiveLinks * viewports.length);
  assert.equal(airstripLinks, fixture.counts.effectiveAirstripLinks * viewports.length);
} finally {
  await browser.close();
}

async function proveAgeGate() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  attachNetworkGuards(context);
  const page = await context.newPage();
  await page.goto(`${baseUrl}${previewBasePath}`, { waitUntil: 'networkidle' });
  const gate = page.locator('[data-pumpkin-age-gate]');
  await gate.waitFor({ state: 'visible' });
  assert.equal(await page.locator(`#package-preview-${fixture.tenantId}`).getAttribute('inert'), '');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'I am 21 or older');
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await assertCookieBoundary(context);
  await gate.locator('button', { hasText: 'I am 21 or older' }).click();
  await gate.waitFor({ state: 'detached' });
  assert.equal(await page.locator(`#package-preview-${fixture.tenantId}`).getAttribute('inert'), null);
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), storageKey), '1');
  await page.goto(`${baseUrl}${previewBasePath}/clubs`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-pumpkin-age-gate]').count(), 0);
  await assertCookieBoundary(context);
  await context.close();

  const newSession = await browser.newContext({ viewport: { width: 390, height: 844 } });
  attachNetworkGuards(newSession);
  const newPage = await newSession.newPage();
  await newPage.goto(`${baseUrl}${previewBasePath}`, { waitUntil: 'networkidle' });
  assert.equal(await newPage.locator('[data-pumpkin-age-gate]').count(), 1);
  await newPage.locator('[data-pumpkin-age-gate] button', { hasText: 'Leave preview' }).click();
  await newPage.waitForURL((url) => url.pathname === '/');
  assert.equal(new URL(newPage.url()).pathname, '/');
  await assertCookieBoundary(newSession);
  await newSession.close();

  ageGateResult = {
    freshSessionLocked: true,
    backgroundInertBeforeAcknowledgement: true,
    keyboardFocusManaged: true,
    acknowledgedSessionUnlocked: true,
    sameSessionNavigationUnlocked: true,
    newSessionLockedAgain: true,
    exitActionReturnedToStarterRoot: true,
    localStorageEntries: 0,
    applicationCookies: 0,
    allowedPlatformCookieNames: [...observedPlatformCookieNames].sort(),
    personalDataPersisted: false,
  };
}

async function assertCookieBoundary(context) {
  const cookies = await context.cookies();
  const applicationCookies = cookies.filter((cookie) => {
    const allowed = allowedPlatformCookieNames.has(cookie.name) && cookie.httpOnly && cookie.secure;
    if (allowed) observedPlatformCookieNames.add(cookie.name);
    return !allowed;
  });
  assert.deepEqual(
    applicationCookies.map((cookie) => cookie.name),
    [],
    'The preview must not set application or age-gate cookies.',
  );
}

async function proveRedirects() {
  for (const viewport of viewports) {
    for (const redirect of fixture.redirects) {
      const sourceUrl = `${baseUrl}${previewBasePath}${redirect.sourcePath}?campaign=${viewport.label}`;
      const response = await fetch(sourceUrl, { redirect: 'manual' });
      assert.equal(response.status, redirect.statusCode);
      const location = response.headers.get('location');
      assert(location, `Redirect has no Location header: ${sourceUrl}`);
      const parsed = new URL(location, baseUrl);
      assert.equal(parsed.pathname, `${previewBasePath}${redirect.targetPath}`);
      assert.equal(parsed.searchParams.get('campaign'), viewport.label);
      const target = await fetch(parsed);
      assert.equal(target.status, 200);
      redirectResults.push({ viewport: viewport.label, sourcePath: redirect.sourcePath, targetPath: redirect.targetPath, statusCode: response.status, queryPreserved: true, targetStatus: target.status });
    }
  }
}

async function proveCanonicalMedia() {
  const canonicalByHash = new Map(fixture.media.canonical.map((asset) => [asset.sha256, asset]));
  assert.equal(canonicalByHash.size, fixture.counts.canonicalMedia);
  for (let index = 0; index < fixture.media.canonical.length; index += 12) {
    const batch = fixture.media.canonical.slice(index, index + 12);
    await Promise.all(batch.map(async (asset) => {
      const response = await fetch(asset.url);
      assert.equal(response.status, 200, `Media GET failed: ${asset.url}`);
      const bytes = (await response.arrayBuffer()).byteLength;
      assert.equal(bytes, asset.bytes, `Media byte drift: ${asset.sha256}`);
    }));
  }
  for (const alias of fixture.media.aliases) {
    const canonical = canonicalByHash.get(alias.sha256);
    assert(canonical, `Alias hash is missing: ${alias.sourcePath}`);
    assert.equal(alias.url, canonical.url);
  }
  process.stdout.write(`${JSON.stringify({ stage: 'media', canonical: fixture.media.canonical.length, aliases: fixture.media.aliases.length })}\n`);
}

async function proveResponsiveRoutes() {
  await mkdir(screenshotRoot, { recursive: true });
  let completed = 0;
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    attachNetworkGuards(context);
    await context.addInitScript((key) => sessionStorage.setItem(key, '1'), storageKey);
    const page = await context.newPage();
    for (const route of routes) {
      const requestedPath = route.route === '/' ? previewBasePath : `${previewBasePath}${route.route}`;
      const expectedRoute = redirects.get(route.route)?.targetPath || route.route;
      const expectedPage = fixture.routes[routeKey(expectedRoute)];
      const response = await page.goto(`${baseUrl}${requestedPath}`, { waitUntil: 'networkidle' });
      assert(response, `No response for ${requestedPath}`);
      assert.equal(response.status(), 200);
      await autoScroll(page);
      await waitForImages(page, requestedPath);

      const dom = await page.evaluate(() => {
        const images = Array.from(document.images);
        const sourceControls = new Set(Array.from(document.querySelectorAll('[data-source-control-id]')).map((node) => node.getAttribute('data-source-control-id')));
        return {
          title: document.title,
          h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
          route: document.querySelector('[data-preview-route]')?.getAttribute('data-preview-route') || '',
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).length,
          pendingImages: images.filter((image) => !image.complete).length,
          forms: document.forms.length,
          formActions: Array.from(document.forms).filter((form) => form.hasAttribute('action')).length,
          postMethods: Array.from(document.forms).filter((form) => form.method.toLowerCase() === 'post').length,
          submitControls: document.querySelectorAll('button[type="submit"], input[type="submit"], input[type="image"]').length,
          notices: document.querySelectorAll('.pumpkin-preview-form-notice').length,
          controls: sourceControls.size,
          links: document.querySelectorAll('a[href]:not([data-preview-derived-control]), area[href]').length,
          airstripLinks: Array.from(document.querySelectorAll('a[href]')).filter((link) => /(^|\.)airstrip(?:lasvegas|lv)\.com$/i.test(new URL(link.href).hostname)).length,
          localPaths: /(?:[A-Za-z]:\\\\|C:\/Users\/|\/Users\/|\/home\/site\/)/i.test(document.documentElement.innerHTML),
          genericFallback: /Unknown block type|Preview Not Found|generic starter/i.test(document.body.innerText),
          ageGateVisible: Boolean(document.querySelector('[data-pumpkin-age-gate]')),
        };
      });
      assert.equal(dom.title, expectedPage.title);
      assert.equal(dom.h1, expectedPage.h1);
      assert.equal(dom.route, expectedRoute);
      assert.equal(dom.formActions, 0);
      assert.equal(dom.postMethods, 0);
      assert.equal(dom.submitControls, 0);
      assert.equal(dom.notices, dom.forms);
      assert.equal(dom.localPaths, false);
      assert.equal(dom.genericFallback, false);
      assert.equal(dom.ageGateVisible, false);

      const screenshotPath = path.join(screenshotRoot, viewport.label, `${safeRouteName(route.route)}.jpg`);
      await mkdir(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 76, fullPage: false });
      routeResults.push({
        viewport: viewport.label,
        requestedRoute: route.route,
        renderedRoute: expectedRoute,
        redirected: expectedRoute !== route.route,
        status: response.status(),
        title: dom.title,
        h1: dom.h1,
        horizontalOverflow: dom.horizontalOverflow,
        brokenImages: dom.brokenImages,
        pendingImages: dom.pendingImages,
        forms: dom.forms,
        controls: dom.controls,
        links: dom.links,
        airstripLinks: dom.airstripLinks,
        screenshot: path.relative(screenshotRoot, screenshotPath).replace(/\\/g, '/'),
      });
      completed += 1;
      if (completed % 20 === 0) process.stdout.write(`${JSON.stringify({ stage: 'routes', completed, total: routes.length * viewports.length })}\n`);
    }
    await context.close();
  }
}

async function proveInteractionClasses() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  attachNetworkGuards(context);
  await context.addInitScript((key) => sessionStorage.setItem(key, '1'), storageKey);
  const page = await context.newPage();
  await page.goto(`${baseUrl}${previewBasePath}`, { waitUntil: 'networkidle' });

  const menu = page.locator('[data-menu-toggle]').first();
  if (await menu.count()) {
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    interactionResults.push({ class: 'mobile-menu', status: 'passed' });
  }
  const quiz = page.locator('[data-quiz]').first();
  if (await quiz.count()) {
    await quiz.click();
    assert.equal(await page.locator('#quiz-result').isVisible(), true);
    interactionResults.push({ class: 'quiz', status: 'passed' });
  }
  const safeFormButton = page.locator('form [data-preview-submit="true"]').first();
  if (await safeFormButton.count()) {
    await safeFormButton.click();
    const result = await safeFormButton.locator('xpath=ancestor::form').getAttribute('data-preview-result');
    assert(['validation-held', 'success-no-post'].includes(result));
    interactionResults.push({ class: 'form-action-held', status: 'passed', result });
  }
  const anchor = page.locator('a[href^="#"]').filter({ hasNotText: 'Skip to content' }).first();
  if (await anchor.count()) {
    const href = await anchor.getAttribute('href');
    await anchor.click();
    assert.equal(new URL(page.url()).hash, href);
    interactionResults.push({ class: 'anchor-navigation', status: 'passed' });
  }
  const details = page.locator('details > summary').first();
  if (await details.count()) {
    await details.click();
    assert.equal(await details.locator('xpath=parent::details').getAttribute('open'), '');
    interactionResults.push({ class: 'accordion-details', status: 'passed' });
  }
  const external = page.locator('a[data-preview-external="held"]:not([data-preview-no-request="airstrip"])').first();
  if (await external.count()) {
    const before = page.url();
    await external.click();
    assert.equal(page.url(), before);
    interactionResults.push({ class: 'external-navigation-held', status: 'passed' });
  }
  const state = await page.evaluate(() => window.__PUMPKIN_PREVIEW_PROOF__);
  assert.equal(state.postRequests, 0);
  assert.equal(state.airstripRequests, 0);
  assert.equal(state.personalDataStored, false);
  await context.close();
}

function attachNetworkGuards(context) {
  context.route(/https?:\/\/([^/]*\.)?airstrip(?:lasvegas|lv)\.com\//i, async (route) => {
    globalNetwork.airstrip.push(route.request().url());
    await route.abort('blockedbyclient');
  });
  context.on('request', (request) => {
    if (request.method().toUpperCase() === 'POST') globalNetwork.posts.push(request.url());
    if (/(^|\.)airstrip(?:lasvegas|lv)\.com$/i.test(new URL(request.url()).hostname)) globalNetwork.airstrip.push(request.url());
  });
  context.on('requestfailed', (request) => {
    if (!/(^|\.)airstrip(?:lasvegas|lv)\.com$/i.test(new URL(request.url()).hostname)) {
      globalNetwork.failures.push(`${request.failure()?.errorText || 'failed'} ${request.url()}`);
    }
  });
  context.on('response', (response) => {
    if (response.status() >= 400) globalNetwork.httpErrors.push(`${response.status()} ${response.url()}`);
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const step = Math.max(600, window.innerHeight);
    for (let top = 0; top < height; top += step) {
      window.scrollTo(0, top);
      await delay(8);
    }
    window.scrollTo(0, 0);
  });
}

async function waitForImages(page, requestedPath) {
  await page.evaluate(() => {
    for (const image of Array.from(document.images)) {
      if (image.complete || !image.src) continue;
      image.loading = 'eager';
      image.src = image.currentSrc || image.src;
    }
  });
  try {
    await page.waitForFunction(
      () => Array.from(document.images).every((image) => image.complete),
      undefined,
      { timeout: 15000 },
    );
  } catch (error) {
    const pending = await page.evaluate(() => Array.from(document.images)
      .filter((image) => !image.complete)
      .map((image) => ({
        src: image.currentSrc || image.src,
        loading: image.loading,
        hidden: image.hidden,
        width: image.getBoundingClientRect().width,
        height: image.getBoundingClientRect().height,
      })));
    process.stderr.write(`${JSON.stringify({ stage: 'pending-images', requestedPath, pending })}\n`);
    throw error;
  }
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images)
      .filter((image) => image.naturalWidth > 0)
      .map((image) => image.decode().catch(() => undefined)));
  });
}

function routeKey(route) {
  return route.replace(/^\//, '') || 'home';
}

function safeRouteName(route) {
  return (route.replace(/^\//, '').replace(/[^a-z0-9.-]+/gi, '--') || 'home').slice(0, 120);
}

function findBrowser() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  return candidates.find((candidate) => {
    try {
      return process.getBuiltinModule('fs').existsSync(candidate);
    } catch {
      return false;
    }
  }) || '';
}

function parseArgs(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = values[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    output[token.slice(2)] = value;
    index += 1;
  }
  return output;
}
