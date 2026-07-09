# Delegation Readiness Decision

## Decision

Status: `held_pending_email_dns_export`.

## Why

Web DNS records are now staged in Azure DNS:

- apex A;
- `www` CNAME;
- App Service verification TXT records.

Email DNS records are not migrated:

- no Azure MX;
- no Azure SPF at `@`;
- no Azure DMARC;
- no Azure DKIM records.

## Recommendation

Do not recommend a full nameserver switch yet unless the owner explicitly confirms one of:

- the domain does not need email and the parked/null-email behavior is acceptable;
- a complete DNS export is provided and email records are migrated to Azure DNS.

Custom-domain binding, TLS, publish, and form/contact proof remain future approvals.
