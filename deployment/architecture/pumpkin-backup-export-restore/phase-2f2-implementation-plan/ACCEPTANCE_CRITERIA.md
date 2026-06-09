# Acceptance Criteria

## Phase 2F-2 Acceptance

- Implementation planning package exists.
- Root Phase 2F-2 report exists.
- Package/code locations are recommended.
- Module boundaries are defined.
- Data model and statuses are defined.
- Standard backup exporter plan is defined.
- Encrypted escrow exporter plan is defined.
- Backup validator plan is defined.
- Restore validation plan is defined.
- API/UI/CLI plans are defined.
- Test fixtures are defined.
- Ready for Phase 2F-3 local standard backup exporter prototype decision.
- No implementation occurs.
- No backup or escrow artifact is created.
- No secrets or protected config are touched.
- No external mutations occur.
- Live pages remain hard-stopped.

## Phase 2F-3 Future Acceptance Preview

Phase 2F-3 should not be accepted unless:

- local-only package exists;
- standard backup bundle can be generated to `.tmp`;
- manifest and checksums are written;
- backup validator passes happy path;
- invalid fixtures fail for expected reasons;
- standard backup includes `ESCROW_NOT_INCLUDED.md`;
- no secret values appear in standard bundle;
- no backup zip, real database export, real escrow payload, CMS/API call, or external mutation occurs.
