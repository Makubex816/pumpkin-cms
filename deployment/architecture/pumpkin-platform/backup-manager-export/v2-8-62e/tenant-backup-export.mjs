#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "../../../../..");
const PHASE = "V2.8.62E";
const TOOL_VERSION = "v2-8-62e";
const TENANT_ID = "strip-club-near-me-vegas";
const TENANT_NAME = "Strip Club Near Me Vegas";
const STORAGE_ACCOUNT = "iceskatingmedia";
const MEDIA_CONTAINER = "strip-club-near-me-vegas-media";
const MEDIA_PREFIX = "media/assets/";
const EXPECTED_MEDIA_COUNT = 302;
const EXPECTED_MEDIA_BYTES = 28_343_976;
const OUTPUT_ROOT = path.resolve("C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/tenant-backups");
const OUTPUT_DIR = path.join(OUTPUT_ROOT, "v2-8-62e-strip-club-near-me-vegas-full-backup");
const AUTH_HANDOFF = path.join(REPO_ROOT, ".tmp/v2-8-61od/secure/party-pros-controlled-creation.json");
const MASTER_REGISTER = path.resolve("C:/Users/User/Desktop/PumpkinCMS/secure-operator-handoff/PUMPKIN_TENANT_SECRET_REGISTER.json");
const DRU_MANIFEST = path.join(
  REPO_ROOT,
  "deployment/architecture/tenant-website-publish-readiness/v2-8-62dru-strip-club-near-me-vegas-redirect-reconciliation-result/result-manifest.json",
);
const EXPECTED_REGISTER_SHA256 = "2C50936F2D0D1193C3875B91163FB9500E09A8374E99DBF06FD1984EC7FAFC61";
const EXECUTE = process.argv.includes("--execute");
const PREFLIGHT = process.argv.includes("--preflight");
const requestLog = [];

const EXPECTED = Object.freeze({
  pages: 43,
  uniquePageIds: 43,
  uniquePageSlugs: 43,
  contactPages: 1,
  themes: 1,
  tenantAdmins: 1,
  pageOwnedRedirects: 1,
  genericRedirects: 2,
  semanticRedirects: 3,
  clubRecords: 10,
  articleRecords: 19,
  mediaAssets: 302,
  mediaAliases: 473,
  formDefinitions: 32,
  formMappings: 65,
  formEntries: 0,
  domainBindings: 1,
  importRuns: 1,
  publishRuns: 1,
  acceptedDeviations: 2,
  physicalAirstripLinks: 39,
  effectiveAirstripLinks: 45,
});

class UnsafeBackupError extends Error {}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(filePath) {
  return JSON.parse((await fsp.readFile(filePath, "utf8")).replace(/^\uFEFF/, ""));
}

async function writeJson(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, json(value), "utf8");
}

async function writeText(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function assertApprovedOutput() {
  const relative = path.relative(OUTPUT_ROOT, OUTPUT_DIR);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative === "") {
    throw new Error("Backup output escaped the approved backup root.");
  }
  if (path.basename(OUTPUT_DIR) !== "v2-8-62e-strip-club-near-me-vegas-full-backup") {
    throw new Error("Backup output folder does not match the approved V2.8.62E target.");
  }
}

async function assertOutputAbsentOrEmpty() {
  try {
    const entries = await fsp.readdir(OUTPUT_DIR);
    if (entries.length > 0) throw new Error("Approved backup output folder is not empty.");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function value(record, ...keys) {
  if (!record || typeof record !== "object") return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
    const pascal = `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
    if (Object.prototype.hasOwnProperty.call(record, pascal)) return record[pascal];
  }
  return undefined;
}

function array(record, ...keys) {
  if (Array.isArray(record)) return record;
  for (const key of keys) {
    const candidate = value(record, key);
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function normalizeString(input) {
  return typeof input === "string" ? input.trim() : "";
}

function blockedSecretKey(key) {
  const normalized = String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (normalized === "apikeymeta") return false;
  return [
    "password",
    "passwordhash",
    "apikey",
    "apikeyhash",
    "token",
    "accesstoken",
    "refreshtoken",
    "cookie",
    "cookies",
    "authorization",
    "connectionstring",
    "jwt",
    "secret",
    "clientsecret",
    "storagekey",
    "accountkey",
    "sas",
    "signature",
  ].includes(normalized);
}

function sanitize(valueToSanitize) {
  if (Array.isArray(valueToSanitize)) return valueToSanitize.map(sanitize);
  if (!valueToSanitize || typeof valueToSanitize !== "object") return valueToSanitize;
  const output = {};
  for (const [key, child] of Object.entries(valueToSanitize)) {
    if (blockedSecretKey(key)) continue;
    output[key] = sanitize(child);
  }
  return output;
}

function sanitizeUsers(users) {
  return users.map((user) => ({
    id: value(user, "id"),
    userId: value(user, "userId"),
    tenantId: value(user, "tenantId"),
    email: value(user, "email"),
    displayName: value(user, "displayName"),
    role: value(user, "role"),
    status: value(user, "status"),
    createdAt: value(user, "createdAt"),
    updatedAt: value(user, "updatedAt"),
    lastLogin: value(user, "lastLogin"),
  }));
}

function stable(valueToSerialize) {
  if (Array.isArray(valueToSerialize)) return `[${valueToSerialize.map(stable).join(",")}]`;
  if (valueToSerialize && typeof valueToSerialize === "object") {
    return `{${Object.keys(valueToSerialize).sort().map((key) => `${JSON.stringify(key)}:${stable(valueToSerialize[key])}`).join(",")}}`;
  }
  return JSON.stringify(valueToSerialize);
}

function sha256Text(input) {
  return crypto.createHash("sha256").update(input).digest("hex").toUpperCase();
}

async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex").toUpperCase()));
  });
}

async function fetchJson(apiBase, method, route, token, body) {
  const pathname = route.split("?")[0];
  if (method !== "GET" && !(method === "POST" && pathname === "/api/auth/login")) {
    throw new Error(`Backup HTTP boundary blocked ${method} ${pathname}.`);
  }
  if (/airstriplasvegas\.com/i.test(route)) throw new Error("Airstrip request boundary blocked.");
  requestLog.push(`${method} ${pathname}`);
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${apiBase.replace(/\/$/, "")}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Backup read route ${pathname} returned HTTP ${response.status}.`);
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
}

function runAz(args, { jsonOutput = false, timeout = 120_000 } = {}) {
  if (!args.includes("--auth-mode") || args[args.indexOf("--auth-mode") + 1] !== "login") {
    throw new Error("Azure storage command requires --auth-mode login.");
  }
  if (args.some((arg) => /account-key|connection-string|sas-token|list-keys/i.test(arg))) {
    throw new Error("Prohibited Azure storage credential argument blocked.");
  }
  const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "az";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "az.cmd", ...args] : args;
  const run = spawnSync(command, commandArgs, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
    timeout,
  });
  if (run.error || run.status !== 0) throw new Error(`Azure RBAC command failed for ${args.slice(0, 3).join(" ")}.`);
  return jsonOutput ? JSON.parse(run.stdout.replace(/^\uFEFF/, "") || "null") : run.stdout;
}

function safeBlobName(name) {
  return (
    typeof name === "string" &&
    name.startsWith(MEDIA_PREFIX) &&
    !name.includes("\\") &&
    !name.split("/").includes("..") &&
    !path.isAbsolute(name) &&
    !/[\u0000-\u001F\u007F]/.test(name)
  );
}

function parseAssetBlob(asset) {
  const urlText = normalizeString(value(asset, "publicUrl", "url"));
  const parsed = new URL(urlText);
  if (parsed.protocol !== "https:" || parsed.search || parsed.hostname !== `${STORAGE_ACCOUNT}.blob.core.windows.net`) {
    throw new Error("MediaAsset URL is outside the approved HTTPS storage boundary.");
  }
  const segments = parsed.pathname.replace(/^\/+/, "").split("/");
  const container = decodeURIComponent(segments.shift() || "");
  const blobName = segments.map(decodeURIComponent).join("/");
  if (container !== MEDIA_CONTAINER || !safeBlobName(blobName)) {
    throw new Error("MediaAsset URL is outside the approved tenant container/prefix.");
  }
  return blobName;
}

function blogContent(page) {
  return value(page, "ContentData")?.ContentBlocks?.find((block) => block?.type === "Blog")?.content || {};
}

function pageTitle(page) {
  return normalizeString(value(page, "MetaData")?.title || value(page, "metadata")?.title);
}

function pageH1(page) {
  const body = String(blogContent(page).body || "");
  const match = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function collectPageRevisions(pages) {
  return pages.map((page) => ({
    pageId: value(page, "PageId", "pageId", "id"),
    pageSlug: value(page, "pageSlug"),
    revisions: sanitize(array(page, "revisions")),
    currentRevision: sanitize(value(page, "revision") || null),
  }));
}

function recursiveKeys(valueToCheck, parent = "") {
  const findings = [];
  if (Array.isArray(valueToCheck)) {
    valueToCheck.forEach((item, index) => findings.push(...recursiveKeys(item, `${parent}[${index}]`)));
  } else if (valueToCheck && typeof valueToCheck === "object") {
    for (const [key, child] of Object.entries(valueToCheck)) {
      const location = parent ? `${parent}.${key}` : key;
      if (blockedSecretKey(key)) findings.push(location);
      findings.push(...recursiveKeys(child, location));
    }
  }
  return findings;
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await fsp.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function createChecksums() {
  const excluded = new Set([
    "checksums.sha256",
    "validation/backup-validation-report.json",
    "backup-completion.json",
  ]);
  const files = (await listFiles(OUTPUT_DIR))
    .map((filePath) => ({ filePath, relative: normalizePath(path.relative(OUTPUT_DIR, filePath)) }))
    .filter((entry) => !excluded.has(entry.relative))
    .sort((left, right) => left.relative.localeCompare(right.relative));
  const entries = [];
  for (const file of files) {
    entries.push({ path: file.relative, sha256: await sha256File(file.filePath), bytes: (await fsp.stat(file.filePath)).size });
  }
  await writeText(path.join(OUTPUT_DIR, "checksums.sha256"), entries.map((entry) => `${entry.sha256}  ${entry.path}`).join("\n"));
  return entries;
}

async function validateChecksums(entries) {
  const failures = [];
  for (const entry of entries) {
    const filePath = path.join(OUTPUT_DIR, ...entry.path.split("/"));
    const actual = await sha256File(filePath);
    if (actual !== entry.sha256) failures.push(entry.path);
  }
  return { checked: entries.length, passed: entries.length - failures.length, failures, ok: failures.length === 0 };
}

async function secretScan(actualSecrets) {
  const files = await listFiles(OUTPUT_DIR);
  const textFiles = files.filter((filePath) => !normalizePath(path.relative(OUTPUT_DIR, filePath)).startsWith("media/blobs/"));
  const findings = [];
  for (const filePath of textFiles) {
    const relative = normalizePath(path.relative(OUTPUT_DIR, filePath));
    const content = await fsp.readFile(filePath, "utf8");
    for (const secret of actualSecrets) {
      if (secret && content.includes(secret)) findings.push(`${relative}:literal-secret`);
    }
    if (/Bearer\s+[A-Za-z0-9._~-]{20,}/i.test(content)) findings.push(`${relative}:bearer-token`);
    if (/AccountKey=|SharedAccessSignature=|[?&](?:sig|se|sp|sv)=/i.test(content)) findings.push(`${relative}:storage-credential-pattern`);
    if (filePath.toLowerCase().endsWith(".json")) {
      const parsed = JSON.parse(content.replace(/^\uFEFF/, ""));
      for (const keyPath of recursiveKeys(parsed)) findings.push(`${relative}:blocked-key:${keyPath}`);
    }
  }
  return { filesChecked: textFiles.length, findings, ok: findings.length === 0 };
}

async function databaseFileMetadata(databaseFiles) {
  const metadata = [];
  for (const [name, details] of Object.entries(databaseFiles)) {
    const filePath = path.join(OUTPUT_DIR, "database", name);
    JSON.parse(await fsp.readFile(filePath, "utf8"));
    metadata.push({
      path: `database/${name}`,
      count: details.count,
      sha256: await sha256File(filePath),
      bytes: (await fsp.stat(filePath)).size,
      contentDigest: sha256Text(stable(details.value)),
    });
  }
  return metadata;
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  assertApprovedOutput();
  await assertOutputAbsentOrEmpty();

  requireCondition(fs.existsSync(AUTH_HANDOFF), "Approved SuperAdmin handoff is missing.");
  requireCondition(fs.existsSync(MASTER_REGISTER), "Metadata-only credential register is missing.");
  requireCondition(fs.existsSync(DRU_MANIFEST), "Committed DRU manifest is missing.");

  const [auth, register, dru] = await Promise.all([readJson(AUTH_HANDOFF), readJson(MASTER_REGISTER), readJson(DRU_MANIFEST)]);
  requireCondition(dru.status === "complete_drt_source_committed_corrected_api_deployed_vegas_redirects_reconciled_import_closed", "DRU manifest is not complete.");
  requireCondition(dru.finalTenantState?.packageFidelityStatus === "passed_with_explicit_owner_accepted_deviations", "DRU fidelity status is not passed.");
  requireCondition(await sha256File(MASTER_REGISTER) === EXPECTED_REGISTER_SHA256, "Metadata-only register hash drifted.");

  const credentialRows = array(register, "credentials").filter((entry) => entry?.tenantId === TENANT_ID && entry?.active === true);
  requireCondition(credentialRows.length === 1, "Expected exactly one active Vegas credential metadata row.");
  const credential = credentialRows[0];
  const credentialJsonPath = normalizeString(credential.activeCredentialJsonPath);
  const credentialTextPath = normalizeString(credential.activeCredentialTextPath);
  requireCondition(credentialJsonPath && credentialTextPath, "Credential metadata paths are incomplete.");
  requireCondition(fs.existsSync(credentialJsonPath) && fs.existsSync(credentialTextPath), "Credential hardcopy metadata target is missing.");
  requireCondition(await sha256File(credentialJsonPath) === normalizeString(credential.activeCredentialJsonSha256).toUpperCase(), "Credential JSON hash drifted.");
  requireCondition(await sha256File(credentialTextPath) === normalizeString(credential.activeCredentialTextSha256).toUpperCase(), "Credential text hash drifted.");

  for (const secureFile of dru.ownerApprovedRuntimeKey?.secureHandoffFiles || []) {
    requireCondition(fs.existsSync(secureFile.path), "Runtime-key metadata target is missing.");
    requireCondition(await sha256File(secureFile.path) === normalizeString(secureFile.sha256).toUpperCase(), "Runtime-key hardcopy hash drifted.");
  }

  const apiBase = normalizeString(auth.pumpkinApiBaseUrl).replace(/\/$/, "");
  const loginEndpoint = normalizeString(auth.adminLoginEndpoint);
  const email = normalizeString(auth.superAdminEmail);
  const password = normalizeString(auth.superAdminPassword);
  requireCondition(apiBase && loginEndpoint === "/api/auth/login" && email && password, "Approved SuperAdmin handoff is incomplete.");

  if (PREFLIGHT && !EXECUTE) {
    console.log(json({
      status: "passed_preflight",
      phase: PHASE,
      tenantId: TENANT_ID,
      outputAbsentOrEmpty: true,
      committedDru: true,
      credentialMetadataVerified: true,
      runtimeKeyMetadataVerified: true,
      secretValuesPrinted: false,
    }));
    return;
  }
  requireCondition(EXECUTE, "Use --preflight or --execute.");

  const login = await fetchJson(apiBase, "POST", loginEndpoint, "", { email, password });
  const token = normalizeString(value(login, "token"));
  requireCondition(token && value(login, "user")?.role === "SuperAdmin", "SuperAdmin login verification failed.");
  const verified = await fetchJson(apiBase, "GET", "/api/auth/verify", token);
  requireCondition(value(verified, "role") === "SuperAdmin", "SuperAdmin verify route did not confirm role.");

  const routes = {
    tenant: `/api/admin/tenants/${TENANT_ID}`,
    pages: `/api/admin/pages?tenantId=${TENANT_ID}`,
    themes: `/api/admin/themes/${TENANT_ID}`,
    mediaAssets: `/api/admin/${TENANT_ID}/media-assets`,
    formDefinitions: `/api/admin/forms/${TENANT_ID}/definitions`,
    formEntries: `/api/admin/${TENANT_ID}/form-entries`,
    users: `/api/admin/users?tenantId=${TENANT_ID}`,
    tenantRedirects: `/api/admin/tenants/${TENANT_ID}/redirects?includeInactive=true`,
    domainBindings: `/api/admin/tenants/${TENANT_ID}/domain-bindings`,
    importRuns: `/api/admin/${TENANT_ID}/import-runs`,
    publishRuns: `/api/admin/${TENANT_ID}/publish-runs`,
  };
  const liveEntries = await Promise.all(Object.entries(routes).map(async ([name, route]) => [name, await fetchJson(apiBase, "GET", route, token)]));
  const live = Object.fromEntries(liveEntries);
  const tenant = live.tenant;
  const pages = array(live.pages, "pages");
  const themes = array(live.themes, "themes");
  const mediaAssets = array(live.mediaAssets, "mediaAssets");
  const formDefinitions = array(live.formDefinitions, "formDefinitions", "definitions");
  const formEntries = array(live.formEntries, "formEntries");
  const users = array(live.users, "users");
  const tenantRedirects = array(live.tenantRedirects, "redirects", "tenantRedirects");
  const domainBindings = array(live.domainBindings, "domainBindings");
  const importRuns = array(live.importRuns, "importRuns");
  const publishRuns = array(live.publishRuns, "publishRuns");
  const theme = themes[0] || {};
  const designSystem = value(theme, "designSystem") || {};
  const pageOwnedRedirects = pages.flatMap((page) => array(page, "redirects").map((redirect) => ({
    pageId: value(page, "PageId", "pageId", "id"),
    pageSlug: value(page, "pageSlug"),
    ...sanitize(redirect),
  })));
  const clubRecords = array(designSystem, "catalogRecords");
  const articleRecords = array(designSystem, "blogArticleRecords");
  const mediaAliases = mediaAssets.flatMap((asset) => array(asset, "usageReferences")
    .filter((reference) => reference?.blockType === "source-path-alias")
    .map((reference) => ({ mediaAssetId: value(asset, "id", "mediaAssetId"), ...sanitize(reference) })));
  const formMappings = formDefinitions.flatMap((definition) => array(value(definition, "validationRules") || {}, "instanceMappings")
    .map((mapping) => ({ formDefinitionId: value(definition, "id", "formDefinitionId"), ...sanitize(mapping) })));
  const pageRevisions = collectPageRevisions(pages);
  const pageIdentities = pages.map((page) => ({
    id: value(page, "id"),
    pageId: value(page, "PageId", "pageId"),
    pageSlug: value(page, "pageSlug"),
    sourceRoute: blogContent(page).sourceRoute,
    title: pageTitle(page),
    h1: pageH1(page),
    published: value(page, "isPublished") === true,
    includeInSitemap: value(page, "includeInSitemap") === true,
    robots: value(page, "seo")?.robots,
  }));
  const acceptedDeviations = array(designSystem, "acceptedDeviations");
  const validation = value(designSystem, "validation") || {};
  const runtimeHold = value(designSystem, "runtimeHold") || {};
  const complianceLaunchHolds = {
    tenantId: TENANT_ID,
    packageFidelityStatus: validation.fidelityGate,
    acceptedDeviations: sanitize(acceptedDeviations),
    runtimeHold: sanitize(runtimeHold),
    pageHoldSummary: {
      unpublished: pages.filter((page) => value(page, "isPublished") !== true).length,
      excludedFromSitemap: pages.filter((page) => value(page, "includeInSitemap") !== true).length,
      noindexNofollow: pages.filter((page) => value(page, "seo")?.robots === "noindex, nofollow").length,
      publishApprovalHeld: pages.filter((page) => value(page, "workflow")?.approvedForPublish === false).length,
      notDeployed: pages.filter((page) => value(page, "staticPublishing")?.deploymentStatus === "not_deployed").length,
    },
    formHoldSummary: {
      definitions: formDefinitions.length,
      previewNoPost: formDefinitions.filter((definition) => value(definition, "submitAction") === "preview-no-post").length,
      submissionNotApproved: formDefinitions.filter((definition) => value(definition, "validationRules")?.submissionApproved === false).length,
      formEntryCreationNotApproved: formDefinitions.filter((definition) => value(definition, "validationRules")?.formEntryCreationApproved === false).length,
    },
  };

  const liveChecks = {
    tenant: value(tenant, "tenantId") === TENANT_ID && value(tenant, "status") === "active",
    tenantAdmin: users.length === EXPECTED.tenantAdmins && users[0]?.tenantId === TENANT_ID && users[0]?.role === "TenantAdmin",
    pages: pages.length === EXPECTED.pages,
    uniquePageIds: new Set(pages.map((page) => value(page, "PageId", "pageId"))).size === EXPECTED.uniquePageIds,
    uniquePageSlugs: new Set(pages.map((page) => value(page, "pageSlug"))).size === EXPECTED.uniquePageSlugs,
    contactPage: pages.filter((page) => value(page, "pageSlug") === "contact").length === EXPECTED.contactPages,
    allPageTitlesAndH1: pageIdentities.every((page) => page.title && page.h1),
    pagesHeld: complianceLaunchHolds.pageHoldSummary.unpublished === EXPECTED.pages && complianceLaunchHolds.pageHoldSummary.excludedFromSitemap === EXPECTED.pages && complianceLaunchHolds.pageHoldSummary.noindexNofollow === EXPECTED.pages && complianceLaunchHolds.pageHoldSummary.publishApprovalHeld === EXPECTED.pages && complianceLaunchHolds.pageHoldSummary.notDeployed === EXPECTED.pages,
    themes: themes.length === EXPECTED.themes,
    pageOwnedRedirects: pageOwnedRedirects.length === EXPECTED.pageOwnedRedirects,
    genericRedirects: tenantRedirects.length === EXPECTED.genericRedirects && tenantRedirects.every((redirect) => redirect?.tenantId === TENANT_ID && redirect?.active === true),
    semanticRedirects: pageOwnedRedirects.length + tenantRedirects.length === EXPECTED.semanticRedirects,
    clubRecords: clubRecords.length === EXPECTED.clubRecords,
    articleRecords: articleRecords.length === EXPECTED.articleRecords,
    mediaAssets: mediaAssets.length === EXPECTED.mediaAssets,
    mediaAliases: mediaAliases.length === EXPECTED.mediaAliases && array(designSystem, "mediaAliasResolver").length === EXPECTED.mediaAliases,
    forms: formDefinitions.length === EXPECTED.formDefinitions,
    formMappings: formMappings.length === EXPECTED.formMappings,
    formsHeld: complianceLaunchHolds.formHoldSummary.previewNoPost === EXPECTED.formDefinitions && complianceLaunchHolds.formHoldSummary.submissionNotApproved === EXPECTED.formDefinitions && complianceLaunchHolds.formHoldSummary.formEntryCreationNotApproved === EXPECTED.formDefinitions,
    formEntries: formEntries.length === EXPECTED.formEntries,
    domains: domainBindings.length === EXPECTED.domainBindings && domainBindings[0]?.status === "pending_manual_launch_held" && array(domainBindings[0], "dnsRecords").length === 0,
    importRuns: importRuns.length === EXPECTED.importRuns && importRuns[0]?.deploymentTriggered === false,
    publishRuns: publishRuns.length === EXPECTED.publishRuns && publishRuns[0]?.deploymentStatus === "not_deployed" && publishRuns[0]?.readyForManualUpload === false,
    acceptedDeviations: acceptedDeviations.length === EXPECTED.acceptedDeviations,
    fidelity: validation.fidelityGate === "passed_with_explicit_owner_accepted_deviations",
    airstripStaticCounts: validation.physicalAirstripLinks === EXPECTED.physicalAirstripLinks && validation.effectiveAirstripLinks === EXPECTED.effectiveAirstripLinks,
    runtimeKeyMetadataOnly: value(tenant, "apiKeyMeta")?.isActive === true,
  };
  requireCondition(Object.values(liveChecks).every(Boolean), `Live tenant backup gate failed: ${Object.entries(liveChecks).filter(([, ok]) => !ok).map(([name]) => name).join(", ")}.`);

  const blobList = runAz([
    "storage", "blob", "list",
    "--account-name", STORAGE_ACCOUNT,
    "--container-name", MEDIA_CONTAINER,
    "--auth-mode", "login",
    "--query", "[].{name:name,bytes:properties.contentLength,contentType:properties.contentSettings.contentType,etag:properties.etag,lastModified:properties.lastModified}",
    "--output", "json",
    "--only-show-errors",
  ], { jsonOutput: true, timeout: 180_000 });
  requireCondition(Array.isArray(blobList), "RBAC blob list did not return an array.");
  const blobNames = blobList.map((blob) => blob.name);
  const blobBytes = blobList.reduce((sum, blob) => sum + Number(blob.bytes || 0), 0);
  requireCondition(blobList.length === EXPECTED_MEDIA_COUNT, "Media blob count drifted.");
  requireCondition(blobBytes === EXPECTED_MEDIA_BYTES, "Media blob byte total drifted.");
  requireCondition(new Set(blobNames).size === EXPECTED_MEDIA_COUNT, "Media blob names are not unique.");
  requireCondition(blobList.every((blob) => safeBlobName(blob.name) && Number(blob.bytes) > 0), "Media blob path or zero-byte gate failed.");

  const assetBlobNames = mediaAssets.map(parseAssetBlob);
  requireCondition(new Set(assetBlobNames).size === EXPECTED_MEDIA_COUNT, "MediaAsset canonical blob paths are not unique.");
  requireCondition(assetBlobNames.every((name) => blobNames.includes(name)) && blobNames.every((name) => assetBlobNames.includes(name)), "MediaAsset/blob path reconciliation failed.");

  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  const databaseDir = path.join(OUTPUT_DIR, "database");
  const databaseValues = {
    "tenant.json": { value: sanitize(tenant), count: 1 },
    "users-sanitized.json": { value: sanitizeUsers(users), count: users.length },
    "themes.json": { value: sanitize(themes), count: themes.length },
    "pages.json": { value: sanitize(pages), count: pages.length },
    "page-identities.json": { value: pageIdentities, count: pageIdentities.length },
    "page-revisions.json": { value: pageRevisions, count: pageRevisions.reduce((sum, page) => sum + page.revisions.length, 0) },
    "page-owned-redirects.json": { value: pageOwnedRedirects, count: pageOwnedRedirects.length },
    "tenant-redirects.json": { value: sanitize(tenantRedirects), count: tenantRedirects.length },
    "catalog-records.json": { value: sanitize(clubRecords), count: clubRecords.length },
    "guide-article-records.json": { value: sanitize(articleRecords), count: articleRecords.length },
    "media-assets.json": { value: sanitize(mediaAssets), count: mediaAssets.length },
    "source-path-aliases.json": { value: mediaAliases, count: mediaAliases.length },
    "form-definitions.json": { value: sanitize(formDefinitions), count: formDefinitions.length },
    "form-instance-mappings.json": { value: formMappings, count: formMappings.length },
    "form-entries.json": { value: sanitize(formEntries), count: formEntries.length },
    "domain-bindings.json": { value: sanitize(domainBindings), count: domainBindings.length },
    "import-runs.json": { value: sanitize(importRuns), count: importRuns.length },
    "publish-runs.json": { value: sanitize(publishRuns), count: publishRuns.length },
    "compliance-launch-holds.json": { value: complianceLaunchHolds, count: 1 },
    "runtime-key-status.json": { value: { tenantId: TENANT_ID, provisioned: value(tenant, "apiKeyMeta")?.isActive === true, createdAt: value(tenant, "apiKeyMeta")?.createdAt, dormant: true, plaintextIncluded: false, starterActivationIncluded: false }, count: 1 },
  };
  for (const [name, details] of Object.entries(databaseValues)) await writeJson(path.join(databaseDir, name), details.value);
  const databaseMetadata = await databaseFileMetadata(databaseValues);
  await writeJson(path.join(databaseDir, "database-content-digests.json"), { tenantId: TENANT_ID, files: databaseMetadata });

  await writeJson(path.join(OUTPUT_DIR, "metadata", "credential-metadata.json"), {
    tenantId: TENANT_ID,
    tenantAdmin: {
      email: credential.activeTenantAdminEmail,
      role: credential.role,
      status: credential.status,
      active: credential.active,
      futureCompanyIdentityTransferRequired: credential.futureCompanyIdentityTransferRequired,
      credentialRotationRequiredOnTransfer: credential.credentialRotationRequiredOnTransfer,
      hardcopies: [
        { path: credentialJsonPath, sha256: credential.activeCredentialJsonSha256 },
        { path: credentialTextPath, sha256: credential.activeCredentialTextSha256 },
      ],
    },
    runtimeKey: {
      provisioned: dru.ownerApprovedRuntimeKey.active,
      dormant: true,
      plaintextIncluded: false,
      provisioningAttempts: dru.ownerApprovedRuntimeKey.provisioningAttempts,
      hardcopies: dru.ownerApprovedRuntimeKey.secureHandoffFiles,
    },
    masterRegister: { path: MASTER_REGISTER, sha256: EXPECTED_REGISTER_SHA256 },
  });

  const mediaRoot = path.join(OUTPUT_DIR, "media", "blobs");
  await fsp.mkdir(mediaRoot, { recursive: true });
  runAz([
    "storage", "blob", "download-batch",
    "--account-name", STORAGE_ACCOUNT,
    "--source", MEDIA_CONTAINER,
    "--destination", mediaRoot,
    "--pattern", `${MEDIA_PREFIX}*`,
    "--auth-mode", "login",
    "--overwrite", "false",
    "--output", "none",
    "--only-show-errors",
  ], { timeout: 1_800_000 });

  const mediaEntries = [];
  for (const blob of blobList.sort((left, right) => left.name.localeCompare(right.name))) {
    const localPath = path.join(mediaRoot, ...blob.name.split("/"));
    requireCondition(fs.existsSync(localPath), "Downloaded media file is missing.");
    const stats = await fsp.stat(localPath);
    requireCondition(stats.size === Number(blob.bytes), "Downloaded media byte count does not match Azure readback.");
    mediaEntries.push({
      blobName: blob.name,
      localPath: normalizePath(path.relative(OUTPUT_DIR, localPath)),
      bytes: stats.size,
      sha256: await sha256File(localPath),
      contentType: blob.contentType || "",
      etag: blob.etag || "",
      lastModified: blob.lastModified || "",
    });
  }
  const mediaManifest = {
    tenantId: TENANT_ID,
    storageAccount: STORAGE_ACCOUNT,
    container: MEDIA_CONTAINER,
    prefix: MEDIA_PREFIX,
    authMode: "login",
    storageKeysUsed: false,
    listKeysUsed: false,
    sasUsed: false,
    count: mediaEntries.length,
    uniqueNames: new Set(mediaEntries.map((entry) => entry.blobName)).size,
    zeroByteCount: mediaEntries.filter((entry) => entry.bytes === 0).length,
    totalBytes: mediaEntries.reduce((sum, entry) => sum + entry.bytes, 0),
    entries: mediaEntries,
  };
  requireCondition(mediaManifest.count === EXPECTED_MEDIA_COUNT && mediaManifest.uniqueNames === EXPECTED_MEDIA_COUNT && mediaManifest.zeroByteCount === 0 && mediaManifest.totalBytes === EXPECTED_MEDIA_BYTES, "Downloaded media reconciliation failed.");
  await writeJson(path.join(OUTPUT_DIR, "media", "media-manifest.json"), mediaManifest);

  const restoreOrder = [
    "Validate bundle/checksums and require an empty or explicitly owner-approved target tenant policy.",
    "Create or reconcile the tenant shell without restoring credentials or runtime-key plaintext.",
    "Restore theme/configuration and compliance/launch holds.",
    "Restore canonical media by original blob path and verify every SHA-256 before MediaAsset records.",
    "Restore MediaAsset records, then reconstruct all source-path aliases.",
    "Restore pages and page revisions while retaining unpublished/noindex state.",
    "Restore page-owned redirects with their owner pages.",
    "Validate generic redirect uniqueness, targets, cycles, and precedence, then restore the two tenant redirects.",
    "Restore FormDefinitions, then all 65 page-level form-instance mappings with no-post holds.",
    "Restore held DomainBinding, ImportRun, and PublishRun metadata without DNS/TLS/deployment action.",
    "Provision or rotate TenantAdmin and runtime credentials from a separately approved secure handoff.",
    "Run tenant isolation, fidelity, and no-regression proof before any preview or launch decision.",
  ];
  await writeJson(path.join(OUTPUT_DIR, "restore", "restore-order.json"), {
    tenantId: TENANT_ID,
    liveRestorePerformed: false,
    overwritePolicy: "fail_if_tenant_exists_unless_separate_owner_approved_merge_or_replace_plan",
    mergePolicy: "create_only_by_default; no overwrite in V2.8.62E",
    steps: restoreOrder.map((description, index) => ({ order: index + 1, description })),
    credentialMaterialExcluded: true,
  });
  await writeText(path.join(OUTPUT_DIR, "restore", "RESTORE_READINESS.md"), [
    "# Vegas Restore Readiness",
    "",
    "No live restore was performed or approved in V2.8.62E.",
    "",
    "## Policy",
    "",
    "- Fail closed when the tenant already exists unless a later owner approval defines merge or replace behavior.",
    "- Default to create-only restoration; never overwrite live pages, media, redirects, forms, or credentials implicitly.",
    "- Keep all pages unpublished/noindex and all forms no-post through restore validation.",
    "- Validate generic redirect targets, source uniqueness, cycles, and redirect-before-page precedence before persistence.",
    "- Restore canonical media by original path and SHA-256, then rebuild aliases from source-path-aliases.json.",
    "- Credentials and runtime-key plaintext are intentionally excluded and require separate secure restoration or rotation.",
    "",
    "## Restore order",
    "",
    ...restoreOrder.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n"));

  const toolMetadata = {
    phase: PHASE,
    version: TOOL_VERSION,
    sourcePath: normalizePath(path.relative(REPO_ROOT, SCRIPT_PATH)),
    sourceSha256: await sha256File(SCRIPT_PATH),
    inheritedPattern: "V2.8.61OF tenant-parameterized exporter safety model",
    extensions: ["generic tenant redirects", "source-path aliases", "RBAC-only Azure blob download", "complete database file digests", "per-blob SHA-256"],
    deployed: false,
  };
  await writeJson(path.join(OUTPUT_DIR, "metadata", "backup-tool.json"), toolMetadata);

  const backupManifest = {
    schema: "pumpkin-tenant-full-backup",
    schemaVersion: "v2-8-62e",
    phase: PHASE,
    generatedAt: new Date().toISOString(),
    sourcePhase: "V2.8.62DRU",
    sourceCommit: "f5a69f340423c86f09523749082ec6f80596e1a0",
    tenantId: TENANT_ID,
    tenantName: TENANT_NAME,
    outputPath: OUTPUT_DIR,
    database: {
      files: databaseMetadata,
      databaseDigestManifest: "database/database-content-digests.json",
      counts: Object.fromEntries(Object.entries(databaseValues).map(([name, details]) => [name, details.count])),
    },
    media: {
      storageAccount: STORAGE_ACCOUNT,
      container: MEDIA_CONTAINER,
      prefix: MEDIA_PREFIX,
      authMode: "login",
      count: mediaManifest.count,
      totalBytes: mediaManifest.totalBytes,
      zeroByteCount: mediaManifest.zeroByteCount,
      manifest: "media/media-manifest.json",
    },
    fidelity: {
      status: validation.fidelityGate,
      pageOwnedRedirects: pageOwnedRedirects.length,
      genericRedirects: tenantRedirects.length,
      semanticRedirects: pageOwnedRedirects.length + tenantRedirects.length,
      acceptedDeviations: acceptedDeviations.length,
      physicalAirstripLinks: validation.physicalAirstripLinks,
      effectiveAirstripLinks: validation.effectiveAirstripLinks,
      airstripRequests: 0,
    },
    credentialPolicy: {
      plaintextCredentialsIncluded: false,
      runtimeKeyPlaintextIncluded: false,
      tenantAdminPasswordIncluded: false,
      secureMetadataReferencesIncluded: true,
    },
    tool: toolMetadata,
    checksumManifest: "checksums.sha256",
    checksumExclusions: ["checksums.sha256", "validation/backup-validation-report.json", "backup-completion.json"],
    liveReadRoutes: requestLog,
    mutations: {
      tenant: 0,
      media: 0,
      redirects: 0,
      forms: 0,
      domain: 0,
      deploy: 0,
      dnsTlsPublishIndex: 0,
      formPost: 0,
      airstrip: 0,
    },
  };
  await writeJson(path.join(OUTPUT_DIR, "backup-manifest.json"), backupManifest);

  const actualSecrets = [password, token].filter(Boolean);
  const secretScanResult = await secretScan(actualSecrets);
  if (!secretScanResult.ok) throw new UnsafeBackupError("Unsafe secret material detected in backup output.");

  const checksumEntries = await createChecksums();
  const checksumValidation = await validateChecksums(checksumEntries);
  requireCondition(checksumValidation.ok, "Backup checksum validation failed.");

  const allJsonFiles = (await listFiles(OUTPUT_DIR)).filter((filePath) => filePath.toLowerCase().endsWith(".json"));
  for (const filePath of allJsonFiles) JSON.parse(await fsp.readFile(filePath, "utf8"));
  const validationReport = {
    status: "passed",
    checkedAt: new Date().toISOString(),
    liveChecks,
    expected: EXPECTED,
    databaseFilesParsed: allJsonFiles.length,
    databaseExports: databaseMetadata.length,
    checksumValidation,
    checksumEntries: checksumEntries.length,
    secretScan: secretScanResult,
    media: { count: mediaManifest.count, totalBytes: mediaManifest.totalBytes, zeroByteCount: mediaManifest.zeroByteCount, everyBlobHasSha256: mediaEntries.every((entry) => /^[A-F0-9]{64}$/.test(entry.sha256)) },
    requestAccounting: {
      loginPosts: requestLog.filter((entry) => entry === "POST /api/auth/login").length,
      getRequests: requestLog.filter((entry) => entry.startsWith("GET ")).length,
      mutationRequests: requestLog.filter((entry) => !entry.startsWith("GET ") && entry !== "POST /api/auth/login").length,
      airstripRequests: requestLog.filter((entry) => /airstrip/i.test(entry)).length,
    },
    azureStorage: { authMode: "login", listCommands: 1, downloadBatchCommands: 1, storageKeys: false, listKeys: false, sas: false },
    prohibitedActions: { tenantMutation: false, mediaMutation: false, redirectMutation: false, formMutation: false, deploy: false, appsettingMutation: false, dnsTlsPublishIndex: false, formPost: false, formEntryCreated: false, airstripRequest: false },
  };
  await writeJson(path.join(OUTPUT_DIR, "validation", "backup-validation-report.json"), validationReport);

  const manifestSha256 = await sha256File(path.join(OUTPUT_DIR, "backup-manifest.json"));
  const checksumManifestSha256 = await sha256File(path.join(OUTPUT_DIR, "checksums.sha256"));
  const completion = {
    phase: PHASE,
    status: "passed_complete_database_and_rbac_media_backup",
    completedAt: new Date().toISOString(),
    tenantId: TENANT_ID,
    outputPath: OUTPUT_DIR,
    backupManifest: { path: path.join(OUTPUT_DIR, "backup-manifest.json"), sha256: manifestSha256 },
    checksumManifest: { path: path.join(OUTPUT_DIR, "checksums.sha256"), sha256: checksumManifestSha256, entries: checksumEntries.length, verified: checksumValidation.ok },
    database: { files: databaseMetadata.length, jsonFilesParsed: allJsonFiles.length },
    media: { count: mediaManifest.count, bytes: mediaManifest.totalBytes, zeroByteCount: mediaManifest.zeroByteCount, hashes: mediaEntries.length },
    secretsIncluded: false,
    credentialsMutated: false,
    liveRestorePerformed: false,
    noDeployDnsTlsPublishIndexPostAirstrip: true,
  };
  await writeJson(path.join(OUTPUT_DIR, "backup-completion.json"), completion);
  console.log(json({
    status: completion.status,
    tenantId: TENANT_ID,
    outputPath: OUTPUT_DIR,
    databaseFiles: completion.database.files,
    media: completion.media,
    checksumEntries: completion.checksumManifest.entries,
    manifestSha256,
    checksumManifestSha256,
    secretsIncluded: false,
  }));
}

main().catch(async (error) => {
  if (error instanceof UnsafeBackupError) {
    assertApprovedOutput();
    await fsp.rm(OUTPUT_DIR, { recursive: true, force: true });
  }
  const safeMessage = String(error?.message || error)
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/(password|token|apiKey|secret)\s*[:=]\s*\S+/gi, "$1=[REDACTED]");
  console.error(`${PHASE} backup export failed: ${safeMessage}`);
  process.exitCode = 1;
});
