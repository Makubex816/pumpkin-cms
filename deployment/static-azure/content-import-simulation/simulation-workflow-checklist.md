# Phase 6S Simulation Workflow Checklist

Use these steps to prove the production content import review flow with placeholder-safe JSON only.

Do not run write imports unless intentionally using a disposable local test page. Do not publish, deploy, purge Cloudflare, send emails, or create provider/state research.

## Checklist

1. Open Content JSON Validator.
2. Paste or upload `simulation-package-valid.json`.
3. Confirm validation completes and displays page results.
4. Paste or upload `simulation-package-with-warnings.json`.
5. Confirm warnings appear for missing `productsOffered`, `areasServed`, static endpoint metadata, and image asset metadata.
6. Open Content Package Staging.
7. Stage `simulation-package-valid.json` with source label `local_simulation_only`.
8. Confirm the package appears in the review queue.
9. Revalidate the staged package.
10. Mark ready only if there are no blocking errors.
11. Open Import Diff.
12. Preview `simulation-package-valid.json` and confirm it previews a create for `phase-6s-valid-simulation-page`.
13. Preview `simulation-package-existing-page-update.json`.
14. If `phase-6d-redirect-test` exists in the selected tenant, confirm it previews an update. If not, confirm it remains safe as a create candidate.
15. Open Import/Export.
16. Load the valid simulation package into JSON import mode.
17. Confirm contract validation and diff preflight appear.
18. Keep import mode as `dry-run`.
19. Run dry-run only.
20. Save the dry-run result to Import History if the ImportRun container and authenticated admin session are available.
21. Confirm no Page documents were created.
22. Confirm no publishing, Azure deployment, Cloudflare purge, email sending, or static deployment occurred.

## Expected Outcomes

- The valid simulation package should parse and validate without blocking errors.
- The warning package should produce warnings without crashing.
- The existing-page update package should preview an update only when the local safe test page exists.
- Import/Export dry-run should produce a report without writing Page documents.
- ImportRun history save is optional and depends on authenticated admin/API availability.
