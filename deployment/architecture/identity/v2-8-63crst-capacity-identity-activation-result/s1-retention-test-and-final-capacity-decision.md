# S1 retention test and final capacity decision

The controlled S1/two-worker retention test was not attempted. Its prerequisites require immutable production promotion, production dual-write acceptance, Admin deployment, full management activation, synthetic cleanup, and rollback readiness after all feature mutations. The slot acceptance gate stopped the task before those prerequisites.

The safety closeout retains S2 with exactly two workers. This is not a successful S1-versus-S2 retention decision; it preserves the owner-approved capacity while production remains healthy and the validation slot is stopped. Scaling down solely to complete a cost experiment after the hard gate would have added production risk and would not satisfy the required test sequence.

Final closeout capacity evidence after stopping the slot was:

- CPU average 14.33 percent, maximum observed 39 percent.
- Memory average 70.92 percent, maximum observed 76 percent.
- HTTP queue length zero.
- Production health and both approved role logins HTTP 200.

The monthly-capacity recommendation is to retain S2/two workers until an owner-approved fourth readiness candidate completes immutable production acceptance and management activation. The current approval's initial 72-hour window expires at 2026-07-18T19:54:40.8078855Z, so retaining S2 beyond that timestamp requires an explicit owner extension. After the prerequisites pass, run the one allowed controlled S1/two-worker retention test exactly once; retain S1 if it passes, or immediately return to S2 without repeating the test if it fails.
