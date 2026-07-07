# API Update Impact Audit

Status: overlap confirmed; adapt required.

Upstream public form API routes:

| Route | Purpose | Compatibility note |
| --- | --- | --- |
| `POST /api/forms/{tenantId}/entries` | Low-level full FormEntry save | Active repo already has this public route. Confirm payload/status shape before integration. |
| `GET /api/forms/{tenantId}/definitions/{type}` | Public FormDefinition read by type | Active repo has public form definition read. Compare type/id semantics. |
| `POST /api/forms/{tenantId}/submit/{type}` | Custom form submit with flat field dictionary | Active repo has this route. Later proof requires customer-facing POST approval. |

Upstream admin form API routes:

| Route | Purpose | Compatibility note |
| --- | --- | --- |
| `GET /api/admin/forms/{tenantId}/definitions` | List definitions | Active repo has same route. |
| `GET /api/admin/forms/{tenantId}/definitions/{formDefinitionId}` | Read definition | Active repo has same route. |
| `POST /api/admin/forms/{tenantId}/definitions` | Create definition | Active repo has same route. |
| `PUT /api/admin/forms/{tenantId}/definitions/{formDefinitionId}` | Update definition | Active repo has same route. |
| `DELETE /api/admin/forms/{tenantId}/definitions/{formDefinitionId}` | Delete definition | Active repo has same route. |
| `GET /api/admin/forms/{tenantId}/entries` | List entries | Active repo has same route plus legacy `/api/admin/{tenantId}/form-entries`. |
| `GET /api/admin/forms/{tenantId}/entries/{entryId}` | Read entry | Active repo has same route plus legacy read alias. |
| `PUT /api/admin/forms/{tenantId}/entries/{entryId}/status` | Update status | Active repo uses patch/update paths and status management. Must compare semantics. |

Other upstream API changes:

- `apps/pumpkin-api/API_ENDPOINTS.md` added.
- Tenant, user, page, theme, form, auth, and storage implementations changed.
- `CosmosDataConnection`, `MongoDataConnection`, `IDatabaseService`, and `IDataConnection` changed.
- Upstream roles include `SuperAdmin`, `TenantAdmin`, `Editor`, and `Viewer`.

Current active repo overlap:

- Current API has public forms routes and admin form aliases.
- Current API has DomainBinding, ImportIntake, ImportExecution, OperatorHandoff, OutboundLinks, backup/intake references, and static-contact integration not present upstream.
- Current Admin UI expects active route aliases and active response shapes.

Impact classification:

`api_overlap_adapt_required_no_blind_merge`

Blind merge risk:

- duplicated or altered route handlers;
- dropped legacy/admin aliases used by production Admin UI;
- changed FormEntry status/update semantics;
- changed provider/container assumptions;
- role-boundary drift;
- loss of active operational endpoints.
