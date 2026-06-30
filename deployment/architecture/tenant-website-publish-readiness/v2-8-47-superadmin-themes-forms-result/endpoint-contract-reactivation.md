# Endpoint Contract Reactivation

V2.8.36 persisted contract excluded Theme and FormDefinition. V2.8.47 reactivated them for source review.

Theme source status:

- Public Theme read routes exist for active/specific Theme reads with tenant API key behavior.
- Admin Theme list, active read, specific read, create, update, and delete routes exist.
- Admin Theme routes enforce route tenant equals token tenant unless role is `SuperAdmin`.

FormDefinition source status:

- `FormDefinition` models and default definitions exist.
- Page documents can contain inline `formDefinitions`.
- No standalone FormDefinition Admin CRUD routes exist.
- No standalone public FormDefinition read route exists.
- No standalone FormDefinition Cosmos service/storage path exists.

Contract classification:

- Theme: `reactivated_source_supported`.
- FormDefinition: `formdefinition_api_requires_design_phase`.
