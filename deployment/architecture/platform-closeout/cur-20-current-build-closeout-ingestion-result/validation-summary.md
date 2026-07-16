# Validation summary

## Passed

- CRSTUR result package is committed as `7c252060d18df4001586e61f1ed8db0d152f1d01`.
- CRSTUR result manifest parsed and matched expected status.
- Active repository path and branch were verified.
- Git staging was empty before CUR-20 documentation writes.
- Supplied Atlas bridge ZIP SHA-256 matched the known value.
- Supplied Atlas bridge ZIP read/CRC validation passed.
- Supplied working-memory ZIP SHA-256 matched the known value.
- Supplied working-memory ZIP read/CRC validation passed.
- Atlas bridge JSON/NDJSON and internal checksums validated.
- Working-memory JSON and internal checksums validated.
- YAML structural scans found no leading-tab or control-character issues in YAML inputs.
- Live App Service plan readback confirmed S2 / two workers.
- Live API/Admin/starter app and rollback slot readbacks succeeded.
- Active API, rollback-slot, Admin, and starter deployment IDs were read.
- Production feature flags matched CRSTUR carryforward.
- API `/health`, `/api/health`, and `/health/ready` returned 200.
- Admin and starter root GET checks returned 200.
- Upstream `main` head was read from GitHub API and confirmed with `git ls-remote`.
- GitHub status/check-run readback was performed.
- No live mutation occurred.
- No package ZIP was generated.
- No active Atlas overwrite occurred.
- No upstream write occurred.
- No Git staging or commit was performed for CUR-20.

## Blocked or incomplete by hard stop

- Active Build Atlas not located.
- Active Atlas backup not created because no active Atlas was found.
- Active Atlas validation not possible.
- Supplied Atlas bridge not reconciled into active Atlas.
- Active Atlas version not advanced.
- Full legacy crosswalk uniqueness not finalized.
- Working-memory v1.0.0 not generated.
- CHAT-PACK not regenerated from a validated active Atlas.
- Deterministic package build-twice validation not applicable because package generation was blocked.

## Tooling limitations

The supplied Atlas package includes Python tooling, but the local machine did not expose `python` or `py`. CUR-20 therefore used PowerShell/Node-compatible validation for checksums, JSON/NDJSON parsing, ZIP read validation, and bounded YAML structural checks instead of running the package's Python validator.

