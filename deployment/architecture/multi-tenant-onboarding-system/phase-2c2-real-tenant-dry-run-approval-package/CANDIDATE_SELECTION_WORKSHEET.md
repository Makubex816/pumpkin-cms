# Candidate Selection Worksheet

Use this worksheet to choose the safest first real tenant candidate.

Do not include passwords, API keys, tokens, private customer data, protected config, or raw production credentials.

## Candidate Identity

| Field | Answer |
| --- | --- |
| Candidate tenant name | |
| Candidate tenant slug, if known | |
| Candidate domain | |
| `www` domain preference | |
| Business type | |
| Business owner | |
| Owner availability for review | |
| Operator reviewer | |

## Complexity Review

| Question | Answer |
| --- | --- |
| How many public pages are needed? | |
| Are routes simple brochure pages? | |
| Is any custom routing needed? | |
| Are there forbidden or obsolete routes? | |
| Are approved images/media ready? | |
| Are placeholders acceptable for missing media? | |
| Is the contact form recipient known? | |
| Is the mailbox owner known? | |
| Is `leadRecipientRef` known? | |
| Is legacy `recipientGroup` compatibility needed? | |
| Is legal/privacy complexity low, medium, or high? | |
| Is the privacy/legal reviewer known? | |
| Is analytics/tracking disabled, planned, or approved later? | |
| Is there urgent deadline pressure? | |
| Is the candidate related to Roller? | |
| Does the candidate require live external integrations? | |

## Risk Score

Score each row from `0` to `3`.

`0` means low risk. `3` means high risk.

| Risk Area | Score | Notes |
| --- | --- | --- |
| Route complexity | | |
| Media readiness | | |
| Form recipient readiness | | |
| Legal/privacy complexity | | |
| Deadline pressure | | |
| Owner availability | | |
| External integration dependency | | |
| Roller relationship | | |
| Secret or private-data risk | | |

## Scoring Guidance

- `0-4`: good first dry-run candidate
- `5-8`: possible candidate, review concerns first
- `9-14`: not recommended for first dry run
- `15+`: no-go for first dry run

## Go/No-Go Recommendation

| Field | Answer |
| --- | --- |
| Total risk score | |
| Recommendation | `go`, `go_with_notes`, `no_go`, or `needs_more_information` |
| Main reason | |
| Required follow-up before dry-run approval | |
| Selected for first real dry run | `yes` or `no` |

## Hard No-Go Conditions

Mark `no_go` if any of these are true:

- the candidate requires secrets in intake
- the candidate requires private customer data
- owner review is unavailable
- form recipient owner is unknown
- legal/privacy status is blocked
- media rights are blocked
- external changes are needed before local validation
- the candidate is Roller-related without a separate Roller-specific approval
