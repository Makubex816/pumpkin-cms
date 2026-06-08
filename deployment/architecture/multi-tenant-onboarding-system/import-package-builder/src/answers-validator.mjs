const idPattern = /^[a-z][a-z0-9-]{2,80}$/;
const looseSlugPattern = /^[a-z0-9][a-z0-9-]{0,80}$/;
const tenantIdPattern = /^[a-z][a-z0-9-]{2,63}$/;
const domainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const routePattern = /^\/$|^\/[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*\/?$/;
const mediaFilePattern = /^[a-z0-9][a-z0-9.-]{1,120}\.[a-z0-9]{2,8}$/;
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const secretLikePatterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /(client_secret|access_token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]{8,}/i,
  /[?&](sig|signature|sv|sp|se|token|access_token|api_key|client_secret)=/i
];
const stagingOrLocalPatterns = [/localhost/i, /127\.0\.0\.1/i, /\[::1\]/i, /azurestaticapps\.net/i, /azurewebsites\.net/i, /pages\.dev/i, /web\.core\.windows\.net/i, /staging/i, /preview/i, /default-host/i];
const pausedTenantPatterns = [/roller/i, /roller-rink-rentals/i, /rollerrinkrentals/i];
const unrelatedTenantPatterns = [/iceskatingrinkrentals/i, /ice-skating-rink-rentals/i, /iceskatingrinkrentals\.com/i, /othertenantrentals/i, /other-tenant-rentals/i, /othertenantrentals\.com/i];
const approvedPausedTenantDryRun = Object.freeze({
  tenant: "roller-rink-rentals",
  primaryDomain: "rollerrinkrentals.com",
  approvedScope: "local-offline-dry-run-only"
});
const allowedDeploymentProfiles = new Set([
  "static-azure-cloudflare-worker-graph",
  "static-azure-cloudflare-cdn",
  "cloudflare-pages-worker",
  "existing-api-dynamic-site",
  "no-email-lead-capture"
]);
const allowedFormDeliveryModes = new Set(["no-email", "graph", "webhook", "profile-managed"]);
const allowedRollbackModes = new Set(["no-email", "disable-form", "profile-managed"]);
const allowedConsentStatuses = new Set(["approved", "pending-review", "not-required-by-owner"]);
const allowedMediaKinds = new Set(["logo", "image", "icon", "document"]);
const allowedMediaSourceStatuses = new Set(["usage-rights-confirmed", "pending-review", "placeholder"]);
const allowedPageStatuses = new Set(["draft", "approved-for-preview"]);
const allowedRobots = new Set(["index,follow", "noindex,nofollow"]);
const allowedSitemapPolicies = new Set(["approved-routes-only", "disabled-until-final-gate"]);
const allowedAnalyticsStatuses = new Set(["deferred", "omitted", "requested", "not-selected"]);
const allowedPrivacyStatuses = new Set(["approved", "pending-review", "blocked", "not-required-by-owner"]);
const allowedApprovalStatuses = new Set(["pending", "approved", "blocked", "not-required", "blocked-until-final-review"]);
export const defaultForbiddenRoutes = Object.freeze(["/draft/", "/preview/", "/old/"]);

const requiredOwnerContacts = [
  "businessOwner",
  "contentOwner",
  "mediaOwner",
  "formOwner",
  "technicalOperator",
  "monitoringOwner",
  "rollbackOwner",
  "indexingOwner"
];

const requiredManualApprovals = [
  "contentApproval",
  "legalPrivacyApproval",
  "formOversightApproval",
  "analyticsDecisionApproval",
  "monitoringApproval",
  "rollbackApproval",
  "indexingFinalGateApproval"
];

export const AnswerErrorCode = Object.freeze({
  REQUIRED_FIELD_MISSING: "ANSWERS_REQUIRED_FIELD_MISSING",
  INVALID_SCHEMA_VERSION: "ANSWERS_INVALID_SCHEMA_VERSION",
  INVALID_ID_FORMAT: "ANSWERS_INVALID_ID_FORMAT",
  INVALID_TEXT_LENGTH: "ANSWERS_INVALID_TEXT_LENGTH",
  INVALID_DOMAIN: "ANSWERS_INVALID_DOMAIN",
  INVALID_PRODUCTION_URL: "ANSWERS_INVALID_PRODUCTION_URL",
  URL_CONTAINS_CREDENTIALS: "ANSWERS_URL_CONTAINS_CREDENTIALS",
  UNSAFE_VALUE: "ANSWERS_UNSAFE_VALUE",
  UNKNOWN_DEPLOYMENT_PROFILE: "ANSWERS_UNKNOWN_DEPLOYMENT_PROFILE",
  INVALID_TRAILING_SLASH_POLICY: "ANSWERS_INVALID_TRAILING_SLASH_POLICY",
  INVALID_ROUTE: "ANSWERS_INVALID_ROUTE",
  DUPLICATE_ROUTE: "ANSWERS_DUPLICATE_ROUTE",
  ROUTE_OVERLAP: "ANSWERS_ROUTE_OVERLAP",
  APPROVED_ROUTE_MISSING_PAGE: "ANSWERS_APPROVED_ROUTE_MISSING_PAGE",
  PAGE_ROUTE_NOT_APPROVED: "ANSWERS_PAGE_ROUTE_NOT_APPROVED",
  DUPLICATE_PAGE_SLUG: "ANSWERS_DUPLICATE_PAGE_SLUG",
  UNKNOWN_MEDIA_REFERENCE: "ANSWERS_UNKNOWN_MEDIA_REFERENCE",
  DUPLICATE_MEDIA_ID: "ANSWERS_DUPLICATE_MEDIA_ID",
  UNSAFE_MEDIA_FILE_NAME: "ANSWERS_UNSAFE_MEDIA_FILE_NAME",
  FORM_REQUIRED: "ANSWERS_FORM_REQUIRED",
  DUPLICATE_FORM_ID: "ANSWERS_DUPLICATE_FORM_ID",
  UNKNOWN_FORM_REFERENCE: "ANSWERS_UNKNOWN_FORM_REFERENCE",
  FORM_RECIPIENT_REFERENCE_CONFLICT: "ANSWERS_FORM_RECIPIENT_REFERENCE_CONFLICT",
  INVALID_ENUM_VALUE: "ANSWERS_INVALID_ENUM_VALUE",
  INDEXING_NOT_ALLOWED: "ANSWERS_INDEXING_NOT_ALLOWED",
  SECRET_LIKE_VALUE: "ANSWERS_SECRET_LIKE_VALUE",
  PAUSED_TENANT_REFERENCE: "ANSWERS_PAUSED_TENANT_REFERENCE",
  PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID: "ANSWERS_PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID",
  UNRELATED_TENANT_REFERENCE: "ANSWERS_UNRELATED_TENANT_REFERENCE",
  LOCAL_PATH_VALUE: "ANSWERS_LOCAL_PATH_VALUE"
});

export function validateAnswers(answers) {
  const errors = [];

  validateTopLevel(errors, answers);
  validateTenant(errors, answers?.tenant);
  validateDomains(errors, answers?.domains);
  validateBuilderProfile(errors, answers?.builderProfile);
  validateRouting(errors, answers?.routing);
  validateMedia(errors, answers?.media, answers?.domains?.mediaDomain);
  validateForms(errors, answers);
  validatePages(errors, answers);
  validateSeo(errors, answers);
  validateAnalytics(errors, answers?.analyticsDecision);
  validatePrivacy(errors, answers?.privacyReviewStatus);
  validateOwnerContacts(errors, answers?.ownerContacts);
  validateManualApprovals(errors, answers?.manualApprovals);
  validatePausedTenantDryRunApproval(errors, answers);
  scanForUnsafeStrings(errors, answers, "$", {
    pausedTenantDryRunApproved: isPausedTenantDryRunApproved(answers)
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function normalizeRoute(route, trailingSlashPolicy = "always") {
  if (route === "/") {
    return "/";
  }
  const withLeadingSlash = String(route ?? "").startsWith("/") ? String(route) : `/${route}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");
  if (trailingSlashPolicy === "always") {
    return `${withoutTrailingSlash}/`;
  }
  return withoutTrailingSlash || "/";
}

export function slugFromRoute(route) {
  const normalized = normalizeRoute(route);
  if (normalized === "/") {
    return "home";
  }
  return normalized.split("/").filter(Boolean).join("-");
}

export function getAnswerForms(answers) {
  if (Array.isArray(answers?.forms)) {
    return answers.forms;
  }
  if (isPlainObject(answers?.form)) {
    return [answers.form];
  }
  return [];
}

export function canonicalBaseUrlFromAnswers(answers) {
  const host = selectedCanonicalHost(answers);
  return host ? `https://${host}` : null;
}

export function isPausedTenantDryRunApproved(answers) {
  const approval = answers?.pausedTenantDryRunApproval;
  return isPlainObject(approval)
    && approval.tenant === approvedPausedTenantDryRun.tenant
    && approval.primaryDomain === approvedPausedTenantDryRun.primaryDomain
    && approval.approvedScope === approvedPausedTenantDryRun.approvedScope
    && approval.externalMutationsAllowed === false
    && approval.livePagesApproved === false
    && approval.livePagesHardStopped === true
    && approval.searchConsoleApproved === false
    && approval.searchConsoleIndexingHardStopped === true
    && approval.approvedByOwner === true
    && answers?.tenant?.tenantId === approvedPausedTenantDryRun.tenant
    && answers?.tenant?.siteKey === approvedPausedTenantDryRun.tenant
    && answers?.tenant?.cmsTenantSlug === approvedPausedTenantDryRun.tenant
    && answers?.domains?.primaryDomain === approvedPausedTenantDryRun.primaryDomain
    && answers?.builderProfile?.generatorMode === "offline-local-only"
    && answers?.seo?.defaultRobots === "noindex,nofollow"
    && answers?.seo?.sitemapPolicy === "disabled-until-final-gate"
    && answers?.seo?.indexingFinalGate === true
    && answers?.manualApprovals?.indexingFinalGateApproval === "blocked-until-final-review";
}

function validateTopLevel(errors, answers) {
  if (!isPlainObject(answers)) {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, "$", "The answers file must be a JSON object.", "Start from the example answers file and fill in each section.", "Ask an operator for help if the file does not open as normal JSON."));
    return;
  }

  for (const field of ["schemaVersion", "builderProfile", "tenant", "domains", "routing", "pages", "media", "seo", "analyticsDecision", "privacyReviewStatus", "ownerContacts", "manualApprovals"]) {
    requireValue(errors, answers[field], field);
  }

  if (!isPlainObject(answers.form) && !Array.isArray(answers.forms)) {
    errors.push(error(AnswerErrorCode.FORM_REQUIRED, "form", "A contact form section is required.", "Add a form object with formId, displayName, recipient, owner, fields, consent status, and rollback mode.", "Ask the form owner which approved lead inbox should receive submissions."));
  }

  if (answers.schemaVersion && answers.schemaVersion !== "1.0.0") {
    errors.push(error(AnswerErrorCode.INVALID_SCHEMA_VERSION, "schemaVersion", "The answers file version is not supported.", "Set schemaVersion to 1.0.0.", "Ask a developer if you are using a newer answers file format."));
  }
}

function validateTenant(errors, tenant) {
  if (!isPlainObject(tenant)) {
    return;
  }

  requireTextLength(errors, tenant.tenantDisplayName, "tenant.tenantDisplayName", 2, 120, "Enter the business name as reviewers should see it.");
  requirePattern(errors, tenant.tenantId, "tenant.tenantId", tenantIdPattern, "Use lowercase letters, numbers, and hyphens, starting with a letter.");
  requirePattern(errors, tenant.siteKey, "tenant.siteKey", tenantIdPattern, "Use lowercase letters, numbers, and hyphens, starting with a letter.");
  requireTextLength(errors, tenant.businessType, "tenant.businessType", 2, 120, "Enter a short business category, such as event rental services.");
  requirePattern(errors, tenant.cmsTenantSlug, "tenant.cmsTenantSlug", tenantIdPattern, "Use the same safe slug style as tenantId.");

  if (tenant.tenantApiKeyPlaceholder && tenant.tenantApiKeyPlaceholder !== "TENANT_API_KEY_RUNTIME_ONLY") {
    errors.push(error(AnswerErrorCode.SECRET_LIKE_VALUE, "tenant.tenantApiKeyPlaceholder", "Tenant API keys must never be included in answers.", "Use TENANT_API_KEY_RUNTIME_ONLY as the placeholder.", "Ask a developer or security reviewer if someone supplied a real API key."));
  }
}

function validateDomains(errors, domains) {
  if (!isPlainObject(domains)) {
    return;
  }

  requireDomain(errors, domains.primaryDomain, "domains.primaryDomain", "Enter only the root domain, such as exampleeventrentals.com. Do not include https://.");
  requireDomain(errors, domains.wwwDomain, "domains.wwwDomain", "Enter the www host, such as www.exampleeventrentals.com. Do not include https://.");
  if (typeof domains.wwwDomain === "string" && !domains.wwwDomain.startsWith("www.")) {
    errors.push(error(AnswerErrorCode.INVALID_DOMAIN, "domains.wwwDomain", "The www domain must start with www.", "Use www.exampleeventrentals.com for the www domain.", "Ask the domain owner to confirm the approved www host."));
  }
  requireDomain(errors, domains.mediaDomain, "domains.mediaDomain", "Enter the media host, such as media.exampleeventrentals.com. Do not include https://.");
  requireEnum(errors, domains.canonicalHost, "domains.canonicalHost", ["primary", "www"], "Choose primary or www.");

  if (domains.primaryDomain && domains.wwwDomain && domains.wwwDomain === domains.primaryDomain) {
    errors.push(error(AnswerErrorCode.INVALID_DOMAIN, "domains.wwwDomain", "The www domain must be separate from the root primary domain.", "Use www.exampleeventrentals.com for wwwDomain.", "Ask the domain owner if the www host is unknown."));
  }
}

function validateBuilderProfile(errors, builderProfile) {
  if (!isPlainObject(builderProfile)) {
    return;
  }

  requireValue(errors, builderProfile.deploymentProfile, "builderProfile.deploymentProfile");
  if (builderProfile.deploymentProfile && !allowedDeploymentProfiles.has(builderProfile.deploymentProfile)) {
    errors.push(error(AnswerErrorCode.UNKNOWN_DEPLOYMENT_PROFILE, "builderProfile.deploymentProfile", "The deployment profile is not in the approved local registry list.", "Choose one of the documented deployment profile IDs, such as static-azure-cloudflare-worker-graph.", "Ask a deployment engineer before inventing a new profile name."));
  }

  if (builderProfile.generatorMode && builderProfile.generatorMode !== "offline-local-only") {
    errors.push(error(AnswerErrorCode.INVALID_ENUM_VALUE, "builderProfile.generatorMode", "The builder can only run in offline-local-only mode.", "Set generatorMode to offline-local-only or remove the field.", "Ask a developer if a workflow asks for hosted or mutating generation."));
  }
}

function validateRouting(errors, routing) {
  if (!isPlainObject(routing)) {
    return;
  }

  requireValue(errors, routing.trailingSlashPolicy, "routing.trailingSlashPolicy");
  if (routing.trailingSlashPolicy && routing.trailingSlashPolicy !== "always") {
    errors.push(error(AnswerErrorCode.INVALID_TRAILING_SLASH_POLICY, "routing.trailingSlashPolicy", "The trailing slash policy is not supported.", "Use always. Generated non-root routes must end with a slash.", "Ask a developer if another route format is required."));
  }

  const approvedRoutes = routing.approvedRoutes;
  const forbiddenRoutes = routing.forbiddenRoutes ?? defaultForbiddenRoutes;
  if (!Array.isArray(approvedRoutes) || approvedRoutes.length === 0) {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, "routing.approvedRoutes", "At least one approved route is required.", "Add / and every route that should exist in the generated package.", "Ask the content owner to confirm the route list."));
  } else {
    validateRouteList(errors, approvedRoutes, "routing.approvedRoutes");
  }
  validateRouteList(errors, forbiddenRoutes, "routing.forbiddenRoutes");
  validateRouteOverlap(errors, approvedRoutes ?? [], forbiddenRoutes);
}

function validatePages(errors, answers) {
  const pages = answers?.pages;
  const approvedRoutes = answers?.routing?.approvedRoutes ?? [];
  if (!Array.isArray(pages) || pages.length === 0) {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, "pages", "At least one page answer is required.", "Add one page object for each approved route.", "Ask the content owner for the planned page list."));
    return;
  }

  const approved = new Set(approvedRoutes.map((route) => normalizeRoute(route)));
  const pageRoutes = new Set();
  const pageSlugs = new Set();
  const mediaIds = new Set((Array.isArray(answers?.media) ? answers.media : []).map((asset) => asset?.mediaId).filter(Boolean));
  const formIds = new Set(getAnswerForms(answers).map((form) => form?.formId).filter(Boolean));

  pages.forEach((page, index) => {
    const base = `pages[${index}]`;
    requireTextLength(errors, page?.title, `${base}.title`, 2, 120, "Enter a clear page title.");
    requireTextLength(errors, page?.seoDescription, `${base}.seoDescription`, 20, 240, "Write a short description of at least 20 characters.");
    requirePattern(errors, page?.slug ?? slugFromRoute(page?.route), `${base}.slug`, looseSlugPattern, "Use lowercase letters, numbers, and hyphens.");
    requireEnum(errors, page?.status ?? "draft", `${base}.status`, [...allowedPageStatuses], "Use draft until preview approval is recorded.");

    if (!page?.route || !routePattern.test(page.route)) {
      errors.push(error(AnswerErrorCode.INVALID_ROUTE, `${base}.route`, "The page route must start with / and use lowercase letters, numbers, and hyphens.", "Use / for home or a route like /contact/.", "Ask the content owner if you are unsure which URL this page should use."));
    }

    const normalized = normalizeRoute(page?.route);
    if (page?.route && !approved.has(normalized)) {
      errors.push(error(AnswerErrorCode.PAGE_ROUTE_NOT_APPROVED, `${base}.route`, "This page route is not in the approved route list.", `Add ${normalized} to routing.approvedRoutes or remove this page.`, "Ask the content owner before adding launch routes."));
    }

    if (page?.route) {
      if (pageRoutes.has(normalized)) {
        errors.push(error(AnswerErrorCode.DUPLICATE_ROUTE, `${base}.route`, `The route ${normalized} is used by more than one page.`, "Keep only one page per route.", "Ask the content owner which page should own this URL."));
      }
      pageRoutes.add(normalized);
    }

    const slug = page?.slug ?? slugFromRoute(page?.route);
    if (slug) {
      if (pageSlugs.has(slug)) {
        errors.push(error(AnswerErrorCode.DUPLICATE_PAGE_SLUG, `${base}.slug`, `The page slug ${slug} is used more than once.`, "Give each page a unique slug, such as contact or service-areas.", "Ask a developer if two routes appear to need the same page file."));
      }
      pageSlugs.add(slug);
    }

    if (page?.seoTitle) {
      requireTextLength(errors, page.seoTitle, `${base}.seoTitle`, 2, 120, "Use a short SEO title.");
    }

    for (const mediaRef of page?.mediaRefs ?? []) {
      if (!mediaIds.has(mediaRef)) {
        errors.push(error(AnswerErrorCode.UNKNOWN_MEDIA_REFERENCE, `${base}.mediaRefs`, `Page references unknown mediaId ${mediaRef}.`, "Add the media asset to media[] or remove the media reference from this page.", "Ask the media owner to confirm the asset list."));
      }
    }

    if (page?.formRef && !formIds.has(page.formRef)) {
      errors.push(error(AnswerErrorCode.UNKNOWN_FORM_REFERENCE, `${base}.formRef`, `Page references unknown formId ${page.formRef}.`, "Use one of the form IDs declared in form/forms.", "Ask the form owner which form this page should use."));
    }

    validatePageBlocks(errors, page, base, mediaIds, formIds);
  });

  for (const route of approved) {
    if (!pageRoutes.has(route)) {
      errors.push(error(AnswerErrorCode.APPROVED_ROUTE_MISSING_PAGE, "pages", `Approved route ${route} does not have a page answer.`, "Add a page answer for every approved route.", "Ask the content owner whether this route should launch."));
    }
  }
}

function validatePageBlocks(errors, page, base, mediaIds, formIds) {
  if (page?.blocks === undefined) {
    return;
  }

  if (!Array.isArray(page.blocks)) {
    errors.push(error(AnswerErrorCode.INVALID_ENUM_VALUE, `${base}.blocks`, "Page blocks must be an array.", "Use an array of block objects or remove blocks to let the builder create placeholders.", "Ask a developer if custom page blocks are needed."));
    return;
  }

  page.blocks.forEach((block, blockIndex) => {
    const blockPath = `${base}.blocks[${blockIndex}]`;
    requireValue(errors, block?.type, `${blockPath}.type`);
    if (block?.mediaId && !mediaIds.has(block.mediaId)) {
      errors.push(error(AnswerErrorCode.UNKNOWN_MEDIA_REFERENCE, `${blockPath}.mediaId`, `Block references unknown mediaId ${block.mediaId}.`, "Add the media asset to media[] or remove the block media reference.", "Ask the media owner to confirm the asset."));
    }
    if (block?.formId && !formIds.has(block.formId)) {
      errors.push(error(AnswerErrorCode.UNKNOWN_FORM_REFERENCE, `${blockPath}.formId`, `Block references unknown formId ${block.formId}.`, "Use a formId declared in form/forms.", "Ask the form owner which form should appear here."));
    }
  });
}

function validateMedia(errors, media, mediaDomain) {
  if (!Array.isArray(media)) {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, "media", "media must be an array, even when there are no media assets.", "Use an empty array or add media asset objects.", "Ask the media owner if assets are expected."));
    return;
  }

  const seen = new Set();
  media.forEach((asset, index) => {
    const base = `media[${index}]`;
    requirePattern(errors, asset?.mediaId, `${base}.mediaId`, /^[a-z0-9][a-z0-9-]{2,120}$/, "Use lowercase letters, numbers, and hyphens.");
    requireValue(errors, asset?.fileName, `${base}.fileName`);
    requireTextLength(errors, asset?.altText, `${base}.altText`, 2, 180, "Describe the image or asset for reviewers and accessibility.");
    requireEnum(errors, asset?.kind ?? "image", `${base}.kind`, [...allowedMediaKinds], "Use image, logo, icon, or document.");
    requireEnum(errors, asset?.sourceStatus ?? "placeholder", `${base}.sourceStatus`, [...allowedMediaSourceStatuses], "Use placeholder, pending-review, or usage-rights-confirmed.");

    if (asset?.mediaId) {
      if (seen.has(asset.mediaId)) {
        errors.push(error(AnswerErrorCode.DUPLICATE_MEDIA_ID, `${base}.mediaId`, `The media ID ${asset.mediaId} is used more than once.`, "Give each media asset a unique mediaId.", "Ask the media owner which asset should keep this ID."));
      }
      seen.add(asset.mediaId);
    }

    if (asset?.fileName && (!mediaFilePattern.test(asset.fileName) || asset.fileName.includes("..") || /[\\/]|\.env|local\.settings|appsettings\.development|secret/i.test(asset.fileName))) {
      errors.push(error(AnswerErrorCode.UNSAFE_MEDIA_FILE_NAME, `${base}.fileName`, "The media file name is not safe for an import package.", "Use only a base file name like hero-event-rink.webp. Do not include folders, .., or protected config names.", "Ask a media/operator reviewer if the file came from a private path."));
    }

    validatePublicUrl(errors, asset?.publicUrl, `${base}.publicUrl`, {
      requiredHost: mediaDomain,
      message: "The media URL must be an HTTPS URL on the approved media domain."
    });
  });
}

function validateForms(errors, answers) {
  if (answers?.form && answers?.forms) {
    errors.push(error(AnswerErrorCode.FORM_REQUIRED, "forms", "Use either form or forms, not both.", "Keep one form object or one forms array so form IDs stay predictable.", "Ask a developer if multiple forms are required."));
  }

  const forms = getAnswerForms(answers);
  if (forms.length === 0) {
    return;
  }

  const seen = new Set();
  forms.forEach((form, index) => {
    const base = Array.isArray(answers.forms) ? `forms[${index}]` : "form";
    requirePattern(errors, form?.formId, `${base}.formId`, idPattern, "Use lowercase letters, numbers, and hyphens, starting with a letter.");
    requireTextLength(errors, form?.displayName, `${base}.displayName`, 2, 120, "Enter a clear form name.");
    requireEnum(errors, form?.deliveryMode ?? "no-email", `${base}.deliveryMode`, [...allowedFormDeliveryModes], "Use no-email, graph, webhook, or profile-managed.");
    requireEmail(errors, form?.recipient, `${base}.recipient`);
    requirePattern(errors, form?.leadRecipientRef, `${base}.leadRecipientRef`, idPattern, "Use a non-secret lowercase reference such as example-event-leads.");
    if (form?.recipientGroup) {
      requirePattern(errors, form.recipientGroup, `${base}.recipientGroup`, idPattern, "Use the same safe reference style as leadRecipientRef.");
    }
    if (form?.leadRecipientRef && form?.recipientGroup && form.leadRecipientRef !== form.recipientGroup) {
      errors.push(error(AnswerErrorCode.FORM_RECIPIENT_REFERENCE_CONFLICT, `${base}.recipientGroup`, "leadRecipientRef and recipientGroup must match when both are provided.", "Use the same non-secret reference value for both fields or remove recipientGroup.", "Ask the form owner before changing lead recipient routing."));
    }
    if (form?.domainRoutingKey) {
      requirePattern(errors, form.domainRoutingKey, `${base}.domainRoutingKey`, idPattern, "Use a non-secret lowercase routing key.");
    }
    requireTextLength(errors, form?.mailboxOwner, `${base}.mailboxOwner`, 2, 120, "Enter the person or team responsible for this inbox.");
    requireEnum(errors, form?.consentNoticeStatus ?? "pending-review", `${base}.consentNoticeStatus`, [...allowedConsentStatuses], "Use approved, pending-review, or not-required-by-owner.");
    requireEnum(errors, form?.rollbackMode ?? "disable-form", `${base}.rollbackMode`, [...allowedRollbackModes], "Use disable-form, no-email, or profile-managed.");

    if (form?.formId) {
      if (seen.has(form.formId)) {
        errors.push(error(AnswerErrorCode.DUPLICATE_FORM_ID, `${base}.formId`, `The form ID ${form.formId} is used more than once.`, "Give each form a unique formId.", "Ask the form owner which form should keep this ID."));
      }
      seen.add(form.formId);
    }

    if (!Array.isArray(form?.fields) || form.fields.length === 0) {
      errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, `${base}.fields`, "At least one form field is required.", "Add fields such as name, email, eventDate, and message.", "Ask the form owner what information should be collected."));
    }

    if (form?.staticEndpointRef && !isAllowedEndpointRef(form.staticEndpointRef)) {
      errors.push(error(AnswerErrorCode.SECRET_LIKE_VALUE, `${base}.staticEndpointRef`, "Static endpoint references must be placeholders only.", "Use PROFILE_MANAGED_STATIC_ENDPOINT or PROFILE_MANAGED_ENDPOINT_RUNTIME_ONLY.", "Ask a developer if someone supplied a real endpoint or token."));
    }
  });
}

function validateSeo(errors, answers) {
  const seo = answers?.seo;
  if (!isPlainObject(seo)) {
    return;
  }

  requireEnum(errors, seo.defaultRobots, "seo.defaultRobots", [...allowedRobots], "Use noindex,nofollow until final indexing approval happens outside this builder.");
  if (seo.defaultRobots === "index,follow") {
    errors.push(error(AnswerErrorCode.INDEXING_NOT_ALLOWED, "seo.defaultRobots", "The builder must not make generated packages indexable by default.", "Use noindex,nofollow. Final indexing is a separate hard stop.", "Ask the SEO/indexing owner before changing crawl settings."));
  }
  requireEnum(errors, seo.sitemapPolicy, "seo.sitemapPolicy", [...allowedSitemapPolicies], "Use disabled-until-final-gate unless an operator explicitly approves approved-routes-only.");
  if (seo.indexingFinalGate !== true) {
    errors.push(error(AnswerErrorCode.INDEXING_NOT_ALLOWED, "seo.indexingFinalGate", "The final indexing gate must remain true.", "Set indexingFinalGate to true. This records that indexing is still blocked until final manual review.", "Ask the SEO/indexing owner if this is unclear."));
  }
  if (seo.canonicalBaseUrl) {
    const requiredHost = selectedCanonicalHost(answers);
    validatePublicUrl(errors, seo.canonicalBaseUrl, "seo.canonicalBaseUrl", {
      requiredHost,
      noPath: true,
      message: "The canonical base URL must be HTTPS and use the selected production canonical host."
    });
  }

  const generatedBase = canonicalBaseUrlFromAnswers(answers);
  if (seo.canonicalBaseUrl && generatedBase && trimTrailingSlash(seo.canonicalBaseUrl) !== generatedBase) {
    errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, "seo.canonicalBaseUrl", "The canonical base URL does not match the selected canonical host.", `Use ${generatedBase}.`, "Ask the SEO/domain owner to confirm whether primary or www should be canonical."));
  }
}

function validateAnalytics(errors, analyticsDecision) {
  if (!isPlainObject(analyticsDecision)) {
    return;
  }

  requireEnum(errors, analyticsDecision.status, "analyticsDecision.status", [...allowedAnalyticsStatuses], "Use deferred, omitted, requested, or not-selected.");
  if (analyticsDecision.status === "requested") {
    errors.push(error(AnswerErrorCode.INDEXING_NOT_ALLOWED, "analyticsDecision.status", "Analytics can be requested only as a decision record in this phase.", "Keep scripts, pixels, tracking IDs, and tokens out of answers. Record owner review only.", "Ask the analytics owner before adding any tracking implementation."));
  }
}

function validatePrivacy(errors, privacyReviewStatus) {
  if (!isPlainObject(privacyReviewStatus)) {
    return;
  }

  requireEnum(errors, privacyReviewStatus.status, "privacyReviewStatus.status", [...allowedPrivacyStatuses], "Use pending-review, approved, blocked, or not-required-by-owner.");
  requireTextLength(errors, privacyReviewStatus.owner, "privacyReviewStatus.owner", 2, 120, "Record the person or team responsible for privacy review.");
}

function validateOwnerContacts(errors, ownerContacts) {
  if (!isPlainObject(ownerContacts)) {
    return;
  }

  for (const ownerField of requiredOwnerContacts) {
    requireTextLength(errors, ownerContacts[ownerField], `ownerContacts.${ownerField}`, 2, 120, "Record the owner name or team for this responsibility.");
  }
}

function validateManualApprovals(errors, manualApprovals) {
  if (!isPlainObject(manualApprovals)) {
    return;
  }

  for (const approvalField of requiredManualApprovals) {
    requireEnum(errors, manualApprovals[approvalField], `manualApprovals.${approvalField}`, [...allowedApprovalStatuses], "Use pending, approved, blocked, not-required, or blocked-until-final-review.");
  }

  if (manualApprovals.indexingFinalGateApproval && manualApprovals.indexingFinalGateApproval !== "blocked-until-final-review") {
    errors.push(error(AnswerErrorCode.INDEXING_NOT_ALLOWED, "manualApprovals.indexingFinalGateApproval", "The final indexing gate must stay blocked in builder output.", "Use blocked-until-final-review. Search Console and indexing are separate final actions.", "Ask the indexing owner before any sitemap, URL Inspection, or indexing work."));
  }
}

function validatePausedTenantDryRunApproval(errors, answers) {
  const approval = answers?.pausedTenantDryRunApproval;
  if (approval === undefined) {
    return;
  }

  if (!isPlainObject(approval)) {
    errors.push(error(
      AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID,
      "pausedTenantDryRunApproval",
      "Paused tenant dry-run approval must be a structured object.",
      "Use the approved local-only Roller dry-run approval object.",
      "Ask an operator before allowing any paused tenant package generation."
    ));
    return;
  }

  requireApprovalValue(errors, approval.tenant, "pausedTenantDryRunApproval.tenant", approvedPausedTenantDryRun.tenant);
  requireApprovalValue(errors, approval.primaryDomain, "pausedTenantDryRunApproval.primaryDomain", approvedPausedTenantDryRun.primaryDomain);
  requireApprovalValue(errors, approval.approvedScope, "pausedTenantDryRunApproval.approvedScope", approvedPausedTenantDryRun.approvedScope);
  requireApprovalValue(errors, approval.externalMutationsAllowed, "pausedTenantDryRunApproval.externalMutationsAllowed", false);
  requireApprovalValue(errors, approval.livePagesApproved, "pausedTenantDryRunApproval.livePagesApproved", false);
  requireApprovalValue(errors, approval.livePagesHardStopped, "pausedTenantDryRunApproval.livePagesHardStopped", true);
  requireApprovalValue(errors, approval.searchConsoleApproved, "pausedTenantDryRunApproval.searchConsoleApproved", false);
  requireApprovalValue(errors, approval.searchConsoleIndexingHardStopped, "pausedTenantDryRunApproval.searchConsoleIndexingHardStopped", true);
  requireApprovalValue(errors, approval.approvedByOwner, "pausedTenantDryRunApproval.approvedByOwner", true);

  const mismatchChecks = [
    [answers?.tenant?.tenantId, "tenant.tenantId", approvedPausedTenantDryRun.tenant],
    [answers?.tenant?.siteKey, "tenant.siteKey", approvedPausedTenantDryRun.tenant],
    [answers?.tenant?.cmsTenantSlug, "tenant.cmsTenantSlug", approvedPausedTenantDryRun.tenant],
    [answers?.domains?.primaryDomain, "domains.primaryDomain", approvedPausedTenantDryRun.primaryDomain],
    [answers?.builderProfile?.generatorMode, "builderProfile.generatorMode", "offline-local-only"],
    [answers?.seo?.defaultRobots, "seo.defaultRobots", "noindex,nofollow"],
    [answers?.seo?.sitemapPolicy, "seo.sitemapPolicy", "disabled-until-final-gate"],
    [answers?.seo?.indexingFinalGate, "seo.indexingFinalGate", true],
    [answers?.manualApprovals?.indexingFinalGateApproval, "manualApprovals.indexingFinalGateApproval", "blocked-until-final-review"]
  ];

  for (const [actual, field, expected] of mismatchChecks) {
    if (actual !== expected) {
      errors.push(error(
        AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID,
        "pausedTenantDryRunApproval",
        `Paused tenant dry-run approval does not match ${field}.`,
        `Use ${field} = ${JSON.stringify(expected)} for this local-only Roller dry run.`,
        "Ask an operator before changing paused tenant approval metadata."
      ));
    }
  }
}

function requireApprovalValue(errors, actual, path, expected) {
  if (actual !== expected) {
    errors.push(error(
      AnswerErrorCode.PAUSED_TENANT_DRY_RUN_APPROVAL_INVALID,
      path,
      `${path} must be ${JSON.stringify(expected)} for the approved local-only Roller dry run.`,
      `Set ${path} to ${JSON.stringify(expected)} or remove the paused tenant reference.`,
      "Ask an operator before allowing any paused tenant package generation."
    ));
  }
}

function validateRouteList(errors, routes, path) {
  if (!Array.isArray(routes)) {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, path, `${path} must be an array.`, "Use an array such as [\"/\", \"/contact/\"].", "Ask the content owner for the approved routes."));
    return;
  }

  const seen = new Set();
  routes.forEach((route, index) => {
    const itemPath = `${path}[${index}]`;
    if (typeof route !== "string" || !routePattern.test(route)) {
      errors.push(error(AnswerErrorCode.INVALID_ROUTE, itemPath, "Route must start with / and contain lowercase letters, numbers, and hyphens.", "Use / for home or a route like /contact/.", "Ask the content owner to confirm the URL."));
      return;
    }
    const normalized = normalizeRoute(route);
    if (seen.has(normalized)) {
      errors.push(error(AnswerErrorCode.DUPLICATE_ROUTE, itemPath, `Duplicate route ${normalized}.`, "Remove duplicate routes after normalization.", "Ask the content owner which route should remain."));
    }
    seen.add(normalized);
  });
}

function validateRouteOverlap(errors, approvedRoutes, forbiddenRoutes) {
  const approved = new Set(approvedRoutes.map((route) => normalizeRoute(route)));
  for (const route of forbiddenRoutes.map((route) => normalizeRoute(route))) {
    if (approved.has(route)) {
      errors.push(error(AnswerErrorCode.ROUTE_OVERLAP, "routing", `Route ${route} cannot be both approved and forbidden.`, "Remove the route from one list.", "Ask the content owner whether this URL should launch."));
    }
  }

  for (const route of defaultForbiddenRoutes) {
    if (approved.has(route)) {
      errors.push(error(AnswerErrorCode.ROUTE_OVERLAP, "routing.approvedRoutes", `Route ${route} is reserved as a forbidden default.`, "Use a public launch route instead of draft, preview, or old routes.", "Ask an operator before launching a route that looks like draft or preview content."));
    }
  }
}

function requireValue(errors, value, path) {
  if (value === undefined || value === null || value === "") {
    errors.push(error(AnswerErrorCode.REQUIRED_FIELD_MISSING, path, `${path} is required.`, "Fill in this field from the intake answers.", "Ask the responsible owner if the value is unknown."));
  }
}

function requireTextLength(errors, value, path, min, max, suggestedFix) {
  requireValue(errors, value, path);
  if (isMissing(value)) {
    return;
  }
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    errors.push(error(AnswerErrorCode.INVALID_TEXT_LENGTH, path, `${path} must be between ${min} and ${max} characters.`, suggestedFix, "Ask the content or business owner for a clearer value."));
  }
}

function requirePattern(errors, value, path, pattern, suggestedFix) {
  requireValue(errors, value, path);
  if (isMissing(value)) {
    return;
  }
  if (typeof value === "string" && !pattern.test(value)) {
    errors.push(error(AnswerErrorCode.INVALID_ID_FORMAT, path, `${path} uses an unsupported format.`, suggestedFix, "Ask an operator or developer if the identifier needs to be changed."));
  }
}

function requireDomain(errors, value, path, suggestedFix) {
  requireValue(errors, value, path);
  if (isMissing(value)) {
    return;
  }
  if (typeof value !== "string") {
    return;
  }

  if (value.includes("://") || value.includes("/") || value.includes("@")) {
    errors.push(error(AnswerErrorCode.INVALID_DOMAIN, path, "This domain does not look valid. Enter only the domain name, not a full URL.", suggestedFix, "Ask the domain owner to provide the plain host name."));
    return;
  }

  if (!domainPattern.test(value) || value.includes("..")) {
    errors.push(error(AnswerErrorCode.INVALID_DOMAIN, path, "This domain does not look valid.", suggestedFix, "Ask the domain owner to confirm the exact approved host."));
  }

  if (stagingOrLocalPatterns.some((pattern) => pattern.test(value))) {
    errors.push(error(AnswerErrorCode.INVALID_DOMAIN, path, "Production domain fields cannot use localhost, staging, preview, or default-host names.", "Use the approved public production domain.", "Ask a deployment engineer if only a staging host is available."));
  }
}

function requireEmail(errors, value, path) {
  requireValue(errors, value, path);
  if (isMissing(value)) {
    return;
  }
  if (typeof value === "string" && !emailPattern.test(value)) {
    errors.push(error(AnswerErrorCode.INVALID_ID_FORMAT, path, `${path} must be an email address.`, "Use an approved lead inbox such as leads@exampleeventrentals.com.", "Ask the form owner which inbox should receive leads."));
  }
}

function requireEnum(errors, value, path, allowed, suggestedFix) {
  requireValue(errors, value, path);
  if (value !== undefined && value !== null && value !== "" && !allowed.includes(value)) {
    errors.push(error(AnswerErrorCode.INVALID_ENUM_VALUE, path, `${path} must be one of: ${allowed.join(", ")}.`, suggestedFix, "Ask the responsible owner which option is correct."));
  }
}

function validatePublicUrl(errors, value, path, options = {}) {
  requireValue(errors, value, path);
  if (isMissing(value)) {
    return;
  }
  if (typeof value !== "string") {
    return;
  }

  const parsed = parseUrl(value);
  if (!parsed || parsed.protocol !== "https:") {
    errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, path, options.message ?? "This must be an HTTPS production URL.", "Use an https:// URL on the approved public host.", "Ask an operator if only a local or staging URL is available."));
    return;
  }

  if (parsed.username || parsed.password) {
    errors.push(error(AnswerErrorCode.URL_CONTAINS_CREDENTIALS, path, "URLs must not contain usernames or passwords.", "Remove credentials from the URL and use runtime-only secret configuration if needed.", "Ask a security reviewer if credentials were shared."));
  }

  if (stagingOrLocalPatterns.some((pattern) => pattern.test(parsed.hostname))) {
    errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, path, "Production URL fields cannot use localhost, staging, preview, or default-host URLs.", "Use the approved public production URL.", "Ask a deployment engineer if the production host is not ready."));
  }

  const requiredHost = safePlainDomain(options.requiredHost);
  if (requiredHost && parsed.hostname.toLowerCase() !== requiredHost.toLowerCase()) {
    errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, path, `This URL must use ${requiredHost}.`, `Use https://${requiredHost}${options.noPath ? "" : "/..."}.`, "Ask the domain or media owner to confirm the approved host."));
  }

  if (options.noPath && (parsed.pathname !== "/" || parsed.search || parsed.hash)) {
    errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, path, "Canonical base URL must not include a path, query string, or hash.", "Use only the scheme and host, such as https://exampleeventrentals.com.", "Ask the SEO owner if a page-specific canonical URL is needed."));
  }
}

function scanForUnsafeStrings(errors, value, pointer = "$", options = {}) {
  if (typeof value === "string") {
    if (!options.pausedTenantDryRunApproved && pausedTenantPatterns.some((pattern) => pattern.test(value))) {
      errors.push(error(AnswerErrorCode.PAUSED_TENANT_REFERENCE, pointer, "Paused tenant references are not allowed in builder answers.", "Remove the paused tenant name or domain from this package.", "Ask an operator if this package appears to mix tenants."));
    }
    if (unrelatedTenantPatterns.some((pattern) => pattern.test(value))) {
      errors.push(error(AnswerErrorCode.UNRELATED_TENANT_REFERENCE, pointer, "This looks like a reference to a different tenant.", "Replace it with the current example tenant value or remove it.", "Ask an operator if content was copied from another tenant."));
    }
    if (secretLikePatterns.some((pattern) => pattern.test(value))) {
      errors.push(error(AnswerErrorCode.SECRET_LIKE_VALUE, pointer, "Secret-like value detected. Remove it before generation.", "Use placeholders only. Do not include passwords, tokens, keys, private URLs, or signed URLs.", "Ask a security reviewer if this may be a real secret."));
    }
    if (/^[A-Za-z]:[\\/]|^\\\\|file:\/\//.test(value)) {
      errors.push(error(AnswerErrorCode.LOCAL_PATH_VALUE, pointer, "Local filesystem paths are not allowed in answers.", "Use a safe file name or public placeholder URL instead of a local path.", "Ask an operator if media still lives on a local machine."));
    }
    const parsed = parseUrl(value);
    if (parsed?.username || parsed?.password) {
      errors.push(error(AnswerErrorCode.URL_CONTAINS_CREDENTIALS, pointer, "URLs with embedded credentials are not allowed.", "Remove the username and password from the URL.", "Ask a security reviewer if a credentialed URL was provided."));
    }
    if (parsed && stagingOrLocalPatterns.some((pattern) => pattern.test(parsed.hostname))) {
      errors.push(error(AnswerErrorCode.INVALID_PRODUCTION_URL, pointer, "Local, staging, preview, or default-host URLs are not allowed in answers.", "Use approved production domains for production fields and plain staging host metadata only where documented.", "Ask a deployment engineer if production URLs are not available."));
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForUnsafeStrings(errors, item, `${pointer}[${index}]`, options));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      scanForUnsafeStrings(errors, child, `${pointer}.${key}`, options);
    }
  }
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function selectedCanonicalHost(answers) {
  const host = answers?.domains?.canonicalHost === "www" ? answers?.domains?.wwwDomain : answers?.domains?.primaryDomain;
  return safePlainDomain(host);
}

function safePlainDomain(value) {
  if (typeof value !== "string" || isMissing(value)) {
    return null;
  }
  if (value.includes("://") || value.includes("/") || value.includes("@") || value.includes("..")) {
    return null;
  }
  if (!domainPattern.test(value)) {
    return null;
  }
  if (stagingOrLocalPatterns.some((pattern) => pattern.test(value))) {
    return null;
  }
  return value;
}

function isAllowedEndpointRef(value) {
  return value === "PROFILE_MANAGED_STATIC_ENDPOINT"
    || value === "PROFILE_MANAGED_ENDPOINT_RUNTIME_ONLY"
    || (typeof value === "string" && /^profile:[a-z][a-z0-9-]{2,80}$/.test(value));
}

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function error(code, path, message, suggestedFix, askForHelp) {
  return {
    code,
    path,
    message,
    suggestedFix,
    askForHelp,
    severity: "error"
  };
}
