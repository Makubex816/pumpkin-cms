# Cloudflare DNS Result

Date: 2026-06-05

## Media DNS Record

Created:

```text
name: media.iceskatingrinkrentals.com
type: CNAME
target: iceskatingmedia.blob.core.windows.net
proxied: true
```

This DNS record was created only for the approved media host. It does not alter the root/apex host, `www`, MX, TXT, email, main-site, or unrelated records.

## Public DNS Validation

Local resolver result:

```text
media.iceskatingrinkrentals.com A    172.67.130.204
media.iceskatingrinkrentals.com A    104.21.9.71
media.iceskatingrinkrentals.com AAAA 2606:4700:3031::6815:947
media.iceskatingrinkrentals.com AAAA 2606:4700:3033::ac43:82cc
```

Public resolver `1.1.1.1` returned the same Cloudflare A/AAAA records.

## Root and WWW Audit

Read-only Cloudflare DNS audit after setup:

```text
iceskatingrinkrentals.com records: 4
root A proxied: false
root MX proxied: false
root TXT proxied: false
www.iceskatingrinkrentals.com records: 1
www A proxied: false
```

No root/apex DNS or `www` DNS mutation was performed.
