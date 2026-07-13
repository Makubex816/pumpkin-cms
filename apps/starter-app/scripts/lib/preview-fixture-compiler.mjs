import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { parse, parseFragment, serialize } from 'parse5';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

export const COMPILER_VERSION = '2.8.62f.1';
export const FIXTURE_SCHEMA_VERSION = '1.0.0';
const FIXTURE_SCHEMA = 'pumpkin-preview-fixture/v1';
const SAFE_TENANT_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
const SAFE_HASH = /^[a-f0-9]{64}$/i;
const SAFE_REDIRECT_STATUS = new Set([301, 302, 307, 308]);
const SAFE_EXTERNAL_PROTOCOL = /^(https?:|mailto:|tel:)/i;
const MEDIA_PATH_PATTERN = /\.(?:avif|gif|jpe?g|png|svg|webp|ico|mp4|webm)(?:[?#].*)?$/i;
const PRIVATE_KEY_PATTERN = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i;
const JWT_PATTERN = /\beyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\b/;
const SAS_PATTERN = /[?&](?:sig|se|sp|sv|spr)=/i;
const CONNECTION_PATTERN = /(?:AccountKey|SharedAccessSignature|DefaultEndpointsProtocol)\s*=/i;
const SECRET_KEY_PATTERN = /(?:password|passwd|api[-_]?key|runtime[-_]?key|authorization|connection[-_]?string|client[-_]?secret|private[-_]?key|cookie|jwt|token|secret)/i;
const LOCAL_PATH_PATTERN = /(?:[A-Za-z]:\\|C:\/Users\/|\/Users\/|\/home\/site\/)/i;
const compilerSourcePath = fileURLToPath(import.meta.url);

export async function compilePreviewFixture(options) {
  const resolved = resolveOptions(options);
  const packageManifest = await readJson(path.join(resolved.packageRoot, 'tenant-package.json'));
  const tenantId = packageManifest.tenantId;
  assert(SAFE_TENANT_ID.test(tenantId), `Invalid tenant ID: ${tenantId}`);
  if (resolved.tenantId) assert(resolved.tenantId === tenantId, 'Requested tenant does not match package tenant.');

  const backupManifestPath = path.join(resolved.backupRoot, 'backup-manifest.json');
  const backupChecksumPath = path.join(resolved.backupRoot, 'checksums.sha256');
  const backupManifestSha256 = await sha256File(backupManifestPath);
  const backupChecksumManifestSha256 = await sha256File(backupChecksumPath);
  verifyExpectedHash('backup manifest', backupManifestSha256, resolved.expectedBackupManifestSha256);
  verifyExpectedHash('backup checksum manifest', backupChecksumManifestSha256, resolved.expectedBackupChecksumSha256);

  const backupManifest = await readJson(backupManifestPath);
  assert(backupManifest.tenantId === tenantId, 'Backup tenant does not match package tenant.');
  assert(backupManifest.credentialPolicy?.plaintextCredentialsIncluded === false, 'Backup credential boundary is not safe.');
  assert(backupManifest.credentialPolicy?.runtimeKeyPlaintextIncluded === false, 'Backup runtime-key boundary is not safe.');

  const sourcePackageSha256 = await resolveSourcePackageHash(packageManifest, resolved.sourceArchivePath);
  const normalizedPackageSha256 = await treeSha256(resolved.packageRoot);
  const referencePreviewSha256 = await treeSha256(resolved.referenceRoot);
  const compilerSourceSha256 = await sha256File(compilerSourcePath);

  const routeMap = await readJson(path.join(resolved.packageRoot, 'fidelity', 'route-map.json'));
  const linkMap = await readJson(path.join(resolved.packageRoot, 'fidelity', 'link-map.json'));
  const controlMap = await readJson(path.join(resolved.packageRoot, 'fidelity', 'control-map.json'));
  const formMap = await readJson(path.join(resolved.packageRoot, 'fidelity', 'form-instance-map.json'));
  const behaviorMap = await readJson(path.join(resolved.packageRoot, 'fidelity', 'source-behavior-map.json'));
  const fidelityStatus = await readJson(path.join(resolved.packageRoot, 'fidelity', 'package-fidelity-status.json'));
  const ownerChanges = await readJson(path.join(resolved.packageRoot, 'fidelity', 'owner-approved-changes.json'));
  const packageAliases = await readJson(path.join(resolved.packageRoot, 'media', 'source-path-alias-map.json'));
  const formCandidates = await readJson(path.join(resolved.packageRoot, 'form-definitions', 'candidates.json'));

  validateFidelityGate(fidelityStatus);
  assert(routeMap.tenantId === tenantId, 'Route map tenant mismatch.');
  assert(linkMap.tenantId === tenantId, 'Link map tenant mismatch.');
  assert(controlMap.tenantId === tenantId, 'Control map tenant mismatch.');
  assert(formMap.tenantId === tenantId, 'Form map tenant mismatch.');

  const backup = await readBackupCollections(resolved.backupRoot);
  const media = buildMediaIndexes(backup.mediaAssets, backup.sourceAliases, packageAliases.aliases ?? []);
  const redirects = buildRedirects(backup.pageOwnedRedirects, backup.tenantRedirects, routeMap.routes ?? []);
  const redirectMap = new Map(redirects.map((item) => [item.sourcePath, item.targetPath]));
  const routes = [...(routeMap.routes ?? [])].sort((left, right) => left.route.localeCompare(right.route));
  const routeSet = new Set(routes.map((item) => normalizeRoute(item.route)));
  const targetHosts = getTargetHosts(packageManifest);
  const previewBasePath = `/preview/${tenantId}`;

  const theme = await buildThemeFiles({
    tenantId,
    themes: backup.themes,
    outputRoot: resolved.themeOutputRoot,
    media,
  });

  const compiledRoutes = {};
  const routeProof = new Map();
  for (const route of routes) {
    const compiled = await compileRoute({
      route,
      referenceRoot: resolved.referenceRoot,
      routeSet,
      targetHosts,
      previewBasePath,
      media,
      theme,
    });
    compiledRoutes[routeKey(route.route)] = compiled.fixtureRoute;
    routeProof.set(normalizeRoute(route.route), compiled.proof);
  }

  validateCrossRouteAnchors(routeProof, routeSet);
  validateRouteParity(routes, routeProof, linkMap.links ?? [], controlMap.controls ?? []);

  const counts = buildCounts({
    routes,
    redirects,
    backup,
    media,
    linkRows: linkMap.links ?? [],
    controlRows: controlMap.controls ?? [],
    formRows: formMap.instances ?? [],
    redirectMap,
  });
  validateExpectedCounts(counts, packageManifest, backupManifest, fidelityStatus, {
    linkMap,
    controlMap,
    formMap,
    formCandidates,
  });

  const fixture = {
    schemaVersion: FIXTURE_SCHEMA,
    fixtureSchemaVersion: FIXTURE_SCHEMA_VERSION,
    compilerVersion: COMPILER_VERSION,
    tenantId,
    siteName: packageManifest.displayName,
    renderMode: 'package-static',
    previewOnly: true,
    immutable: true,
    source: {
      sourcePackageSha256,
      normalizedPackageSha256,
      referencePreviewSha256,
      backupManifestSha256,
      backupChecksumManifestSha256,
      compilerSourceSha256,
      fidelityStatus: fidelityStatus.status,
    },
    theme: { stylesheets: theme.registry },
    counts,
    routes: compiledRoutes,
    redirects,
    media: {
      canonical: media.canonical,
      aliases: media.aliases,
    },
    forms: {
      definitions: formCandidates.candidates ?? [],
      instances: formMap.instances ?? [],
      submissionMode: 'disabled-no-post',
    },
    links: {
      rows: (linkMap.links ?? []).map(projectLinkRow),
      unresolvedTargets: Number(linkMap.unresolvedTargets ?? 0),
      missingAnchors: Number(linkMap.missingAnchors ?? 0),
    },
    controls: {
      rows: (controlMap.controls ?? []).map(projectControlRow),
      unmapped: Number(controlMap.unmappedControls ?? 0),
    },
    behaviors: behaviorMap.behaviors ?? [],
    acceptedDeviations: ownerChanges.changes ?? [],
    launchHold: {
      publicLaunchApproved: false,
      indexingApproved: false,
      formPostApproved: false,
      mediaRightsReviewRequired: true,
      adultComplianceReviewRequired: true,
    },
    integrity: { fixtureSha256: '' },
  };

  fixture.integrity.fixtureSha256 = fixturePayloadSha256(fixture);
  await validateFixtureSchema(fixture, resolved.schemaPath);
  const secretScan = scanFixtureSafety(fixture);
  assert(secretScan.findings.length === 0, `Unsafe fixture content: ${secretScan.findings.join('; ')}`);

  await mkdir(resolved.outputRoot, { recursive: true });
  await writeDeterministicJson(path.join(resolved.outputRoot, 'preview.json'), fixture);
  await writeDeterministicJson(path.join(resolved.outputRoot, 'generation-report.json'), {
    schemaVersion: 'pumpkin-preview-generation-report/v1',
    status: 'passed',
    tenantId,
    compilerVersion: COMPILER_VERSION,
    fixtureSha256: fixture.integrity.fixtureSha256,
    source: fixture.source,
    counts,
    checks: {
      schemaValid: true,
      deterministicPayload: true,
      blockedItems: 0,
      unresolvedRoutes: 0,
      unresolvedLinks: 0,
      missingAnchors: 0,
      unmappedControls: 0,
      missingMediaAliases: 0,
      secretPrivateFindings: 0,
      scriptsInFixtureHtml: 0,
      inlineEventHandlers: 0,
      formActions: 0,
      postMethods: 0,
      enabledSubmitControls: 0,
    },
  });
  await writeDeterministicJson(path.join(resolved.outputRoot, 'parity-scorecard.json'), {
    schemaVersion: 'pumpkin-preview-parity-scorecard/v1',
    status: fidelityStatus.status,
    tenantId,
    counts,
    dispositions: {
      preserved: true,
      safelyAdaptedEquivalent: true,
      ownerApprovedChanges: fixture.acceptedDeviations.length,
      blocked: 0,
    },
    launchApproved: false,
  });
  await updateRegistry(resolved.registryPath, fixture);

  return {
    tenantId,
    fixtureSha256: fixture.integrity.fixtureSha256,
    normalizedPackageSha256,
    referencePreviewSha256,
    counts,
    secretScan,
    outputRoot: resolved.outputRoot,
  };
}

export async function validateFixtureFile(fixturePath, schemaPath) {
  const fixture = await readJson(fixturePath);
  await validateFixtureSchema(fixture, schemaPath);
  const expected = fixturePayloadSha256(fixture);
  assert(expected === fixture.integrity.fixtureSha256, 'Fixture payload hash mismatch.');
  const safety = scanFixtureSafety(fixture);
  assert(safety.findings.length === 0, `Unsafe fixture content: ${safety.findings.join('; ')}`);
  validateFixtureInternalCounts(fixture);
  return {
    status: 'passed',
    tenantId: fixture.tenantId,
    fixtureSha256: fixture.integrity.fixtureSha256,
    counts: fixture.counts,
    safety,
  };
}

export function fixturePayloadSha256(fixture) {
  const clone = structuredClone(fixture);
  delete clone.integrity.fixtureSha256;
  return sha256(stableStringify(clone));
}

export function stableStringify(value, indentation = 2) {
  return `${JSON.stringify(sortValue(value), null, indentation)}\n`;
}

export function scanFixtureSafety(fixture) {
  const findings = [];
  const visit = (value, keyPath = '$') => {
    if (typeof value === 'string') {
      if (PRIVATE_KEY_PATTERN.test(value)) findings.push(`${keyPath}:private-key`);
      if (JWT_PATTERN.test(value)) findings.push(`${keyPath}:jwt`);
      if (SAS_PATTERN.test(value)) findings.push(`${keyPath}:sas`);
      if (CONNECTION_PATTERN.test(value)) findings.push(`${keyPath}:connection-string`);
      if (LOCAL_PATH_PATTERN.test(value)) findings.push(`${keyPath}:local-path`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${keyPath}[${index}]`));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(key) && hasSensitiveValue(entry)) findings.push(`${keyPath}.${key}:secret-key`);
      visit(entry, `${keyPath}.${key}`);
    }
  };
  visit(fixture);
  return { findings, passed: findings.length === 0 };
}

async function compileRoute(context) {
  const sourceFile = normalizeSourcePath(context.route.sourceFile);
  const sourcePath = path.join(context.referenceRoot, ...sourceFile.split('/'));
  const raw = await readFile(sourcePath, 'utf8');
  const document = parse(raw);
  const html = findFirst(document, (node) => node.tagName === 'html');
  const head = findFirst(document, (node) => node.tagName === 'head');
  const body = findFirst(document, (node) => node.tagName === 'body');
  assert(html && head && body, `Reference page is not a complete HTML document: ${sourceFile}`);

  const title = textContent(findFirst(head, (node) => node.tagName === 'title')).trim();
  const h1 = textContent(findFirst(body, (node) => node.tagName === 'h1')).replace(/\s+/g, ' ').trim();
  assert(title === context.route.title, `Title drift at ${context.route.route}`);
  assert(h1 === context.route.h1, `H1 drift at ${context.route.route}`);

  const description = getAttr(findFirst(head, (node) => node.tagName === 'meta' && getAttr(node, 'name').toLowerCase() === 'description'), 'content');
  const canonicalUrl = getAttr(findFirst(head, (node) => node.tagName === 'link' && relTokens(node).includes('canonical')), 'href');
  const structuredData = [];
  for (const script of findAll(head, (node) => node.tagName === 'script' && getAttr(node, 'type').toLowerCase() === 'application/ld+json')) {
    const value = textContent(script).trim();
    if (!value) continue;
    try {
      structuredData.push(JSON.parse(value));
    } catch {
      throw new Error(`Invalid JSON-LD at ${context.route.route}`);
    }
  }

  const stylesheetNames = findAll(head, (node) => node.tagName === 'link' && relTokens(node).includes('stylesheet'))
    .map((node) => path.posix.basename(getAttr(node, 'href').split(/[?#]/, 1)[0]))
    .filter(Boolean);
  const stylesheets = [];
  for (const name of stylesheetNames) {
    const entry = context.theme.registry[name];
    assert(entry, `Unmapped stylesheet ${name} at ${context.route.route}`);
    if (!stylesheets.includes(entry.path)) stylesheets.push(entry.path);
  }
  assert(stylesheets.length > 0, `No mapped stylesheet at ${context.route.route}`);

  const inlineCssParts = [];
  for (const styleNode of findAll(head, (node) => node.tagName === 'style')) {
    const css = textContent(styleNode);
    if (!css.trim()) continue;
    inlineCssParts.push(await rewriteCss(css, sourceFile, context.media, `inline:${sourceFile}`));
  }

  const proof = {
    links: [],
    localAnchorHrefs: [],
    crossRouteAnchorHrefs: [],
    anchorIds: new Set(),
    controls: new Set(),
    forms: 0,
    images: 0,
    airstripLinks: 0,
  };
  await sanitizeTree(body, {
    ...context,
    sourceFile,
    proof,
    inForm: false,
  });

  for (const node of findAll(body, (candidate) => Boolean(getAttr(candidate, 'id')))) {
    proof.anchorIds.add(getAttr(node, 'id'));
  }
  for (const href of proof.localAnchorHrefs) {
    const id = decodeURIComponent(href.slice(1));
    assert(proof.anchorIds.has(id), `Missing local anchor ${href} at ${context.route.route}`);
  }

  const serialized = serialize(body).trim();
  assert(serialized.length > 0, `Empty compiled body at ${context.route.route}`);
  assert(!/<script\b/i.test(serialized), `Script tag remained at ${context.route.route}`);
  assert(!/\son[a-z]+\s*=/i.test(serialized), `Inline handler remained at ${context.route.route}`);
  assert(!/javascript:/i.test(serialized), `javascript URL remained at ${context.route.route}`);
  assert(!/<form\b[^>]*(?:action|method)\s*=/i.test(serialized), `Active form contract remained at ${context.route.route}`);
  assert(!/type=["'](?:submit|image)["']/i.test(serialized), `Submit control remained at ${context.route.route}`);

  return {
    fixtureRoute: {
      route: normalizeRoute(context.route.route),
      sourceFile,
      sourceSha256: sha256(raw),
      title,
      h1,
      description,
      canonicalUrl,
      bodyClass: getAttr(body, 'class'),
      html: serialized,
      inlineCss: inlineCssParts.join('\n'),
      stylesheets,
      structuredData,
      anchorIds: [...proof.anchorIds].sort(),
      counts: {
        links: proof.links.length,
        forms: proof.forms,
        controls: proof.controls.size,
        images: proof.images,
        airstripLinks: proof.airstripLinks,
      },
      disposition: context.route.disposition,
    },
    proof,
  };
}

async function sanitizeTree(parent, context) {
  if (!Array.isArray(parent.childNodes)) return;
  const retained = [];
  for (const node of parent.childNodes) {
    if (node.nodeName === 'script' || node.nodeName === 'noscript') continue;
    if (!node.tagName) {
      retained.push(node);
      continue;
    }
    if (['iframe', 'object', 'embed'].includes(node.tagName)) {
      throw new Error(`Unsafe embedded content at ${context.route.route}`);
    }
    for (const attribute of node.attrs ?? []) {
      if (/^on/i.test(attribute.name)) throw new Error(`Inline event handler at ${context.route.route}`);
      if (/^javascript:/i.test(attribute.value.trim())) throw new Error(`javascript URL at ${context.route.route}`);
    }

    const nodeContext = { ...context, inForm: context.inForm || node.tagName === 'form' };
    if (node.tagName === 'a' || node.tagName === 'area') {
      const href = getAttr(node, 'href');
      if (href) {
        const rewritten = rewriteHref(href, nodeContext);
        setAttr(node, 'href', rewritten.href);
        nodeContext.proof.links.push({ href: rewritten.href, sourceHref: href, kind: rewritten.kind });
        if (rewritten.kind === 'anchor') nodeContext.proof.localAnchorHrefs.push(rewritten.href);
        if (rewritten.crossRouteAnchor) nodeContext.proof.crossRouteAnchorHrefs.push(rewritten.crossRouteAnchor);
        if (rewritten.isAirstrip) {
          nodeContext.proof.airstripLinks += 1;
          setAttr(node, 'data-preview-no-request', 'airstrip');
        }
        if (rewritten.kind === 'external') {
          setAttr(node, 'data-preview-external', 'held');
          setAttr(node, 'rel', mergeTokens(getAttr(node, 'rel'), ['noopener', 'noreferrer']));
        }
      }
    }

    for (const attributeName of ['src', 'poster', 'data-pumpkin-image-fallback']) {
      const value = getAttr(node, attributeName);
      if (!value) continue;
      setAttr(node, attributeName, rewriteMediaReference(value, context.sourceFile, context.media));
    }
    const srcset = getAttr(node, 'srcset');
    if (srcset) setAttr(node, 'srcset', rewriteSrcset(srcset, context.sourceFile, context.media));
    for (const attribute of node.attrs ?? []) {
      if (!attribute.name.startsWith('data-') || attribute.name === 'data-pumpkin-image-fallback') continue;
      if (MEDIA_PATH_PATTERN.test(attribute.value.trim())) {
        attribute.value = rewriteMediaReference(attribute.value, context.sourceFile, context.media);
      }
    }
    const style = getAttr(node, 'style');
    if (style) setAttr(node, 'style', await rewriteStyleAttribute(style, context.sourceFile, context.media));

    if (node.tagName === 'img') context.proof.images += 1;
    const controlId = getAttr(node, 'data-source-control-id');
    if (controlId) context.proof.controls.add(controlId);

    if (node.tagName === 'form') {
      context.proof.forms += 1;
      removeAttr(node, 'action');
      removeAttr(node, 'method');
      removeAttr(node, 'target');
      setAttr(node, 'data-pumpkin-no-post', 'true');
      const notice = parseFragment('<p class="pumpkin-preview-form-notice" role="note">Preview only. This form cannot be submitted.</p>').childNodes[0];
      node.childNodes = [notice, ...(node.childNodes ?? [])];
      notice.parentNode = node;
    }
    if (nodeContext.inForm && node.tagName === 'button') {
      const type = getAttr(node, 'type').toLowerCase() || 'submit';
      if (type === 'submit') {
        setAttr(node, 'type', 'button');
        setAttr(node, 'data-preview-submit', 'true');
      }
      removeAttr(node, 'formaction');
      removeAttr(node, 'formmethod');
    }
    if (nodeContext.inForm && node.tagName === 'input') {
      const type = getAttr(node, 'type').toLowerCase();
      if (type === 'submit' || type === 'image') {
        setAttr(node, 'type', 'button');
        setAttr(node, 'data-preview-submit', 'true');
      }
      removeAttr(node, 'formaction');
      removeAttr(node, 'formmethod');
    }

    await sanitizeTree(node, nodeContext);
    retained.push(node);
  }
  parent.childNodes = retained;
}

function rewriteHref(rawHref, context) {
  const href = rawHref.trim();
  if (!href || href === '#') return { href, kind: 'anchor', crossRouteAnchor: '', isAirstrip: false };
  if (href.startsWith('#')) return { href, kind: 'anchor', crossRouteAnchor: '', isAirstrip: false };
  if (/^(mailto:|tel:)/i.test(href)) return { href, kind: href.split(':', 1)[0].toLowerCase(), crossRouteAnchor: '', isAirstrip: false };
  if (/^javascript:/i.test(href)) throw new Error(`javascript URL at ${context.route.route}`);

  let url;
  try {
    url = new URL(href, `https://package.invalid/${context.sourceFile}`);
  } catch {
    throw new Error(`Invalid href ${href} at ${context.route.route}`);
  }
  const external = url.hostname !== 'package.invalid' && !context.targetHosts.has(url.hostname.toLowerCase());
  if (external) {
    const isAirstrip = /(^|\.)airstrip(?:lasvegas|lv)\.com$/i.test(url.hostname);
    return { href, kind: 'external', crossRouteAnchor: '', isAirstrip };
  }

  const sourceAssetPath = resolveSourcePathFromUrl(url, context.sourceFile);
  if (context.media.bySourcePath.has(sourceAssetPath)) {
    return { href: context.media.bySourcePath.get(sourceAssetPath).url, kind: 'download', crossRouteAnchor: '', isAirstrip: false };
  }
  const targetRoute = routeFromUrlPath(url.pathname);
  assert(context.routeSet.has(targetRoute), `Unmapped internal href ${href} at ${context.route.route}`);
  const suffix = `${url.search}${url.hash}`;
  const previewHref = `${context.previewBasePath}${targetRoute === '/' ? '' : targetRoute}${suffix}`;
  return {
    href: previewHref,
    kind: 'internal',
    crossRouteAnchor: url.hash ? `${targetRoute}${url.hash}` : '',
    isAirstrip: false,
  };
}

function rewriteMediaReference(rawValue, sourceFile, media) {
  const value = rawValue.trim();
  if (!value || /^(data:|blob:)/i.test(value)) return value;
  if (/^https:\/\//i.test(value)) {
    const canonical = media.byUrl.get(value);
    if (canonical) return canonical.url;
    throw new Error(`Unapproved external media URL: ${value}`);
  }
  if (SAFE_EXTERNAL_PROTOCOL.test(value)) throw new Error(`Unapproved media protocol: ${value}`);
  const sourcePath = resolveSourceAssetPath(value, sourceFile);
  const resolved = media.bySourcePath.get(sourcePath);
  assert(resolved, `Unmapped media alias: ${sourcePath}`);
  return resolved.url;
}

function rewriteSrcset(value, sourceFile, media) {
  return value.split(',').map((candidate) => {
    const parts = candidate.trim().split(/\s+/);
    const url = parts.shift();
    assert(url, `Invalid srcset in ${sourceFile}`);
    return [rewriteMediaReference(url, sourceFile, media), ...parts].join(' ');
  }).join(', ');
}

async function buildThemeFiles({ tenantId, themes, outputRoot, media }) {
  assert(themes.length === 1, `Expected one theme, found ${themes.length}.`);
  const sourceCssProof = themes[0]?.designSystem?.sourceCssProof;
  assert(sourceCssProof && typeof sourceCssProof === 'object', 'Theme source CSS proof is missing.');
  const registry = {};
  await mkdir(outputRoot, { recursive: true });
  for (const name of Object.keys(sourceCssProof).sort()) {
    const source = sourceCssProof[name];
    assert(typeof source?.contents === 'string', `Missing CSS contents for ${name}`);
    assert(sha256(source.contents) === String(source.sha256).toLowerCase(), `CSS source hash mismatch for ${name}`);
    const rewritten = await rewriteCss(source.contents, `assets/css/${name}`, media, name);
    const output = `/* Pumpkin immutable preview stylesheet: ${name} */\n${rewritten.trim()}\n`;
    const outputPath = path.join(outputRoot, name);
    await writeFile(outputPath, output, 'utf8');
    registry[name] = {
      path: `/themes/${tenantId}-reference/${name}`,
      sha256: sha256(output),
    };
  }
  return { registry };
}

async function rewriteCss(css, sourceFile, media, from) {
  const root = postcss.parse(css, { from });
  root.walkAtRules('import', (rule) => {
    if (!/^(?:url\()?\s*["']?https?:/i.test(rule.params)) throw new Error(`Local CSS import is not allowed in ${from}`);
  });
  root.walkDecls((declaration) => {
    declaration.value = rewriteCssValue(declaration.value, sourceFile, media);
  });
  return root.toString();
}

function rewriteCssValue(value, sourceFile, media) {
  const parsed = valueParser(value);
  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'url') return;
    const raw = valueParser.stringify(node.nodes).trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, '$1$2');
    if (!raw || /^(data:|#)/i.test(raw)) return;
    const rewritten = rewriteMediaReference(raw, sourceFile, media);
    node.nodes = [{ type: 'string', quote: '"', value: rewritten }];
  });
  return parsed.toString();
}

async function rewriteStyleAttribute(value, sourceFile, media) {
  const root = postcss.parse(`x{${value}}`, { from: `style:${sourceFile}` });
  root.walkDecls((declaration) => {
    declaration.value = rewriteCssValue(declaration.value, sourceFile, media);
  });
  const rule = root.first;
  return (rule.nodes ?? []).map((node) => node.toString()).join(';');
}

function buildMediaIndexes(mediaAssets, sourceAliases, packageAliases) {
  assert(Array.isArray(mediaAssets), 'Backup media collection is invalid.');
  assert(Array.isArray(sourceAliases), 'Backup source-alias collection is invalid.');
  assert(Array.isArray(packageAliases), 'Package source-alias map is invalid.');
  const byHash = new Map();
  const byId = new Map();
  const byUrl = new Map();
  const canonical = mediaAssets.map((asset) => {
    const hash = String(asset.hash || asset.checksum || '').toLowerCase();
    const url = String(asset.publicUrl || asset.url || '');
    const bytes = Number(asset.sizeBytes || asset.fileSize || 0);
    assert(SAFE_HASH.test(hash), `Invalid media hash for ${asset.id}`);
    assert(/^https:\/\//i.test(url), `Invalid public media URL for ${asset.id}`);
    assert(bytes > 0, `Zero-byte media record for ${asset.id}`);
    assert(!byHash.has(hash), `Duplicate canonical media hash ${hash}`);
    const record = { id: String(asset.id), sha256: hash, bytes, url };
    byHash.set(hash, record);
    byId.set(String(asset.id), record);
    byUrl.set(url, record);
    return record;
  }).sort((left, right) => left.sha256.localeCompare(right.sha256));

  for (const alias of sourceAliases) {
    const sourcePath = String(alias.fieldPath || '').replace(/^source-alias:/, '');
    assert(sourcePath, 'Backup source alias lacks a source path.');
    assert(byId.has(String(alias.mediaAssetId)), `Backup alias points to missing media: ${sourcePath}`);
  }

  const bySourcePath = new Map();
  const aliases = packageAliases.map((alias) => {
    const sourcePath = normalizeSourcePath(alias.sourcePath);
    const hash = String(alias.canonicalSha256 || alias.sourceSha256 || '').toLowerCase();
    const canonicalRecord = byHash.get(hash);
    assert(canonicalRecord, `Package alias points to missing canonical media: ${sourcePath}`);
    assert(!bySourcePath.has(sourcePath), `Duplicate source media alias: ${sourcePath}`);
    bySourcePath.set(sourcePath, canonicalRecord);
    return {
      sourcePath,
      sha256: hash,
      url: canonicalRecord.url,
      disposition: alias.disposition,
    };
  }).sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));

  assert(sourceAliases.length === aliases.length, 'Backup/package source-alias count mismatch.');
  return { canonical, aliases, byHash, byId, byUrl, bySourcePath };
}

function buildRedirects(pageOwned, tenantRedirects, routeRows) {
  const redirects = [];
  for (const redirect of pageOwned) {
    if (redirect.active === false) continue;
    redirects.push({
      sourcePath: normalizeRoute(redirect.from),
      targetPath: normalizeRoute(redirect.to),
      statusCode: Number(redirect.type),
      preserveQueryString: true,
      source: 'page-owned',
    });
  }
  for (const redirect of tenantRedirects) {
    if (redirect.active === false) continue;
    redirects.push({
      sourcePath: normalizeRoute(redirect.sourcePath),
      targetPath: normalizeRoute(redirect.target),
      statusCode: Number(redirect.statusCode),
      preserveQueryString: Boolean(redirect.preserveQueryString),
      source: 'tenant-generic',
    });
  }
  const routeSet = new Set(routeRows.map((item) => normalizeRoute(item.route)));
  const seen = new Set();
  for (const redirect of redirects) {
    assert(SAFE_REDIRECT_STATUS.has(redirect.statusCode), `Unsafe redirect status ${redirect.statusCode}`);
    assert(routeSet.has(redirect.sourcePath), `Redirect source is not a source route: ${redirect.sourcePath}`);
    assert(routeSet.has(redirect.targetPath), `Redirect target is not a source route: ${redirect.targetPath}`);
    assert(redirect.sourcePath !== redirect.targetPath, `Redirect loop: ${redirect.sourcePath}`);
    assert(!seen.has(redirect.sourcePath), `Duplicate redirect source: ${redirect.sourcePath}`);
    seen.add(redirect.sourcePath);
  }
  return redirects.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));
}

function buildCounts({ routes, redirects, backup, media, linkRows, controlRows, formRows, redirectMap }) {
  const effectiveLinks = countEffectiveRows(routes, linkRows, redirectMap);
  const effectiveControls = countEffectiveRows(routes, controlRows, redirectMap);
  const effectiveForms = formRows.length;
  const effectiveAirstripLinks = countEffectiveRows(routes, linkRows.filter((row) => row.isAirstrip), redirectMap);
  return {
    routes: routes.length,
    pageOwnedRedirects: redirects.filter((item) => item.source === 'page-owned').length,
    genericRedirects: redirects.filter((item) => item.source === 'tenant-generic').length,
    semanticRedirects: redirects.length,
    clubDetails: backup.catalogRecords.length,
    guideArticles: backup.guideArticles.length,
    canonicalMedia: media.canonical.length,
    sourcePathAliases: media.aliases.length,
    formDefinitions: backup.formDefinitions.length,
    physicalFormInstances: formRows.filter((row) => !row.viaRedirect).length,
    effectiveFormInstances: effectiveForms,
    physicalLinks: linkRows.length,
    effectiveLinks,
    physicalAirstripLinks: linkRows.filter((row) => row.isAirstrip).length,
    effectiveAirstripLinks,
    physicalControls: controlRows.length,
    effectiveControls,
  };
}

function countEffectiveRows(routes, rows, redirectMap) {
  const byRoute = new Map();
  for (const row of rows) {
    const route = normalizeRoute(row.physicalSourceRoute || row.route);
    byRoute.set(route, (byRoute.get(route) ?? 0) + 1);
  }
  return routes.reduce((total, route) => {
    const source = normalizeRoute(route.route);
    const effective = redirectMap.get(source) ?? source;
    return total + (byRoute.get(effective) ?? 0);
  }, 0);
}

function validateExpectedCounts(counts, packageManifest, backupManifest, fidelityStatus, declared) {
  const packageCounts = packageManifest.counts ?? {};
  const expected = {
    routes: Number(packageCounts.sourcePageRecords),
    clubDetails: Number(packageCounts.clubDetailRecords),
    guideArticles: Number(packageCounts.guideArticleRecords),
    canonicalMedia: Number(packageCounts.deduplicatedMediaAssets),
    sourcePathAliases: Number(packageCounts.sourceMediaFiles),
    formDefinitions: Number(packageCounts.formDefinitionCandidates),
    effectiveFormInstances: Number(packageCounts.sourceFormInstances),
  };
  for (const [key, value] of Object.entries(expected)) {
    assert(Number.isInteger(value) && counts[key] === value, `Count mismatch for ${key}: ${counts[key]} != ${value}`);
  }
  assert(counts.routes === Number(backupManifest.database.counts['pages.json']), 'Route/backup count mismatch.');
  assert(counts.physicalLinks === Number(declared.linkMap.physicalOccurrences), 'Declared physical-link count drift.');
  assert(counts.physicalControls === Number(declared.controlMap.physicalOccurrences), 'Declared physical-control count drift.');
  assert(counts.effectiveFormInstances === Number(declared.formMap.effectiveInstances), 'Declared effective-form count drift.');
  assert(counts.physicalFormInstances === Number(declared.formCandidates.physicalSourceFormCount), 'Declared physical-form count drift.');
  assert(counts.formDefinitions === Number(declared.formCandidates.candidateCount), 'Declared form-definition count drift.');
  assert(Number(fidelityStatus.blockedItems) === 0, 'Blocked fidelity items remain.');
}

function validateRouteParity(routes, routeProof, linkRows, controlRows) {
  const linksByRoute = groupCount(linkRows, (row) => normalizeRoute(row.route));
  const controlsByRoute = groupCount(controlRows, (row) => normalizeRoute(row.route));
  for (const route of routes) {
    const routeName = normalizeRoute(route.route);
    const proof = routeProof.get(routeName);
    assert(proof, `Missing compiled route proof: ${routeName}`);
    assert(proof.links.length === (linksByRoute.get(routeName) ?? 0), `Link count drift at ${routeName}`);
    assert(proof.controls.size === (controlsByRoute.get(routeName) ?? 0), `Control count drift at ${routeName}`);
  }
}

function validateCrossRouteAnchors(routeProof, routeSet) {
  for (const [sourceRoute, proof] of routeProof.entries()) {
    for (const target of proof.crossRouteAnchorHrefs) {
      const index = target.indexOf('#');
      const targetRoute = normalizeRoute(target.slice(0, index));
      const id = decodeURIComponent(target.slice(index + 1));
      assert(routeSet.has(targetRoute), `Unknown cross-route anchor target ${target} from ${sourceRoute}`);
      assert(routeProof.get(targetRoute)?.anchorIds.has(id), `Missing cross-route anchor ${target} from ${sourceRoute}`);
    }
  }
}

function validateFidelityGate(status) {
  assert(['passed_full_parity', 'passed_with_explicit_owner_accepted_deviations'].includes(status.status), `Fidelity gate is ${status.status}.`);
  for (const field of ['blockedItems', 'unclassifiedSourceElements', 'unresolvedInternalLinks', 'missingRequiredMedia', 'unmappedVisibleControls', 'silentGenericFallbacks', 'validatorErrors', 'validatorWarnings']) {
    assert(Number(status[field]) === 0, `Fidelity gate field ${field} is not zero.`);
  }
}

function validateFixtureInternalCounts(fixture) {
  assert(Object.keys(fixture.routes).length === fixture.counts.routes, 'Fixture route count mismatch.');
  assert(fixture.redirects.length === fixture.counts.semanticRedirects, 'Fixture redirect count mismatch.');
  assert(fixture.media.canonical.length === fixture.counts.canonicalMedia, 'Fixture canonical media count mismatch.');
  assert(fixture.media.aliases.length === fixture.counts.sourcePathAliases, 'Fixture alias count mismatch.');
  assert(fixture.forms.definitions.length === fixture.counts.formDefinitions, 'Fixture form-definition count mismatch.');
  assert(fixture.forms.instances.length === fixture.counts.effectiveFormInstances, 'Fixture form-instance count mismatch.');
  assert(fixture.links.rows.length === fixture.counts.physicalLinks, 'Fixture link count mismatch.');
  assert(fixture.controls.rows.length === fixture.counts.physicalControls, 'Fixture control count mismatch.');
}

async function validateFixtureSchema(fixture, schemaPath) {
  const schema = await readJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(fixture)) {
    throw new Error(`Fixture schema validation failed: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
  }
  validateFixtureInternalCounts(fixture);
}

async function readBackupCollections(root) {
  const database = path.join(root, 'database');
  return {
    themes: await readBackupArray(path.join(database, 'themes.json')),
    pageOwnedRedirects: await readBackupArray(path.join(database, 'page-owned-redirects.json')),
    tenantRedirects: await readBackupArray(path.join(database, 'tenant-redirects.json')),
    catalogRecords: await readBackupArray(path.join(database, 'catalog-records.json')),
    guideArticles: await readBackupArray(path.join(database, 'guide-article-records.json')),
    mediaAssets: await readBackupArray(path.join(database, 'media-assets.json')),
    sourceAliases: await readBackupArray(path.join(database, 'source-path-aliases.json')),
    formDefinitions: await readBackupArray(path.join(database, 'form-definitions.json')),
  };
}

async function readBackupArray(filePath) {
  const value = await readJson(filePath);
  const array = Array.isArray(value) ? value : value?.value;
  assert(Array.isArray(array), `Backup file is not an array: ${path.basename(filePath)}`);
  return array;
}

async function updateRegistry(registryPath, fixture) {
  let registry = { schemaVersion: 'pumpkin-preview-registry/v1', tenants: {} };
  try {
    registry = await readJson(registryPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  assert(registry.schemaVersion === 'pumpkin-preview-registry/v1', 'Preview registry schema mismatch.');
  registry.tenants ??= {};
  registry.tenants[fixture.tenantId] = {
    fixturePath: `preview-fixtures/${fixture.tenantId}/preview.json`,
    renderMode: fixture.renderMode,
    routeCount: fixture.counts.routes,
    noindex: true,
    publicIndexVisible: false,
    redirects: fixture.redirects,
  };
  await mkdir(path.dirname(registryPath), { recursive: true });
  await writeDeterministicJson(registryPath, registry);
}

function projectLinkRow(row) {
  return {
    id: row.id,
    route: row.route,
    href: row.href,
    kind: row.kind,
    context: row.context,
    download: Boolean(row.download),
    isAirstrip: Boolean(row.isAirstrip),
    disposition: row.disposition,
  };
}

function projectControlRow(row) {
  return {
    id: row.id,
    route: row.route,
    tag: row.tag,
    type: row.type,
    label: row.label,
    intendedAction: row.intendedAction,
    disposition: row.disposition,
    browserProofPassed: Boolean(row.browserProofPassed),
  };
}

function getTargetHosts(packageManifest) {
  return new Set([
    packageManifest.target?.primaryDomain,
    packageManifest.target?.wwwDomain,
  ].filter(Boolean).map((host) => String(host).toLowerCase()));
}

function routeFromUrlPath(pathname) {
  let value = decodeURIComponent(pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  if (value.endsWith('/index.html')) value = value.slice(0, -'/index.html'.length);
  if (value === '/index.html') value = '/';
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return normalizeRoute(value);
}

function resolveSourcePathFromUrl(url, sourceFile) {
  if (url.hostname !== 'package.invalid') return normalizeSourcePath(url.pathname.replace(/^\//, ''));
  return resolveSourceAssetPath(url.pathname, sourceFile);
}

function resolveSourceAssetPath(value, sourceFile) {
  const pathname = new URL(value, `https://package.invalid/${sourceFile}`).pathname;
  return normalizeSourcePath(decodeURIComponent(pathname).replace(/^\//, ''));
}

function normalizeSourcePath(value) {
  const normalized = path.posix.normalize(String(value).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, ''));
  assert(normalized && normalized !== '.' && !normalized.startsWith('../'), `Unsafe source path: ${value}`);
  return normalized;
}

function normalizeRoute(value) {
  const raw = String(value || '/').split(/[?#]/, 1)[0].replace(/\\/g, '/');
  const normalized = `/${raw}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return normalized || '/';
}

function routeKey(route) {
  const normalized = normalizeRoute(route).replace(/^\//, '');
  return normalized || 'home';
}

function findFirst(root, predicate) {
  if (!root) return null;
  if (predicate(root)) return root;
  for (const child of root.childNodes ?? []) {
    const match = findFirst(child, predicate);
    if (match) return match;
  }
  return null;
}

function findAll(root, predicate, results = []) {
  if (!root) return results;
  if (predicate(root)) results.push(root);
  for (const child of root.childNodes ?? []) findAll(child, predicate, results);
  return results;
}

function textContent(node) {
  if (!node) return '';
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? []).map(textContent).join('');
}

function getAttr(node, name) {
  return node?.attrs?.find((attribute) => attribute.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function setAttr(node, name, value) {
  node.attrs ??= [];
  const existing = node.attrs.find((attribute) => attribute.name.toLowerCase() === name.toLowerCase());
  if (existing) existing.value = String(value);
  else node.attrs.push({ name, value: String(value) });
}

function removeAttr(node, name) {
  if (!node?.attrs) return;
  node.attrs = node.attrs.filter((attribute) => attribute.name.toLowerCase() !== name.toLowerCase());
}

function relTokens(node) {
  return getAttr(node, 'rel').toLowerCase().split(/\s+/).filter(Boolean);
}

function mergeTokens(value, additions) {
  return [...new Set([...String(value).split(/\s+/), ...additions].filter(Boolean))].join(' ');
}

function groupCount(rows, getKey) {
  const map = new Map();
  for (const row of rows) {
    const key = getKey(row);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
}

function hasSensitiveValue(value) {
  if (value === null || value === undefined || value === '' || value === false) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

async function resolveSourcePackageHash(packageManifest, sourceArchivePath) {
  const declared = String(packageManifest.sourcePackage?.originalArchiveSha256 || '').toLowerCase();
  assert(SAFE_HASH.test(declared), 'Package source archive hash is missing.');
  if (!sourceArchivePath) return declared;
  const actual = await sha256File(sourceArchivePath);
  assert(actual === declared, 'Source archive hash does not match normalized package declaration.');
  return actual;
}

function verifyExpectedHash(label, actual, expected) {
  if (!expected) return;
  assert(actual === String(expected).toLowerCase(), `${label} hash mismatch.`);
}

async function treeSha256(root) {
  const files = await walkFiles(root);
  const rows = [];
  for (const file of files) {
    const relative = path.relative(root, file).replace(/\\/g, '/');
    const info = await stat(file);
    rows.push(`${relative}\0${await sha256File(file)}\0${info.size}\n`);
  }
  return sha256(rows.join(''));
}

async function walkFiles(root) {
  const output = [];
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile()) output.push(full);
    }
  };
  await visit(root);
  return output;
}

function resolveOptions(options) {
  const required = ['packageRoot', 'backupRoot', 'referenceRoot', 'outputRoot', 'registryPath', 'themeOutputRoot', 'schemaPath'];
  for (const key of required) assert(options[key], `Missing compiler option: ${key}`);
  return Object.fromEntries(Object.entries(options).map(([key, value]) => [
    key,
    typeof value === 'string' && value && /(?:Path|Root)$/.test(key) ? path.resolve(value) : value,
  ]));
}

async function readJson(filePath) {
  return JSON.parse((await readFile(filePath, 'utf8')).replace(/^\uFEFF/, ''));
}

async function writeDeterministicJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, stableStringify(value), 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
  return sha256(await readFile(filePath));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
