# Risk Register

| Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- |
| Secrets supplied in intake | Unsafe docs, package, or support packet | Use forbidden-information review before intake and abort on exposure | controlled by gate |
| Private customer data supplied | Privacy issue | Forbid customer lists, form exports, mailbox contents, and private records | controlled by gate |
| Candidate too complex | Dry run produces noisy or inconclusive results | Choose simple brochure-style tenant with few routes and one lead form | controlled by selection |
| Owner responsibilities unclear | Later approval cannot be trusted | Require content, form, monitoring, rollback, and indexing owners before dry run | controlled by intake |
| Domain ownership unclear | Later DNS/deployment planning may be blocked | Record domain owner or placeholder; do not change DNS | controlled by intake |
| Form recipient ambiguity | Leads could route incorrectly in a later phase | Require `leadRecipientRef`, mailbox owner, and legacy compatibility review | controlled by validator |
| Media rights unclear | Public launch risk | Require rights status for every media item or use placeholders | controlled by intake |
| Legal/privacy unresolved | Owner may mistake dry run for launch approval | Record status and block execution if not approved or risk-accepted later | manual review |
| Analytics decision missing | Later launch checklist incomplete | Require analytics decision even if disabled for pilot | controlled by intake |
| Support packet leaks local details | Operator handoff unsafe | Redaction review is mandatory before owner handoff | controlled by review |
| Search Console requested early | Premature indexing | Keep final indexing hard stop visible in all reviews | hard stop |
| Roller scope confusion | Paused system accidentally resumes | Exclude Roller unless separately approved | hard stop |
| External mutation accidentally requested | Pilot exceeds approval | Abort and request a new exact approval | hard stop |
| Schema drift after Phase 2B-5 | Builder/validator results diverge | Run current tests before dry run and record tool versions/commit | controlled by readiness |

## Highest Priority Risks

The first pilot should treat secret exposure, external mutation, and premature indexing as immediate stop conditions.
