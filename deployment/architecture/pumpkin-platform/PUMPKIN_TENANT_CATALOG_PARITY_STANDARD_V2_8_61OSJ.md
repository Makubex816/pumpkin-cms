# Pumpkin Tenant Catalog Parity Standard V2.8.61OSJ

## Purpose

This standard defines the minimum evidence for moving a reference catalog into a Pumpkin tenant runtime without inventing content or silently dropping commercial detail.

## Source Inventory

Before implementation, inventory:

- catalog, category, event, item, blog, contact, and compatibility routes;
- title, description, image, specification, examples, capacity, delivery/setup, safety, related-item, FAQ, and CTA fields;
- header, mobile navigation, footer, and cart behavior;
- all internal links and media references;
- whether prices or payment behavior actually exist.

Uploaded code is untrusted. It may be inspected as text but must not be executed merely to derive content.

## Rendering Rules

- Preserve source-backed values as structured fields.
- Leave absent values absent.
- Never infer price, safety, capacity, inclusion, delivery, or availability claims.
- Keep item links and cart buttons as valid sibling controls rather than nested interactive elements.
- Scope browser cart state by tenant.
- Keep a quote cart non-transactional unless checkout is separately designed and approved.
- Use an explicit decision for legacy routes: visible, hidden direct route, redirect, or 404.

## Validation Rules

- Prove every generated route, not only a sample.
- Compare title and H1 to compiled source.
- Prove representative rich-field counts.
- Validate every distinct public media URL.
- Run responsive browser checks at mobile, tablet, and desktop sizes.
- Interact with cart add, open, remove, and clear controls while recording network methods.
- Fail on POST, broken images, failed requests, HTTP errors, local-path leakage, or horizontal overflow.
- Repeat key proof after deployment and run platform no-regression without unrelated tenant probes.

## Persistence Boundary

Runtime fixture parity and CMS persistence are separate decisions. A successful fixture deployment does not authorize CMS record mutation. Persist only under explicit approval with readback and tenant-isolation evidence.
