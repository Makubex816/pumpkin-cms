
# Qualification disposition matrix

| Area | Status | Evidence |
|---|---|---|
| Entry gates and clean-room environment | `QUALIFIED` | UP-20 carryforward, source archive, bundle clone, and run1/run2 inventory checks. |
| Frozen source integrity | `QUALIFIED` | Bundle/archive/manifest hashes and commit/tree checks. |
| Source and toolchain inventory | `QUALIFIED_WITH_HOLDS` | Exact SDK 10.0.100 was installed locally outside the repo after host SDK resolution failed. |
| Dependency restore and audit | `QUALIFIED_WITH_HOLDS` | Exact-SDK .NET restore passed; pumpkin-ts-models npm ci passed; block-views/starter/root Node locked restore and audits remain held. |
| Licensing and notice | `QUALIFIED_WITH_HOLDS` | License/notice files are present; legal acceptance remains outside automated qualification. |
| Schema-first block contracts | `QUALIFIED` | Generator --check and contract tests in run1/run2. |
| .NET build and test | `QUALIFIED_WITH_HOLDS` | Exact-SDK restore/build/test passed in both clean-room roots; NuGet lockfile evidence remains absent. |
| TypeScript packages | `QUALIFIED_WITH_HOLDS` | pumpkin-ts-models passed; pumpkin-block-views remains blocked by missing lockfile/local tsc. |
| Starter/admin build | `QUALIFIED_WITH_HOLDS` | starter-app npm ci/type-check/build logs. |
| Visual editor and unique CSS proof | `UNKNOWN_BLOCKED_BY_EARLIER_FAILURE` | Source inventory plus starter build status. |
| Theme CSS publishing | `UNKNOWN_BLOCKED_BY_EARLIER_FAILURE` | Source inventory plus starter build status. |
| FormEntries and CAPTCHA-adjacent behavior | `QUALIFIED_WITH_HOLDS` | Static source inventory; no live CAPTCHA activation performed. |
| API and runtime contracts | `QUALIFIED_WITH_HOLDS` | Static API inventory and exact-SDK .NET build state. |
| Package and distribution completeness | `FAILED_PACKAGE_COMPLETENESS` | block-views and starter-app lack package-lock evidence; package-suite distribution proof incomplete. |
| Security and dependency review | `QUALIFIED_WITH_HOLDS` | Static scan found no high-risk secrets; npm audit found high dev-dependency advisories in pumpkin-ts-models and audits were incomplete elsewhere. |
| Determinism | `QUALIFIED_WITH_HOLDS` | Run1/run2 source and command inventories compared; full build determinism remains held by partial Node restore. |
