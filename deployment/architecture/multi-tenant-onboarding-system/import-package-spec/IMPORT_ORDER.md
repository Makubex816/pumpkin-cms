# Import Order

Recommended order:

1. Parse all JSON.
2. Validate `manifest.json`.
3. Validate `tenant.json`.
4. Validate `owner-contacts.json`.
5. Validate `site.json`.
6. Validate `routes.json`.
7. Validate `media-assets.json`.
8. Validate `forms.json`.
9. Validate `seo.json`.
10. Validate `theme.json`.
11. Validate each file in `pages/`.
12. Validate `redirects.json`.
13. Validate `approvals.json`.
14. Run cross-file validators.
15. Produce `validation-report.json` and `VALIDATION_REPORT.md`.
16. Request explicit CMS import approval.
17. Import tenant/site scaffolding.
18. Import media metadata.
19. Import forms.
20. Import pages.
21. Import SEO/theme/redirect settings.
22. Run readback and preview validation.

Rollback behavior should be planned before import. For draft imports, rollback may delete or disable the staged tenant records. For updates, rollback requires captured pre-import snapshots.
