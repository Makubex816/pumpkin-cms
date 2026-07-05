#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const DEFAULT_VIEWPORTS = [
  { label: 'small-mobile', width: 360, height: 800 },
  { label: 'iphone-standard', width: 375, height: 812 },
  { label: 'modern-mobile', width: 390, height: 844 },
  { label: 'large-mobile', width: 414, height: 896 },
  { label: 'large-modern-mobile', width: 430, height: 932 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 1200 },
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.baseUrl) {
    throw new Error('Missing --base-url');
  }

  const routeFile = args.routesFile ? await readJson(args.routesFile) : null;
  const routes = resolveRoutes(args.routes, routeFile);
  const viewports = resolveViewports(routeFile);
  if (routes.length === 0) {
    throw new Error('Provide --routes or --routes-file with at least one route');
  }

  const output = {
    baseUrl: args.baseUrl,
    generatedAt: new Date().toISOString(),
    standard: 'v2.8.60v-mobile-responsive',
    mode: 'GET/browser-only-no-form-submit',
    valid: false,
    summary: {
      routes: routes.length,
      viewports: viewports.length,
      checks: routes.length * viewports.length,
      overflowFailures: 0,
      consoleErrors: 0,
      failedRequests: 0,
      badResponses: 0,
      missingImages: 0,
      navigationFailures: 0,
    },
    routes,
    viewports,
    results: [],
  };

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    output.blocker = {
      classification: 'playwright_unavailable',
      message: 'Install or expose Playwright to run responsive browser proof.',
      detail: error.message,
      manualCommand: 'npx --yes -p playwright@1.49.1 node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs --base-url <url> --routes /,/contact,/service-areas --out .tmp/responsive-proof.json',
    };
    await writeOutput(args.out, output);
    console.log(JSON.stringify(summarize(output)));
    process.exitCode = 1;
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: args.chromePath || undefined,
  });

  try {
    for (const routePath of routes) {
      for (const viewport of viewports) {
        const result = await checkRoute(browser, args.baseUrl, routePath, viewport, args.screenshotsDir);
        output.results.push(result);
        output.summary.overflowFailures += result.overflow.hasOverflow ? 1 : 0;
        output.summary.consoleErrors += result.consoleErrors.length;
        output.summary.failedRequests += result.failedRequests.length;
        output.summary.badResponses += result.badResponses.length;
        output.summary.missingImages += result.missingImages.length;
        output.summary.navigationFailures += result.navigation.ok ? 0 : 1;
      }
    }
  } finally {
    await browser.close();
  }

  output.valid = output.results.every((result) => (
    result.navigation.ok
    && !result.overflow.hasOverflow
    && result.consoleErrors.length === 0
    && result.failedRequests.length === 0
    && result.badResponses.length === 0
    && result.missingImages.length === 0
  ));

  await writeOutput(args.out, output);
  console.log(JSON.stringify(summarize(output)));
  if (!output.valid) {
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const args = {
    baseUrl: '',
    routes: '',
    routesFile: '',
    out: '',
    screenshotsDir: '',
    chromePath: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (name === '--base-url') {
      args.baseUrl = value || '';
      index += 1;
    } else if (name === '--routes') {
      args.routes = value || '';
      index += 1;
    } else if (name === '--routes-file') {
      args.routesFile = value || '';
      index += 1;
    } else if (name === '--out') {
      args.out = value || '';
      index += 1;
    } else if (name === '--screenshots-dir') {
      args.screenshotsDir = value || '';
      index += 1;
    } else if (name === '--chrome-path') {
      args.chromePath = value || '';
      index += 1;
    }
  }
  return args;
}

async function checkRoute(browser, baseUrl, routePath, viewport, screenshotsDir) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(safeText(message.text()));
    }
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: scrubUrl(request.url()),
      failure: safeText(request.failure()?.errorText || 'unknown'),
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push({
        url: scrubUrl(response.url()),
        status: response.status(),
      });
    }
  });

  const url = joinUrl(baseUrl, routePath);
  const result = {
    route: routePath,
    url,
    viewport,
    navigation: { ok: false, status: null, error: '' },
    overflow: { hasOverflow: false, scrollWidth: 0, clientWidth: 0, viewportWidth: viewport.width, overflowBy: 0 },
    consoleErrors,
    failedRequests,
    badResponses,
    missingImages: [],
    screenshotPath: '',
  };

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    result.navigation.status = response?.status() || null;
    result.navigation.ok = Boolean(response && response.status() < 400);
    result.overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const viewportWidth = window.innerWidth;
      const clientWidth = Math.max(doc?.clientWidth || 0, body?.clientWidth || 0, viewportWidth);
      const scrollWidth = Math.max(doc?.scrollWidth || 0, body?.scrollWidth || 0);
      const overflowBy = scrollWidth - Math.max(clientWidth, viewportWidth);
      return {
        hasOverflow: overflowBy > 2,
        scrollWidth,
        clientWidth,
        viewportWidth,
        overflowBy,
      };
    });
    result.missingImages = await page.$$eval('img', (images) => images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => ({
        src: image.currentSrc || image.src || '',
        alt: image.alt || '',
      }))
      .slice(0, 25));

    if (screenshotsDir) {
      await fs.mkdir(screenshotsDir, { recursive: true });
      const screenshotName = `${safeFileName(routePath)}-${viewport.label}.png`;
      const screenshotPath = path.join(screenshotsDir, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = toPosix(screenshotPath);
    }
  } catch (error) {
    result.navigation.error = safeText(error.message);
  } finally {
    await context.close();
  }

  result.consoleErrors = result.consoleErrors.slice(0, 25);
  result.failedRequests = result.failedRequests.slice(0, 25);
  result.badResponses = result.badResponses.slice(0, 25);
  result.missingImages = result.missingImages.map((image) => ({
    src: scrubUrl(image.src),
    alt: safeText(image.alt),
  }));
  return result;
}

function resolveRoutes(routesArg, routeFile) {
  if (routesArg) {
    return routesArg.split(',').map((route) => route.trim()).filter(Boolean);
  }
  const routes = Array.isArray(routeFile?.routes) ? routeFile.routes : [];
  return routes.map((route) => route.path).filter(Boolean);
}

function resolveViewports(routeFile) {
  const viewports = Array.isArray(routeFile?.viewports) ? routeFile.viewports : [];
  if (viewports.length > 0) {
    return viewports.map((viewport) => ({
      label: viewport.label,
      width: Number(viewport.width),
      height: Number(viewport.height),
    }));
  }
  return DEFAULT_VIEWPORTS;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8'));
}

async function writeOutput(outPath, output) {
  if (!outPath) return;
  const resolved = path.resolve(outPath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

function summarize(output) {
  return {
    valid: output.valid,
    standard: output.standard,
    mode: output.mode,
    routes: output.summary.routes,
    viewports: output.summary.viewports,
    checks: output.summary.checks,
    overflowFailures: output.summary.overflowFailures,
    consoleErrors: output.summary.consoleErrors,
    failedRequests: output.summary.failedRequests,
    badResponses: output.summary.badResponses,
    missingImages: output.summary.missingImages,
    navigationFailures: output.summary.navigationFailures,
    blocker: output.blocker?.classification || '',
  };
}

function joinUrl(baseUrl, routePath) {
  const base = String(baseUrl).replace(/\/+$/, '');
  const route = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${base}${route}`;
}

function scrubUrl(value) {
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return safeText(value).split('?')[0].split('#')[0];
  }
}

function safeText(value) {
  return String(value || '').replace(/\s+/g, ' ').slice(0, 300);
}

function safeFileName(routePath) {
  const cleaned = routePath.replace(/^\/$/, 'root').replace(/[^a-zA-Z0-9_.-]+/g, '-');
  return cleaned.replace(/^-+|-+$/g, '') || 'route';
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

await main().catch((error) => {
  console.error(JSON.stringify({ valid: false, error: error.message }));
  process.exitCode = 1;
});
