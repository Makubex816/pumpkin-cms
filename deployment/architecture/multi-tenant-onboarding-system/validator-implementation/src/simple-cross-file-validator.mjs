import { createFinding } from "./gate-status.mjs";
import { ErrorCode } from "./error-codes.mjs";
import { getDocumentsByRole, normalizeRoutePath, walkStringValues } from "./validators/reference-utils.mjs";

const obsoleteRoutePatterns = [/^\/old\//, /^\/obsolete\//, /^\/preview\//, /^\/draft\//];
const pausedTenantPatterns = [/roller/i, /roller-rink-rentals/i, /rollerrinkrentals/i];

export function validateSimpleCrossFile(parsedDocuments) {
  const findings = [];
  const manifest = parsedDocuments.get("manifest.json")?.data;
  const tenant = parsedDocuments.get("tenant.json")?.data;
  const site = parsedDocuments.get("site.json")?.data;
  const routes = parsedDocuments.get("routes.json")?.data;
  const theme = parsedDocuments.get("theme.json")?.data;
  const redirects = parsedDocuments.get("redirects.json")?.data;
  const pages = getDocumentsByRole(parsedDocuments, "page");

  validateScopeConsistency(findings, parsedDocuments, manifest, tenant, site);
  validateRoutesAndPages(findings, routes, pages, theme, redirects);
  validateTenantReferences(findings, parsedDocuments, tenant);

  return findings;
}

function validateScopeConsistency(findings, parsedDocuments, manifest, tenant, site) {
  compareScopedField(findings, "manifest.json", manifest, "tenant.json", tenant, "tenantId", ErrorCode.TENANT_ID_MISMATCH);
  compareScopedField(findings, "manifest.json", manifest, "tenant.json", tenant, "siteKey", ErrorCode.SITE_KEY_MISMATCH);
  compareScopedField(findings, "tenant.json", tenant, "site.json", site, "tenantId", ErrorCode.TENANT_ID_MISMATCH);
  compareScopedField(findings, "tenant.json", tenant, "site.json", site, "siteKey", ErrorCode.SITE_KEY_MISMATCH);

  const canonicalTenantId = tenant?.tenantId ?? manifest?.tenantId;
  const canonicalSiteKey = tenant?.siteKey ?? manifest?.siteKey;

  for (const document of parsedDocuments.values()) {
    if (document.data?.tenantId && canonicalTenantId && document.data.tenantId !== canonicalTenantId) {
      findings.push(scopeFinding(document.relativePath, "/tenantId", ErrorCode.TENANT_ID_MISMATCH, "tenantId", canonicalTenantId, document.data.tenantId));
    }
    if (document.data?.siteKey && canonicalSiteKey && document.data.siteKey !== canonicalSiteKey) {
      findings.push(scopeFinding(document.relativePath, "/siteKey", ErrorCode.SITE_KEY_MISMATCH, "siteKey", canonicalSiteKey, document.data.siteKey));
    }
  }
}

function validateRoutesAndPages(findings, routes, pages, theme, redirects) {
  const approvedRoutes = new Set((routes?.approvedRoutes ?? []).map(normalizeRoutePath).filter(Boolean));
  const forbiddenRoutes = new Set((routes?.forbiddenRoutes ?? []).map(normalizeRoutePath).filter(Boolean));
  const pageRoutes = new Map();
  const pageSlugs = new Map();

  for (const route of approvedRoutes) {
    if (forbiddenRoutes.has(route) || obsoleteRoutePatterns.some((pattern) => pattern.test(route))) {
      findings.push(routeFinding({
        code: forbiddenRoutes.has(route) ? ErrorCode.FORBIDDEN_ROUTE_PRESENT : ErrorCode.OBSOLETE_ROUTE_APPROVED,
        file: "routes.json",
        route,
        message: `routes.json approves ${route}, but that route is forbidden or obsolete.`,
        ownerExplanation: "An approved route points to a page URL that should not go live.",
        nextAction: "Remove the route from approvedRoutes or remove it from forbiddenRoutes if it was added there by mistake."
      }));
    }
  }

  for (const page of pages) {
    const route = normalizeRoutePath(page.data?.route);
    const slug = page.data?.slug;

    if (slug) {
      if (pageSlugs.has(slug)) {
        findings.push(routeFinding({
          code: ErrorCode.PAGE_SLUG_DUPLICATE,
          file: page.relativePath,
          jsonPointer: "/slug",
          route,
          message: `${page.relativePath} reuses page slug ${slug}.`,
          ownerExplanation: "Two page files use the same slug, so the import would not know which page owns that slug.",
          nextAction: "Give each page a unique slug."
        }));
      }
      pageSlugs.set(slug, page.relativePath);
    }

    if (!route) {
      continue;
    }

    if (pageRoutes.has(route)) {
      findings.push(routeFinding({
        code: ErrorCode.ROUTE_PATH_DUPLICATE,
        file: page.relativePath,
        jsonPointer: "/route",
        route,
        message: `${page.relativePath} duplicates route ${route}.`,
        ownerExplanation: "Two page files use the same URL route.",
        nextAction: "Keep one page for the route and change or remove the duplicate."
      }));
    }
    pageRoutes.set(route, page.relativePath);

    if (forbiddenRoutes.has(route)) {
      findings.push(routeFinding({
        code: ErrorCode.FORBIDDEN_ROUTE_PRESENT,
        file: page.relativePath,
        jsonPointer: "/route",
        route,
        message: `${page.relativePath} uses forbidden route ${route}.`,
        ownerExplanation: "A page is using a route that routes.json marks as forbidden.",
        nextAction: "Move the page to an approved route or remove the route from forbiddenRoutes after review."
      }));
    }

    if (approvedRoutes.size > 0 && !approvedRoutes.has(route)) {
      findings.push(routeFinding({
        code: ErrorCode.PAGE_ROUTE_NOT_APPROVED,
        file: page.relativePath,
        jsonPointer: "/route",
        route,
        message: `${page.relativePath} uses route ${route}, but routes.json does not approve it.`,
        ownerExplanation: "A page is trying to use a URL that is not on the approved route list.",
        nextAction: "Add the route to approvedRoutes or change the page route to an approved route."
      }));
    }
  }

  for (const route of approvedRoutes) {
    if (!pageRoutes.has(route)) {
      findings.push(routeFinding({
        code: ErrorCode.ROUTE_PAGE_MISSING,
        file: "routes.json",
        jsonPointer: "/approvedRoutes",
        route,
        message: `routes.json approves ${route}, but no page file uses that route.`,
        ownerExplanation: "The approved route list includes a URL that does not have a matching page file.",
        nextAction: "Add a page for the route or remove the route from approvedRoutes."
      }));
    }
  }

  for (const item of theme?.navigation ?? []) {
    const href = normalizeRoutePath(item.href);
    if (href && forbiddenRoutes.has(href)) {
      findings.push(routeFinding({
        code: ErrorCode.FORBIDDEN_ROUTE_PRESENT,
        file: "theme.json",
        jsonPointer: "/navigation",
        route: href,
        message: `theme.json navigation links to forbidden route ${href}.`,
        ownerExplanation: "The navigation includes a link that should not be used.",
        nextAction: "Remove the navigation item or point it to an approved route."
      }));
    }
  }

  for (const redirect of redirects?.redirects ?? []) {
    for (const field of ["source", "destination"]) {
      const route = normalizeRoutePath(redirect[field]);
      if (route && forbiddenRoutes.has(route)) {
        findings.push(routeFinding({
          code: ErrorCode.FORBIDDEN_ROUTE_PRESENT,
          file: "redirects.json",
          jsonPointer: `/redirects/${field}`,
          route,
          message: `redirects.json ${field} uses forbidden route ${route}.`,
          ownerExplanation: "A redirect references a route that should remain unavailable.",
          nextAction: "Change the redirect source or destination to an approved route."
        }));
      }
    }
  }
}

function validateTenantReferences(findings, parsedDocuments, tenant) {
  const tenantId = tenant?.tenantId;
  const siteKey = tenant?.siteKey;
  const cmsTenantSlug = tenant?.cmsTenantSlug;

  for (const document of parsedDocuments.values()) {
    walkStringValues(document, (value, pointer, field) => {
      const normalized = value.toLowerCase();
      if (pausedTenantPatterns.some((pattern) => pattern.test(value)) && !isAllowedPausedTenantPointer(document.relativePath, pointer)) {
        findings.push(
          createFinding({
            severity: "error",
            code: ErrorCode.PAUSED_TENANT_REFERENCE,
            file: document.relativePath,
            jsonPointer: pointer,
            field,
            message: `${document.relativePath}${pointer} references a paused tenant.`,
            ownerExplanation: "The package references Roller or another paused tenant in a place that could affect import behavior.",
            operatorDetail: "Paused tenant references are only allowed in explicit paused-related metadata fields.",
            nextAction: "Remove the paused tenant reference from this package.",
            gateId: "cross-file"
          })
        );
      }

      if (field && /tenant/i.test(field) && looksLikeTenantId(value) && ![tenantId, siteKey, cmsTenantSlug].includes(value) && !isAllowedRelatedTenantPointer(pointer)) {
        findings.push(
          createFinding({
            severity: "error",
            code: ErrorCode.UNRELATED_TENANT_REFERENCE,
            file: document.relativePath,
            jsonPointer: pointer,
            field,
            message: `${document.relativePath}${pointer} references an unrelated tenant.`,
            ownerExplanation: "The package includes a tenant-like identifier that does not match this package.",
            operatorDetail: `Expected ${tenantId}, ${siteKey}, or ${cmsTenantSlug}; found a different tenant-shaped value.`,
            nextAction: "Remove the unrelated tenant reference or move it to approved related-tenant metadata.",
            gateId: "cross-file"
          })
        );
      }
    });
  }
}

function compareScopedField(findings, leftFile, left, rightFile, right, field, code) {
  if (!left || !right || left[field] === undefined || right[field] === undefined || left[field] === right[field]) {
    return;
  }

  findings.push(scopeFinding(rightFile, `/${field}`, code, field, left[field], right[field], leftFile));
}

function scopeFinding(file, pointer, code, field, expected, actual, expectedFile = "tenant.json") {
  return createFinding({
    severity: "error",
    code,
    file,
    field,
    jsonPointer: pointer,
    message: `${file} ${field} does not match ${expectedFile}.`,
    ownerExplanation: "Two package files disagree about which tenant or site this package belongs to.",
    operatorDetail: `${expectedFile}.${field} is ${expected}, but ${file}.${field} is ${actual}.`,
    nextAction: `Update ${file} so ${field} matches ${expectedFile}.`,
    gateId: "cross-file"
  });
}

function routeFinding({ code, file, jsonPointer = null, route, message, ownerExplanation, nextAction }) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer,
    route,
    message,
    ownerExplanation,
    operatorDetail: "Route checks run offline against routes.json, theme.json, redirects.json, and pages/*.json.",
    nextAction,
    gateId: "cross-file"
  });
}

function looksLikeTenantId(value) {
  return /^[a-z][a-z0-9-]{2,63}$/.test(value);
}

function isAllowedRelatedTenantPointer(pointer) {
  return pointer.includes("/relatedTenants/") || pointer.includes("/pausedRelatedTenants/");
}

function isAllowedPausedTenantPointer(file, pointer) {
  return file === "tenant.json" && pointer.includes("/pausedRelatedTenants/");
}
