# Tenant publication product

This package is the deterministic, tenant-neutral source productization slice for
Pumpkin publication. It compiles a canonical snapshot into an immutable static
artifact, records releases and artifacts in tenant-aware append-only registries,
drives resumable/idempotent onboarding jobs, and exposes an injected-adapter Azure
Static Web Apps deployment service.

## Safety boundary

- Artifact creation is pure and performs no live I/O.
- Every generated artifact remains `noindex`, emits a disallow-all `robots.txt`,
  and omits sitemap routes. Indexing requires a later, separately authorized
  product slice.
- `PREVIEW_NO_POST` emits no form transport. `PUBLIC_FORMS_LIVE` emits only the
  ticketed public form contract and sends no reusable credential.
- The built-in Azure plan is plan-only. The deployment service performs work only
  through an explicitly injected adapter and per-operation approval references.
- The current credential provider accepts metadata for
  `PUMPKIN_DPAPI_ENVELOPE_V1`, Windows DPAPI `CurrentUser`, owner-only ACLs, and
  child-process environment delivery. It never returns a credential value,
  accepts no command-line credential, captures no child output, and clears the
  child environment after exit. Token reset and rotation are unsupported.
- The multi-operator managed-secret provider is design-only and cannot execute.
- Azure Static Web Apps is restricted to the `Free` SKU. Custom-domain work is
  read/handoff-only and remains `HELD`; deletion is a typed-confirmation plan,
  never an execution operation.
- Optional `LICENSE`, `NOTICE`, and third-party notice files are copied only when
  their exact SHA-256 values validate. Distribution remains
  `HELD_PENDING_OWNER_LEGAL_REVIEW`.

## Candidate boundary

Committed-source evidence classifies Ice Rink Rentals as
`STATIC_READY_WITH_ADAPTATION`. Party Pros Philadelphia and Strip Club Near Me
Vegas are `SHARED_COMPATIBILITY_REQUIRED` while retaining hosting class
`SHARED_RUNTIME_COMPATIBILITY`. Their deterministic synthetic compiler probes do
not reclassify the committed shared-runtime source. Airstrip is metadata-only and
is not built because its source tree is not present in this scope.

The PUB-20 adapter converts the legacy `tools/static-tenant-publication` input
shape into the canonical contract without changing the preserved PUB-20 files.

## Current-tenant local candidate artifacts

The current-tenant generator reads only committed Ice Rink Rentals, Party Pros
Philadelphia, and Strip Club Near Me Vegas source evidence. It creates
deterministic local candidate packages, migration-readiness packets, and held
orchestrator/DNS handoff plans. Airstrip remains metadata-only: the generator
does not read a missing source tree, make a public request, or create an Airstrip
package.

The generator also recompiles the retained committed PUB-20 synthetic fixture
twice. It requires byte-identical packages and manifests and validates the
public-form client with fatal UTF-8 decoding, including the exact `Sending…`
text. This is a local build proof only; it performs no form POST.

Output must be a new directory outside the repository:

```text
node tools/tenant-publication-product/generate-current-tenant-candidates.mjs --out <outside-repository-directory> --source-commit <exact-40-character-sha>
```

Every static and candidate package contains the exact materialized upstream
`LICENSE` and `NOTICE` bytes under
`third-party/sdi-ai-pumpkin-cms/`. Line endings are normalized to the frozen
CRLF materialization contract before hashing. The unresolved upstream license
declaration conflict remains
`HELD_PENDING_OWNER_LEGAL_REVIEW`.

## Validation

Run:

```text
node tools/tenant-publication-product/validate.mjs
```

Validation is local-only and uses synthetic content, an in-memory deployment
adapter, and a temporary registry file. It performs no install, deployment,
network call, DNS/custom-domain mutation, form POST, indexing action, or token
rotation. It also builds and writes the three current-tenant candidates twice
to separate temporary directories and requires identical inventories and
hashes.
