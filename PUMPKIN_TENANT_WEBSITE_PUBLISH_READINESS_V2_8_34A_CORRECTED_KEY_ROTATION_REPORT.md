# V2.8.34A Corrected Key Rotation Report

Date: 2026-06-29

Phase status: completed.

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring.

Classification: `corrected_payload_contract_static_contact_key_rotation_success_production_readback_confirmed`.

## V2.8.34 Carryforward

V2.8.34 attempted controlled key rotation, but the isolated verification POST returned HTTP 400. Production was not touched, and the tenant record plus isolated key binding were rolled back.

Failed V2.8.34 isolated trace:

`v2-8-34-isolated-key-rotation-20260629045108-9b13ff26`

The V2.8.34 generated key was treated as inactive/rolled back and was not reused.

## Payload Contract Diagnosis

The V2.8.34 isolated HTTP 400 was consistent with a payload contract mismatch. Source review confirmed Pumpkin API `FormSubmissionGuard` requires `default-quote-request` submissions to include:

`fullName`, `email`, `phone`, `eventCity`, `eventState`, `eventDateOrDateRange`, `eventType`, `venueSetting`, `message`, and `consent`.

V2.8.34A built isolated and production payloads from that source-confirmed contract and validated the exact trace-bearing payloads locally before mutation.

## Rotation Result

- Fresh V2.8.34A key generated: yes.
- Failed V2.8.34 key reused: no.
- Tenant auth record rotated for `ice-rink-rentals`: yes.
- Isolated appsettings bound to fresh key: yes.
- Isolated POST/readback: passed.
- Production appsettings bound to fresh key: yes.
- Production POST/readback: passed.
- Rollback performed: no.

## Verification

Isolated trace:

`v2-8-34a-isolated-key-rotation-20260629134931-a88a0d37`

Isolated entry ID:

`ice-rink-rentals-default-quote-request-64735477-8f5b-41bb-846c-e6f8078b057e`

Production trace:

`v2-8-34a-production-key-rotation-20260629134931-bf80dd04`

Production entry ID:

`ice-rink-rentals-default-quote-request-1fb21846-365d-4478-96e7-1e76cae92747`

Contact gate status after rotation: closed.

## Owner Hard Copy

Owner-only hard-copy file:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-34a-corrected-key-rotation\ROTATED_VALUES_OPERATOR_HARD_COPY.txt`

Checksum file:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-34a-corrected-key-rotation\ROTATED_VALUES_OPERATOR_HARD_COPY.sha256`

SHA-256:

`f12c6f8f2afb0da7fbac0788477195e3269b3eeec34c361da7b3b50369ce004d`

Included in hard-copy as owner-only secrets:

- Admin password: yes.
- Jwt__SecretKey: yes.
- Cosmos connection string: yes.

No secret values are disclosed in this report.

## Security Boundary

No deploy, redeploy, DNS/custom-domain mutation, Search Console/indexing action, sitemap submission, URL Inspection API action, Google Indexing API action, inbox/provider login, Key Vault query, key listing, SAS generation, or unrelated tenant/appsetting mutation occurred.

Exactly one isolated verification POST and exactly one production verification POST were sent.

## Result Package

`deployment/architecture/tenant-website-publish-readiness/v2-8-34a-corrected-key-rotation-result/`

## Commit Instructions

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_34A_CORRECTED_KEY_ROTATION_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-34a-corrected-key-rotation-result/"
git commit -m "docs: close corrected static contact key rotation"
```
