# Error Message Audit

## Cases Exercised

| Case | Fixture | Result |
| --- | --- | --- |
| Missing domain | `invalid-missing-domain.answers.json` | Fails before generation with `ANSWERS_REQUIRED_FIELD_MISSING`, field path, fix, and ask-for-help guidance. |
| Malformed domain | `invalid-malformed-domain.answers.json` | Fails before generation with `ANSWERS_INVALID_DOMAIN`; broken `https://https://...` suggestion was fixed. |
| Duplicate route | `invalid-duplicate-route.answers.json` | Fails before generation with `ANSWERS_DUPLICATE_ROUTE` and owner guidance. |
| Secret-like value | `invalid-secret-like-value.answers.json` | Fails before generation with `ANSWERS_SECRET_LIKE_VALUE` and security-review guidance. |
| Unsafe canonical URL | `invalid-unsafe-canonical-url.answers.json` | Fails before generation with production URL guidance and deployment/SEO owner escalation. |
| Unknown deployment profile | `invalid-unknown-deployment-profile.answers.json` | Fails before generation with deployment engineer escalation. |
| Unsafe media file name | `invalid-media-unsafe-file-name.answers.json` | Fails before generation with base-file-name guidance. |
| Missing form recipient | `invalid-form-missing-recipient.answers.json` | Fails before generation with required recipient guidance. |
| Unknown media reference | `invalid-unknown-media-reference.answers.json` | New fixture; fails before generation with media owner guidance. |
| Unknown form reference | `invalid-unknown-form-reference.answers.json` | New fixture; fails before generation with form owner guidance. |

## Fixes Applied

- Empty values now stop at required-field errors instead of producing duplicate format errors.
- Canonical URL guidance only uses a verified plain production domain for suggested fixes.
- CLI test coverage now asserts invalid answers show code, `Fix:`, and `Ask for help:` guidance without malformed URL suggestions.

## Remaining Risk

The CLI still shows only the first 8 answer issues. That is acceptable for readability, but a future UI should show grouped issue counts and allow expanding all findings.
