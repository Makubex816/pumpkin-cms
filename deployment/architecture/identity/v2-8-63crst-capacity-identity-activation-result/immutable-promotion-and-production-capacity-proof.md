# Immutable promotion and production capacity proof

## Promotion decision

No slot swap or other production promotion was attempted. The final immutable artifact, SHA-256 `0eed05a93c21f1291a8d2d1e89c15ef7c7b00d6dca3d729f7987a17e9e7aae29`, could pass after a controlled readiness delay but could not guarantee that App Service would withhold traffic during its earlier first-data-path failure interval. Promotion would therefore have violated the complete-slot-acceptance gate.

The prior production deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86` remains active and available as the known-good rollback. Production identity foundation and dual-read remain enabled; dual-write and every management, migration, rename, and external-notification feature remain disabled.

## Production closeout proof

After the hard-gate decision:

- Both observed production workers returned health HTTP 200.
- SuperAdmin login returned HTTP 200 in 1,212 ms.
- TenantAdmin login returned HTTP 200 in 768 ms.
- Forms inbox returned HTTP 200 in 497 ms.
- Readback remained four tenant identities, five UserAccounts, five TenantMemberships, four TenantContactSettings, and 12 FormEntries, with no pending reconciliation or security mutation.
- Nine dual-read comparisons had zero mismatches across password, email, and membership parity.

The final six-minute S2/two-worker observation after the slot was stopped averaged 14.33 percent CPU with a 39 percent observed maximum, 70.92 percent memory with a 76 percent observed maximum, and zero HTTP queue.

Admin production, starter preview, Ice, Party Pros public and preview, and Vegas public and preview checks all returned HTTP 200. No lead-form submission was manufactured for closeout, and the existing Forms inbox and 12 FormEntries remained present.

## Work not authorized after the gate

Because promotion did not occur, production dual-write acceptance, production warm/cold/repetition/burst proof on the candidate, Admin deployment, management activation, synthetic proof, cleanup, and the S1 retention test were not started. Production remained healthy throughout the closeout, and the stopped slot preserves the candidate and rollback evidence without serving traffic.
