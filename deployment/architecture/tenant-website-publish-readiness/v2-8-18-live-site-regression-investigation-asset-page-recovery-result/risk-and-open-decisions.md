# Risk And Open Decisions

## Risks

- Production-bound target name includes `staging`, which can cause unsafe assumptions.
- Current public output is technically valid but visually/content incomplete.
- No Git-backed image-heavy source was found.
- A quick image copy to production would risk path, licensing, layout, SEO, and rollback defects.
- A rollback without artifact provenance could restore unknown old code or stale form behavior.

## Open Decisions

- Which source is authoritative for the intended older image-heavy experience?
- Should recovery target exact rollback, rebuild, or hybrid restoration?
- Which images are approved and licensed?
- Who gives owner visual/content approval?
- Which artifact path and commit SHA should be production-approved after isolated staging signoff?

Production execution must remain blocked until these decisions are resolved.

