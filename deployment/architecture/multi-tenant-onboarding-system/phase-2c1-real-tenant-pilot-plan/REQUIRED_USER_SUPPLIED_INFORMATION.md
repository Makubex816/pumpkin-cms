# Required User-Supplied Information

The first real tenant dry run needs the following non-secret information before package generation.

## Tenant Identity

| Field | Required | Notes |
| --- | --- | --- |
| Business display name | yes | Public-facing name to show in generated content. |
| Proposed tenant slug | yes | Operator may normalize it before generation. |
| Business owner contact name | yes | Person who can approve the pilot. |
| Content approver | yes | May be the business owner. |
| Operator contact | yes | Person responsible for package review. |
| Rollback owner | yes | Required before any later mutation gate. |
| Final indexing owner | yes | Required even though indexing remains blocked. |

## Domain And Routing

| Field | Required | Notes |
| --- | --- | --- |
| Primary domain | yes | Public domain or approved placeholder. |
| `www` preference | yes | `www`, apex, both, or undecided. |
| Public route list | yes | Pages expected in the package. |
| Route owner approval | yes | Confirms routes are allowed for pilot output. |
| Redirect expectations | if known | Planning only; no redirects are changed. |

## Content

| Field | Required | Notes |
| --- | --- | --- |
| Approved content source | yes | Existing public site, owner draft, or approved placeholders. |
| Page titles/headings | yes | Enough for validator and owner review. |
| Service areas | if applicable | Public service area names only. |
| Business hours | if applicable | Public information only. |
| Phone number | if applicable | Public number only. |
| Public email address | if applicable | Public display email only, not mailbox credentials. |

## Media

| Field | Required | Notes |
| --- | --- | --- |
| Media inventory | yes | Approved filenames, public non-tokenized URLs, or placeholders. |
| Alt text | yes | Required for review quality. |
| Media rights status | yes | `approved`, `pending`, `placeholder`, or `blocked`. |
| Hero image preference | if applicable | Public-safe only. |

## Forms

| Field | Required | Notes |
| --- | --- | --- |
| Lead recipient reference | yes | Use `leadRecipientRef`; do not provide secrets. |
| Legacy recipient group | if needed | Preserve compatibility where package requires it. |
| Mailbox owner | yes | Human owner of the destination mailbox. |
| Form oversight owner | yes | Person responsible for review and later test approval. |
| Form fields | yes | Only public inquiry fields; no private customer lists. |

## Legal, Privacy, Analytics, Monitoring

| Field | Required | Notes |
| --- | --- | --- |
| Legal/privacy status | yes | `approved`, `pending`, `risk_accepted`, or `blocked`. |
| Privacy policy source | if applicable | Public-safe URL, draft name, or placeholder. |
| Analytics decision | yes | `disabled`, `planned`, `approved later`, or `blocked`. |
| Monitoring owner | yes | Human owner for post-launch monitoring, even if later. |
| Rollback owner | yes | Required before any future mutation gate. |
| Final indexing decision owner | yes | Search Console and indexing remain final hard stops. |

## Deployment Profile Preference

| Field | Required | Notes |
| --- | --- | --- |
| Preferred deployment profile | if known | Planning only. No profile execution is approved. |
| DNS owner | if known | Planning only. No DNS change is approved. |
| Hosting constraints | if known | Planning only. No hosting change is approved. |
