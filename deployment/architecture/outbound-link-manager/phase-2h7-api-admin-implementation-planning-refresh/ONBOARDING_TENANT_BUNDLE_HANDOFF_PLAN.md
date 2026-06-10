# Onboarding Tenant Bundle Handoff Plan

Outbound Link Manager must support tenant onboarding and tenant website bundle workflows.

## Onboarding Import

The onboarding importer should be able to receive or generate:

- outbound link registry files
- outbound link instance files
- outbound link policy files
- domain review reports
- validation reports
- review-required gate output

Import validation should hard-stop on:

- blocked domains
- tenant/site mismatch
- missing policy
- invalid normalized URL shape
- mixed tenant records
- disabled governance state that would be lost

## Tenant Bundle

Tenant bundles should include OLM state alongside content, media metadata, route metadata, and backup compatibility metadata.

Bundle validation should check:

- tenant/site scope
- registry and instance counts
- policy version
- render-decision compatibility
- backup export compatibility
- stale and pending review summaries

## Admin Handoff

Admin should show import/bundle readiness as read-only status first. Write actions, import commits, and bundle-based live updates require later approval.

