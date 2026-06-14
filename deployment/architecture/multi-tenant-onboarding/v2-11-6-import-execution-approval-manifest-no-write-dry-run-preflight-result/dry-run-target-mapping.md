# Dry-Run Target Mapping

Status: created.

Ice target mapping:

- Tenant key: `ice-rink-rentals`.
- Site key: `ice-rink-rentals`.
- Target mode: `future_import_candidate`.
- Route targets: `/`, `/service-areas`, `/contact`.
- Content refs: 4.
- Media refs: 1.
- Form config refs: 1.
- Resource Registry ref: `resource-registry:ice-v2-8-19`.
- Provider Profile ref: `provider-profile:static-azure-cloudflare-worker-graph`.

Roller target mapping:

- Tenant key: `roller-rink-rentals`.
- Site key: `roller-rink-rentals`.
- Target mode: `blocked_no_import_no_resume`.
- Route target: `/`.
- Mapping remains reference-only because tenant lifecycle state is paused and resume is not approved.

No live target readback was performed in V2.11.6. A future execution phase must run approved target-state readback before writing.

