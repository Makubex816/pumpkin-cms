# Abort And Rollback Rules

Phase 2C-2 does not mutate systems. If something goes wrong, stop and preserve or remove local docs as directed.

## Abort Immediately If

- a secret appears in intake or approval materials
- private customer data appears
- protected config appears
- a tokenized private URL appears
- the candidate requires live CMS, Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, external checks, or Roller work before local validation
- the candidate worksheet produces a no-go recommendation
- owner review is unavailable
- legal/privacy status is blocked
- media rights are blocked
- form recipient owner is unknown
- Roller relationship is discovered without separate Roller-specific approval

## No-Mutation Rollback

Because no external system changes are allowed, rollback means:

- stop work
- do not create a package unless a later dry-run approval exists
- do not create a tenant
- do not import content
- do not write CMS or MediaAsset data
- do not touch Azure, Cloudflare, DNS, deployment, Function App settings, email, Microsoft 365, Search Console, indexing, or Roller
- preserve redacted evidence if needed
- remove unsafe local material only after confirming what must be retained for incident review

## Later Generated Output Cleanup

If a later approved dry run creates local generated output and must be abandoned:

- keep generated output local
- do not stage generated output unless a future approval explicitly asks for it
- record the output path
- record the reason for abort
- delete only known generated files if cleanup is approved

## Escalation

Escalate to the operator if secret exposure, private customer data, unclear owner approval, unclear rollback owner, or premature indexing request occurs.
