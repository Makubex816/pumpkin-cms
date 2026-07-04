# Azure App Service Binding Plan

Status: design complete.

## Scope

The first implementation target is Azure App Service custom-domain binding for Airstrip-style tenant apps.

## Inputs

- Tenant id.
- Apex domain.
- www domain.
- Target App Service name.
- Target resource group.
- Default host.
- App Service inbound IP.
- App Service custom-domain verification id.
- DNS provider mode.
- Approval reference.

## Binding Gates

1. Create or select DomainBinding record.
2. Generate DNS packet.
3. Wait for owner approval.
4. Confirm records were applied.
5. Validate public DNS.
6. Bind hostname in Azure only after DNS passes.
7. Request or detect managed TLS.
8. Poll TLS status.
9. Prove runtime via HTTPS GET for apex and www.
10. Promote canonical domain only after runtime proof.

## App Service Record Shape

Apex:

- A record points to App Service inbound IP.
- TXT record proves custom-domain ownership.

WWW:

- CNAME points to App Service default host.
- TXT record proves custom-domain ownership for the www host.

## Failure Handling

- DNS mismatch: remain in `pending_dns_records` or `dns_records_applied`.
- Azure binding failure: enter `blocked` or `rollback_required` with public-safe error summary.
- TLS pending: remain in `tls_pending`.
- Runtime failure: remain before `live`; do not promote canonical.

## Non-Scope

- No nameserver changes by default.
- No Azure DNS zone creation by default.
- No CDN/Front Door configuration.
- No Google Workspace email DNS activation.

