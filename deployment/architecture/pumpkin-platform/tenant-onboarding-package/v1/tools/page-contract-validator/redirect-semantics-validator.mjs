#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsMap = parseArguments(process.argv.slice(2));
const routeMapPath = requiredPath(argumentsMap, "route-map");
const persistedFromsPath = optionalPath(argumentsMap, "persisted-froms");
const sourceRoot = optionalPath(argumentsMap, "source-root");
const outputPath = optionalPath(argumentsMap, "out");

const routeMap = readJson(routeMapPath);
const routes = Array.isArray(routeMap.routes) ? routeMap.routes : [];
const redirects = routes
  .filter((route) => route?.redirect)
  .map((route, index) => buildDeclaration(route, index, sourceRoot));
const persistedFroms = persistedFromsPath
  ? new Set(readJson(persistedFromsPath).map((value) => normalizeRoute(value).path))
  : new Set();
const routePaths = new Set(routes.map((route) => normalizeRoute(route.route).path));
const cycles = detectCycles(redirects);
const multiNodeCycleSources = new Set(
  cycles.filter((cycle) => cycle.type === "multi_node_cycle").flatMap((cycle) => cycle.nodes.slice(0, -1)),
);

for (const declaration of redirects) {
  declaration.targetExists = declaration.targetExists || routePaths.has(declaration.normalizedTarget.path);
  declaration.disposition = classifyDisposition(declaration, persistedFroms, multiNodeCycleSources);
  declaration.noOpProof = buildNoOpProof(declaration);
}

const counts = {
  sourceDeclarations: redirects.length,
  persistedRedirects: redirects.filter((item) => item.disposition === "persisted_redirect").length,
  canonicalNoOps: redirects.filter((item) => item.disposition === "canonical_noop").length,
  clientAnchors: redirects.filter((item) => item.disposition === "client_anchor").length,
  externalRedirects: redirects.filter((item) => item.disposition === "external_redirect").length,
  persistableTenantRedirects: redirects.filter((item) => item.disposition === "persistable_tenant_redirect").length,
  blockedRedirects: redirects.filter((item) => item.disposition === "blocked_unresolved_redirect").length,
  cycleInvalidRedirects: redirects.filter((item) => item.disposition === "cycle_invalid_redirect").length,
  semanticDispositions: redirects.length,
};
const valid = counts.blockedRedirects === 0 && counts.cycleInvalidRedirects === 0;
const result = {
  valid,
  status: valid ? "passed_redirect_semantic_accounting" : "blocked_redirect_semantics",
  routeMap: routeMapPath,
  sourceRoot: sourceRoot || null,
  counts,
  cycles,
  declarations: redirects,
};

const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
}
process.stdout.write(serialized);
process.exitCode = valid ? 0 : 1;

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    if (!values[index]?.startsWith("--") || values[index + 1] === undefined) {
      throw new Error("Arguments must use --name value pairs.");
    }
    parsed.set(values[index].slice(2), values[index + 1]);
  }
  return parsed;
}

function requiredPath(values, name) {
  const value = optionalPath(values, name);
  if (!value) throw new Error(`Missing required --${name} path.`);
  return value;
}

function optionalPath(values, name) {
  return values.has(name) ? path.resolve(values.get(name)) : "";
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function buildDeclaration(route, index, sourceRootPath) {
  const source = normalizeRoute(route.redirect.sourceRoute || route.route);
  const target = normalizeTarget(route.redirect.rawTarget || route.redirect.targetRoute, source, route.sourceFile);
  const declaredTarget = normalizeRoute(route.redirect.targetRoute || target.url);
  const sourceEvidence = sourceRootPath && route.sourceFile
    ? readSourceEvidence(sourceRootPath, route.sourceFile, source, target)
    : null;
  return {
    order: index + 1,
    sourceFile: route.redirect.sourceFile || route.sourceFile || "",
    rawSource: route.redirect.sourceRoute || route.route || "",
    rawTarget: route.redirect.rawTarget || route.redirect.targetRoute || "",
    declaredTargetRoute: route.redirect.targetRoute || "",
    normalizedSource: source,
    normalizedTarget: target,
    declaredTargetMatchesResolvedTarget: equivalentReference(target, declaredTarget),
    targetExists: route.redirect.targetExists === true,
    sourceEvidence,
    disposition: "unclassified",
    noOpProof: null,
  };
}

function normalizeTarget(value, source, sourceFile) {
  const raw = String(value || "").trim();
  if (!raw) return normalizeRoute("");
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("//")) return normalizeRoute(raw);
  if (raw.startsWith("#") || raw.startsWith("?")) {
    return normalizeRoute(`${source.path}${raw}`);
  }
  const sourceDirectory = sourceFile
    ? `/${toPosix(path.posix.dirname(toPosix(sourceFile))).replace(/^\/+/, "")}/`
    : `${source.path.replace(/\/$/, "")}/`;
  return normalizeRoute(new URL(raw, `https://tenant.invalid${sourceDirectory}`).toString());
}

function normalizeRoute(value) {
  const raw = String(value || "").trim();
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(raw)
    ? new URL(raw)
    : raw.startsWith("//")
      ? new URL(`https:${raw}`)
      : new URL(raw.startsWith("/") ? `https://tenant.invalid${raw}` : `https://tenant.invalid/${raw}`);
  const decodedSegments = absolute.pathname
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => safeDecode(segment).toLowerCase());
  if (decodedSegments.at(-1) === "index.html") decodedSegments.pop();
  let normalizedPath = decodedSegments.join("/").replace(/\/{2,}/g, "/");
  if (!normalizedPath.startsWith("/")) normalizedPath = `/${normalizedPath}`;
  normalizedPath = normalizedPath.replace(/\/$/, "") || "/";
  const query = [...absolute.searchParams.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => `${leftKey}\u0000${leftValue}`.localeCompare(`${rightKey}\u0000${rightValue}`))
    .map(([key, item]) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
    .join("&");
  return {
    url: absolute.toString(),
    scheme: absolute.protocol.replace(/:$/, "").toLowerCase(),
    host: absolute.hostname.toLowerCase(),
    port: absolute.port,
    path: normalizedPath,
    query,
    fragment: safeDecode(absolute.hash.replace(/^#/, "")),
  };
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function equivalentReference(left, right) {
  return left.scheme === right.scheme &&
    left.host === right.host &&
    left.port === right.port &&
    left.path === right.path &&
    left.query === right.query &&
    left.fragment === right.fragment;
}

function equivalentRoute(left, right) {
  return left.path === right.path && left.query === right.query && left.fragment === right.fragment;
}

function classifyDisposition(declaration, persisted, cycleSources) {
  const source = declaration.normalizedSource;
  const target = declaration.normalizedTarget;
  const sameOrigin = source.scheme === target.scheme && source.host === target.host && source.port === target.port;
  const sameRoute = sameOrigin && source.path === target.path && source.query === target.query;
  if (sameRoute && source.fragment === target.fragment) return "canonical_noop";
  if (sameRoute && source.fragment !== target.fragment) return "client_anchor";
  if (!sameOrigin) return "external_redirect";
  if (cycleSources.has(source.path)) return "cycle_invalid_redirect";
  if (persisted.has(source.path)) return "persisted_redirect";
  if (declaration.targetExists) return "persistable_tenant_redirect";
  return "blocked_unresolved_redirect";
}

function buildNoOpProof(declaration) {
  const source = declaration.normalizedSource;
  const target = declaration.normalizedTarget;
  const evidence = declaration.sourceEvidence;
  const checks = {
    normalizedPathEqual: source.path === target.path,
    queryEqual: source.query === target.query,
    fragmentEqual: source.fragment === target.fragment,
    hostEqual: source.host === target.host && source.port === target.port,
    schemeEqual: source.scheme === target.scheme,
    targetExists: declaration.targetExists,
    noDistinctMetaRefresh: evidence ? !evidence.metaRefreshPresent || evidence.metaRefreshTargetsSource : null,
    noDistinctCanonicalTarget: evidence ? !evidence.canonicalPresent || evidence.canonicalRouteTargetsSource : null,
    noDistinctMovedPageLink: evidence ? !evidence.distinctTargetLinkPresent : null,
    noScriptRedirectDependency: evidence ? !evidence.scriptLocationPresent : null,
    noDistinctBrowserBehavior: evidence
      ? !evidence.metaRefreshPresent && !evidence.distinctTargetLinkPresent && !evidence.movedTextPresent
      : null,
  };
  return {
    passed: Object.values(checks).every((value) => value === true || value === null),
    checks,
  };
}

function readSourceEvidence(root, sourceFile, source, target) {
  const sourcePath = path.resolve(root, sourceFile);
  const relative = path.relative(root, sourcePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Source file escapes source root: ${sourceFile}`);
  }
  if (!fs.existsSync(sourcePath)) return { sourceFilePresent: false };
  const html = fs.readFileSync(sourcePath, "utf8");
  const metaContent = firstMatch(html, [
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+http-equiv=["']?refresh/i,
  ]);
  const metaTargetRaw = metaContent.match(/url\s*=\s*(.+)$/i)?.[1]?.trim() || "";
  const metaTarget = metaTargetRaw ? normalizeTarget(metaTargetRaw, source, sourceFile) : null;
  const canonicalRaw = firstMatch(html, [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
  ]);
  const canonical = canonicalRaw ? normalizeRoute(canonicalRaw) : null;
  const hrefs = [...html.matchAll(/<a[^>]+href=["']([^"']+)/gi)].map((match) => match[1]);
  const distinctTargetLinkPresent = hrefs.some((href) => equivalentReference(normalizeTarget(href, source, sourceFile), target));
  return {
    sourceFilePresent: true,
    metaRefreshPresent: Boolean(metaTarget),
    metaRefreshRaw: metaContent,
    metaRefreshTargetsDeclaredTarget: metaTarget ? equivalentReference(metaTarget, target) : false,
    metaRefreshTargetsSource: metaTarget ? equivalentReference(metaTarget, source) : false,
    canonicalPresent: Boolean(canonical),
    canonicalRaw,
    canonicalRouteTargetsDeclaredTarget: canonical ? equivalentRoute(canonical, target) : false,
    canonicalRouteTargetsSource: canonical ? equivalentRoute(canonical, source) : false,
    canonicalHost: canonical?.host || "",
    distinctTargetLinkPresent,
    movedTextPresent: /\b(moved|now lives)\b/i.test(html),
    scriptLocationPresent: /(window\.)?location\s*(?:\.|=)/i.test(html),
  };
}

function firstMatch(value, patterns) {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1] || "";
  }
  return "";
}

function detectCycles(declarations) {
  const edges = new Map();
  for (const declaration of declarations) {
    const source = declaration.normalizedSource;
    const target = declaration.normalizedTarget;
    if (source.host === target.host && source.scheme === target.scheme && source.port === target.port) {
      const sameServerRoute = source.path === target.path && source.query === target.query;
      if (sameServerRoute && source.fragment !== target.fragment) continue;
      edges.set(routeNode(source), routeNode(target));
    }
  }
  const cycles = [];
  const emitted = new Set();
  for (const start of edges.keys()) {
    const seen = new Map();
    const chain = [];
    let current = start;
    while (edges.has(current)) {
      if (seen.has(current)) {
        const nodes = [...chain.slice(seen.get(current)), current];
        const type = nodes.length === 2 ? "direct_self_loop" : "multi_node_cycle";
        const key = [...new Set(nodes.slice(0, -1))].sort().join("|");
        if (!emitted.has(key)) {
          cycles.push({ type, nodes });
          emitted.add(key);
        }
        break;
      }
      seen.set(current, chain.length);
      chain.push(current);
      current = edges.get(current);
    }
  }
  return cycles;
}

function routeNode(reference) {
  return reference.query ? `${reference.path}?${reference.query}` : reference.path;
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}
