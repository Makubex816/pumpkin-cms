# Module Boundaries

## Local Scanner Modules

`source-readers`

Read fixture pages, tenant bundles, import packages, and backup bundles.

`extractors`

Extract URLs from declared link-bearing fields, rich text, navigation, footer, forms, and theme config.

`normalizer`

Parse and normalize `http` and `https` URLs without external network access.

`policy-evaluator`

Apply allowed domains, blocked domains, and review-required rules.

`registry-builder`

Create proposed outbound link records and stable ids.

`instance-builder`

Create proposed instance records with deterministic `location_path`.

`diff-engine`

Compare proposed scan output with existing fixture registry to classify new, existing, missing, and stale instances.

`report-writer`

Write scan run, validation report, registry proposal, and instance proposal under `.tmp`.

## Future Runtime Modules

API services must not reuse local scanner code by importing architecture paths directly. Instead, promote stable contracts to a shared package only after 2H-3 proves them locally.

Renderer integration must depend on a resolved snapshot, not on live Admin/API calls during rendering.
