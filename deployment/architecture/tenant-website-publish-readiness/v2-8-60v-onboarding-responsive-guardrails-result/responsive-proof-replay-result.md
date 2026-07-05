# Responsive Proof Replay Result

Status: ran and detected blocker.

Command shape:

```powershell
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs `
  --base-url https://app-airstrip-prod-centralus-001.azurewebsites.net `
  --routes /,/request-booking,/packages,/airstrip-the-club `
  --out .tmp/v2-8-60v/airstrip-production-responsive-check.json `
  --chrome-path "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Summary:

- routes: 4
- viewports: 7
- checks: 28
- navigation failures: 0
- console errors: 0
- failed requests: 0
- bad responses: 0
- missing images: 0
- overflow failures: 5

Overflow failures:

| Route | Viewport | Scroll width | Client width | Overflow |
| --- | --- | ---: | ---: | ---: |
| `/airstrip-the-club` | 360x800 | 400 | 360 | 40 |
| `/airstrip-the-club` | 375x812 | 410 | 375 | 35 |
| `/airstrip-the-club` | 390x844 | 420 | 390 | 30 |
| `/airstrip-the-club` | 414x896 | 436 | 414 | 22 |
| `/airstrip-the-club` | 430x932 | 447 | 430 | 17 |

Read-only element probe identified `.as-club-info` blocks overflowing the mobile viewport. No source change or deploy was performed in V2.8.60V.

Classification: airstrip_production_default_host_responsive_overflow_replay_blocker.
