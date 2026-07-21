# Change Classification and Decision Matrix

| Incoming subsystem | Classification | Immediate action | Required proof |
|---|---|---|---|
| `IHtmlBlock` id/name/enabled | `direct_adopt_with_migration` | Preserve model contract and TS parity | all-block round trip, existing-page migration, unknown block preservation |
| Visual page editor | `adapt_or_port` | Use upstream starter as canonical UI primitive | role scope, save/readback, concurrency, preview security, browser E2E |
| Visual navigation tree | `adapt_or_port` | Preserve tree operations and page-link awareness | nested reorder, draft destination warnings, tenant scope, cache readback |
| Header logo media | `direct_adopt_or_port` | Use shared MediaAsset path | media authorization, public URL safety, alt text, rollback |
| Tenant CAPTCHA settings | `direct_adopt` | Preserve settings shape and secret references | serialization, admin sanitization, tenant migration |
| Form CAPTCHA override | `direct_adopt` | Preserve inherit/required/disabled/action | public resolution, invalid action rejection, default compatibility |
| Turnstile verifier | `wrap_and_extend` | Keep provider adapter, add retry/idempotency/telemetry policy | expiry/replay/outage/action/hostname/network tests |
| Turnstile client widget | `adapt_or_port` | Keep explicit rendering, repair spent-token retry paths | error/reset/expiry/retry/browser tests |
| Form submission integration | `wrap_and_extend` | Insert CAPTCHA into exact-one submission contract | submission/correlation IDs, duplicate and ambiguous timeout proof |
| Process-local rate limit | `replace_or_layer` | Retain only as local defense; add distributed control | multi-instance concurrency and expiry proof |
| Deploy ZIP ignore | `direct_adopt` | Keep generated package out of source | artifact/source scan |
| Authorize.Net | `defer_external_dependency` | No implementation work yet | later source intake |

The machine-readable decision register is `evidence/upstream-change-decisions-v3.json`. No final implementation classification is complete until compared with the active downstream source.
