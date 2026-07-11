# Pumpkin Adult Nightlife Tenant Compliance Standard V2.8.62A

## Scope

Adult/nightlife tenants require a neutral compliance inventory before tenant creation, media upload, preview publication, form activation, or indexing.

## Required Decisions

- classify venue/editorial/commercial purpose without expanding sensitive source content;
- inventory 18+/21+ language and obtain owner/legal age-policy approval;
- decide whether an interactive age gate is required;
- detect prohibited or illegal-service claim risk and stop for review when present;
- require human review of media rights and explicit-content risk;
- verify pricing, transportation, entry, hours, package, and availability claims;
- classify affiliate, sponsored, and outbound venue links;
- require privacy, consent, retention, anti-abuse, and notification decisions for forms;
- prohibit customer-facing POST before the shared form pipeline is approved;
- keep public launch, sitemap publication, and indexing as final separate approvals.

## Evidence Boundary

Text scans can identify risk signals but cannot certify media. Absence of a keyword match is not legal approval. Codex should report sensitive material neutrally and must not generate or embellish explicit content.

## Tenant Isolation

Adult/nightlife classification does not alter Pumpkin tenant isolation. Shared API, Cosmos, starter, Admin, and storage resources remain tenant-scoped. No approval transfers to another tenant, including Airstrip.
