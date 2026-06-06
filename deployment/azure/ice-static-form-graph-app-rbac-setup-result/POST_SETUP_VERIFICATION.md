# Post-Setup Verification

Generated: 2026-06-05
Updated: 2026-06-06

## App

| Check | Result |
| --- | --- |
| App registration exists | yes |
| Tenant service principal exists | yes |
| Exchange service-principal pointer exists | yes |
| Client secret/certificate count | 0 |

## Graph Permission

| Check | Result |
| --- | --- |
| Required permission includes Graph `Mail.Send` | yes |
| Mail.Send app role id | `b633e1c5-b582-4048-a93e-9f11b44c7e96` |
| Effective Entra app role assignment count | 0 |
| Entra Mail.Send assignment count | 0 |

## Exchange RBAC

| Check | Result |
| --- | --- |
| Exchange service-principal pointer | exists |
| Management scope for contact mailbox | not configured |
| Application Mail.Send role assignment | not configured |
| Authorization test for contact mailbox | not in scope |
| Blocker | `Enable-OrganizationCustomization` required |

## Function App

Safe name/status-only check:

| Check | Result |
| --- | --- |
| `STATIC_FORM_FORWARD_MODE` is dry-run | true |
| `FORM_DELIVERY_MODE` active Graph/m365-Graph | false |
| Microsoft Graph Function app setting name count | 0 |

No endpoint redeploy was performed.

