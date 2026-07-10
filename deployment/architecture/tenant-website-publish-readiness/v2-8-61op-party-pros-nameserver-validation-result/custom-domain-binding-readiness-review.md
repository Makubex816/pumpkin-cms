# Custom-Domain Binding Readiness Review

## Ready For Preflight

DNS delegation is complete.

Azure DNS records are public:

- apex A;
- `www` CNAME;
- App Service verification TXT records.

No-email posture is public:

- MX `.` preference `0`;
- TXT `v=spf1 -all`.

## Not Done In OP

- Azure App Service hostname binding.
- Managed TLS.
- Party Pros page publish.
- Host-based Party Pros root-domain rendering proof.
- Contact/form POST proof.

## Decision

Custom-domain binding preflight can be the next phase.

It must still avoid publish/form proof unless separately approved.
