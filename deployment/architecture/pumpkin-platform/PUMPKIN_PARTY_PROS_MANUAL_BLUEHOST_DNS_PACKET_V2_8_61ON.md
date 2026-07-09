# Pumpkin Party Pros Manual Bluehost DNS Packet V2.8.61ON

Date: 2026-07-09

## Owner/Client Manual Packet

Current nameservers:

```text
ns1.afternic.com
ns2.afternic.com
```

Target Azure nameservers:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Staged Azure DNS Records

| Name | Type | Value | Status |
| --- | --- | --- | --- |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | staged |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged |
| `@` | A | pending | not created |

## Warning

Do not change nameservers until client DNS records are exported and email DNS is migrated.

Email DNS preservation is unresolved because no MX/SPF/DKIM/DMARC values were provided.

No Bluehost login or registrar mutation occurred in ON.
