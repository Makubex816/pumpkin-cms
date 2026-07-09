# V2.8.61OO Party Pros DNS Readiness Report

Date: 2026-07-09

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: party_pros_final_dns_delegation_readiness_apex_a_resolution_no_registrar_mutation_no_binding_no_post

## Status

V2.8.61OO is complete.

The Azure DNS apex A record was resolved and staged using the Azure-supported App Service external-IP readback command. The Azure DNS zone now contains the web and App Service verification records needed for future custom-domain validation.

Delegation is not recommended yet because email DNS preservation is unresolved. Public DNS currently shows parked/disabled-looking email records, and equivalent MX/SPF/DMARC/DKIM records are not present in Azure DNS.

## V2.8.61ON Carryforward

V2.8.61ON is committed at `d395f4bb Add V2.8.61ON Party Pros Azure DNS zone packet`.

Azure target nameservers remain:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

Current public nameservers remain:

```text
ns1.afternic.com
ns2.afternic.com
```

## Apex A Result

Azure-supported readback:

```text
az webapp config hostname get-external-ip -> 20.118.48.17
```

Azure DNS A `@` was created in the existing zone:

```text
partyrentalphiladelphia.com A 20.118.48.17
```

No outbound IP, guessed IP, DNS-resolved default-host IP, or unrelated app IP was used.

## Azure DNS Records

| Name | Type | Value | Status |
| --- | --- | --- | --- |
| `@` | A | `20.118.48.17` | staged |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | staged |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |

## Delegation Decision

Manual nameserver change status: `held_pending_email_dns_export`.

The web record side is staged, but email DNS must be exported/migrated or explicitly waived before the owner/client changes nameservers.

## Confirmed Not Performed

- No Bluehost/client registrar login.
- No registrar DNS mutation.
- No registrar nameserver change.
- No Azure hostname binding.
- No managed TLS.
- No deploy/redeploy.
- No Party Pros publish.
- No Party Pros CMS mutation.
- No contact POST.
- No form submission.
- No customer-facing POST proof.
- No Ice mutation.
- No Airstrip action.

## Commit Instructions

Use exact-path staging only:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OO_PARTY_PROS_DNS_READINESS_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-61oo-party-pros-dns-readiness-result/
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_DNS_DELEGATION_READINESS_V2_8_61OO.md
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_APEX_A_STATUS_V2_8_61OO.md
git add deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_EMAIL_DNS_INVENTORY_V2_8_61OO.md
git commit -m "Add V2.8.61OO Party Pros DNS readiness packet"
```
