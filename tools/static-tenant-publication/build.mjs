import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input ?? "tools/static-tenant-publication/synthetic-tenant.json";
const outDir = args.out ?? ".tmp/pub20-a02-static-tenant/out";
const packagePath = args.package ?? ".tmp/pub20-a02-static-tenant/static-tenant-artifact.tar";
const manifestPath = args.manifest ?? ".tmp/pub20-a02-static-tenant/static-tenant-artifact-manifest.json";
const clientSource = `${fs.readFileSync(new URL("./public-form-client.js", import.meta.url), "utf8").replace(/\r\n/g, "\n").trimEnd()}\n`;

const input = readJson(inputPath);
validateInput(input);

const files = buildFiles(input);
fs.rmSync(outDir, { recursive: true, force: true });
for (const file of files) {
  const target = path.join(outDir, ...file.path.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, file.content);
}

const tarBytes = createTar(files);
fs.mkdirSync(path.dirname(packagePath), { recursive: true });
fs.writeFileSync(packagePath, tarBytes);

const fileManifest = files.map((file) => ({
  path: file.path,
  bytes: Buffer.byteLength(file.content),
  sha256: sha256(file.content),
}));
const manifest = {
  artifactId: input.artifactId,
  tenantUid: input.tenantUid,
  publicationId: input.publicationId,
  releaseId: input.releaseId,
  publicMode: input.publicMode,
  indexingState: input.indexingState.mode,
  packageFile: path.basename(packagePath),
  packageBytes: tarBytes.length,
  packageSha256: sha256(tarBytes),
  fileCount: files.length,
  totalFileBytes: fileManifest.reduce((sum, file) => sum + file.bytes, 0),
  files: fileManifest,
  deterministicInputs: {
    tenantUid: input.tenantUid,
    publicationId: input.publicationId,
    releaseId: input.releaseId,
    publicMode: input.publicMode,
    themeId: input.theme.id,
    routeCount: input.routes.length,
    formCount: input.forms.length,
    redirectCount: input.redirects.length,
  },
  liveMutation: false,
};
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${stableStringify(manifest)}\n`);
console.log(JSON.stringify(manifest, null, 2));

function buildFiles(config) {
  const metadata = publicMetadata(config);
  const routeFiles = config.routes.flatMap((route) => renderRoute(config, metadata, route));
  const staticWebAppConfig = {
    globalHeaders: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin",
      "X-Robots-Tag": config.indexingState.robots,
    },
    routes: [
      ...config.redirects.map((redirect) => ({
        route: redirect.from,
        redirect: redirect.to,
        statusCode: redirect.status,
      })),
      {
        route: "/assets/*",
        headers: {
          "cache-control": "no-cache, max-age=0, must-revalidate",
        },
      },
      {
        route: "/robots.txt",
        headers: {
          "cache-control": "no-store",
        },
      },
      {
        route: "/sitemap.xml",
        headers: {
          "cache-control": "no-store",
        },
      },
    ],
    responseOverrides: {
      404: {
        rewrite: "/404.html",
      },
    },
    navigationFallback: {
      rewrite: "/404.html",
      exclude: ["/assets/*", "/robots.txt", "/sitemap.xml", "/tenant-manifest.json"],
    },
  };

  const baseCss = [
    ".pumpkin-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}",
    ".pumpkin-consent{display:flex;align-items:flex-start;gap:.5rem}",
    ".pumpkin-form-status{display:block;min-height:1.5em;font-weight:600}",
    ".pumpkin-form-status[data-state=error]{color:#991b1b}",
    ".pumpkin-form-status[data-state=success]{color:#166534}",
  ].join("\n");

  const files = [
    { path: "assets/public-form-client.js", content: clientSource },
    { path: "assets/theme.css", content: `${config.theme.css.trim()}\n${baseCss}\n` },
    { path: "robots.txt", content: "User-agent: *\nDisallow: /\n" },
    { path: "sitemap.xml", content: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><!-- All routes are intentionally excluded while indexing is disabled. --></urlset>\n" },
    { path: "staticwebapp.config.json", content: `${stableStringify(staticWebAppConfig)}\n` },
    { path: "tenant-manifest.json", content: `${stableStringify(metadata)}\n` },
    {
      path: "404.html",
      content: renderShell(config, metadata, "Not found", "<h1>Not found</h1><p>This route is not published.</p>"),
    },
    {
      path: "README.txt",
      content: "Generic non-customer static tenant artifact.\nNo deployment, reusable credential, customer payload, or indexing authorization is carried by this package.\n",
    },
    ...routeFiles,
  ].sort(compareArtifactFiles);

  const seen = new Set();
  for (const file of files) {
    assertPosixArtifactPath(file.path);
    if (seen.has(file.path)) throw new Error(`Duplicate artifact path: ${file.path}`);
    seen.add(file.path);
  }
  return files;
}

function publicMetadata(config) {
  return {
    tenantUid: config.tenantUid,
    publicationId: config.publicationId,
    releaseId: config.releaseId,
    apiBaseUrl: config.apiBaseUrl.replace(/\/$/, ""),
    publicFormMapping: Object.fromEntries(config.forms.map((form) => [form.id, {
      formId: form.id,
      formMappingId: form.formMappingId,
      fieldContractVersion: form.fieldContractVersion,
      preflightPath: publicFormPath(config.publicationId, form.formMappingId, "preflight"),
      submitPath: publicFormPath(config.publicationId, form.formMappingId, "submit"),
      fields: form.fields.map(({ name, type, required }) => ({ name, type, required: Boolean(required) })),
      consentField: form.consent.name,
      honeypotField: form.honeypot.name,
    }])),
    publicMode: config.publicMode,
    indexingState: {
      mode: config.indexingState.mode,
      robots: config.indexingState.robots,
      includeInSitemap: config.indexingState.includeInSitemap,
    },
  };
}

function renderRoute(config, metadata, route) {
  const body = [
    `<h1>${escapeHtml(route.title)}</h1>`,
    ...route.blocks.map((block) => renderBlock(block)),
    route.formId ? renderForm(config, route.formId) : "",
  ].filter(Boolean).join("\n");
  const filePath = route.path === "/" ? "index.html" : `${route.path.replace(/^\/+|\/+$/g, "")}/index.html`;
  return [{ path: filePath, content: renderShell(config, metadata, route.title, body) }];
}

function renderShell(config, metadata, title, body) {
  const metadataJson = escapeJsonForHtml(stableStringify(metadata));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="${escapeHtml(config.indexingState.robots)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/theme.css">
  <script type="application/json" data-pumpkin-public-metadata>${metadataJson}</script>
  <script src="/assets/public-form-client.js" defer></script>
</head>
<body data-indexing-state="${escapeHtml(config.indexingState.mode)}">
  <main>
${indent(body, 4)}
  </main>
</body>
</html>
`;
}

function renderBlock(block) {
  if (block.type === "hero") {
    return `<section class="hero"><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.body)}</p></section>`;
  }
  return `<section class="card"><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.body)}</p></section>`;
}

function renderForm(config, formId) {
  const form = config.forms.find((candidate) => candidate.id === formId);
  if (!form) throw new Error(`Missing form ${formId}`);
  const domId = `pumpkin-form-${htmlId(form.id)}`;
  const statusId = `${domId}-status`;
  const fields = form.fields.map((field) => renderField(domId, field)).join("\n");
  const honeypotId = `${domId}-${htmlId(form.honeypot.name)}`;
  const consentId = `${domId}-${htmlId(form.consent.name)}`;
  return `<form id="${domId}" class="form" data-pumpkin-public-form data-form-id="${escapeHtml(form.id)}" data-public-mode="${escapeHtml(config.publicMode)}" aria-describedby="${statusId}">
${indent(fields, 2)}
  <div class="pumpkin-honeypot" aria-hidden="true">
    <label for="${honeypotId}">${escapeHtml(form.honeypot.label)}</label>
    <input id="${honeypotId}" type="text" data-field-name="${escapeHtml(form.honeypot.name)}" tabindex="-1" autocomplete="off">
  </div>
  <label class="pumpkin-consent" for="${consentId}"><input id="${consentId}" type="checkbox" data-field-name="${escapeHtml(form.consent.name)}" value="accepted" required> <span>${escapeHtml(form.consent.label)}</span></label>
  <button type="button" data-pumpkin-submit disabled aria-disabled="true">${escapeHtml(form.submitLabel)}</button>
  <output id="${statusId}" class="pumpkin-form-status" role="status" aria-live="polite" aria-atomic="true" data-pumpkin-form-status data-state="idle" data-code="ready" data-retryable="false">Ready.</output>
  <noscript>This public form requires JavaScript. No submission was sent.</noscript>
</form>`;
}

function renderField(formDomId, field) {
  const fieldId = `${formDomId}-${htmlId(field.name)}`;
  const required = field.required ? " required aria-required=\"true\"" : "";
  const autocomplete = field.autocomplete ? ` autocomplete="${escapeHtml(field.autocomplete)}"` : "";
  if (field.type === "textarea") {
    return `<label class="field" for="${fieldId}"><span>${escapeHtml(field.label)}</span><textarea id="${fieldId}" data-field-name="${escapeHtml(field.name)}"${required}${autocomplete}></textarea></label>`;
  }
  return `<label class="field" for="${fieldId}"><span>${escapeHtml(field.label)}</span><input id="${fieldId}" data-field-name="${escapeHtml(field.name)}" type="${escapeHtml(field.type)}"${required}${autocomplete}></label>`;
}

function createTar(files) {
  const chunks = [];
  for (const file of files) {
    assertPosixArtifactPath(file.path);
    const body = Buffer.from(file.content);
    chunks.push(tarHeader(file.path, body.length));
    chunks.push(body);
    chunks.push(Buffer.alloc((512 - (body.length % 512)) % 512));
  }
  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

function tarHeader(name, size) {
  const header = Buffer.alloc(512, 0);
  writeString(header, name, 0, 100);
  writeOctal(header, 0o644, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, size, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  writeString(header, "ustar", 257, 6);
  writeString(header, "00", 263, 2);
  writeString(header, "pumpkin", 265, 32);
  writeString(header, "pumpkin", 297, 32);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeOctal(header, checksum, 148, 8);
  return header;
}

function writeString(buffer, value, offset, length) {
  const encoded = Buffer.from(value);
  if (encoded.length > length) throw new Error(`Tar path too long: ${value}`);
  encoded.copy(buffer, offset);
}

function writeOctal(buffer, value, offset, length) {
  const text = value.toString(8).padStart(length - 1, "0").slice(-(length - 1));
  buffer.write(text, offset, length - 1, "ascii");
  buffer[offset + length - 1] = 0;
}

function validateInput(config) {
  const required = [
    "artifactId",
    "tenantUid",
    "publicationId",
    "releaseId",
    "publicMode",
    "indexingState",
    "displayName",
    "apiBaseUrl",
    "theme",
    "routes",
    "redirects",
    "forms",
  ];
  for (const key of required) {
    if (config[key] === undefined) throw new Error(`Missing required static tenant field: ${key}`);
  }

  for (const [label, value] of [["artifactId", config.artifactId], ["tenantUid", config.tenantUid], ["releaseId", config.releaseId]]) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)) throw new Error(`${label} must be a bounded public identifier.`);
  }
  if (!isBackendRouteIdentifier(config.publicationId)) throw new Error("publicationId must use the backend lowercase-alphanumeric/hyphen grammar.");
  if (!new Set(["preview-no-post", "public-live"]).has(config.publicMode)) {
    throw new Error("publicMode must be preview-no-post or public-live.");
  }
  if (config.indexingState?.mode !== "disabled"
    || config.indexingState?.robots !== "noindex,nofollow,noarchive"
    || config.indexingState?.includeInSitemap !== false) {
    throw new Error("Stage 1 artifacts must disable indexing and sitemap inclusion.");
  }

  const apiBase = new URL(config.apiBaseUrl);
  if (apiBase.protocol !== "https:" || apiBase.username || apiBase.password || apiBase.search || apiBase.hash) {
    throw new Error("apiBaseUrl must be a credential-free HTTPS base URL without query or fragment data.");
  }
  if (!Array.isArray(config.routes) || config.routes.length === 0) throw new Error("At least one route is required.");
  if (!Array.isArray(config.redirects)) throw new Error("redirects must be an array.");
  if (!Array.isArray(config.forms) || config.forms.length === 0) throw new Error("At least one public form is required.");

  const routePaths = new Set();
  for (const route of config.routes) {
    validatePublicPath(route.path, "route path");
    if (routePaths.has(route.path)) throw new Error(`Duplicate route path: ${route.path}`);
    routePaths.add(route.path);
    if (!Array.isArray(route.blocks)) throw new Error(`Route ${route.path} must contain blocks.`);
  }
  for (const redirect of config.redirects) {
    validatePublicPath(redirect.from, "redirect source");
    validatePublicPath(redirect.to, "redirect target");
    if (![301, 302, 307, 308].includes(redirect.status)) throw new Error("Redirect status is not supported.");
  }

  const formIds = new Set();
  const formMappingIds = new Set();
  for (const form of config.forms) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(form.id)) throw new Error("Form ID is not a bounded public identifier.");
    if (!isBackendRouteIdentifier(form.formMappingId)) throw new Error("Form mapping ID must use the backend lowercase-alphanumeric/hyphen grammar.");
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(form.fieldContractVersion)) throw new Error("Field contract version is not a bounded public identifier.");
    if (formIds.has(form.id)) throw new Error(`Duplicate form ID: ${form.id}`);
    if (formMappingIds.has(form.formMappingId)) throw new Error(`Duplicate form mapping ID: ${form.formMappingId}`);
    formIds.add(form.id);
    formMappingIds.add(form.formMappingId);
    if (!Array.isArray(form.fields) || form.fields.length === 0) throw new Error(`Form ${form.id} requires fields.`);
    const fieldNames = new Set();
    for (const field of form.fields) {
      validateFieldName(field.name);
      if (fieldNames.has(field.name)) throw new Error(`Duplicate field name ${field.name}.`);
      fieldNames.add(field.name);
      if (!["text", "email", "tel", "textarea"].includes(field.type)) throw new Error(`Unsupported public field type: ${field.type}`);
    }
    validateFieldName(form.consent?.name);
    validateFieldName(form.honeypot?.name);
    if (fieldNames.has(form.consent.name) || fieldNames.has(form.honeypot.name) || form.consent.name === form.honeypot.name) {
      throw new Error(`Form ${form.id} has colliding consent, honeypot, or data field names.`);
    }
    if (!form.consent.label || !form.honeypot.label || !form.submitLabel) throw new Error(`Form ${form.id} requires accessible public labels.`);
  }
  for (const route of config.routes) {
    if (route.formId && !formIds.has(route.formId)) throw new Error(`Missing form ${route.formId} for route ${route.path}.`);
  }

  const credentialKeyPattern = /password|clientsecret|privatekey|connectionstring|accountkey|sharedaccesssignature|deploymenttoken|bearertoken|apikey|accesstoken/i;
  const credentialKey = findForbiddenKey(config, credentialKeyPattern);
  if (credentialKey) throw new Error(`Static input contains forbidden credential-like key: ${credentialKey}`);
}

function publicFormPath(publicationId, formMappingId, operation) {
  return `/api/public/publications/${encodeURIComponent(publicationId)}/forms/${encodeURIComponent(formMappingId)}/${operation}`;
}

function validatePublicPath(value, label) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.split("/").some((segment) => segment === "." || segment === "..") || /[?#]/.test(value)) {
    throw new Error(`${label} must be a root-relative POSIX path without traversal, query, or fragment data.`);
  }
}

function validateFieldName(value) {
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(value)) {
    throw new Error("Public form field names must be bounded identifiers.");
  }
}

function isBackendRouteIdentifier(value) {
  return typeof value === "string"
    && /^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/.test(value);
}

function findForbiddenKey(value, pattern, prefix = "") {
  if (!value || typeof value !== "object") return null;
  for (const [key, child] of Object.entries(value)) {
    const current = prefix ? `${prefix}.${key}` : key;
    if (pattern.test(key)) return current;
    const nested = findForbiddenKey(child, pattern, current);
    if (nested) return nested;
  }
  return null;
}

function assertPosixArtifactPath(value) {
  if (typeof value !== "string" || value.length === 0 || value.startsWith("/") || value.includes("\\") || /^[A-Za-z]:/.test(value)) {
    throw new Error(`Artifact path is not relative POSIX: ${value}`);
  }
  const segments = value.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Artifact path contains an unsafe segment: ${value}`);
  }
  if (Buffer.byteLength(value) > 100) throw new Error(`Tar path too long: ${value}`);
}

function compareArtifactFiles(left, right) {
  return left.path < right.path ? -1 : left.path > right.path ? 1 : 0;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    result[argv[index].slice(2)] = argv[index + 1];
    index += 1;
  }
  return result;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function escapeJsonForHtml(value) {
  return value.replace(/[<>&]/g, (character) => ({
    "<": "\\u003c",
    ">": "\\u003e",
    "&": "\\u0026",
  }[character]));
}

function htmlId(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "-");
}

function indent(value, spaces) {
  const pad = " ".repeat(spaces);
  return value.split("\n").map((line) => `${pad}${line}`).join("\n");
}
