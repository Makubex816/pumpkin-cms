# Model Parity

Classification: `external_core_models_preserved_current_models_extended`

External core models:

- Tenant
- Page
- User
- Theme
- FormDefinition
- FormEntry
- HTML block models

Current added model files:

- `MediaAsset.cs`
- `PublishRun.cs`
- `ImportRun.cs`
- `FormBlock.cs`
- `CustomHtmlBlock.cs`
- `TrustedEmbedBlock.cs`

Current model extensions:

- Page now includes redirect, media, fulfillment, ads, quality, workflow, revision, static publishing, template, linking, schema, service, form config, domain routing, import provenance, and deployment hook metadata.
- FormDefinition now includes site/form keys, status/version, runtime submit path, static endpoint refs, routing, spam, consent, validation, hidden fields, and sensitive field flags.
- FormEntry now includes site/form keys, source page, lead type, spam status, consent, static endpoint refs, and routing metadata.
- Theme now includes design system metadata.

Compatibility decision:

Keep added fields optional/backward-compatible. Do not require external payloads to provide current-only fields unless an adapter fills defaults.
