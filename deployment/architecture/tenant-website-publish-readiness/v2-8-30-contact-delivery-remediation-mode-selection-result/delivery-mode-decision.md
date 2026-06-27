# Delivery Mode Decision

Selected mode: `admin-persistence-required`.

Decision:

The contact delivery remediation must make accepted IceSkatingRinkRentals.com contact submissions visible in Admin by creating Pumpkin `FormEntry` records in the backend/store read by the Admin Lead Inbox.

Rejected for this gate:

- `email-only`: does not satisfy Admin visibility.
- `graph` as sole delivery: can notify by email but does not create a Pumpkin `FormEntry`.
- `dry-run` or `no-email`: accepts the request and returns an ID without Admin-visible persistence.

Deferred:

- `dual-delivery`: allowed later after Admin persistence is proven. Email notification should not be added to the closure gate until the Admin persistence path is stable.

Chosen implementation direction:

Use the existing static compat endpoint and its `pumpkin-api` forwarding path to call Pumpkin API `POST /api/forms/{tenantId}/entries`.
