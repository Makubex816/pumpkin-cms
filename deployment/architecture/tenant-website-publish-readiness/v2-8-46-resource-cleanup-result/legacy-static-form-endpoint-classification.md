# Legacy Static Form Endpoint Classification

Resource group: `rg-ice-static-form-endpoint`.

Classification: deferred_cleanup_requires_separate_approval.

Reasons:

- The group exists.
- The group is non-empty.
- It contains `func-ice-static-contact-20260605`, `EastUSPlan`, and `iceforms20260605`.
- Repo/report references identify it as a legacy/static-form Function App stack.
- V2.8.46 allowed deletion only if empty and reference-free.

No delete was attempted for this group.
