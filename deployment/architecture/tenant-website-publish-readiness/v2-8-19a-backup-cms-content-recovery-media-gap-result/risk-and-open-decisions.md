# Risk And Open Decisions

## Risks

- Media metadata without binaries can produce broken images if integrated too early.
- Public media URLs exist in metadata, but were not checked in this phase.
- The 12 MediaAsset records include 3 records outside the 9 expected blob inventory.
- Some media usage statuses remain `needs_review`.
- A source rebuild without owner visual approval could recreate the earlier content-readiness gap.

## Open Decisions

- Which binary recovery option should be approved?
- Should `ppec-wordmark-card-d28c10b570d1.png` be recovered, ignored, or replaced?
- Should the Phase 6K/6L test media records be ignored during public rebuild?
- Where should approved local image binaries live if a later phase allows source integration?
- Which owner signs off on visual/content completeness?

