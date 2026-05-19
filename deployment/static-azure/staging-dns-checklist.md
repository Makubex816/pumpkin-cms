# Staging DNS Checklist

This checklist is for staging subdomains only. Do not alter live root or apex domains during Phase 5G.

## Staging Domains

- `ice-dev.iceskatingrinkrentals.com`
- `roller-dev.rollerrinkrentals.com`

## Before Changing Anything

Capture current Cloudflare state first:

- export DNS records if available
- screenshot current DNS table
- screenshot SSL/TLS mode
- screenshot cache rules
- screenshot page rules or redirect rules
- screenshot workers/routes if present

Store account-specific details outside the repo.

## Ice Staging DNS

Create a staging CNAME only after the Azure Static Web App exists.

Record placeholder:

```text
ice-dev.iceskatingrinkrentals.com CNAME <ice-staging-swa-default-hostname>
```

Do not change:

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`

## Roller Staging DNS

Create a staging CNAME only after the Azure Static Web App exists.

Record placeholder:

```text
roller-dev.rollerrinkrentals.com CNAME <roller-staging-swa-default-hostname>
```

Do not change:

- `rollerrinkrentals.com`
- `www.rollerrinkrentals.com`

## DNS-Only Vs Proxied

DNS-only first:

- simpler Azure domain validation
- easier origin troubleshooting
- Cloudflare cache does not interfere

Proxied later:

- enables Cloudflare CDN/WAF/cache behavior
- requires cache bypass rules for form/API endpoints
- requires SSL mode review

Recommended staging sequence:

1. Start DNS-only for validation.
2. Confirm Azure custom domain and HTTPS behavior.
3. Enable proxied mode only after cache and bypass rules are reviewed.

## Azure Domain Validation Notes

Azure Static Web Apps may require specific DNS records or validation steps. Follow the Azure Portal instructions for the staging subdomain and record the required values outside the repo if they contain account-specific information.

## SSL Guidance

Recommended Cloudflare SSL mode after proxying:

```text
Full (strict)
```

Use Full Strict only when the Azure origin has valid TLS for the hostname Cloudflare connects to.

Avoid Flexible mode.

## Rollback Steps

For staging:

1. Change the staging DNS record back to the previous value or remove it.
2. Switch proxied records back to DNS-only if Cloudflare cache is causing issues.
3. Purge staging hostname cache if it was proxied.
4. Verify live root domains were not changed.
5. Record what changed and why.
