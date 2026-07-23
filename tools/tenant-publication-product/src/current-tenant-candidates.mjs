import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ContractError,
  ContractVersion,
  FormMode,
  HostingClass,
  PublicationMode,
  QualificationClass,
  Role,
} from './contracts.mjs';
import {
  canonicalDigest,
  deterministicId,
  sha256,
  stableStringify,
} from './canonical.mjs';
import {
  createDeterministicTar,
  fileInventory,
} from './archive.mjs';
import {
  assertDistributableHygiene,
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
  normalizeRoute,
} from './security.mjs';
import { publishTenantSnapshot } from './publisher.mjs';
import {
  adaptPub20Input,
  CandidateKey,
  createCommittedCandidatePlans,
  createPublicationJobPlanForCandidate,
} from './adapters.mjs';
import { createPublicationJob } from './jobs.mjs';

const ATTRIBUTION_MANIFEST_REF =
  'deployment/licensing/upstream-sdi-ai-pumpkin-cms/attribution-package.json';
const LEGAL_DISTRIBUTION_STATE = 'HELD_PENDING_OWNER_LEGAL_REVIEW';
const CANDIDATE_SCHEMA = 'pumpkin.current-tenant-candidate-set.v1';
const CANDIDATE_MANIFEST_SCHEMA = 'pumpkin.current-tenant-candidate-manifest.v1';
const READINESS_SCHEMA = 'pumpkin.customer-migration-readiness.v1';
const AIRSTRIP_FREEZE_SCHEMA = 'pumpkin.airstrip-metadata-freeze.v1';
const RETAINED_PUB20_SCHEMA = 'pumpkin.retained-pub20-synthetic-proof.v1';
const PRESERVED_PUB20_PACKAGE_SHA256 =
  '227512fe26000e0fa933da51ec41a83e274cbb38b24bf15624de0b142271b4dd';
const PRESERVED_PUB20_MANIFEST_SHA256 =
  '80c9db24ab57d537e11eb86bfadb8d4e58f7cef87bf0c59978617c2224d98e54';

const ICE_SOURCE_REFS = Object.freeze([
  'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/contact.json',
  'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json',
  'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/service-areas.json',
  'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/theme.json',
  'apps/ice-rink-web/src/app/globals.css',
  'apps/ice-rink-web/scripts/static-publish.mjs',
]);

const PARTY_SOURCE_REFS = Object.freeze([
  'apps/starter-app/preview-fixtures/party-pros-philadelphia/preview.json',
  'apps/starter-app/public/themes/party-pros-reference.css',
  'apps/starter-app/schemas/preview-fixture.schema.json',
  'apps/starter-app/scripts/lib/preview-fixture-compiler.mjs',
  'apps/starter-app/test/party-pros-preview-contract.test.mjs',
]);

const VEGAS_SOURCE_REFS = Object.freeze([
  'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/preview.json',
  'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/generation-report.json',
  'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/parity-scorecard.json',
  'apps/starter-app/public/themes/strip-club-near-me-vegas-reference/header.css',
  'apps/starter-app/public/themes/strip-club-near-me-vegas-reference/pumpkin-fidelity-adapter.css',
  'apps/starter-app/public/themes/strip-club-near-me-vegas-reference/styles.css',
  'apps/starter-app/public/themes/strip-club-near-me-vegas-reference/tailwind-compiled.css',
  'apps/starter-app/schemas/preview-fixture.schema.json',
  'apps/starter-app/scripts/lib/preview-fixture-compiler.mjs',
  'apps/starter-app/test/vegas-preview-contract.test.mjs',
]);

const AIRSTRIP_SOURCE_REFS = Object.freeze([
  'deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_SOURCE_BUILD_FEASIBILITY_V2_8_56.md',
  'deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_PRESERVATION_V2_8_61J.md',
  'deployment/airstrip/patches/v2-8-60r-mobile-responsive/README.md',
  'deployment/airstrip/patches/v2-8-60x-club-info-responsive/README.md',
]);

export async function buildCurrentTenantCandidateSet({
  repositoryRoot,
  releaseContext,
}) {
  const repoRoot = path.resolve(repositoryRoot);
  const release = normalizeRelease(releaseContext);
  const attribution = await loadFrozenAttribution(repoRoot);
  const profilePlans = createCommittedCandidatePlans(
    release,
    attribution.files.map(({ path: packagePath, content, sha256: digest }) => ({
      path: packagePath,
      content,
      sha256: digest,
    })),
  );
  const profiles = new Map(profilePlans.map((profile) => [profile.candidateKey, profile]));

  const candidates = [];
  candidates.push(
    await buildIceCandidate({
      repositoryRoot: repoRoot,
      release,
      attribution,
      profile: profiles.get(CandidateKey.ICE_RINK_RENTALS),
    }),
  );
  candidates.push(
    await buildPartyCandidate({
      repositoryRoot: repoRoot,
      release,
      attribution,
      profile: profiles.get(CandidateKey.PARTY_PROS_PHILADELPHIA),
    }),
  );
  candidates.push(
    await buildVegasCandidate({
      repositoryRoot: repoRoot,
      release,
      attribution,
      profile: profiles.get(CandidateKey.STRIP_CLUB_NEAR_ME_VEGAS),
    }),
  );

  const airstripFreeze = await buildAirstripFreeze(repoRoot, release);
  const genericFutureTenant = buildGenericFutureTenantPlan(release);
  const retainedPub20Synthetic = await buildRetainedPub20SyntheticArtifact(
    repoRoot,
    release,
    attribution,
  );
  const indexBody = {
    schemaVersion: CANDIDATE_SCHEMA,
    releaseId: release.releaseId,
    sourceCommit: release.sourceCommit,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    attribution: {
      attributionId: attribution.attributionId,
      manifestRef: attribution.manifestRef,
      manifestSha256: attribution.manifestSha256,
      files: attribution.files.map(({ path: packagePath, sha256: digest }) => ({
        path: packagePath,
        sha256: digest,
      })),
    },
    candidates: candidates.map((candidate) => ({
      candidateKey: candidate.candidateKey,
      qualificationClass: candidate.qualificationClass,
      hostingClass: candidate.hostingClass,
      packageFile: `${candidate.candidateKey}/candidate.tar`,
      packageSha256: candidate.manifest.packageSha256,
      manifestFile: `${candidate.candidateKey}/candidate-manifest.json`,
      manifestSha256: candidate.manifest.manifestSha256,
      staticProjectionFile: `${candidate.candidateKey}/static-projection.tar`,
      staticProjectionSha256: candidate.staticProjection.manifest.packageSha256,
      deploymentEligible: false,
      liveMutation: false,
    })),
    recommendedFirstCustomerPilot: {
      candidateKey: CandidateKey.ICE_RINK_RENTALS,
      rationale:
        'Only Ice is STATIC_READY_WITH_ADAPTATION; Party Pros and Vegas retain shared-runtime compatibility holds.',
      recommendationOnly: true,
      ownerApprovalRequired: true,
      deploymentAuthorized: false,
    },
    airstrip: {
      metadataFile: 'airstrip/metadata-freeze.json',
      metadataSha256: airstripFreeze.metadataSha256,
      qualificationClass: airstripFreeze.qualificationClass,
      hostingClass: airstripFreeze.hostingClass,
      packageCreated: false,
      publicRequestMade: false,
    },
    genericFutureTenantPlan: {
      file: 'generic-future-tenant-plan.json',
      planSha256: genericFutureTenant.planSha256,
    },
    retainedPub20Synthetic: {
      packageFile: 'retained-pub20-synthetic/static-artifact.tar',
      packageSha256: retainedPub20Synthetic.packageSha256,
      manifestFile: 'retained-pub20-synthetic/static-artifact-manifest.json',
      manifestSha256: retainedPub20Synthetic.manifestSha256,
      proofFile: 'retained-pub20-synthetic/determinism-proof.json',
      preservedPub20PackageSha256: PRESERVED_PUB20_PACKAGE_SHA256,
      preservedPub20ManifestSha256: PRESERVED_PUB20_MANIFEST_SHA256,
      localOnly: true,
      postExecuted: false,
    },
    liveMutation: false,
    networkCalls: 0,
    customerFrontendDeployment: false,
    indexingMutation: false,
    credentialValuesIncluded: false,
  };
  const index = {
    ...indexBody,
    indexSha256: canonicalDigest(indexBody),
  };
  assertNoForbiddenData(index, 'current-tenant candidate index');

  return {
    schemaVersion: CANDIDATE_SCHEMA,
    release,
    attribution,
    candidates,
    airstripFreeze,
    genericFutureTenant,
    retainedPub20Synthetic,
    index,
  };
}

export async function writeCurrentTenantCandidateSet({
  repositoryRoot,
  outputRoot,
  candidateSet,
}) {
  const repoRoot = path.resolve(repositoryRoot);
  const destination = path.resolve(outputRoot);
  assertOutsideRepository(repoRoot, destination);
  try {
    await fs.access(destination);
    throw new ContractError(
      'candidate_output_exists',
      'Candidate output root must not already exist.',
    );
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  await fs.mkdir(destination, { recursive: true });

  await writeNewJson(path.join(destination, 'candidate-index.json'), candidateSet.index);
  await writeNewJson(
    path.join(destination, 'generic-future-tenant-plan.json'),
    candidateSet.genericFutureTenant,
  );
  const retainedRoot = path.join(destination, 'retained-pub20-synthetic');
  await fs.mkdir(retainedRoot);
  await writeNew(
    path.join(retainedRoot, 'static-artifact.tar'),
    candidateSet.retainedPub20Synthetic.packageBytes,
  );
  await writeNew(
    path.join(retainedRoot, 'static-artifact-manifest.json'),
    candidateSet.retainedPub20Synthetic.manifestBytes,
  );
  await writeNewJson(
    path.join(retainedRoot, 'determinism-proof.json'),
    candidateSet.retainedPub20Synthetic.proof,
  );

  for (const candidate of candidateSet.candidates) {
    const candidateRoot = path.join(destination, candidate.candidateKey);
    await fs.mkdir(candidateRoot);
    await writeNew(path.join(candidateRoot, 'candidate.tar'), candidate.packageBytes);
    await writeNewJson(path.join(candidateRoot, 'candidate-manifest.json'), candidate.manifest);
    await writeNewJson(
      path.join(candidateRoot, 'migration-readiness.json'),
      candidate.readiness,
    );
    await writeNewJson(
      path.join(candidateRoot, 'orchestrator-plan.json'),
      candidate.orchestrator,
    );
    await writeNew(
      path.join(candidateRoot, 'static-projection.tar'),
      candidate.staticProjection.packageBytes,
    );
    await writeNewJson(
      path.join(candidateRoot, 'static-projection-manifest.json'),
      candidate.staticProjection.manifest,
    );
  }

  const airstripRoot = path.join(destination, 'airstrip');
  await fs.mkdir(airstripRoot);
  await writeNewJson(
    path.join(airstripRoot, 'metadata-freeze.json'),
    candidateSet.airstripFreeze,
  );
  return {
    outputRoot: destination,
    indexSha256: candidateSet.index.indexSha256,
    candidateCount: candidateSet.candidates.length,
    airstripPackageCreated: false,
  };
}

export async function inventoryCandidateOutput(outputRoot) {
  const root = path.resolve(outputRoot);
  const files = await walkFiles(root);
  return Promise.all(
    files.map(async (file) => {
      const bytes = await fs.readFile(file);
      return {
        path: toPosix(path.relative(root, file)),
        bytes: bytes.length,
        sha256: sha256(bytes),
      };
    }),
  ).then((inventory) =>
    inventory.sort((left, right) => left.path.localeCompare(right.path, 'en')),
  );
}

export function verifyCurrentTenantCandidateSet(candidateSet) {
  if (candidateSet?.schemaVersion !== CANDIDATE_SCHEMA) {
    throw new ContractError('candidate_set_schema_invalid', 'Candidate-set schema is invalid.');
  }
  if (candidateSet.candidates?.length !== 3) {
    throw new ContractError('candidate_set_count_invalid', 'Exactly three local candidates are required.');
  }
  for (const candidate of candidateSet.candidates) {
    verifyCandidate(candidate);
  }
  verifyRetainedPub20Synthetic(candidateSet.retainedPub20Synthetic);
  if (
    candidateSet.airstripFreeze?.packageCreated !== false ||
    candidateSet.airstripFreeze?.publicRequestMade !== false ||
    candidateSet.airstripFreeze?.qualificationClass !==
      QualificationClass.BLOCKED_BY_MISSING_EVIDENCE
  ) {
    throw new ContractError(
      'airstrip_freeze_invalid',
      'Airstrip must remain metadata-only with no package or public request.',
    );
  }
  const { indexSha256, ...indexBody } = candidateSet.index;
  if (canonicalDigest(indexBody) !== indexSha256) {
    throw new ContractError('candidate_index_hash_mismatch', 'Candidate index hash is invalid.');
  }
  return true;
}

function verifyCandidate(candidate) {
  if (candidate.manifest?.schemaVersion !== CANDIDATE_MANIFEST_SCHEMA) {
    throw new ContractError('candidate_manifest_schema_invalid', 'Candidate manifest schema is invalid.');
  }
  const { manifestSha256, ...manifestBody } = candidate.manifest;
  if (canonicalDigest(manifestBody) !== manifestSha256) {
    throw new ContractError(
      'candidate_manifest_hash_mismatch',
      `${candidate.candidateKey} manifest hash is invalid.`,
    );
  }
  if (sha256(candidate.packageBytes) !== candidate.manifest.packageSha256) {
    throw new ContractError(
      'candidate_package_hash_mismatch',
      `${candidate.candidateKey} package hash is invalid.`,
    );
  }
  if (
    candidate.manifest.deploymentEligible !== false ||
    candidate.manifest.liveMutation !== false ||
    candidate.readiness.indexing.targetMode !== PublicationMode.HELD_NOINDEX
  ) {
    throw new ContractError(
      'candidate_safety_boundary_invalid',
      `${candidate.candidateKey} escaped its held local-only boundary.`,
    );
  }
}

async function buildIceCandidate({
  repositoryRoot,
  release,
  attribution,
  profile,
}) {
  const pages = await Promise.all(
    ICE_SOURCE_REFS.filter((sourceRef) => sourceRef.includes('/pages/')).map(
      (sourceRef) => readJsonRef(repositoryRoot, sourceRef),
    ),
  );
  pages.sort((left, right) =>
    routeFromSlug(left.pageSlug).localeCompare(routeFromSlug(right.pageSlug), 'en'),
  );
  const theme = await readJsonRef(
    repositoryRoot,
    'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/theme.json',
  );
  const css = await readTextRef(
    repositoryRoot,
    'apps/ice-rink-web/src/app/globals.css',
  );
  const routeSet = new Set(pages.map((page) => routeFromSlug(page.pageSlug)));
  const form = buildIceForm(pages);
  const mediaInventory = collectPublicMediaReferences(pages);
  const sourceBlockTypes = uniqueSorted(
    pages.flatMap((page) =>
      (page.ContentData?.ContentBlocks ?? []).map((block) => String(block.type)),
    ),
  );
  const navigation = normalizeMenu(theme.menu ?? [], routeSet);
  const canonicalInput = {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid: 'ice-rink-rentals',
      tenantSlug: 'ice-rink-rentals',
      displayName: 'Ice Rink Rentals local migration candidate',
    },
    productRelease: {
      ...release,
      sourceRef:
        'tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json',
    },
    publication: {
      publicationId: 'ice-rink-rentals-pub30-local',
      artifactId: 'ice-rink-rentals-pub30-local-artifact',
      publicationMode: PublicationMode.HELD_NOINDEX,
      formMode: FormMode.PREVIEW_NO_POST,
      ageGate: { enabled: false },
      rollback: null,
    },
    snapshot: {
      snapshotId: 'ice-rink-rentals-pub30-source-projection',
      themes: [{ themeId: 'ice-rink-source-theme', css }],
      pages: pages.map((page) =>
        projectCmsPage(page, {
          tenantId: 'ice-rink-rentals',
          themeId: 'ice-rink-source-theme',
          formIds:
            page.pageSlug === 'contact' && form ? [form.formId] : [],
        }),
      ),
      navigation,
      media: [],
      mediaAliases: [],
      redirects: [],
      forms: form ? [form] : [],
    },
    attributionFiles: attributionForPublisher(attribution),
  };
  const staticProjection = publishTenantSnapshot(canonicalInput);
  const sourceEvidence = await buildSourceEvidence(repositoryRoot, ICE_SOURCE_REFS);
  const counts = {
    routes: pages.length,
    projectedRoutes: staticProjection.manifest.routeCount,
    redirects: 0,
    projectedRedirects: staticProjection.manifest.redirectCount,
    mediaReferences: mediaInventory.length,
    embeddedMedia: staticProjection.manifest.mediaCount,
    themes: 1,
    projectedThemes: canonicalInput.snapshot.themes.length,
    navigation: navigation.length,
    projectedNavigation: navigation.length,
    forms: form ? 1 : 0,
    projectedForms: staticProjection.manifest.formCount,
  };
  return assembleCandidate({
    profile,
    release,
    attribution,
    canonicalInput,
    staticProjection,
    sourceEvidence,
    inventories: {
      routes: buildCmsRouteInventory(pages),
      redirects: [],
      media: mediaInventory,
      forms: form ? [formInventory(form)] : [],
      themes: [
        {
          themeId: 'ice-rink-source-theme',
          sourceRef: 'apps/ice-rink-web/src/app/globals.css',
          sha256: sha256(Buffer.from(css, 'utf8')),
        },
      ],
      navigation,
      sourceBlockTypes,
    },
    readiness: buildReadiness({
      profile,
      release,
      staticProjection,
      counts,
      domain: {
        apex: 'iceskatingrinkrentals.com',
        www: 'www.iceskatingrinkrentals.com',
        state: 'READ_ONLY_EXISTING_CUSTOMER_DOMAIN_NO_MUTATION',
      },
      ageGate: {
        sourceRequired: false,
        projectionEnabled: false,
        ownerReviewRequired: false,
      },
      capabilities: {
        catalog: false,
        blog: false,
        cart: false,
        publicForms: true,
      },
      adaptations: [
        'CMS block contracts are mapped to the universal safe hero/card/text subset.',
        'Public media references are inventoried but not fetched or embedded.',
        'The contact form is rendered PREVIEW_NO_POST with consent and honeypot controls.',
        'Source index intent is suppressed to HELD_NOINDEX for local proof.',
      ],
      blockers: [
        'Owner fidelity review is required before any customer pilot.',
        'Media content hashes and approved binary materialization remain required.',
        'Live public-form origin/mapping approval remains required.',
      ],
    }),
  });
}

async function buildPartyCandidate({
  repositoryRoot,
  release,
  attribution,
  profile,
}) {
  const fixtureRef =
    'apps/starter-app/preview-fixtures/party-pros-philadelphia/preview.json';
  const fixture = await readJsonRef(repositoryRoot, fixtureRef);
  const cssRef = 'apps/starter-app/public/themes/party-pros-reference.css';
  const css = await readTextRef(repositoryRoot, cssRef);
  const pages = Object.values(fixture.pages ?? {}).sort((left, right) =>
    routeFromSlug(left.pageSlug).localeCompare(routeFromSlug(right.pageSlug), 'en'),
  );
  const routeSet = new Set(pages.map((page) => routeFromSlug(page.pageSlug)));
  const forms = (fixture.formDefinitions ?? []).map((formDefinition, index) =>
    projectFormDefinition(formDefinition, {
      tenantId: fixture.tenantId,
      index,
      defaultConsent:
        'I agree to be contacted about this local preview request.',
    }),
  );
  const formIds = forms.map((form) => form.formId);
  const navigation = normalizeMenu(fixture.theme?.menu ?? [], routeSet);
  const redirects = collectCmsRedirects(pages, routeSet);
  const sourceBlockTypes = uniqueSorted(
    pages.flatMap((page) =>
      (page.ContentData?.ContentBlocks ?? []).map((block) => String(block.type)),
    ),
  );
  const mediaInventory = collectPublicMediaReferences(fixture);
  const canonicalInput = {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid: fixture.tenantId,
      tenantSlug: fixture.tenantId,
      displayName: `${fixture.siteName} local migration candidate`,
    },
    productRelease: { ...release, sourceRef: fixtureRef },
    publication: {
      publicationId: 'party-pros-philadelphia-pub30-local',
      artifactId: 'party-pros-philadelphia-pub30-local-artifact',
      publicationMode: PublicationMode.HELD_NOINDEX,
      formMode: FormMode.PREVIEW_NO_POST,
      ageGate: { enabled: false },
      rollback: null,
    },
    snapshot: {
      snapshotId: 'party-pros-philadelphia-pub30-source-projection',
      themes: [{ themeId: 'party-pros-source-theme', css }],
      pages: pages.map((page) => {
        const blockTypes = (page.ContentData?.ContentBlocks ?? []).map((block) =>
          String(block.type),
        );
        return projectCmsPage(page, {
          tenantId: fixture.tenantId,
          themeId: 'party-pros-source-theme',
          formIds: blockTypes.includes('Contact') ? formIds : [],
        });
      }),
      navigation,
      media: [],
      mediaAliases: [],
      redirects,
      forms,
    },
    attributionFiles: attributionForPublisher(attribution),
  };
  const staticProjection = publishTenantSnapshot(canonicalInput);
  const sourceEvidence = await buildSourceEvidence(repositoryRoot, PARTY_SOURCE_REFS);
  const counts = {
    routes: pages.length,
    projectedRoutes: staticProjection.manifest.routeCount,
    redirects: countDeclaredCmsRedirects(pages),
    projectedRedirects: staticProjection.manifest.redirectCount,
    mediaReferences: mediaInventory.length,
    embeddedMedia: staticProjection.manifest.mediaCount,
    themes: 1,
    projectedThemes: canonicalInput.snapshot.themes.length,
    navigation: fixture.theme?.menu?.length ?? 0,
    projectedNavigation: navigation.length,
    forms: forms.length,
    projectedForms: staticProjection.manifest.formCount,
  };
  return assembleCandidate({
    profile,
    release,
    attribution,
    canonicalInput,
    staticProjection,
    sourceEvidence,
    inventories: {
      routes: buildCmsRouteInventory(pages),
      redirects,
      media: mediaInventory,
      forms: forms.map(formInventory),
      themes: [
        {
          themeId: 'party-pros-source-theme',
          sourceRef: cssRef,
          sha256: sha256(Buffer.from(css, 'utf8')),
        },
      ],
      navigation,
      sourceBlockTypes,
    },
    readiness: buildReadiness({
      profile,
      release,
      staticProjection,
      counts,
      domain: {
        apex: 'partyrentalphiladelphia.com',
        www: 'www.partyrentalphiladelphia.com',
        state: 'READ_ONLY_EXISTING_CUSTOMER_DOMAIN_NO_MUTATION',
      },
      ageGate: {
        sourceRequired: false,
        projectionEnabled: false,
        ownerReviewRequired: false,
      },
      capabilities: {
        catalog: true,
        blog: true,
        cart: true,
        publicForms: true,
      },
      adaptations: [
        'All committed page routes and block-type order are projected without executing the shared runtime.',
        'Catalog, blog, and quote-cart behavior remains a shared-runtime compatibility requirement.',
        'Public media references are inventoried but not fetched or embedded.',
        'Form definitions render locally in PREVIEW_NO_POST only.',
        'Source index intent is suppressed to HELD_NOINDEX for local proof.',
      ],
      blockers: [
        'Shared catalog/blog/cart behavior requires explicit runtime compatibility acceptance.',
        'Owner fidelity review and media-rights review remain required.',
        'No customer deployment, domain mutation, or form POST is authorized.',
      ],
    }),
  });
}

async function buildVegasCandidate({
  repositoryRoot,
  release,
  attribution,
  profile,
}) {
  const fixtureRef =
    'apps/starter-app/preview-fixtures/strip-club-near-me-vegas/preview.json';
  const fixture = await readJsonRef(repositoryRoot, fixtureRef);
  const cssRefs = VEGAS_SOURCE_REFS.filter((sourceRef) => sourceRef.endsWith('.css'));
  const cssParts = await Promise.all(
    cssRefs.map(async (sourceRef) => ({
      sourceRef,
      content: await readTextRef(repositoryRoot, sourceRef),
    })),
  );
  const css = cssParts
    .map(({ sourceRef, content }) => `/* ${sourceRef} */\n${content.trimEnd()}`)
    .join('\n');
  const routes = Object.values(fixture.routes ?? {}).sort((left, right) =>
    String(left.route).localeCompare(String(right.route), 'en'),
  );
  const routeSet = new Set(routes.map((route) => normalizeRoute(route.route)));
  const forms = (fixture.forms?.definitions ?? []).map((formDefinition, index) =>
    projectFormDefinition(formDefinition, {
      tenantId: fixture.tenantId,
      index,
      defaultConsent:
        'I agree to the privacy notice and to be contacted about this local preview request.',
    }),
  );
  const formByKey = new Map(forms.map((form) => [form.formKey, form]));
  const routeForms = new Map();
  for (const instance of fixture.forms?.instances ?? []) {
    const route = normalizeRoute(instance.route);
    const form = formByKey.get(instance.normalizedFormKey);
    if (!form || !routeSet.has(route)) continue;
    const existing = routeForms.get(route) ?? new Set();
    existing.add(form.formId);
    routeForms.set(route, existing);
  }
  const declaredRedirects = fixture.redirects ?? [];
  const redirects = declaredRedirects
    .filter((redirect) => {
      const from = normalizeRoute(redirect.sourcePath);
      const to = normalizeRoute(redirect.targetPath);
      return !routeSet.has(from) && routeSet.has(to);
    })
    .map((redirect) => ({
      from: normalizeRoute(redirect.sourcePath),
      to: normalizeRoute(redirect.targetPath),
      status: Number(redirect.statusCode),
      preserveQueryString: redirect.preserveQueryString !== false,
    }));
  const navigation = buildRouteNavigation(routes);
  const mediaInventory = {
    canonical: (fixture.media?.canonical ?? []).map((item) => ({
      mediaId: String(item.id),
      bytes: Number(item.bytes),
      sha256: assertSha256(item.sha256, 'Vegas canonical media sha256'),
      url: safePublicHttps(item.url),
    })),
    aliases: (fixture.media?.aliases ?? []).map((item) => ({
      sourcePath: safeSourceAlias(item.sourcePath),
      sha256: assertSha256(item.sha256, 'Vegas media alias sha256'),
      url: safePublicHttps(item.url),
      disposition: safeBounded(item.disposition, 120, 'preserved'),
    })),
  };
  const canonicalInput = {
    schemaVersion: ContractVersion.publicationInput,
    tenant: {
      tenantUid: fixture.tenantId,
      tenantSlug: fixture.tenantId,
      displayName: `${fixture.siteName} local migration candidate`,
    },
    productRelease: { ...release, sourceRef: fixtureRef },
    publication: {
      publicationId: 'strip-club-near-me-vegas-pub30-local',
      artifactId: 'strip-club-near-me-vegas-pub30-local-artifact',
      publicationMode: PublicationMode.HELD_NOINDEX,
      formMode: FormMode.PREVIEW_NO_POST,
      ageGate: {
        enabled: true,
        minimumAge: 21,
        title: 'Age verification',
        statement: 'You must be at least 21 years old to continue.',
      },
      rollback: null,
    },
    snapshot: {
      snapshotId: 'strip-club-near-me-vegas-pub30-source-projection',
      themes: [{ themeId: 'vegas-source-theme', css }],
      pages: routes.map((route) =>
        projectVegasRoute(route, {
          tenantId: fixture.tenantId,
          themeId: 'vegas-source-theme',
          formIds: [...(routeForms.get(normalizeRoute(route.route)) ?? [])],
        }),
      ),
      navigation,
      media: [],
      mediaAliases: [],
      redirects,
      forms,
    },
    attributionFiles: attributionForPublisher(attribution),
  };
  const staticProjection = publishTenantSnapshot(canonicalInput);
  const sourceEvidence = await buildSourceEvidence(repositoryRoot, VEGAS_SOURCE_REFS);
  const counts = {
    routes: Number(fixture.counts?.routes ?? routes.length),
    projectedRoutes: staticProjection.manifest.routeCount,
    redirects: declaredRedirects.length,
    projectedRedirects: staticProjection.manifest.redirectCount,
    mediaReferences: Number(
      fixture.counts?.canonicalMedia ?? mediaInventory.canonical.length,
    ),
    embeddedMedia: staticProjection.manifest.mediaCount,
    mediaAliases: Number(
      fixture.counts?.sourcePathAliases ?? mediaInventory.aliases.length,
    ),
    themes: cssParts.length,
    projectedThemes: canonicalInput.snapshot.themes.length,
    navigation: navigation.length,
    projectedNavigation: navigation.length,
    forms: Number(
      fixture.counts?.formDefinitions ?? fixture.forms?.definitions?.length ?? 0,
    ),
    projectedForms: staticProjection.manifest.formCount,
    formInstances: Number(
      fixture.counts?.effectiveFormInstances ?? fixture.forms?.instances?.length ?? 0,
    ),
  };
  return assembleCandidate({
    profile,
    release,
    attribution,
    canonicalInput,
    staticProjection,
    sourceEvidence,
    inventories: {
      routes: routes.map((route) => ({
        route: normalizeRoute(route.route),
        title: safeBounded(route.title, 240, 'Untitled route'),
        h1: safeBounded(route.h1, 240, ''),
        sourceSha256: assertSha256(route.sourceSha256, 'Vegas route sourceSha256'),
        disposition: safeBounded(route.disposition, 120, 'preserved'),
        counts: normalizeCountMap(route.counts ?? {}),
        inlineCssSha256: sha256(Buffer.from(String(route.inlineCss ?? ''), 'utf8')),
      })),
      redirects: declaredRedirects.map((redirect) => ({
        from: normalizeRoute(redirect.sourcePath),
        to: normalizeRoute(redirect.targetPath),
        status: Number(redirect.statusCode),
        preserveQueryString: redirect.preserveQueryString !== false,
        projectionIncluded:
          !routeSet.has(normalizeRoute(redirect.sourcePath)) &&
          routeSet.has(normalizeRoute(redirect.targetPath)),
      })),
      media: mediaInventory,
      forms: forms.map(formInventory),
      themes: cssParts.map(({ sourceRef, content }) => ({
        sourceRef,
        sha256: sha256(Buffer.from(content, 'utf8')),
      })),
      navigation,
      behaviors: (fixture.behaviors ?? []).map((behavior) => ({
        id: safeBounded(behavior.id, 160, 'behavior'),
        disposition: safeBounded(behavior.disposition, 120, 'preserved'),
        adaptation: safeBounded(behavior.adaptation, 500, ''),
      })),
    },
    readiness: buildReadiness({
      profile,
      release,
      staticProjection,
      counts,
      domain: {
        apex: 'stripclubnearmevegas.com',
        www: 'www.stripclubnearmevegas.com',
        state: 'READ_ONLY_EXISTING_CUSTOMER_DOMAIN_NO_MUTATION',
      },
      ageGate: {
        sourceRequired: true,
        projectionEnabled: true,
        minimumAge: 21,
        ownerReviewRequired: true,
      },
      capabilities: {
        catalog: false,
        blog: true,
        cart: false,
        publicForms: true,
        adultCompliance: true,
      },
      adaptations: [
        'All committed route identities and structural counts are projected without executing raw source HTML.',
        'Shared behaviors and per-route inline CSS remain compatibility evidence rather than universal blocks.',
        'Canonical media and aliases are hash-inventoried but never fetched or embedded.',
        'All forms remain PREVIEW_NO_POST; hidden routing fields are excluded from the browser projection.',
        'A local-only age gate is enabled while adult-compliance review remains held.',
        'The source redirect that collides with a physical route remains inventory-only for shared-runtime resolution.',
        'Airstrip-named source content is preserved as committed local structure without any Airstrip request.',
      ],
      blockers: [
        'Shared-runtime behavior, inline CSS, redirect precedence, and form fidelity require owner acceptance.',
        'Adult-compliance and media-rights reviews remain required.',
        'No customer deployment, domain mutation, form POST, or Airstrip runtime request is authorized.',
      ],
    }),
  });
}

function assembleCandidate({
  profile,
  release,
  attribution,
  canonicalInput,
  staticProjection,
  sourceEvidence,
  inventories,
  readiness,
}) {
  if (!profile) {
    throw new ContractError('candidate_profile_missing', 'Candidate profile is required.');
  }
  const plan = createPublicationJobPlanForCandidate({
    ...profile,
    canonicalInput,
    artifactId: canonicalInput.publication.artifactId,
    sourceRefs: sourceEvidence.files.map((file) => file.sourceRef),
  });
  const job = createPublicationJob(plan, {
    role: Role.SuperAdmin,
    actorId: 'pub30-local-planner',
  });
  const orchestratorBody = {
    schemaVersion: 'pumpkin.candidate-orchestrator-plan.v1',
    candidateKey: profile.candidateKey,
    releaseId: release.releaseId,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    planOnly: true,
    executable: false,
    deploymentApproved: false,
    indexingApproved: false,
    formPostApproved: false,
    plan,
    job,
    domainHandoffs: buildDomainHandoffs(profile.candidateKey, readiness.domain),
    liveMutation: false,
    networkCalls: 0,
  };
  const orchestrator = {
    ...orchestratorBody,
    planSha256: canonicalDigest(orchestratorBody),
  };
  const summary = {
    schemaVersion: 'pumpkin.current-tenant-candidate-summary.v1',
    candidateKey: profile.candidateKey,
    tenantId: profile.tenantId,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    evidenceMode: 'COMMITTED_SOURCE_LOCAL_READ_ONLY',
    migrationAdapter: profile.migrationAdapter,
    migrationReadiness: profile.migrationReadiness,
    deploymentEligible: false,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    liveMutation: false,
    networkCalls: 0,
  };
  const compatibility = {
    schemaVersion: 'pumpkin.current-tenant-compatibility-report.v1',
    candidateKey: profile.candidateKey,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    sourceQualificationChanged: false,
    universalProjectionStatus:
      profile.qualificationClass === QualificationClass.STATIC_READY_WITH_ADAPTATION
        ? 'LOCAL_STATIC_PROJECTION_REQUIRES_OWNER_FIDELITY_ACCEPTANCE'
        : 'LOCAL_STATIC_PROJECTION_DOES_NOT_REPLACE_SHARED_RUNTIME',
    counts: readiness.counts,
    capabilities: readiness.capabilities,
    adaptations: readiness.adaptations,
    blockers: readiness.blockers,
  };
  const releaseRecord = {
    schemaVersion: ContractVersion.productRelease,
    ...release,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
  };
  const candidateFiles = [
    jsonFile('candidate-summary.json', summary),
    jsonFile('compatibility-report.json', compatibility),
    jsonFile('form-inventory.json', inventories.forms),
    jsonFile('media-inventory.json', inventories.media),
    jsonFile('migration-readiness.json', readiness),
    jsonFile('navigation-inventory.json', inventories.navigation),
    jsonFile('orchestrator-plan.json', orchestrator),
    jsonFile('redirect-inventory.json', inventories.redirects),
    jsonFile('release.json', releaseRecord),
    jsonFile('route-inventory.json', inventories.routes),
    jsonFile('source-evidence.json', sourceEvidence),
    jsonFile('theme-inventory.json', inventories.themes),
    jsonFile(
      'structural-inventory.json',
      inventories.sourceBlockTypes
        ? { sourceBlockTypes: inventories.sourceBlockTypes }
        : { behaviors: inventories.behaviors ?? [] },
    ),
    {
      path: 'static-projection.tar',
      content: staticProjection.packageBytes,
    },
    jsonFile('static-projection-manifest.json', staticProjection.manifest),
    ...attribution.files.map(({ path: packagePath, content }) => ({
      path: packagePath,
      content,
    })),
  ];
  assertNoForbiddenData(
    {
      summary,
      compatibility,
      readiness,
      orchestrator,
      sourceEvidence,
      inventories,
    },
    `${profile.candidateKey} candidate evidence`,
  );
  assertDistributableHygiene(
    candidateFiles.filter((file) => file.path !== 'static-projection.tar'),
  );
  const packageBytes = createDeterministicTar(candidateFiles);
  const manifestBody = {
    schemaVersion: CANDIDATE_MANIFEST_SCHEMA,
    candidateKey: profile.candidateKey,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    releaseId: release.releaseId,
    sourceCommit: release.sourceCommit,
    packageFile: 'candidate.tar',
    packageBytes: packageBytes.length,
    packageSha256: sha256(packageBytes),
    fileCount: candidateFiles.length,
    files: fileInventory(candidateFiles),
    staticProjectionSha256: staticProjection.manifest.packageSha256,
    staticProjectionManifestSha256: sha256(staticProjection.manifestBytes),
    sourceEvidenceSha256: sourceEvidence.evidenceSha256,
    readinessSha256: readiness.readinessSha256,
    orchestratorPlanSha256: orchestrator.planSha256,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    deploymentEligible: false,
    liveMutation: false,
    networkCalls: 0,
    indexingMutation: false,
    publicFormPostExecuted: false,
  };
  const manifest = {
    ...manifestBody,
    manifestSha256: canonicalDigest(manifestBody),
  };
  return {
    candidateKey: profile.candidateKey,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    packageBytes,
    manifest,
    staticProjection,
    readiness,
    orchestrator,
    sourceEvidence,
    inventories,
  };
}

function buildReadiness({
  profile,
  release,
  staticProjection,
  counts,
  domain,
  ageGate,
  capabilities,
  adaptations,
  blockers,
}) {
  const body = {
    schemaVersion: READINESS_SCHEMA,
    candidateKey: profile.candidateKey,
    tenantId: profile.tenantId,
    releaseId: release.releaseId,
    qualificationClass: profile.qualificationClass,
    hostingClass: profile.hostingClass,
    staticProjection: {
      artifactId: staticProjection.manifest.artifactId,
      packageSha256: staticProjection.manifest.packageSha256,
      manifestSha256: sha256(staticProjection.manifestBytes),
      localOnly: true,
      deploymentEligible: false,
    },
    counts,
    capabilities,
    fidelity: {
      routes:
        counts.routes === counts.projectedRoutes
          ? 'COUNT_PRESERVED'
          : 'COUNT_DEVIATION_REQUIRES_REVIEW',
      redirects:
        counts.redirects === counts.projectedRedirects
          ? 'COUNT_PRESERVED'
          : 'SOURCE_REDIRECT_DEVIATION_INVENTORIED',
      media:
        counts.mediaReferences === counts.embeddedMedia
          ? 'COUNT_PRESERVED'
          : 'HASH_OR_REFERENCE_INVENTORY_ONLY_NOT_EMBEDDED',
      themes:
        counts.themes === counts.projectedThemes
          ? 'COUNT_PRESERVED'
          : 'SOURCE_STYLESHEETS_COMBINED_INTO_ONE_PROJECTION_THEME',
      navigation:
        counts.navigation === counts.projectedNavigation
          ? 'COUNT_PRESERVED'
          : 'SAFE_ROUTE_FILTER_APPLIED',
      forms:
        counts.forms === counts.projectedForms
          ? 'COUNT_PRESERVED'
          : 'SAFE_FIELD_ADAPTATION_REQUIRES_REVIEW',
      indexing: 'SOURCE_INTENT_SUPPRESSED_TO_HELD_NOINDEX',
      ageGate: ageGate.projectionEnabled
        ? 'LOCAL_GATE_PROJECTED_OWNER_COMPLIANCE_REVIEW_REQUIRED'
        : 'NOT_REQUIRED',
      catalog: capabilities.catalog
        ? 'SOURCE_CAPABILITY_REQUIRES_TARGET_RUNTIME_REVIEW'
        : 'NOT_DECLARED',
      blog: capabilities.blog
        ? 'SOURCE_CAPABILITY_REQUIRES_TARGET_RUNTIME_REVIEW'
        : 'NOT_DECLARED',
      cart: capabilities.cart
        ? 'SOURCE_CAPABILITY_REQUIRES_TARGET_RUNTIME_REVIEW'
        : 'NOT_DECLARED',
      publicBehavior: 'LOCAL_PREVIEW_ONLY_NO_POST_NO_DEPLOYMENT',
    },
    domain,
    ageGate,
    indexing: {
      sourceIntentObserved: true,
      targetMode: PublicationMode.HELD_NOINDEX,
      mutationAuthorized: false,
    },
    forms: {
      targetMode: FormMode.PREVIEW_NO_POST,
      postExecuted: false,
      liveOriginApproved: false,
    },
    adaptations,
    blockers,
    packageDeviations: adaptations,
    backupRestore: {
      preMigrationBackupRequired: true,
      postMigrationBackupRequired: true,
      restoreProofRequired: true,
      backupExecuted: false,
      restoreExecuted: false,
      requiredEvidence: [
        'immutable-source-snapshot',
        'artifact-and-manifest-hashes',
        'tenant-registry-export',
        'restore-validation-result',
      ],
    },
    rollback: {
      predecessorRequired: true,
      revokeSuccessorRequired: true,
      restorePredecessorRequired: true,
      domainRollbackRequired: true,
      indexingRollbackRequired: true,
      rollbackExecuted: false,
    },
    cost: {
      estimateState: 'HELD_REQUIRES_OWNER_APPROVED_LIVE_RESOURCE_PLAN',
      currentPriceLookupPerformed: false,
      paidResourceAuthorized: false,
      targetHostingClass: profile.hostingClass,
    },
    migrationSequence: [
      'owner-accept-source-and-fidelity-delta',
      'freeze-pre-migration-backup',
      'accept-product-release-and-artifact-hashes',
      'approve-target-resource-plan',
      'deploy-held-noindex-successor',
      'prove-routes-media-forms-and-age-gate',
      'prepare-domain-dns-tls-handoff',
      'obtain-owner-acceptance',
      'freeze-post-migration-backup',
      'consider-separate-indexing-approval',
    ],
    approvals: {
      sourceAndFidelity: 'REQUIRED',
      deployment: 'REQUIRED',
      domainDnsTls: 'REQUIRED',
      publicForms: 'REQUIRED',
      acceptance: 'REQUIRED',
      indexing: 'SEPARATE_REQUIRED',
      grantedInThisPackage: false,
    },
    pub40PromptInputs: {
      candidateKey: profile.candidateKey,
      tenantId: profile.tenantId,
      qualificationClass: profile.qualificationClass,
      hostingClass: profile.hostingClass,
      releaseId: release.releaseId,
      staticArtifactId: staticProjection.manifest.artifactId,
      staticPackageSha256: staticProjection.manifest.packageSha256,
      staticManifestSha256: sha256(staticProjection.manifestBytes),
      targetPublicationMode: PublicationMode.HELD_NOINDEX,
      targetFormMode: FormMode.PREVIEW_NO_POST,
      domain,
      unresolvedBlockers: blockers,
      ownerApprovalReference: 'REQUIRED_NOT_PRESENT',
    },
    ownerAcceptanceRequired: true,
    customerDeploymentAuthorized: false,
    liveMutation: false,
  };
  return { ...body, readinessSha256: canonicalDigest(body) };
}

function buildDomainHandoffs(candidateKey, domain) {
  return [
    {
      handoffType: 'EXTERNAL_DNS',
      candidateKey,
      apex: domain.apex,
      www: domain.www,
      stage: 'HELD',
      executable: false,
      mutationAuthorized: false,
      requiredOwnerInputs: [
        'dns-provider-confirmation',
        'record-inventory',
        'cutover-window',
      ],
    },
    {
      handoffType: 'AZURE_DNS',
      candidateKey,
      apex: domain.apex,
      www: domain.www,
      stage: 'HELD',
      executable: false,
      mutationAuthorized: false,
      requiredOwnerInputs: [
        'subscription-alias',
        'resource-group',
        'zone-ownership-confirmation',
      ],
    },
  ];
}

async function buildAirstripFreeze(repositoryRoot, release) {
  const sourceEvidence = await buildSourceEvidence(repositoryRoot, AIRSTRIP_SOURCE_REFS);
  const body = {
    schemaVersion: AIRSTRIP_FREEZE_SCHEMA,
    candidateKey: CandidateKey.AIRSTRIP,
    tenantId: 'airstrip',
    releaseId: release.releaseId,
    qualificationClass: QualificationClass.BLOCKED_BY_MISSING_EVIDENCE,
    hostingClass: HostingClass.DYNAMIC_SCALE_TO_ZERO_FRONTEND,
    evidenceMode: 'COMMITTED_METADATA_ONLY',
    sourceEvidence,
    sourceTreePresentInScope: false,
    sourceContentRead: false,
    canonicalInputCreated: false,
    packageCreated: false,
    publicRequestMade: false,
    runtimeRequestMade: false,
    migrationExecuted: false,
    deploymentEligible: false,
    liveMutation: false,
    freezeReason: 'SOURCE_TREE_NOT_PRESENT_IN_SCOPE',
  };
  return { ...body, metadataSha256: canonicalDigest(body) };
}

function buildGenericFutureTenantPlan(release) {
  const body = {
    schemaVersion: 'pumpkin.generic-future-tenant-orchestrator-plan.v1',
    candidateKey: 'generic-future-tenant',
    releaseId: release.releaseId,
    hostingClassSelectionRequired: true,
    supportedHostingClasses: Object.values(HostingClass),
    planOnly: true,
    executable: false,
    lifecycle: [
      'tenant-intake',
      'identity-provisioning',
      'content-import',
      'hosting-class-selection',
      'product-release-assignment',
      'artifact-build',
      'resource-plan',
      'publication-register',
      'deployment',
      'preflight',
      'form-proof',
      'domain-hold',
      'acceptance',
      'indexing-hold',
      'backup',
      'atlas-register',
    ],
    approvalGates: [
      'owner-deployment-approval',
      'owner-acceptance-approval',
      'owner-indexing-approval',
    ],
    domainHandoffTypes: ['EXTERNAL_DNS', 'AZURE_DNS'],
    customerDeploymentAuthorized: false,
    liveMutation: false,
  };
  return { ...body, planSha256: canonicalDigest(body) };
}

async function buildRetainedPub20SyntheticArtifact(
  repositoryRoot,
  release,
  attribution,
) {
  const sourceRef = 'tools/static-tenant-publication/synthetic-tenant-secondary.json';
  const sourceBytesBefore = await readBytesRef(repositoryRoot, sourceRef);
  const legacy = parseJsonBytes(sourceBytesBefore, sourceRef);
  const canonicalInput = adaptPub20Input(legacy, release, {
    attributionFiles: attributionForPublisher(attribution),
  });
  const first = publishTenantSnapshot(canonicalInput);
  const second = publishTenantSnapshot(canonicalInput);
  if (
    !first.packageBytes.equals(second.packageBytes) ||
    !first.manifestBytes.equals(second.manifestBytes)
  ) {
    throw new ContractError(
      'retained_pub20_nondeterministic',
      'Retained PUB-20 synthetic output is not deterministic.',
    );
  }
  const sourceBytesAfter = await readBytesRef(repositoryRoot, sourceRef);
  if (!sourceBytesBefore.equals(sourceBytesAfter)) {
    throw new ContractError(
      'retained_pub20_source_changed',
      'Retained PUB-20 source changed during local generation.',
    );
  }
  assertPublicFormClientUtf8(first);
  assertPublicFormClientUtf8(second);
  const packageSha256 = sha256(first.packageBytes);
  const manifestSha256 = sha256(first.manifestBytes);
  const proofBody = {
    schemaVersion: RETAINED_PUB20_SCHEMA,
    sourceRef,
    sourceSha256: sha256(sourceBytesBefore),
    buildCount: 2,
    extractedInventoriesIdentical:
      stableStringify(fileInventory(first.files)) ===
      stableStringify(fileInventory(second.files)),
    packageBytesIdentical: true,
    manifestBytesIdentical: true,
    packageSha256,
    manifestSha256,
    preservedPub20Evidence: {
      packageSha256: PRESERVED_PUB20_PACKAGE_SHA256,
      manifestSha256: PRESERVED_PUB20_MANIFEST_SHA256,
      relationship: 'PREDECESSOR_LIVE_EVIDENCE_PRESERVED_NOT_REBUILT',
    },
    utf8: {
      fatalDecodePassed: true,
      exactSendingEllipsisPresent: true,
      replacementCharacterPresent: false,
      mojibakePrefixPresent: false,
    },
    localOnly: true,
    networkCalls: 0,
    postExecuted: false,
    liveMutation: false,
    predecessorEqualityClaimed: false,
  };
  const proof = { ...proofBody, proofSha256: canonicalDigest(proofBody) };
  return {
    packageBytes: first.packageBytes,
    manifestBytes: first.manifestBytes,
    manifest: first.manifest,
    packageSha256,
    manifestSha256,
    proof,
  };
}

function verifyRetainedPub20Synthetic(retained) {
  if (
    !retained ||
    sha256(retained.packageBytes) !== retained.packageSha256 ||
    sha256(retained.manifestBytes) !== retained.manifestSha256
  ) {
    throw new ContractError(
      'retained_pub20_hash_mismatch',
      'Retained PUB-20 synthetic hashes are invalid.',
    );
  }
  const { proofSha256, ...proofBody } = retained.proof;
  if (
    canonicalDigest(proofBody) !== proofSha256 ||
    retained.proof.buildCount !== 2 ||
    retained.proof.postExecuted !== false
  ) {
    throw new ContractError(
      'retained_pub20_proof_invalid',
      'Retained PUB-20 synthetic proof is invalid.',
    );
  }
}

function assertPublicFormClientUtf8(artifact) {
  const file = artifact.files.find(
    (candidate) => candidate.path === 'assets/public-form-client.js',
  );
  if (!file) {
    throw new ContractError(
      'public_form_client_missing',
      'The retained live synthetic artifact must emit the public form client.',
    );
  }
  const bytes = Buffer.isBuffer(file.content)
    ? file.content
    : Buffer.from(String(file.content), 'utf8');
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new ContractError(
      'public_form_client_utf8_invalid',
      'The public form client is not valid UTF-8.',
    );
  }
  if (
    !text.includes('Sending…') ||
    text.includes('\uFFFD') ||
    text.includes('Sendingâ')
  ) {
    throw new ContractError(
      'public_form_client_utf8_text_invalid',
      'The public form client UTF-8 ellipsis is not exact.',
    );
  }
}

function buildIceForm(pages) {
  const contactPage = pages.find((page) => page.pageSlug === 'contact');
  const contact = contactPage?.ContentData?.ContentBlocks?.find(
    (block) => block.type === 'Contact',
  )?.content;
  if (!contact || !Array.isArray(contact.formFields)) return null;
  return {
    formId: 'ice-rink-contact',
    formMappingId: 'ice-rink-contact-pub30',
    formKey: 'ice-rink-contact',
    fieldContractVersion: '1.0.0',
    submitLabel: safeBounded(contact.submitButtonText, 120, 'Request information'),
    fields: normalizeFormFields(contact.formFields),
    consent: {
      name: 'privacyConsent',
      label:
        'I agree to be contacted about this local preview request and understand that no submission will be sent.',
    },
    honeypot: {
      name: 'companyWebsite',
      label: 'Leave this field blank',
    },
  };
}

function projectCmsPage(
  page,
  { tenantId, themeId, formIds },
) {
  const route = routeFromSlug(page.pageSlug);
  const title = safeBounded(
    page.MetaData?.title ?? page.seo?.metaTitle,
    180,
    route === '/' ? tenantId : titleFromRoute(route),
  );
  const description = safeBounded(
    page.MetaData?.description ?? page.seo?.metaDescription,
    320,
    '',
  );
  const blocks = mapSourceBlocks(page.ContentData?.ContentBlocks ?? []);
  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      heading: title,
      body: 'Committed source route retained for local migration review.',
    });
  }
  return {
    pageId: deterministicId('candidate-page', { tenantId, route }),
    revisionId: deterministicId('candidate-revision', {
      tenantId,
      route,
      sourceSha256: canonicalDigest(page),
    }),
    route,
    title,
    description,
    themeId,
    blocks,
    formIds,
    includeInSitemap: false,
  };
}

function projectVegasRoute(
  routeRecord,
  { tenantId, themeId, formIds },
) {
  const route = normalizeRoute(routeRecord.route);
  const title = safeBounded(
    routeRecord.title ?? routeRecord.h1,
    180,
    route === '/' ? 'Strip Club Near Me Vegas' : titleFromRoute(route),
  );
  const heading = safeBounded(routeRecord.h1 ?? title, 240, title);
  const description = safeBounded(routeRecord.description, 320, '');
  const structural = normalizeCountMap(routeRecord.counts ?? {});
  const bodyParts = [
    description,
    `Committed structural projection: ${Object.entries(structural)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ') || 'route retained'}.`,
  ].filter(Boolean);
  return {
    pageId: deterministicId('candidate-page', { tenantId, route }),
    revisionId: deterministicId('candidate-revision', {
      tenantId,
      route,
      sourceSha256: routeRecord.sourceSha256,
    }),
    route,
    title,
    description,
    themeId,
    blocks: [
      {
        type: route === '/' ? 'hero' : 'text',
        heading,
        body: safeBounded(bodyParts.join(' '), 8_000, 'Committed route retained.'),
      },
    ],
    formIds: uniqueSorted(formIds),
    includeInSitemap: false,
  };
}

function mapSourceBlocks(sourceBlocks) {
  return sourceBlocks
    .filter((block) => block?.enabled !== false)
    .map((block, index) => {
      const sourceType = safeBounded(block?.type, 120, `Block ${index + 1}`);
      const content = block?.content ?? {};
      const heading = firstPublicText(content, [
        'headline',
        'title',
        'name',
        'label',
        'kicker',
        'eyebrow',
        'subheadline',
      ]);
      const body = collectPublicText(content, {
        skipKeys: new Set([
          'headline',
          'title',
          'name',
          'label',
          'kicker',
          'eyebrow',
          'backgroundImage',
          'mainImage',
          'image',
          'media',
          'structuredData',
          'buttonLink',
          'secondaryLink',
          'url',
          'href',
          'runtimeSubmitPath',
          'staticEndpointRef',
          'leadRecipientRef',
          'notificationEmailRef',
        ]),
      });
      return {
        type: /hero/i.test(sourceType)
          ? 'hero'
          : /grid|card|faq|callout|cta|contact|cart|pill/i.test(sourceType)
            ? 'card'
            : 'text',
        heading: safeBounded(heading, 240, sourceType),
        body: safeBounded(
          body,
          8_000,
          `${sourceType} source structure retained for local migration review.`,
        ),
      };
    });
}

function projectFormDefinition(
  formDefinition,
  { tenantId, index, defaultConsent },
) {
  const rawFormId =
    formDefinition.formId ??
    formDefinition.id ??
    formDefinition.formKey ??
    `form-${index + 1}`;
  const formId = safeIdentifier(rawFormId, `candidate-form-${index + 1}`);
  const formKey = safeIdentifier(
    formDefinition.formKey ?? formDefinition.formSlug ?? rawFormId,
    formId,
  );
  const fields = normalizeFormFields(formDefinition.fields ?? []);
  const fieldNames = new Set(fields.map((field) => field.name));
  let consentName = safeFieldName(
    formDefinition.consent?.fieldName ?? 'privacyConsent',
    'privacyConsent',
  );
  if (fieldNames.has(consentName)) consentName = 'publicationConsent';
  let honeypotName = safeFieldName(
    formDefinition.spamProtection?.honeypotFieldName ?? 'companyWebsite',
    'companyWebsite',
  );
  if (fieldNames.has(honeypotName) || honeypotName === consentName) {
    honeypotName = 'organizationWebsite';
  }
  return {
    formId,
    formMappingId: safeIdentifier(
      `pub30-${tenantId}-${String(index + 1).padStart(2, '0')}`,
      `pub30-form-${index + 1}`,
      { backend: true },
    ),
    formKey,
    fieldContractVersion: '1.0.0',
    submitLabel: safeBounded(
      formDefinition.submitLabels?.[0] ??
        formDefinition.submitButtonText ??
        formDefinition.name ??
        formDefinition.displayName,
      120,
      'Send preview request',
    ),
    fields:
      fields.length > 0
        ? fields
        : [
            {
              name: 'message',
              label: 'Message',
              type: 'textarea',
              required: false,
              autocomplete: '',
            },
          ],
    consent: {
      name: consentName,
      label: safeBounded(
        formDefinition.consent?.text,
        300,
        defaultConsent,
      ),
    },
    honeypot: {
      name: honeypotName,
      label: 'Leave this field blank',
    },
  };
}

function normalizeFormFields(rawFields) {
  const seen = new Set();
  const output = [];
  for (const [index, raw] of rawFields.entries()) {
    if (raw?.hidden === true || String(raw?.type).toLowerCase() === 'hidden') {
      continue;
    }
    let name = safeFieldName(raw?.name ?? raw?.id ?? `field${index + 1}`, `field${index + 1}`);
    if (seen.has(name)) {
      name = safeFieldName(`${name}${index + 1}`, `field${index + 1}`);
    }
    if (seen.has(name)) continue;
    seen.add(name);
    const rawType = String(raw?.type ?? 'text').toLowerCase();
    const type = ['email', 'tel', 'textarea', 'select'].includes(rawType)
      ? rawType
      : 'text';
    const field = {
      name,
      label: safeBounded(raw?.label, 180, titleFromIdentifier(name)),
      type,
      required: raw?.required === true,
      autocomplete: safeBounded(raw?.autocomplete, 80, ''),
    };
    if (type === 'select') {
      const options = uniqueSorted(
        (raw?.options ?? [])
          .map((option) =>
            safeBounded(
              typeof option === 'object' ? option.label ?? option.value : option,
              120,
              '',
            ),
          )
          .filter(Boolean),
      );
      field.options = options.length > 0 ? options : ['Not specified'];
    }
    output.push(field);
  }
  return output;
}

function buildCmsRouteInventory(pages) {
  return pages.map((page) => ({
    route: routeFromSlug(page.pageSlug),
    pageId: safeBounded(page.PageId ?? page.id, 160, 'page'),
    title: safeBounded(
      page.MetaData?.title ?? page.seo?.metaTitle,
      240,
      titleFromRoute(routeFromSlug(page.pageSlug)),
    ),
    sourceBlockTypes: (page.ContentData?.ContentBlocks ?? []).map((block) =>
      safeBounded(block.type, 120, 'Block'),
    ),
    sourceSha256: canonicalDigest(page),
    includeInSourceSitemap: page.includeInSitemap === true,
    targetIndexingMode: PublicationMode.HELD_NOINDEX,
  }));
}

function formInventory(form) {
  return {
    formId: form.formId,
    formMappingId: form.formMappingId,
    formKey: form.formKey,
    fieldContractVersion: form.fieldContractVersion,
    submitLabel: form.submitLabel,
    fields: form.fields.map(({ name, label, type, required }) => ({
      name,
      label,
      type,
      required,
    })),
    consentField: form.consent.name,
    honeypotField: form.honeypot.name,
    formMode: FormMode.PREVIEW_NO_POST,
    postExecuted: false,
  };
}

function collectPublicMediaReferences(value) {
  const references = new Map();
  walkPublicValues(value, (key, child) => {
    if (typeof child !== 'string') return;
    const text = child.trim();
    const keySuggestsMedia = /image|media|logo|asset|photo|background/i.test(key);
    const valueSuggestsMedia =
      /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i.test(text) ||
      /\/media\/|blob\.core\.windows\.net/i.test(text);
    if (!keySuggestsMedia && !valueSuggestsMedia) return;
    if (/^https:\/\//i.test(text)) {
      try {
        const normalized = safePublicHttps(text);
        references.set(`url:${normalized}`, {
          kind: 'PUBLIC_HTTPS_REFERENCE_NOT_FETCHED',
          reference: normalized,
        });
      } catch {
        // Invalid or credential-bearing media URLs are omitted from public evidence.
      }
      return;
    }
    if (text.startsWith('/') && !text.startsWith('//')) {
      try {
        const normalized = normalizeRoute(text.split(/[?#]/, 1)[0]);
        references.set(`path:${normalized}`, {
          kind: 'ROOT_RELATIVE_REFERENCE_NOT_FETCHED',
          reference: normalized,
        });
      } catch {
        // Unsafe paths are omitted rather than materialized.
      }
    }
  });
  return [...references.values()].sort((left, right) =>
    left.reference.localeCompare(right.reference, 'en'),
  );
}

function normalizeMenu(menu, routeSet) {
  const output = [];
  const seen = new Set();
  for (const item of menu) {
    if (item?.isVisible === false) continue;
    const raw = item?.url ?? item?.href ?? item?.link;
    if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
      continue;
    }
    let route;
    try {
      route = normalizeRoute(raw.split(/[?#]/, 1)[0]);
    } catch {
      continue;
    }
    if (!routeSet.has(route) || seen.has(route)) continue;
    seen.add(route);
    output.push({
      label: safeBounded(item.label ?? item.name, 120, titleFromRoute(route)),
      href: route,
    });
  }
  if (routeSet.has('/') && !seen.has('/')) {
    output.unshift({ label: 'Home', href: '/' });
  }
  return output;
}

function collectCmsRedirects(_pages, _routeSet) {
  return [];
}

function countDeclaredCmsRedirects(_pages) {
  return 0;
}

function buildRouteNavigation(routes) {
  const preferred = [
    '/',
    '/best-strip-clubs-las-vegas',
    '/free-limo-strip-clubs-las-vegas',
    '/las-vegas-strip-club-prices',
    '/bachelor-party-strip-clubs-las-vegas',
    '/couples-strip-clubs-las-vegas',
    '/guides',
    '/clubs',
    '/contact',
  ];
  const byRoute = new Map(
    routes.map((route) => [normalizeRoute(route.route), route]),
  );
  return preferred
    .filter((route) => byRoute.has(route))
    .map((route) => ({
      label: safeBounded(
        byRoute.get(route).title ?? byRoute.get(route).h1,
        120,
        titleFromRoute(route),
      ),
      href: route,
    }));
}

async function loadFrozenAttribution(repositoryRoot) {
  const manifestBytes = await readBytesRef(repositoryRoot, ATTRIBUTION_MANIFEST_REF);
  const manifest = parseJsonBytes(manifestBytes, ATTRIBUTION_MANIFEST_REF);
  if (
    manifest.observedLicenseEvidence?.distributionDecision !==
      LEGAL_DISTRIBUTION_STATE ||
    manifest.observedLicenseEvidence?.declarationConflict !== true
  ) {
    throw new ContractError(
      'attribution_legal_state_invalid',
      'Frozen attribution must retain the unresolved license declaration hold.',
    );
  }
  const files = [];
  for (const [index, record] of (manifest.files ?? []).entries()) {
    const sourcePath = assertSafeRelativeReference(
      record.sourcePath,
      `attribution.files[${index}].sourcePath`,
    );
    const packagePath = assertSafeRelativeReference(
      record.packagePath,
      `attribution.files[${index}].packagePath`,
    );
    const expected = assertSha256(
      record.sha256,
      `attribution.files[${index}].sha256`,
    );
    const sourceBytes = await readBytesRef(repositoryRoot, sourcePath);
    let sourceText;
    try {
      sourceText = new TextDecoder('utf-8', { fatal: true }).decode(sourceBytes);
    } catch {
      throw new ContractError(
        'attribution_utf8_invalid',
        `Frozen attribution is not valid UTF-8: ${sourcePath}`,
      );
    }
    const bytes = Buffer.from(
      sourceText.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'),
      'utf8',
    );
    const actual = sha256(bytes);
    if (actual !== expected) {
      throw new ContractError(
        'attribution_source_hash_mismatch',
        `Frozen attribution hash mismatch: ${sourcePath}`,
      );
    }
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    files.push({
      sourcePath,
      path: packagePath,
      sha256: actual,
      content,
    });
  }
  files.sort((left, right) => left.path.localeCompare(right.path, 'en'));
  if (files.length !== 2) {
    throw new ContractError(
      'attribution_file_count_invalid',
      'Exactly LICENSE and NOTICE attribution files are required.',
    );
  }
  return {
    attributionId: assertSafeIdentifier(
      manifest.attributionId,
      'attribution.attributionId',
    ),
    manifestRef: ATTRIBUTION_MANIFEST_REF,
    manifestSha256: sha256(manifestBytes),
    upstreamCommit: assertSafeIdentifier(
      manifest.upstream?.commit,
      'attribution.upstream.commit',
    ),
    declarationConflict: true,
    legalDistributionState: LEGAL_DISTRIBUTION_STATE,
    files,
  };
}

function attributionForPublisher(attribution) {
  return attribution.files.map(({ path: packagePath, content, sha256: digest }) => ({
    path: packagePath,
    content,
    sha256: digest,
  }));
}

async function buildSourceEvidence(repositoryRoot, sourceRefs) {
  const files = [];
  for (const sourceRef of uniqueSorted(sourceRefs)) {
    const bytes = await readBytesRef(repositoryRoot, sourceRef);
    files.push({
      sourceRef,
      bytes: bytes.length,
      sha256: sha256(bytes),
    });
  }
  const body = {
    schemaVersion: 'pumpkin.committed-source-evidence.v1',
    evidenceMode: 'COMMITTED_LOCAL_READ_ONLY',
    files,
    contentEmbedded: false,
    absolutePathsIncluded: false,
    networkCalls: 0,
    liveMutation: false,
  };
  return { ...body, evidenceSha256: canonicalDigest(body) };
}

function normalizeRelease(releaseContext = {}) {
  const packageVersions = Object.fromEntries(
    Object.entries(releaseContext.packageVersions ?? {})
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([name, version]) => [
        assertSafeIdentifier(name, 'release package name'),
        safeBounded(version, 120, 'unknown'),
      ]),
  );
  return {
    releaseId: assertSafeIdentifier(
      releaseContext.releaseId,
      'release.releaseId',
    ),
    version: safeBounded(releaseContext.version, 120, '0.0.0-local'),
    sourceCommit: assertSafeIdentifier(
      releaseContext.sourceCommit,
      'release.sourceCommit',
    ),
    lockfileSha256: assertSha256(
      releaseContext.lockfileSha256,
      'release.lockfileSha256',
    ),
    packageVersions,
    licenseStatus: LEGAL_DISTRIBUTION_STATE,
  };
}

async function readJsonRef(repositoryRoot, sourceRef) {
  return parseJsonBytes(
    await readBytesRef(repositoryRoot, sourceRef),
    sourceRef,
  );
}

async function readTextRef(repositoryRoot, sourceRef) {
  const bytes = await readBytesRef(repositoryRoot, sourceRef);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new ContractError(
      'source_utf8_invalid',
      `Committed source is not valid UTF-8: ${sourceRef}`,
    );
  }
}

async function readBytesRef(repositoryRoot, sourceRef) {
  const filePath = resolveRepositoryRef(repositoryRoot, sourceRef);
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    throw new ContractError(
      'source_ref_missing',
      `Committed source reference is missing: ${sourceRef}`,
    );
  }
  if (!stat.isFile()) {
    throw new ContractError(
      'source_ref_not_file',
      `Committed source reference is not a file: ${sourceRef}`,
    );
  }
  return fs.readFile(filePath);
}

function resolveRepositoryRef(repositoryRoot, sourceRef) {
  const safeRef = assertSafeRelativeReference(sourceRef, 'sourceRef');
  const root = path.resolve(repositoryRoot);
  const resolved = path.resolve(root, ...safeRef.split('/'));
  const relative = path.relative(root, resolved);
  if (
    relative === '' ||
    relative.startsWith('..') ||
    path.isAbsolute(relative)
  ) {
    throw new ContractError(
      'source_ref_scope_invalid',
      `Source reference escaped the repository: ${sourceRef}`,
    );
  }
  return resolved;
}

function parseJsonBytes(bytes, sourceRef) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new ContractError(
      'json_utf8_invalid',
      `JSON source is not valid UTF-8: ${sourceRef}`,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ContractError(
      'json_parse_invalid',
      `JSON source does not parse: ${sourceRef}`,
    );
  }
}

function assertOutsideRepository(repositoryRoot, outputRoot) {
  const root = path.resolve(repositoryRoot);
  const destination = path.resolve(outputRoot);
  const relative = path.relative(root, destination);
  if (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  ) {
    throw new ContractError(
      'candidate_output_inside_repository',
      'Candidate output must be outside the repository.',
    );
  }
}

async function writeNew(filePath, content) {
  const handle = await fs.open(filePath, 'wx');
  try {
    await handle.writeFile(content);
  } finally {
    await handle.close();
  }
}

async function writeNewJson(filePath, value) {
  await writeNew(filePath, Buffer.from(`${stableStringify(value)}\n`, 'utf8'));
}

async function walkFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name, 'en'),
  )) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function jsonFile(filePath, value) {
  return {
    path: filePath,
    content: `${stableStringify(value)}\n`,
  };
}

function routeFromSlug(value) {
  const slug = String(value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return slug === '' || slug === 'home' ? '/' : normalizeRoute(`/${slug}`);
}

function safeIdentifier(value, fallback, { backend = false } = {}) {
  let normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    .slice(0, 128)
    .replace(/[^a-z0-9]+$/g, '');
  if (backend) {
    normalized = normalized
      .replace(/[._:]+/g, '-')
      .slice(0, 128)
      .replace(/-+$/g, '');
  }
  if (!normalized) normalized = fallback;
  return assertSafeIdentifier(normalized, 'generated identifier', { backend });
}

function safeFieldName(value, fallback) {
  let normalized = String(value ?? '')
    .replace(/[^A-Za-z0-9_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('')
    .replace(/^[^A-Za-z]+/, '')
    .slice(0, 64);
  if (!normalized) normalized = fallback;
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(normalized)) {
    normalized = fallback;
  }
  return normalized;
}

function safePublicHttps(value) {
  const parsed = new URL(String(value));
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password
  ) {
    throw new ContractError(
      'public_https_invalid',
      'Public media reference must be credential-free HTTPS.',
    );
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}

function safeSourceAlias(value) {
  const text = String(value ?? '').replaceAll('\\', '/').replace(/^\/+/, '');
  return assertSafeRelativeReference(text, 'source media alias');
}

function safeBounded(value, maximum, fallback) {
  const text = String(value ?? '').trim();
  if (!text) return String(fallback ?? '');
  return text.length <= maximum ? text : text.slice(0, maximum);
}

function normalizeCountMap(value) {
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, count]) => [
        safeBounded(key, 120, 'count'),
        Math.max(0, Number.isFinite(Number(count)) ? Number(count) : 0),
      ]),
  );
}

function firstPublicText(value, keys) {
  for (const key of keys) {
    const child = value?.[key];
    if (typeof child === 'string' && child.trim()) return stripMarkup(child);
  }
  return '';
}

function collectPublicText(value, { skipKeys }) {
  const output = [];
  const seen = new Set();
  function visit(current, key = '') {
    if (output.join(' ').length >= 7_500) return;
    if (skipKeys.has(key) || /secret|password|token|payload|rawlog/i.test(key)) {
      return;
    }
    if (Array.isArray(current)) {
      for (const child of current) visit(child, key);
      return;
    }
    if (current && typeof current === 'object') {
      for (const [childKey, child] of Object.entries(current)) {
        visit(child, childKey);
      }
      return;
    }
    if (typeof current !== 'string') return;
    const text = stripMarkup(current);
    if (
      !text ||
      /^https?:\/\//i.test(text) ||
      text.startsWith('/') ||
      seen.has(text)
    ) {
      return;
    }
    seen.add(text);
    output.push(text);
  }
  visit(value);
  return output.join(' ').slice(0, 7_900);
}

function walkPublicValues(value, visitor, key = '') {
  if (Array.isArray(value)) {
    for (const child of value) walkPublicValues(child, visitor, key);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) {
      walkPublicValues(child, visitor, childKey);
    }
    return;
  }
  visitor(key, value);
}

function stripMarkup(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromRoute(route) {
  if (route === '/') return 'Home';
  return titleFromIdentifier(route.split('/').filter(Boolean).at(-1));
}

function titleFromIdentifier(value) {
  return String(value ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || 'Field';
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value)))].sort((left, right) =>
    left.localeCompare(right, 'en'),
  );
}

function toPosix(value) {
  return value.replaceAll(path.sep, '/');
}
