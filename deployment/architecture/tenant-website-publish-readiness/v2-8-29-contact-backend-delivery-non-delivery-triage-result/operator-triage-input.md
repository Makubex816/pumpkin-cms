# Operator Triage Input

Approved non-secret env values were present in the current process:

| Name | Value |
| --- | --- |
| `PUMPKIN_CONTACT_TRIAGE_TRACE_ID` | `v2-8-26-production-contact-20260626101926` |
| `PUMPKIN_CONTACT_TRIAGE_ENTRY_ID` | `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5` |
| `PUMPKIN_CONTACT_TRIAGE_API_ACCEPTED` | `true` |
| `PUMPKIN_CONTACT_TRIAGE_API_STATUS` | `200` |
| `PUMPKIN_CONTACT_TRIAGE_API_OK` | `true` |
| `PUMPKIN_CONTACT_TRIAGE_ADMIN_INBOX_VISIBLE` | `false` |
| `PUMPKIN_CONTACT_TRIAGE_APPROVED_MODE` | `no-deploy-no-post-readonly-source-triage` |

Operator note:

`Operator checked the Admin tenant quote/contact submissions view and did not see the V2.8.26 production trace or entry; visible latest entry was older than the production test.`

This input confirms the triage question: the production API accepted the request, but the Admin-visible submissions read model did not show the matching record.

