# Pumpkin Azure DNS Delegation Standard V2.8.61ON

Date: 2026-07-09

## Standard

Before recommending Azure DNS delegation for a tenant domain:

- create or identify the Azure DNS zone;
- read the actual Azure-assigned nameservers;
- stage only records with verified source values;
- mark unavailable records pending instead of guessing;
- preserve email DNS before delegation;
- document current and target nameservers;
- keep registrar changes as a separate owner/client action;
- keep App Service hostname binding and managed TLS as separate approved phases.

## A Record Rule

Only create apex A when a safe inbound IP is available from approved Azure metadata or owner-approved source.

Do not use:

- outbound IPs;
- guessed IPs;
- unrelated app IPs;
- DNS-resolved default-host IPs unless separately approved.

## Email Rule

Do not claim email DNS is preserved until exact MX, SPF, DKIM, DMARC, and verification records are provided, migrated, and validated.

## Validation Rule

Use Azure control-plane readback before delegation.

Use public DNS validation after owner/client nameserver changes propagate.
