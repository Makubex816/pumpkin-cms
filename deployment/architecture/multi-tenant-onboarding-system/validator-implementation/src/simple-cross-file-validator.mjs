import { createFinding } from "./gate-status.mjs";

export function validateSimpleCrossFile(parsedDocuments) {
  const findings = [];
  const manifest = parsedDocuments.get("manifest.json")?.data;
  const tenant = parsedDocuments.get("tenant.json")?.data;
  const site = parsedDocuments.get("site.json")?.data;
  const routes = parsedDocuments.get("routes.json")?.data;
  const pages = [...parsedDocuments.values()].filter((document) => document.role === "page");

  compareField(findings, "manifest.json", manifest, "tenant.json", tenant, "tenantId");
  compareField(findings, "manifest.json", manifest, "tenant.json", tenant, "siteKey");
  compareField(findings, "tenant.json", tenant, "site.json", site, "tenantId");
  compareField(findings, "tenant.json", tenant, "site.json", site, "siteKey");

  if (routes?.approvedRoutes && pages.length > 0) {
    const approvedRoutes = new Set(routes.approvedRoutes);
    const pageRoutes = new Map(pages.map((page) => [page.data?.route, page.relativePath]));

    for (const page of pages) {
      if (typeof page.data?.route === "string" && !approvedRoutes.has(page.data.route)) {
        findings.push(
          createFinding({
            severity: "error",
            code: "PAGE_ROUTE_NOT_APPROVED",
            file: page.relativePath,
            jsonPointer: "/route",
            route: page.data.route,
            message: `${page.relativePath} uses route ${page.data.route}, but routes.json does not approve it.`,
            ownerExplanation: "A page is trying to use a URL that is not on the approved route list.",
            operatorDetail: "Page route must be listed in routes.json approvedRoutes.",
            nextAction: "Add the route to approvedRoutes or change the page route to an approved route.",
            gateId: "simple-cross-file"
          })
        );
      }
    }

    for (const route of approvedRoutes) {
      if (!pageRoutes.has(route)) {
        findings.push(
          createFinding({
            severity: "error",
            code: "APPROVED_ROUTE_WITHOUT_PAGE",
            file: "routes.json",
            jsonPointer: "/approvedRoutes",
            route,
            message: `routes.json approves ${route}, but no page file uses that route.`,
            ownerExplanation: "The approved route list includes a URL that does not have a matching page file.",
            operatorDetail: "Phase 2A-1 expects each approved route to have one page JSON file.",
            nextAction: "Add a page for the route or remove the route from approvedRoutes.",
            gateId: "simple-cross-file"
          })
        );
      }
    }
  }

  return findings;
}

function compareField(findings, leftFile, left, rightFile, right, field) {
  if (!left || !right || left[field] === undefined || right[field] === undefined || left[field] === right[field]) {
    return;
  }

  findings.push(
    createFinding({
      severity: "error",
      code: "CROSS_FILE_FIELD_MISMATCH",
      file: rightFile,
      field,
      jsonPointer: `/${field}`,
      message: `${rightFile} ${field} does not match ${leftFile}.`,
      ownerExplanation: "Two package files disagree about which tenant or site this package belongs to.",
      operatorDetail: `${leftFile}.${field} is ${left[field]}, but ${rightFile}.${field} is ${right[field]}.`,
      nextAction: `Update ${rightFile} so ${field} matches ${leftFile}.`,
      gateId: "simple-cross-file"
    })
  );
}
