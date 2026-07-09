# V2.8.61ON Party Pros Azure DNS Zone Report

Date: 2026-07-09

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: party_pros_azure_dns_zone_preprovision_nameserver_packet_partial_record_prestage_no_registrar_mutation_no_binding_no_post

## Status

V2.8.61ON is complete.

The Azure DNS zone `partyrentalphiladelphia.com` now exists in `rg-pumpkin-api-prod-centralus`. Azure assigned four target nameservers, and the manual Bluehost/client packet now has real target nameserver values.

Safe Azure DNS records were staged where source values existed:

- TXT `asuid`
- CNAME `www`
- TXT `asuid.www`

The apex A record remains pending because App Service metadata did not expose `inboundIpAddress` or `possibleInboundIpAddresses`. No outbound IP, guessed IP, DNS-resolved IP, or unrelated app IP was used.

## Carryforward

V2.8.61OL is committed at `10a2ef9f Add V2.8.61OL form pipeline DNS packet`.

OL carryforward remains unchanged: Party Pros preview is no-post, form E2E proof remains held pending safe auth/email handling, and no DNS mutation or publish occurred in OL.

## Current Public Nameservers

Public DNS readback still shows:

```text
ns1.afternic.com
ns2.afternic.com
```

No registrar nameserver change occurred in ON.

## Target Azure Nameservers

The Azure DNS zone target nameservers are:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Azure DNS Records

| Name | Type | Value | Status |
| --- | --- | --- | --- |
| `@` | A | pending | not created; inbound IP unavailable |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | staged |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |

## Confirmed Not Performed

- No Bluehost/client registrar login.
- No registrar DNS mutation.
- No registrar nameserver change.
- No Azure App Service hostname binding.
- No managed TLS.
- No deploy or redeploy.
- No Party Pros publish.
- No contact POST.
- No form submission.
- No Airstrip action.
- No Ice mutation.

## Files

- `deployment/architecture/tenant-website-publish-readiness/v2-8-61on-party-pros-azure-dns-zone-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_AZURE_DNS_ZONE_V2_8_61ON.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_TARGET_NAMESERVERS_V2_8_61ON.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_MANUAL_BLUEHOST_DNS_PACKET_V2_8_61ON.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AZURE_DNS_DELEGATION_STANDARD_V2_8_61ON.md`

## Commit Instructions

Use exact-path staging only:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61ON_PARTY_PROS_AZURE_DNS_ZONE_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-61on-party-pros-azure-dns-zone-result/
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_AZURE_DNS_ZONE_V2_8_61ON.md
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_TARGET_NAMESERVERS_V2_8_61ON.md
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_MANUAL_BLUEHOST_DNS_PACKET_V2_8_61ON.md
git add deployment/architecture/pumpkin-platform/PUMPKIN_AZURE_DNS_DELEGATION_STANDARD_V2_8_61ON.md
git commit -m "Add V2.8.61ON Party Pros Azure DNS zone packet"
```
