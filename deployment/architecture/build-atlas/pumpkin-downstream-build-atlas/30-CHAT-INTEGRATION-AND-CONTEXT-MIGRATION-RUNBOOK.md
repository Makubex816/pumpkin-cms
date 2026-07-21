# Chat Integration and Context Migration Runbook

## Inputs

```text
validated v3 package
+ raw current build closeout
+ normalized closeout record
+ active Atlas export/bridge
+ regenerated CHAT-PACK manifest
+ ZIP SHA-256
```

## Receiving chat startup report

```text
STARTUP STATUS
ACTIVE AUTHORITY
CURRENT PRODUCT REPO/BRANCH/HEAD
UPSTREAM OBSERVED/FROZEN/QUALIFIED SHAS
CURRENT DEPLOYMENTS
FORM/CAPTCHA/INBOX STATUS BY TENANT
ATLAS VERSION
OPEN HARD STOPS
REMAINING MUTATION BUDGETS
FIRST SAFE GATE
```

Allowed states: `READY`, `READY_WITH_WARNINGS`, `BLOCKED`.

Current closeout/live readback overrides package assumptions. Exact Git/deployment artifacts override narrative. Unresolved contradictions produce `BLOCKED`. No mutation is inferred from planning documents.

Upload `generated/CHAT-PACK.md` plus the raw closeout and evidence not embedded in the package. Do not upload superseded ZIPs unless historical comparison is necessary.

Post-ingestion, require the chat to distinguish observed, qualified, integrated, and live-proven facts and state the next gate.
