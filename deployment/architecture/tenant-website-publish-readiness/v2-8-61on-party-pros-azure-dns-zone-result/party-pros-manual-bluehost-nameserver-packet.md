# Party Pros Manual Bluehost Client Nameserver Packet

## Boundary

This is an owner/client manual action packet.

Codex did not log into Bluehost.

Codex did not mutate registrar DNS.

Codex did not change nameservers.

## Current Public Nameservers

```text
ns1.afternic.com
ns2.afternic.com
```

## Target Azure Nameservers

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Azure DNS Zone

| Field | Value |
| --- | --- |
| Zone | `partyrentalphiladelphia.com` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Status | created |

## Azure DNS Records Staged

| Name | Type | Value | Status |
| --- | --- | --- | --- |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | staged |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `@` | A | pending | not created |

## Manual Nameserver Change Steps

Only after a separate owner/client approval:

1. Export or screenshot all existing client DNS records from the current DNS provider.
2. Confirm email records are present in the Azure DNS zone before delegation.
3. Confirm the apex A record is resolved or explicitly accepted as pending.
4. In the client registrar/DNS account, replace the current nameservers with the four target Azure nameservers.
5. Save the change.
6. Wait for propagation.
7. Run the validation commands in `validation-commands-for-owner.md`.
8. If validation fails and rollback is approved, restore the previous nameservers.

## Email Warning

Email DNS preservation is unresolved.

No MX, SPF, DKIM, or DMARC records were provided by the owner/client, so none were created in Azure DNS.

Changing nameservers before migrating those records can break email and third-party domain verification.

## Rollback Concept

Rollback means manually changing registrar nameservers back to:

```text
ns1.afternic.com
ns2.afternic.com
```

Rollback may take DNS propagation time and should be approved/named before any future switch.
