# Future Provider Binding Plan

Provider binding remains future-only.

Prerequisite: complete the health-only live deployment first. The live API must return success from both:

- `GET https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/health`
- `GET https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health`

Only after that proof should a separate approval authorize protected provider binding and FormEntry read/write validation.

Future protected binding phase should explicitly approve:

- Setting only the required protected Pumpkin API provider settings.
- Setting only the required static contact-to-Pumpkin API binding setting.
- Running a bounded isolated FormEntry write validation.
- Running a bounded Admin readback validation.
- Recording public-safe response summaries only.

Future protected binding phase must still exclude:

- Reading or printing protected config files.
- Listing keys or deployment tokens.
- Generating connection strings or SAS values.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Unbounded URL checks.

