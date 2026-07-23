# Tenant publication product

This package is the deterministic, tenant-neutral source productization slice for
Pumpkin publication. It compiles a canonical snapshot into an immutable static
artifact, records releases and artifacts in tenant-aware append-only registries,
drives resumable/idempotent onboarding jobs, and exposes an injected-adapter Azure
Static Web Apps deployment service.

## Safety boundary

- Artifact creation is pure and performs no live I/O.
- Routes and artifact paths reject control characters, wildcard syntax, encoded
  ambiguity, traversal, separators outside the canonical grammar, and
  Static-Web-App routing patterns. Portable case-fold and file/descendant
  collisions are rejected. Deterministic TAR creation and reading require
  writer-exact metadata fields and matching manifest, archive, and extracted
  inventories.
- Every generated artifact remains `noindex`, emits a disallow-all `robots.txt`,
  and omits sitemap routes. Indexing requires a later, separately authorized
  product slice.
- `PREVIEW_NO_POST` emits no form transport. `PUBLIC_FORMS_LIVE` emits only the
  ticketed public form contract and sends no reusable credential. Live form
  mode additionally requires an Ed25519 authority accepted by a
  module-branded verifier whose public-key SHA-256 was pinned in
  `PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256` and whose complete canonical
  verifier-configuration SHA-256, including its revocation snapshot, was
  pinned in `PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256` before module import.
  Either missing or mismatched boot pin holds publication. There is no default
  or per-call raw trust key. The signed authority binds the exact
  origin, tenant, publication, release, artifact, snapshot, normalized forms
  digest, validity window, and active revocation snapshot. Its complete signed
  receipt is package-bound and revalidated before deploy or rollback; the
  static client also fails closed after receipt expiry. A failed or
  response-lost form submission retains one logical submission seed for an
  exact retry; an explicit reset creates a new seed.
- Embedded media is content-hash verified and must satisfy a closed
  MIME-to-extension and file-signature contract; active SVG, HTML, JavaScript,
  and mismatched bytes are rejected. External media must be classified
  `MUTABLE_UNVERIFIED_REFERENCE`, cannot claim a SHA-256, and makes publication
  fidelity explicitly incomplete. Generated CSS accepts only its closed
  resource syntax: imports, escaped imports, comments that hide tokens,
  relative URLs, `image-set`, and every other unclassified fetch syntax fail
  closed. Canonical media paths and aliases share one portable collision
  namespace.
- The built-in Azure plan is plan-only. Deployment actions come from a closed
  action/provider/mutation table. Mutations require a signed, expiry- and
  revocation-bound authority for the exact context, payload, operation, and
  idempotency key under public-key hashes pinned before import in
  `PUMPKIN_DEPLOYMENT_MUTATION_PUBLIC_KEY_SHA256` and
  `PUMPKIN_DEPLOYMENT_READBACK_PUBLIC_KEY_SHA256`. The canonical digest of the
  complete deployment verifier configuration, including both keys and its
  revocation list, must also be boot-pinned in
  `PUMPKIN_DEPLOYMENT_VERIFIER_SHA256`. Generic adapter success requires a
  separately signed,
  action-specific readback; a status string or caller-provided metadata cannot
  establish success. Exact deployment independently hashes the package, raw
  manifest, deterministic TAR inventory, and staged file tree before execution
  and again after execution. Rollback likewise inspects an exact predecessor
  package, manifest, and staged inventory, binds the exact
  `predecessorReleaseId`, and uses the same sealed credential/helper boundary
  as deployment. Serialized operations retain and reverify the complete signed
  mutation authority. Historical recovery still verifies that signature under
  the same process-boot-pinned mutation key; it ignores only current expiry and
  revocation-snapshot status so authentic interrupted operations remain
  reconcilable, while new execution always requires a currently active
  authority. Mutations also require one absolute outside-repository
  durable operation-ledger root pinned before import in
  `PUMPKIN_DEPLOYMENT_OPERATION_LEDGER_ROOT`. A caller-selected alternate root
  is rejected. Each exact operation is claimed before mutation; interrupted or
  ambiguous attempts are held for signed reconciliation, a proven
  no-mutation disposition permits only a bounded corrected retry, and a
  completed exact operation replays its durable result without another
  mutation.
- The current credential provider accepts metadata for
  `PUMPKIN_DPAPI_ENVELOPE_V1`, Windows DPAPI `CurrentUser`, owner-only ACLs, and
  a future audited-helper handoff. It never returns a credential value or
  accepts a plaintext callback, arbitrary executable, caller-supplied child
  spawn, or command-line credential. The built-in provider is explicitly
  `DESIGN_HELD_TRUST_ANCHOR_UNCONFIGURED`: no helper execution is available and
  no helper bytes, digest, runner, or private material are fabricated. The
  future handoff contract carries a value-free logical envelope metadata ID
  and envelope SHA-256 along with the exact artifact hashes and deploy/rollback
  action. A future executable provider must resolve that ID beneath a
  privileged process-boot-pinned external locator base; repository-relative or
  caller-selected envelope paths are forbidden. No such locator or executable
  helper is implemented here. Token reset and rotation are unsupported.
- The multi-operator managed-secret provider is design-only and cannot execute.
- Held orchestration steps never become runnable merely because dependencies
  succeeded. Omitted sensitive-step actions default to `hold` and require
  explicit hold requirements. Dry-run plans cannot contain `execute`, and
  sensitive execution must first be represented as a hold. Resume requires an
  Ed25519 authority accepted under the process-boot-pinned
  `PUMPKIN_HOLD_AUTHORITY_PUBLIC_KEY_SHA256` key and complete
  `PUMPKIN_HOLD_AUTHORITY_VERIFIER_SHA256` verifier/revocation snapshot, and is
  bound
  to the tenant, publication, release, artifact, job, plan, step, exact
  released action, approval reference, validity, and revocation snapshot.
  Stored historical receipts remain signature-auditable when a later
  revocation snapshot supersedes their recorded snapshot, while every new or
  executable transition is checked against the current snapshot and time.
  Every job mutation requires one absolute outside-repository durable store
  pinned before import in `PUMPKIN_PUBLICATION_JOB_STORE_ROOT`. The store uses
  immutable revision heads, content CAS, and separate one-time authority-ID and
  authority-hash ledgers; stale writers and authority reuse fail closed.
  Expiry is rechecked before a held step starts and before any effective
  success/partial/no-op outcome. Interrupted locks, temporary heads, or
  authority claims require explicit verified reconciliation and never make an
  authority reusable. Rollback failures remain retry-ready for a bounded
  three-attempt sequence.
- Registries apply exact kind-specific payload schemas. Publication artifacts
  bind tenant UID, publication, source snapshot, release, hosting/modes,
  package, manifest, distinct route/media/form inventories, and complete
  predecessor/rollback lineage. Releases bind test evidence and starter
  artifact/image identities. File-backed mutations use exclusive locking plus
  filesystem/content CAS, durable temp-file and directory sync, atomic rename,
  and durable readback before advancing detached state; there is no public
  unlocked writer or live mutable registry view.
- Product releases require the complete named qualification-suite set, every
  suite in `PASSED` state, an exact 40-hex source commit, and explicit
  distribution-license state. A missing or failed suite, invalid source
  identity, or unresolved license state cannot become an active release.
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

Candidate keys and every candidate/index/manifest/readiness/orchestrator shape
are closed and cross-bound to the same tenant, publication, artifact, snapshot,
release, qualification, and hosting lineage. Source bytes are read only from
exact regular blobs in the supplied Git commit, never from the working tree.
Output traversal uses `lstat` plus real-path containment and rejects symbolic
links and junctions.
The index records the SHA-256 of the exact serialized manifest file. Vegas keeps
its committed `/404.html` route in source inventory but does not project it,
because the canonical artifact owns that generated system path; its source
qualification is unchanged.

The generator also recompiles the retained committed PUB-20 synthetic fixture
twice. It requires byte-identical packages and manifests and validates the
public-form client with fatal UTF-8 decoding, including the exact `Sending…`
text. This is a local build proof only; it performs no form POST.

Generation requires a completely clean worktree (including no untracked files
or active Git operation), `--source-commit` equal to current `HEAD`, and
both `PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256` and
`PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256` pinned before Node starts. The latter
must equal the canonical digest of the bundle's complete
`verifierConfiguration`.
`--platform-origin-authorization` must name an absolute, regular JSON file
outside the repository. Its schema is
`pumpkin.platform-origin-authorization-bundle.v1` with exactly
`schemaVersion`, `authority`, and `verifierConfiguration`; it contains no
private key.

Output must be a new directory outside the repository:

```text
node tools/tenant-publication-product/generate-current-tenant-candidates.mjs --out <outside-repository-directory> --source-commit <exact-current-HEAD-sha> --platform-origin-authorization <absolute-outside-repository-json>
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

Validation is local-only and uses synthetic content, runtime-generated
ephemeral Ed25519 test keys pinned before a dynamic product import, signed
in-memory readbacks, a test-only synthetic sealed deployment provider,
one boot-pinned outside-repository temporary deployment-operation ledger, one
boot-pinned outside-repository publication-job store, and temporary registry
files.
The built-in DPAPI provider remains held throughout. Validation performs no
install, deployment,
network call, DNS/custom-domain mutation, form POST, indexing action, or token
rotation. It also builds and writes the three current-tenant candidates twice
to separate temporary directories and requires identical inventories and
hashes. Adversarial checks cover unsafe routes and paths, case/prefix archive
collisions, canonical TAR fields, manifest/TAR/staged inventory drift, registry
schema/lineage/revision forgeries, signed hold and origin authority
cross-binding, expiry and revocation, candidate shape/real-path attacks,
mutable external media, plaintext callback and runner injection, exact
deployment and rollback identities, signed action readbacks, and nonzero,
signaled, or non-success deployment results. Every rejected deployment result
must end with a `failed` journal event.

The privileged runtime has no permissive defaults. Before importing the
product, it must set every trust and durable-state prerequisite applicable to
the operation:

```text
PUMPKIN_PLATFORM_ORIGIN_PUBLIC_KEY_SHA256
PUMPKIN_PLATFORM_ORIGIN_VERIFIER_SHA256
PUMPKIN_DEPLOYMENT_MUTATION_PUBLIC_KEY_SHA256
PUMPKIN_DEPLOYMENT_READBACK_PUBLIC_KEY_SHA256
PUMPKIN_DEPLOYMENT_VERIFIER_SHA256
PUMPKIN_DEPLOYMENT_OPERATION_LEDGER_ROOT
PUMPKIN_HOLD_AUTHORITY_PUBLIC_KEY_SHA256
PUMPKIN_HOLD_AUTHORITY_VERIFIER_SHA256
PUMPKIN_PUBLICATION_JOB_STORE_ROOT
```

Verifier digests are lowercase SHA-256 values of the complete canonical
configuration, not only the public key. Durable roots are privileged absolute
paths outside the repository and are fixed for the lifetime of the process.
