# V2.8.18 Live Site Regression Investigation And Recovery Plan

Status: complete read-only investigation.

This package investigates why the live IceSkatingRinkRentals.com public website does not match the intended older image-rich customer-facing experience and instead maps to a newer minimal static page set.

No production deploy was performed in V2.8.18.

## Classification

| Item | Value |
| --- | --- |
| Lane | V2.8 Tenant Website / Public Website Regression Recovery |
| Classification | `readonly_live_site_regression_investigation_no_deploy` |
| Production-bound target | `swa-ice-static-staging` |
| Isolated staging target | `swa-ice-static-isolated-staging` |
| Boundary rule | custom-domain attachment determines production boundary |

## Package Index

- `result-manifest.json`
- `current-state-summary.md`
- `production-bound-target-classification.md`
- `isolated-staging-target-classification.md`
- `live-site-content-regression-summary.md`
- `deployment-evidence-timeline.md`
- `current-live-artifact-candidate.md`
- `last-known-good-image-heavy-candidates.md`
- `asset-inventory.md`
- `page-source-inventory.md`
- `static-output-artifact-inventory.md`
- `root-cause-evidence.md`
- `missing-evidence.md`
- `rollback-recovery-options.md`
- `rebuild-recovery-options.md`
- `hybrid-recovery-option.md`
- `new-public-website-publishing-gates.md`
- `owner-decision-checklist.md`
- `no-production-deploy-confirmation.md`
- `risk-and-open-decisions.md`
- `next-phase-prompt.md`
- `validation-summary.md`

