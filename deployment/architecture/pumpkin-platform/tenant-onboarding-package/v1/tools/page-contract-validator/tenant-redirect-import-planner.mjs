#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ALLOWED_STATUS_CODES = new Set([301, 302, 307, 308]);
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);

export function buildTenantRedirectImportPlan({ routeMap, existingRedirects = [], importCorrelationId = "" }) {
  const tenantId = String(routeMap?.tenantId || "").trim().toLowerCase();
  if (!tenantId) throw new Error("route map tenantId is required");
  const routes = Array.isArray(routeMap.routes) ? routeMap.routes : [];
  const routePaths = new Set(routes.map((route) => normalizeReference(route.route).path));
  const existingBySource = new Map();
  const existingItems = Array.isArray(existingRedirects) ? existingRedirects : existingRedirects ? [existingRedirects] : [];
  for (const item of existingItems) {
    const source = normalizeReference(item.sourcePath || item.from).path;
    if (!source) continue;
    if (existingBySource.has(source)) throw new Error(`duplicate existing redirect source: ${source}`);
    existingBySource.set(source, normalizeExisting(item));
  }

  const declarations = routes
    .filter((route) => route?.redirect)
    .map((route, index) => declarationFromRoute(route, index));
  const declarationCounts = new Map();
  for (const declaration of declarations) {
    declarationCounts.set(declaration.normalizedSourcePath, (declarationCounts.get(declaration.normalizedSourcePath) || 0) + 1);
  }
  const duplicateSources = new Set(
    [...declarationCounts].filter(([, count]) => count > 1).map(([source]) => source),
  );
  const edges = new Map();
  for (const declaration of declarations) {
    if (
      !duplicateSources.has(declaration.normalizedSourcePath) &&
      ALLOWED_STATUS_CODES.has(declaration.statusCode) &&
      declaration.sourcePathSupported &&
      declaration.targetPathSupported &&
      declaration.targetProtocolSupported &&
      declaration.targetKind === "internal" &&
      declaration.normalizedSourcePath !== declaration.normalizedTargetPath
    ) {
      edges.set(declaration.normalizedSourcePath, declaration.normalizedTargetPath);
    }
  }
  const cycles = detectCycles(edges);
  const cycleSources = new Set(cycles.flatMap((cycle) => cycle.slice(0, -1)));

  const actions = [];
  for (const declaration of declarations) {
    const existing = existingBySource.get(declaration.normalizedSourcePath);
    if (!declaration.sourcePathSupported || declaration.sourceHasSuffix) {
      declaration.disposition = "blocked_invalid_source";
    } else if (duplicateSources.has(declaration.normalizedSourcePath)) {
      declaration.disposition = "blocked_duplicate_source";
    } else if (!ALLOWED_STATUS_CODES.has(declaration.statusCode)) {
      declaration.disposition = "blocked_unsupported_status";
    } else if (!declaration.targetProtocolSupported) {
      declaration.disposition = "blocked_unsupported_target_scheme";
    } else if (!declaration.targetPathSupported) {
      declaration.disposition = "blocked_invalid_target";
    } else if (declaration.normalizedSourcePath === declaration.normalizedTargetPath) {
      declaration.disposition = declaration.fragment ? "client_anchor" : "blocked_self_route";
    } else if (cycleSources.has(declaration.normalizedSourcePath)) {
      declaration.disposition = "blocked_cycle";
    } else if (declaration.targetKind === "internal" && !routePaths.has(declaration.normalizedTargetPath)) {
      declaration.disposition = "blocked_unresolved_target";
    } else if (existing) {
      declaration.disposition = equivalent(existing, declaration) ? "preserved_existing" : "blocked_existing_conflict";
    } else {
      declaration.disposition = "persistable_tenant_redirect";
      actions.push({
        action: "create",
        idempotencyKey: redirectId(tenantId, declaration.normalizedSourcePath),
        endpoint: `/api/admin/tenants/${encodeURIComponent(tenantId)}/redirects`,
        payload: {
          sourcePath: declaration.normalizedSourcePath,
          target: declaration.normalizedTarget,
          targetKind: declaration.targetKind,
          statusCode: declaration.statusCode,
          active: true,
          preserveQueryString: true,
          targetStatus: "resolved",
          pageShadowMode: routePaths.has(declaration.normalizedSourcePath) ? "redirect_precedes_page" : "none",
          sourcePackagePath: declaration.sourceFile,
          sourceDeclaration: declaration.sourceEvidence,
          importCorrelationId,
          auditCorrelationId: redirectId(tenantId, declaration.normalizedSourcePath),
        },
      });
    }
  }

  const blocked = declarations.filter((item) => item.disposition.startsWith("blocked_"));
  return {
    schemaVersion: "1.0.0",
    tenantId,
    valid: blocked.length === 0,
    status: blocked.length === 0 ? "persistable_idempotent_plan" : "blocked_before_write",
    counts: {
      sourceDeclarations: declarations.length,
      existingNoopActions: declarations.filter((item) => item.disposition === "preserved_existing").length,
      createActions: actions.length,
      blocked: blocked.length,
      persistedObjectsAfterApply: existingBySource.size + actions.length,
    },
    cycles,
    declarations,
    actions,
  };
}

function declarationFromRoute(route, index) {
  const source = normalizeReference(route.redirect.sourceRoute || route.route);
  const target = normalizeReference(route.redirect.targetRoute || route.redirect.rawTarget, route.sourceFile);
  const external = target.protocol !== "https:" || target.host !== "tenant.invalid";
  const statusCode = Number(route.redirect.statusCode ?? route.redirect.type ?? 301);
  return {
    order: index + 1,
    sourceFile: route.redirect.sourceFile || route.sourceFile || "",
    normalizedSourcePath: source.path,
    normalizedTarget: external ? target.url : `${target.path}${target.query}${target.fragment}`,
    normalizedTargetPath: target.path,
    targetKind: external ? "external" : "internal",
    statusCode,
    sourceHasSuffix: Boolean(source.query || source.fragment),
    sourcePathSupported: source.pathSupported,
    targetPathSupported: external || target.pathSupported,
    targetProtocolSupported: !external || ALLOWED_EXTERNAL_PROTOCOLS.has(target.protocol),
    fragment: target.fragment,
    sourceEvidence: route.redirect.sourceEvidence || "source-package redirect declaration",
    disposition: "unclassified",
  };
}

function normalizeExisting(item) {
  const targetKind = String(item.targetKind || "internal").toLowerCase();
  const target = normalizeReference(item.target || item.to);
  return {
    target: targetKind === "external" ? target.url : `${target.path}${target.query}${target.fragment}`,
    targetKind,
    statusCode: Number(item.statusCode || item.type || 301),
    active: item.active !== false,
  };
}

function normalizeReference(value, sourceFile = "") {
  const raw = String(value || "").trim();
  const baseDirectory = sourceFile ? `/${path.posix.dirname(toPosix(sourceFile)).replace(/^\/+/, "")}/` : "/";
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(raw)
    ? new URL(raw)
    : new URL(raw.startsWith("/") ? raw : raw, `https://tenant.invalid${baseDirectory}`);
  const segments = absolute.pathname.replace(/\\/g, "/").split("/").map(safeDecode);
  const pathSupported = segments
    .filter(Boolean)
    .every((segment) => segment.trim() && segment !== "." && segment !== ".." && !/[\/\\\u0000-\u001f\u007f]/.test(segment));
  if (segments.at(-1)?.toLowerCase() === "index.html") segments.pop();
  const normalizedPath = `/${segments.filter(Boolean).map((segment) => encodePathSegment(segment.trim().toLowerCase())).join("/")}`.replace(/\/$/, "") || "/";
  return {
    url: absolute.toString(),
    protocol: absolute.protocol.toLowerCase(),
    host: absolute.hostname.toLowerCase(),
    path: normalizedPath,
    query: absolute.search,
    fragment: absolute.hash,
    pathSupported,
  };
}

function detectCycles(edges) {
  const cycles = [];
  const emitted = new Set();
  for (const start of edges.keys()) {
    const seen = new Map();
    const chain = [];
    let current = start;
    while (edges.has(current)) {
      if (seen.has(current)) {
        const cycle = [...chain.slice(seen.get(current)), current];
        const key = [...new Set(cycle.slice(0, -1))].sort().join("|");
        if (!emitted.has(key)) {
          emitted.add(key);
          cycles.push(cycle);
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

function equivalent(existing, declaration) {
  return existing.active &&
    existing.target === declaration.normalizedTarget &&
    existing.targetKind === declaration.targetKind &&
    existing.statusCode === declaration.statusCode;
}

function redirectId(tenantId, sourcePath) {
  return `redirect-${tenantId}-${crypto.createHash("sha256").update(sourcePath).digest("hex").slice(0, 16)}`;
}

function safeDecode(value) {
  return decodeURIComponent(value);
}

function encodePathSegment(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    if (!values[index]?.startsWith("--") || values[index + 1] === undefined) throw new Error("Arguments must use --name value pairs.");
    parsed.set(values[index].slice(2), values[index + 1]);
  }
  return parsed;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArguments(process.argv.slice(2));
  if (!args.has("route-map")) throw new Error("--route-map is required");
  const result = buildTenantRedirectImportPlan({
    routeMap: readJson(path.resolve(args.get("route-map"))),
    existingRedirects: args.has("existing-redirects") ? readJson(path.resolve(args.get("existing-redirects"))) : [],
    importCorrelationId: args.get("import-correlation-id") || "",
  });
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  if (args.has("out")) {
    const output = path.resolve(args.get("out"));
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, serialized, "utf8");
  }
  process.stdout.write(serialized);
  process.exitCode = result.valid ? 0 : 1;
}
