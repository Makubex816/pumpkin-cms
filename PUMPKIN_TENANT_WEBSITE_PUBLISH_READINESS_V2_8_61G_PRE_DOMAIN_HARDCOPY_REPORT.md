# V2.8.61G Pre-Domain Hardcopy Report

Status: completed_success

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: pre_domain_cutover_master_operator_hardcopy_full_secret_resource_binding_inventory_no_mutation

Created UTC: 2026-07-07T16:31:23.089Z

## V2.8.61F Carryforward

V2.8.61F completed the Airstrip backup/intake end-to-end operator proof. Fresh backup export, restore dry-run, package intake, package compiler, V1 validator, responsive proof, Admin UI review, TenantAdmin denial, and runtime no-regression all passed.

## Hardcopy Location

Outside-repo hardcopy folder:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-61g-pre-domain-cutover-master-operator-hardcopy`

Hardcopy files:

| File | SHA-256 |
| --- | --- |
| `PUMPKIN_MASTER_OPERATOR_HARD_COPY_PRE_DOMAIN_CUTOVER.txt` | `bae494f459ed8c7c91e154c4807b4960fde3ad09113f24e144d50c44c4187657` |
| `PUMPKIN_MASTER_OPERATOR_HARD_COPY_PRE_DOMAIN_CUTOVER.json` | `534c34addfd62948429b0eae94d0f053d2b4bee51e5daf567a25b1a55a9ab1a0` |
| `MISSING_OR_NONRECOVERABLE_SECRETS.md` | `7fc166e9884844c445d39fc80769a55885180a3eaec745c7cb412459a61ee419` |
| `RESOURCE_LOCATION_INDEX.md` | `d60c5b65be96867edb27b90419adf503352348f15fd619e4d8b7ef1561a075ce` |

## Secret Section Booleans

| Section | Included in outside hardcopy |
| --- | --- |
| Current SuperAdmin credential from V2.8.60WC | true |
| Airstrip TenantAdmin credential from V2.8.57 | true |
| Airstrip tenant API key from V2.8.57 | true |
| Airstrip static-contact API key from V2.8.57 | true |
| App Service appsettings | true |
| App Service publishing profiles | true |
| Static Web App secrets | true |
| Cosmos keys and connection strings | true |
| Storage keys and connection strings | true |
| Key Vault secret values | false, RBAC inaccessible |

## Redacted Inventory Summary

Azure read-only inventory found 29 resources: 6 App Services, 2 Static Web Apps, 2 Cosmos accounts, 3 Storage accounts, 1 Key Vault, Log Analytics, action group, metric alerts, plans, and supporting resources.

Current API inventory found 2 tenants, 3 admin users, and 1 DomainBinding. Tenants are `ice-rink-rentals` and `airstrip-club-las-vegas`.

Airstrip DomainBinding remains pending DNS records:

| Field | Value |
| --- | --- |
| Tenant | `airstrip-club-las-vegas` |
| Domain | `airstripclublasvegas.com` |
| WWW domain | `www.airstripclublasvegas.com` |
| Status | `pending_dns_records` |
| DNS validation | `pending` |
| Azure hostname | `not_started` |
| TLS | `not_started` |
| Runtime | `not_started` |
| Promotion | `not_promoted` |

Live Azure discovery shows `app-airstrip-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`.

## Runtime No-Regression

GET-only runtime proof passed 17/17. No contact POST, form submission, customer-facing POST, deploy, DNS action, appsetting mutation, media mutation, Cosmos mutation, or SAS generation occurred.

## Missing/Nonrecoverable Categories

- `bluehost_login_credentials`
- `google_workspace_email_dns_credentials`
- `non_current_user_plaintext_passwords`
- `customer_form_entry_payloads`
- `live_restore_adapter`
- `airstrip_custom_domain_binding`

## Files

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61g-pre-domain-hardcopy-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_PRE_DOMAIN_CUTOVER_MASTER_OPERATOR_HARDCOPY_V2_8_61G.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_CURRENT_SECRET_RESOURCE_BINDING_INVENTORY_V2_8_61G.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_PRE_DOMAIN_CUTOVER_RECOVERY_STATE_V2_8_61G.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_MASTER_OPERATOR_RECOVERY_RUNBOOK_V2_8_61G.md`

Next approval is folded into `deployment/architecture/tenant-website-publish-readiness/v2-8-61g-pre-domain-hardcopy-result/next-phase-prompt.md`.
