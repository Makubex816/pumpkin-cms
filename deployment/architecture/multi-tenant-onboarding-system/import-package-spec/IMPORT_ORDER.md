# Import Order

Recommended order:

1. Parse all JSON.
2. Validate `manifest.json`.
3. Validate `tenant.json`.
4. Validate `site.json`.
5. Validate `routes.json`.
6. Validate `media-assets.json`.
7. Validate `forms.json`.
8. Validate `seo.json`.
9. Validate `theme.json`.
10. Validate each file in `pages/`.
11. Validate `redirects.json`.
12. Run cross-file validators.
13. Produce `VALIDATION_REPORT.md`.
14. Request explicit CMS import approval.
15. Import tenant/site scaffolding.
16. Import media metadata.
17. Import forms.
18. Import pages.
19. Import SEO/theme/redirect settings.
20. Run readback and preview validation.

Rollback behavior should be planned before import. For draft imports, rollback may delete or disable the staged tenant records. For updates, rollback requires captured pre-import snapshots.

