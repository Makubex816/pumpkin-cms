import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolRoot, "../..");
const base = path.join(repoRoot, ".tmp", "pub20-a02-static-tenant");
const fixtures = [
  { id: "primary-preview", path: path.join(toolRoot, "synthetic-tenant.json") },
  { id: "secondary-live", path: path.join(toolRoot, "synthetic-tenant-secondary.json") },
];
const runs = ["run1", "run2"];
const checks = [];
const artifacts = new Map();

fs.rmSync(base, { recursive: true, force: true });

for (const fixture of fixtures) {
  const fixtureRuns = [];
  for (const run of runs) {
    const runRoot = path.join(base, fixture.id, run);
    const outputRoot = path.join(runRoot, "out");
    const packagePath = path.join(runRoot, "static-tenant-artifact.tar");
    const manifestPath = path.join(runRoot, "static-tenant-artifact-manifest.json");
    const result = spawnSync(process.execPath, [
      path.join(toolRoot, "build.mjs"),
      "--input",
      fixture.path,
      "--out",
      outputRoot,
      "--package",
      packagePath,
      "--manifest",
      manifestPath,
    ], { cwd: repoRoot, encoding: "utf8" });
    if (result.status !== 0) {
      process.stderr.write(result.stdout);
      process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
    fixtureRuns.push({
      outputRoot,
      packagePath,
      manifestPath,
      manifest: readJson(manifestPath),
      manifestBytes: fs.readFileSync(manifestPath),
      packageBytes: fs.readFileSync(packagePath),
    });
  }
  artifacts.set(fixture.id, { fixture: readJson(fixture.path), runs: fixtureRuns });
}

for (const [fixtureId, artifact] of artifacts) {
  const [first, second] = artifact.runs;
  check(`${fixtureId}: package hash deterministic`, first.manifest.packageSha256 === second.manifest.packageSha256);
  check(`${fixtureId}: package bytes deterministic`, first.packageBytes.equals(second.packageBytes));
  check(`${fixtureId}: manifest bytes deterministic`, first.manifestBytes.equals(second.manifestBytes));
  check(`${fixtureId}: file inventory deterministic`, JSON.stringify(first.manifest.files) === JSON.stringify(second.manifest.files));
  check(`${fixtureId}: package hash recorded`, sha256(first.packageBytes) === first.manifest.packageSha256);
  check(`${fixtureId}: no live mutation`, first.manifest.liveMutation === false && second.manifest.liveMutation === false);

  const tar = parseTar(first.packageBytes);
  const manifestInventory = first.manifest.files.map(({ path: filePath, bytes, sha256: hash }) => ({
    path: filePath,
    bytes,
    sha256: hash,
  }));
  check(`${fixtureId}: tar inventory matches manifest`, JSON.stringify(tar.entries) === JSON.stringify(manifestInventory));
  check(`${fixtureId}: tar has two zero terminators`, tar.zeroBlocks >= 2);
  check(`${fixtureId}: tar paths are sorted POSIX paths`, tar.entries.every(({ path: filePath }, index, entries) => isSafePosixPath(filePath) && (index === 0 || entries[index - 1].path < filePath)));
  check(`${fixtureId}: output inventory matches manifest`, outputInventory(first.outputRoot, first.manifest.files));

  const requiredFiles = [
    "404.html",
    "README.txt",
    "assets/public-form-client.js",
    "assets/theme.css",
    "index.html",
    "robots.txt",
    "sitemap.xml",
    "staticwebapp.config.json",
    "tenant-manifest.json",
  ];
  check(`${fixtureId}: required publication files present`, requiredFiles.every((filePath) => first.manifest.files.some((file) => file.path === filePath)));

  const metadata = readJson(path.join(first.outputRoot, "tenant-manifest.json"));
  const allowedMetadataKeys = [
    "apiBaseUrl",
    "indexingState",
    "publicFormMapping",
    "publicMode",
    "publicationId",
    "releaseId",
    "tenantUid",
  ];
  check(`${fixtureId}: public metadata keys are exactly allowlisted`, JSON.stringify(Object.keys(metadata).sort()) === JSON.stringify(allowedMetadataKeys));
  check(`${fixtureId}: public identifiers match fixture`, metadata.tenantUid === artifact.fixture.tenantUid
    && metadata.publicationId === artifact.fixture.publicationId
    && metadata.releaseId === artifact.fixture.releaseId);
  check(`${fixtureId}: backend route identifiers are compatible`, isBackendRouteIdentifier(metadata.publicationId)
    && Object.values(metadata.publicFormMapping).every((mapping) => isBackendRouteIdentifier(mapping.formMappingId)));
  check(`${fixtureId}: public mode matches fixture`, metadata.publicMode === artifact.fixture.publicMode);
  check(`${fixtureId}: API base is credential-free HTTPS`, isSafeApiBase(metadata.apiBaseUrl));
  check(`${fixtureId}: sitemap explicitly excluded`, metadata.indexingState?.mode === "disabled"
    && metadata.indexingState?.robots === "noindex,nofollow,noarchive"
    && metadata.indexingState?.includeInSitemap === false);
  check(`${fixtureId}: public form mappings are exact`, publicMappingsMatchFixture(metadata.publicFormMapping, artifact.fixture));

  const robots = fs.readFileSync(path.join(first.outputRoot, "robots.txt"), "utf8");
  check(`${fixtureId}: robots disallows all`, robots === "User-agent: *\nDisallow: /\n");
  const sitemap = fs.readFileSync(path.join(first.outputRoot, "sitemap.xml"), "utf8");
  check(`${fixtureId}: sitemap contains no URL`, !/<url(?:\s|>)/i.test(sitemap) && /intentionally excluded/i.test(sitemap));

  const swaConfig = readJson(path.join(first.outputRoot, "staticwebapp.config.json"));
  check(`${fixtureId}: SWA global X-Robots-Tag`, swaConfig.globalHeaders?.["X-Robots-Tag"] === "noindex,nofollow,noarchive");
  check(`${fixtureId}: no linked backend configuration`, !Object.hasOwn(swaConfig, "platform") && !Object.hasOwn(swaConfig, "apiRuntime"));
  const assetRoute = swaConfig.routes?.find((route) => route.route === "/assets/*");
  check(`${fixtureId}: unhashed client is not immutable-cached`, typeof assetRoute?.headers?.["cache-control"] === "string"
    && !/immutable|max-age=31536000/i.test(assetRoute.headers["cache-control"])
    && /no-cache|no-store|max-age=0/i.test(assetRoute.headers["cache-control"]));

  const htmlFiles = listFiles(first.outputRoot).filter((file) => file.endsWith(".html"));
  check(`${fixtureId}: every HTML page has exact noindex metadata`, htmlFiles.length > 0 && htmlFiles.every((file) => {
    const html = fs.readFileSync(file, "utf8");
    return html.includes('<meta name="robots" content="noindex,nofollow,noarchive">');
  }));
  check(`${fixtureId}: every HTML page embeds only safe metadata`, htmlFiles.every((file) => embeddedMetadataMatches(file, metadata)));
  check(`${fixtureId}: every HTML page loads the executable client`, htmlFiles.every((file) => fs.readFileSync(file, "utf8").includes('<script src="/assets/public-form-client.js" defer></script>')));

  for (const form of artifact.fixture.forms) {
    const route = artifact.fixture.routes.find((candidate) => candidate.formId === form.id);
    const formPage = route?.path === "/"
      ? path.join(first.outputRoot, "index.html")
      : path.join(first.outputRoot, ...route.path.replace(/^\/+|\/+$/g, "").split("/"), "index.html");
    const html = fs.readFileSync(formPage, "utf8");
    const formMarkup = html.match(/<form\b[^>]*data-pumpkin-public-form[^>]*>[\s\S]*?<\/form>/)?.[0] ?? "";
    check(`${fixtureId}/${form.id}: accessible form hook`, html.includes("data-pumpkin-public-form")
      && html.includes(`data-form-id="${form.id}"`)
      && html.includes('role="status"')
      && html.includes('aria-live="polite"')
      && html.includes('aria-atomic="true"'));
    check(`${fixtureId}/${form.id}: required consent`, html.includes(`type="checkbox" data-field-name="${form.consent.name}" value="accepted" required`));
    check(`${fixtureId}/${form.id}: hidden honeypot`, html.includes('class="pumpkin-honeypot" aria-hidden="true"')
      && html.includes(`data-field-name="${form.honeypot.name}" tabindex="-1" autocomplete="off"`));
    check(`${fixtureId}/${form.id}: labels bind to controls`, form.fields.every((field) => html.includes(`<label class="field" for="pumpkin-form-${form.id}-${field.name}">`)));
    check(`${fixtureId}/${form.id}: unmounted HTML cannot native-submit`, formMarkup.length > 0
      && !/<form\b[^>]*\s(?:method|action)=/i.test(formMarkup)
      && !/<(?:input|textarea|select)\b[^>]*\sname=/i.test(formMarkup)
      && form.fields.every((field) => formMarkup.includes(`data-field-name="${field.name}"`))
      && formMarkup.includes('<button type="button" data-pumpkin-submit disabled aria-disabled="true">'));
  }

  const publicText = listFiles(first.outputRoot).map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const forbiddenPatterns = [
    /BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY/i,
    /AccountKey\s*=/i,
    /SharedAccessSignature\s*=/i,
    /client[_-]?secret\s*[:=]/i,
    /connectionString\s*[:=]/i,
    /(?:api|deployment|access)[_-]?token\s*[:=]\s*["'][^"']+/i,
    /Bearer\s+[A-Za-z0-9._~+/=-]{16,}/i,
    /github_pat_[A-Za-z0-9_]+/i,
    /ghp_[A-Za-z0-9]+/i,
    /AKIA[0-9A-Z]{16}/,
    /[A-Za-z]:[\\/](?:Users|Windows|Program Files|ProgramData|Temp|tmp)[\\/]/i,
    /\/(?:mnt\/data|home|Users|tmp)\//i,
  ];
  check(`${fixtureId}: public artifact secret and local-path hygiene`, !forbiddenPatterns.some((pattern) => pattern.test(publicText)));
  check(`${fixtureId}: no raw logs or customer payload files`, !/stack trace|exception at|debug log|raw request|raw response/i.test(publicText)
    && first.manifest.files.every((file) => !/(?:^|\/)(?:logs?|backups?|customer-payloads?|browser-profiles?)(?:\/|$)/i.test(file.path)));
}

const primary = artifacts.get("primary-preview");
const secondary = artifacts.get("secondary-live");
check("two independent tenant fixtures", primary.fixture.tenantUid !== secondary.fixture.tenantUid
  && primary.fixture.publicationId !== secondary.fixture.publicationId
  && primary.runs[0].manifest.packageSha256 !== secondary.runs[0].manifest.packageSha256);
check("preview and public-live modes covered", primary.fixture.publicMode === "preview-no-post" && secondary.fixture.publicMode === "public-live");

const rejectedRoot = path.join(base, "rejected-secret-input");
const rejectedFixture = structuredClone(primary.fixture);
rejectedFixture.apiKey = "synthetic-forbidden-value";
fs.mkdirSync(rejectedRoot, { recursive: true });
const rejectedInput = path.join(rejectedRoot, "input.json");
const rejectedPackage = path.join(rejectedRoot, "artifact.tar");
fs.writeFileSync(rejectedInput, `${JSON.stringify(rejectedFixture)}\n`);
const rejectedBuild = spawnSync(process.execPath, [
  path.join(toolRoot, "build.mjs"),
  "--input", rejectedInput,
  "--out", path.join(rejectedRoot, "out"),
  "--package", rejectedPackage,
  "--manifest", path.join(rejectedRoot, "manifest.json"),
], { cwd: repoRoot, encoding: "utf8" });
check("credential-like input rejected before packaging", rejectedBuild.status !== 0 && !fs.existsSync(rejectedPackage));

const clientBehavior = await validateClientBehavior(
  readJson(path.join(primary.runs[0].outputRoot, "tenant-manifest.json")),
  readJson(path.join(secondary.runs[0].outputRoot, "tenant-manifest.json")),
  fs.readFileSync(path.join(secondary.runs[0].outputRoot, "assets", "public-form-client.js"), "utf8"),
);
for (const [name, passed] of Object.entries(clientBehavior)) check(`client: ${name}`, passed);

const failed = checks.filter((entry) => !entry.passed);
const result = {
  status: failed.length === 0 ? "passed" : "failed",
  fixtureCount: fixtures.length,
  fixtures: Object.fromEntries([...artifacts].map(([fixtureId, artifact]) => [fixtureId, {
    tenantUid: artifact.fixture.tenantUid,
    publicMode: artifact.fixture.publicMode,
    packageSha256: artifact.runs[0].manifest.packageSha256,
    packageBytes: artifact.runs[0].manifest.packageBytes,
    fileCount: artifact.runs[0].manifest.fileCount,
    manifestSha256: sha256(artifact.runs[0].manifestBytes),
  }])),
  checkCount: checks.length,
  failedChecks: failed.map((entry) => entry.name),
  checks: Object.fromEntries(checks.map((entry) => [entry.name, entry.passed])),
};
console.log(JSON.stringify(result, null, 2));
if (failed.length > 0) process.exitCode = 1;

function check(name, passed) {
  checks.push({ name, passed: Boolean(passed) });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listFiles(directory) {
  const files = [];
  walk(directory, files);
  return files.sort();
}

function walk(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }
}

function outputInventory(outputRoot, expectedFiles) {
  const actual = listFiles(outputRoot).map((file) => ({
    path: path.relative(outputRoot, file).split(path.sep).join("/"),
    bytes: fs.statSync(file).size,
    sha256: sha256(fs.readFileSync(file)),
  }));
  const canonical = (files) => files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}`).sort();
  return JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expectedFiles));
}

function publicMappingsMatchFixture(mapping, fixture) {
  const { forms, publicationId } = fixture;
  if (!mapping || JSON.stringify(Object.keys(mapping).sort()) !== JSON.stringify(forms.map((form) => form.id).sort())) return false;
  return forms.every((form) => {
    const publicForm = mapping[form.id];
    return publicForm?.formId === form.id
      && publicForm?.formMappingId === form.formMappingId
      && publicForm?.fieldContractVersion === form.fieldContractVersion
      && publicForm?.preflightPath === `/api/public/publications/${encodeURIComponent(publicationId)}/forms/${encodeURIComponent(form.formMappingId)}/preflight`
      && publicForm?.submitPath === `/api/public/publications/${encodeURIComponent(publicationId)}/forms/${encodeURIComponent(form.formMappingId)}/submit`
      && publicForm?.consentField === form.consent.name
      && publicForm?.honeypotField === form.honeypot.name
      && Array.isArray(publicForm?.fields)
      && publicForm.fields.length === form.fields.length
      && publicForm.fields.every((field, index) => field.name === form.fields[index].name
        && field.type === form.fields[index].type
        && field.required === Boolean(form.fields[index].required));
  });
}

function embeddedMetadataMatches(file, expected) {
  const html = fs.readFileSync(file, "utf8");
  const match = html.match(/<script type="application\/json" data-pumpkin-public-metadata>([^<]+)<\/script>/);
  if (!match) return false;
  try {
    return JSON.stringify(JSON.parse(match[1])) === JSON.stringify(expected);
  } catch {
    return false;
  }
}

function isSafeApiBase(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function isBackendRouteIdentifier(value) {
  return typeof value === "string"
    && /^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/.test(value);
}

function isSafePosixPath(value) {
  if (!value || value.startsWith("/") || value.includes("\\") || /^[A-Za-z]:/.test(value)) return false;
  return value.split("/").every((segment) => segment && segment !== "." && segment !== "..");
}

function parseTar(buffer) {
  const entries = [];
  let offset = 0;
  let zeroBlocks = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      zeroBlocks += 1;
      offset += 512;
      if (zeroBlocks >= 2) break;
      continue;
    }
    zeroBlocks = 0;
    const name = readTarString(header, 0, 100);
    const size = readTarOctal(header, 124, 12);
    const expectedChecksum = readTarOctal(header, 148, 8);
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    const actualChecksum = checksumHeader.reduce((sum, byte) => sum + byte, 0);
    if (expectedChecksum !== actualChecksum) throw new Error(`Invalid tar checksum for ${name}`);
    const bodyStart = offset + 512;
    const bodyEnd = bodyStart + size;
    if (bodyEnd > buffer.length) throw new Error(`Truncated tar entry ${name}`);
    const body = buffer.subarray(bodyStart, bodyEnd);
    entries.push({ path: name, bytes: size, sha256: sha256(body) });
    offset = bodyStart + Math.ceil(size / 512) * 512;
  }
  return { entries, zeroBlocks };
}

function readTarString(buffer, offset, length) {
  const value = buffer.subarray(offset, offset + length);
  const end = value.indexOf(0);
  return value.subarray(0, end < 0 ? value.length : end).toString("utf8");
}

function readTarOctal(buffer, offset, length) {
  const value = readTarString(buffer, offset, length).trim();
  return value ? Number.parseInt(value, 8) : 0;
}

async function validateClientBehavior(previewMetadata, liveMetadata, clientSource) {
  const context = {
    AbortController,
    URL,
    clearTimeout,
    console: { error() {}, warn() {}, log() {} },
    crypto: deterministicCrypto(),
    setTimeout,
  };
  context.globalThis = context;
  vm.runInNewContext(clientSource, context, { filename: "public-form-client.js" });
  const client = context.PumpkinPublicFormClient;
  const results = {};

  const previewMapping = Object.values(previewMetadata.publicFormMapping)[0];
  const previewForm = fakeForm(previewMetadata, previewMapping);
  let previewFetchCalls = 0;
  const previewResult = await client.submitForm(previewForm, {
    metadata: previewMetadata,
    fetchImpl: async () => {
      previewFetchCalls += 1;
      throw new Error("preview must not fetch");
    },
  });
  results["preview-no-post performs zero fetches"] = previewResult.ok === true
    && previewResult.code === "preview_no_post"
    && previewFetchCalls === 0
    && previewForm.status.dataset.code === "preview_no_post";

  const liveMapping = Object.values(liveMetadata.publicFormMapping)[0];
  const mountForm = fakeMountForm(liveMetadata, liveMapping);
  const mountedCount = client.mount({ querySelectorAll: () => [mountForm] });
  const firstNameActivation = mountForm.events.findIndex((event) => event.startsWith("control-name:"));
  results["listener is attached before controls are activated"] = mountedCount === 1
    && mountForm.events.indexOf("listener:submit") >= 0
    && mountForm.events.indexOf("listener:submit") < firstNameActivation
    && mountForm.button.type === "submit"
    && mountForm.button.disabled === false
    && mountForm.controls.every((control) => control.name === control.dataset.fieldName)
    && mountForm.dataset.pumpkinMounted === "true";

  const invalidMetadataMount = fakeMountForm(liveMetadata, liveMapping, { metadataText: "{" });
  client.mount({ querySelectorAll: () => [invalidMetadataMount] });
  results["metadata parse failure remains inert and renders status"] = invalidMetadataMount.dataset.pumpkinMounted === "failed"
    && invalidMetadataMount.button.type === "button"
    && invalidMetadataMount.button.disabled === true
    && invalidMetadataMount.controls.every((control) => !control.name)
    && invalidMetadataMount.status.dataset.state === "error"
    && invalidMetadataMount.status.dataset.code === "metadata_invalid"
    && invalidMetadataMount.status.textContent.length > 0
    && invalidMetadataMount.status.textContent.length < 160;

  const liveForm = fakeForm(liveMetadata, liveMapping);
  const liveCalls = [];
  const liveResult = await client.submitForm(liveForm, {
    fetchImpl: async (url, init) => {
      liveCalls.push(capturedCall(url, init));
      if (liveCalls.length === 1) {
        return fakeResponse(200, {
          ready: true,
          createsFormEntry: false,
          ticket: "server-ticket-success-0001",
          submissionId: liveCalls[0].body.clientIdempotencySeed,
          correlationId: "22222222-2222-4222-8222-222222222222",
          fieldContractVersion: liveMapping.fieldContractVersion,
        });
      }
      return fakeResponse(201, {
        success: true,
        formEntryId: "entry-public-0001",
        submissionId: liveCalls[1].body.submissionId,
        correlationId: liveCalls[1].body.correlationId,
        idempotentReplay: false,
        ignoredSecret: "not-rendered",
      });
    },
  });
  results["public-live obtains ticket before submit"] = liveResult.ok === true
    && liveCalls.length === 2
    && liveCalls[0].url.endsWith(liveMapping.preflightPath)
    && liveCalls[1].url.endsWith(liveMapping.submitPath)
    && JSON.stringify(Object.keys(liveCalls[0].body)) === JSON.stringify(["clientIdempotencySeed"])
    && isCanonicalUuid(liveCalls[0].body.clientIdempotencySeed)
    && liveCalls[1].body.submissionId === liveCalls[0].body.clientIdempotencySeed
    && liveCalls[1].body.correlationId === "22222222-2222-4222-8222-222222222222"
    && liveCalls[1].body.fieldContractVersion === liveMapping.fieldContractVersion
    && !Object.hasOwn(liveCalls[1].body, "ticket")
    && liveCalls[1].init.headers["X-Pumpkin-Public-Form-Ticket"] === "server-ticket-success-0001";
  results["submit DTO contains exact formData contract"] = JSON.stringify(Object.keys(liveCalls[1].body).sort()) === JSON.stringify(["correlationId", "fieldContractVersion", "formData", "submissionId"])
    && liveCalls[1].body.formData[liveMapping.consentField] === true
    && liveCalls[1].body.formData[liveMapping.honeypotField] === ""
    && liveMapping.fields.every((field) => liveCalls[1].body.formData[field.name] === `synthetic-${field.name}`);
  results["public-live sends no reusable credential"] = liveCalls.every((call) => call.init.credentials === "omit"
    && !Object.hasOwn(call.init.headers, "Authorization")
    && !Object.hasOwn(call.init.headers, "Idempotency-Key")
    && !Object.hasOwn(call.body, "apiKey")
    && !Object.hasOwn(call.body, "credential"));
  results["structured success status is bounded"] = liveForm.status.dataset.state === "success"
    && liveForm.status.dataset.code === "submitted"
    && liveForm.status.dataset.retryable === "false"
    && liveForm.status.textContent === "Submission received."
    && JSON.stringify(liveResult.receipt) === JSON.stringify({
      formEntryId: "entry-public-0001",
      submissionId: liveCalls[0].body.clientIdempotencySeed,
      correlationId: "22222222-2222-4222-8222-222222222222",
      idempotentReplay: false,
    });
  let completedRepeatFetches = 0;
  const completedRepeat = await client.submitForm(liveForm, {
    metadata: liveMetadata,
    fetchImpl: async () => {
      completedRepeatFetches += 1;
      return fakeResponse(500, {});
    },
  });
  results["completed logical submission cannot post twice"] = completedRepeat.ok === true
    && completedRepeat.code === "already_submitted"
    && completedRepeatFetches === 0;

  const retryForm = fakeForm(liveMetadata, liveMapping);
  const retryCalls = [];
  const retryFetch = async (url, init) => {
    retryCalls.push(capturedCall(url, init));
    if (retryCalls.length === 1) return fakeResponse(200, {
      ready: true,
      createsFormEntry: false,
      ticket: "server-ticket-retry-0001",
      submissionId: retryCalls[0].body.clientIdempotencySeed,
      correlationId: "33333333-3333-4333-8333-333333333333",
      fieldContractVersion: liveMapping.fieldContractVersion,
    });
    if (retryCalls.length === 2) return fakeResponse(503, { errorCode: "temporary_unavailable", retryable: true });
    if (retryCalls.length === 3) return fakeResponse(200, {
      ready: true,
      createsFormEntry: false,
      ticket: "server-ticket-retry-0002",
      submissionId: retryCalls[2].body.clientIdempotencySeed,
      correlationId: "44444444-4444-4444-8444-444444444444",
      fieldContractVersion: liveMapping.fieldContractVersion,
    });
    return fakeResponse(200, {
      success: true,
      formEntryId: "entry-public-retry",
      submissionId: retryCalls[3].body.submissionId,
      correlationId: retryCalls[3].body.correlationId,
      idempotentReplay: true,
    });
  };
  const firstAttempt = await client.submitForm(retryForm, { metadata: liveMetadata, fetchImpl: retryFetch });
  const secondAttempt = await client.submitForm(retryForm, { metadata: liveMetadata, fetchImpl: retryFetch });
  const submissionIds = new Set([retryCalls[1].body.submissionId, retryCalls[3].body.submissionId]);
  const correlationIds = new Set([retryCalls[1].body.correlationId, retryCalls[3].body.correlationId]);
  const preflightSeeds = new Set([retryCalls[0].body.clientIdempotencySeed, retryCalls[2].body.clientIdempotencySeed]);
  results["retry reuses client seed and consumes fresh preflight identity"] = firstAttempt.ok === false
    && firstAttempt.code === "temporary_unavailable"
    && firstAttempt.retryable === true
    && secondAttempt.ok === true
    && retryCalls.length === 4
    && submissionIds.size === 1
    && correlationIds.size === 2
    && preflightSeeds.size === 1
    && isCanonicalUuid([...preflightSeeds][0])
    && retryCalls[1].init.headers["X-Pumpkin-Public-Form-Ticket"] === "server-ticket-retry-0001"
    && retryCalls[3].init.headers["X-Pumpkin-Public-Form-Ticket"] === "server-ticket-retry-0002"
    && retryCalls[1].body.correlationId === "33333333-3333-4333-8333-333333333333"
    && retryCalls[3].body.correlationId === "44444444-4444-4444-8444-444444444444";

  const contractMismatchForm = fakeForm(liveMetadata, liveMapping);
  let contractMismatchCalls = 0;
  const contractMismatch = await client.submitForm(contractMismatchForm, {
    metadata: liveMetadata,
    fetchImpl: async (_url, init) => {
      contractMismatchCalls += 1;
      const body = JSON.parse(init.body);
      return fakeResponse(200, {
        ready: true,
        createsFormEntry: false,
        ticket: "server-ticket-contract-mismatch",
        submissionId: body.clientIdempotencySeed,
        correlationId: "55555555-5555-4555-8555-555555555555",
        fieldContractVersion: "unexpected-contract-v2",
      });
    },
  });
  results["field contract mismatch stops before submit"] = contractMismatch.ok === false
    && contractMismatch.code === "field_contract_mismatch"
    && contractMismatchCalls === 1;

  const timeoutForm = fakeForm(liveMetadata, liveMapping);
  const timeoutStarted = Date.now();
  const timeoutResult = await client.submitForm(timeoutForm, {
    metadata: liveMetadata,
    timeoutMs: 5,
    fetchImpl: async (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    }),
  });
  results["bounded timeout renders retryable status"] = timeoutResult.ok === false
    && timeoutResult.code === "request_timeout"
    && timeoutResult.retryable === true
    && Date.now() - timeoutStarted < 1000
    && timeoutForm.status.dataset.code === "request_timeout";

  const honeypotForm = fakeForm(liveMetadata, liveMapping, { honeypot: "bot-value" });
  let honeypotFetches = 0;
  const honeypotResult = await client.submitForm(honeypotForm, {
    metadata: liveMetadata,
    fetchImpl: async () => {
      honeypotFetches += 1;
      return fakeResponse(500, {});
    },
  });
  const noConsentForm = fakeForm(liveMetadata, liveMapping, { consent: false });
  let consentFetches = 0;
  const consentResult = await client.submitForm(noConsentForm, {
    metadata: liveMetadata,
    fetchImpl: async () => {
      consentFetches += 1;
      return fakeResponse(500, {});
    },
  });
  results["consent and honeypot reject before transport"] = honeypotResult.code === "honeypot_rejected"
    && consentResult.code === "consent_required"
    && honeypotFetches === 0
    && consentFetches === 0;

  return results;
}

function deterministicCrypto() {
  let counter = 0;
  return {
    randomUUID() {
      counter += 1;
      return `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`;
    },
  };
}

function fakeForm(metadata, mapping, options = {}) {
  const controls = new Map();
  for (const field of mapping.fields) {
    controls.set(field.name, { value: `synthetic-${field.name}` });
  }
  controls.set(mapping.consentField, { checked: options.consent ?? true, value: "accepted" });
  controls.set(mapping.honeypotField, { value: options.honeypot ?? "" });
  const status = { dataset: {}, textContent: "" };
  const metadataNode = { textContent: JSON.stringify(metadata) };
  return {
    dataset: { formId: mapping.formId, pumpkinMounted: "true" },
    elements: { namedItem: (name) => controls.get(name) ?? null },
    ownerDocument: { querySelector: (selector) => selector === "script[data-pumpkin-public-metadata]" ? metadataNode : null },
    querySelector: (selector) => selector === "[data-pumpkin-form-status]" ? status : null,
    status,
  };
}

function fakeMountForm(metadata, mapping, options = {}) {
  const events = [];
  const controls = [
    ...mapping.fields.map((field) => field.name),
    mapping.consentField,
    mapping.honeypotField,
  ].map((fieldName) => ({
    dataset: { fieldName },
    name: "",
    setAttribute(name, value) {
      if (name === "name") {
        this.name = value;
        events.push(`control-name:${value}`);
      }
    },
    removeAttribute(name) {
      if (name === "name") this.name = "";
    },
  }));
  const button = {
    type: "button",
    disabled: true,
    attributes: { "aria-disabled": "true" },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
  const status = { dataset: {}, textContent: "" };
  const metadataNode = { textContent: options.metadataText ?? JSON.stringify(metadata) };
  return {
    dataset: { formId: mapping.formId },
    ownerDocument: { querySelector: (selector) => selector === "script[data-pumpkin-public-metadata]" ? metadataNode : null },
    addEventListener(type) {
      events.push(`listener:${type}`);
    },
    querySelectorAll: (selector) => selector === "[data-field-name]" ? controls : [],
    querySelector(selector) {
      if (selector === "[data-pumpkin-submit]") return button;
      if (selector === "[data-pumpkin-form-status]") return status;
      return null;
    },
    button,
    controls,
    events,
    status,
  };
}

function capturedCall(url, init) {
  return {
    url,
    init,
    body: JSON.parse(init.body),
  };
}

function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

function isCanonicalUuid(value) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
