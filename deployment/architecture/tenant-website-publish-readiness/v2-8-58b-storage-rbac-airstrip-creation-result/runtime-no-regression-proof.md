# Runtime No-Regression Proof

Method: GET-only.

Contact POST sent: False.

Form submission sent: False.

All checks passed: True.

| Check | URL | Status | Result |
| --- | --- | ---: | --- |
| Ice apex / | $(@{label=Ice apex /; url=https://iceskatingrinkrentals.com/; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice apex /contact | $(@{label=Ice apex /contact; url=https://iceskatingrinkrentals.com/contact; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice apex /service-areas | $(@{label=Ice apex /service-areas; url=https://iceskatingrinkrentals.com/service-areas; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice www / | $(@{label=Ice www /; url=https://www.iceskatingrinkrentals.com/; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice www /contact | $(@{label=Ice www /contact; url=https://www.iceskatingrinkrentals.com/contact; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice www /service-areas | $(@{label=Ice www /service-areas; url=https://www.iceskatingrinkrentals.com/service-areas; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en" class="__variable_f367f3"><head><meta charSet="utf-8"/><meta name="viewport" content="wid}.url) | 200 | pass |
| Ice apex static-contact-health | $(@{label=Ice apex static-contact-health; url=https://iceskatingrinkrentals.com/api/static-contact-health; status=200; ok=True; bodySummary={ "ok": true, "service": "static-contact", "route": "/api/static-contact-health", "contactRoute": "/api/static-contact",}.url) | 200 | pass |
| Ice www static-contact-health | $(@{label=Ice www static-contact-health; url=https://www.iceskatingrinkrentals.com/api/static-contact-health; status=200; ok=True; bodySummary={ "ok": true, "service": "static-contact", "route": "/api/static-contact-health", "contactRoute": "/api/static-contact",}.url) | 200 | pass |
| Ice isolated static-contact-health | $(@{label=Ice isolated static-contact-health; url=https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health; status=200; ok=True; bodySummary={ "ok": true, "service": "static-contact", "route": "/api/static-contact-health", "contactRoute": "/api/static-contact",}.url) | 200 | pass |
| Pumpkin API /health | $(@{label=Pumpkin API /health; url=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health; status=200; ok=True; bodySummary={"ok":true,"service":"pumpkin-api","version":"1.0.0.0","environment":"Production","providerConfigured":false,"providerSt}.url) | 200 | pass |
| Pumpkin API /api/health | $(@{label=Pumpkin API /api/health; url=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health; status=200; ok=True; bodySummary={"ok":true,"service":"pumpkin-api","version":"1.0.0.0","environment":"Production","providerConfigured":false,"providerSt}.url) | 200 | pass |
| Admin UI production / | $(@{label=Admin UI production /; url=https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-s}.url) | 200 | pass |
| Admin UI production /login | $(@{label=Admin UI production /login; url=https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-s}.url) | 200 | pass |
| Admin UI production /dashboard | $(@{label=Admin UI production /dashboard; url=https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard; status=200; ok=True; bodySummary=<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-s}.url) | 200 | pass |

Pumpkin API health returned HTTP 200. The health body still reported providerConfigured false; this phase required HTTP 200 no-regression and did not mutate provider settings.
