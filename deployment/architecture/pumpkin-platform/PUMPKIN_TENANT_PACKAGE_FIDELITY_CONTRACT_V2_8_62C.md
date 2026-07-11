# Pumpkin Tenant Package Fidelity Contract V2.8.62C

## Governing Rule

When an owner supplies a front-end package and expects it to render and behave as built, the package is the visual and functional specification. Pumpkin must reproduce that intent unless the owner explicitly approves a specific deviation.

Schema validity, successful compilation, and generic renderer compatibility do not establish fidelity. A tenant is not creation-ready until every source route, link, asset, content structure, form instance, and interactive control has a recorded disposition and the adapted result passes its required proof.

## Required Dispositions

Every source element must be assigned exactly one disposition:

1. `preserved` - the source behavior or presentation is retained.
2. `safely_adapted_equivalent` - trusted Pumpkin code reproduces the source intent.
3. `owner_approved_change` - the owner approved the exact deviation and its scope.
4. `blocked_owner_review` - intent or a safe equivalent is unresolved, so creation remains blocked.

Silence is not a disposition. Generic starter output, omitted content, inert controls, guessed links, flattened detail pages, and unexplained asset removal fail this contract.

## Fidelity Dimensions

The required inventory and parity proof cover:

- all direct routes, aliases, redirects, visibility rules, titles, H1s, metadata, sections, and responsive layouts;
- internal, external, relative, anchor, `mailto`, `tel`, and download links in navigation, content, forms, and footers;
- HTML media, CSS `url()` dependencies, `srcset`, lazy/data attributes, galleries, JavaScript references, and structured data references;
- catalog/category/detail and blog/list/article relationships, content depth, related links, and supporting media;
- menus, buttons, filters, tabs, disclosures, modals, sliders, galleries, quote carts, and other stateful interactions;
- each form instance's labels, options, defaults, hidden values, required state, validation, purpose, consent, honeypot, destination, success behavior, and reset/navigation flow; and
- browser behavior at approved mobile, tablet, and desktop viewports, including keyboard and failure states where applicable.

## Uploaded Code Boundary

Uploaded JavaScript is untrusted input. Inventory and static analysis may inspect it, but Pumpkin must not deploy or execute it merely because it is present. Intended behavior must be mapped to reviewed, tenant-scoped Pumpkin code. Structured data and presentation configuration must also be classified and adapted deliberately.

Dormant code is not silently discarded or activated. It receives `blocked_owner_review` until source markup, data, and owner intent establish whether it is required, legacy, or intentionally disabled.

## Routes And Links

Redirects and aliases are first-class route behavior. A parser must preserve source-file attribution when resolving a redirect so target-page references are not falsely reported against the redirecting directory.

External links are not removed merely because they point to another property. Repetition, labels, surrounding content, and package data determine intent. Intentional links are preserved and browser-proved unless the owner approves removal or replacement. Probing an external site is not required to establish source-package intent.

## Media

The media graph must span HTML, CSS, JavaScript text, JSON/data, lazy and responsive attributes, galleries, and route-specific behavior. Hash deduplication may store one binary per content hash only when every original path and alias remains resolvable.

An asset is not excluded because an initial HTML scan did not reach it. Exclusion requires conclusive dead-asset evidence or explicit owner approval. Ambiguous assets remain retained candidates and block final scope selection.

## Forms

Canonical FormDefinitions may serve multiple source instances only when an instance ledger preserves every meaningful difference. Field-shape equality alone is insufficient. Submit labels, options, defaults, hidden metadata, purpose, validation, consent, honeypot, success copy, destination, and reset/navigation behavior are part of the contract.

No source checkout or payment behavior may be enabled without explicit approval. Source quote-cart or lead-planning behavior must remain functional when it was intended.

## Creation Gate

Live tenant creation is prohibited until all of these are accepted:

- full route and redirect parity;
- full link-target parity;
- media dependency and alias parity;
- visual structure and responsive parity;
- interaction and button parity;
- catalog/detail and blog/article parity;
- form-instance parity;
- zero silent generic fallback; and
- resolution or explicit acceptance of every owner-review item.

The acceptance packet must retain source identity, analyzer safety facts, counts, gaps, browser evidence, and owner approvals. A later phase must revalidate these gates immediately before its first live mutation.
