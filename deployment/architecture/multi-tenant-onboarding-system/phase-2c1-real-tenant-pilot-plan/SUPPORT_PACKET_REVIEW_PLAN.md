# Support Packet Review Plan

The support packet is the handoff bundle for owner and operator review. It must be useful without exposing secrets.

## Packet Should Include

- package summary
- tenant display name and slug
- route list
- media reference summary
- form reference summary using `leadRecipientRef` and compatible `recipientGroup` information
- owner contact and responsibility summary
- approvals and pending gates
- validator JSON report
- human-readable validation report
- known warnings, blockers, and manual-review items
- generated file inventory
- redaction notes

## Packet Must Not Include

- raw secrets
- protected config
- private customer data
- tokenized URLs
- mailbox contents
- external credentials
- private local paths outside the working output folder
- unredacted environment values

## Reviewers

| Reviewer | Reviews |
| --- | --- |
| Business owner | public business facts, content, domain intent, legal/privacy status, final indexing hard stop |
| Form oversight owner | form purpose, form fields, lead recipient reference, future test boundary |
| Operator | validation result, package consistency, support packet redaction, stop points |
| Rollback owner | later rollback responsibility and abort conditions |
| Monitoring owner | later monitoring responsibility |

## Packet Approval Rule

Approving a support packet only approves the local evidence package. It does not approve CMS import, tenant creation, deployment, email, DNS, Cloudflare, Azure, Search Console, indexing, or Roller changes.
