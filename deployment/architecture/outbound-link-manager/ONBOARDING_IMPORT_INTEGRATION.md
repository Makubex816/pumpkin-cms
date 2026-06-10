# Onboarding Import Integration

Tenant onboarding packages should declare outbound link expectations before staging or publication.

## Import Package Files

- `outbound-links.expected.json`
- `outbound-link-policy.json`
- `external-domain-review.md`
- `outbound-link-validation-report.md`

## Validator Rules

- Flag unreviewed outbound domains.
- Flag blocked domains.
- Flag external links missing expected registry entry.
- Flag links not reviewed before live publication.
- Flag imported links that conflict with tenant policy.
- Flag duplicate normalized URLs with conflicting metadata.

## Intake Workflow

1. Import package declares expected external URLs and domains.
2. Local scanner extracts outbound links from package content.
3. Validator compares expected links to discovered links.
4. New or unreviewed domains move to review queue.
5. Owner approval is captured before publication gates.

## Publication Gate

Live publication must remain blocked if required outbound link review is incomplete.
