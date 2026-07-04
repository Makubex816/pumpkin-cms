# Pumpkin Tenant Domain Binding Manager V2.8.60S

Status: contract approved for future implementation.

Tenant Domain Binding Manager is a SuperAdmin-only control-plane workflow for validating, binding, promoting, replacing, and auditing public domains attached to a Pumpkin tenant while preserving tenant data, users, media, pages, forms, themes, and hosting resources.

It manages:

- domain and www host intent.
- DNS packet generation and validation.
- Azure hostname binding status.
- managed TLS readiness.
- runtime proof.
- canonical promotion.
- rollback state.
- audit history.

It does not manage by default:

- tenant data migration.
- registrar account credentials.
- nameserver changes.
- Google Workspace email DNS.
- CDN/Front Door.
- indexing/Search Console.
- contact form submission.

First production use after implementation should be Airstrip:

- Tenant: `airstrip-club-las-vegas`.
- Current default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Target apex: `airstripclublasvegas.com`.
- Target www: `www.airstripclublasvegas.com`.
- Provider mode: Bluehost owner-assisted.

