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
| Effective Entra app role assignment count | 1 |
| Entra Mail.Send assignment count | 1 |

## Exchange RBAC

| Check | Result |
| --- | --- |
| `IsDehydrated` after setup | false |
| Exchange service-principal pointer | exists |
| Management scope for contact mailbox | configured |
| Scope filter | `PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'` |
| Application Mail.Send role assignment | configured |
| Authorization test for contact mailbox | `InScope=True` |

## Function App

Safe status check:

| Check | Result |
| --- | --- |
| endpoint URL | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| `STATIC_FORM_FORWARD_MODE` | `dry-run` |
| `FORM_DELIVERY_MODE` active Graph/m365-Graph | false |
| Microsoft Graph Function app setting name count | 0 |
| `MICROSOFT_GRAPH_CLIENT_SECRET` setting present | false |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` setting present | false |

No endpoint redeploy was performed.

## Protected Output Note

One Azure app-setting diagnostic emitted a protected storage setting value in the command transcript before the check was rerun with exact-name redaction. That value was not written to the repo or result package. No Azure Function app settings were changed.
