# Pumpkin Airstrip Domain Manager First Use V2.8.60S

Status: planned, not executed.

Airstrip is the first planned tenant for Tenant Domain Binding Manager after implementation approval.

Tenant:

- `airstrip-club-las-vegas`

Current live default host:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Target public hosts:

- `airstripclublasvegas.com`
- `www.airstripclublasvegas.com`

Provider:

- Bluehost owner-assisted.

Existing DNS packet reference:

- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_BLUEHOST_DNS_PACKET_V2_8_60.md`

First-use gates:

- Create DomainBinding draft.
- Generate or import DNS packet.
- Owner applies DNS records.
- Validate DNS.
- Bind Azure hostnames after DNS proof.
- Track TLS readiness.
- Prove runtime.
- Promote canonical only after proof.
- Keep default host as rollback target.

V2.8.60S did not mutate Bluehost, Azure, DNS, custom domains, Google Workspace, CDN/Front Door, or indexing.

