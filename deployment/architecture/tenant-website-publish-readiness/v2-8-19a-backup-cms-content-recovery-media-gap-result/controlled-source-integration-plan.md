# Controlled Source Integration Plan

Next implementation should be local-only until separately approved.

Planned steps:

1. Create a small recovery adapter that reads sanitized copies of the approved CMS page JSON shape.
2. Map backup page fields into the `apps/ice-rink-web` static source model.
3. Preserve the recovered route set and expected-404 routes.
4. Map page media slots into renderer-supported image fields.
5. Attach local or approved media paths only after binary recovery.
6. Preserve form metadata without submitting forms.
7. Preserve SEO title, description, canonical, and share image intent.
8. Run local validation and static output checks.
9. Deploy only to `swa-ice-static-isolated-staging` if a later deployment phase is explicitly approved.

Not allowed in this phase:

- no source integration
- no backup copy into repo
- no image binary commit
- no deploy

