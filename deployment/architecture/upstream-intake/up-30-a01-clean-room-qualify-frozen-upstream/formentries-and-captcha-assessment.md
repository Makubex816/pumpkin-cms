
# FormEntries and CAPTCHA-adjacent assessment

Disposition: `QUALIFIED_WITH_HOLDS`

No CAPTCHA provider was activated and no live form submission was attempted.

FormEntries-related static evidence:

- `apps/pumpkin-api.Tests/Phase1ContractTests.cs` (FormEntry)
- `apps/pumpkin-api.Tests/Program.cs` (FormEntry)
- `apps/pumpkin-api/API_ENDPOINTS.md` (form entries)
- `apps/pumpkin-api/api.json` (FormEntry)
- `apps/pumpkin-api/CAPTCHA.md` (captcha)
- `apps/pumpkin-api/Managers/PumpkinManager.cs` (FormEntry)
- `apps/pumpkin-api/Program.cs` (FormEntry)
- `apps/pumpkin-api/Services/CaptchaVerifier.cs` (captcha)
- `apps/pumpkin-api/Services/CosmosDataConnection.cs` (FormEntry)
- `apps/pumpkin-api/Services/DatabaseService.cs` (FormEntry)
- `apps/pumpkin-api/Services/IDatabaseService.cs` (FormEntry)
- `apps/pumpkin-api/Services/IDataConnection.cs` (FormEntry)
- `apps/pumpkin-api/Services/MongoDataConnection.cs` (FormEntry)
- `apps/pumpkin-net-models/Models/FormDefinition.cs` (FormEntry)
- `apps/pumpkin-net-models/Models/FormEntry.cs` (FormEntry)
- `apps/pumpkin-net-models/Models/Tenant.cs` (captcha)
- `apps/starter-app/content/contact-form-definition.json` (captcha)
- `apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx` (captcha)
- `apps/starter-app/src/app/admin/(workspace)/forms/entries/_components/FormEntriesManager.tsx` (FormEntry)
- `apps/starter-app/src/app/admin/(workspace)/forms/entries/page.tsx` (FormEntries)
- `apps/starter-app/src/app/api/admin/forms/entries/[id]/status/route.ts` (FormEntry)
- `apps/starter-app/src/app/api/admin/forms/entries/route.ts` (FormEntries)
- `apps/starter-app/src/components/ContactFormBlock.tsx` (captcha)
- `apps/starter-app/src/lib/starter-admin-forms.ts` (FormEntry)
- `contact-form-prompt.md` (FormEntry)
- `packages/pumpkin-block-views/src/components/TurnstileWidget.tsx` (captcha)
- `packages/pumpkin-block-views/src/views/FormBlockView.tsx` (captcha)
- `packages/pumpkin-ts-models/src/index.ts` (FormEntry)
- `packages/pumpkin-ts-models/src/models/FormDefinition.ts` (FormEntry)
- `packages/pumpkin-ts-models/src/models/FormEntry.ts` (FormEntry)
- `packages/pumpkin-ts-models/src/models/Tenant.ts` (captcha)

CAPTCHA-adjacent static evidence:

- `apps/pumpkin-api.Tests/Phase1ContractTests.cs` (captcha)
- `apps/pumpkin-api/CAPTCHA.md` (captcha)
- `apps/pumpkin-api/Managers/PumpkinManager.cs` (captcha)
- `apps/pumpkin-api/Program.cs` (captcha)
- `apps/pumpkin-api/Services/CaptchaVerifier.cs` (captcha)
- `apps/pumpkin-net-models/Models/FormDefinition.cs` (captcha)
- `apps/pumpkin-net-models/Models/Tenant.cs` (captcha)
- `apps/starter-app/content/contact-form-definition.json` (captcha)
- `apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx` (captcha)
- `apps/starter-app/src/components/ContactFormBlock.tsx` (captcha)
- `packages/pumpkin-block-views/src/components/TurnstileWidget.tsx` (captcha)
- `packages/pumpkin-block-views/src/index.ts` (turnstile)
- `packages/pumpkin-block-views/src/views/FormBlockView.tsx` (captcha)
- `packages/pumpkin-ts-models/src/index.ts` (captcha)
- `packages/pumpkin-ts-models/src/models/FormDefinition.ts` (captcha)
- `packages/pumpkin-ts-models/src/models/Tenant.ts` (captcha)
