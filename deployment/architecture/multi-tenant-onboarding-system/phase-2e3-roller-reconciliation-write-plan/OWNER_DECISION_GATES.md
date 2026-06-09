# Owner Decision Gates

## Required Owner Decisions

Before any later reconciliation write can be approved, the owner must decide:

1. Existing tenant is the intended Roller tenant.
2. Existing `home` can be adopted as-is or needs exact field-level updates.
3. Existing `contact` can be adopted as-is or needs exact field-level updates.
4. Contact form recipient mapping is acceptable, blocked, or needs a future recipient write.
5. Missing `service-areas` should be created.
6. `service-areas` creation should be unpublished/not sitemap-included by default, unless a later gate approves a different state.
7. Existing `roller-rink-rentals` page is canonical, supporting, legacy, duplicate, redirect-related, or to be preserved unchanged.
8. Current sitemap inclusion should remain unchanged during reconciliation.
9. Current published state should remain unchanged during reconciliation.
10. Media placeholders are acceptable or require a separate media gate.

## Decision Evidence Required

Each decision should cite:

- current evidence source;
- desired final state;
- exact entity/field affected;
- rollback owner;
- approval wording.

## Missing Decision Rule

If a decision is missing or ambiguous, the related write batch is blocked.
