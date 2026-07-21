# Code, Data, and Contract Impact Map

## Upstream source paths with immediate relevance

### CAPTCHA/API/model

```text
apps/pumpkin-api/Services/CaptchaVerifier.cs
apps/pumpkin-api/Managers/PumpkinManager.cs
apps/pumpkin-api/Program.cs
apps/pumpkin-api/CAPTCHA.md
apps/pumpkin-api.Tests/Phase1ContractTests.cs
apps/pumpkin-net-models/Models/Tenant.cs
apps/pumpkin-net-models/Models/FormDefinition.cs
packages/pumpkin-ts-models/src/models/Tenant.ts
packages/pumpkin-ts-models/src/models/FormDefinition.ts
```

### Client form rendering

```text
packages/pumpkin-block-views/src/components/TurnstileWidget.tsx
packages/pumpkin-block-views/src/views/FormBlockView.tsx
apps/starter-app/src/components/ContactFormBlock.tsx
apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx
```

### Visual editor/model

```text
apps/pumpkin-net-models/Models/IHtmlBlock.cs
apps/pumpkin-net-models/Models/HtmlBlockBase.cs
packages/pumpkin-ts-models/src/models/IHtmlBlock.ts
apps/starter-app/src/app/admin/(workspace)/pages/_components/PageVisualEditor.tsx
apps/starter-app/src/app/admin/preview/VisualPreviewFrame.tsx
apps/starter-app/src/components/PageRenderer.tsx
apps/starter-app/src/components/blocks/ContentBlocksEditor.tsx
apps/starter-app/src/components/admin/MenuTreeEditor.tsx
apps/starter-app/src/lib/visual-editor-messages.ts
apps/starter-app/src/app/admin/(workspace)/themes/_components/ThemeEditor.tsx
```

## Data impacts

| Entity | New/changed data | Migration concern |
|---|---|---|
| Tenant | `settings.formSecurity.captcha` | safe default disabled until explicitly configured; secrets remain references |
| FormDefinition | `spamProtection.captcha` | old definitions normalize to `inherit`; resolved public values must not overwrite stored secret references |
| Page blocks | `id`, `name`, `enabled` | existing blocks need stable IDs while preserving order/content/unknown types |
| Theme | header-logo media usage | public URL/alt text and tenant ownership validation |
| FormEntry | no upstream CAPTCHA token field | preserve no-token-persistence; add submission/correlation IDs downstream |

## Downstream additions likely required

```text
submission idempotency repository/unique index
correlation and audit context
distributed rate limiter
CAPTCHA telemetry without sensitive token
TenantAdmin/SuperAdmin inbox adapters
optimistic page/theme versioning
visual editor audit records
migration/backfill tooling
```
