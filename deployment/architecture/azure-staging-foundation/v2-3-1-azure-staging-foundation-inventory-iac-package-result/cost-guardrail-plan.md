# Cost Guardrail Plan

The staging foundation must be inexpensive, tagged, cleanup-friendly, and explicitly bounded before creation.

## Guardrails

- Use non-production names and tags.
- Require a budget or cost alert before usage expands beyond first-write proof.
- Prefer low-throughput or serverless staging settings where they fit the provider requirements.
- Keep optional diagnostics modest until runtime QA and trace volume are known.
- Require owner and cleanup date tags.
- Do not create duplicate staging resources without closing or documenting the older candidate.

## Proposed Tag Requirements

| Tag | Purpose |
| --- | --- |
| `project=PumpkinCMS` | Platform ownership |
| `environment=staging` | Non-production boundary |
| `lane=OutboundLinkManager` | Product lane |
| `owner=<approved-owner>` | Cleanup and cost owner |
| `createdByPhase=<future-phase>` | Auditability |
| `cleanupReviewDate=<date>` | Expiration review |

## Cost Review Before Creation

Future creation approval must include:

- Target region.
- SKU/capacity decisions.
- Estimated monthly ceiling.
- Budget/alert owner.
- Cleanup condition if OLM staging write is abandoned.
- Confirmation that production resources are not being reused.

