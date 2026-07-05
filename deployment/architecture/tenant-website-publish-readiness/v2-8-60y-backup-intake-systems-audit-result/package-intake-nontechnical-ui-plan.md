# Package Intake Non-Technical UI Plan

## Route Concept

Route concept: `/dashboard/onboarding/packages`.

## Primary Workflow

1. Upload ZIP.
2. Review upload summary.
3. Scan package.
4. Preview detected website type.
5. Fill missing owner info.
6. Review generated Pumpkin package.
7. Run validation.
8. Run responsive/mobile proof.
9. Download owner action packet or request next approval.

## Plain Status Labels

- Uploaded.
- Scanning.
- Needs missing info.
- Can preview.
- Needs repair.
- Ready for isolated preview.
- Ready for tenant creation.
- Ready for production cutover.
- Blocked: mobile layout issue.
- Blocked: missing media.
- Blocked: missing admin email.
- Blocked: form mapping unclear.

## SuperAdmin-Only Controls

- Approve tenant creation preflight.
- Approve media upload phase.
- Approve FormDefinition creation phase.
- Approve deploy/isolated preview phase.
- Approve production default-host deploy phase.
- Approve custom-domain cutover.
- Approve indexing final gate.

## Operator Guidance

Each blocker should include:

- what the system found;
- why it cannot proceed;
- what the owner must provide;
- whether Codex/source repair is required;
- the next safe approval prompt.

