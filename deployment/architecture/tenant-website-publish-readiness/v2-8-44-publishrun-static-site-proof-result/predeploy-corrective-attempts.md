# Predeploy Corrective Attempts

Several predeploy corrective runs exposed local source/tooling gaps before the final successful lane. Each stopped run was cleaned up before continuing, with Admin readback HTTP 404 for its proof slug, and no successful SWA deployment occurred until the final proof run.

Corrected gaps:

- Relative login endpoint handling in the runtime harness.
- Azure CLI and SWA CLI Windows spawn handling through `cmd.exe /c`.
- CMS snapshot admin-token mode without public API key.
- Seed fallback for missing approved Ice launch pages/theme when live Admin pages are absent.
- Proof-only noindex validator allowlist for isolated proof artifacts.
- Static form approval env propagation into validators.

These corrective artifacts are retained only under ignored `.tmp/v2-8-44/runtime/` and contain no secret values.
