# Current State Summary

## Phase Status

V2.8.61ON is complete with apex A pending.

## Live State

Azure DNS zone:

- name: `partyrentalphiladelphia.com`
- resource group: `rg-pumpkin-api-prod-centralus`
- location: `global`
- record set count: 5

Current public registrar delegation:

- `ns1.afternic.com`
- `ns2.afternic.com`

Target Azure delegation:

- `ns1-03.azure-dns.com.`
- `ns2-03.azure-dns.net.`
- `ns3-03.azure-dns.org.`
- `ns4-03.azure-dns.info.`

## Staged Records

| Name | Type | Status |
| --- | --- | --- |
| `asuid` | TXT | staged |
| `www` | CNAME | staged |
| `asuid.www` | TXT | staged |
| `@` | A | pending |

## Why Apex A Is Pending

The starter App Service metadata returned:

- default host present;
- custom domain verification id present;
- `inboundIpAddress`: null;
- `possibleInboundIpAddresses`: null.

The corrected ON packet forbids using outbound IPs, guessed IPs, unrelated app IPs, or DNS-resolved IPs for apex A. Therefore the apex A record was not created.
