# Before Responsive Issue Reproduction

Status: reproduced.

Target:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Routes:

- `/`
- `/request-booking`
- `/packages`
- `/airstrip-the-club`

Mobile viewports:

- 360x800
- 375x812
- 390x844
- 414x896
- 430x932

Result:

- Total checks: 20.
- Horizontal overflow cases: 13.
- HTTP non-200: 0.
- Console errors: 0.
- Failed requests: 0.
- Missing image cases: 0.

Overflow by route:

| Route | Overflow cases |
| --- | ---: |
| `/` | 5 |
| `/request-booking` | 0 |
| `/packages` | 3 |
| `/airstrip-the-club` | 5 |

Primary observed offender:

- `.as-nav-right` rendered full desktop navigation and the Request Booking CTA on mobile, pushing the page wider than the viewport.

Evidence file outside repo:

- `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60r-airstrip-responsive-repair\before-production-mobile-diagnostics.json`
