const idPattern = /^[a-z][a-z0-9-]{2,80}$/;
const tenantIdPattern = /^[a-z][a-z0-9-]{2,63}$/;
const domainPattern = /^[a-z0-9.-]+\.[a-z]{2,}$/;
const routePattern = /^\/$|^\/[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*\/?$/;
const secretLikePatterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /(client_secret|access_token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]{8,}/i,
  /[?&](sig|signature|sv|sp|se|token|access_token|api_key|client_secret)=/i
];
const stagingOrLocalPatterns = [/localhost/i, /127\.0\.0\.1/i, /azurestaticapps\.net/i, /azurewebsites\.net/i, /pages\.dev/i, /web\.core\.windows\.net/i, /staging/i, /preview/i, /default-host/i];
const pausedTenantPatterns = [/roller/i, /roller-rink-rentals/i, /rollerrinkrentals/i];

export function validateAnswers(answers) {
  const errors = [];

  requireValue(errors, answers?.schemaVersion, "schemaVersion");
  requireValue(errors, answers?.tenant?.tenantDisplayName, "tenant.tenantDisplayName");
  requirePattern(errors, answers?.tenant?.tenantId, "tenant.tenantId", tenantIdPattern);
  requirePattern(errors, answers?.tenant?.siteKey, "tenant.siteKey", tenantIdPattern);
  requireValue(errors, answers?.tenant?.businessType, "tenant.businessType");
  requirePattern(errors, answers?.tenant?.cmsTenantSlug, "tenant.cmsTenantSlug", tenantIdPattern);
  requireDomain(errors, answers?.domains?.primaryDomain, "domains.primaryDomain");
  requireDomain(errors, answers?.domains?.wwwDomain, "domains.wwwDomain");
  requireDomain(errors, answers?.domains?.mediaDomain, "domains.mediaDomain");
  requireValue(errors, answers?.domains?.canonicalHost, "domains.canonicalHost");
  requireValue(errors, answers?.builderProfile?.deploymentProfile, "builderProfile.deploymentProfile");

  if (answers?.schemaVersion && answers.schemaVersion !== "1.0.0") {
    errors.push(error("schemaVersion", "schemaVersion must be 1.0.0."));
  }

  if (answers?.domains?.canonicalHost && !["primary", "www"].includes(answers.domains.canonicalHost)) {
    errors.push(error("domains.canonicalHost", "canonicalHost must be primary or www."));
  }

  const approvedRoutes = answers?.routing?.approvedRoutes;
  const forbiddenRoutes = answers?.routing?.forbiddenRoutes ?? [];
  if (!Array.isArray(approvedRoutes) || approvedRoutes.length === 0) {
    errors.push(error("routing.approvedRoutes", "At least one approved route is required."));
  } else {
    validateRouteList(errors, approvedRoutes, "routing.approvedRoutes");
  }
  validateRouteList(errors, forbiddenRoutes, "routing.forbiddenRoutes");
  validateRouteOverlap(errors, approvedRoutes ?? [], forbiddenRoutes);

  if (!Array.isArray(answers?.pages) || answers.pages.length === 0) {
    errors.push(error("pages", "At least one page answer is required."));
  } else {
    validatePages(errors, answers.pages, approvedRoutes ?? [], answers.media ?? [], answers.form);
  }

  if (!Array.isArray(answers?.media)) {
    errors.push(error("media", "media must be an array."));
  } else {
    validateMedia(errors, answers.media, answers?.domains?.mediaDomain);
  }

  validateForm(errors, answers?.form);
  validateSeo(errors, answers?.seo);
  scanForUnsafeStrings(errors, answers);

  return {
    valid: errors.length === 0,
    errors
  };
}

export function normalizeRoute(route) {
  if (route === "/") {
    return "/";
  }
  const withLeadingSlash = String(route ?? "").startsWith("/") ? String(route) : `/${route}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function slugFromRoute(route) {
  const normalized = normalizeRoute(route);
  if (normalized === "/") {
    return "home";
  }
  return normalized.split("/").filter(Boolean).join("-");
}

function validateRouteList(errors, routes, path) {
  if (!Array.isArray(routes)) {
    errors.push(error(path, `${path} must be an array.`));
    return;
  }

  const seen = new Set();
  routes.forEach((route, index) => {
    const itemPath = `${path}[${index}]`;
    if (typeof route !== "string" || !routePattern.test(route)) {
      errors.push(error(itemPath, "Route must start with / and contain lowercase letters, numbers, and hyphens."));
      return;
    }
    const normalized = normalizeRoute(route);
    if (seen.has(normalized)) {
      errors.push(error(itemPath, `Duplicate route ${normalized}.`));
    }
    seen.add(normalized);
  });
}

function validateRouteOverlap(errors, approvedRoutes, forbiddenRoutes) {
  const approved = new Set(approvedRoutes.map(normalizeRoute));
  for (const route of forbiddenRoutes.map(normalizeRoute)) {
    if (approved.has(route)) {
      errors.push(error("routing", `Route ${route} cannot be both approved and forbidden.`));
    }
  }
}

function validatePages(errors, pages, approvedRoutes, media, form) {
  const approved = new Set(approvedRoutes.map(normalizeRoute));
  const pageRoutes = new Set();
  const mediaIds = new Set((Array.isArray(media) ? media : []).map((asset) => asset?.mediaId).filter(Boolean));
  const formId = form?.formId;

  pages.forEach((page, index) => {
    const base = `pages[${index}]`;
    requireValue(errors, page?.title, `${base}.title`);
    requirePattern(errors, page?.slug ?? slugFromRoute(page?.route), `${base}.slug`, idPattern);
    if (!page?.route || !routePattern.test(page.route)) {
      errors.push(error(`${base}.route`, "Page route is required and must use a safe route format."));
    }
    const normalized = normalizeRoute(page?.route);
    if (page?.route && !approved.has(normalized)) {
      errors.push(error(`${base}.route`, `Page route ${normalized} is not in approvedRoutes.`));
    }
    pageRoutes.add(normalized);

    for (const mediaRef of page?.mediaRefs ?? []) {
      if (!mediaIds.has(mediaRef)) {
        errors.push(error(`${base}.mediaRefs`, `Page references unknown mediaId ${mediaRef}.`));
      }
    }

    if (page?.formRef && page.formRef !== formId) {
      errors.push(error(`${base}.formRef`, `Page references unknown formId ${page.formRef}.`));
    }
  });

  for (const route of approved) {
    if (!pageRoutes.has(route)) {
      errors.push(error("pages", `Approved route ${route} does not have a page answer.`));
    }
  }
}

function validateMedia(errors, media, mediaDomain) {
  const seen = new Set();
  media.forEach((asset, index) => {
    const base = `media[${index}]`;
    requirePattern(errors, asset?.mediaId, `${base}.mediaId`, /^[a-z0-9][a-z0-9-]{2,120}$/);
    requireValue(errors, asset?.fileName, `${base}.fileName`);
    requireValue(errors, asset?.altText, `${base}.altText`);
    requireValue(errors, asset?.publicUrl, `${base}.publicUrl`);

    if (asset?.mediaId) {
      if (seen.has(asset.mediaId)) {
        errors.push(error(`${base}.mediaId`, `Duplicate mediaId ${asset.mediaId}.`));
      }
      seen.add(asset.mediaId);
    }

    if (asset?.fileName && /[\\/]|\.env|local\.settings|appsettings\.development|secret/i.test(asset.fileName)) {
      errors.push(error(`${base}.fileName`, "Media fileName must be a safe base file name."));
    }

    if (asset?.publicUrl) {
      const parsed = parseUrl(asset.publicUrl);
      if (!parsed || parsed.protocol !== "https:") {
        errors.push(error(`${base}.publicUrl`, "Media publicUrl must be an https URL."));
      } else if (mediaDomain && parsed.hostname.toLowerCase() !== mediaDomain.toLowerCase()) {
        errors.push(error(`${base}.publicUrl`, `Media publicUrl must use ${mediaDomain}.`));
      }
    }
  });
}

function validateForm(errors, form) {
  if (!form) {
    errors.push(error("form", "form is required."));
    return;
  }
  requirePattern(errors, form.formId, "form.formId", idPattern);
  requireValue(errors, form.displayName, "form.displayName");
  requireEmail(errors, form.recipient, "form.recipient");
  requireValue(errors, form.mailboxOwner, "form.mailboxOwner");
  if (!Array.isArray(form.fields) || form.fields.length === 0) {
    errors.push(error("form.fields", "At least one form field is required."));
  }
}

function validateSeo(errors, seo) {
  if (!seo) {
    errors.push(error("seo", "seo is required."));
    return;
  }
  if (!["index,follow", "noindex,nofollow"].includes(seo.defaultRobots)) {
    errors.push(error("seo.defaultRobots", "defaultRobots must be index,follow or noindex,nofollow."));
  }
  if (seo.indexingFinalGate !== true) {
    errors.push(error("seo.indexingFinalGate", "indexingFinalGate must remain true."));
  }
}

function scanForUnsafeStrings(errors, value, pointer = "$") {
  if (typeof value === "string") {
    if (pausedTenantPatterns.some((pattern) => pattern.test(value))) {
      errors.push(error(pointer, "Paused tenant references are not allowed in builder answers."));
    }
    if (secretLikePatterns.some((pattern) => pattern.test(value))) {
      errors.push(error(pointer, "Secret-like value detected. Remove it before generation."));
    }
    if (/^[A-Za-z]:[\\/]|^\\\\|file:\/\//.test(value)) {
      errors.push(error(pointer, "Local filesystem paths are not allowed in answers."));
    }
    const parsed = parseUrl(value);
    if (parsed && stagingOrLocalPatterns.some((pattern) => pattern.test(parsed.hostname))) {
      errors.push(error(pointer, "Local, staging, preview, or default-host URLs are not allowed in answers."));
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForUnsafeStrings(errors, item, `${pointer}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      scanForUnsafeStrings(errors, child, `${pointer}.${key}`);
    }
  }
}

function requireValue(errors, value, path) {
  if (value === undefined || value === null || value === "") {
    errors.push(error(path, `${path} is required.`));
  }
}

function requirePattern(errors, value, path, pattern) {
  requireValue(errors, value, path);
  if (typeof value === "string" && !pattern.test(value)) {
    errors.push(error(path, `${path} uses an unsupported format.`));
  }
}

function requireDomain(errors, value, path) {
  requirePattern(errors, value, path, domainPattern);
  if (typeof value === "string" && stagingOrLocalPatterns.some((pattern) => pattern.test(value))) {
    errors.push(error(path, `${path} must be a production public domain, not a local/staging host.`));
  }
}

function requireEmail(errors, value, path) {
  requireValue(errors, value, path);
  if (typeof value === "string" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    errors.push(error(path, `${path} must be an email address.`));
  }
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function error(path, message) {
  return { path, message };
}
