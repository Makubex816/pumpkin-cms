# DNS Record Safety Audit

Date: 2026-06-05

## Audit Source

Cloudflare DNS records were queried read-only through the Cloudflare API for only the approved record filters:

- root/apex name: `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`
- `autodiscover.iceskatingrinkrentals.com`
- `MX`
- `TXT`
- `media.iceskatingrinkrentals.com`

No Cloudflare DNS records were created, updated, deleted, proxied, or unproxied.

## Cloudflare DNS Records

Root/apex record:

```text
type: A
name: iceskatingrinkrentals.com
content: 66.81.203.198
proxied: false
proxiable: true
ttl: 1
```

`www` record:

```text
type: A
name: www.iceskatingrinkrentals.com
content: 66.81.203.198
proxied: false
proxiable: true
ttl: 1
```

`autodiscover` record:

```text
type: CNAME
name: autodiscover.iceskatingrinkrentals.com
content: autodiscover.outlook.com
proxied: false
proxiable: true
ttl: 1
```

MX record:

```text
type: MX
name: iceskatingrinkrentals.com
content: iceskatingrinkrentals-com.mail.protection.outlook.com
priority: 0
proxied: false
proxiable: false
ttl: 1
```

TXT records:

```text
type: TXT
name: iceskatingrinkrentals.com
content: "MS=ms13281863"
proxied: false
proxiable: false
ttl: 1
```

```text
type: TXT
name: iceskatingrinkrentals.com
content: "v=spf1 include:spf.protection.outlook.com -all"
proxied: false
proxiable: false
ttl: 1
```

Media hostname:

```text
media.iceskatingrinkrentals.com: no Cloudflare DNS record returned
```

## Safety Conclusions

- root `A` record is DNS only
- `www` `A` record is DNS only
- `autodiscover` `CNAME` is DNS only
- MX remains DNS only
- TXT records remain present
- no `media.iceskatingrinkrentals.com` record has been created in Cloudflare DNS
- root and `www` still point to `66.81.203.198`
- Microsoft autodiscover, MX, and TXT records remain visible in the audited Cloudflare DNS records

## No-Action Confirmation

No DNS records were created, updated, deleted, proxied, or unproxied in this run.
