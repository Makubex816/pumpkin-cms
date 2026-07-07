# Forms Contact Form Designer Impact Audit

Status: valuable upstream work, but integration must be staged.

Confirmed upstream form/contact changes:

- Public custom form submit route: `POST /api/forms/{tenantId}/submit/{type}`.
- Public form definition read route: `GET /api/forms/{tenantId}/definitions/{type}`.
- Low-level FormEntry save route: `POST /api/forms/{tenantId}/entries`.
- Admin FormDefinition CRUD routes.
- Admin FormEntry list/read/status routes.
- `apps/starter-app/content/contact-form-definition.json`.
- `apps/starter-app/src/components/ContactFormBlock.tsx`.
- `apps/starter-app/src/app/api/forms/submit/[type]/route.ts`.
- `FormDefinitionEditor.tsx` and `FormDefinitionsList.tsx` inside starter app admin.

Current active platform overlap:

- V2.8.48 implemented FormDefinition/FormBuilder lifecycle.
- V2.8.49 proved Admin UI theme/formbuilder CRUD workflow.
- Current production Ice static contact is already closed and must not be re-opened without separate POST approval.
- Airstrip reservation form mapping exists as `airstrip-reservation`, but production public form submission proof is not approved in this phase.

Integration impact:

- The upstream design is useful for validating custom form submit shape and form designer UX.
- It should be adapted into current Admin UI contracts and tested against existing FormDefinition/FormEntry containers.
- A later phase must use explicit customer-facing POST/form-submit approval before proving public submit paths.

No contact POST or form submission occurred in V2.8.61H.
