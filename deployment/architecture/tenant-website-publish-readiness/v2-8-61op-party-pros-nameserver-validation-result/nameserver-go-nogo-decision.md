# Nameserver Go No-Go Decision

## Decision

```text
ready_for_custom_domain_binding_preflight
```

## Why

- Nameserver propagation is complete across Cloudflare, Google, and Quad9.
- Public web DNS records match Azure DNS.
- App Service verification TXT records are public.
- Owner-approved no-email DNS posture is public.

## Limits

This is not approval for:

- hostname binding;
- managed TLS;
- publish;
- contact/form POST;
- customer-facing proof.

Those remain separate phases.
