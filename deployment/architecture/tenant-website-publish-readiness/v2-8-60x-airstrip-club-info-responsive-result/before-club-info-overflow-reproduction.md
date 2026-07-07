# Before Club Info Overflow Reproduction

Target: `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Method: GET/browser-only responsive checker.

Evidence file outside repo:

`C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60x-airstrip-club-info-responsive-repair\before-club-info-responsive-diagnostics.json`

Result:

- Valid: false.
- Checks: 28.
- Overflow failures: 5.
- Console errors: 0.
- Failed requests: 0.
- Bad responses: 0.
- Missing images: 0.
- Navigation failures: 0.

Failures:

| Route | Viewport | Scroll width | Overflow |
| --- | ---: | ---: | ---: |
| `/airstrip-the-club` | 360x800 | 400 | 40 |
| `/airstrip-the-club` | 375x812 | 410 | 35 |
| `/airstrip-the-club` | 390x844 | 420 | 30 |
| `/airstrip-the-club` | 414x896 | 436 | 22 |
| `/airstrip-the-club` | 430x932 | 447 | 17 |

No POST, form submission, DNS, custom-domain, indexing, content, media, appsetting, user, role, tenant, or DomainBinding action occurred during reproduction.
