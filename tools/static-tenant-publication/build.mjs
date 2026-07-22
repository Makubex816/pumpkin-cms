import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input ?? "tools/static-tenant-publication/synthetic-tenant.json";
const outDir = args.out ?? ".tmp/int10-static-tenant/out";
const packagePath = args.package ?? ".tmp/int10-static-tenant/synthetic-tenant-static-artifact.tar";
const manifestPath = args.manifest ?? ".tmp/int10-static-tenant/synthetic-tenant-static-artifact-manifest.json";

const input = readJson(inputPath);
validateInput(input);

const files = buildFiles(input);
fs.rmSync(outDir, { recursive: true, force: true });
for (const file of files) {
  const target = path.join(outDir, file.path);
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
  tenantSlug: input.tenantSlug,
  packageFile: path.basename(packagePath),
  packageBytes: tarBytes.length,
  packageSha256: sha256(tarBytes),
  fileCount: files.length,
  totalFileBytes: fileManifest.reduce((sum, file) => sum + file.bytes, 0),
  files: fileManifest,
  deterministicInputs: {
    tenantUid: input.tenantUid,
    tenantSlug: input.tenantSlug,
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
  const routeFiles = config.routes.flatMap((route) => renderRoute(config, route));
  const forms = Object.fromEntries(config.forms.map((form) => [form.id, publicFormContract(config, form)]));
  const staticWebAppConfig = {
    routes: [
      ...config.redirects.map((redirect) => ({
        route: redirect.from,
        redirect: redirect.to,
        statusCode: redirect.status,
      })),
      {
        route: "/assets/*",
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
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
      exclude: ["/assets/*", "/forms/*", "/tenant-manifest.json"],
    },
  };
  const tenantManifest = {
    artifactId: config.artifactId,
    tenantUid: config.tenantUid,
    tenantSlug: config.tenantSlug,
    displayName: config.displayName,
    environment: config.environment,
    canonicalHost: config.canonicalHost,
    api: config.api,
    theme: {
      id: config.theme.id,
      version: config.theme.version,
    },
    routes: config.routes.map(({ path, title, formId }) => ({ path, title, formId: formId ?? null })),
    redirects: config.redirects,
    forms: config.forms.map(({ id, mode, captcha }) => ({ id, mode, captchaMode: captcha.mode })),
    publicStaticArtifact: true,
    liveMutation: false,
  };
  return [
    { path: "assets/theme.css", content: `${config.theme.css.trim()}\n` },
    { path: "forms/forms.json", content: `${stableStringify(forms)}\n` },
    { path: "staticwebapp.config.json", content: `${stableStringify(staticWebAppConfig)}\n` },
    { path: "tenant-manifest.json", content: `${stableStringify(tenantManifest)}\n` },
    { path: "404.html", content: renderShell(config, "Not found", "<h1>Not found</h1><p>This synthetic route is not published.</p>") },
    { path: "README.txt", content: "Synthetic non-customer Azure Static Web Apps static artifact for INT-10 local proof.\nNo live deployment is authorized by this artifact.\n" },
    ...routeFiles,
  ].sort((a, b) => a.path.localeCompare(b.path));
}

function renderRoute(config, route) {
  const body = [
    `<h1>${escapeHtml(route.title)}</h1>`,
    ...route.blocks.map((block) => renderBlock(block)),
    route.formId ? renderFormShell(config, route.formId) : "",
  ].filter(Boolean).join("\n");
  const filePath = route.path === "/" ? "index.html" : `${route.path.replace(/^\/+|\/+$/g, "")}/index.html`;
  return [{ path: filePath, content: renderShell(config, route.title, body) }];
}

function renderShell(config, title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/theme.css">
  <meta name="pumpkin-tenant-uid" content="${escapeHtml(config.tenantUid)}">
  <meta name="pumpkin-api-origin" content="${escapeHtml(config.api.origin)}">
</head>
<body>
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

function renderFormShell(config, formId) {
  const form = config.forms.find((candidate) => candidate.id === formId);
  if (!form) throw new Error(`Missing form ${formId}`);
  const fields = form.fields.map((field) =>
    `<label class="field"><span>${escapeHtml(field.label)}</span><${field.type === "textarea" ? "textarea" : "input"} name="${escapeHtml(field.name)}"${field.type === "textarea" ? "" : ` type="${escapeHtml(field.type)}"`}${field.required ? " required" : ""}></${field.type === "textarea" ? "textarea" : "input"}></label>`,
  ).join("\n");
  return `<form class="form" method="post" data-form-id="${escapeHtml(form.id)}" data-api-submit="${escapeHtml(config.api.origin + config.api.publicSubmitPath)}">
${indent(fields, 2)}
  <input type="text" name="company" tabindex="-1" autocomplete="off" hidden>
  <p class="notice">This synthetic form shell records the tenant-scoped shared API contract only. It performs no live POST during INT-10.</p>
  <button type="submit">Send synthetic message</button>
</form>`;
}

function publicFormContract(config, form) {
  return {
    id: form.id,
    tenantUid: config.tenantUid,
    tenantSlug: config.tenantSlug,
    mode: form.mode,
    submitUrl: `${config.api.origin}${config.api.publicSubmitPath}`,
    captcha: {
      mode: form.captcha.mode,
      publicSiteKey: form.captcha.publicSiteKey,
    },
    fields: form.fields,
    liveMutation: false,
  };
}

function createTar(files) {
  const chunks = [];
  for (const file of files) {
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
  const required = ["artifactId", "tenantUid", "tenantSlug", "displayName", "environment", "canonicalHost", "api", "theme", "routes", "redirects", "forms"];
  for (const key of required) {
    if (config[key] === undefined) throw new Error(`Missing required static tenant field: ${key}`);
  }
  if (config.api.requiresCredentialInArtifact) throw new Error("Static artifact cannot require privileged API credentials.");
  if (!Array.isArray(config.routes) || config.routes.length === 0) throw new Error("At least one route is required.");
  if (!Array.isArray(config.forms)) throw new Error("forms must be an array.");
  const credentialKeyPattern = new RegExp(["password", `client${"Secret"}`, `private${"Key"}`, `connection${"String"}`].join("|"), "i");
  if (credentialKeyPattern.test(JSON.stringify(config))) {
    throw new Error("Synthetic static input contains a forbidden credential-like key.");
  }
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

function indent(value, spaces) {
  const pad = " ".repeat(spaces);
  return value.split("\n").map((line) => `${pad}${line}`).join("\n");
}
