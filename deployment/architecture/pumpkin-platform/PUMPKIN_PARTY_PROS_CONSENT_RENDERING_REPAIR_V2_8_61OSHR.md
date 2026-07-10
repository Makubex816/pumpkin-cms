# Party Pros Consent Rendering Repair V2.8.61OSHR

## Problem

The Party Pros FormDefinition required consent, but the custom contact renderer displayed only `fields`. It omitted `consent`, leaving the browser form inconsistent with the definition and invalidating a fresh browser-level E2E claim.

## Repair

The shared `ContactFormBlock` now:

- reads FormDefinition consent text, field name, and required state;
- renders one explicit checkbox;
- filters a same-named duplicate from the ordinary field list;
- includes a checked value in native `FormData`;
- disables consent along with the submit action in explicit preview.

## Proof

Live custom-domain contact renders one enabled required consent checkbox and one enabled submit button. Explicit preview renders the same required checkbox disabled, with zero enabled submit buttons and a disabled `Preview only` command.

OSHR did not send a form POST. The required custom-header readback inputs were absent, so the phase failed closed before mutation. No auth value was printed or persisted.

## Standard

A tenant form is ready for controlled proof only when the rendered controls, browser validation, serialized payload, FormDefinition, submit endpoint, and authenticated readback contract agree. A prior API-level entry does not substitute for browser proof after the rendered form changes.

