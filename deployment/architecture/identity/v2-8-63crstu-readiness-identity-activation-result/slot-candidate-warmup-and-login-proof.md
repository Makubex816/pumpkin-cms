# Slot candidate warmup and login proof

Candidate-four identity was carried forward and not rebuilt during CRSTUR.

Immutable API package identity:

- SHA-256: `0cdd1dea1ff7a39d2484a7e3b36f1a0b2f76501f714732ba47c1c18452b0e7d4`
- Entries: 56
- Bytes: 12,045,875
- Protected entries: none
- Backslash ZIP paths: none

The slot proof completed before CRSTUR:

- candidate readiness independently reached both workers,
- Stage A cold passed 18/18,
- Stage A warm passed 18/18,
- Stage B cold passed 18/18,
- Stage B warm passed,
- one BCrypt verification occurred per accepted logical login,
- locator queries remained bounded,
- audit/session deltas matched exactly,
- 9/9 identity parity checks remained intact, and
- 62/62 customer projection documents matched.

CRSTUR did not replay slot Stage A, Stage B, or the swap. The final closeout confirms production still runs the promoted deployment and the rollback slot still carries deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`.

Evidence roots:

- `.tmp/v2-8-63crstu/evidence/slot-candidate-four-stage-a-cold`
- `.tmp/v2-8-63crstu/evidence/slot-candidate-four-stage-a-warm`
- `.tmp/v2-8-63crstu/evidence/slot-candidate-four-stage-b-cold`
- `.tmp/v2-8-63crstu/evidence/slot-candidate-four-stage-b-warm`
- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane/api-state.json`
