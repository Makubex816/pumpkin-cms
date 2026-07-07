# Admin Form Designer Integration Result

Status: starter-local adaptation complete; production Admin UI preserved.

The upstream starter form designer was imported under:

`apps/starter-app/src/app/admin/(workspace)/forms/`

Adaptations:

- The starter form editor now includes active FormDefinition-required fields such as `siteKey`, `formKey`, `status`, `formType`, `submitAction`, `runtimeSubmitPath`, routing, consent, and audit metadata.
- The starter form definitions client accepts both upstream `definitions` and active Pumpkin API `formDefinitions` response keys.
- Embedded starter `/admin` is documented as starter-template only.

The standalone Admin UI under `apps/admin` was not replaced or redeployed. Current `/dashboard/forms` and `/dashboard/form-builder` source remains the production Admin UI path.
