# Airstrip First-Use Plan

Status: design complete.

Airstrip will be the first production tenant to use Tenant Domain Binding Manager after implementation approval.

Tenant:

- `airstrip-club-las-vegas`

Current live default host:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Target domain:

- `airstripclublasvegas.com`

Target www domain:

- `www.airstripclublasvegas.com`

DNS provider:

- Bluehost owner-assisted mode.

Existing packet:

- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_BLUEHOST_DNS_PACKET_V2_8_60.md`

First-use flow:

1. Create draft DomainBinding for Airstrip.
2. Import or regenerate the existing DNS packet as packet version 1.
3. Request owner approval.
4. Wait for Bluehost records to be applied.
5. Validate public DNS.
6. Bind Azure App Service hostnames after DNS validation.
7. Track TLS readiness.
8. Prove apex and www runtime.
9. Promote canonical only after proof.
10. Retain rollback target as the production default host until the public domain is stable.

Not in this phase:

- No Bluehost mutation.
- No Azure hostname binding.
- No Google Workspace DNS activation.
- No CDN/Front Door.
- No indexing.

