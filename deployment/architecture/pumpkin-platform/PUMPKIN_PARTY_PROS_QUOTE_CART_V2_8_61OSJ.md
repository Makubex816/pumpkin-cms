# Pumpkin Party Pros Quote Cart V2.8.61OSJ

## Contract

The Party Pros quote cart is a browser-only planning aid, not commerce infrastructure.

- State is scoped by tenant identifier and stored in local storage.
- Items are normalized and deduplicated by item identifier.
- Catalog and related-item cards may add an item.
- The bottom tray appears after selection and supports expand, remove, and clear.
- Request a Quote is an ordinary link to the existing contact quote anchor.
- The cart does not POST, submit a form, create a FormEntry, check out, accept payment, or create an order.

## Reuse

`QuoteCartProvider`, `QuoteCartButton`, and `QuoteCartTrayBlock` are generic starter components. A tenant fixture opts in by supplying quote-enabled catalog content and a tray block. Tenant-scoped storage prevents one tenant's browser selection from becoming another tenant's selection.

## Proof

Local and live Chrome proof each passed 15/15 cart interactions. Each selected exactly one item, opened the tray, and verified one row and a contact quote link. Across both passes there were zero POSTs, payment actions, failed requests, broken images, or overflows.
