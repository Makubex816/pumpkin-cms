# Content Import Runbook

1. Parse JSON package.
2. Run schema validation.
3. Run cross-file route/media/form checks.
4. Run secret scan.
5. Produce validation report.
6. Request CMS preview import approval.
7. If approved later, import into draft/preview scope.
8. Run readback validation.
9. Produce preview evidence package.

Do not write CMS records without explicit import approval.

