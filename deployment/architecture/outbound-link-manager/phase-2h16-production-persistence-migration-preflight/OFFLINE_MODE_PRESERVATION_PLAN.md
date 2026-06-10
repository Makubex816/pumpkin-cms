# Offline Mode Preservation Plan

Offline/local must remain available after production persistence exists.

Preserve:

- local scanner
- local file-backed store
- fake provider
- offline tenant bundle import/export
- local render validation
- local Backup Center export validation
- Admin mock provider
- local API fake provider
- local write-action sandbox
- local trace validation

Implementation rule:

Production providers must be additive. They must not replace local files, fixtures, test scripts, or `.tmp` workflows.

Developer and operator workflows should be able to run without Azure, CMS, paid APIs, external crawlers, or protected configuration.
