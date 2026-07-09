# Azure DNS Record Prestage Result

## Final Azure DNS Record Readback

| Name | Type | TTL | Value | Status |
| --- | --- | ---: | --- | --- |
| `asuid` | TXT | 3600 | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `www` | CNAME | 3600 | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | staged |
| `asuid.www` | TXT | 3600 | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `@` | A | n/a | pending | not created |

The default Azure DNS `NS` and `SOA` record sets also exist at `@`.

## Apex A Pending

The apex A record was not created because safe App Service inbound IP metadata was unavailable.

Disallowed alternatives were not used:

- outbound IP;
- guessed IP;
- unrelated app IP;
- DNS-resolved default-host IP.

## Correction During Staging

During staging, a PowerShell reserved variable collision briefly set the ON-created `www` CNAME to a local host-object string. It was corrected immediately before closeout. Final Azure readback shows the approved starter default hostname value.
