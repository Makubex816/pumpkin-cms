# Static Form Validator Post Verification Result

Status: passed.

After the approved backend POST, local validator process environment used:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_OWNER_APPROVED=true
STATIC_FORM_OWNER_APPROVED=true
STATIC_FORM_BACKEND_VERIFIED=true
STATIC_FORM_ENDPOINT_VERIFIED=true
STATIC_FORM_LIVE_CHECK_APPROVED=true
```

Static output validator:

```text
ok=true
localStaticIntegrityOk=true
externalApprovalGatesOk=true
gateClassification.status=passed
staticFormGate.status=configured_owner_approved_backend_verified
backendVerification=verified
liveCheck=explicitly_approved
externalApprovalGateCount=0
```

Staging package validator returned the same passed classification.

