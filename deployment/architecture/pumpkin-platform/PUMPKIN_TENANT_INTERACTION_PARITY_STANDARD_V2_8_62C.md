# Pumpkin Tenant Interaction Parity Standard V2.8.62C

## Purpose

Interaction parity means that every source control has a known intended action and that the trusted Pumpkin adaptation performs the same user-visible job. Rendering a button without working behavior is a parity failure.

## Inventory Contract

Inventory all physical and dynamically described controls, including:

- navigation links, menu toggles, skip links, and footer actions;
- buttons and button-styled anchors;
- selects, filters, searches, tabs, accordions, and native disclosures;
- modal open/close controls, galleries, sliders, and media controls;
- catalog and article navigation;
- cart, quote-cart, compare, concierge, and planning actions;
- form submit, consent, validation, success, reset, and destination behavior; and
- download/export, clear, destructive, checkout, and payment controls.

The ledger records source route, source selector or identity, visible label, state, input/output, dependencies, intended action, adaptation, proof status, and disposition. Redirect routes also receive an effective control map for the target behavior they expose.

## Trusted Adaptation

Uploaded scripts are inspected as text and are never the trust boundary. Reimplement active behavior in reviewed Pumpkin/runtime code with tenant scoping, safe DOM/state handling, accessible semantics, and no secret material in client output.

For dormant hooks, unreachable branches, or controls with no handler, do not guess. Preserve the evidence and mark the item `blocked_owner_review` until it is proven intentional, legacy, or owner-rejected.

Native browser controls such as `details`/`summary` may remain native when their keyboard and disclosure behavior is equivalent. A visual-only imitation is not equivalent.

## Forms And Conversion Controls

Each source form instance is an interaction, not just a field signature. Proof must cover:

- labels, options, defaults, hidden values, and required state;
- client and server validation;
- consent and honeypot handling;
- query-string or source-context prefill;
- the intended submission purpose and safe destination;
- success copy, focus/scroll behavior, reset behavior, and retry/failure state; and
- tenant-isolated readback in a separately approved E2E phase.

No checkout or payment path is enabled without explicit owner approval. Quote-cart, compare, concierge, or planning interactions remain required when the source intended them.

## Browser Proof

For every mapped action, browser proof must demonstrate:

1. the control is visible when intended and not hidden by layout defects;
2. pointer and keyboard activation reach the mapped action;
3. the expected state, navigation, download, or form result occurs;
4. focus, expanded state, validation, and error behavior remain coherent;
5. mobile, tablet, and desktop layouts do not overlap or disable the control;
6. internal targets resolve, external targets retain safe link attributes, and anchors land on existing IDs; and
7. no unexpected POST, checkout, payment, customer contact, or cross-tenant action occurs.

Proof may group genuinely identical repeated controls, but the occurrence ledger must reconcile to the source count. A grouped failure fails every affected occurrence.

## Acceptance

Interaction parity passes only when 100 percent of in-scope occurrences have one of the four package-fidelity dispositions, every preserved/adapted control has passing browser proof, and all blocked items are resolved or explicitly accepted by the owner. An inert rendered control, silently removed action, or activated dormant payment path is an automatic failure.
