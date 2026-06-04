# Ice Azure CLI Remediation

Generated: 2026-06-04

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Purpose

This package documents how to remediate the Azure CLI availability blocker so future Ice production media Azure read-only discovery can run.

This is local tooling planning only. No software was installed, no Azure login was run, no Azure discovery was performed, and no production action occurred.

## Current Blocker

The prior Azure read-only check found:

```text
Azure CLI availability: MISSING
```

Because `az` was unavailable, subscription, resource group, storage account, Static Web App, and media resource candidates could not be confirmed or ruled out.

## Package Files

- `AZURE_CLI_MISSING_BLOCKER.md`
- `INSTALL_OPTIONS.md`
- `LOGIN_OPTIONS.md`
- `READONLY_DISCOVERY_COMMANDS.md`
- `SECURITY_BOUNDARIES.md`
- `NEXT_USER_ACTIONS.md`
- `NEXT_READONLY_CHECK_PROMPT.md`
- `manifest.json`

## Current Readiness

- Static dry run completed: yes
- Static route output ready: yes
- Static output quality gates: no
- Media production URL readiness: no
- Contact form production readiness: no
- Azure read-only discovery readiness: blocked by missing Azure CLI
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

## No-Action Result

No install, login, resource creation, upload, DNS change, deployment, CMS write, MediaAsset write, protected config read, email/Microsoft 365 action, generated static artifact staging, raw image staging, secret printing, token printing, connection string printing, or Roller work occurred.
