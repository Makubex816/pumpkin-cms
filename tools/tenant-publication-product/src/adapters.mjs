import {
  ContractError,
  ContractVersion,
  FormMode,
  HostingClass,
  PublicationMode,
  QualificationClass,
} from './contracts.mjs';
import {
  canonicalDigest,
  deterministicId,
  immutable,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
} from './security.mjs';
import { publishTenantSnapshot } from './publisher.mjs';

export const CandidateKey = Object.freeze({
  ICE_RINK_RENTALS: 'ice-rink-rentals',
  PARTY_PROS_PHILADELPHIA: 'party-pros-philadelphia',
  STRIP_CLUB_NEAR_ME_VEGAS: 'strip-club-near-me-vegas',
  AIRSTRIP: 'airstrip',
});

const CANDIDATES = Object.freeze([
  Object.freeze({
    candidateKey: CandidateKey.ICE_RINK_RENTALS,
    tenantId: 'ice-rink-rentals',
    displayName: 'Ice Rink Rentals',
    qualificationClass: QualificationClass.STATIC_READY_WITH_ADAPTATION,
    hostingClass: HostingClass.STATIC_PUBLISHED_SITE,
    evidenceMode: 'COMMITTED_SOURCE',
    sourceRefs: Object.freeze([
      'apps/ice-rink-web/scripts/snapshot-cms-content.mjs',
      'apps/ice-rink-web/scripts/static-publish.mjs',
      'apps/ice-rink-web/scripts/sanitized-static-build.mjs',
    ]),
    migrationAdapter: 'ICE_STATIC_SNAPSHOT_TO_CANONICAL_REQUIRED',
    migrationReadiness: 'STATIC_BUILD_EXISTS_CANONICAL_ADAPTER_REQUIRED',
    qualificationProbeBuildable: true,
  }),
  Object.freeze({
    candidateKey: CandidateKey.PARTY_PROS_PHILADELPHIA,
    tenantId: 'party-pros-philadelphia',
    displayName: 'Party Pros Philadelphia',
    qualificationClass: QualificationClass.SHARED_COMPATIBILITY_REQUIRED,
    hostingClass: HostingClass.SHARED_RUNTIME_COMPATIBILITY,
    evidenceMode: 'COMMITTED_SOURCE',
    sourceRefs: Object.freeze([
      'apps/starter-app/preview-fixtures/party-pros-philadelphia/preview.json',
      'apps/starter-app/schemas/preview-fixture.schema.json',
      'apps/starter-app/scripts/lib/preview-fixture-compiler.mjs',
      'apps/starter-app/test/party-pros-preview-contract.test.mjs',
    ]),
    migrationAdapter: 'STARTER_PREVIEW_FIXTURE_TO_CANONICAL_REQUIRED',
    migrationReadiness: 'SHARED_RUNTIME_BLOCKS_REQUIRE_EXPLICIT_MAPPING',
    qualificationProbeBuildable: true,
  }),
  Object.freeze({
    candidateKey: CandidateKey.STRIP_CLUB_NEAR_ME_VEGAS,
    tenantId: 'strip-club-near-me-vegas',
    displayName: 'Strip Club Near Me Vegas',
    qualificationClass: QualificationClass.SHARED_COMPATIBILITY_REQUIRED,
    hostingClass: HostingClass.SHARED_RUNTIME_COMPATIBILITY,
    evidenceMode: 'COMMITTED_SOURCE',
    sourceRefs: Object.freeze([
      'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/preview.json',
      'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/generation-report.json',
      'apps/starter-app/schemas/preview-fixture.schema.json',
      'apps/starter-app/scripts/lib/preview-fixture-compiler.mjs',
      'apps/starter-app/test/vegas-preview-contract.test.mjs',
    ]),
    migrationAdapter: 'STARTER_PREVIEW_FIXTURE_TO_CANONICAL_REQUIRED',
    migrationReadiness: 'SHARED_RUNTIME_BLOCKS_AND_AGE_GATE_REQUIRE_EXPLICIT_MAPPING',
    qualificationProbeBuildable: true,
    ageGateRequired: true,
  }),
  Object.freeze({
    candidateKey: CandidateKey.AIRSTRIP,
    tenantId: 'airstrip',
    displayName: 'Airstrip',
    qualificationClass: QualificationClass.BLOCKED_BY_MISSING_EVIDENCE,
    hostingClass: HostingClass.DYNAMIC_SCALE_TO_ZERO_FRONTEND,
    evidenceMode: 'COMMITTED_METADATA_ONLY',
    sourceRefs: Object.freeze([
      'deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_SOURCE_BUILD_FEASIBILITY_V2_8_56.md',
      'deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_PRESERVATION_V2_8_61J.md',
      'deployment/airstrip/patches/v2-8-60r-mobile-responsive/README.md',
      'deployment/airstrip/patches/v2-8-60x-club-info-responsive/README.md',
    ]),
    migrationAdapter: 'NO_SOURCE_ADAPTER_METADATA_ONLY',
    migrationReadiness: 'SOURCE_TREE_NOT_PRESENT_IN_SCOPE',
    qualificationProbeBuildable: false,
  }),
]);

export function createCommittedCandidatePlans(releaseContext, attributionFiles = []) {
  const release = normalizeReleaseContext(releaseContext);
  return immutable(
    CANDIDATES.map((profile) => {
      const base = {
        ...profile,
        sourceRefs: [...profile.sourceRefs],
        sourceEvidenceSha256: canonicalDigest(profile.sourceRefs),
        sourceContentRead: false,
        customerPayloadIncluded: false,
        actualMigrationExecuted: false,
        qualificationProbeOnly: profile.qualificationProbeBuildable,
      };
      if (!profile.qualificationProbeBuildable) {
        return {
          ...base,
          canonicalInput: null,
          artifactId: null,
          buildDisposition: 'METADATA_ONLY_NO_BUILD',
        };
      }
      const canonicalInput = createCandidateQualificationInput(profile, release, attributionFiles);
      return {
        ...base,
        canonicalInput,
        artifactId: canonicalInput.publication.artifactId,
        buildDisposition:
          profile.qualificationClass === QualificationClass.STATIC_READY_WITH_ADAPTATION
            ? 'UNIVERSAL_COMPILER_PROBE_ADAPTER_STILL_REQUIRED'
            : 'UNIVERSAL_COMPILER_PROBE_DOES_NOT_QUALIFY_SHARED_SOURCE',
      };
    }),
  );
}

export function buildCandidateQualificationArtifacts(releaseContext, attributionFiles = []) {
  return immutable(
    createCommittedCandidatePlans(releaseContext, attributionFiles).map((plan) => {
      if (!plan.canonicalInput) {
        return {
          candidateKey: plan.candidateKey,
          qualificationClass: plan.qualificationClass,
          hostingClass: plan.hostingClass,
          status: 'METADATA_ONLY',
          artifact: null,
          sourceQualificationChanged: false,
        };
      }
      const artifact = publishTenantSnapshot(plan.canonicalInput);
      return {
        candidateKey: plan.candidateKey,
        qualificationClass: plan.qualificationClass,
        hostingClass: plan.hostingClass,
        status: 'DETERMINISTIC_SYNTHETIC_COMPILER_PROBE_BUILT',
        artifact: {
          artifactId: artifact.manifest.artifactId,
          packageSha256: artifact.manifest.packageSha256,
          manifestSha256: canonicalDigest(artifact.manifest),
          deterministicInputSha256: artifact.manifest.deterministicInputSha256,
          fileCount: artifact.manifest.fileCount,
        },
        sourceQualificationChanged: false,
      };
    }),
  );
}

export function adaptPub20Input(legacyInput, releaseContext, { attributionFiles = [] } = {}) {
  assertNoForbiddenData(legacyInput, 'PUB-20 legacy publisher input');
  const release = normalizeReleaseContext(releaseContext);
  if (!legacyInput || typeof legacyInput !== 'object' || !Array.isArray(legacyInput.routes)) {
    throw new ContractError('pub20_input_invalid', 'PUB-20 input must contain routes.');
  }
  const tenantUid = assertSafeIdentifier(legacyInput.tenantUid, 'PUB-20 tenantUid');
  const tenantSlug = backendSlug(legacyInput.tenantSlug ?? legacyInput.tenantUid);
  const publicationId = assertSafeIdentifier(
    legacyInput.publicationId,
    'PUB-20 publicationId',
    { backend: true },
  );
  const live = legacyInput.publicMode === 'public-live';
  if (!live && legacyInput.publicMode !== 'preview-no-post') {
    throw new ContractError('pub20_mode_invalid', 'PUB-20 publicMode must be preview-no-post or public-live.');
  }
  const forms = (legacyInput.forms ?? []).map((form) => ({
    formId: assertSafeIdentifier(form.id, 'PUB-20 form id'),
    formMappingId: assertSafeIdentifier(
      form.formMappingId,
      'PUB-20 form mapping id',
      { backend: true },
    ),
    formKey: assertSafeIdentifier(form.formKey ?? form.id, 'PUB-20 form key'),
    fieldContractVersion: assertSafeIdentifier(
      form.fieldContractVersion,
      'PUB-20 field contract version',
    ),
    submitLabel: String(form.submitLabel),
    consent: form.consent,
    honeypot: form.honeypot,
    fields: form.fields,
  }));
  const canonical = {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid,
      tenantSlug,
      displayName: String(legacyInput.displayName),
    },
    productRelease: {
      ...release,
      sourceRef: 'tools/static-tenant-publication/build.mjs',
    },
    publication: {
      publicationId,
      artifactId: assertSafeIdentifier(legacyInput.artifactId, 'PUB-20 artifactId'),
      publicationMode: live ? PublicationMode.PUBLIC_NOINDEX : PublicationMode.HELD_NOINDEX,
      formMode: live ? FormMode.PUBLIC_FORMS_LIVE : FormMode.PREVIEW_NO_POST,
      ...(legacyInput.apiBaseUrl ? { apiBaseUrl: legacyInput.apiBaseUrl } : {}),
      ageGate: { enabled: false },
      rollback: null,
    },
    snapshot: {
      snapshotId: deterministicId('pub20-snapshot', {
        tenantUid,
        publicationId,
        routes: legacyInput.routes,
        forms,
      }),
      themes: [
        {
          themeId: assertSafeIdentifier(legacyInput.theme?.id, 'PUB-20 theme id'),
          css: String(legacyInput.theme?.css),
        },
      ],
      pages: legacyInput.routes.map((route, index) => ({
        pageId: deterministicId('pub20-page', { tenantUid, path: route.path }),
        revisionId: deterministicId('pub20-revision', { tenantUid, route }),
        route: route.path,
        title: String(route.title),
        description: '',
        themeId: legacyInput.theme.id,
        blocks: route.blocks,
        formIds: route.formId ? [route.formId] : [],
        includeInSitemap: false,
      })),
      navigation: legacyInput.routes.map((route) => ({
        label: String(route.title),
        href: route.path,
      })),
      media: [],
      mediaAliases: [],
      redirects: (legacyInput.redirects ?? []).map((redirect) => ({
        ...redirect,
        preserveQueryString: true,
      })),
      forms,
    },
    attributionFiles,
  };
  return publishTenantSnapshot(canonical).input;
}

export function createPublicationJobPlanForCandidate(candidatePlan) {
  if (!candidatePlan || typeof candidatePlan !== 'object') {
    throw new ContractError('candidate_plan_invalid', 'Candidate plan is required.');
  }
  const canBuild = Boolean(candidatePlan.canonicalInput);
  const staticCandidate =
    candidatePlan.qualificationClass === QualificationClass.STATIC_READY_WITH_ADAPTATION;
  const holdAfterQualification = !canBuild || !staticCandidate;
  const artifactId =
    candidatePlan.artifactId ??
    deterministicId('metadata-artifact', { candidateKey: candidatePlan.candidateKey });
  return immutable({
    tenantId: assertSafeIdentifier(candidatePlan.tenantId, 'candidate tenantId', { backend: true }),
    publicationId:
      candidatePlan.canonicalInput?.publication.publicationId ??
      `${candidatePlan.tenantId}-metadata-publication`,
    releaseId:
      candidatePlan.canonicalInput?.productRelease.releaseId ??
      assertSafeIdentifier(candidatePlan.releaseId ?? 'release-metadata-only', 'candidate releaseId'),
    artifactId,
    hostingClass: candidatePlan.hostingClass,
    dryRun: true,
    stepActions: {
      'tenant-intake': 'verify',
      'identity-provisioning': 'noop',
      'content-import': holdAfterQualification ? 'hold' : 'verify',
      'hosting-class-selection': 'verify',
      'product-release-assignment': holdAfterQualification ? 'hold' : 'verify',
      'artifact-build': holdAfterQualification ? 'hold' : 'execute',
      'resource-plan': 'hold',
      'publication-register': 'hold',
      deployment: 'hold',
      preflight: 'hold',
      'form-proof': 'hold',
      'domain-hold': 'hold',
      acceptance: 'hold',
      'indexing-hold': 'hold',
      backup: 'hold',
      'atlas-register': 'hold',
    },
    approvalGates: {
      deployment: 'owner-deployment-approval',
      acceptance: 'owner-acceptance-approval',
      'indexing-hold': 'owner-indexing-approval',
    },
    evidenceRefs: candidatePlan.sourceRefs.map((sourceRef) =>
      assertSafeRelativeReference(sourceRef, 'candidate sourceRef'),
    ),
  });
}

function createCandidateQualificationInput(profile, release, attributionFiles) {
  const publicationId = `${profile.tenantId}-qualification`;
  const ageGate = profile.ageGateRequired
    ? {
        enabled: true,
        minimumAge: 21,
        title: 'Synthetic age gate proof',
        statement: 'This synthetic compiler probe requires age confirmation.',
      }
    : { enabled: false };
  return {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid: `qualification-${profile.tenantId}`,
      tenantSlug: profile.tenantId,
      displayName: `${profile.displayName} compatibility probe`,
    },
    productRelease: {
      ...release,
      sourceRef: profile.sourceRefs[0],
    },
    publication: {
      publicationId,
      artifactId: `artifact-${profile.tenantId}-qualification`,
      publicationMode: PublicationMode.HELD_NOINDEX,
      formMode: FormMode.PREVIEW_NO_POST,
      ageGate,
      rollback: null,
    },
    snapshot: {
      snapshotId: `snapshot-${profile.tenantId}-qualification`,
      themes: [
        {
          themeId: 'qualification-theme',
          css: ':root{color-scheme:light}body{font-family:system-ui,sans-serif}',
        },
      ],
      pages: [
        {
          pageId: `page-${profile.tenantId}-qualification`,
          revisionId: `revision-${profile.tenantId}-qualification`,
          route: '/',
          title: `${profile.displayName} compatibility probe`,
          description: 'Synthetic non-customer compiler qualification.',
          themeId: 'qualification-theme',
          blocks: [
            {
              type: 'hero',
              heading: 'Universal publication compiler proof',
              body: 'Synthetic content only. Source migration remains separately classified.',
            },
          ],
          formIds: [],
          includeInSitemap: false,
        },
      ],
      navigation: [],
      media: [],
      mediaAliases: [],
      redirects: [],
      forms: [],
    },
    attributionFiles,
  };
}

function normalizeReleaseContext(releaseContext = {}) {
  return immutable({
    releaseId: assertSafeIdentifier(releaseContext.releaseId, 'releaseContext.releaseId'),
    version: String(releaseContext.version),
    sourceCommit: assertSafeIdentifier(releaseContext.sourceCommit, 'releaseContext.sourceCommit'),
    lockfileSha256: assertSha256(releaseContext.lockfileSha256, 'releaseContext.lockfileSha256'),
    packageVersions: Object.fromEntries(
      Object.entries(releaseContext.packageVersions ?? {})
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([name, version]) => [
          assertSafeIdentifier(name, 'release package name'),
          String(version),
        ]),
    ),
    licenseStatus: String(releaseContext.licenseStatus ?? 'HELD_PENDING_OWNER_LEGAL_REVIEW'),
  });
}

function backendSlug(value) {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 128)
    .replace(/-+$/g, '');
  return assertSafeIdentifier(slug, 'tenantSlug', { backend: true });
}
