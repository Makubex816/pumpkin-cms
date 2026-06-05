# Next Endpoint Deployment Approval Required

Future endpoint execution requires explicit approval before any action.

Minimum future approval should define:

- endpoint host/resource target
- public route, either `/api/static-contact` or `/api/contact`
- allowed Ice origins
- server-side Pumpkin API settings approval
- secret storage location
- whether backend `FormEntry` persistence is approved
- whether email remains disabled
- test payload policy

Do not set:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT
STATIC_FORM_ENDPOINT_VERIFIED=true
```

until the real endpoint is deployed and verified under a separate approval.

Email/Microsoft 365 work remains a separate approval gate.

