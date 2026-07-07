# Starter Sample App Impact Audit

Status: real new starter app confirmed.

The partner "starter-app" is a newly added application:

`apps/starter-app`

It is not merely `apps/sample-app`.

Starter app contents include:

- `/admin` route tree.
- Local Next API routes under `/api/admin/...`.
- Local public submit route under `/api/forms/submit/[type]`.
- FormDefinition editor/list components.
- Page visual editor and page map.
- Theme editor/list.
- Contact form block component.
- Tenant config helpers.
- Starter content and theme files.

Additional upstream sample changes:

- `apps/sample-app-2` is newly added as a second sample/admin-capable app.
- Existing `apps/sample-app` was changed for static theme workflow and ISR-related requirements.

Impact on Airstrip:

- The starter app may be useful for future tenant creation and template normalization.
- It does not need to be integrated before Airstrip custom-domain cutover because Airstrip already has a production default-host Next runtime.
- Deploying starter app now would introduce a competing site/admin/API pattern and should be deferred.

Integration recommendation:

Use `apps/starter-app` as a reference/template lane after cutover or in a separate isolated proof, not as an immediate replacement for the current Airstrip runtime.
