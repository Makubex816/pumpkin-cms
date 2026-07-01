# Integration Strategy

Classification: `adapter_first_no_external_mutation`

Principles:

- Do not mutate or replace the external SDI-AI repo.
- Do not change external DB assumptions.
- Do not swap databases.
- Keep existing external route and model contracts stable.
- Add compatibility aliases/adapters in current Pumpkin only.
- Make tenant-specific behavior data-driven before creating more tenants.

Implementation strategy:

1. Freeze external commit `947cf05a1b6fbf1721bc3c112e1052f0c6c59b8a` as the compatibility reference.
2. Add route aliases for missing external routes.
3. Add tests proving old and current route families return equivalent behavior.
4. Add FormEntry payload adapter/defaulting for external contact-style submissions.
5. Reconcile source container names and provider metadata.
6. Replace Ice/Roller hard-coded maps with tenant package/profile driven configuration.
7. Run GET-only no-regression.
8. Resume secondary tenant creation only after approval.
