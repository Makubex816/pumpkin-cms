# Contact Form Path Analysis

Classification: `external_form_contract_preserved_static_contact_bridge_additive_route_adapter_needed`

External reference:

- `contact-form-prompt.md` describes a React contact form posting to `/api/forms/{tenantId}/entries`.
- External API also includes `/api/forms/{tenantId}/submit/{type}`.
- External form auth uses Bearer API key.

Current build:

- Preserves `/api/forms/{tenantId}/entries`.
- Does not currently expose `/api/forms/{tenantId}/submit/{type}`.
- Production Ice contact uses a managed static contact API at `/api/static-contact`, with health at `/api/static-contact-health`.

Required compatibility:

- Keep `/api/static-contact` for the proven Ice production path.
- Add or restore `/api/forms/{tenantId}/submit/{type}` for external compatibility.
- Verify that simplified external contact payloads map safely into current FormEntry/FormDefinition models.
- Do not send contact POSTs in this audit phase.
