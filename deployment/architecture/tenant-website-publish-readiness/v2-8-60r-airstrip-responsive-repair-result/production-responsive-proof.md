# Production Responsive Proof

Status: passed.

Target:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Route smoke:

| Route | Result | Content signal |
| --- | --- | --- |
| `/` | HTTP 200 | Airstrip true, Ice false |
| `/request-booking` | HTTP 200 | Airstrip true, Ice false |
| `/packages` | HTTP 200 | Airstrip true, Ice false |
| `/airstrip-the-club` | HTTP 200 | Airstrip true, Ice false |

Responsive browser proof:

- Routes: `/`, `/request-booking`, `/packages`, `/airstrip-the-club`.
- Viewports: 360x800, 375x812, 390x844, 414x896, 430x932, 768x1024, 1440x1200.
- Total checks: 28.
- Blocking failures: 0.
- Horizontal overflow: 0.
- HTTP non-200: 0.
- Console errors: 0.
- Failed requests: 0.
- HTTP 4xx/5xx browser responses: 0.
- Missing image cases: 0.
- Clipped H1 cases: 0.

Evidence file outside repo:

- `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60r-airstrip-responsive-repair\after-production-mobile-diagnostics.json`
