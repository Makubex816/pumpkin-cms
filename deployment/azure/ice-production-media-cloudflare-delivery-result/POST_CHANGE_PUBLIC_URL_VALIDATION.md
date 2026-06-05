# Post-Change Public URL Validation

Date: 2026-06-05

## Rule-Based Configuration Outcome

The rule-based Cloudflare media delivery setup was blocked before any media DNS/rule/cache configuration was persisted.

At the end of that rule-based attempt:

```text
media.iceskatingrinkrentals.com: unresolved
Cloudflare public media URLs: 0/9 passed
```

## Worker Follow-Up Outcome

A later Worker retry with the Worker-capable token configured scoped media delivery.

Current Worker validation:

```text
media.iceskatingrinkrentals.com resolves through Cloudflare
Cloudflare Worker public media URLs checked: 9
HTTP 200 OK: 9
passed: 9/9
content type: image/png
content length: matched expected values
cache-control: public, max-age=31536000, immutable
redirects to wrong host: 0
```

Worker validation details are recorded in:

```text
deployment/azure/ice-production-media-worker-delivery-result/POST_CHANGE_PUBLIC_URL_VALIDATION.md
```

## Result

```text
Rule-based Cloudflare public media URLs validated: no
Worker-based Cloudflare public media URLs validated: yes
```
