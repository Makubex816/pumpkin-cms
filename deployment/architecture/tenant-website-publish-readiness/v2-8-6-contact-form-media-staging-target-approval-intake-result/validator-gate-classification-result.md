# Validator Gate Classification Result

Status: classification hardened and verified.

The static output validator and staging package validator now distinguish:

- local static integrity checks
- external backend/owner approval gates

## Local Static Integrity

Covered checks include:

- required output files
- canonical Ice route folders
- obsolete Ice route exclusion
- static publish manifest route shape
- media URL safety
- domain/canonical references
- noindex production-page gate
- forbidden config files in output
- sensitive content scan
- redirect manifest sanity
- CMS-authored HTML safety

Latest result:

```text
localStaticIntegrityOk: true
structuralErrors: []
```

## External Approval Gates

Current external gates:

| Gate | Status | Required evidence |
| --- | --- | --- |
| `static-form-endpoint-configured` | blocked | Approved HTTPS static form endpoint supplied through process environment without protected config reads |
| `static-form-backend-verification` | blocked | Backend proof that the approved endpoint accepts the static form payload and routes leads to the approved owner workflow |

Latest result:

```text
externalApprovalGatesOk: false
gateClassification.status: blocked_external_approval_gate
```

The validators still exit non-zero when external gates are blocked.
