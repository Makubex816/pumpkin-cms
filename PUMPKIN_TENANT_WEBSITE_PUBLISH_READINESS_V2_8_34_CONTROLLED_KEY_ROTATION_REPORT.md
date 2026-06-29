# V2.8.34 Controlled Key Rotation Report

Date: 2026-06-29

Phase status: blocked after isolated verification.

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring.

Classification: `controlled_static_contact_key_rotation_blocked_isolated_http_400_rollback_complete`.

## V2.8.33C Carryforward

V2.8.33C recorded the public contact gate as closed from V2.8.33B evidence:

- Production trace: `v2-8-33b-production-static-contact-20260629015903-78f5b35b`.
- Production POST status: HTTP 200.
- Production entry ID: `ice-rink-rentals-default-quote-request-97389127-25ea-4731-8bbe-62f6c59e88b4`.
- Authenticated Admin FormEntry readback found the trace.

## Rotation Result

- A fresh tenant/static contact key was generated and hashed.
- The source-discovered `ice-rink-rentals` Tenant auth record was updated in the `Tenant` container.
- Isolated Static Web App contact appsettings were bound to the generated key.
- Admin login and authenticated Admin FormEntry readback preflight passed.
- Isolated `/api/static-contact-health` and `/contact` preflights passed.
- Exactly one isolated verification POST was sent.
- Isolated trace: `v2-8-34-isolated-key-rotation-20260629045108-9b13ff26`.
- Isolated POST result: HTTP 400.
- Isolated Admin readback: not found after 5 polls.

Production was not touched. No production appsetting rotation, production POST, or production readback was run.

## Rollback Result

Rollback was performed after the isolated HTTP 400 hard stop:

- Tenant auth record restored: yes.
- Isolated Static Web App key binding restored: yes.
- Production touched: no.

The generated key is not operational after rollback. No secret values are disclosed in this report.

## Owner Hard Copy

Owner-only hard-copy file:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-34-controlled-key-rotation\ROTATED_VALUES_OPERATOR_HARD_COPY.txt`

Checksum file:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-34-controlled-key-rotation\ROTATED_VALUES_OPERATOR_HARD_COPY.sha256`

SHA-256:

`ee1c8af6572dc0cbd6a819856136a0cf6759424cf895ee180d1c417603b6db43`

Included in hard-copy as owner-only secrets:

- Admin password: yes.
- Jwt__SecretKey: yes.
- Cosmos connection string: yes.

## Security Boundary

No deploy, DNS mutation, custom-domain mutation, Search Console/indexing action, sitemap submission, URL Inspection API action, Google Indexing API action, inbox/provider login, Key Vault query, key listing, SAS generation, or production POST occurred.

One broad source search matched a test `appsettings.json` line before searches were narrowed. No secret value was exposed by that match, and no protected live config file was read.

## Result Package

`deployment/architecture/tenant-website-publish-readiness/v2-8-34-controlled-key-rotation-result/`

## Commit Instructions

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_34_CONTROLLED_KEY_ROTATION_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-34-controlled-key-rotation-result/"
git commit -m "docs: record controlled key rotation rollback"
```
