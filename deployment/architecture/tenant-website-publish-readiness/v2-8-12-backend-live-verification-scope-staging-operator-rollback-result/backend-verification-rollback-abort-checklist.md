# Backend Verification Rollback Abort Checklist

Abort immediately if:

- the request would require a second unapproved POST;
- the response is non-2xx or malformed;
- the response exposes secrets or private routing details;
- an email is sent during a no-email dry-run test;
- Pumpkin API or CMS persistence occurs during a no-write test;
- tenant/site/routing refs do not resolve to Ice;
- CORS does not match the approved origin;
- rate limiting, spam controls, or validation behavior appears unsafe.

Rollback/cleanup owner is still missing and must be named before any live POST approval.

No destructive cleanup is approved by V2.8.12. If future deployment has not occurred, rollback is abort-before-deploy. If future staging deploy has occurred, rollback must be a separately approved re-upload of the prior known-good artifact or removal of the static form endpoint from a rebuilt artifact.

