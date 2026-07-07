# Upstream Source Port Ledger

| Upstream path | Active path | Decision | Result |
| --- | --- | --- | --- |
| `apps/starter-app/` | `apps/starter-app/` | adopted | Imported as additive local source baseline. |
| `apps/starter-app/src/app/admin/**` | `apps/starter-app/src/app/admin/**` | adapted by isolation | Kept embedded `/admin` inside starter app only; not a replacement for standalone Admin UI. |
| `apps/starter-app/src/lib/starter-admin-forms.ts` | same | adapted | Accepts active API `formDefinitions` and upstream `definitions`. |
| `apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx` | same | adapted | Emits active FormDefinition metadata and upstream starter UI fields. |
| `apps/starter-app/src/components/ContactFormBlock.tsx` | same | adapted | Handles string and object select option shapes. |
| `packages/pumpkin-ts-models/src/forms.ts` | same | adapted | Added optional upstream-compatible field names and starter fields while preserving active fields. |
| `packages/pumpkin-ts-models/src/index.ts` | same | adapted | Exported compatibility names. |
| `packages/pumpkin-block-views/src/views/FormBlockView.tsx` | same | adapted | Handles active string options and upstream object options. |
| `apps/sample-app-2/` | none | deferred | Redundant beside `starter-app` for this phase; future template lane can review separately. |
| upstream `apps/pumpkin-api` | active API unchanged | preserved/adapted by comparison | Active API already has compatible form routes and downstream aliases. |
| upstream `apps/admin` changes | active Admin UI unchanged | deferred | Active Admin UI has broader production surfaces; feature port requires separate focused phase. |

No upstream clone files were staged directly.
