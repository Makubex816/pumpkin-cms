import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = parseArgs(process.argv.slice(2));
const publicApexBase = normalizeBase(args['public-apex-base']);
const publicWwwBase = normalizeBase(args['public-www-base']);
const previewBase = normalizeBase(args['preview-base']);
const fixturePath = path.resolve(args.fixture || 'preview-fixtures/party-pros-philadelphia/preview.json');
const outputPath = path.resolve(args.output || path.join(os.tmpdir(), 'pumpkin-party-pros-browser-proof.json'));
const screenshotRoot = path.resolve(args.screenshots || path.join(os.tmpdir(), 'pumpkin-party-pros-responsive'));
const executablePath = args.browser || findBrowser();
const localHostMap = args['local-host-map'] || '';

assert(publicApexBase, '--public-apex-base is required.');
assert(publicWwwBase, '--public-www-base is required.');
assert(previewBase, '--preview-base is required.');
assert(executablePath, 'Chrome or Edge executable was not found.');

const fixture = JSON.parse((await readFile(fixturePath, 'utf8')).replace(/^\uFEFF/, ''));
assert.equal(fixture.tenantId, 'party-pros-philadelphia');
const tenantId = fixture.tenantId;
const previewRoot = `${previewBase}/preview/${tenantId}`;
const routes = [
  { label: 'home', path: '/', slug: 'home' },
  { label: 'contact', path: '/contact', slug: 'contact' },
  { label: 'catalog', path: '/catalog', slug: 'catalog' },
  { label: 'category', path: '/carnival-games', slug: 'carnival-games' },
  { label: 'item', path: '/dunk-tank-rentals-philadelphia', slug: 'dunk-tank-rentals-philadelphia' },
  { label: 'blog', path: '/blog', slug: 'blog' },
  { label: 'article', path: '/blog-conference-entertainment-rentals-philadelphia', slug: 'blog-conference-entertainment-rentals-philadelphia' },
  { label: 'service-areas', path: '/service-areas', slug: 'service-areas' },
].map((route) => ({
  ...route,
  expectedTitle: getExpectedTitle(fixture.pages[route.slug]),
  expectedH1: getExpectedH1(fixture.pages[route.slug]),
}));
const responsiveRoutes = routes.filter((route) =>
  ['home', 'catalog', 'item', 'blog', 'article', 'contact'].includes(route.label),
);
const cartRoutes = routes.filter((route) => ['catalog', 'category', 'item'].includes(route.label));
const viewports = [
  { label: 'mobile-small', width: 375, height: 812 },
  { label: 'mobile-standard', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1366, height: 900 },
];
const launchArgs = ['--no-proxy-server', '--disable-background-networking'];
if (localHostMap) {
  launchArgs.push(`--host-resolver-rules=MAP partyrentalphiladelphia.com ${localHostMap}, MAP www.partyrentalphiladelphia.com ${localHostMap}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(screenshotRoot, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: launchArgs });
const network = { posts: [], airstrip: [] };
let report;

try {
  const routeProof = await proveRouteMatrix();
  const themeProof = await proveThemeAsset();
  const contentProof = await proveCatalogBlogContent();
  const formProof = await proveFormModes();
  const responsiveProof = await proveResponsiveRoutes();
  const cartProof = await proveCartInteractions();

  const passed = routeProof.publicPassed === 16
    && routeProof.previewPassed === 8
    && themeProof.status === 200
    && themeProof.sha256 === 'e6411f3e47387bf2eddf35c782f9192b3c85285260ea72b359041515d9725770'
    && contentProof.catalogItems === 214
    && contentProof.addToCartControls === 214
    && contentProof.itemDetail === 1
    && contentProof.blogCards === 58
    && contentProof.blogArticle === 1
    && formProof.publicLiveSubmit
    && formProof.previewDisabledNoPost
    && responsiveProof.passed === 24
    && responsiveProof.overflowFailures === 0
    && responsiveProof.brokenImages === 0
    && responsiveProof.pendingImages === 0
    && responsiveProof.failedRequests.length === 0
    && responsiveProof.httpErrors.length === 0
    && cartProof.passed === 15
    && network.posts.length === 0
    && network.airstrip.length === 0;

  report = {
    schemaVersion: 'pumpkin-party-pros-recovery-browser-proof/v1',
    status: passed ? 'passed' : 'failed',
    tenantId,
    checkedAt: new Date().toISOString(),
    bases: { publicApexBase, publicWwwBase, previewBase },
    routeProof,
    themeProof,
    contentProof,
    formProof,
    responsiveProof,
    cartProof,
    network,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({
    status: report.status,
    publicRoutes: `${routeProof.publicPassed}/16`,
    previewRoutes: `${routeProof.previewPassed}/8`,
    responsiveRenders: `${responsiveProof.passed}/24`,
    cartInteractions: `${cartProof.passed}/15`,
    themeStatus: themeProof.status,
    posts: network.posts.length,
    airstripRequests: network.airstrip.length,
    outputPath,
  })}\n`);

  assert.equal(report.status, 'passed');
} finally {
  await browser.close();
}

async function proveRouteMatrix() {
  const context = await createGuardedContext({ width: 1366, height: 900 });
  const page = await context.newPage();
  const publicResults = [];
  const previewResults = [];
  try {
    for (const base of [publicApexBase, publicWwwBase]) {
      for (const route of routes) {
        publicResults.push(await inspectRoute(page, `${base}${route.path}`, route, 'public'));
      }
    }
    for (const route of routes) {
      previewResults.push(await inspectRoute(page, previewUrl(route), route, 'preview'));
    }
  } finally {
    await context.close();
  }
  return {
    expectedPublic: 16,
    publicPassed: publicResults.filter((result) => result.passed).length,
    expectedPreview: 8,
    previewPassed: previewResults.filter((result) => result.passed).length,
    publicResults,
    previewResults,
  };
}

async function inspectRoute(page, url, route, mode) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(200);
  const metrics = await page.evaluate(() => ({
    title: document.title.trim(),
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    hostTenant: document.querySelector('main[data-host-tenant]')?.getAttribute('data-host-tenant') || '',
    previewTenant: document.querySelector('main[data-preview-tenant]')?.getAttribute('data-preview-tenant') || '',
    genericFallback: /Unknown block type:|Preview Not Found|Page Not Found/i.test(document.body.innerText),
  }));
  const status = response?.status() ?? 0;
  const identity = mode === 'public' ? metrics.hostTenant : metrics.previewTenant;
  return {
    label: route.label,
    url,
    status,
    title: metrics.title,
    h1: metrics.h1,
    identity,
    genericFallback: metrics.genericFallback,
    passed: status === 200
      && metrics.title === route.expectedTitle
      && metrics.h1 === route.expectedH1
      && identity === tenantId
      && !metrics.genericFallback,
  };
}

async function proveThemeAsset() {
  const response = await fetch(`${previewBase}/themes/party-pros-orange-slate-v1.css`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    url: `${previewBase}/themes/party-pros-orange-slate-v1.css`,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}

async function proveCatalogBlogContent() {
  const context = await createGuardedContext({ width: 1366, height: 900 });
  const page = await context.newPage();
  try {
    await page.goto(`${publicApexBase}/catalog`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const catalog = await page.evaluate(() => ({
      catalogItems: document.querySelectorAll('[data-catalog-item]').length,
      addToCartControls: document.querySelectorAll('[data-add-to-cart]').length,
    }));
    await page.goto(`${publicApexBase}/dunk-tank-rentals-philadelphia`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const item = await page.evaluate(() => ({
      itemDetail: document.querySelectorAll('[data-item-detail="true"]').length,
      itemStats: Number(document.querySelector('[data-item-stat-count]')?.getAttribute('data-item-stat-count') || 0),
      itemFaq: Number(document.querySelector('[data-item-faq-count]')?.getAttribute('data-item-faq-count') || 0),
      relatedItems: Number(document.querySelector('[data-related-item-count]')?.getAttribute('data-related-item-count') || 0),
    }));
    await page.goto(`${publicApexBase}/blog`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const blog = await page.evaluate(() => ({
      blogIndex: document.querySelectorAll('[data-blog-index="true"]').length,
      blogCards: document.querySelectorAll('.blog-post-card').length,
    }));
    await page.goto(`${publicApexBase}/blog-conference-entertainment-rentals-philadelphia`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const article = await page.evaluate(() => ({
      blogArticle: document.querySelectorAll('[data-blog-article="true"]').length,
      blogArticleSections: document.querySelectorAll('.blog-article-section').length,
    }));
    return { ...catalog, ...item, ...blog, ...article };
  } finally {
    await context.close();
  }
}

async function proveFormModes() {
  const context = await createGuardedContext({ width: 390, height: 844 });
  const page = await context.newPage();
  try {
    await page.goto(`${publicApexBase}/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const publicForm = await page.evaluate(() => ({
      mode: document.querySelector('main[data-form-mode]')?.getAttribute('data-form-mode') || '',
      forms: document.querySelectorAll('form').length,
      postForms: document.querySelectorAll('form[method="post" i]').length,
      submitButtons: document.querySelectorAll('form button[type="submit"]:not([disabled])').length,
    }));
    await page.goto(`${previewRoot}/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const previewForm = await page.evaluate(() => ({
      forms: document.querySelectorAll('form').length,
      explicitActions: document.querySelectorAll('form[action]').length,
      postForms: document.querySelectorAll('form[method="post" i]').length,
      enabledSubmitButtons: document.querySelectorAll('form button[type="submit"]:not([disabled])').length,
      disabledPreviewButtons: Array.from(document.querySelectorAll('form button[type="button"][disabled]'))
        .filter((button) => button.textContent?.includes('Preview only')).length,
    }));
    return {
      public: publicForm,
      preview: previewForm,
      publicLiveSubmit: publicForm.mode === 'live-submit'
        && publicForm.forms === 1
        && publicForm.submitButtons === 1,
      previewDisabledNoPost: previewForm.forms === 1
        && previewForm.explicitActions === 0
        && previewForm.postForms === 0
        && previewForm.enabledSubmitButtons === 0
        && previewForm.disabledPreviewButtons === 1,
    };
  } finally {
    await context.close();
  }
}

async function proveResponsiveRoutes() {
  const results = [];
  const failedRequests = [];
  const httpErrors = [];
  for (const viewport of viewports) {
    const context = await createGuardedContext(viewport, { failedRequests, httpErrors });
    const page = await context.newPage();
    try {
      for (const route of responsiveRoutes) {
        const startFailureCount = failedRequests.length;
        const startErrorCount = httpErrors.length;
        const response = await page.goto(`${publicApexBase}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await settleImages(page);
        const metrics = await page.evaluate(() => ({
          title: document.title.trim(),
          h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).length,
          pendingImages: Array.from(document.images).filter((image) => !image.complete).length,
        }));
        const screenshotPath = path.join(screenshotRoot, `${viewport.label}-${route.label}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        const result = {
          route: route.label,
          viewport,
          status: response?.status() ?? 0,
          title: metrics.title,
          h1: metrics.h1,
          horizontalOverflow: metrics.scrollWidth > metrics.clientWidth + 1,
          brokenImages: metrics.brokenImages,
          pendingImages: metrics.pendingImages,
          failedRequests: failedRequests.length - startFailureCount,
          httpErrors: httpErrors.length - startErrorCount,
          screenshotPath,
        };
        result.passed = result.status === 200
          && result.title === route.expectedTitle
          && result.h1 === route.expectedH1
          && !result.horizontalOverflow
          && result.brokenImages === 0
          && result.pendingImages === 0
          && result.failedRequests === 0
          && result.httpErrors === 0;
        results.push(result);
      }
    } finally {
      await context.close();
    }
  }
  return {
    expected: 24,
    passed: results.filter((result) => result.passed).length,
    overflowFailures: results.filter((result) => result.horizontalOverflow).length,
    brokenImages: results.reduce((sum, result) => sum + result.brokenImages, 0),
    pendingImages: results.reduce((sum, result) => sum + result.pendingImages, 0),
    failedRequests,
    httpErrors,
    results,
  };
}

async function proveCartInteractions() {
  const context = await createGuardedContext({ width: 1366, height: 900 });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const results = [];
  try {
    const targets = [
      ...viewports.flatMap((viewport) => cartRoutes.map((route) => ({ mode: 'public', viewport, route }))),
      ...cartRoutes.map((route) => ({ mode: 'preview', viewport: viewports.at(-1), route })),
    ];
    for (const target of targets) {
      await page.setViewportSize({ width: target.viewport.width, height: target.viewport.height });
      const url = target.mode === 'public'
        ? `${publicApexBase}${target.route.path}`
        : previewUrl(target.route);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForTimeout(300);
      const addButton = page.locator('[data-add-to-cart]').first();
      const addButtonCount = await page.locator('[data-add-to-cart]').count();
      if (addButtonCount > 0) await addButton.click();
      await page.waitForTimeout(150);
      const summary = page.locator('.quote-cart-summary');
      if (await summary.count()) await summary.click();
      await page.waitForTimeout(100);
      const metrics = await page.evaluate(() => {
        const actionLabels = Array.from(document.querySelectorAll('a, button'))
          .map((element) => element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() || '');
        return {
          cartTray: document.querySelectorAll('[data-quote-cart-tray="true"]').length,
          cartItems: Number(document.querySelector('.quote-cart-count')?.textContent || 0),
          cartRows: document.querySelectorAll('.quote-cart-row').length,
          requestLinks: Array.from(document.querySelectorAll('.quote-cart-request, .quote-cart-panel a'))
            .filter((link) => link.getAttribute('href')?.includes('/contact#quote-request')).length,
          paymentActions: actionLabels.filter((label) => ['checkout', 'pay now', 'payment', 'credit card'].includes(label)).length,
        };
      });
      const passed = addButtonCount > 0
        && metrics.cartTray === 1
        && metrics.cartItems === 1
        && metrics.cartRows === 1
        && metrics.requestLinks >= 1
        && metrics.paymentActions === 0;
      results.push({
        mode: target.mode,
        route: target.route.label,
        viewport: target.viewport.label,
        addButtonCount,
        ...metrics,
        passed,
      });
    }
  } finally {
    await context.close();
  }
  return { expected: 15, passed: results.filter((result) => result.passed).length, results };
}

async function createGuardedContext(viewport, requiredNetwork = null) {
  const context = await browser.newContext({ viewport });
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method().toUpperCase() === 'POST') {
      network.posts.push(url);
      await route.abort('blockedbyclient');
      return;
    }
    if (/airstrip/i.test(url)) {
      network.airstrip.push(url);
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
  if (requiredNetwork) {
    context.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText === 'net::ERR_ABORTED') return;
      requiredNetwork.failedRequests.push({ url: request.url(), error: failure?.errorText || 'unknown' });
    });
    context.on('response', (response) => {
      if (response.status() >= 400) requiredNetwork.httpErrors.push({ url: response.url(), status: response.status() });
    });
  }
  return context;
}

async function settleImages(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';
    for (const image of images) {
      if (image.complete) continue;
      image.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    await Promise.race([
      Promise.all(images.map((image) => image.complete ? undefined : new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }))),
      new Promise((resolve) => setTimeout(resolve, 15_000)),
    ]);
    await Promise.all(images.filter((image) => image.naturalWidth > 0).map((image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
}

function previewUrl(route) {
  return `${previewRoot}${route.path === '/' ? '' : route.path}`;
}

function getExpectedTitle(page) {
  assert(page, 'Expected fixture page is missing.');
  return page.seo?.metaTitle || page.MetaData?.title || '';
}

function getExpectedH1(page) {
  const hero = page?.ContentData?.ContentBlocks?.find((block) => block.type === 'CatalogHero');
  assert(hero?.content?.headline, `Expected CatalogHero headline is missing: ${page?.pageSlug || 'unknown'}`);
  return hero.content.headline.replace(/\s+/g, ' ').trim();
}

function normalizeBase(value) {
  return String(value || '').replace(/\/+$/, '');
}

function findBrowser() {
  const roots = [
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],
    process.env.LOCALAPPDATA,
  ].filter(Boolean);
  const candidates = roots.flatMap((root) => [
    path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ]);
  return candidates.find((candidate) => existsSync(candidate)) || '';
}

function parseArgs(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    assert(token.startsWith('--'), `Unexpected argument: ${token}`);
    const value = values[index + 1];
    assert(value && !value.startsWith('--'), `Missing value for ${token}`);
    output[token.slice(2)] = value;
    index += 1;
  }
  return output;
}
