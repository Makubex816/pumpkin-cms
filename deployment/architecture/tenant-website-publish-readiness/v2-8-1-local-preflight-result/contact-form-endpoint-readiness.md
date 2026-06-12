# Contact Form Endpoint Readiness

| Mode | Result | Evidence |
| --- | --- | --- |
| Runtime CMS mode | not exercised | `apps/ice-rink-web/src/app/api/contact/route.ts` posts to Pumpkin API and requires tenant API configuration. |
| Static mode, current safe seed validation | blocked | `validate-static-output` reported static form endpoint not configured/verified in the current shell. |
| Historical Ice static endpoint proof | passed historically | `deployment/azure/ice-static-form-production-enablement-result/manifest.json` records verified endpoint `func-ice-static-contact-20260605`. |
| Email/M365 operational state | not enough for app publish | `deployment/email/README.md` says Microsoft 365 setup is selected/partial and production DNS changes are not ready. |

Readiness decision: Contact form publication is not approved by V2.8.1.

The next phase must use a safe explicit endpoint contract or approved snapshot package. It must not read `.env.local`, print endpoint secrets, call live CMS, send email, or mutate Azure unless explicitly approved.
