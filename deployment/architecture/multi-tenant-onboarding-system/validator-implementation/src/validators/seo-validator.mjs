import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { canonicalHostForSite, getDocumentsByRole, isProductionReady, normalizeRoutePath, parseHttpUrl } from "./reference-utils.mjs";

const stagingHostPatterns = [/localhost/i, /127\.0\.0\.1/, /azurestaticapps\.net/i, /azurewebsites\.net/i, /pages\.dev/i, /web\.core\.windows\.net/i, /staging/i, /preview/i, /default-host/i];

export function validateSeoConsistency(parsedDocuments) {
  const findings = [];
  const manifest = parsedDocuments.get("manifest.json")?.data;
  const tenant = parsedDocuments.get("tenant.json")?.data;
  const site = parsedDocuments.get("site.json")?.data;
  const seo = parsedDocuments.get("seo.json")?.data;
  const pages = getDocumentsByRole(parsedDocuments, "page");
  const productionReady = isProductionReady({ manifest, tenant, seo });
  const canonicalHost = canonicalHostForSite(site);

  if (seo?.canonicalBaseUrl && canonicalHost) {
    const baseUrl = parseHttpUrl(seo.canonicalBaseUrl);
    if (!baseUrl || baseUrl.hostname.toLowerCase() !== canonicalHost.toLowerCase()) {
      findings.push(seoFinding({
        code: ErrorCode.CANONICAL_ROUTE_MISMATCH,
        file: "seo.json",
        jsonPointer: "/canonicalBaseUrl",
        message: "seo.json canonicalBaseUrl does not match the declared canonical host.",
        ownerExplanation: "The default canonical URL should use the primary or www domain selected in site.json.",
        nextAction: `Set canonicalBaseUrl to https://${canonicalHost}.`
      }));
    }
  }

  for (const page of pages) {
    const route = normalizeRoutePath(page.data?.route);
    const robots = page.data?.seo?.robots ?? seo?.defaultRobots;
    if (productionReady && robots === "noindex,nofollow") {
      findings.push(seoFinding({
        code: ErrorCode.SEO_NOINDEX_NOT_ALLOWED,
        file: page.relativePath,
        jsonPointer: "/seo/robots",
        route,
        message: `${page.relativePath} is production-ready but still has noindex robots policy.`,
        ownerExplanation: "Approved production pages should not block indexing unless a manual final-gate exception is recorded.",
        nextAction: "Change robots to index,follow or move the package out of production-ready status."
      }));
    }

    if (page.data?.seo?.canonicalUrl) {
      const canonicalUrl = parseHttpUrl(page.data.seo.canonicalUrl);
      if (!canonicalUrl || !canonicalHost || canonicalUrl.hostname.toLowerCase() !== canonicalHost.toLowerCase() || normalizeRoutePath(canonicalUrl.pathname) !== route) {
        findings.push(seoFinding({
          code: ErrorCode.CANONICAL_ROUTE_MISMATCH,
          file: page.relativePath,
          jsonPointer: "/seo/canonicalUrl",
          route,
          message: `${page.relativePath} canonicalUrl does not match its route and canonical host.`,
          ownerExplanation: "A page canonical URL should use the declared canonical domain and the same path as the page route.",
          nextAction: `Use https://${canonicalHost}${route ?? "/"} as the page canonical URL.`
        }));
      }
    }
  }

  validateOptionalSitemap(findings, seo, canonicalHost);

  return findings;
}

function validateOptionalSitemap(findings, seo, canonicalHost) {
  const sitemapUrls = [
    ...(Array.isArray(seo?.sitemapUrls) ? seo.sitemapUrls : []),
    ...(Array.isArray(seo?.sitemap?.urls) ? seo.sitemap.urls : [])
  ];

  sitemapUrls.forEach((url, index) => {
    const parsedUrl = parseHttpUrl(url);
    if (!parsedUrl || parsedUrl.hostname.toLowerCase() !== canonicalHost?.toLowerCase() || stagingHostPatterns.some((pattern) => pattern.test(url))) {
      findings.push(seoFinding({
        code: ErrorCode.SITEMAP_CANONICAL_MISMATCH,
        file: "seo.json",
        jsonPointer: `/sitemapUrls/${index}`,
        message: "A sitemap URL does not match the canonical policy.",
        ownerExplanation: "Sitemap URLs must use the same public canonical domain as approved pages.",
        nextAction: "Remove staging/default-host URLs and use the declared canonical host."
      }));
    }
  });
}

function seoFinding({ code, file, jsonPointer = null, route = null, message, ownerExplanation, nextAction }) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer,
    route,
    message,
    ownerExplanation,
    operatorDetail: "SEO checks run offline against site.json, seo.json, routes.json, and pages/*.json.",
    nextAction,
    gateId: "seo-canonical"
  });
}
