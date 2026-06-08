# Implementation Options

| Option | Strengths | Weaknesses | Best use |
| --- | --- | --- | --- |
| Docs/template-only flow | Lowest effort, already close to current intake package. | Still asks users to edit tables/files manually; weak validation before handoff. | Interim manual process. |
| CLI package builder | Fastest implementable guided flow; close to validator; easy local/offline boundary. | Less friendly for very low-skill users; harder to show rich field help. | Phase 2B1 prototype. |
| Admin UI wizard | Best for low-skill users; strong field help, save/resume, review screens. | More implementation surface, auth, state, audit, and UX complexity. | Phase 2B2. |
| Hybrid CLI + UI | CLI provides generator/validator core; UI wraps it. | Requires careful shared model design. | Recommended medium-term architecture. |
| Hosted onboarding portal | Best external collaborator experience. | Highest security, auth, tenancy, hosting, and support burden. | Later phase only after process proves stable. |

## Recommended Phased Approach

1. Phase 2B1 CLI/package builder prototype.
2. Phase 2B2 Admin UI wizard.
3. Phase 2B3 support packet UI/export.
4. Phase 2B4 approval workflow integration.

## Phase 2B1 Recommendation

Build a local/offline CLI package builder prototype that:

- reads a draft answer file or guided prompts
- generates package JSON files deterministically
- invokes the existing offline validator
- writes reports and support packets
- never calls external systems

This creates a testable generation core before investing in Admin UI workflow.
