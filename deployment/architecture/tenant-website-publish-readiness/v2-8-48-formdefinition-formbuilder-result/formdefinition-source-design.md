# FormDefinition Source Design

Existing model:

- `apps/pumpkin-net-models/Models/FormDefinition.cs:5` defines `FormDefinition`.
- `apps/pumpkin-net-models/Models/FormDefinition.cs:95` defines `FormDefinitionField`.
- `apps/pumpkin-net-models/Models/Page.cs:132` retains page-embedded `formDefinitions`.

Implemented API design:

- Public read validates tenant API key and returns only `active` or `published` definitions.
- Admin CRUD uses JWT auth and route tenant authorization.
- Identity uses slug-normalized `id`, `formKey`, and `formType`.
- Storage uses the source-confirmed `FormDefinition` container and `/tenantId` partition key.
- FormDefinition references reject high-confidence secret-like values before storage.
