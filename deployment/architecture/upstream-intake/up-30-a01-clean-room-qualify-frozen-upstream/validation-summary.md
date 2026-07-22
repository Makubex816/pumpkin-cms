
# Validation summary

Status: `complete_frozen_upstream_qualified_with_holds_ready_for_int10`

Validation was performed with:

- Frozen source integrity checks.
- Two independent clean-room roots.
- Bundle clone commit/tree verification.
- Schema generator and contract tests.
- Exact .NET SDK 10.0.100 restore/build/test attempts after local outside-repo toolchain install.
- Actual npm locked restore, audit, TypeScript package build, and starter build attempts through `cmd.exe`.
- Static licensing, package-completeness, feature, API/runtime, and security scans.
- Determinism comparisons.

Principal holds:

- Exact .NET SDK 10.0.100 was not available from the host SDK resolver and was installed locally under the UP-30 outside-repository tools directory for qualification.
- No committed .NET packages.lock.json files were present; exact-SDK locked-mode restore/build/test passed, but NuGet transitive lockfile evidence remains absent.
- The repository root contains a package-lock.json but no root package.json, so root-level npm ci cannot qualify a workspace dependency graph.
- pumpkin-ts-models npm ci and build passed in both clean-room roots, but npm audit reported high-severity dev-dependency advisories for brace-expansion and minimatch.
- pumpkin-block-views has no adjacent package-lock.json; npm ci fails and build cannot resolve tsc under locked restore.
- apps/starter-app has no adjacent package-lock.json; npm ci fails and type-check/build cannot resolve tsc under locked restore.
- npm audit could not be completed for block-views or starter-app because lockfiles are absent.
- No upstream GitHub Actions workflow was present in the frozen source to use as an authoritative CI mirror.
- The local exact-SDK first-run emitted a development certificate installation message; no trust command, live service activation, or deployment was performed.

Raw evidence:

- `program-management/upstream-intake/UP-30-A01/evidence/qualification-result.json`
- `program-management/upstream-intake/UP-30-A01/evidence/command-results.json`
- `program-management/upstream-intake/UP-30-A01/evidence/dotnet-exact-sdk-result.json`
- `program-management/upstream-intake/UP-30-A01/evidence/npm-actual-result.json`
- `program-management/upstream-intake/UP-30-A01/logs`

## Atlas snapshot version correction

UP-30 initially generated a distinct successor package while retaining the predecessor version number 3.2.0. Before repository closeout, the successor was regenerated as 3.3.0. The UP-20 v3.2.0 baseline remained unchanged.

- Preserved v3.2.0 package SHA-256: `cf0a43593774a85e45de0706f85a7ceff24219de479a263db216374ab0c69850`
- New v3.3.0 package SHA-256: `a15eaa82ba1a8dba9b5a89042c19638d593c336eb6bddaf3610e4fac187aa3a1`
- New v3.3.0 manifest SHA-256: `3618ea67a1d166ea479052ac7e1cda8e4e87b97a537e8f096d016ec205f9a649`
- Deterministic package rebuild: `true`
- ZIP entries read successfully for CRC/read validation: 137
- Extracted run inventories identical: true
- No absolute paths, raw logs, customer payload files, or secret values found in the v3.3.0 distributable package.
