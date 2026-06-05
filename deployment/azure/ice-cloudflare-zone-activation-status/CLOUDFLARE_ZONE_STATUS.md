# Cloudflare Zone Status

Date: 2026-06-05

## Credential Presence

Only presence/missing status was checked. No credential values were printed.

```text
CLOUDFLARE_API_TOKEN=PRESENT
CLOUDFLARE_ZONE_ID=PRESENT
```

## Cloudflare API Status

Read-only Cloudflare API `GET` requests were used for the zone object and the allowed DNS record filters only.

```text
zone name: iceskatingrinkrentals.com
zone status: active
assigned nameservers:
  amy.ns.cloudflare.com
  bob.ns.cloudflare.com
```

Cloudflare API zone metadata returned the following legacy/original nameserver values:

```text
ns1.bluehost.com
ns2.bluehost.com
```

Public DNS checks in `NAMESERVER_PROPAGATION_CHECK.md` show the current public delegation now resolves to the assigned Cloudflare nameservers.

## DNS Records Queried

Allowed record filters queried read-only:

- root/apex name: `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`
- `autodiscover.iceskatingrinkrentals.com`
- `MX`
- `TXT`
- `media.iceskatingrinkrentals.com`

No Cloudflare API mutation methods were used.

## Classification

```text
Cloudflare zone onboarded: yes
Cloudflare zone active: yes
Nameserver propagation: yes, based on public DNS checks
DNS record proxy flags audited: yes, for allowed record filters
```

## No-Action Confirmation

No Cloudflare mutation was attempted.

No token was printed.
