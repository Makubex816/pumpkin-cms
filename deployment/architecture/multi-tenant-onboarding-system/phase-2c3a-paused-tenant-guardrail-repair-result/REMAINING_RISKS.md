# Remaining Risks

## Remaining Planning Risks

- Roller generated page copy is still placeholder-level.
- Named owner contacts remain pending placeholders.
- Media rights are not yet confirmed.
- Legal/privacy review is pending.
- Form oversight approval is pending.
- Analytics decision approval is pending.
- Monitoring and rollback owners need final confirmation.
- CMS import planning is not approved yet.

## Guardrail Risks

The new allowance is intentionally narrow. Future work should avoid expanding it into a generic override.

Any future paused-tenant support should require:

- exact tenant and domain match
- local/offline scope
- explicit false external mutations
- explicit false live-page approval
- explicit false Search Console approval
- noindex and sitemap hard-stop settings
- tests for unsafe variants

## Live-Page Risk

Live pages remain hard-stopped. No production readiness or live publication is approved.
