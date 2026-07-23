import {
  createPublicKey,
  verify as verifySignature,
} from 'node:crypto';
import postcss from 'postcss';
import parseCssValue from 'postcss-value-parser';
import {
  ContractError,
  ContractVersion,
  FormMode,
  HostingClass,
  PublicationMode,
  assertEnumValue,
} from './contracts.mjs';
import {
  canonicalDigest,
  immutable,
  sha256,
  stableStringify,
} from './canonical.mjs';
import { createDeterministicTar, fileInventory } from './archive.mjs';
import {
  assertDistributableHygiene,
  assertGitCommitSha,
  assertHttpsUrl,
  assertNoForbiddenData,
  assertSafeArtifactPath,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
  escapeHtml,
  escapeJsonForHtml,
  normalizeRoute,
  routeToArtifactPath,
} from './security.mjs';

const SUPPORTED_REDIRECT_STATUS = new Set([301, 302, 307, 308]);
const SUPPORTED_FIELD_TYPES = new Set(['text', 'email', 'tel', 'textarea', 'select']);
const SUPPORTED_BLOCK_TYPES = new Set(['hero', 'text', 'card', 'image']);
const SUPPORTED_ATTRIBUTION_PATHS = new Set([
  'LICENSE',
  'LICENSE.txt',
  'NOTICE',
  'NOTICE.txt',
  'THIRD_PARTY_NOTICES.txt',
]);
const THIRD_PARTY_ATTRIBUTION_PATH =
  /^third-party\/[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?\/(?:LICENSE|LICENSE\.txt|NOTICE|NOTICE\.txt)$/;
const LEGAL_DISTRIBUTION_STATE = 'HELD_PENDING_OWNER_LEGAL_REVIEW';
const ACCEPTED_RELEASE_LICENSE_STATES = new Set([
  LEGAL_DISTRIBUTION_STATE,
  'OWNER_LEGAL_REVIEW_ACCEPTED',
]);
const PLATFORM_ORIGIN_VERIFIERS = new WeakMap();
const PLATFORM_ORIGIN_BOOT_PUBLIC_KEY_SHA256 =
  process.env.PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256 ?? null;
const PLATFORM_ORIGIN_BOOT_VERIFIER_SHA256 =
  process.env.PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256 ?? null;
const MAX_PLATFORM_ORIGIN_AUTHORITY_VALIDITY_MS = 24 * 60 * 60 * 1000;
const RESERVED_ROUTES = [
  '/assets',
  '/index.html',
  '/404.html',
  '/README.txt',
  '/robots.txt',
  '/sitemap.xml',
  '/tenant-manifest.json',
  '/publication-manifest.json',
  '/route-inventory.json',
  '/redirect-inventory.json',
  '/media-inventory.json',
  '/form-inventory.json',
  '/compatibility-report.json',
  '/staticwebapp.config.json',
];
const EMBEDDED_MEDIA_FORMATS = Object.freeze({
  'image/png': Object.freeze({
    extensions: Object.freeze(['.png']),
    matches: (bytes) =>
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
  }),
  'image/jpeg': Object.freeze({
    extensions: Object.freeze(['.jpg', '.jpeg']),
    matches: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes.at(-2) === 0xff &&
      bytes.at(-1) === 0xd9,
  }),
  'image/gif': Object.freeze({
    extensions: Object.freeze(['.gif']),
    matches: (bytes) =>
      bytes.length >= 6 &&
      (bytes.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        bytes.subarray(0, 6).toString('ascii') === 'GIF89a'),
  }),
  'image/webp': Object.freeze({
    extensions: Object.freeze(['.webp']),
    matches: (bytes) =>
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP',
  }),
  'application/pdf': Object.freeze({
    extensions: Object.freeze(['.pdf']),
    matches: (bytes) =>
      bytes.length >= 9 &&
      bytes.subarray(0, 5).toString('ascii') === '%PDF-' &&
      bytes
        .subarray(Math.max(0, bytes.length - 1024))
        .includes(Buffer.from('%%EOF', 'ascii')),
  }),
  'font/woff': Object.freeze({
    extensions: Object.freeze(['.woff']),
    matches: (bytes) =>
      bytes.length >= 4 &&
      bytes.subarray(0, 4).toString('ascii') === 'wOFF',
  }),
  'font/woff2': Object.freeze({
    extensions: Object.freeze(['.woff2']),
    matches: (bytes) =>
      bytes.length >= 4 &&
      bytes.subarray(0, 4).toString('ascii') === 'wOF2',
  }),
});

const PUBLIC_FORM_CLIENT = `(() => {
  "use strict";
  const metadataNode = document.querySelector("[data-pumpkin-public-metadata]");
  if (!metadataNode) return;
  let metadata;
  try { metadata = JSON.parse(metadataNode.textContent || "{}"); } catch { return; }
  if (metadata.formMode !== "PUBLIC_FORMS_LIVE") return;
  const originAuthority = metadata.platformOriginAuthority;
  const originAuthorityExpiresAt = Date.parse(originAuthority && originAuthority.expiresAt);
  if (!Number.isFinite(originAuthorityExpiresAt) || originAuthorityExpiresAt <= Date.now()) return;
  const mappings = metadata.publicFormMappings || {};
  for (const form of document.querySelectorAll("[data-pumpkin-public-form]")) {
    const mapping = mappings[form.dataset.formId || ""];
    const button = form.querySelector("[data-pumpkin-submit]");
    const status = form.querySelector("[data-pumpkin-form-status]");
    if (!mapping || !button || !status) continue;
    let logicalSubmissionSeed = null;
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
    button.addEventListener("click", async () => {
      if (button.disabled || !form.reportValidity()) return;
      if (originAuthorityExpiresAt <= Date.now()) {
        button.disabled = true;
        status.textContent = "Submission authorization expired.";
        status.dataset.state = "error";
        status.dataset.code = "origin_authority_expired";
        return;
      }
      const values = {};
      for (const control of form.querySelectorAll("[data-field-name]")) {
        const name = control.dataset.fieldName;
        values[name] = control.type === "checkbox" ? control.checked : control.value;
      }
      if (values[mapping.honeypotField]) {
        status.textContent = "Unable to submit.";
        status.dataset.code = "honeypot_rejected";
        return;
      }
      if (values[mapping.consentField] !== true) {
        status.textContent = "Consent is required.";
        status.dataset.code = "consent_required";
        return;
      }
      button.disabled = true;
      status.textContent = "Sending…";
      status.dataset.state = "pending";
      logicalSubmissionSeed ||= crypto.randomUUID();
      const seed = logicalSubmissionSeed;
      try {
        const preflightResponse = await fetch(metadata.apiBaseUrl + mapping.preflightPath, {
          method: "POST",
          credentials: "omit",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ clientIdempotencySeed: seed })
        });
        if (!preflightResponse.ok) throw new Error("preflight_failed");
        const preflight = await preflightResponse.json();
        const submitResponse = await fetch(metadata.apiBaseUrl + mapping.submitPath, {
          method: "POST",
          credentials: "omit",
          headers: {
            "content-type": "application/json",
            "x-pumpkin-public-form-ticket": preflight.ticket
          },
          body: JSON.stringify({
            submissionId: preflight.submissionId,
            correlationId: preflight.correlationId,
            formData: values
          })
        });
        if (!submitResponse.ok) throw new Error("submit_failed");
        status.textContent = "Thank you. Your request was received.";
        status.dataset.state = "success";
        status.dataset.code = "created_or_replayed";
        logicalSubmissionSeed = null;
      } catch {
        status.textContent = "Submission was not completed. Please try again.";
        status.dataset.state = "error";
        status.dataset.code = "transport_failed";
        button.disabled = false;
      }
    });
    form.addEventListener("reset", () => {
      logicalSubmissionSeed = null;
      status.textContent = "";
      status.dataset.state = "";
      status.dataset.code = "";
      button.disabled = false;
      button.setAttribute("aria-disabled", "false");
    });
  }
})();\n`;

const AGE_GATE_CLIENT = `(() => {
  "use strict";
  const gate = document.querySelector("[data-pumpkin-age-gate]");
  if (!gate) return;
  const storageKey = "pumpkin-age-gate:" + (gate.dataset.publicationId || "publication");
  try {
    if (sessionStorage.getItem(storageKey) === "accepted") {
      gate.hidden = true;
      return;
    }
  } catch {}
  const accept = gate.querySelector("[data-age-gate-accept]");
  if (!accept) return;
  accept.addEventListener("click", () => {
    try { sessionStorage.setItem(storageKey, "accepted"); } catch {}
    gate.hidden = true;
    document.querySelector("main")?.focus();
  });
})();\n`;

const BASE_CSS = `
.pumpkin-nav{display:flex;flex-wrap:wrap;gap:1rem}
.pumpkin-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
.pumpkin-consent{display:flex;align-items:flex-start;gap:.5rem}
.pumpkin-form-status{display:block;min-height:1.5em;font-weight:600}
.pumpkin-form-status[data-state=error]{color:#991b1b}
.pumpkin-form-status[data-state=success]{color:#166534}
.pumpkin-age-gate{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:1rem;background:rgba(0,0,0,.92);color:#fff}
.pumpkin-age-gate[hidden]{display:none}
.pumpkin-age-gate__panel{max-width:36rem;padding:2rem;border:1px solid currentColor;background:#111}
`.trim();

export class PublisherValidationError extends ContractError {
  constructor(code, message, details = {}) {
    super(code, message, details);
    this.name = 'PublisherValidationError';
  }
}

export function createPrivilegedPlatformOriginVerifier(rawConfiguration) {
  const configuration = normalizePlatformOriginVerifierConfiguration(
    rawConfiguration,
  );
  const verifier = Object.freeze({
    describe() {
      return Object.freeze({
        schemaVersion: configuration.schemaVersion,
        status: configuration.status,
        algorithm: configuration.algorithm,
        keyId: configuration.keyId,
        publicKeySha256: configuration.publicKeySha256,
        verifierConfigurationSha256:
          configuration.verifierConfigurationSha256,
        revocationListId: configuration.revocationListId,
        revokedAuthorityCount: configuration.revokedAuthorityIds.size,
        bootTrustAnchorMatched: true,
        privateKeyMaterialIncluded: false,
      });
    },
  });
  PLATFORM_ORIGIN_VERIFIERS.set(verifier, configuration);
  return verifier;
}

export function publishTenantSnapshot(rawInput, options = {}) {
  const input = normalizePublicationInput(rawInput, options);
  const compatibility = buildCompatibilityReport(input);
  const metadata = buildPublicMetadata(input);
  const files = buildArtifactFiles(input, metadata, compatibility);
  assertDistributableHygiene(files);

  const packageBytes = createDeterministicTar(files);
  const inventory = fileInventory(files);
  const manifest = {
    schemaVersion: ContractVersion.artifactManifest,
    artifactId: input.publication.artifactId,
    tenantUid: input.tenant.tenantUid,
    tenantSlug: input.tenant.tenantSlug,
    snapshotId: input.snapshot.snapshotId,
    publicationId: input.publication.publicationId,
    releaseId: input.productRelease.releaseId,
    publicationMode: input.publication.publicationMode,
    formMode: input.publication.formMode,
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    packageFile: `${safeFileSegment(input.publication.artifactId)}.tar`,
    packageBytes: packageBytes.length,
    packageSha256: sha256(packageBytes),
    fileCount: inventory.length,
    files: inventory,
    routeCount: input.snapshot.pages.length,
    redirectCount: input.snapshot.redirects.length,
    mediaCount: input.snapshot.media.length,
    mediaAliasCount: input.snapshot.mediaAliases.length,
    formCount: input.snapshot.forms.length,
    formsSha256: canonicalDigest(input.snapshot.forms),
    publicFormApiOrigin:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? input.publication.platformOrigin.origin
        : null,
    platformOriginAuthorityReceipt:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? structuredClone(
            input.publication.platformOrigin.authorityReceipt,
          )
        : null,
    platformOriginAuthorityReceiptSha256:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? canonicalDigest(
            input.publication.platformOrigin.authorityReceipt,
          )
        : null,
    attributionFileCount: input.attributionFiles.length,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    compatibilityStatus: compatibility.status,
    fidelityStatus: compatibility.fidelityStatus,
    externalMutableMediaCount: input.snapshot.media.filter(
      (item) => item.verificationState === 'MUTABLE_UNVERIFIED_REFERENCE',
    ).length,
    deterministicInputSha256: canonicalDigest(input),
    liveMutation: false,
    indexingMutation: false,
    credentialValuesIncluded: false,
  };

  return {
    input,
    files: files.map((file) => ({
      path: file.path,
      content: Buffer.isBuffer(file.content) ? Buffer.from(file.content) : String(file.content),
    })),
    packageBytes,
    manifest,
    manifestBytes: Buffer.from(`${stableStringify(manifest)}\n`, 'utf8'),
    compatibility,
  };
}

export function derivePlatformOriginAuthorityScope(rawInput) {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    throw new PublisherValidationError(
      'input_invalid',
      'Publication input must be an object.',
    );
  }
  assertNoForbiddenData(rawInput, 'publication input');
  if (rawInput.schemaVersion !== ContractVersion.publicationInput) {
    throw new PublisherValidationError(
      'schema_version_invalid',
      `schemaVersion must be ${ContractVersion.publicationInput}.`,
    );
  }
  const tenant = normalizeTenant(rawInput.tenant);
  const productRelease = normalizeRelease(rawInput.productRelease);
  const publication = normalizePublication(rawInput.publication, {
    tenant,
    productRelease,
  });
  if (publication.formMode !== FormMode.PUBLIC_FORMS_LIVE) {
    throw new PublisherValidationError(
      'platform_origin_scope_mode_invalid',
      'Platform-origin authority scope applies only to PUBLIC_FORMS_LIVE.',
    );
  }
  const snapshot = normalizeSnapshot(rawInput.snapshot, publication);
  validateCrossReferences(snapshot, publication);
  return immutable({
    apiBaseUrl: publication.apiBaseUrl,
    tenantUid: tenant.tenantUid,
    publicationId: publication.publicationId,
    releaseId: productRelease.releaseId,
    artifactId: publication.artifactId,
    snapshotId: snapshot.snapshotId,
    formsSha256: canonicalDigest(snapshot.forms),
  });
}

export function verifyPlatformOriginAuthorityReceipt(
  authority,
  verifier,
  expectedScope,
) {
  if (
    !expectedScope ||
    typeof expectedScope !== 'object' ||
    Array.isArray(expectedScope)
  ) {
    throw new PublisherValidationError(
      'platform_origin_scope_invalid',
      'Platform-origin receipt verification requires an exact expected scope.',
    );
  }
  const expectedKeys = [
    'apiBaseUrl',
    'tenantUid',
    'publicationId',
    'releaseId',
    'artifactId',
    'snapshotId',
    'formsSha256',
  ];
  if (
    Object.keys(expectedScope).length !== expectedKeys.length ||
    expectedKeys.some(
      (key) =>
        !Object.prototype.hasOwnProperty.call(expectedScope, key),
    )
  ) {
    throw new PublisherValidationError(
      'platform_origin_scope_invalid',
      'Platform-origin receipt expected scope has an invalid shape.',
    );
  }
  return immutable(
    normalizePlatformOriginAuthority(authority, verifier, {
      apiBaseUrl: assertHttpsUrl(
        expectedScope.apiBaseUrl,
        'platformOriginReceipt.apiBaseUrl',
      ),
      tenantUid: assertSafeIdentifier(
        expectedScope.tenantUid,
        'platformOriginReceipt.tenantUid',
      ),
      publicationId: assertSafeIdentifier(
        expectedScope.publicationId,
        'platformOriginReceipt.publicationId',
        { backend: true },
      ),
      releaseId: assertSafeIdentifier(
        expectedScope.releaseId,
        'platformOriginReceipt.releaseId',
      ),
      artifactId: assertSafeIdentifier(
        expectedScope.artifactId,
        'platformOriginReceipt.artifactId',
      ),
      snapshotId: assertSafeIdentifier(
        expectedScope.snapshotId,
        'platformOriginReceipt.snapshotId',
      ),
      formsSha256: assertSha256(
        expectedScope.formsSha256,
        'platformOriginReceipt.formsSha256',
      ),
    }),
  );
}

export function normalizePublicationInput(rawInput, options = {}) {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    throw new PublisherValidationError('input_invalid', 'Publication input must be an object.');
  }
  assertNoForbiddenData(rawInput, 'publication input');
  if (rawInput.schemaVersion !== ContractVersion.publicationInput) {
    throw new PublisherValidationError('schema_version_invalid', `schemaVersion must be ${ContractVersion.publicationInput}.`);
  }

  const tenant = normalizeTenant(rawInput.tenant);
  const productRelease = normalizeRelease(rawInput.productRelease);
  let publication = normalizePublication(rawInput.publication, {
    tenant,
    productRelease,
  });
  const snapshot = normalizeSnapshot(rawInput.snapshot, publication);
  if (publication.formMode === FormMode.PUBLIC_FORMS_LIVE) {
    publication = {
      ...publication,
      platformOrigin: normalizePlatformOriginAuthority(
        options.platformOriginAuthority,
        options.platformOriginVerifier,
        {
          apiBaseUrl: publication.apiBaseUrl,
          tenantUid: tenant.tenantUid,
          publicationId: publication.publicationId,
          releaseId: productRelease.releaseId,
          artifactId: publication.artifactId,
          snapshotId: snapshot.snapshotId,
          formsSha256: canonicalDigest(snapshot.forms),
        },
      ),
    };
  } else if (
    options.platformOriginAuthority ||
    options.platformOriginVerifier
  ) {
    throw new PublisherValidationError(
      'preview_origin_forbidden',
      'PREVIEW_NO_POST cannot carry an API origin or platform-origin authority.',
    );
  }
  const attributionFiles = normalizeAttributionFiles(rawInput.attributionFiles ?? []);
  validateCrossReferences(snapshot, publication);

  return {
    schemaVersion: ContractVersion.publicationInput,
    tenant,
    productRelease,
    publication,
    snapshot,
    attributionFiles,
  };
}

function normalizeAttributionFiles(attributionFiles) {
  if (!Array.isArray(attributionFiles)) {
    throw new PublisherValidationError('attribution_files_invalid', 'attributionFiles must be an array.');
  }
  const seen = new Set();
  return attributionFiles
    .map((item, index) => {
      const label = `attributionFiles[${index}]`;
      const filePath = String(item?.path ?? '');
      if (
        !SUPPORTED_ATTRIBUTION_PATHS.has(filePath) &&
        !THIRD_PARTY_ATTRIBUTION_PATH.test(filePath)
      ) {
        throw new PublisherValidationError(
          'attribution_path_invalid',
          `${label}.path must be a supported root or third-party attribution filename.`,
        );
      }
      if (seen.has(filePath)) {
        throw new PublisherValidationError('attribution_path_collision', `Duplicate attribution path: ${filePath}`);
      }
      seen.add(filePath);
      const content = boundedText(item?.content, `${label}.content`, 2_000_000, { trim: false });
      const expectedSha256 = assertSha256(item?.sha256, `${label}.sha256`);
      const actualSha256 = sha256(Buffer.from(content, 'utf8'));
      if (actualSha256 !== expectedSha256) {
        throw new PublisherValidationError('attribution_hash_mismatch', `${label} content does not match its SHA-256.`);
      }
      return { path: filePath, sha256: actualSha256, content };
    })
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

function normalizeTenant(tenant = {}) {
  return {
    tenantUid: assertSafeIdentifier(tenant.tenantUid, 'tenant.tenantUid'),
    tenantSlug: assertSafeIdentifier(tenant.tenantSlug, 'tenant.tenantSlug', { backend: true }),
    displayName: boundedText(tenant.displayName, 'tenant.displayName', 180),
  };
}

function normalizeRelease(release = {}) {
  const licenseStatus =
    release.licenseStatus ?? LEGAL_DISTRIBUTION_STATE;
  if (!ACCEPTED_RELEASE_LICENSE_STATES.has(licenseStatus)) {
    throw new PublisherValidationError(
      'release_license_status_invalid',
      'productRelease.licenseStatus must be an explicit closed legal-review disposition.',
    );
  }
  const normalized = {
    releaseId: assertSafeIdentifier(release.releaseId, 'productRelease.releaseId'),
    version: boundedText(release.version, 'productRelease.version', 64),
    sourceCommit: assertGitCommitSha(
      release.sourceCommit,
      'productRelease.sourceCommit',
    ),
    lockfileSha256: assertSha256(release.lockfileSha256, 'productRelease.lockfileSha256'),
    packageVersions: normalizeStringMap(release.packageVersions ?? {}, 'productRelease.packageVersions'),
    licenseStatus,
  };
  if (release.sourceRef !== undefined) {
    normalized.sourceRef = assertSafeRelativeReference(release.sourceRef, 'productRelease.sourceRef');
  }
  return normalized;
}

function normalizePublication(
  publication = {},
  { tenant, productRelease },
) {
  const publicationMode = assertEnumValue(PublicationMode, publication.publicationMode, 'publication.publicationMode');
  const formMode = assertEnumValue(FormMode, publication.formMode, 'publication.formMode');
  const publicationId = assertSafeIdentifier(
    publication.publicationId,
    'publication.publicationId',
    { backend: true },
  );
  const artifactId = assertSafeIdentifier(
    publication.artifactId,
    'publication.artifactId',
  );
  if (publicationMode === PublicationMode.PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED) {
    throw new PublisherValidationError(
      'indexing_execution_disabled',
      'Indexable publication remains disabled; owner approval is a future separate gate.',
    );
  }

  let apiBaseUrl = null;
  const platformOrigin = null;
  if (formMode === FormMode.PUBLIC_FORMS_LIVE) {
    apiBaseUrl = assertHttpsUrl(publication.apiBaseUrl, 'publication.apiBaseUrl');
  } else if (publication.apiBaseUrl) {
    throw new PublisherValidationError(
      'preview_origin_forbidden',
      'PREVIEW_NO_POST cannot carry an API origin or platform-origin authority.',
    );
  }

  const ageGate = normalizeAgeGate(publication.ageGate);
  const rollback = publication.rollback
    ? {
        predecessorPublicationId: assertSafeIdentifier(
          publication.rollback.predecessorPublicationId,
          'publication.rollback.predecessorPublicationId',
          { backend: true },
        ),
        predecessorArtifactSha256: assertSha256(
          publication.rollback.predecessorArtifactSha256,
          'publication.rollback.predecessorArtifactSha256',
        ),
      }
    : null;

  return {
    publicationId,
    artifactId,
    publicationMode,
    formMode,
    apiBaseUrl,
    platformOrigin,
    ageGate,
    rollback,
  };
}

function normalizePlatformOriginAuthority(authority, verifier, context) {
  if (!authority || typeof authority !== 'object' || Array.isArray(authority)) {
    throw new PublisherValidationError(
      'platform_origin_authority_required',
      'PUBLIC_FORMS_LIVE requires separate approved platform-origin authority.',
    );
  }
  assertNoForbiddenData(authority, 'platform-origin authority');
  const trustedKey = PLATFORM_ORIGIN_VERIFIERS.get(verifier);
  if (!trustedKey) {
    throw new PublisherValidationError(
      'platform_origin_verifier_unconfigured',
      'PUBLIC_FORMS_LIVE is held until a privileged immutable platform-origin verifier is configured.',
    );
  }
  const allowedKeys = new Set([
    'schemaVersion',
    'authorityId',
    'approvalState',
    'action',
    'origin',
    'tenantUid',
    'publicationId',
    'releaseId',
    'artifactId',
    'snapshotId',
    'formsSha256',
    'issuedAt',
    'expiresAt',
    'revocationState',
    'revocationListId',
    'evidenceRef',
    'keyId',
    'integritySha256',
    'signatureBase64',
  ]);
  if (
    Object.keys(authority).length !== allowedKeys.size ||
    Object.keys(authority).some((key) => !allowedKeys.has(key))
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_shape_invalid',
      'Platform-origin authority fields are invalid.',
    );
  }
  const {
    signatureBase64,
    ...signedBody
  } = structuredClone(authority);
  const { integritySha256, ...body } = signedBody;
  assertSha256(
    integritySha256,
    'platformOriginAuthority.integritySha256',
  );
  if (canonicalDigest(body) !== integritySha256) {
    throw new PublisherValidationError(
      'platform_origin_authority_integrity_invalid',
      'Platform-origin authority integrity is invalid.',
    );
  }
  if (body.keyId !== trustedKey.keyId) {
    throw new PublisherValidationError(
      'platform_origin_authority_key_invalid',
      'Platform-origin authority key does not match the privileged trust configuration.',
    );
  }
  const signature = decodeCanonicalBase64(
    signatureBase64,
    'platformOriginAuthority.signatureBase64',
  );
  if (
    !verifySignature(
      null,
      Buffer.from(stableStringify(signedBody), 'utf8'),
      trustedKey.publicKey,
      signature,
    )
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_signature_invalid',
      'Platform-origin authority signature is not valid under the privileged trust configuration.',
    );
  }
  const origin = assertHttpsUrl(body.origin, 'platformOriginAuthority.origin');
  const parsed = new URL(origin);
  if (origin !== parsed.origin || context.apiBaseUrl !== parsed.origin) {
    throw new PublisherValidationError(
      'platform_origin_authority_origin_invalid',
      'Approved platform origin must be an exact HTTPS origin and match apiBaseUrl.',
    );
  }
  if (
    body.schemaVersion !== 'pumpkin.platform-origin-authority.v1' ||
    body.approvalState !== 'APPROVED' ||
    body.action !== 'USE_PUBLIC_FORM_PLATFORM_ORIGIN' ||
    body.tenantUid !== context.tenantUid ||
    body.publicationId !== context.publicationId ||
    body.releaseId !== context.releaseId ||
    body.artifactId !== context.artifactId ||
    body.snapshotId !== context.snapshotId ||
    body.formsSha256 !== context.formsSha256 ||
    body.revocationState !== 'ACTIVE' ||
    body.revocationListId !== trustedKey.revocationListId
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_scope_invalid',
      'Platform-origin authority is not approved for this tenant/publication/release.',
    );
  }
  const authorityId = assertSafeIdentifier(
    body.authorityId,
    'platformOriginAuthority.authorityId',
  );
  if (trustedKey.revokedAuthorityIds.has(authorityId)) {
    throw new PublisherValidationError(
      'platform_origin_authority_revoked',
      'Platform-origin authority is revoked by the privileged verifier configuration.',
    );
  }
  const issuedAt = normalizeAuthorityTimestamp(
    body.issuedAt,
    'platformOriginAuthority.issuedAt',
  );
  const expiresAt = normalizeAuthorityTimestamp(
    body.expiresAt,
    'platformOriginAuthority.expiresAt',
  );
  const now = Date.now();
  if (
    issuedAt.milliseconds > now ||
    expiresAt.milliseconds <= now ||
    expiresAt.milliseconds <= issuedAt.milliseconds ||
    expiresAt.milliseconds - issuedAt.milliseconds >
      MAX_PLATFORM_ORIGIN_AUTHORITY_VALIDITY_MS
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_time_invalid',
      'Platform-origin authority is not currently valid or exceeds the bounded validity window.',
    );
  }
  return {
    authorityId,
    approvalState: 'APPROVED',
    origin,
    tenantUid: context.tenantUid,
    publicationId: context.publicationId,
    releaseId: context.releaseId,
    artifactId: context.artifactId,
    snapshotId: context.snapshotId,
    formsSha256: assertSha256(
      body.formsSha256,
      'platformOriginAuthority.formsSha256',
    ),
    issuedAt: issuedAt.value,
    expiresAt: expiresAt.value,
    revocationState: 'ACTIVE',
    revocationListId: trustedKey.revocationListId,
    evidenceRef: assertSafeRelativeReference(
      body.evidenceRef,
      'platformOriginAuthority.evidenceRef',
    ),
    keyId: trustedKey.keyId,
    trustedPublicKeySha256: trustedKey.publicKeySha256,
    integritySha256,
    signatureSha256: sha256(signature),
    authorityReceipt: structuredClone(authority),
  };
}

function normalizePlatformOriginVerifierConfiguration(configuration) {
  if (
    !configuration ||
    typeof configuration !== 'object' ||
    Array.isArray(configuration)
  ) {
    throw new PublisherValidationError(
      'platform_origin_verifier_configuration_invalid',
      'Privileged platform-origin verifier configuration must be an object.',
    );
  }
  assertNoForbiddenData(
    configuration,
    'platform-origin verifier configuration',
  );
  const expectedKeys = new Set([
    'schemaVersion',
    'status',
    'algorithm',
    'keyId',
    'publicKeyPem',
    'publicKeySha256',
    'revocationListId',
    'revokedAuthorityIds',
  ]);
  if (
    Object.keys(configuration).length !== expectedKeys.size ||
    Object.keys(configuration).some((key) => !expectedKeys.has(key)) ||
    configuration.schemaVersion !==
      'pumpkin.platform-origin-verifier-config.v1' ||
    configuration.status !== 'ACTIVE' ||
    configuration.algorithm !== 'Ed25519' ||
    !Array.isArray(configuration.revokedAuthorityIds)
  ) {
    throw new PublisherValidationError(
      'platform_origin_verifier_configuration_invalid',
      'Privileged platform-origin verifier configuration is invalid.',
    );
  }
  const verifierConfigurationSha256 = canonicalDigest(configuration);
  if (
    typeof PLATFORM_ORIGIN_BOOT_VERIFIER_SHA256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(PLATFORM_ORIGIN_BOOT_VERIFIER_SHA256)
  ) {
    throw new PublisherValidationError(
      'platform_origin_boot_verifier_unconfigured',
      'Platform-origin verification is held until the complete verifier and revocation snapshot is pinned before process startup.',
    );
  }
  if (
    verifierConfigurationSha256 !==
    PLATFORM_ORIGIN_BOOT_VERIFIER_SHA256
  ) {
    throw new PublisherValidationError(
      'platform_origin_boot_verifier_mismatch',
      'Platform-origin verifier and revocation snapshot do not match the process-start trust anchor.',
    );
  }
  let publicKey;
  let publicKeyDer;
  try {
    publicKey = createPublicKey(configuration.publicKeyPem);
    if (publicKey.asymmetricKeyType !== 'ed25519') throw new Error('wrong key type');
    publicKeyDer = publicKey.export({ format: 'der', type: 'spki' });
  } catch {
    throw new PublisherValidationError(
      'platform_origin_trust_key_invalid',
      'Platform-origin trust must contain a valid Ed25519 public key.',
    );
  }
  const publicKeySha256 = assertSha256(
    configuration.publicKeySha256,
    'platformOriginVerifier.publicKeySha256',
  );
  if (sha256(publicKeyDer) !== publicKeySha256) {
    throw new PublisherValidationError(
      'platform_origin_trust_key_hash_invalid',
      'Platform-origin public key does not match its privileged SHA-256.',
    );
  }
  if (
    typeof PLATFORM_ORIGIN_BOOT_PUBLIC_KEY_SHA256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(PLATFORM_ORIGIN_BOOT_PUBLIC_KEY_SHA256)
  ) {
    throw new PublisherValidationError(
      'platform_origin_boot_trust_anchor_unconfigured',
      'Platform-origin verification is held until a lowercase SHA-256 trust anchor is pinned before process startup.',
    );
  }
  if (publicKeySha256 !== PLATFORM_ORIGIN_BOOT_PUBLIC_KEY_SHA256) {
    throw new PublisherValidationError(
      'platform_origin_boot_trust_anchor_mismatch',
      'Platform-origin verifier key does not match the process-start trust anchor.',
    );
  }
  const revokedAuthorityIds = new Set(
    configuration.revokedAuthorityIds.map((authorityId) =>
      assertSafeIdentifier(
        authorityId,
        'platformOriginVerifier.revokedAuthorityId',
      ),
    ),
  );
  if (revokedAuthorityIds.size !== configuration.revokedAuthorityIds.length) {
    throw new PublisherValidationError(
      'platform_origin_verifier_configuration_invalid',
      'Privileged platform-origin verifier contains duplicate revoked authority IDs.',
    );
  }
  return {
    schemaVersion: configuration.schemaVersion,
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    keyId: assertSafeIdentifier(
      configuration.keyId,
      'platformOriginVerifier.keyId',
    ),
    publicKey,
    publicKeySha256,
    verifierConfigurationSha256,
    revocationListId: assertSafeIdentifier(
      configuration.revocationListId,
      'platformOriginVerifier.revocationListId',
    ),
    revokedAuthorityIds,
  };
}

function normalizeAuthorityTimestamp(value, label) {
  if (typeof value !== 'string') {
    throw new PublisherValidationError(
      'platform_origin_authority_time_invalid',
      `${label} must be a canonical UTC timestamp.`,
    );
  }
  const milliseconds = Date.parse(value);
  if (
    !Number.isFinite(milliseconds) ||
    new Date(milliseconds).toISOString() !== value
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_time_invalid',
      `${label} must be a canonical UTC timestamp.`,
    );
  }
  return { value, milliseconds };
}

function decodeCanonicalBase64(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(value)
  ) {
    throw new PublisherValidationError(
      'platform_origin_authority_signature_invalid',
      `${label} must be canonical base64.`,
    );
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) {
    throw new PublisherValidationError(
      'platform_origin_authority_signature_invalid',
      `${label} must be canonical base64.`,
    );
  }
  return bytes;
}

function normalizeAgeGate(ageGate) {
  if (!ageGate || ageGate.enabled !== true) {
    return { enabled: false, minimumAge: null, title: null, statement: null };
  }
  const minimumAge = Number(ageGate.minimumAge);
  if (!Number.isInteger(minimumAge) || minimumAge < 13 || minimumAge > 99) {
    throw new PublisherValidationError('age_gate_invalid', 'Age gate minimumAge must be an integer from 13 through 99.');
  }
  return {
    enabled: true,
    minimumAge,
    title: boundedText(ageGate.title ?? 'Age verification', 'publication.ageGate.title', 120),
    statement: boundedText(
      ageGate.statement ?? `You must be at least ${minimumAge} years old to continue.`,
      'publication.ageGate.statement',
      300,
    ),
  };
}

function normalizeSnapshot(snapshot = {}, publication) {
  const themes = normalizeThemes(snapshot.themes);
  const themeIds = new Set(themes.map((theme) => theme.themeId));
  const forms = normalizeForms(snapshot.forms ?? []);
  const formIds = new Set(forms.map((form) => form.formId));
  const media = normalizeMedia(snapshot.media ?? []);
  const mediaById = new Map(media.map((item) => [item.mediaId, item]));
  const mediaAliases = normalizeMediaAliases(snapshot.mediaAliases ?? [], mediaById);
  const mediaRefs = new Set([...mediaById.keys(), ...mediaAliases.map((alias) => alias.alias)]);
  const pages = normalizePages(snapshot.pages, themeIds, formIds, mediaRefs);
  const pageRoutes = new Set(pages.map((page) => page.route));
  const redirects = normalizeRedirects(snapshot.redirects ?? [], pageRoutes);
  const navigation = normalizeNavigation(snapshot.navigation ?? [], pageRoutes);

  if (publication.formMode === FormMode.PUBLIC_FORMS_LIVE && forms.length === 0) {
    throw new PublisherValidationError('live_forms_missing', 'PUBLIC_FORMS_LIVE requires at least one form.');
  }

  return {
    snapshotId: assertSafeIdentifier(snapshot.snapshotId, 'snapshot.snapshotId'),
    pages,
    navigation,
    themes,
    media,
    mediaAliases,
    redirects,
    forms,
  };
}

function normalizeThemes(themes) {
  if (!Array.isArray(themes) || themes.length === 0) {
    throw new PublisherValidationError('themes_missing', 'snapshot.themes requires at least one theme.');
  }
  const seenIds = new Set();
  const seenPaths = new Set();
  return themes.map((theme, index) => {
    const themeId = assertSafeIdentifier(theme.themeId, `snapshot.themes[${index}].themeId`);
    if (seenIds.has(themeId)) throw new PublisherValidationError('theme_id_collision', `Duplicate theme ID: ${themeId}`);
    seenIds.add(themeId);
    const outputPath = `assets/themes/${safeFileSegment(themeId)}.css`;
    if (seenPaths.has(outputPath)) throw new PublisherValidationError('theme_path_collision', `Theme output collision: ${outputPath}`);
    seenPaths.add(outputPath);
    const css = boundedText(theme.css, `snapshot.themes[${index}].css`, 1_000_000, { trim: false });
    assertClosedResourceCss(css, themeId);
    return { themeId, outputPath, css, cssSha256: sha256(Buffer.from(css, 'utf8')) };
  });
}

const ALLOWED_CLOSED_RESOURCE_AT_RULES = new Set([
  '-webkit-keyframes',
  'charset',
  'container',
  'keyframes',
  'layer',
  'media',
  'page',
  'property',
  'scope',
  'starting-style',
  'supports',
]);
const FORBIDDEN_RESOURCE_FUNCTIONS = new Set([
  '-moz-element',
  '-webkit-image-set',
  'cross-fade',
  'element',
  'expression',
  'image',
  'image-set',
  'paint',
  'src',
  'url',
]);
const FORBIDDEN_RESOURCE_PROPERTIES = new Set([
  '-moz-binding',
  'behavior',
  'src',
]);

function assertClosedResourceCss(css, themeId) {
  const reject = () => {
    throw new PublisherValidationError(
      'theme_external_dependency_forbidden',
      `${themeId} contains a build-time directive or mutable resource-bearing CSS construct that cannot establish immutable fidelity.`,
    );
  };
  const preflight = decodeCssEscapes(stripCssComments(css), reject);
  if (
    /@(?:apply|font-face|import|namespace|tailwind)\b/i.test(preflight) ||
    /(?:^|[^a-z0-9_-])(?:-moz-element|-webkit-image-set|cross-fade|element|expression|image|image-set|paint|src|url)\s*\(/i.test(
      preflight,
    ) ||
    /(?:https?|data|blob|file|ftp)\s*:|\/\//i.test(preflight)
  ) {
    reject();
  }

  let root;
  try {
    root = postcss.parse(css, { from: undefined });
  } catch {
    throw new PublisherValidationError(
      'theme_css_invalid',
      `${themeId} must contain valid browser CSS.`,
    );
  }
  const inspectValue = (value) => {
    const decodedValue = decodeCssEscapes(
      stripCssComments(String(value)),
      reject,
    );
    if (
      /(?:https?|data|blob|file|ftp)\s*:|\/\//i.test(decodedValue)
    ) {
      reject();
    }
    let parsed;
    try {
      parsed = parseCssValue(decodedValue);
    } catch {
      reject();
    }
    parsed.walk((node) => {
      if (
        node.type === 'function' &&
        FORBIDDEN_RESOURCE_FUNCTIONS.has(
          decodeCssEscapes(node.value, reject).toLowerCase(),
        )
      ) {
        reject();
      }
    });
  };

  root.walkAtRules((rule) => {
    const name = decodeCssEscapes(rule.name, reject).toLowerCase();
    if (!ALLOWED_CLOSED_RESOURCE_AT_RULES.has(name)) reject();
    inspectValue(rule.params);
  });
  root.walkDecls((declaration) => {
    const property = decodeCssEscapes(
      declaration.prop,
      reject,
    ).toLowerCase();
    if (FORBIDDEN_RESOURCE_PROPERTIES.has(property)) reject();
    inspectValue(declaration.value);
  });
}

function stripCssComments(value) {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '/' || value[index + 1] !== '*') {
      result += value[index];
      continue;
    }
    const end = value.indexOf('*/', index + 2);
    if (end === -1) return `${result}\0`;
    index = end + 1;
  }
  return result;
}

function decodeCssEscapes(value, reject) {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '\0') reject();
    if (character !== '\\') {
      result += character;
      continue;
    }
    if (index + 1 >= value.length) reject();
    const next = value[index + 1];
    if (next === '\n' || next === '\r' || next === '\f') reject();
    const remaining = value.slice(index + 1);
    const hexadecimal = /^[0-9a-f]{1,6}/i.exec(remaining)?.[0] ?? null;
    if (!hexadecimal) {
      result += next;
      index += 1;
      continue;
    }
    const codePoint = Number.parseInt(hexadecimal, 16);
    if (
      codePoint === 0 ||
      codePoint > 0x10ffff ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    ) {
      reject();
    }
    result += String.fromCodePoint(codePoint);
    index += hexadecimal.length;
    if (/\s/.test(value[index + 1] ?? '')) {
      if (
        value[index + 1] === '\r' &&
        value[index + 2] === '\n'
      ) {
        index += 2;
      } else {
        index += 1;
      }
    }
  }
  return result;
}

function normalizePages(pages, themeIds, formIds, mediaRefs) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new PublisherValidationError('pages_missing', 'snapshot.pages requires at least one page.');
  }
  const seenRoutes = new Set();
  const seenFiles = new Set();
  const seenPageIds = new Set();
  return pages.map((page, index) => {
    const label = `snapshot.pages[${index}]`;
    const route = normalizeRoute(page.route, `${label}.route`);
    if (isReservedRoute(route)) {
      throw new PublisherValidationError('route_reserved', `Page route is reserved by the artifact: ${route}`);
    }
    if (seenRoutes.has(route)) throw new PublisherValidationError('route_collision', `Duplicate page route: ${route}`);
    seenRoutes.add(route);
    const outputPath = routeToArtifactPath(route);
    if (seenFiles.has(outputPath)) throw new PublisherValidationError('route_file_collision', `Duplicate route file: ${outputPath}`);
    seenFiles.add(outputPath);

    const pageId = assertSafeIdentifier(page.pageId, `${label}.pageId`);
    if (seenPageIds.has(pageId)) throw new PublisherValidationError('page_id_collision', `Duplicate page ID: ${pageId}`);
    seenPageIds.add(pageId);
    const revisionId = assertSafeIdentifier(page.revisionId, `${label}.revisionId`);
    const themeId = assertSafeIdentifier(page.themeId, `${label}.themeId`);
    if (!themeIds.has(themeId)) throw new PublisherValidationError('theme_reference_missing', `${label} references missing theme ${themeId}.`);

    if (!Array.isArray(page.blocks)) throw new PublisherValidationError('blocks_invalid', `${label}.blocks must be an array.`);
    const blocks = page.blocks.map((block, blockIndex) => normalizeBlock(block, `${label}.blocks[${blockIndex}]`, mediaRefs));
    const pageFormIds = uniqueStrings(page.formIds ?? [], `${label}.formIds`);
    for (const formId of pageFormIds) {
      if (!formIds.has(formId)) throw new PublisherValidationError('form_reference_missing', `${label} references missing form ${formId}.`);
    }

    return {
      pageId,
      revisionId,
      route,
      outputPath,
      title: boundedText(page.title, `${label}.title`, 180),
      description: boundedText(page.description ?? '', `${label}.description`, 320, { allowEmpty: true }),
      themeId,
      blocks,
      formIds: pageFormIds,
      includeInSitemap: page.includeInSitemap === true,
    };
  });
}

function normalizeBlock(block = {}, label, mediaRefs) {
  if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
    throw new PublisherValidationError('unknown_block_type', `${label} uses unsupported block type ${String(block.type)}.`);
  }
  const normalized = {
    type: block.type,
    heading: boundedText(block.heading ?? '', `${label}.heading`, 240, { allowEmpty: true }),
    body: boundedText(block.body ?? '', `${label}.body`, 8_000, { allowEmpty: true }),
  };
  if (block.mediaRef !== undefined) {
    normalized.mediaRef = assertSafeRelativeOrIdentifier(block.mediaRef, `${label}.mediaRef`);
    if (!mediaRefs.has(normalized.mediaRef)) {
      throw new PublisherValidationError('media_reference_missing', `${label} references missing media ${normalized.mediaRef}.`);
    }
  }
  if (block.type === 'image') {
    if (!normalized.mediaRef) throw new PublisherValidationError('image_media_missing', `${label}.mediaRef is required.`);
    normalized.alt = boundedText(block.alt, `${label}.alt`, 300);
  } else if (!normalized.heading && !normalized.body) {
    throw new PublisherValidationError('block_content_missing', `${label} requires heading or body text.`);
  }
  return normalized;
}

function normalizeNavigation(navigation, pageRoutes) {
  if (!Array.isArray(navigation)) throw new PublisherValidationError('navigation_invalid', 'snapshot.navigation must be an array.');
  return navigation.map((item, index) => {
    const href = String(item.href ?? '');
    let normalizedHref;
    if (href.startsWith('/')) {
      normalizedHref = normalizeRoute(href, `snapshot.navigation[${index}].href`);
      if (!pageRoutes.has(normalizedHref)) {
        throw new PublisherValidationError('navigation_route_missing', `Navigation references missing route ${normalizedHref}.`);
      }
    } else {
      normalizedHref = assertHttpsUrl(href, `snapshot.navigation[${index}].href`);
    }
    return {
      label: boundedText(item.label, `snapshot.navigation[${index}].label`, 120),
      href: normalizedHref,
    };
  });
}

function normalizeMedia(media) {
  if (!Array.isArray(media)) throw new PublisherValidationError('media_invalid', 'snapshot.media must be an array.');
  const seenIds = new Set();
  const seenPaths = new Set();
  const seenHashes = new Set();
  return media.map((item, index) => {
    const label = `snapshot.media[${index}]`;
    const mediaId = assertSafeIdentifier(item.mediaId, `${label}.mediaId`);
    if (seenIds.has(mediaId)) throw new PublisherValidationError('media_id_collision', `Duplicate media ID: ${mediaId}`);
    seenIds.add(mediaId);
    const mimeType = boundedText(item.mimeType, `${label}.mimeType`, 100);
    const embeddedFormat = EMBEDDED_MEDIA_FORMATS[mimeType];
    if (!embeddedFormat) {
      throw new PublisherValidationError('media_type_unsupported', `${label}.mimeType is not supported.`);
    }

    let outputPath = null;
    let contentBase64 = null;
    let publicUrl = null;
    let digest = null;
    let verificationState = null;
    if (item.contentBase64 !== undefined) {
      digest = assertSha256(item.sha256, `${label}.sha256`);
      if (typeof item.contentBase64 !== 'string' || item.contentBase64.length === 0) {
        throw new PublisherValidationError('media_content_invalid', `${label}.contentBase64 is invalid.`);
      }
      const content = Buffer.from(item.contentBase64, 'base64');
      if (content.length === 0 || content.toString('base64').replace(/=+$/, '') !== item.contentBase64.replace(/=+$/, '')) {
        throw new PublisherValidationError('media_content_invalid', `${label}.contentBase64 is not canonical base64.`);
      }
      if (sha256(content) !== digest) {
        throw new PublisherValidationError('media_hash_mismatch', `${label}.contentBase64 does not match sha256.`);
      }
      outputPath = assertSafeArtifactPath(item.outputPath, `${label}.outputPath`);
      if (!outputPath.startsWith('assets/media/')) {
        throw new PublisherValidationError('media_path_scope_invalid', `${label}.outputPath must be under assets/media/.`);
      }
      const extension = outputPath
        .slice(outputPath.lastIndexOf('.'))
        .toLowerCase();
      if (!embeddedFormat.extensions.includes(extension)) {
        throw new PublisherValidationError(
          'media_extension_mismatch',
          `${label}.outputPath extension does not match its closed MIME contract.`,
        );
      }
      if (!embeddedFormat.matches(content)) {
        throw new PublisherValidationError(
          'media_signature_mismatch',
          `${label}.contentBase64 does not match the declared MIME magic bytes.`,
        );
      }
      if (seenPaths.has(outputPath)) throw new PublisherValidationError('media_path_collision', `Duplicate media output path: ${outputPath}`);
      seenPaths.add(outputPath);
      contentBase64 = item.contentBase64;
      verificationState = 'EMBEDDED_SHA256_VERIFIED';
    } else if (item.publicUrl !== undefined) {
      if (item.sha256 !== undefined) {
        throw new PublisherValidationError(
          'external_media_digest_forbidden',
          `${label}.sha256 cannot imply verification for mutable external media.`,
        );
      }
      if (item.referenceClassification !== 'MUTABLE_UNVERIFIED_REFERENCE') {
        throw new PublisherValidationError(
          'external_media_classification_required',
          `${label} must explicitly declare MUTABLE_UNVERIFIED_REFERENCE.`,
        );
      }
      publicUrl = assertHttpsUrl(item.publicUrl, `${label}.publicUrl`);
      verificationState = 'MUTABLE_UNVERIFIED_REFERENCE';
    } else {
      throw new PublisherValidationError('media_source_missing', `${label} requires contentBase64 or publicUrl.`);
    }
    if (seenHashes.has(digest) && contentBase64) {
      throw new PublisherValidationError('canonical_media_hash_collision', `Duplicate packaged canonical media hash: ${digest}`);
    }
    if (contentBase64) seenHashes.add(digest);
    return {
      mediaId,
      sha256: digest,
      mimeType,
      outputPath,
      contentBase64,
      publicUrl,
      verificationState,
    };
  });
}

function normalizeMediaAliases(aliases, mediaById) {
  if (!Array.isArray(aliases)) throw new PublisherValidationError('media_aliases_invalid', 'snapshot.mediaAliases must be an array.');
  const seen = new Set();
  return aliases.map((item, index) => {
    const alias = assertSafeRelativeReference(item.alias, `snapshot.mediaAliases[${index}].alias`);
    if (seen.has(alias)) throw new PublisherValidationError('media_alias_collision', `Duplicate media alias: ${alias}`);
    if (mediaById.has(alias)) {
      throw new PublisherValidationError(
        'media_alias_canonical_id_collision',
        `Media alias ${alias} collides with a canonical media ID.`,
      );
    }
    seen.add(alias);
    const mediaId = assertSafeIdentifier(item.mediaId, `snapshot.mediaAliases[${index}].mediaId`);
    if (!mediaById.has(mediaId)) {
      throw new PublisherValidationError('media_alias_target_missing', `Media alias ${alias} references missing media ${mediaId}.`);
    }
    return { alias, mediaId };
  });
}

function normalizeRedirects(redirects, pageRoutes) {
  if (!Array.isArray(redirects)) throw new PublisherValidationError('redirects_invalid', 'snapshot.redirects must be an array.');
  const seen = new Set();
  const normalized = redirects.map((redirect, index) => {
    const from = normalizeRoute(redirect.from, `snapshot.redirects[${index}].from`);
    const to = normalizeRoute(redirect.to, `snapshot.redirects[${index}].to`);
    if (from === to) throw new PublisherValidationError('redirect_loop', `Redirect points to itself: ${from}`);
    if (pageRoutes.has(from)) throw new PublisherValidationError('route_redirect_collision', `Redirect source collides with page route: ${from}`);
    if (isReservedRoute(from)) throw new PublisherValidationError('redirect_reserved', `Redirect source is reserved: ${from}`);
    if (seen.has(from)) throw new PublisherValidationError('redirect_source_collision', `Duplicate redirect source: ${from}`);
    seen.add(from);
    if (!pageRoutes.has(to)) {
      throw new PublisherValidationError('redirect_target_missing', `Redirect target is not a published page route: ${to}`);
    }
    const status = Number(redirect.status);
    if (!SUPPORTED_REDIRECT_STATUS.has(status)) {
      throw new PublisherValidationError('redirect_status_invalid', `Redirect status is unsupported: ${status}`);
    }
    return { from, to, status, preserveQueryString: redirect.preserveQueryString !== false };
  });
  return normalized.sort((left, right) => left.from.localeCompare(right.from, 'en'));
}

function normalizeForms(forms) {
  if (!Array.isArray(forms)) throw new PublisherValidationError('forms_invalid', 'snapshot.forms must be an array.');
  const seenIds = new Set();
  const seenMappings = new Set();
  return forms.map((form, index) => {
    const label = `snapshot.forms[${index}]`;
    const formId = assertSafeIdentifier(form.formId, `${label}.formId`);
    const formMappingId = assertSafeIdentifier(form.formMappingId, `${label}.formMappingId`, { backend: true });
    if (seenIds.has(formId)) throw new PublisherValidationError('form_id_collision', `Duplicate form ID: ${formId}`);
    if (seenMappings.has(formMappingId)) {
      throw new PublisherValidationError('form_mapping_collision', `Duplicate form mapping ID: ${formMappingId}`);
    }
    seenIds.add(formId);
    seenMappings.add(formMappingId);
    if (!Array.isArray(form.fields) || form.fields.length === 0) {
      throw new PublisherValidationError('form_fields_missing', `${label}.fields requires at least one field.`);
    }
    const seenFields = new Set();
    const fields = form.fields.map((field, fieldIndex) => {
      const fieldLabel = `${label}.fields[${fieldIndex}]`;
      const name = normalizeFieldName(field.name, `${fieldLabel}.name`);
      if (seenFields.has(name)) throw new PublisherValidationError('form_field_collision', `Duplicate form field: ${name}`);
      seenFields.add(name);
      if (!SUPPORTED_FIELD_TYPES.has(field.type)) {
        throw new PublisherValidationError('form_field_type_invalid', `${fieldLabel}.type is unsupported.`);
      }
      const normalizedField = {
        name,
        label: boundedText(field.label, `${fieldLabel}.label`, 180),
        type: field.type,
        required: field.required === true,
        autocomplete: boundedText(field.autocomplete ?? '', `${fieldLabel}.autocomplete`, 80, { allowEmpty: true }),
      };
      if (field.type === 'select') {
        normalizedField.options = uniqueStrings(field.options ?? [], `${fieldLabel}.options`).map((option) =>
          boundedText(option, `${fieldLabel}.options`, 120),
        );
        if (normalizedField.options.length === 0) {
          throw new PublisherValidationError('select_options_missing', `${fieldLabel}.options requires at least one value.`);
        }
      }
      return normalizedField;
    });
    const consent = {
      name: normalizeFieldName(form.consent?.name, `${label}.consent.name`),
      label: boundedText(form.consent?.label, `${label}.consent.label`, 300),
    };
    const honeypot = {
      name: normalizeFieldName(form.honeypot?.name, `${label}.honeypot.name`),
      label: boundedText(form.honeypot?.label, `${label}.honeypot.label`, 180),
    };
    if (seenFields.has(consent.name) || seenFields.has(honeypot.name) || consent.name === honeypot.name) {
      throw new PublisherValidationError('form_control_collision', `${label} has colliding data, consent, or honeypot fields.`);
    }
    return {
      formId,
      formMappingId,
      formKey: assertSafeIdentifier(form.formKey ?? formId, `${label}.formKey`),
      fieldContractVersion: assertSafeIdentifier(form.fieldContractVersion, `${label}.fieldContractVersion`),
      submitLabel: boundedText(form.submitLabel, `${label}.submitLabel`, 120),
      fields,
      consent,
      honeypot,
    };
  });
}

function validateCrossReferences(snapshot, publication) {
  const pageRoutes = new Set(snapshot.pages.map((page) => page.route));
  if (!pageRoutes.has('/')) {
    throw new PublisherValidationError('root_route_missing', 'A static publication must include the root route.');
  }
}

function buildCompatibilityReport(input) {
  const warnings = [];
  const suppressedSitemapRoutes = input.snapshot.pages.filter((page) => page.includeInSitemap).map((page) => page.route);
  if (suppressedSitemapRoutes.length > 0) {
    warnings.push({
      code: 'sitemap_suppressed_by_noindex',
      routes: suppressedSitemapRoutes,
      message: 'Page sitemap intent was suppressed because this artifact is non-indexable.',
    });
  }
  if (input.publication.formMode === FormMode.PREVIEW_NO_POST && input.snapshot.forms.length > 0) {
    warnings.push({
      code: 'form_transport_suppressed',
      formIds: input.snapshot.forms.map((form) => form.formId),
      message: 'Forms render accessibly but contain no POST capability in PREVIEW_NO_POST mode.',
    });
  }
  const externalMedia = input.snapshot.media.filter((item) => item.publicUrl).map((item) => item.mediaId);
  if (externalMedia.length > 0) {
    warnings.push({
      code: 'mutable_unverified_external_media',
      mediaIds: externalMedia,
      classification: 'MUTABLE_UNVERIFIED_REFERENCE',
      message:
        'External HTTPS media is mutable, unverified, not embedded, and cannot establish customer-fidelity completeness.',
    });
  }
  return {
    schemaVersion: 'pumpkin.tenant-publication-compatibility.v1',
    status:
      externalMedia.length > 0
        ? 'compatible_with_mutable_unverified_references'
        : 'compatible',
    fidelityStatus:
      externalMedia.length > 0
        ? 'INCOMPLETE_EXTERNAL_MEDIA_UNVERIFIED'
        : 'PACKAGE_CONTENT_VERIFIED',
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    unknownBlocks: [],
    warnings,
    blockers: [],
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
  };
}

function buildPublicMetadata(input) {
  const live = input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE;
  return {
    schemaVersion: 'pumpkin.tenant-publication-public-metadata.v1',
    tenantUid: input.tenant.tenantUid,
    publicationId: input.publication.publicationId,
    releaseId: input.productRelease.releaseId,
    snapshotId: input.snapshot.snapshotId,
    publicationMode: input.publication.publicationMode,
    formMode: input.publication.formMode,
    indexingState: {
      mode: 'disabled',
      robots: 'noindex,nofollow,noarchive',
      includeInSitemap: false,
    },
    ageGate: input.publication.ageGate,
    ...(live ? { apiBaseUrl: input.publication.apiBaseUrl } : {}),
    ...(live
      ? {
          platformOriginAuthority: {
            authorityId: input.publication.platformOrigin.authorityId,
            integritySha256:
              input.publication.platformOrigin.integritySha256,
            tenantUid: input.publication.platformOrigin.tenantUid,
            publicationId:
              input.publication.platformOrigin.publicationId,
            releaseId: input.publication.platformOrigin.releaseId,
            artifactId: input.publication.platformOrigin.artifactId,
            snapshotId: input.publication.platformOrigin.snapshotId,
            formsSha256: input.publication.platformOrigin.formsSha256,
            issuedAt: input.publication.platformOrigin.issuedAt,
            expiresAt: input.publication.platformOrigin.expiresAt,
            revocationState:
              input.publication.platformOrigin.revocationState,
            revocationListId:
              input.publication.platformOrigin.revocationListId,
            keyId: input.publication.platformOrigin.keyId,
            trustedPublicKeySha256:
              input.publication.platformOrigin.trustedPublicKeySha256,
            signatureSha256:
              input.publication.platformOrigin.signatureSha256,
          },
        }
      : {}),
    publicFormMappings: Object.fromEntries(
      input.snapshot.forms.map((form) => [
        form.formId,
        {
          formId: form.formId,
          formMappingId: form.formMappingId,
          formKey: form.formKey,
          fieldContractVersion: form.fieldContractVersion,
          fields: form.fields.map(({ name, type, required }) => ({ name, type, required })),
          consentField: form.consent.name,
          honeypotField: form.honeypot.name,
          ...(live
            ? {
                preflightPath: publicFormPath(input.publication.publicationId, form.formMappingId, 'preflight'),
                submitPath: publicFormPath(input.publication.publicationId, form.formMappingId, 'submit'),
              }
            : {}),
        },
      ]),
    ),
  };
}

function buildArtifactFiles(input, metadata, compatibility) {
  const themeById = new Map(input.snapshot.themes.map((theme) => [theme.themeId, theme]));
  const formById = new Map(input.snapshot.forms.map((form) => [form.formId, form]));
  const mediaById = new Map(input.snapshot.media.map((media) => [media.mediaId, media]));
  const aliasToId = new Map(input.snapshot.mediaAliases.map((alias) => [alias.alias, alias.mediaId]));
  const mediaResolver = (reference) => {
    const mediaId = mediaById.has(reference) ? reference : aliasToId.get(reference);
    const media = mediaById.get(mediaId);
    if (!media) throw new PublisherValidationError('media_reference_missing', `Missing media reference ${reference}.`);
    return media.outputPath ? `/${media.outputPath}` : media.publicUrl;
  };

  const routeInventory = {
    schemaVersion: 'pumpkin.route-inventory.v1',
    routes: input.snapshot.pages.map((page) => ({
      pageId: page.pageId,
      revisionId: page.revisionId,
      route: page.route,
      outputPath: page.outputPath,
      themeId: page.themeId,
      formIds: page.formIds,
    })),
  };
  const redirectInventory = {
    schemaVersion: 'pumpkin.redirect-inventory.v1',
    redirects: input.snapshot.redirects,
  };
  const mediaInventory = {
    schemaVersion: 'pumpkin.media-inventory.v1',
    canonical: input.snapshot.media.map(({ mediaId, sha256, mimeType, outputPath, publicUrl, verificationState }) => ({
      mediaId,
      sha256,
      mimeType,
      outputPath,
      publicUrl,
      verificationState,
    })),
    aliases: input.snapshot.mediaAliases,
  };
  const formInventory = {
    schemaVersion: 'pumpkin.form-inventory.v1',
    formMode: input.publication.formMode,
    forms: input.snapshot.forms.map((form) => ({
      formId: form.formId,
      formMappingId: form.formMappingId,
      formKey: form.formKey,
      fieldContractVersion: form.fieldContractVersion,
      fields: form.fields.map(({ name, type, required }) => ({ name, type, required })),
      consentField: form.consent.name,
      honeypotField: form.honeypot.name,
    })),
  };
  const tenantManifest = {
    ...metadata,
    artifactId: input.publication.artifactId,
    tenantSlug: input.tenant.tenantSlug,
    displayName: input.tenant.displayName,
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    releaseVersion: input.productRelease.version,
    lockfileSha256: input.productRelease.lockfileSha256,
    routeCount: input.snapshot.pages.length,
    redirectCount: input.snapshot.redirects.length,
    mediaCount: input.snapshot.media.length,
    mediaAliasCount: input.snapshot.mediaAliases.length,
    formCount: input.snapshot.forms.length,
    externalMutableMediaCount: input.snapshot.media.filter(
      (item) => item.verificationState === 'MUTABLE_UNVERIFIED_REFERENCE',
    ).length,
    fidelityStatus: compatibility.fidelityStatus,
    attributionFiles: input.attributionFiles.map(({ path, sha256 }) => ({ path, sha256 })),
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    rollback: input.publication.rollback,
    credentialValuesIncluded: false,
    liveMutation: false,
  };
  const staticWebAppConfig = {
    globalHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin',
      'X-Robots-Tag': 'noindex,nofollow,noarchive',
    },
    routes: [
      ...input.snapshot.redirects.map((redirect) => ({
        route: redirect.from,
        redirect: redirect.to,
        statusCode: redirect.status,
      })),
      { route: '/assets/*', headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      { route: '/robots.txt', headers: { 'cache-control': 'no-store' } },
      { route: '/sitemap.xml', headers: { 'cache-control': 'no-store' } },
    ],
    responseOverrides: { 404: { rewrite: '/404.html' } },
    navigationFallback: {
      rewrite: '/404.html',
      exclude: ['/assets/*', '/robots.txt', '/sitemap.xml', '/*.json'],
    },
  };

  const files = [
    ...input.attributionFiles.map(({ path: filePath, content }) => ({
      path: filePath,
      content,
    })),
    ...input.snapshot.themes.map((theme) => ({
      path: theme.outputPath,
      content: `${theme.css.trimEnd()}\n${BASE_CSS}\n`,
    })),
    ...input.snapshot.media
      .filter((media) => media.contentBase64)
      .map((media) => ({ path: media.outputPath, content: Buffer.from(media.contentBase64, 'base64') })),
    ...(input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
      ? [{ path: 'assets/public-form-client.js', content: PUBLIC_FORM_CLIENT }]
      : []),
    ...(input.publication.ageGate.enabled ? [{ path: 'assets/age-gate.js', content: AGE_GATE_CLIENT }] : []),
    ...input.snapshot.pages.map((page) => ({
      path: page.outputPath,
      content: renderPage(input, page, metadata, themeById.get(page.themeId), formById, mediaResolver),
    })),
    {
      path: '404.html',
      content: renderShell(input, metadata, {
        title: 'Not found',
        description: 'This route is not published.',
        themePath: input.snapshot.themes[0].outputPath,
        body: '<h1>Not found</h1><p>This route is not published.</p>',
      }),
    },
    { path: 'robots.txt', content: 'User-agent: *\nDisallow: /\n' },
    {
      path: 'sitemap.xml',
      content:
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- Intentionally empty while indexing is disabled. --></urlset>\n',
    },
    { path: 'staticwebapp.config.json', content: `${stableStringify(staticWebAppConfig)}\n` },
    { path: 'tenant-manifest.json', content: `${stableStringify(tenantManifest)}\n` },
    { path: 'route-inventory.json', content: `${stableStringify(routeInventory)}\n` },
    { path: 'redirect-inventory.json', content: `${stableStringify(redirectInventory)}\n` },
    { path: 'media-inventory.json', content: `${stableStringify(mediaInventory)}\n` },
    { path: 'form-inventory.json', content: `${stableStringify(formInventory)}\n` },
    { path: 'compatibility-report.json', content: `${stableStringify(compatibility)}\n` },
    {
      path: 'README.txt',
      content:
        'Deterministic Pumpkin tenant publication artifact.\n' +
        'No credential value, customer payload, raw log, live mutation authority, or indexing authorization is included.\n',
    },
  ];

  for (const file of files) assertSafeArtifactPath(file.path);
  const baseInventory = fileInventory(files);
  const publicationManifest = {
    schemaVersion: ContractVersion.artifactManifest,
    artifactId: input.publication.artifactId,
    tenantUid: input.tenant.tenantUid,
    publicationId: input.publication.publicationId,
    releaseId: input.productRelease.releaseId,
    snapshotId: input.snapshot.snapshotId,
    formMode: input.publication.formMode,
    formsSha256: canonicalDigest(input.snapshot.forms),
    publicFormApiOrigin:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? input.publication.platformOrigin.origin
        : null,
    platformOriginAuthorityReceipt:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? structuredClone(
            input.publication.platformOrigin.authorityReceipt,
          )
        : null,
    platformOriginAuthorityReceiptSha256:
      input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
        ? canonicalDigest(
            input.publication.platformOrigin.authorityReceipt,
          )
        : null,
    attributionFiles: input.attributionFiles.map(({ path, sha256 }) => ({ path, sha256 })),
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    deterministicInputSha256: canonicalDigest(input),
    contentFiles: baseInventory,
    selfExcludedFromContentFiles: true,
  };
  files.push({ path: 'publication-manifest.json', content: `${stableStringify(publicationManifest)}\n` });
  return files.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

function renderPage(input, page, metadata, theme, formById, mediaResolver) {
  const body = [
    `<h1>${escapeHtml(page.title)}</h1>`,
    ...page.blocks.map((block) => renderBlock(block, mediaResolver)),
    ...page.formIds.map((formId) => renderForm(input, formById.get(formId))),
  ].join('\n');
  return renderShell(input, metadata, {
    title: page.title,
    description: page.description,
    themePath: theme.outputPath,
    body,
  });
}

function renderShell(input, metadata, { title, description, themePath, body }) {
  const nav = input.snapshot.navigation.length
    ? `<nav class="pumpkin-nav" aria-label="Primary">${input.snapshot.navigation
        .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
        .join('')}</nav>`
    : '';
  const ageGate = input.publication.ageGate.enabled ? renderAgeGate(input) : '';
  const formClient =
    input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE
      ? '\n  <script src="/assets/public-form-client.js" defer></script>'
      : '';
  const ageGateClient = input.publication.ageGate.enabled
    ? '\n  <script src="/assets/age-gate.js" defer></script>'
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/${escapeHtml(themePath)}">
  <script type="application/json" data-pumpkin-public-metadata>${escapeJsonForHtml(stableStringify(metadata))}</script>${formClient}${ageGateClient}
</head>
<body data-publication-mode="${escapeHtml(input.publication.publicationMode)}" data-form-mode="${escapeHtml(input.publication.formMode)}">
  <header>${nav}</header>
  <main tabindex="-1">
${indent(body, 4)}
  </main>
${indent(ageGate, 2)}
</body>
</html>
`;
}

function renderBlock(block, mediaResolver) {
  if (block.type === 'image') {
    return `<figure><img src="${escapeHtml(mediaResolver(block.mediaRef))}" alt="${escapeHtml(block.alt)}"></figure>`;
  }
  const media = block.mediaRef
    ? `<img src="${escapeHtml(mediaResolver(block.mediaRef))}" alt="">`
    : '';
  const heading = block.heading ? `<h2>${escapeHtml(block.heading)}</h2>` : '';
  const body = block.body ? `<p>${escapeHtml(block.body)}</p>` : '';
  return `<section class="block block-${escapeHtml(block.type)}">${media}${heading}${body}</section>`;
}

function renderForm(input, form) {
  const domId = `pumpkin-form-${htmlId(form.formId)}`;
  const statusId = `${domId}-status`;
  const fields = form.fields.map((field) => renderField(domId, field)).join('\n');
  const consentId = `${domId}-${htmlId(form.consent.name)}`;
  const honeypotId = `${domId}-${htmlId(form.honeypot.name)}`;
  const live = input.publication.formMode === FormMode.PUBLIC_FORMS_LIVE;
  return `<form id="${domId}" data-pumpkin-public-form data-form-id="${escapeHtml(form.formId)}" aria-describedby="${statusId}">
${indent(fields, 2)}
  <div class="pumpkin-honeypot" aria-hidden="true">
    <label for="${honeypotId}">${escapeHtml(form.honeypot.label)}</label>
    <input id="${honeypotId}" type="text" data-field-name="${escapeHtml(form.honeypot.name)}" tabindex="-1" autocomplete="off">
  </div>
  <label class="pumpkin-consent" for="${consentId}"><input id="${consentId}" type="checkbox" data-field-name="${escapeHtml(form.consent.name)}" value="accepted" required> <span>${escapeHtml(form.consent.label)}</span></label>
  <button type="button" data-pumpkin-submit${live ? ' disabled aria-disabled="true"' : ' disabled aria-disabled="true"'}>${escapeHtml(form.submitLabel)}</button>
  <output id="${statusId}" class="pumpkin-form-status" role="status" aria-live="polite" aria-atomic="true" data-pumpkin-form-status data-state="idle" data-code="${live ? 'initializing' : 'preview_no_post'}">${live ? 'Initializing secure submission.' : 'Preview only. This form cannot be submitted.'}</output>
  <noscript>${live ? 'This public form requires JavaScript. No submission was sent.' : 'Preview only. No submission capability is present.'}</noscript>
</form>`;
}

function renderField(formDomId, field) {
  const id = `${formDomId}-${htmlId(field.name)}`;
  const required = field.required ? ' required aria-required="true"' : '';
  const autocomplete = field.autocomplete ? ` autocomplete="${escapeHtml(field.autocomplete)}"` : '';
  if (field.type === 'textarea') {
    return `<label for="${id}"><span>${escapeHtml(field.label)}</span><textarea id="${id}" data-field-name="${escapeHtml(field.name)}"${required}${autocomplete}></textarea></label>`;
  }
  if (field.type === 'select') {
    const options = field.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
    return `<label for="${id}"><span>${escapeHtml(field.label)}</span><select id="${id}" data-field-name="${escapeHtml(field.name)}"${required}>${options}</select></label>`;
  }
  return `<label for="${id}"><span>${escapeHtml(field.label)}</span><input id="${id}" data-field-name="${escapeHtml(field.name)}" type="${escapeHtml(field.type)}"${required}${autocomplete}></label>`;
}

function renderAgeGate(input) {
  const ageGate = input.publication.ageGate;
  return `<section class="pumpkin-age-gate" data-pumpkin-age-gate data-publication-id="${escapeHtml(input.publication.publicationId)}" role="dialog" aria-modal="true" aria-labelledby="pumpkin-age-gate-title">
  <div class="pumpkin-age-gate__panel">
    <h2 id="pumpkin-age-gate-title">${escapeHtml(ageGate.title)}</h2>
    <p>${escapeHtml(ageGate.statement)}</p>
    <button type="button" data-age-gate-accept>I am ${ageGate.minimumAge} or older</button>
  </div>
</section>`;
}

function publicFormPath(publicationId, formMappingId, operation) {
  return `/api/public/publications/${encodeURIComponent(publicationId)}/forms/${encodeURIComponent(formMappingId)}/${operation}`;
}

function isReservedRoute(route) {
  const foldedRoute = route.toLowerCase();
  return RESERVED_ROUTES.some((reserved) => {
    const foldedReserved = reserved.toLowerCase();
    return (
      foldedRoute === foldedReserved ||
      foldedRoute.startsWith(`${foldedReserved}/`)
    );
  });
}

function safeFileSegment(value) {
  const normalized = String(value).replace(/[^A-Za-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!normalized) throw new PublisherValidationError('file_segment_invalid', `Identifier cannot form a safe file segment: ${value}`);
  return normalized;
}

function normalizeFieldName(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(value)) {
    throw new PublisherValidationError('form_field_name_invalid', `${label} must be a bounded field identifier.`);
  }
  return value;
}

function assertSafeRelativeOrIdentifier(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 260 || value.includes('\\') || value.startsWith('/') || value.split('/').some((part) => part === '..')) {
    throw new PublisherValidationError('media_reference_invalid', `${label} must be a safe media ID or alias.`);
  }
  return value;
}

function boundedText(value, label, maximum, { allowEmpty = false, trim = true } = {}) {
  if (typeof value !== 'string') throw new PublisherValidationError('text_invalid', `${label} must be text.`);
  const normalized = trim ? value.trim() : value;
  if (!allowEmpty && normalized.length === 0) throw new PublisherValidationError('text_missing', `${label} is required.`);
  if (normalized.length > maximum) throw new PublisherValidationError('text_too_long', `${label} exceeds ${maximum} characters.`);
  return normalized;
}

function normalizeStringMap(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new PublisherValidationError('map_invalid', `${label} must be an object.`);
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, child]) => [
        boundedText(key, `${label} key`, 120),
        boundedText(String(child), `${label}.${key}`, 120),
      ]),
  );
}

function uniqueStrings(values, label) {
  if (!Array.isArray(values)) throw new PublisherValidationError('array_invalid', `${label} must be an array.`);
  const normalized = values.map((value) => String(value));
  if (new Set(normalized).size !== normalized.length) {
    throw new PublisherValidationError('array_value_collision', `${label} contains duplicates.`);
  }
  return normalized;
}

function htmlId(value) {
  return safeFileSegment(value).replaceAll('.', '-');
}

function indent(value, spaces) {
  const prefix = ' '.repeat(spaces);
  return String(value)
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}
