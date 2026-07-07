# Production Responsive Replay Proof

Status: passed.

Target: `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Route proof:

| Route | HTTP | Airstrip text | Ice text |
| --- | ---: | --- | --- |
| `/` | 200 | true | false |
| `/request-booking` | 200 | true | false |
| `/packages` | 200 | true | false |
| `/airstrip-the-club` | 200 | true | false |

Responsive proof:

- Evidence file outside repo: `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60x-airstrip-club-info-responsive-repair\after-production-responsive-diagnostics.json`
- Valid: true.
- Checks: 28.
- Overflow failures: 0.
- Console errors: 0.
- Failed requests: 0.
- Bad responses: 0.
- Missing images: 0.
- Navigation failures: 0.

Mobile overflow proof:

- `/airstrip-the-club` has zero overflow at 360, 375, 390, 414, and 430 pixel widths.
