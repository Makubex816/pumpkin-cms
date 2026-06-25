# Public Contact Email Verification

Canonical public contact email:

```text
contact@iceskatingrinkrentals.com
```

Approval:

- `ownerPublicContactEmailApproved`: true.
- Usage: public display and `mailto:contact@iceskatingrinkrentals.com` links only.
- Protected config read to infer backend recipient: no.
- Contact form POST: no.
- Backend contact-form recipient changed: no.

## Evidence

Latest contact recovery artifacts:

- `ice-contact-page.phase9e.visual-pumpkin-rewrite.content.json`: 2 canonical email references, 1 canonical `mailto:` reference, 0 exact Ice placeholder email references.
- `ice-contact-page.phase9e.visual-pumpkin-rewrite.full.json`: 6 canonical email references, 1 canonical `mailto:` reference, 0 exact Ice placeholder email references.
- `ice-contact-page.phase9e.visual-pumpkin-rewrite.preview.html`: 4 canonical email references, 2 canonical `mailto:` references, 0 exact Ice placeholder email references.

Latest service-area recovery artifact:

- `ice-service-areas.phase11b.production-polish.content.json`: 1 canonical email reference, 0 placeholder Ice email references.

Latest homepage/PPEC recovery artifact:

- `APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_PACKAGE.json`: 5 canonical email references, 0 placeholder Ice email references.

The old `hello@iceskatingrinkrentals.com` value appears only in a validation note that says it was replaced with `contact@iceskatingrinkrentals.com`.

## Source Integration Note

Current app fallback source contains generic template email values:

- `apps/ice-rink-web/src/data/fallback-home.ts`: `hello@{{domain}}`.
- `apps/ice-rink-web/src/data/fallback-pages.ts`: `hello@{{domain}}`.

Those generic fallback values were not changed in V2.8.19D. Future source integration must replace or override public email display for the Ice tenant with `contact@iceskatingrinkrentals.com` before public release. The current renderer only emits a mailto link when content supplies an email or when domain routing enables `publicContactEmail`; the recovered public plan should supply the canonical email.
