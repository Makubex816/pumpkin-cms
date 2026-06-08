# Approval Boundaries

Each gate is separate. Approval of one gate does not authorize the next gate.

## Gate 0: Candidate Selection

Allows the operator to identify one candidate that appears suitable for the first real tenant pilot.

Does not allow use of real business/domain data in files until the user approves that specific intake.

## Gate 1: Real Non-Secret Intake

Allows collection and review of approved non-secret business, route, media, form, legal/privacy, analytics, monitoring, rollback, and indexing-owner information.

Does not allow package generation, CMS import, tenant creation, external checks, or protected config access.

## Gate 2: Local Package Dry Run

Allows a local builder and validator dry run using approved non-secret intake.

Does not allow CMS writes, tenant creation, MediaAsset writes, DNS, Cloudflare, Azure, deployment, email, Search Console, indexing, external checks, or Roller changes.

## Gate 3: Owner And Operator Review

Allows review of the local import package candidate, validation reports, and support packet.

Does not approve import or deployment.

## Gate 4: CMS Import Planning

Allows planning a future CMS preview import request.

Does not approve CMS import.

## Gate 5: CMS Preview Import

Requires a later explicit approval that names the tenant, import package path, CMS scope, allowed systems, excluded systems, rollback owner, and evidence path.

Not approved by Phase 2C-1.

## Gate 6: Deployment Profile Planning

Allows discussion of a future deployment profile.

Does not approve Azure, Cloudflare, DNS, Function App, email, or deployment changes.

## Gate 7: Deployment Execution

Requires a later explicit deployment approval.

Not approved by Phase 2C-1.

## Gate 8: Final Search Console And Indexing

Requires final owner approval after production smoke, content approval, legal/privacy review, form oversight, analytics decision, monitoring owner, rollback owner, and final indexing owner are all recorded.

Not approved by Phase 2C-1.

## Roller Boundary

Roller remains paused. Any Roller-related candidate, integration, data, or change requires a separate explicit Roller-specific approval before it can be included.
